import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getLeaveRequests, getBalance } from "@/lib/leave/store";
import { LeaveOverviewPayload } from "@/lib/leave/types";

export const runtime = "edge";

// GET /api/leave/overview
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        const user = session.user;

        const { searchParams } = new URL(request.url);
        const unitId = searchParams.get("unitId"); // Optional filter from UI

        // Determine scope based on role
        let targetUnitId: string | undefined = unitId || undefined;
        const canViewAll = user.role === "PRESIDENT";

        if (!canViewAll && user.role === "UNIT_MANAGER") {
            // Force unit manager to their unit
            targetUnitId = user.unitId;
        }
        if (user.role === "STAFF") {
            // Staff sees only their own requests usually, but for overview maybe restricted?
            // Prompt says: "İzinli/Staff: sadece kendi taleplerini oluşturur".
            // We will filter by personId later if role is staff
        }

        // Fetch Requests
        let requests = getLeaveRequests({ unitId: targetUnitId || undefined });
        if (user.role === "STAFF") {
            requests = requests.filter(r => r.userId === user.id);
        }

        // Calculate KPI (mock logic based on fetched requests)
        const pendingCount = requests.filter(r => r.status === "pending").length;

        const todayStr = new Date().toISOString().split("T")[0];
        const todayOutCount = requests.filter(r =>
            r.status === "approved" &&
            r.startDate <= todayStr && r.endDate >= todayStr
        ).length;

        const approvedMonthDays = requests
            .filter(r => r.status === "approved")
            .reduce((acc, r) => acc + r.days, 0); // Corrected totalDays to days

        // Fetch Balance for current user (or list if Manager)
        let balances = [];
        if (user.role === "STAFF") {
            balances = [getBalance(user.id)];
        } else {
            // Manager/President sees balances of people in their scope
            // For now mock: just return a few mock balances corresponding to requests
            const userIds = Array.from(new Set(requests.map(r => r.userId)));
            balances = userIds.map(uid => getBalance(uid));
        }

        const payload: LeaveOverviewPayload = {
            kpi: {
                pendingCount,
                todayOutCount,
                approvedMonthDays,
                conflictsCount: 0 // Mock trigger for now
            },
            requests,
            balances,
            permissions: {
                canCreate: true,
                canApprove: ["PRESIDENT", "UNIT_MANAGER"].includes(user.role),
                canManageBalances: user.role === "PRESIDENT"
            }
        };

        return NextResponse.json({ ok: true, data: payload });

    } catch (error) {
        console.error("Leave Overview Error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
