// lib/org/audit.ts
// Audit logging utilities

import { createAuditLog as dbCreateAuditLog, getAuditLogs as dbGetAuditLogs } from "./db";
import { AuditLog } from "./types"; // Import from types instead of audit-shared
import type { AuditParams } from "./audit-shared";

export * from "./audit-shared";

/**
 * Create an audit log entry
 */
export function createAuditLog(params: AuditParams): AuditLog {
    // Adapter if Params structure differs slightly from DB expectation
    // dbCreateAuditLog expects: actorId, action, module, etc.
    // AuditParams has: actorId, action... matching db.ts interface mostly.

    // Check if params has 'actor' object (from shared) or 'actorId' string shortcut
    // shared.ts AuditParams definition has: actor: Pick<User...>, OR in valid usage might have passed flat params?
    // User's pasted shared.ts had: actorId: string.
    // Wait, the shared.ts I just wroted has `actorId: string` based on user input.
    // The OLD shared.ts had `actor: Pick...`.
    // I overwrote shared.ts with user input which has `actorId: string`. 
    // So simple pass-through is fine.

    return dbCreateAuditLog({
        actorId: params.actorId,
        action: params.action,
        module: params.module,
        entityType: params.entityType,
        entityId: params.entityId,
        unitId: params.unitId,
        ip: params.ip || "127.0.0.1",
        metadata: params.metadata,
        // dbCreateAuditLog might support other fields, but these are core.
    });
}

// ALIAS for backward compatibility
export const audit = createAuditLog;

/**
 * Get all audit logs
 */
export function getAuditLogs(): AuditLog[] {
    return dbGetAuditLogs();
}

/**
 * Get audit logs filtered by criteria
 */
export function getAuditLogsFiltered(filters: {
    actorId?: string;
    module?: string;
    entityType?: string;
    unitId?: string;
    startDate?: string;
    endDate?: string;
}): AuditLog[] {
    let logs = dbGetAuditLogs();

    if (filters.actorId) {
        logs = logs.filter(log => log.actorId === filters.actorId);
    }

    if (filters.module) {
        logs = logs.filter(log => log.module === filters.module);
    }

    if (filters.entityType) {
        logs = logs.filter(log => log.entityType === filters.entityType);
    }

    if (filters.unitId) {
        logs = logs.filter(log => log.unitId === filters.unitId);
    }

    if (filters.startDate) {
        logs = logs.filter(log => log.createdAt >= filters.startDate!);
    }

    if (filters.endDate) {
        logs = logs.filter(log => log.createdAt <= filters.endDate!);
    }

    return logs;
}

/**
 * Get recent audit logs (last N entries)
 */
export function getRecentAuditLogs(limit: number = 50): AuditLog[] {
    const logs = dbGetAuditLogs();
    return logs.slice(0, limit);
}
