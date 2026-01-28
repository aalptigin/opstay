// Overview Data Aggregator with Role-Based Filtering

import type { User } from "@/lib/org/types";
import type { OverviewData, QuickActionConfig, ActivityItem, UpcomingDateItem, KpiMetrics } from "./types";
import {
    getVehicles,
    getInventoryItems,
    getMaintenanceTickets,
    getVehicleAssignments,
    getLeaveRequests,
    getInventoryTxns,
    getMealTxns,
    getTrainingLogs,
    getAuditLogs,
    getUserById
} from "@/lib/org/db";
import { canAccessUnit, hasPermission } from "@/lib/org/rbac";

/**
 * Calculate days between two dates
 */
function daysBetween(dateStr: string): number {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get KPI metrics based on user role
 */
function getKpiMetrics(user: Omit<User, "passwordHash">): KpiMetrics {
    const vehicles = getVehicles();
    const inventoryItems = getInventoryItems();
    const maintenanceTickets = getMaintenanceTickets();
    const vehicleAssignments = getVehicleAssignments();
    const leaveRequests = getLeaveRequests();

    // Filter by unit access
    const accessibleVehicles = vehicles.filter((v) => canAccessUnit(user, v.unitId));
    const accessibleTickets = maintenanceTickets.filter((t) => {
        const vehicle = vehicles.find((v) => v.id === t.vehicleId);
        return vehicle && canAccessUnit(user, vehicle.unitId);
    });
    const accessibleAssignments = vehicleAssignments.filter((a) => {
        const requester = getUserById(a.requesterId);
        return requester && canAccessUnit(user, requester.unitId);
    });
    const accessibleLeaveRequests = leaveRequests.filter((lr) => {
        const requester = getUserById(lr.userId);
        return requester && canAccessUnit(user, requester.unitId);
    });

    // Calculate metrics
    const availableVehicles = accessibleVehicles.filter((v) => v.status === "available").length;
    const criticalStockItems = inventoryItems.filter((i) => i.currentLevel < i.minLevel).length;

    // Pending approvals: assignments + leave requests + critical stock exits (if needs approval)
    let pendingApprovals = 0;
    if (hasPermission(user, "vehicles", "approve")) {
        pendingApprovals += accessibleAssignments.filter((a) => a.status === "pending").length;
    }
    if (hasPermission(user, "leave", "approve")) {
        pendingApprovals += accessibleLeaveRequests.filter((lr) => lr.status === "pending").length;
    }

    const openIncidents = accessibleTickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

    return {
        availableVehicles,
        criticalStockItems,
        pendingApprovals,
        openIncidents,
    };
}

/**
 * Get quick actions based on user permissions
 */
function getQuickActions(user: Omit<User, "passwordHash">): QuickActionConfig[] {
    const actions: QuickActionConfig[] = [];

    if (hasPermission(user, "vehicles", "create")) {
        actions.push({
            id: "vehicle_request",
            label: "Araç Talebi",
            icon: "🚗",
            href: "/org-panel/araclar?action=request",
            color: "emerald",
            visible: true,
        });
    }

    if (hasPermission(user, "inventory", "create")) {
        actions.push({
            id: "stock_out",
            label: "Stok Çıkışı",
            icon: "📦",
            href: "/org-panel/depo?action=out",
            color: "amber",
            visible: true,
        });
    }

    if (hasPermission(user, "maintenance", "create")) {
        actions.push({
            id: "maintenance_report",
            label: "Arıza Bildirimi",
            icon: "🔧",
            href: "/org-panel/bakim?action=create",
            color: "red",
            visible: true,
        });
    }

    if (hasPermission(user, "leave", "create")) {
        actions.push({
            id: "leave_request",
            label: "İzin Talebi",
            icon: "🏖️",
            href: "/org-panel/izin?action=create",
            color: "blue",
            visible: true,
        });
    }

    return actions;
}

/**
 * Get recent activity from all modules
 */
function getRecentActivity(user: Omit<User, "passwordHash">): ActivityItem[] {
    const activities: ActivityItem[] = [];
    const vehicles = getVehicles();
    const auditLogs = getAuditLogs().slice(0, 50); // Last 50 logs

    // Convert audit logs to activities
    for (const log of auditLogs) {
        const actor = getUserById(log.actorId);
        if (!actor) continue;

        // Filter by unit access
        if (!canAccessUnit(user, log.unitId)) continue;

        let title = "";
        let icon = "📝";
        let color = "#64748b";
        let entityRef: string | undefined;

        switch (log.module) {
            case "vehicles":
                icon = "🚗";
                color = "#10b981";
                if (log.action === "CREATE" && log.entityType === "assignment") {
                    const vehicle = vehicles.find((v) => log.metadata?.vehicleId === v.id);
                    title = vehicle ? `Araç ${vehicle.plate} talep edildi` : "Araç talebi oluşturuldu";
                    entityRef = `/org-panel/araclar/${log.entityId}`;
                } else if (log.action === "UPDATE" && log.metadata?.statusChange === "delivered") {
                    title = `Araç teslim alındı`;
                }
                break;

            case "inventory":
                icon = "📦";
                color = "#f59e0b";
                if (log.action === "CREATE" && log.entityType === "transaction") {
                    const txnType = log.metadata?.type as string;
                    title = txnType === "out" ? "Stoktan çıkış yapıldı" : "Stoka giriş yapıldı";
                    entityRef = `/org-panel/depo/transactions/${log.entityId}`;
                }
                break;

            case "maintenance":
                icon = "🔧";
                color = "#8b5cf6";
                if (log.action === "CREATE") {
                    title = "Yeni arıza kaydı açıldı";
                    entityRef = `/org-panel/bakim/${log.entityId}`;
                }
                break;

            case "leave":
                icon = "🏖️";
                color = "#06b6d4";
                if (log.action === "APPROVE") {
                    title = "İzin talebi onaylandı";
                } else if (log.action === "REJECT") {
                    title = "İzin talebi reddedildi";
                } else if (log.action === "CREATE") {
                    title = "İzin talebi oluşturuldu";
                }
                entityRef = `/org-panel/izin/${log.entityId}`;
                break;

            case "training":
                icon = "📚";
                color = "#ec4899";
                if (log.action === "CREATE") {
                    title = "Eğitim kaydı eklendi";
                }
                break;

            case "meals":
                icon = "🍽️";
                color = "#ef4444";
                if (log.action === "CREATE") {
                    title = "Yemek dağıtımı yapıldı";
                }
                break;
        }

        if (title) {
            activities.push({
                id: log.id,
                type: log.module as any,
                title,
                subtitle: actor.name,
                createdAt: log.createdAt,
                createdBy: actor.name,
                entityRef,
                icon,
                color,
                severity: "normal",
            });
        }
    }

    // Sort by date descending and limit to 10
    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
}

/**
 * Get upcoming dates (insurance, inspection, maintenance, etc.)
 */
function getUpcomingDates(user: Omit<User, "passwordHash">): UpcomingDateItem[] {
    const dates: UpcomingDateItem[] = [];
    const vehicles = getVehicles();

    // Filter vehicles by unit access
    const accessibleVehicles = vehicles.filter((v) => canAccessUnit(user, v.unitId));

    for (const vehicle of accessibleVehicles) {
        // Insurance expiry
        if (vehicle.insuranceExpiry) {
            const daysRemaining = daysBetween(vehicle.insuranceExpiry);
            if (daysRemaining > 0 && daysRemaining <= 90) {
                // Show if within 90 days
                dates.push({
                    id: `insurance_${vehicle.id}`,
                    title: `${vehicle.plate} - Sigorta Bitiş`,
                    subtitle: vehicle.model,
                    date: vehicle.insuranceExpiry,
                    daysRemaining,
                    urgencyLevel: daysRemaining <= 7 ? "critical" : daysRemaining <= 14 ? "warning" : "normal",
                    entityRef: `/org-panel/araclar/${vehicle.id}`,
                    icon: "📋",
                });
            }
        }

        // Inspection expiry
        if (vehicle.inspectionExpiry) {
            const daysRemaining = daysBetween(vehicle.inspectionExpiry);
            if (daysRemaining > 0 && daysRemaining <= 90) {
                dates.push({
                    id: `inspection_${vehicle.id}`,
                    title: `${vehicle.plate} - Muayene`,
                    subtitle: vehicle.model,
                    date: vehicle.inspectionExpiry,
                    daysRemaining,
                    urgencyLevel: daysRemaining <= 7 ? "critical" : daysRemaining <= 14 ? "warning" : "normal",
                    entityRef: `/org-panel/araclar/${vehicle.id}`,
                    icon: "🔍",
                });
            }
        }
    }

    // Sort by urgency (critical first) then by date
    return dates.sort((a, b) => {
        const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
        if (a.urgencyLevel !== b.urgencyLevel) {
            return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
        }
        return a.daysRemaining - b.daysRemaining;
    });
}

/**
 * Main function to get overview data
 */
export function getOverview(user: Omit<User, "passwordHash">): OverviewData {
    try {
        const kpi = getKpiMetrics(user);
        const quickActions = getQuickActions(user);
        const recentActivity = getRecentActivity(user);
        const upcomingDates = getUpcomingDates(user);

        return {
            kpi,
            quickActions,
            recentActivity,
            upcomingDates,
        };
    } catch (error) {
        console.error("Error generating overview data:", error);
        // Return safe defaults
        return {
            kpi: {
                availableVehicles: 0,
                criticalStockItems: 0,
                pendingApprovals: 0,
                openIncidents: 0,
            },
            quickActions: [],
            recentActivity: [],
            upcomingDates: [],
        };
    }
}
