// Audit Module Types

// Enums & Constants
export const AUDIT_RESULTS = ["SUCCESS", "FAIL", "DENIED"] as const;
export type AuditResult = typeof AUDIT_RESULTS[number];

export const AUDIT_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type AuditSeverity = typeof AUDIT_SEVERITIES[number];

export const ENTITY_TYPES = [
    "auth",
    "vehicle",
    "inventory_item",
    "inventory_txn",
    "maintenance",
    "meal_plan",
    "meal_delivery",
    "leave",
    "training",
    "request",
    "reservation",
    "record",
    "system"
] as const;
export type EntityType = typeof ENTITY_TYPES[number] | string;

// UI Labels
export const RESULT_LABELS: Record<AuditResult, string> = {
    SUCCESS: "Başarılı",
    FAIL: "Başarısız",
    DENIED: "Engellendi",
};

export const SEVERITY_LABELS: Record<AuditSeverity, string> = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
    CRITICAL: "Kritik",
};

export const SEVERITY_COLORS: Record<AuditSeverity, string> = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-amber-100 text-amber-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
};

export const RESULT_COLORS: Record<AuditResult, string> = {
    SUCCESS: "bg-green-100 text-green-700",
    FAIL: "bg-red-100 text-red-700",
    DENIED: "bg-gray-800 text-white",
};

// Advanced Filter
export interface AuditFilterParams {
    q?: string; // Search query
    unitId?: string; // Strict unit filter
    role?: string;
    actionPrefix?: string; // e.g. "inventory."
    result?: AuditResult;
    severity?: AuditSeverity;
    entityType?: string;
    entityId?: string;
    ip?: string;
    correlationId?: string;
    fromDate?: string; // ISO
    toDate?: string; // ISO
    page?: number;
    pageSize?: number;
    sortBy?: "createdAt";
    sortDir?: "asc" | "desc";
    myActionsOnly?: boolean; // Toggle
    currentUserId?: string;
}

// Response
export interface AuditListResponse {
    items: import("@/lib/org/types").AuditLog[];
    page: number;
    pageSize: number;
    total: number;
    aggregates: {
        total: number;
        critical: number;
        fail: number;
        suspicious: number;
    };
}
