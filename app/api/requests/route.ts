import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { gsCall } from "@/lib/gs";

export const runtime = "edge";

export async function GET() {
  try {
    await requireUser(); // giriş kontrolü (cookie session)
    const data = await gsCall<{ ok: true; rows: any[] }>("requests.list", {});
    return NextResponse.json({ ok: true, rows: data.rows ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const subject_person_name = String(body?.subject_person_name ?? "");
    const subject_phone = String(body?.subject_phone ?? "");
    const reason = String(body?.reason ?? "");

    const data = await gsCall<{ ok: true; request_id: string }>("requests.add", {
      actor_email: user.email,
      subject_person_name,
      subject_phone,
      reason,
    });

    return NextResponse.json({ ok: true, request_id: data.request_id }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
}
