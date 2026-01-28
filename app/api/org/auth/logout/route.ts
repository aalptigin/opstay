// Auth API - Logout
import { NextRequest, NextResponse } from "next/server";
import { logout, getClientIp } from "@/lib/org/session";

export async function POST(request: NextRequest) {
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
        return NextResponse.json(
            { error: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
