import { NextResponse } from "next/server";
import { gsCall, requireRole } from "@/lib/gs-gateway";

export const runtime = "edge";

function s(v: any) {
  return String(v ?? "").trim();
}

function normStatus(v: any) {
  const x = s(v).toLowerCase();
  if (x === "open" || x === "new" || x === "yeni") return "open";
  if (x === "in_review" || x === "review" || x === "incelemede" || x === "inreview") return "in_review";
  if (x === "resolved" || x === "closed" || x === "done" || x === "kapandi" || x === "kapandı") return "resolved";
  if (x === "rejected" || x === "reject" || x === "reddedildi") return "rejected";
  return s(v) ? (s(v) as any) : "in_review";
}

export async function POST(req: Request) {
  try {
    // sadece manager
    await requireRole(["manager"]);

    const body = await req.json();

    const request_id = s(body.request_id);
    if (!request_id) {
      return NextResponse.json({ error: "missing request_id" }, { status: 400 });
    }

    const manager_response_raw =
      body.manager_response ?? body.response_text ?? body.manager_response_text ?? "";

    const manager_response = s(manager_response_raw);
    if (!manager_response) {
      // Apps Script tarafında genelde zorunlu, boş gönderilince “missing fields” döner
      return NextResponse.json(
        { error: "missing manager_response" },
        { status: 400 }
      );
    }

    const status = normStatus(body.status);

    // ✅ En güvenlisi: Apps Script hangi field adını bekliyorsa onu yakalasın diye hepsini gönder
    const r = await gsCall("requests.respond", {
      request_id,
      status,

      manager_response,
      manager_response_text: manager_response,
      response_text: manager_response,
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
