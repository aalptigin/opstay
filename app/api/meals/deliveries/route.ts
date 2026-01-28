// Meal Deliveries API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/audit";
import { DeliveryActionSchema } from "@/lib/meals/schema";
import { getDeliveriesByDate, findDelivery, updateDeliveryStatus, getTodayDate } from "@/lib/meals/store";
import { MealType } from "@/lib/meals/types";

// GET /api/meals/deliveries?date=YYYY-MM-DD&mealType=LUNCH
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
        const mealType = searchParams.get("mealType") as MealType | null;

        const deliveries = getDeliveriesByDate(date, mealType || undefined);
        return NextResponse.json({ ok: true, deliveries });
    } catch (error) {
        console.error("Get deliveries error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/meals/deliveries (deliver, cancel, report issue)
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

        const body = await request.json();
        const parsed = DeliveryActionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                ok: false,
                error: "Validasyon hatası",
                details: parsed.error.issues,
            }, { status: 400 });
        }

        const { date, mealType, personId, action, note, issueType } = parsed.data;

        // Find existing delivery
        const delivery = findDelivery(date, mealType, personId);
        if (!delivery) {
            return NextResponse.json({ ok: false, error: "Teslimat kaydı bulunamadı" }, { status: 404 });
        }

        // Determine new status
        let newStatus: "DELIVERED" | "CANCELLED" | "ISSUE";
        switch (action) {
            case "DELIVER":
                newStatus = "DELIVERED";
                break;
            case "CANCEL":
                newStatus = "CANCELLED";
                break;
            case "ISSUE":
                newStatus = "ISSUE";
                break;
        }

        // Update delivery
        const updated = updateDeliveryStatus(
            delivery.id,
            newStatus,
            action === "DELIVER" ? { id: session.user.id, name: session.user.name } : undefined,
            action === "ISSUE" ? issueType : undefined,
            action === "ISSUE" ? note : undefined,
            action === "CANCEL" ? note : undefined
        );

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: action === "DELIVER" ? "DELIVER" : action === "CANCEL" ? "CANCEL" : "REPORT_ISSUE",
            module: "meals",
            entityType: "meal_delivery",
            entityId: delivery.id,
            ip,
            metadata: { date, mealType, personId, newStatus, issueType, note },
        });

        console.log(`🍽️ [Meals] Delivery ${delivery.id}: ${action}`);

        return NextResponse.json({ ok: true, delivery: updated });
    } catch (error) {
        console.error("Delivery action error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
