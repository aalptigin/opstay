// Role-Based Access Control (RBAC) helper

import { Role, User, ModuleId, MODULES } from "./types";

interface Permission {
    module: ModuleId;
    actions: ("read" | "create" | "update" | "delete" | "approve")[];
}

// Role permissions matrix
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    PRESIDENT: [
        { module: "overview", actions: ["read"] },
        { module: "vehicles", actions: ["read", "create", "update", "delete", "approve"] },
        { module: "inventory", actions: ["read", "create", "update", "delete", "approve"] },
        { module: "meals", actions: ["read", "create", "update", "delete"] },
        { module: "maintenance", actions: ["read", "create", "update", "delete", "approve"] },
        { module: "leave", actions: ["read", "create", "update", "delete", "approve"] },
        { module: "training", actions: ["read", "create", "update", "delete"] },
        { module: "audit", actions: ["read"] },
        { module: "authorization", actions: ["read", "create", "update", "delete"] },
        { module: "reservations", actions: ["read", "create", "update", "delete"] },
    ],
    UNIT_MANAGER: [
        { module: "overview", actions: ["read"] },
        { module: "vehicles", actions: ["read", "create", "update", "approve"] },
        { module: "inventory", actions: ["read", "create", "update"] },
        { module: "meals", actions: ["read", "create", "update"] },
        { module: "maintenance", actions: ["read", "create", "update"] },
        { module: "leave", actions: ["read", "create", "update", "approve"] },
        { module: "training", actions: ["read", "create", "update"] },
        { module: "reservations", actions: ["read", "create", "update"] },
    ],
    STAFF: [
        { module: "vehicles", actions: ["read", "create"] },
        { module: "inventory", actions: ["read", "create"] },
        { module: "meals", actions: ["read"] },
        { module: "maintenance", actions: ["read", "create"] },
        { module: "leave", actions: ["read", "create"] },
        { module: "training", actions: ["read"] },
        { module: "reservations", actions: ["read", "create"] },
    ],
};

/**
 * Check if user has permission for a specific action on a module
 */
export function hasPermission(
    user: Pick<User, "role">,
    module: ModuleId,
    action: "read" | "create" | "update" | "delete" | "approve"
): boolean {
    const permissions = ROLE_PERMISSIONS[user.role];
    if (!permissions) return false;

    const modulePerm = permissions.find((p) => p.module === module);
    if (!modulePerm) return false;

    return modulePerm.actions.includes(action);
}

/**
 * Check if user can access a specific unit's data
 * PRESIDENT can access all units
 * Others can only access their own unit
 */
export function canAccessUnit(user: Pick<User, "role" | "unitId">, targetUnitId?: string): boolean {
    if (user.role === "PRESIDENT") return true;
    if (!targetUnitId) return true; // No unit restriction
    return user.unitId === targetUnitId;
}

/**
 * Get modules accessible by a user role
 */
export function getAccessibleModules(role: Role): typeof MODULES {
    return MODULES.filter((m) => m.roles.includes(role));
}

/**
 * Check if user can approve requests
 */
export function canApprove(user: Pick<User, "role">, module: ModuleId): boolean {
    return hasPermission(user, module, "approve");
}

/**
 * Get role display name
 */
export function getRoleLabel(role: Role): string {
    switch (role) {
        case "PRESIDENT":
            return "Başkan";
        case "UNIT_MANAGER":
            return "Birim Sorumlusu";
        case "STAFF":
            return "Personel";
        default:
            return role;
    }
}

/**
 * Check if user is at least a certain role level
 */
export function isAtLeastRole(userRole: Role, requiredRole: Role): boolean {
    const hierarchy: Role[] = ["STAFF", "UNIT_MANAGER", "PRESIDENT"];
    return hierarchy.indexOf(userRole) >= hierarchy.indexOf(requiredRole);
}
