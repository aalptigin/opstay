import { NextResponse } from "next/server";
import { gsCall, requireMe } from "@/lib/gs-gateway";

export async function GET() {
  try {
    const me = await requireMe();
    const r = await gsCall<any[]>("requests.list", { actor: me.email, role: me.role });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ rows: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Hata" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireMe();
    const body = await req.json();
    // staff ve manager ikisi de talep açabilir
    const r = await gsCall("requests.add", { ...body, actor: me.email, restaurant_name: me.restaurant_name });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Hata" }, { status: 401 });
  }
}
