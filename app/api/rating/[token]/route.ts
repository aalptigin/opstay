import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

function s(v: any) {
    return String(v ?? "").trim();
}

/**
 * GET - Get rating by token
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        if (!token) {
            return NextResponse.json(
                { ok: false, error: "Token required" },
                { status: 400 }
            );
        }

        const result = await gsCall("rating.getByToken", { token });

        if (!result?.ok) {
            return NextResponse.json(
                { ok: false, error: result?.error || "Rating not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ok: true,
            rating: (result as any).rating,
        });

    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Error" },
            { status: 500 }
        );
    }
}

/**
 * POST - Submit rating
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const body = await req.json();

        if (!token) {
            return NextResponse.json(
                { ok: false, error: "Token required" },
                { status: 400 }
            );
        }

        const rating = parseInt(s(body.rating), 10);
        const feedback = s(body.feedback);

        if (isNaN(rating) || rating < 1 || rating > 5) {
            return NextResponse.json(
                { ok: false, error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Submit the rating
        const result = await gsCall("rating.submit", {
            token,
            rating,
            feedback,
        });

        if (!result?.ok) {
            return NextResponse.json(
                { ok: false, error: result?.error || "Failed to submit rating" },
                { status: 400 }
            );
        }

        // Determine next steps based on rating
        const isPositive = rating >= 4;

        return NextResponse.json({
            ok: true,
            rating_id: (result as any).rating_id,
            is_positive: isPositive,
            callback_id: (result as any).callback_id || null,
        });

    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Error" },
            { status: 500 }
        );
    }
}
