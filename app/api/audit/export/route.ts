// Audit Export API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/db";
import { AuditExportSchema } from "@/lib/audit/schema";
import { getAuditLogsQuery } from "@/lib/audit/service";

export const runtime = "edge"; // Disabled to allow FS persistence

// POST /api/audit/export
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        // Check permission (Staff excluded default?)
        if (session.user.role === "STAFF") {
            return NextResponse.json({ ok: false, error: "Export yetkiniz yok" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = AuditExportSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid filters" }, { status: 400 });

        const filters = parsed.data;
        // Enforce RBAC
        if (session.user.role === "UNIT_MANAGER") filters.unitId = session.user.unitId || "NONE";

        // Fetch ALL matching logs (override pagination for export)
        filters.page = 1;
        filters.pageSize = 10000; // Limit for safety

        const { items } = await getAuditLogsQuery(filters);

        // Generate Content
        let content = "";
        let contentType = "text/csv";
        let filename = `audit-export-${new Date().toISOString().split("T")[0]}`;

        if (filters.format === "json") {
            content = JSON.stringify(items, null, 2);
            contentType = "application/json";
            filename += ".json";
        } else {
            // CSV
            const headers = ["ID", "Time", "Actor", "Action", "Module", "Entity", "EntityID", "Result", "Severity", "IP"];
            const rows = items.map(l => [
                l.id,
                l.createdAt,
                l.actorId,
                l.action,
                l.module,
                l.entityType,
                l.entityId || "",
                l.result || "",
                l.severity || "",
                l.ip
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

            content = [headers.join(","), ...rows].join("\n");
            filename += ".csv";
        }

        // Log the export action itself!
        createAuditLog({
            actorId: session.user.id,
            action: "audit.export",
            module: "audit",
            entityType: "file",
            entityId: filename,
            unitId: session.user.unitId,
            ip,
            metadata: { format: filters.format, count: items.length, filters }
        });

        // Return direct response
        return new NextResponse(content, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json({ ok: false, error: "Export failed" }, { status: 500 });
    }
}
