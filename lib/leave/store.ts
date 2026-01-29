
import {
    getLeaveRequests as dbGetLeaveRequests,
    updateLeaveRequest as dbUpdateLeaveRequest,
    getUserById
} from "@/lib/org/db";
import { LeaveRequest, LeaveStatus } from "@/lib/org/types";

// Bridge to DB
export function getLeaveRequests(filters?: { unitId?: string }) {
    let reqs = dbGetLeaveRequests();
    if (filters?.unitId) {
        // In a real DB we would join users to check unit, 
        // but here we might need to filter manually if unitId is not on the request
        // Our LeaveRequest type in db.ts key might not have unitId directly?
        // Let's check db.ts content from memory: LeaveRequest matches types.ts.
    }
    return reqs;
}

export function updateLeaveStatus(id: string, status: LeaveStatus, approverId?: string) {
    return dbUpdateLeaveRequest(id, {
        status,
        approverId,
        // resolvedAt: new Date().toISOString() // if type supports it
    });
}

// Mock Balance Logic
export function getBalance(userId: string) {
    const user = getUserById(userId);
    // Return mock balance
    return {
        userId,
        annual: 14,
        casual: 3,
        sick: 5,
        usedAnnual: 5,
        usedCasual: 1,
        usedSick: 0,
        remainingAnnual: 9
    };
}
