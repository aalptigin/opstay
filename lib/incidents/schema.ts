// Incident/Maintenance Zod Schemas
import { z } from "zod";

// Enums
export const IncidentTypeSchema = z.enum(["INCIDENT", "MAINTENANCE"]);
export const IncidentStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]);
export const IncidentSeveritySchema = z.enum(["LOW", "MED", "HIGH"]);
export const WorkOrderStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "DONE"]);
export const CommentKindSchema = z.enum(["COMMENT", "STATUS_CHANGE", "ASSIGNMENT", "WORKORDER"]);
export const ApprovalStatusSchema = z.enum(["NONE", "PENDING", "APPROVED", "REJECTED"]);

// User reference
export const UserRefSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email().optional(),
});

// Create Incident payload
export const CreateIncidentSchema = z.object({
    type: IncidentTypeSchema,
    title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
    description: z.string().min(5, "Açıklama en az 5 karakter olmalı"),
    severity: IncidentSeveritySchema,
    vehicleId: z.string().nullable().optional(),
    dueAt: z.string().nullable().optional(),
});

// Update Incident payload
export const UpdateIncidentSchema = z.object({
    status: IncidentStatusSchema.optional(),
    severity: IncidentSeveritySchema.optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    assignedToId: z.string().nullable().optional(),
    dueAt: z.string().nullable().optional(),
    resolutionNote: z.string().nullable().optional(),
});

// Create Work Order payload
export const CreateWorkOrderSchema = z.object({
    incidentId: z.string().min(1, "Kayıt ID gerekli"),
    title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
    assignedToId: z.string().nullable().optional(),
    plannedAt: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

// Update Work Order payload
export const UpdateWorkOrderSchema = z.object({
    status: WorkOrderStatusSchema.optional(),
    assignedToId: z.string().nullable().optional(),
    completedAt: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

// Create Comment payload
export const CreateCommentSchema = z.object({
    body: z.string().min(1, "Yorum boş olamaz"),
});

// Filter params schema
export const IncidentFiltersSchema = z.object({
    unitId: z.string().optional(),
    type: IncidentTypeSchema.optional(),
    status: IncidentStatusSchema.optional(),
    severity: IncidentSeveritySchema.optional(),
    vehicleId: z.string().optional(),
    q: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    slaBreached: z.coerce.boolean().optional(),
});

// Type exports from schemas
export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof UpdateIncidentSchema>;
export type CreateWorkOrderInput = z.infer<typeof CreateWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof UpdateWorkOrderSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type IncidentFiltersInput = z.infer<typeof IncidentFiltersSchema>;
