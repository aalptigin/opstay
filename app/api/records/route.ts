import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

export async function GET() {
  try {
    const r = await gsCall<any[]>("records.list", {});
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ rows: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await gsCall("records.add", {
      full_name: body.full_name,
      phone: body.phone,
      status: body.status || "active",
      note: body.note || body.summary || "",
      // actor_email otomatik
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, record_id: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const r = await gsCall("records.update", {
      record_id: body.record_id,
      full_name: body.full_name,
      phone: body.phone,
      status: body.status,
      note: body.note || body.summary || "",
      // actor_email otomatik
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const r = await gsCall("records.delete", {
      record_id: body.record_id,
      // actor_email otomatik
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
