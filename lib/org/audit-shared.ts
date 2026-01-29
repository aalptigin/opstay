// Client-safe audit helpers (No DB imports)
import { AuditLog, User } from "./types";

export type AuditAction = string;

export interface AuditParams {
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
    if (action.includes("audit.export")) return "Dışa Aktarma";

    // Fallback
    return action;
}
