import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";
import { getSmsConfigByName, buildReservationSmsText } from "@/lib/sms";
import { SMS_TEMPLATES } from "@/lib/rating";

export const runtime = "edge";

/**
 * Mock POS Checkout API
 * Simulates POS device sending checkout event
 * 
 * In production, this would be called by actual POS hardware/software
 * For testing, we simulate it with this endpoint
 */

function s(v: any) {
    return String(v ?? "").trim();
}

function generateToken(): string {
    try {
        const anyCrypto = (globalThis as any).crypto;
        if (anyCrypto && typeof anyCrypto.randomUUID === "function") {
            return anyCrypto.randomUUID().replace(/-/g, "").slice(0, 16);
        }
    } catch { }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Extract checkout data from POS
        const reservation_no = s(body.reservation_no || body.reservationNumber);
        const customer_phone = s(body.customer_phone || body.phone);
        const customer_name = s(body.customer_name || body.name || body.full_name);
        const restaurant = s(body.restaurant || body.restaurant_name);
        const total_amount = s(body.total_amount || body.amount);
        const checkout_time = s(body.checkout_time) || new Date().toISOString();

        // Validate required fields
        if (!customer_phone) {
            return NextResponse.json(
                { ok: false, error: "customer_phone is required" },
                { status: 400 }
            );
        }

        if (!restaurant) {
            return NextResponse.json(
                { ok: false, error: "restaurant is required" },
                { status: 400 }
            );
        }

        // Generate unique rating token
        const token = generateToken();

        // Create rating entry in Sheets
        const ratingResult = await gsCall("rating.create", {
            reservation_no,
            restaurant,
            customer_phone,
            customer_name,
            total_amount,
            checkout_time,
            token,
        });

        if (!ratingResult?.ok) {
            console.error("Failed to create rating entry:", ratingResult?.error);
            return NextResponse.json(
                { ok: false, error: ratingResult?.error || "Failed to create rating" },
                { status: 500 }
            );
        }

        // Build rating link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://opstay.com";
        const ratingLink = `${baseUrl}/rate/${token}`;

        // Send rating request SMS
        try {
            if (process.env.NETGSM_MODE === "DRY_RUN" || process.env.NETGSM_MODE === "LIVE") {
                const smsText = SMS_TEMPLATES.ratingRequest({
                    ratingLink,
                    restaurantName: restaurant,
                });

                const smsConfig = getSmsConfigByName(restaurant);
                const senderId = smsConfig?.senderId || "OPSTAY";

                // Log SMS
                await gsCall("sms.log.add", {
                    reservation_no,
                    restaurant,
                    customer_phone,
                    sender_id: senderId,
                    message: smsText,
                    mode: process.env.NETGSM_MODE,
                    status: "SENT",
                });

                console.log("📩 Rating Request SMS", {
                    to: customer_phone,
                    senderId,
                    text: smsText,
                    mode: process.env.NETGSM_MODE,
                });
            }
        } catch (smsErr) {
            console.error("SMS Error:", smsErr);
            // Don't fail the checkout if SMS fails
        }

        return NextResponse.json({
            ok: true,
            rating_id: (ratingResult as any).rating_id,
            token,
            rating_link: ratingLink,
        });

    } catch (e: any) {
        console.error("POS Checkout Error:", e);
        return NextResponse.json(
            { ok: false, error: e?.message || "Internal error" },
            { status: 500 }
        );
    }
}

/**
 * GET - For testing/health check
 */
export async function GET() {
    return NextResponse.json({
        ok: true,
        service: "pos-checkout",
        description: "Mock POS checkout endpoint for rating system",
        usage: {
            method: "POST",
            body: {
                reservation_no: "string (optional)",
                customer_phone: "string (required)",
                restaurant: "string (required)",
                customer_name: "string (optional)",
                total_amount: "string (optional)",
            },
        },
    });
}
