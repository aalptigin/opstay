
// Re-export core types to ensure single source of truth
import { LeaveRequest as CoreLeaveRequest } from "@/lib/org/types";

// Enums/Constants for Schema & Frontend
// These were missing after unification, causing Schema errors.
export enum LeaveType {
    ANNUAL = "ANNUAL",
    SICK = "SICK",
    EXCUSE = "EXCUSE",
    UNPAID = "UNPAID",
    OTHER = "OTHER"
}

export enum DayPart {
    FULL = "FULL",
    AM = "AM",
    PM = "PM"
}

export const LeaveStatus = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
    NEEDS_CHANGES: "needs_changes"
} as const;

export type LeaveStatus = typeof LeaveStatus[keyof typeof LeaveStatus];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    [LeaveType.ANNUAL]: "Yıllık İzin",
    [LeaveType.SICK]: "Hastalık İzni",
    [LeaveType.EXCUSE]: "Mazeret İzni",
    [LeaveType.UNPAID]: "Ücretsiz İzin",
    [LeaveType.OTHER]: "Diğer",
};

export interface LeaveBalance {
    id: string;
    personId: string;
    year: number;
    annualEntitledDays: number;
    annualUsedDays: number;
    annualReservedDays: number;
    sickUsedDays: number;
    excuseUsedDays: number;
    unpaidUsedDays: number;
    updatedAt: string;
}

// Extend Core Type to satisfy Frontend expectations (optional fields)
export interface LeaveRequest extends CoreLeaveRequest {
    type?: LeaveType; // Optional in DB, required in Frontend form?
    requestNo?: string;
    personName?: string;
    unitName?: string;
    startPart?: DayPart;
    endPart?: DayPart;
    description?: string; // Maps to 'reason' in Core?
}

export interface LeaveOverviewPayload {
    kpi: {
        pendingCount: number;
        todayOutCount: number;
        approvedMonthDays: number;
        conflictsCount: number;
    };
    requests: LeaveRequest[];
    balances: LeaveBalance[];
    permissions: {
        canCreate: boolean;
        canApprove: boolean;
        canManageBalances: boolean;
    };
}
