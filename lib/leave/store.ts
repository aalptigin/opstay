import {
    getLeaveRequests as dbGetLeaveRequests,
    updateLeaveRequest as dbUpdateLeaveRequest,
    getUserById
} from "@/lib/org/db";
import { LeaveRequest, LeaveStatus } from "@/lib/org/types";
import { LeaveBalance } from "@/lib/leave/types";

// Bridge to DB
export function getLeaveRequests(filters?: { unitId?: string }) {
    let reqs = dbGetLeaveRequests();
    if (filters?.unitId) {
        // Filter by user's unitId
        reqs = reqs.filter(req => {
            const user = getUserById(req.userId);
            return user?.unitId === filters.unitId;
        });
    }
    return reqs;
}

export function updateLeaveStatus(id: string, status: LeaveStatus, approverId?: string) {
    return dbUpdateLeaveRequest(id, {
        status,
        approverId,
    });
}

// Fixed Balance Logic - Returns proper LeaveBalance type
export function getBalance(userId: string): LeaveBalance {
    const user = getUserById(userId);
    const currentYear = new Date().getFullYear();
    
    // Calculate used days from actual leave requests
    const userRequests = dbGetLeaveRequests().filter(r => r.userId === userId);
    const approvedRequests = userRequests.filter(r => r.status === "approved");
    
    const annualUsed = approvedRequests
        .filter(r => r.reason?.toLowerCase().includes("yıllık"))
        .reduce((sum, r) => sum + r.days, 0);
    
    const sickUsed = approvedRequests
        .filter(r => r.reason?.toLowerCase().includes("hastalık"))
        .reduce((sum, r) => sum + r.days, 0);
    
    const excuseUsed = approvedRequests
        .filter(r => r.reason?.toLowerCase().includes("mazeret"))
        .reduce((sum, r) => sum + r.days, 0);

    const unpaidUsed = approvedRequests
        .filter(r => r.reason?.toLowerCase().includes("ücretsiz"))
        .reduce((sum, r) => sum + r.days, 0);

    const pendingRequests = userRequests.filter(r => r.status === "pending");
    const annualReserved = pendingRequests.reduce((sum, r) => sum + r.days, 0);

    // Return proper LeaveBalance format
    return {
        id: `bal_${userId}_${currentYear}`,
        personId: userId,
        year: currentYear,
        annualEntitledDays: 20, // Default entitlement
        annualUsedDays: annualUsed,
        annualReservedDays: annualReserved,
        sickUsedDays: sickUsed,
        excuseUsedDays: excuseUsed,
        unpaidUsedDays: unpaidUsed,
        updatedAt: new Date().toISOString(),
    };
}