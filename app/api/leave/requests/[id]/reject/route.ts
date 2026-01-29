import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/db";
import { updateLeaveStatus } from "@/lib/leave/store";
import { LeaveStatus } from "@/lib/leave/types";
import { RejectLeaveSchema } from "@/lib/leave/schema";

// export const runtime = "edge"; // Disabled to allow FS persistence Using Node.js runtime

// POST /api/leave/requests/[id]/reject
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        const user = session.user;

        // RBAC
        if (!["PRESIDENT", "UNIT_MANAGER"].includes(user.role)) {
            return NextResponse.json({ ok: false, error: "Yetkisiz işlem" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = RejectLeaveSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: "Geçersiz veri", details: parsed.error.issues }, { status: 400 });

        const req = updateLeaveStatus(id, LeaveStatus.REJECTED, { id: user.id, name: user.name }, parsed.data.reason);

        createAuditLog({
            actorId: user.id,
            action: "leave.approval.reject",
            module: "leave",
            entityType: "leave_request",
            entityId: id,
            unitId: user.unitId,
            ip,
            metadata: { reason: parsed.data.reason }
        });

        return NextResponse.json({ ok: true, request: req });
    } catch (error) {
        console.error("Reject Leave Error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
