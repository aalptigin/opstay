// Session management with IP lock and single active session enforcement

import { Session, User } from "./types";
import { getSessionByToken, getActiveSessionByUserId, createSession, revokeSession, revokeUserSessions, updateSessionLastSeen, getUserById } from "./db";
import { createAuditLog } from "./db";

// Simple hash function for tokens (in production use crypto)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36) + Date.now().toString(36);
}

export function generateToken(): string {
    return simpleHash(Math.random().toString() + Date.now().toString());
}

export interface LoginResult {
    success: boolean;
    token?: string;
    user?: Omit<User, "passwordHash">;
    error?: string;
}

export interface SessionVerifyResult {
    valid: boolean;
    user?: Omit<User, "passwordHash">;
    error?: string;
}

/**
 * Create a new session for a user
 * Enforces single active session rule
 */
export function login(userId: string, ip: string, userAgent?: string): LoginResult {
    const user = getUserById(userId);
    if (!user) {
        return { success: false, error: "Kullanıcı bulunamadı" };
    }

    if (user.status !== "active") {
        return { success: false, error: "Hesap aktif değil" };
    }

    // Check for existing active session
    const existingSession = getActiveSessionByUserId(userId);
    if (existingSession) {
        // Check if same IP
        if (existingSession.ip === ip) {
            // Same IP, revoke old and create new
            revokeSession(existingSession.tokenHash);
        } else {
            // Different IP - BLOCK
            return {
                success: false,
                error: "Başka bir cihaz/IP adresinde aktif oturum var. Önce o oturumu kapatın."
            };
        }
    }

    // Create new session
    const token = generateToken();
    createSession({
        userId,
        tokenHash: token,
        ip,
        userAgent,
    });

    // Audit log
    createAuditLog({
        actorId: userId,
        action: "LOGIN",
        module: "auth",
        entityType: "session",
        ip,
        metadata: { userAgent },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { success: true, token, user: safeUser };
}

/**
 * Verify session token and IP
 */
export function verifySession(token: string, requestIp: string): SessionVerifyResult {
    console.log("🔍 [Session] Verifying token:", token.substring(0, 20) + "...");
    console.log("🔍 [Session] Request IP:", requestIp);

    const session = getSessionByToken(token);

    if (!session) {
        console.log("❌ [Session] Session not found for token");
        return { valid: false, error: "Geçersiz oturum" };
    }

    console.log("✅ [Session] Session found:", {
        id: session.id,
        userId: session.userId,
        ip: session.ip,
        createdAt: session.createdAt,
        revokedAt: session.revokedAt
    });

    if (session.revokedAt) {
        console.log("❌ [Session] Session revoked");
        return { valid: false, error: "Oturum sonlandırılmış" };
    }

    // IP Lock check
    if (session.ip !== requestIp) {
        console.log("❌ [Session] IP MISMATCH!", {
            sessionIp: session.ip,
            requestIp: requestIp
        });
        return { valid: false, error: "IP adresi uyuşmuyor. Güvenlik nedeniyle oturum reddedildi." };
    }

    console.log("✅ [Session] IP matched");

    // Update last seen
    updateSessionLastSeen(token);

    const user = getUserById(session.userId);
    if (!user) {
        console.log("❌ [Session] User not found:", session.userId);
        return { valid: false, error: "Kullanıcı bulunamadı" };
    }

    console.log("✅ [Session] User found:", user.name);

    const { passwordHash: _, ...safeUser } = user;
    return { valid: true, user: safeUser };
}

/**
 * Logout - revoke session
 */
export function logout(token: string, ip: string): void {
    const session = getSessionByToken(token);
    if (session) {
        createAuditLog({
            actorId: session.userId,
            action: "LOGOUT",
            module: "auth",
            entityType: "session",
            ip,
        });
        revokeSession(token);
    }
}

/**
 * Force logout all sessions for a user
 */
export function forceLogoutUser(userId: string, actorId: string, ip: string): void {
    createAuditLog({
        actorId,
        action: "LOGOUT",
        module: "auth",
        entityType: "user",
        entityId: userId,
        ip,
        metadata: { forced: true },
    });
    revokeUserSessions(userId);
}

/**
 * Get client IP from headers
 */
export function getClientIp(headers: Headers): string {
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "127.0.0.1"
    );
}
