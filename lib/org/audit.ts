// Audit log helper (Server Side Only)

import { createAuditLog as dbCreateAuditLog, getAuditLogs as dbGetAuditLogs } from "./db";
import { AuditParams, AuditLog } from "./audit-shared";

export * from "./audit-shared";

/**
 * Write an audit log entry
 */
export function audit(params: AuditParams): AuditLog {
    return dbCreateAuditLog({
        actorId: params.actor.id,
        action: params.action,
        module: params.module,
        entityType: params.entityType,
        entityId: params.entityId,
        unitId: params.actor.unitId,
        ip: params.ip,
        userAgent: params.userAgent,
        result: params.result || "SUCCESS",
        severity: params.severity || "LOW",
        correlationId: params.correlationId,
        metadata: params.metadata,
        diff: params.diff,
    });
}

/**
 * Get audit logs with filters
 */
export function getAuditLogs(filters?: {
    module?: string;
    actorId?: string;
    unitId?: string;
    action?: string;
    result?: "SUCCESS" | "FAIL" | "DENIED";
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
}): AuditLog[] {
    let logs = dbGetAuditLogs();

    if (filters?.module) logs = logs.filter((l) => l.module === filters.module);
    if (filters?.actorId) logs = logs.filter((l) => l.actorId === filters.actorId);
    if (filters?.unitId) logs = logs.filter((l) => l.unitId === filters.unitId);
    if (filters?.action) logs = logs.filter((l) => l.action === filters.action); // Exact match
    if (filters?.result) logs = logs.filter((l) => l.result === filters.result);
    if (filters?.severity) logs = logs.filter((l) => l.severity === filters.severity);
    if (filters?.entityType) logs = logs.filter((l) => l.entityType === filters.entityType);
    if (filters?.entityId) logs = logs.filter((l) => l.entityId === filters.entityId);
    if (filters?.startDate) logs = logs.filter((l) => l.createdAt >= filters.startDate!);
    if (filters?.endDate) logs = logs.filter((l) => l.createdAt <= filters.endDate!);

    return logs;
}
