// Meals Overview API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getMealOverview, getTodayDate } from "@/lib/meals/store";

// export const runtime = "edge";

// GET /api/meals/overview?date=YYYY-MM-DD
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

        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date") || getTodayDate();

        console.log(`🍽️ [Meals] Loading overview for ${date}`);
        const startTime = Date.now();

        const overview = getMealOverview(date, session.user.role);

        console.log(`🍽️ [Meals] Overview loaded in ${Date.now() - startTime}ms`);

        return NextResponse.json({
            ok: true,
            ...overview,
        });
    } catch (error) {
        console.error("Meals overview error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
