import { NextResponse } from "next/server";
import { gsCall, requireMe } from "@/lib/gs-gateway";
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const me = await requireMe();
    const body = await req.json().catch(() => ({})); // { full_name, phone }

    const full_name = String(body?.full_name || "");
    const phone = String(body?.phone || "");

    const r: any = await gsCall("records.check", {
      actor_email: me.email, // ✅ Apps Script requireActor_ bunu bekler
      full_name,
      phone,
    });

    // Apps Script: { ok:true, matches:[...] }
    const matches = (r?.matches || r?.data?.matches || []) as any[];

    return NextResponse.json({ result: matches }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Hata" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
}
