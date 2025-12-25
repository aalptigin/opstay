import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { gsCall } from "../../../lib/gs";
import { recordAddSchema, recordUpdateSchema, recordDeleteSchema } from "../../../lib/validators";

export const runtime = "edge";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await gsCall<{ ok: true; rows: any[] }>("records.list", { actor_email: user.email });
    return NextResponse.json({ rows: data.rows });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = recordAddSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });

    const out = await gsCall<{ ok: true; record_id: string }>("records.add", { actor_email: user.email, ...parsed.data });
    return NextResponse.json({ ok: true, record_id: out.record_id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = recordUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });

    await gsCall("records.update", { actor_email: user.email, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = recordDeleteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });

    await gsCall("records.delete", { actor_email: user.email, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 400 });
  }
}
