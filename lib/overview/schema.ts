// Zod validation schemas for overview data

import { z } from "zod";

export const KpiMetricsSchema = z.object({
    availableVehicles: z.number().int().nonnegative(),
    criticalStockItems: z.number().int().nonnegative(),
    pendingApprovals: z.number().int().nonnegative(),
    openIncidents: z.number().int().nonnegative(),
});

export const QuickActionConfigSchema = z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string(),
    href: z.string(),
    color: z.enum(['emerald', 'amber', 'red', 'blue']),
    visible: z.boolean(),
});

export const ActivityItemSchema = z.object({
    id: z.string(),
    type: z.enum(['vehicle', 'inventory', 'maintenance', 'leave', 'training', 'meals']),
    title: z.string(),
    subtitle: z.string().optional(),
    createdAt: z.string(),
    createdBy: z.string(),
    entityRef: z.string().optional(),
    icon: z.string(),
    color: z.string(),
    severity: z.enum(['normal', 'warning', 'critical']).optional(),
});

export const UpcomingDateItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.string(),
    daysRemaining: z.number().int(),
    urgencyLevel: z.enum(['normal', 'warning', 'critical']),
    entityRef: z.string().optional(),
    icon: z.string(),
});

export const OverviewDataSchema = z.object({
    kpi: KpiMetricsSchema,
    quickActions: z.array(QuickActionConfigSchema),
    recentActivity: z.array(ActivityItemSchema),
    upcomingDates: z.array(UpcomingDateItemSchema),
});
