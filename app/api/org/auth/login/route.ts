// Auth API - Login
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserById } from "@/lib/org/db";
import { login, getClientIp } from "@/lib/org/session";

export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email ve şifre gerekli" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = getUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: "Geçersiz email veya şifre" },
                { status: 401 }
            );
        }

        // Check password (simple comparison for dev - use bcrypt in production)
        if (user.passwordHash !== password) {
            return NextResponse.json(
                { error: "Geçersiz email veya şifre" },
                { status: 401 }
            );
        }

        // Get client IP
        const ip = getClientIp(request.headers);
        const userAgent = request.headers.get("user-agent") || undefined;

        // Create session
        const result = login(user.id, ip, userAgent);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 403 }
            );
        }

        // Set cookie with token
        const response = NextResponse.json({
            success: true,
            user: result.user,
        });

        console.log("🍪 [API] Setting cookie 'org_session' with token:", result.token!.substring(0, 20) + "...");
        response.cookies.set("org_session", result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
