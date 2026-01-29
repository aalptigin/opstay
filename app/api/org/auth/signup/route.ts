// Auth API - Signup (User Registration)
import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/org/db";
import { login, getClientIp } from "@/lib/org/session";

export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, role, unitId } = body;

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, şifre ve isim gerekli" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: "Bu email adresi zaten kayıtlı" },
                { status: 409 }
            );
        }

        // Validate role
        const validRoles = ["PRESIDENT", "UNIT_MANAGER", "STAFF"];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json(
                { error: "Geçersiz rol" },
                { status: 400 }
            );
        }

        // Create user
        const newUser = createUser({
            email,
            name,
            passwordHash: password, // In production: use bcrypt.hash(password, 10)
            role: role || "STAFF", // Default to STAFF
            unitId,
            status: "active",
        });

        console.log("✅ [Signup] Created new user:", newUser.name, newUser.email);

        // Automatically log in the new user
        const ip = getClientIp(request.headers);
        const userAgent = request.headers.get("user-agent") || undefined;
        const loginResult = login(newUser.id, ip, userAgent);

        if (!loginResult.success) {
            return NextResponse.json(
                { error: loginResult.error },
                { status: 500 }
            );
        }

        // Set cookie
        const response = NextResponse.json({
            success: true,
            user: loginResult.user,
        });

        console.log("🍪 [Signup] Setting cookie 'org_session'");
        response.cookies.set("org_session", loginResult.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
