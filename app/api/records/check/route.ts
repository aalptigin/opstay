import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { phone?, full_name? }
    const r = await gsCall<any[]>("records.check", {
      phone: body.phone,
      full_name: body.full_name,
      // actor_email otomatik
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ matches: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
