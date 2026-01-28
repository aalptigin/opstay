// Audit Validation Schemas
import { z } from "zod";
import { AUDIT_RESULTS, AUDIT_SEVERITIES } from "./types";

// Filter Schema
export const AuditFilterSchema = z.object({
    q: z.string().optional(),
    unitId: z.string().optional(),
    role: z.string().optional(),
    actionPrefix: z.string().optional(),
    result: z.enum(AUDIT_RESULTS).optional(),
    severity: z.enum(AUDIT_SEVERITIES).optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    ip: z.string().optional(),
    correlationId: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    page: z.number().min(1).optional().default(1),
    pageSize: z.number().min(5).max(100).optional().default(25),
    sortBy: z.enum(["createdAt"]).optional().default("createdAt"),
    sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
    myActionsOnly: z.boolean().optional(),
});

// Export Schema
export const AuditExportSchema = AuditFilterSchema.extend({
    format: z.enum(["csv", "json"]).default("csv"),
});

export type AuditFilterInput = z.infer<typeof AuditFilterSchema>;
export type AuditExportInput = z.infer<typeof AuditExportSchema>;
