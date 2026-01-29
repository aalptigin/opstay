// Auth API - Get current user
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Oturum bulunamadı" },
                { status: 401 }
            );
        }

        const ip = getClientIp(request.headers);
        const result = verifySession(token, ip);

        if (!result.valid) {
            const response = NextResponse.json(
                { error: result.error },
                { status: 401 }
            );
            response.cookies.delete("org_session");
            return response;
        }

        return NextResponse.json({
            success: true,
            user: result.user,
        });
    } catch (error) {
        console.error("Get me error:", error);
        return NextResponse.json(
            { error: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
