import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getAuditLogsFiltered } from "@/lib/org/audit"; // Use filtered version

export const runtime = "edge";

// GET /api/org/audit - Get audit logs with optional filters
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ error: session.error }, { status: 401 });
        }

        const user = session.user;

        // Only PRESIDENT can view audit logs
        if (user.role !== "PRESIDENT") {
            return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const module = searchParams.get("module") || undefined;
        const actorId = searchParams.get("actorId") || undefined;
        const entityType = searchParams.get("entityType") || undefined;
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;

        // FIXED: Use getAuditLogsFiltered with filter object
        const logs = getAuditLogsFiltered({
            module,
            actorId,
            entityType,
            startDate,
            endDate,
            unitId: user.unitId // Filter by user's unit if applicable
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Audit logs error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}