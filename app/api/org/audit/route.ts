// Audit API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getAuditLogs } from "@/lib/org/audit";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ error: session.error }, { status: 401 });
        }

        // Only PRESIDENT can view audit logs
        if (session.user.role !== "PRESIDENT") {
            return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const module = searchParams.get("module") || undefined;
        const actorId = searchParams.get("actorId") || undefined;

        const logs = getAuditLogs({ module, actorId });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Get audit logs error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
