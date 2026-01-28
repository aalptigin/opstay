// Incident Detail API - Get, Update single incident
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { UpdateIncidentSchema } from "@/lib/incidents/schema";
import {
    getIncidentById,
    updateIncident,
    getWorkOrdersByIncident,
    getCommentsByIncident,
    createComment,
    getUserById,
} from "@/lib/incidents/store";
import { createAuditLog } from "@/lib/org/db";

export const runtime = "edge";

// GET /api/incidents/[id] - Get incident detail with work orders and comments
export async function GET(
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

        const workOrders = getWorkOrdersByIncident(id);
        const comments = getCommentsByIncident(id);

        return NextResponse.json({
            ok: true,
            item: incident,
            workOrders,
            comments,
        });
    } catch (error) {
        console.error("Incident GET error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

// PUT /api/incidents/[id] - Update incident
export async function PUT(
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

        // RBAC for update
        if (!hasPermission(session.user, "maintenance", "update")) {
            return NextResponse.json({ ok: false, error: "Güncelleme yetkiniz yok" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = UpdateIncidentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, error: "Validasyon hatası", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { assignedToId, ...updateData } = parsed.data;
        const updates: Record<string, unknown> = { ...updateData };

        // Handle assignment
        if (assignedToId !== undefined) {
            if (assignedToId === null) {
                updates.assignedTo = null;
            } else {
                const user = getUserById(assignedToId);
                if (user) {
                    updates.assignedTo = user;

                    // Add assignment comment
                    createComment(
                        id,
                        `${user.name} atandı`,
                        { id: session.user.id, name: session.user.name },
                        "ASSIGNMENT"
                    );
                }
            }
        }

        // Handle status change
        if (parsed.data.status && parsed.data.status !== incident.status) {
            const statusLabels: Record<string, string> = {
                OPEN: "Açık",
                IN_PROGRESS: "Devam Ediyor",
                RESOLVED: "Çözüldü",
            };

            createComment(
                id,
                `Durum '${statusLabels[parsed.data.status]}' olarak güncellendi`,
                { id: session.user.id, name: session.user.name },
                "STATUS_CHANGE"
            );
        }

        const updated = updateIncident(id, updates as Partial<typeof incident>);

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: "UPDATE",
            module: "maintenance",
            entityType: "incident",
            entityId: id,
            ip,
            metadata: { updates: Object.keys(parsed.data) },
        });

        console.log("📋 [Incidents] Updated:", incident.refNo);

        return NextResponse.json({ ok: true, item: updated });
    } catch (error) {
        console.error("Incident PUT error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
