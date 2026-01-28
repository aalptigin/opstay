// Incident Comments API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { CreateCommentSchema } from "@/lib/incidents/schema";
import { getIncidentById, createComment } from "@/lib/incidents/store";
import { createAuditLog } from "@/lib/org/db";

// POST /api/incidents/[id]/comments - Add comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        }

        const incident = getIncidentById(id);
        if (!incident) {
            return NextResponse.json({ ok: false, error: "Kayıt bulunamadı" }, { status: 404 });
        }

        // Role-based access check
        if (session.user.role !== "PRESIDENT" && incident.unitId !== session.user.unitId) {
            return NextResponse.json({ ok: false, error: "Bu kayda erişim yetkiniz yok" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = CreateCommentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, error: "Yorum boş olamaz" },
                { status: 400 }
            );
        }

        const comment = createComment(
            id,
            parsed.data.body,
            { id: session.user.id, name: session.user.name },
            "COMMENT"
        );

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: "CREATE",
            module: "maintenance",
            entityType: "comment",
            entityId: comment.id,
            ip,
            metadata: { incidentId: id },
        });

        return NextResponse.json({ ok: true, comment }, { status: 201 });
    } catch (error) {
        console.error("Comment POST error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
