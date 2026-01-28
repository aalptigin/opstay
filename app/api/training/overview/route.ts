// Training Overview API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getTrainingOverview } from "@/lib/training/store";

// GET /api/training/overview
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        }

        console.log(`📚 [Training] Loading overview for user ${session.user.id}`);
        const startTime = Date.now();

        // Use "usr_current" as mock personId for demo
        const personId = "usr_current"; // In real app: session.user.id
        const overview = getTrainingOverview(personId, session.user.role);

        console.log(`📚 [Training] Overview loaded in ${Date.now() - startTime}ms`);

        return NextResponse.json({
            ok: true,
            ...overview,
        });
    } catch (error) {
        console.error("Training overview error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
