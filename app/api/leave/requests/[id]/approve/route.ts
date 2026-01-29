import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/db";
import { updateLeaveStatus } from "@/lib/leave/store";
import { LeaveStatus } from "@/lib/leave/types";
import { ApproveLeaveSchema } from "@/lib/leave/schema";

// export const runtime = "edge"; // Disabled to allow FS persistence Using Node.js runtime

// POST /api/leave/requests/[id]/approve
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        const user = session.user;

        // RBAC: Only Unit Manager or President
        if (!["PRESIDENT", "UNIT_MANAGER"].includes(user.role)) {
            return NextResponse.json({ ok: false, error: "Yetkisiz işlem" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = ApproveLeaveSchema.safeParse(body);

        const req = updateLeaveStatus(id, "approved", user.id);

        createAuditLog({
            actorId: user.id,
            action: "leave.approval.approve",
            module: "leave",
            entityType: "leave_request",
            entityId: id,
            unitId: user.unitId,
            ip,
            metadata: { note: parsed.data?.note }
        });

        return NextResponse.json({ ok: true, request: req });
    } catch (error) {
        console.error("Approve Leave Error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
