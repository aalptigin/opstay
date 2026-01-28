// Audit Service - Advanced Query Layer
import { AuditLog } from "@/lib/org/types";
import { getAuditLogs as dbGetAuditLogs } from "@/lib/org/db";
import { AuditFilterParams, AuditListResponse } from "./types";

/**
 * Advanced query function for audit logs with search, filter, pagination
 */
export async function getAuditLogsQuery(params: AuditFilterParams): Promise<AuditListResponse> {
    // 1. Get raw logs from DB (in-memory mock)
    // In a real DB, we would build a SQL/Prisma query here.
    let logs = dbGetAuditLogs();

    // 2. Apply Filters

    // Unit (Strict)
    if (params.unitId) {
        logs = logs.filter(l => l.unitId === params.unitId);
    }

    // Role (Strict?) - Usually handled by caller passing filtered query, but here we can filter by actor role if we had it joined.
    // The current AuditLog doesn't store actorRole directly, only actorId. 
    // We assume the caller (API) has already enforced RBAC by setting params.unitId if needed.

    // Date Range
    if (params.fromDate) {
        const from = new Date(params.fromDate).getTime();
        logs = logs.filter(l => new Date(l.createdAt).getTime() >= from);
    }
    if (params.toDate) {
        const to = new Date(params.toDate).getTime();
        logs = logs.filter(l => new Date(l.createdAt).getTime() <= to);
    }

    // Result & Severity
    if (params.result) logs = logs.filter(l => l.result === params.result);
    if (params.severity) logs = logs.filter(l => l.severity === params.severity);

    // Entity
    if (params.entityType) logs = logs.filter(l => l.entityType === params.entityType);
    if (params.entityId) logs = logs.filter(l => l.entityId === params.entityId);

    // IP & Correlation
    if (params.ip) logs = logs.filter(l => l.ip?.includes(params.ip!));
    if (params.correlationId) logs = logs.filter(l => l.correlationId === params.correlationId);

    // My Actions Only
    if (params.myActionsOnly && params.currentUserId) {
        logs = logs.filter(l => l.actorId === params.currentUserId);
    }

    // Free Search (q)
    if (params.q) {
        const q = params.q.toLowerCase();
        logs = logs.filter(l =>
            l.action.toLowerCase().includes(q) ||
            l.actorId.toLowerCase().includes(q) ||
            l.ip?.includes(q) ||
            l.entityType.toLowerCase().includes(q) ||
            l.entityId?.toLowerCase().includes(q) ||
            JSON.stringify(l.metadata).toLowerCase().includes(q)
        );
    }

    // Action Prefix
    if (params.actionPrefix) {
        logs = logs.filter(l => l.action.startsWith(params.actionPrefix!));
    }

    // 3. Aggregates (calculated on filtered set)
    const aggregates = {
        total: logs.length,
        critical: logs.filter(l => l.severity === "CRITICAL" || l.severity === "HIGH").length,
        fail: logs.filter(l => l.result === "FAIL" || l.result === "DENIED").length,
        suspicious: logs.filter(l => l.metadata?.tags && Array.isArray(l.metadata.tags) && l.metadata.tags.includes("suspicious")).length
            // Fallback suspicious logic if tags not preset
            || logs.filter(l => l.result === "DENIED" || (l.severity === "CRITICAL" && l.action.includes("auth"))).length,
    };

    // 4. Sorting
    const sortDir = params.sortDir || "desc";
    logs.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortDir === "asc" ? timeA - timeB : timeB - timeA;
    });

    // 5. Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = logs.slice(startIndex, startIndex + pageSize);

    // 6. Return
    return {
        items: paginatedItems,
        page,
        pageSize,
        total: logs.length,
        aggregates,
    };
}

/**
 * Get single log with details (mock hydration if needed)
 */
export async function getAuditLogDetail(id: string): Promise<AuditLog | null> {
    const logs = dbGetAuditLogs();
    const log = logs.find(l => l.id === id);
    return log || null;
}

/**
 * Get Unique Actions for Filter
 */
export async function getAuditActions(): Promise<string[]> {
    const logs = dbGetAuditLogs();
    const actions = new Set(logs.map(l => l.action));
    return Array.from(actions).sort();
}
