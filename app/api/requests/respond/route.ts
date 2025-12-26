import { NextResponse } from "next/server";
import { gsCall, requireRole } from "@/lib/gs-gateway";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // sadece manager
    await requireRole(["manager"]);

    const body = await req.json(); // { request_id, manager_response, status }
    const r = await gsCall("requests.respond", {
      request_id: body.request_id,
      manager_response: body.manager_response,
      status: body.status,
      // actor_email gsCall içinde otomatik eklenecek
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
