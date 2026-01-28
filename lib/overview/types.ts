// Overview Dashboard Types

export interface OverviewData {
    kpi: KpiMetrics;
    quickActions: QuickActionConfig[];
    recentActivity: ActivityItem[];
    upcomingDates: UpcomingDateItem[];
}

export interface KpiMetrics {
    availableVehicles: number;
    criticalStockItems: number;
    pendingApprovals: number;
    openIncidents: number;
}

export interface QuickActionConfig {
    id: string;
    label: string;
    icon: string;
    href: string;
    color: 'emerald' | 'amber' | 'red' | 'blue';
    visible: boolean; // role-based visibility
}

export type ActivityType = 'vehicle' | 'inventory' | 'maintenance' | 'leave' | 'training' | 'meals';
export type Severity = 'normal' | 'warning' | 'critical';

export interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    subtitle?: string;
    createdAt: string; // ISO timestamp
    createdBy: string;
    entityRef?: string; // clickable link
    icon: string;
    color: string;
    severity?: Severity;
}

export type UrgencyLevel = 'normal' | 'warning' | 'critical';

export interface UpcomingDateItem {
    id: string;
    title: string;
    subtitle?: string;
    date: string; // ISO string
    daysRemaining: number;
    urgencyLevel: UrgencyLevel;
    entityRef?: string;
    icon: string;
}

// Helper type for time ago formatting
export interface TimeAgoOptions {
    locale?: string;
    format?: 'short' | 'long';
}
