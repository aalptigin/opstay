// Organization Management Types

export type Role = "PRESIDENT" | "UNIT_MANAGER" | "STAFF";

export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: Role;
    unitId?: string;
    status: "active" | "inactive";
    createdAt: string;
}

export interface Unit {
    id: string;
    name: string;
}

export interface Session {
    id: string;
    userId: string;
    tokenHash: string;
    ip: string;
    userAgent?: string;
    createdAt: string;
    lastSeenAt: string;
    revokedAt?: string;
}

export interface AuditLog {
    id: string;
    actorId: string;
    action: string; // e.g. "auth.login", "inventory.create"
    module: string;
    entityType: string;
    entityId?: string;
    unitId?: string;
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
    createdAt: string;
}

// Vehicle Module
export type VehicleStatus = "available" | "in_use" | "maintenance" | "broken";

export interface Vehicle {
    id: string;
    plate: string;
    model: string;
    status: VehicleStatus;
    km: number;
    unitId?: string;
    insuranceExpiry?: string;
    inspectionExpiry?: string;
    createdAt: string;
}

export type AssignmentStatus = "pending" | "approved" | "rejected" | "in_progress" | "completed";

export interface VehicleAssignment {
    id: string;
    vehicleId: string;
    requesterId: string;
    approverId?: string;
    status: AssignmentStatus;
    startTime?: string;
    endTime?: string;
    startKm?: number;
    endKm?: number;
    purpose?: string;
    createdAt: string;
}

export type TicketStatus = "open" | "in_progress" | "testing" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketType = "repair" | "maintenance" | "sis_module" | "inspection" | "other";

export interface MaintenanceTicket {
    id: string;
    vehicleId: string;
    type: TicketType;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo?: string;
    notes?: string;
    cost?: number;
    createdAt: string;
}

// Inventory Module
export type DepotType = "cleaning" | "food";
export type TxnType = "in" | "out";

export interface InventoryItem {
    id: string;
    depotType: DepotType;
    name: string;
    unit: string; // adet, kg, lt
    minLevel: number;
    currentLevel: number;
}

export interface InventoryTxn {
    id: string;
    itemId: string;
    depotType: DepotType;
    type: TxnType;
    qty: number;
    requestedBy: string;
    approvedBy?: string;
    approvalStatus: "none" | "pending" | "approved" | "rejected";
    unitId?: string;
    notes?: string;
    source?: "form" | "quick"; // Where the txn originated
    createdAt: string;
}

// Meal Module
export interface MealTxn {
    id: string;
    personId?: string;
    unitId?: string;
    qty: number;
    deliveredBy: string;
    receivedBy?: string;
    createdAt: string;
}

// Leave Module
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
    status: LeaveStatus;
    approverId?: string;
    createdAt: string;
}

// Training Module
export interface TrainingLog {
    id: string;
    userId: string;
    trainingType: string;
    instructor?: string;
    location?: string;
    inTime: string;
    outTime?: string;
    createdAt: string;
}

// Module definitions
export type ModuleId =
    | "overview"
    | "vehicles"
    | "inventory"
    | "meals"
    | "maintenance"
    | "leave"
    | "training"
    | "audit"
    | "authorization"
    | "reservations";

export interface ModuleConfig {
    id: ModuleId;
    label: string;
    icon: string;
    path: string;
    roles: Role[];
    color: string;
}

export const MODULES: ModuleConfig[] = [
    { id: "overview", label: "Genel Panel", icon: "📊", path: "/panel/overview", roles: ["PRESIDENT", "UNIT_MANAGER"], color: "#3b82f6" },
    { id: "vehicles", label: "Araç Yönetimi", icon: "🚗", path: "/panel/vehicles", roles: ["PRESIDENT", "UNIT_MANAGER", "STAFF"], color: "#10b981" },
    { id: "inventory", label: "Depo Yönetimi", icon: "📦", path: "/panel/inventory", roles: ["PRESIDENT", "UNIT_MANAGER", "STAFF"], color: "#f59e0b" },
    { id: "meals", label: "Yemek Dağıtımı", icon: "🍽️", path: "/panel/meals", roles: ["PRESIDENT", "UNIT_MANAGER", "STAFF"], color: "#ef4444" },
    { id: "maintenance", label: "Arıza & Bakım", icon: "🔧", path: "/panel/maintenance", roles: ["PRESIDENT", "UNIT_MANAGER", "STAFF"], color: "#8b5cf6" },
    { id: "leave", label: "Yıllık İzin", icon: "🏖️", path: "/panel/leave", roles: ["PRESIDENT", "UNIT_MANAGER", "STAFF"], color: "#06b6d4" },
    { id: "training", label: "Eğitim Takibi", icon: "📚", path: "/panel/training", roles: ["PRESIDENT", "UNIT_MANAGER", "STAFF"], color: "#ec4899" },
    { id: "audit", label: "Denetim Kayıtları", icon: "📝", path: "/panel/audit", roles: ["PRESIDENT"], color: "#64748b" },
    { id: "authorization", label: "Yetkilendirme", icon: "🔐", path: "/panel/admin/authorization", roles: ["PRESIDENT"], color: "#dc2626" },
    { id: "reservations", label: "Rezervasyon", icon: "📅", path: "/panel/rezervasyon", roles: ["PRESIDENT", "UNIT_MANAGER", "STAFF"], color: "#0ea5e9" },
];
