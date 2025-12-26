export const runtime = "edge";

import { NextResponse } from "next/server";
import { gsCall, requireMe, requireRole } from "@/lib/gs-gateway";

export async function POST(req: Request) {
  try {
    const me = await requireMe();
    requireRole(me, ["manager"]); // sadece manager yanıtlar

    const body = await req.json().catch(() => ({}));
    const request_id = String(body?.request_id || "");
    const response_text = String(body?.response_text || "");
    const status = String(body?.status || "closed");

    if (!request_id || !response_text) {
      return NextResponse.json({ error: "Eksik alan." }, { status: 400 });
    }

    // ✅ Apps Script'in beklediği alan isimleri:
    // actor_email + manager_response + status
    const r: any = await gsCall("requests.respond", {
      actor_email: me.email,
      request_id,
      manager_response: response_text,
      status,
    });

    // lib/gs.ts zaten ok değilse throw eder; ama yine de güvenli kontrol
    if (r?.ok === false) return NextResponse.json({ error: r.error }, { status: 400 });

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Hata" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
}
