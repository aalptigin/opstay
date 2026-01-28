// Incident/Maintenance Management Types

// Enums
export type IncidentType = "INCIDENT" | "MAINTENANCE";
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type IncidentSeverity = "LOW" | "MED" | "HIGH";
export type WorkOrderStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type CommentKind = "COMMENT" | "STATUS_CHANGE" | "ASSIGNMENT" | "WORKORDER";
export type ApprovalStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

// User reference (minimal)
export interface UserRef {
    id: string;
    name: string;
    email?: string;
}

// Main Incident entity
export interface Incident {
    id: string;
    refNo: string; // e.g., INC-2026-00012
    unitId: string;
    type: IncidentType;
    title: string;
    description: string;
    status: IncidentStatus;
    severity: IncidentSeverity;
    vehicleId?: string | null;
    vehiclePlate?: string | null;
    dueAt?: string | null;
    slaMinutes?: number | null;
    createdBy: UserRef;
    assignedTo?: UserRef | null;
    resolutionNote?: string | null;
    approvalStatus?: ApprovalStatus;
    approvedBy?: UserRef | null;
    approvedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

// Work Order entity
export interface WorkOrder {
    id: string;
    incidentId: string;
    title: string;
    status: WorkOrderStatus;
    assignedTo?: UserRef | null;
    plannedAt?: string | null;
    completedAt?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

// Incident Comment/Activity
export interface IncidentComment {
    id: string;
    incidentId: string;
    body: string;
    createdBy: UserRef;
    createdAt: string;
    kind: CommentKind;
}

// API Payloads
export interface CreateIncidentPayload {
    type: IncidentType;
    title: string;
    description: string;
    severity: IncidentSeverity;
    vehicleId?: string | null;
    dueAt?: string | null;
}

export interface UpdateIncidentPayload {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    title?: string;
    description?: string;
    assignedToId?: string | null;
    dueAt?: string | null;
    resolutionNote?: string | null;
}

export interface CreateWorkOrderPayload {
    incidentId: string;
    title: string;
    assignedToId?: string | null;
    plannedAt?: string | null;
    notes?: string | null;
}

export interface UpdateWorkOrderPayload {
    status?: WorkOrderStatus;
    assignedToId?: string | null;
    completedAt?: string | null;
    notes?: string | null;
}

// Filter params
export interface IncidentFilters {
    unitId?: string;
    type?: IncidentType;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    vehicleId?: string;
    q?: string;
    from?: string;
    to?: string;
    slaBreached?: boolean;
}

// API Responses
export interface IncidentsListResponse {
    ok: boolean;
    items: Incident[];
    total: number;
}

export interface IncidentDetailResponse {
    ok: boolean;
    item: Incident;
    workOrders: WorkOrder[];
    comments: IncidentComment[];
}

// KPI Stats
export interface IncidentStats {
    open: number;
    inProgress: number;
    maintenance: number;
    criticalToday: number;
}
