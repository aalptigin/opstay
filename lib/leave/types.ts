// Leave Management Types

export enum LeaveType {
    ANNUAL = "ANNUAL",       // Yıllık İzin
    SICK = "SICK",           // Hastalık
    EXCUSE = "EXCUSE",       // Mazeret
    UNPAID = "UNPAID",       // Ücretsiz
    OTHER = "OTHER"          // Diğer
}

export enum LeaveStatus {
    PENDING = "PENDING",             // Bekliyor
    APPROVED = "APPROVED",           // Onaylandı
    REJECTED = "REJECTED",           // Reddedildi
    CANCELLED = "CANCELLED",         // İptal Edildi (Kullanıcı tarafından)
    NEEDS_CHANGES = "NEEDS_CHANGES", // Düzeltme İsteniyor
}

export enum DayPart {
    FULL = "FULL", // Tam gün
    AM = "AM",     // Sabah yarım
    PM = "PM",     // Öğleden sonra yarım
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    [LeaveType.ANNUAL]: "Yıllık İzin",
    [LeaveType.SICK]: "Hastalık İzni",
    [LeaveType.EXCUSE]: "Mazeret İzni",
    [LeaveType.UNPAID]: "Ücretsiz İzin",
    [LeaveType.OTHER]: "Diğer",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
    [LeaveStatus.PENDING]: "Onay Bekliyor",
    [LeaveStatus.APPROVED]: "Onaylandı",
    [LeaveStatus.REJECTED]: "Reddedildi",
    [LeaveStatus.CANCELLED]: "İptal Edildi",
    [LeaveStatus.NEEDS_CHANGES]: "Düzeltme İsteniyor",
};

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
    [LeaveStatus.PENDING]: "bg-amber-100 text-amber-700",
    [LeaveStatus.APPROVED]: "bg-green-100 text-green-700",
    [LeaveStatus.REJECTED]: "bg-red-100 text-red-700",
    [LeaveStatus.CANCELLED]: "bg-slate-100 text-slate-600",
    [LeaveStatus.NEEDS_CHANGES]: "bg-indigo-100 text-indigo-700",
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

export interface LeaveApproval {
    id: string;
    requestId: string;
    approverUserId: string;
    approverName: string;
    decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
    note?: string;
    decidedAt: string;
}

export interface LeaveRequest {
    id: string;
    requestNo: string;
    personId: string;
    personName: string;
    unitId?: string;
    unitName?: string;

    type: LeaveType;
    startDate: string; // YYYY-MM-DD
    startPart: DayPart;
    endDate: string;   // YYYY-MM-DD
    endPart: DayPart;
    totalDays: number;

    description: string;
    attachmentUrl?: string;

    status: LeaveStatus;

    approvals: LeaveApproval[];
    rejectionReason?: string;

    createdAt: string;
    updatedAt: string;
    createdByUserId: string;
}

export interface LeaveOverviewPayload {
    kpi: {
        pendingCount: number;
        todayOutCount: number;
        approvedMonthDays: number;
        conflictsCount: number;
    };
    requests: LeaveRequest[];
    balances: LeaveBalance[]; // Only visible ones
    permissions: {
        canCreate: boolean;
        canApprove: boolean;
        canManageBalances: boolean;
    };
}
