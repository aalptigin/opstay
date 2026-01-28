// Audit Actions API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getAuditActions } from "@/lib/audit/service";

export const runtime = "edge";

// GET /api/audit/actions
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const session = verifySession(token, getClientIp(request.headers));
        if (!session.valid) return NextResponse.json({ ok: false }, { status: 401 });

        const actions = await getAuditActions();
        return NextResponse.json({ ok: true, actions });
    } catch {
        return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }
}
