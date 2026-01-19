import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

function s(v: any) {
    return String(v ?? "").trim();
}

/**
 * GET - List all callbacks (for panel)
 */
export async function GET() {
    try {
        const result = await gsCall("callback.list", {});

        if (!result?.ok) {
            return NextResponse.json(
                { ok: false, error: result?.error || "Failed to fetch callbacks" },
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

/**
 * PATCH - Update callback status
 */
export async function PATCH(req: Request) {
    try {
        const body = await req.json();

        const callback_id = s(body.callback_id);
        const status = s(body.status);
        const notes = s(body.notes);
        const assigned_to = s(body.assigned_to);

        if (!callback_id) {
            return NextResponse.json(
                { ok: false, error: "callback_id required" },
                { status: 400 }
            );
        }

        const result = await gsCall("callback.update", {
            callback_id,
            status,
            notes,
            assigned_to,
        });

        if (!result?.ok) {
            return NextResponse.json(
                { ok: false, error: result?.error || "Failed to update callback" },
                { status: 400 }
            );
        }

        return NextResponse.json({ ok: true });

    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Error" },
            { status: 500 }
        );
    }
}
