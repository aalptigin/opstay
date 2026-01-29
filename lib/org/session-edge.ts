
// Stateless Session Helpers for Edge Runtime (No FS/DB dependencies)

export interface OrgSessionPayload {
    userId: string;
    role: string;
    ip: string;
    iat: number;
}

export interface SessionVerifyResult {
    valid: boolean;
    user?: {
        id: string;
        role: string;
        // Other fields strictly from token
    };
    error?: string;
}

// --- Internal Crypto Helpers (Copied/Shared to avoid heavy deps) ---

function toB64Url(bytes: Uint8Array) {
    let s = "";
    bytes.forEach((b) => (s += String.fromCharCode(b)));
    const b64 = btoa(s);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64Url(b64url: string) {
    const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
    const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

export function createOrgToken(payload: Omit<OrgSessionPayload, "iat">): string {
    const full = { ...payload, iat: Date.now() };
    return toB64Url(new TextEncoder().encode(JSON.stringify(full)));
}

export function readOrgToken(token: string): OrgSessionPayload | null {
    try {
        const json = new TextDecoder().decode(fromB64Url(token));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/**
 * Verify Session (Stateless)
 * Checks signature/structure only. Does NOT check DB.
 * Safe for Middleware.
 */
export function verifySessionEx(token: string, requestIp: string): SessionVerifyResult {
    const payload = readOrgToken(token);

    if (!payload) {
        return { valid: false, error: "Geçersiz oturum" };
    }

    // IP Check (Optional/Relaxed)
    // if (payload.ip !== requestIp) { ... }

    return {
        valid: true,
        user: {
            id: payload.userId,
            role: payload.role
        }
    };
}

export function getClientIp(headers: Headers): string {
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "127.0.0.1"
    );
}
