// Consolidated Auth API Route
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/org/db";
import { login, logout, getClientIp, verifySession } from "@/lib/org/session";

export const runtime = "edge";

// --- Handlers ---

async function handleLogin(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email ve şifre gerekli" }, { status: 400 });
        }

        const user = getUserByEmail(email);
        if (!user || user.passwordHash !== password) {
            return NextResponse.json({ error: "Geçersiz email veya şifre" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const userAgent = request.headers.get("user-agent") || undefined;
        const result = login(user.id, ip, userAgent);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 403 });
        }

        const response = NextResponse.json({ success: true, user: result.user });
        response.cookies.set("org_session", result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

async function handleLogout(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (token) {
            const ip = getClientIp(request.headers);
            logout(token, ip);
        }
        const response = NextResponse.json({ success: true });
        response.cookies.delete("org_session");
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

async function handleSignup(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, role, unitId } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Email, şifre ve isim gerekli" }, { status: 400 });
        }

        if (getUserByEmail(email)) {
            return NextResponse.json({ error: "Bu email adresi zaten kayıtlı" }, { status: 409 });
        }

        const validRoles = ["PRESIDENT", "UNIT_MANAGER", "STAFF"];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
        }

        const newUser = createUser({
            email,
            name,
            passwordHash: password,
            role: role || "STAFF",
            unitId,
            status: "active",
        });

        const ip = getClientIp(request.headers);
        const userAgent = request.headers.get("user-agent") || undefined;
        const loginResult = login(newUser.id, ip, userAgent);

        if (!loginResult.success) {
            return NextResponse.json({ error: loginResult.error }, { status: 500 });
        }

        const response = NextResponse.json({ success: true, user: loginResult.user });
        response.cookies.set("org_session", loginResult.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        return response;
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

async function handleMe(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });

        const ip = getClientIp(request.headers);
        const result = verifySession(token, ip);

        if (!result.valid) {
            const response = NextResponse.json({ error: result.error }, { status: 401 });
            response.cookies.delete("org_session");
            return response;
        }

        return NextResponse.json({ success: true, user: result.user });
    } catch (error) {
        console.error("Get me error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// --- Dispatcher ---

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
    const { action } = await params;
    const route = action[0];

    if (route === "login") return handleLogin(req);
    if (route === "logout") return handleLogout(req);
    if (route === "signup") return handleSignup(req);

    return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
    const { action } = await params;
    const route = action[0];

    if (route === "me") return handleMe(req);

    return NextResponse.json({ error: "Not found" }, { status: 404 });
}
