import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

function s(v: any) {
  return String(v ?? "").trim();
}

function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === null || v === undefined) continue;
    const str = String(v).trim();
    if (str !== "") return v;
  }
  return "";
}

function normStatus(v: any) {
  const x = s(v).toLowerCase();
  // UI beklenen: open | in_review | resolved | rejected
  if (x === "open" || x === "new" || x === "yeni") return "open";
  if (x === "in_review" || x === "review" || x === "inreview" || x === "incelemede") return "in_review";
  if (x === "resolved" || x === "closed" || x === "done" || x === "kapandi" || x === "kapandı") return "resolved";
  if (x === "rejected" || x === "reject" || x === "reddedildi") return "rejected";
  // bilinmiyorsa güvenli varsayılan
  return "open";
}

function normalizeRequestRow(row: any) {
  const request_id = s(pick(row, ["request_id", "id", "req_id", "requestId"]));
  const created_at = s(pick(row, ["created_at", "createdAt", "date", "timestamp", "time"]));

  const guest_full_name = s(
    pick(row, [
      "guest_full_name",
      "subject_person_name",
      "full_name",
      "customer_full_name",
      "name_surname",
    ])
  );

  const guest_phone = s(
    pick(row, [
      "guest_phone",
      "subject_phone",
      "phone",
      "customer_phone",
      "telefon",
    ])
  );

  const summary = s(pick(row, ["summary", "reason", "note", "message", "description"]));

  const status = normStatus(pick(row, ["status", "state", "durum"]));

  const response_text = s(
    pick(row, ["response_text", "manager_response", "manager_response_text", "response", "reply"])
  );

  return {
    ...row,

    // ✅ UI’nin beklediği standart alanlar
    request_id,
    created_at,
    guest_full_name,
    guest_phone,
    summary,
    status,
    response_text,

    // ✅ alias (başka ekranlar farklı isimlerle arıyorsa diye)
    manager_response: response_text,
    manager_response_text: response_text,
    subject_person_name: guest_full_name,
    subject_phone: guest_phone,
    reason: summary,
  };
}

export async function GET() {
  try {
    const r = await gsCall<any[]>("requests.list", {});
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

    const rows = Array.isArray(r.data) ? r.data : [];
    const normalized = rows.map((x) => normalizeRequestRow(x));

    return NextResponse.json({ rows: normalized });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Apps Script: subject_person_name, subject_phone, reason
    const r = await gsCall("requests.add", {
      subject_person_name: body.subject_person_name || body.guest_full_name || body.full_name || "",
      subject_phone: body.subject_phone || body.guest_phone || body.phone || "",
      reason: body.reason || body.summary || body.note || "",
      // actor_email otomatik
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, request_id: r.data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
