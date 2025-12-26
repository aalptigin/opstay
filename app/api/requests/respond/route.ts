export const runtime = "edge";

import { NextResponse } from "next/server";
import { gsCall, requireMe, requireRole } from "@/lib/gs-gateway";

export async function POST(req: Request) {
  try {
    const me = await requireMe();
    requireRole(me, ["manager"]); // sadece manager yanıtlar
    const body = await req.json(); // { request_id, response_text, status }
    const r = await gsCall("requests.respond", { ...body, actor: me.email });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Hata" }, { status: 403 });
  }
}