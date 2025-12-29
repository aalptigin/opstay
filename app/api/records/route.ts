import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

/** küçük yardımcılar */
function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === null || v === undefined) continue;
    const s = String(v).trim();
    if (s !== "") return v;
  }
  return "";
}
function s(v: any) {
  return String(v ?? "").trim();
}

function fmtDateTR(d: Date) {
  // tr-TR genelde "29.12.2025" döner -> "/" yapıyoruz
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(d)
    .replace(/\./g, "/");
}

function fmtTimeTR(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function normalizeDate(value: any) {
  const raw = s(value);
  if (!raw) return "";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return fmtDateTR(d);

  return raw;
}

function normalizeTime(value: any) {
  const raw = s(value);
  if (!raw) return "";

  if (/^\d{2}:\d{2}$/.test(raw)) return raw;

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return fmtTimeTR(d);

  const m = raw.match(/^(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;

  return raw;
}

function normalizeRecordRow(row: any) {
  // Sheets kolonları farklı adlarla gelebilir (wrap/typo/legacy)
  const reservation_no = s(
    pick(row, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id", "rez_no"])
  );

  const restaurant_name = s(
    pick(row, ["restaurant_name", "restaurant", "restuarant", "restaurantName"])
  );

  const table_no = s(pick(row, ["table_no", "table_n0", "masa_no", "tableNumber"]));

  const full_name = s(
    pick(row, ["full_name", "customer_full_name", "guest_full_name", "name_surname"])
  );

  const phone = s(pick(row, ["phone", "customer_phone", "guest_phone", "telefon"]));

  // date/time bazen Date objesi döner -> dd/MM/yyyy + HH:mm normalize
  const date = normalizeDate(pick(row, ["date", "gun_ay_yil", "dayMonthYear", "created_date"]));
  const time = normalizeTime(pick(row, ["time", "saat", "created_time"]));

  // ekleyen yetkili (isim) — sheet’te authorized_name / officer_name vs olabilir
  const authorized_name = s(
    pick(row, ["authorized_name", "officer_name", "added_by_name", "created_by_name", "authorized_na"])
  );

  // ekleyen email
  const authorized_email = s(
    pick(row, ["authorized_email", "officer_email", "added_by", "added_by_email", "authorized_email "])
  );

  // çocuk sayısı
  const child_u7 = s(pick(row, ["child_u7", "kids_u7", "children_u7", "cocuk_7_alti"]));

  // not: bazı sheet’lerde blacklist_note / customer_note var
  const note = s(pick(row, ["note", "blacklist_note", "customer_note", "summary", "not"]));

  return {
    ...row,

    // ✅ UI’nin doğrudan kullanması için standart alanlar
    reservation_no,
    restaurant_name,
    table_no,
    full_name,
    phone,
    date,
    time,
    child_u7,
    authorized_name,
    authorized_email,
    note,

    // ✅ UI uyumluluk alias’ları (bazı tablolarda farklı isim aranıyor)
    reservation_n0: reservation_no,
    table_n0: table_no,
    customer_full_name: full_name,
    customer_phone: phone,
    kids_u7: child_u7,
    officer_name: authorized_name,
    officer_email: authorized_email,
  };
}

export async function GET() {
  try {
    const r = await gsCall<any[]>("records.list", {});
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

    const rows = Array.isArray(r.data) ? r.data : [];
    const normalized = rows.map((row) => normalizeRecordRow(row));

    return NextResponse.json({ rows: normalized });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // UI’den gelebilecek farklı isimleri normalize ediyoruz
    const restaurant_name = s(pick(body, ["restaurant_name", "restaurant"]));
    const reservation_no = s(pick(body, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id"]));

    const date = normalizeDate(pick(body, ["date", "gun_ay_yil"]));
    const time = normalizeTime(pick(body, ["time", "saat"]));

    const full_name = s(pick(body, ["full_name", "customer_full_name", "guest_full_name"]));
    const phone = s(pick(body, ["phone", "customer_phone", "guest_phone"]));
    const table_no = s(pick(body, ["table_no", "table_n0", "masa_no", "tableNumber"]));
    const child_u7 = s(pick(body, ["child_u7", "kids_u7", "children_u7", "cocuk_7_alti"]));

    const authorized_name = s(pick(body, ["authorized_name", "officer_name", "added_by_name"]));
    const note = s(pick(body, ["note", "blacklist_note", "customer_note"])) || "";

    const status = s(pick(body, ["status"])) || "active";

    const r = await gsCall("records.add", {
      restaurant_name,
      reservation_no,
      date,
      time,
      customer_full_name: full_name,
      customer_phone: phone,
      table_no,
      kids_u7: child_u7,
      note,
      status,

      // ✅ Ekleyen yetkili isim: Sheets’te kolon varsa dolsun diye ayrıca gönderiyoruz
      authorized_name,
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const record_id = s(pick(body, ["record_id", "id"]));
    if (!record_id) return NextResponse.json({ error: "missing record_id" }, { status: 400 });

    const patch: any = {
      restaurant_name: pick(body, ["restaurant_name", "restaurant"]) || undefined,
      reservation_no: pick(body, ["reservation_no", "reservation_n0", "reservationNumber"]) || undefined,
      date: normalizeDate(pick(body, ["date", "gun_ay_yil"])) || undefined,
      time: normalizeTime(pick(body, ["time", "saat"])) || undefined,
      customer_full_name: pick(body, ["full_name", "customer_full_name", "guest_full_name"]) || undefined,
      customer_phone: pick(body, ["phone", "customer_phone", "guest_phone"]) || undefined,
      table_no: pick(body, ["table_no", "table_n0", "masa_no"]) || undefined,
      kids_u7: pick(body, ["child_u7", "kids_u7", "children_u7"]) || undefined,
      note: pick(body, ["note", "blacklist_note", "customer_note"]) || undefined,
      status: pick(body, ["status"]) || undefined,
      authorized_name: pick(body, ["authorized_name", "officer_name"]) || undefined,
    };

    const r = await gsCall("records.update", { record_id, ...patch });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const record_id = s(pick(body, ["record_id", "id"]));
    if (!record_id) return NextResponse.json({ error: "missing record_id" }, { status: 400 });

    const r = await gsCall("records.delete", { record_id });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
