// Audit log helper

import { AuditLog, User } from "./types";
import { createAuditLog as dbCreateAuditLog, getAuditLogs as dbGetAuditLogs } from "./db";

export type AuditAction = string;

interface AuditParams {
    actor: Pick<User, "id" | "unitId">;
    action: string;
    module: string;
    entityType: string;
    entityId?: string;
    ip: string;
    userAgent?: string;
    result?: "SUCCESS" | "FAIL" | "DENIED";
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    correlationId?: string;
    metadata?: Record<string, unknown>;
    diff?: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        changedKeys?: string[];
    };
}

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

/**
 * Get action label in Turkish
 */
export function getActionLabel(action: string): string {
    // Common actions
    if (action.includes("create") || action === "CREATE") return "Oluşturma";
    if (action.includes("update") || action === "UPDATE") return "Güncelleme";
    if (action.includes("delete") || action === "DELETE") return "Silme";
    if (action.includes("approve") || action === "APPROVE") return "Onaylama";
    if (action.includes("reject") || action === "REJECT") return "Reddetme";
    if (action.includes("login") || action === "LOGIN") return "Giriş";
    if (action.includes("logout") || action === "LOGOUT") return "Çıkış";

    // Fallback
    return action;
}
