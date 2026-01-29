// Client-safe audit helpers (No DB imports)
import { AuditLog, User } from "./types";

/**
 * Parameters for creating an audit log entry
 */
export interface AuditParams {
    actorId: string;
    action: string;
    module: string;
    entityType: string;
    entityId?: string;
    unitId?: string;
    ip?: string;
    userAgent?: string;
    result?: "SUCCESS" | "FAIL" | "DENIED";
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    correlationId?: string;
    metadata?: Record<string, any>;
    diff?: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        changedKeys?: string[];
    };
}

/**
 * Audit action types
 */
export const AuditActions = {
    // Leave Management
    LEAVE_CREATE: "leave.request.create",
    LEAVE_UPDATE: "leave.request.update",
    LEAVE_APPROVE: "leave.approval.approve",
    LEAVE_REJECT: "leave.approval.reject",
    LEAVE_CANCEL: "leave.request.cancel",
    LEAVE_BALANCE_UPDATE: "leave.balance.update",

    // Vehicle Management
    VEHICLE_CREATE: "vehicle.create",
    VEHICLE_UPDATE: "vehicle.update",
    VEHICLE_ASSIGN: "vehicle.assign",
    VEHICLE_RETURN: "vehicle.return",
    VEHICLE_MAINTENANCE: "vehicle.maintenance",

    // Inventory Management
    INVENTORY_IN: "inventory.stock.in",
    INVENTORY_OUT: "inventory.stock.out",
    INVENTORY_ADJUST: "inventory.stock.adjust",
    INVENTORY_APPROVE: "inventory.request.approve",
    INVENTORY_REJECT: "inventory.request.reject",

    // Meal Management
    MEAL_CREATE: "meal.create",
    MEAL_UPDATE: "meal.update",
    MEAL_CANCEL: "meal.cancel",

    // User Management
    USER_CREATE: "user.create",
    USER_UPDATE: "user.update",
    USER_DELETE: "user.delete",
    USER_LOGIN: "user.login",
    USER_LOGOUT: "user.logout",

    // Training
    TRAINING_CREATE: "training.create",
    TRAINING_UPDATE: "training.update",
    TRAINING_COMPLETE: "training.complete",
} as const;

/**
 * Audit module types
 */
export const AuditModules = {
    LEAVE: "leave",
    VEHICLE: "vehicle",
    INVENTORY: "inventory",
    MEAL: "meal",
    USER: "user",
    TRAINING: "training",
    SYSTEM: "system",
} as const;

/**
 * Audit entity types
 */
export const AuditEntityTypes = {
    LEAVE_REQUEST: "leave_request",
    LEAVE_BALANCE: "leave_balance",
    VEHICLE: "vehicle",
    VEHICLE_ASSIGNMENT: "vehicle_assignment",
    INVENTORY_ITEM: "inventory_item",
    INVENTORY_TXN: "inventory_txn",
    MEAL_TXN: "meal_txn",
    USER: "user",
    TRAINING_LOG: "training_log",
} as const;

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

    // Detailed matches from AuditActions
    if (Object.values(AuditActions).includes(action as any)) {
        if (action.includes("leave")) return "İzin İşlemi";
        if (action.includes("vehicle")) return "Araç İşlemi";
        if (action.includes("inventory")) return "Depo İşlemi";
    }

    return action;
}

/**
 * Helper to create audit params for common actions
 */
export function createLeaveAuditParams(
    action: string,
    actorId: string,
    entityId: string,
    unitId?: string,
    ip?: string,
    metadata?: Record<string, any>
): AuditParams {
    return {
        actorId,
        action,
        module: AuditModules.LEAVE,
        entityType: AuditEntityTypes.LEAVE_REQUEST,
        entityId,
        unitId,
        ip,
        metadata,
    };
}

export function createVehicleAuditParams(
    action: string,
    actorId: string,
    entityId: string,
    unitId?: string,
    ip?: string,
    metadata?: Record<string, any>
): AuditParams {
    return {
        actorId,
        action,
        module: AuditModules.VEHICLE,
        entityType: AuditEntityTypes.VEHICLE,
        entityId,
        unitId,
        ip,
        metadata,
    };
}

export function createInventoryAuditParams(
    action: string,
    actorId: string,
    entityId: string,
    unitId?: string,
    ip?: string,
    metadata?: Record<string, any>
): AuditParams {
    return {
        actorId,
        action,
        module: AuditModules.INVENTORY,
        entityType: AuditEntityTypes.INVENTORY_ITEM,
        entityId,
        unitId,
        ip,
        metadata,
    };
}
