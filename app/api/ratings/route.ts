import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

/**
 * GET - List all ratings (for panel)
 */
export async function GET() {
    try {
        const result = await gsCall("rating.list", {});

        if (!result?.ok) {
            return NextResponse.json(
                { ok: false, error: result?.error || "Failed to fetch ratings" },
                { status: 400 }
            );
        }

        const rows = Array.isArray(result.rows) ? result.rows : [];

        return NextResponse.json(
            { ok: true, rows },
            { headers: { "Cache-Control": "no-store" } }
        );

    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Error" },
            { status: 500 }
        );
    }
}
