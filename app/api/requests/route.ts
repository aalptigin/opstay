import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

export async function GET() {
  try {
    const r = await gsCall<any[]>("requests.list", {});
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ rows: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Apps Script: subject_person_name, subject_phone, reason
    const r = await gsCall("requests.add", {
      subject_person_name: body.subject_person_name || body.guest_full_name || "",
      subject_phone: body.subject_phone || body.guest_phone || "",
      reason: body.reason || body.summary || "",
      // actor_email otomatik
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, request_id: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
