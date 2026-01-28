import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/db";
import { updateLeaveStatus } from "@/lib/leave/store";
import { LeaveStatus } from "@/lib/leave/types";
import { RejectLeaveSchema } from "@/lib/leave/schema";

// POST /api/leave/requests/[id]/reject
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

        // RBAC
        if (!["PRESIDENT", "UNIT_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ ok: false, error: "Yetkisiz işlem" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = RejectLeaveSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: "Geçersiz veri", details: parsed.error.issues }, { status: 400 });

        const req = updateLeaveStatus(id, LeaveStatus.REJECTED, { id: session.user.id, name: session.user.name }, parsed.data.reason);

        createAuditLog({
            actorId: session.user.id,
            action: "leave.approval.reject",
            module: "leave",
            entityType: "leave_request",
            entityId: id,
            unitId: session.user.unitId,
            ip,
            metadata: { reason: parsed.data.reason }
        });

        return NextResponse.json({ ok: true, request: req });
    } catch (error) {
        console.error("Reject Leave Error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
