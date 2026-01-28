// Audit List API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { AuditFilterSchema } from "@/lib/audit/schema";
import { getAuditLogsQuery } from "@/lib/audit/service";
import { hasPermission } from "@/lib/org/rbac";

// GET /api/audit/logs
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

        // Parse query params
        const url = new URL(request.url);
        const params: Record<string, string | number | boolean> = {};

        url.searchParams.forEach((val, key) => {
            if (key === "page" || key === "pageSize") {
                params[key] = parseInt(val, 10);
            } else if (key === "myActionsOnly") {
                params[key] = val === "true";
            } else {
                params[key] = val;
            }
        });

        const parsed = AuditFilterSchema.safeParse(params);
        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "Geçersiz parametreler" }, { status: 400 });
        }

        const filters = parsed.data;

        // RBAC Enforcement
        if (session.user.role === "PRESIDENT") {
            // Can see all. No restriction unless specified in filters
        } else if (session.user.role === "UNIT_MANAGER") {
            // Force unitId
            filters.unitId = session.user.unitId || "NONE";
        } else {
            // Staff defaults to own unit or own actions? 
            // Prompt says: "İzinli: sadece kendi birimi loglarını görebilir but masked"
            filters.unitId = session.user.unitId || "NONE";
            // Additionally we might restrict view, but service handles fetching. 
            // Masking is handled in response transformation.
        }

        const queryFilters = {
            ...filters,
            currentUserId: session.user.id
        };

        const result = await getAuditLogsQuery(queryFilters);

        // Masking for STAFF
        if (session.user.role === "STAFF") {
            result.items = result.items.map(item => ({
                ...item,
                ip: "***",
                userAgent: "***",
                metadata: item.metadata ? { ...item.metadata, sensitive: "***" } : undefined,
                diff: undefined, // Hide diffs for staff?
            }));
        }

        return NextResponse.json({ ok: true, ...result });

    } catch (error) {
        console.error("Audit Logs API Error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
