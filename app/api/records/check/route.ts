import { NextResponse } from "next/server";
import { gsCall, requireMe } from "@/lib/gs-gateway";
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const me = await requireMe();
    const body = await req.json(); // { full_name, phone }
    const r = await gsCall("records.check", { ...body, actor: me.email });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ result: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Hata" }, { status: 401 });
  }
}
