import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/db";
import { CreateLeaveRequestSchema } from "@/lib/leave/schema";
import { createLeaveRequest } from "@/lib/leave/store";

export const runtime = "edge";

// POST /api/leave/requests
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        const user = session.user;

        const body = await request.json();
        const parsed = CreateLeaveRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "Girdi hatası", details: parsed.error.issues }, { status: 400 });
        }

        // Determine personId
        let personId = user.id;
        let personName = user.name;

        // Allow admin to create for others
        if (parsed.data.personId && user.role !== "STAFF") {
            personId = parsed.data.personId;
            personName = "Personel " + personId; // Should fetch name ideally
        }

        const req = createLeaveRequest({
            ...parsed.data,
            personId,
            personName,
            unitId: user.unitId, // Or target user's unit
            unitName: "Birim",
            createdByUserId: user.id
        });

        // Audit
        createAuditLog({
            actorId: user.id,
            action: "leave.request.create",
            module: "leave",
            entityType: "leave_request",
            entityId: req.id,
            unitId: user.unitId,
            ip,
            metadata: { type: req.type, days: req.totalDays }
        });

        return NextResponse.json({ ok: true, request: req });
    } catch (error) {
        console.error("Create Leave Error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
