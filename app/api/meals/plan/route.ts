// Meal Plan API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { createAuditLog } from "@/lib/org/db";
import { CreateMealPlanSchema } from "@/lib/meals/schema";
import { createMealPlan, getMealPlanByDate } from "@/lib/meals/store";

export const runtime = "edge";

// GET /api/meals/plan?date=YYYY-MM-DD
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
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json({ ok: false, error: "Tarih parametresi gerekli" }, { status: 400 });
        }

        const plan = getMealPlanByDate(date);
        return NextResponse.json({ ok: true, plan });
    } catch (error) {
        console.error("Get meal plan error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/meals/plan
export async function POST(request: NextRequest) {
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

        // RBAC check
        if (!hasPermission(session.user, "meals", "create")) {
            return NextResponse.json({ ok: false, error: "Plan oluşturma yetkiniz yok" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = CreateMealPlanSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                ok: false,
                error: "Validasyon hatası",
                details: parsed.error.issues,
            }, { status: 400 });
        }

        const plan = createMealPlan(parsed.data, {
            id: session.user.id,
            name: session.user.name,
        });

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: "CREATE",
            module: "meals",
            entityType: "meal_plan",
            entityId: plan.id,
            ip,
            metadata: { date: plan.date, itemCount: plan.items.length },
        });

        console.log(`🍽️ [Meals] Plan created: ${plan.id} for ${plan.date}`);

        return NextResponse.json({ ok: true, plan }, { status: 201 });
    } catch (error) {
        console.error("Create meal plan error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
