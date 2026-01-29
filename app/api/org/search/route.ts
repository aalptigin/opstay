import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getVehicles, getInventoryItems, getUsers } from "@/lib/org/db";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const session = verifySession(token, getClientIp(request.headers));
        if (!session.valid) return NextResponse.json({ ok: false }, { status: 401 });

        const vehicles = getVehicles();
        const inventory = getInventoryItems();
        const users = getUsers();

        return NextResponse.json({ ok: true, data: { vehicles, inventory, users } });
    } catch {
        return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }
}
