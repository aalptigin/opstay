// Incidents API - List and Create
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { CreateIncidentSchema, IncidentFiltersSchema } from "@/lib/incidents/schema";
import {
    getIncidents,
    createIncident,
    getIncidentStats,
} from "@/lib/incidents/store";
import { createAuditLog } from "@/lib/org/db";

// GET /api/incidents - List incidents with filters
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        }

        // Parse filters from query params
        const { searchParams } = new URL(request.url);
        const filtersRaw = {
            unitId: searchParams.get("unitId") || undefined,
            type: searchParams.get("type") || undefined,
            status: searchParams.get("status") || undefined,
            severity: searchParams.get("severity") || undefined,
            vehicleId: searchParams.get("vehicleId") || undefined,
            q: searchParams.get("q") || undefined,
            from: searchParams.get("from") || undefined,
            to: searchParams.get("to") || undefined,
            slaBreached: searchParams.get("slaBreached") || undefined,
        };

        const filtersParsed = IncidentFiltersSchema.safeParse(filtersRaw);
        const filters = filtersParsed.success ? filtersParsed.data : {};

        // Apply role-based filtering
        if (session.user.role !== "PRESIDENT") {
            filters.unitId = session.user.unitId;
        }

        const items = getIncidents(filters);
        const stats = getIncidentStats(filters.unitId);

        return NextResponse.json({
            ok: true,
            items,
            total: items.length,
            stats,
        });
    } catch (error) {
        console.error("Incidents GET error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/incidents - Create new incident
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        }

        // RBAC check
        if (!hasPermission(session.user, "maintenance", "create")) {
            return NextResponse.json({ ok: false, error: "Yetki yok" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = CreateIncidentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, error: "Validasyon hatası", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const createdBy = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        };

        const incident = createIncident(parsed.data, createdBy, session.user.unitId || "unit_1");

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: "CREATE",
            module: "maintenance",
            entityType: "incident",
            entityId: incident.id,
            ip,
            metadata: {
                refNo: incident.refNo,
                type: incident.type,
                severity: incident.severity,
            },
        });

        console.log("📋 [Incidents] Created:", incident.refNo);

        return NextResponse.json({ ok: true, item: incident }, { status: 201 });
    } catch (error) {
        console.error("Incidents POST error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
