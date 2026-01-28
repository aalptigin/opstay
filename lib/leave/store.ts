import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus, DayPart, LeaveApproval } from "./types";
// Helper for ID generation
function generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// MOCK DATA
let LEAVE_REQUESTS: LeaveRequest[] = [
    {
        id: "lvr_1",
        requestNo: "REQ-2024-001",
        personId: "usr_current", // Mock current user
        personName: "Kullanıcı (Başkan)",
        unitId: "u1",
        unitName: "Yönetim",
        type: LeaveType.ANNUAL,
        startDate: "2024-02-10",
        startPart: DayPart.FULL,
        endDate: "2024-02-12",
        endPart: DayPart.FULL,
        totalDays: 3,
        description: "Yıllık izin kullanımı",
        status: LeaveStatus.APPROVED,
        approvals: [
            { id: "app_1", requestId: "lvr_1", approverUserId: "usr_admin", approverName: "Admin User", decision: "APPROVED", decidedAt: "2024-02-01T10:00:00Z" }
        ],
        createdAt: "2024-02-01T09:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
        createdByUserId: "usr_current"
    },
    {
        id: "lvr_2",
        requestNo: "REQ-2024-002",
        personId: "p2",
        personName: "Ahmet Yılmaz",
        unitId: "u2",
        unitName: "Mutfak",
        type: LeaveType.SICK,
        startDate: new Date().toISOString().split("T")[0], // Today
        startPart: DayPart.FULL,
        endDate: new Date().toISOString().split("T")[0],
        endPart: DayPart.FULL,
        totalDays: 1,
        description: "Doktor raporlu",
        status: LeaveStatus.PENDING,
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByUserId: "p2"
    }
];

let LEAVE_BALANCES: LeaveBalance[] = [
    {
        id: "bal_1",
        personId: "usr_current",
        year: 2024,
        annualEntitledDays: 14,
        annualUsedDays: 3,
        annualReservedDays: 0,
        sickUsedDays: 0,
        excuseUsedDays: 0,
        unpaidUsedDays: 0,
        updatedAt: new Date().toISOString()
    },
    {
        id: "bal_2",
        personId: "p2",
        year: 2024,
        annualEntitledDays: 14,
        annualUsedDays: 0,
        annualReservedDays: 0,
        sickUsedDays: 0,
        excuseUsedDays: 0,
        unpaidUsedDays: 0,
        updatedAt: new Date().toISOString()
    }
];

// Helper to calculate business days (simplified for now)
export function calculateDays(start: string, end: string, startPart: DayPart, endPart: DayPart): number {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Adjust for half days
    if (startPart !== DayPart.FULL) diffDays -= 0.5;
    if (endPart !== DayPart.FULL) diffDays -= 0.5;

    return Math.max(0.5, diffDays);
}

// ACCESSORS
export function getLeaveRequests(filters?: { unitId?: string; personId?: string; status?: LeaveStatus }) {
    let reqs = [...LEAVE_REQUESTS];
    if (filters?.unitId) reqs = reqs.filter(r => r.unitId === filters.unitId);
    if (filters?.personId) reqs = reqs.filter(r => r.personId === filters.personId);
    if (filters?.status) reqs = reqs.filter(r => r.status === filters.status);
    return reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getLeaveRequestById(id: string) {
    return LEAVE_REQUESTS.find(r => r.id === id);
}

export function getBalance(personId: string, year: number = new Date().getFullYear()) {
    let bal = LEAVE_BALANCES.find(b => b.personId === personId && b.year === year);
    if (!bal) {
        // Init balance if not exists
        bal = {
            id: generateId("bal"),
            personId,
            year,
            annualEntitledDays: 14, // Default
            annualUsedDays: 0,
            annualReservedDays: 0,
            sickUsedDays: 0,
            excuseUsedDays: 0,
            unpaidUsedDays: 0,
            updatedAt: new Date().toISOString()
        };
        LEAVE_BALANCES.push(bal);
    }
    return bal;
}

// MUTATIONS
export function createLeaveRequest(data: Partial<LeaveRequest>): LeaveRequest {
    const newReq: LeaveRequest = {
        id: generateId("lvr"),
        requestNo: `REQ-${new Date().getFullYear()}-${String(LEAVE_REQUESTS.length + 1).padStart(3, "0")}`,
        personId: data.personId!,
        personName: data.personName!,
        unitId: data.unitId,
        unitName: data.unitName,
        type: data.type!,
        startDate: data.startDate!,
        startPart: data.startPart!,
        endDate: data.endDate!,
        endPart: data.endPart!,
        totalDays: calculateDays(data.startDate!, data.endDate!, data.startPart!, data.endPart!),
        description: data.description!,
        attachmentUrl: data.attachmentUrl,
        status: LeaveStatus.PENDING,
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByUserId: data.createdByUserId!
    };

    LEAVE_REQUESTS.unshift(newReq);

    // Reserve days if Annual
    if (newReq.type === LeaveType.ANNUAL) {
        const bal = getBalance(newReq.personId);
        bal.annualReservedDays += newReq.totalDays;
        bal.updatedAt = new Date().toISOString();
    }

    return newReq;
}

export function updateLeaveStatus(id: string, status: LeaveStatus, actor: { id: string; name: string }, note?: string) {
    const req = LEAVE_REQUESTS.find(r => r.id === id);
    if (!req) throw new Error("Request not found");

    const oldStatus = req.status;
    req.status = status;
    req.updatedAt = new Date().toISOString();

    if (status !== LeaveStatus.PENDING && status !== LeaveStatus.CANCELLED) {
        req.approvals.push({
            id: generateId("app"),
            requestId: id,
            approverUserId: actor.id,
            approverName: actor.name,
            decision: status === LeaveStatus.APPROVED ? "APPROVED" : (status === LeaveStatus.REJECTED ? "REJECTED" : "CHANGES_REQUESTED"),
            note,
            decidedAt: new Date().toISOString()
        });
    }

    // Balance Logic
    if (req.type === LeaveType.ANNUAL) {
        const bal = getBalance(req.personId);

        // If Approved
        if (status === LeaveStatus.APPROVED && oldStatus !== LeaveStatus.APPROVED) {
            bal.annualReservedDays -= req.totalDays;
            bal.annualUsedDays += req.totalDays;
        }

        // If Rejected/Cancelled from Pending
        if ((status === LeaveStatus.REJECTED || status === LeaveStatus.CANCELLED) && oldStatus === LeaveStatus.PENDING) {
            bal.annualReservedDays -= req.totalDays;
        }

        // If Rejected/Cancelled AFTER Approved (Reversal)
        if ((status === LeaveStatus.REJECTED || status === LeaveStatus.CANCELLED) && oldStatus === LeaveStatus.APPROVED) {
            bal.annualUsedDays -= req.totalDays;
        }

        bal.updatedAt = new Date().toISOString();
    }

    return req;
}

export function updateBalance(personId: string, updates: Partial<LeaveBalance>) {
    const bal = getBalance(personId);
    Object.assign(bal, updates, { updatedAt: new Date().toISOString() });
    return bal;
}

export function deleteRequest(id: string) {
    // Only for cleanup/rollback in dev
    LEAVE_REQUESTS = LEAVE_REQUESTS.filter(r => r.id !== id);
}
