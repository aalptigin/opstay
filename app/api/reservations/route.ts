import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

/**
 * Bu route:
 * - Sheets’ten gelen tarih/saat alanlarını dd/MM/yyyy + HH:mm formatına normalize eder
 * - Çocuk sayısı ve yetkili adı için UI uyumluluk alias’ları ekler
 * - Eski/yeni field isimlerini tek yerde toparlar
 */

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
  // tr-TR genelde "29.12.2025" verir -> "/" yapıyoruz
  const out = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  return out.replace(/\./g, "/");
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

  // dd/MM/yyyy zaten doğruysa aynen dön
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

  // ISO / Date string / timestamp olabilir
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return fmtDateTR(d);

  return raw; // son çare
}

function normalizeTime(value: any) {
  const raw = s(value);
  if (!raw) return "";

  // HH:mm ise aynen
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;

  // ISO / Date string olabilir
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return fmtTimeTR(d);

  // "19:00:00" -> "19:00"
  const m = raw.match(/^(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;

  return raw;
}

function normalizeFromDatetime(date: string, time: string, datetime: string) {
  if (date && time) return { date, time };

  const dt = s(datetime);
  if (!dt) return { date, time };

  const d = new Date(dt);
  if (!Number.isNaN(d.getTime())) {
    return {
      date: date || fmtDateTR(d),
      time: time || fmtTimeTR(d),
    };
  }

  // "YYYY-MM-DDTHH:mm" gibi ise regex
  const m = dt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) {
    return {
      date: date || `${m[3]}/${m[2]}/${m[1]}`,
      time: time || `${m[4]}:${m[5]}`,
    };
  }

  return { date, time };
}

function normalizeReservationRow(row: any) {
  const restaurant = s(
    pick(row, ["restaurant_name", "restaurant", "restuarant", "restaruant"])
  );

  const reservation_no = s(
    pick(row, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id"])
  );

  const table_no = s(
    pick(row, ["table_no", "table_n0", "masa_no", "tableNumber"])
  );

  let date = normalizeDate(pick(row, ["date", "gun_ay_yil", "dayMonthYear"]));
  let time = normalizeTime(pick(row, ["time", "saat"]));
  const datetime = s(pick(row, ["datetime"]));
  ({ date, time } = normalizeFromDatetime(date, time, datetime));

  const customer_full_name = s(
    pick(row, ["customer_full_name", "full_name", "guest_full_name", "name_surname"])
  );

  const customer_phone = s(
    pick(row, ["customer_phone", "phone", "guest_phone", "telefon"])
  );

  // Çocuk sayısı (UI bazı yerlerde child_u7 / children_u7 bekleyebiliyor)
  const kids_u7 = s(
    pick(row, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"])
  );

  // Yetkili adı (UI bazı yerlerde authorized_name bekleyebiliyor)
  const officer_name = s(
    pick(row, ["officer_name", "authorized_name", "added_by_name", "created_by_name", "authorized_na", "authorized_name "])
  );

  const officer_email = s(
    pick(row, ["officer_email", "authorized_email", "added_by_email", "authorized_email "])
  );

  const note = s(pick(row, ["note", "customer_note", "not", "aciklama"]));

  return {
    ...row,

    restaurant,
    reservation_no,
    table_no,
    date,
    time,
    customer_full_name,
    customer_phone,
    kids_u7,
    officer_name,
    officer_email,
    note,

    // ✅ UI uyumluluk alias’ları (önemli)
    child_u7: kids_u7,
    children_u7: kids_u7,
    authorized_name: officer_name,
    authorized_email: officer_email,
  };
}

export async function GET() {
  try {
    const r = await gsCall<any[]>("reservations.list", {});
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

    const rows = Array.isArray(r.data) ? r.data : [];
    const normalized = rows.map((row) => normalizeReservationRow(row));

    return NextResponse.json({ rows: normalized });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // UI / eski-yeni alan adlarını tek yerde normalize ediyoruz
    const restaurant_name = s(pick(body, ["restaurant_name", "restaurant"]));
    const reservation_no = s(pick(body, ["reservation_no", "reservationNumber", "reservation_id"]));

    let date = normalizeDate(pick(body, ["date", "gun_ay_yil"]));
    let time = normalizeTime(pick(body, ["time", "saat"]));
    const datetime = s(pick(body, ["datetime"]));
    ({ date, time } = normalizeFromDatetime(date, time, datetime));

    const customer_full_name = s(pick(body, ["customer_full_name", "full_name", "guest_full_name"]));
    const customer_phone = s(pick(body, ["customer_phone", "phone", "guest_phone"]));
    const table_no = s(pick(body, ["table_no", "masa_no", "tableNumber"]));
    const kids_u7 = s(pick(body, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"]));

    // Yetkili adı: UI gönderiyorsa al; yoksa boş bırak (GS tarafı actor_email ile zaten loglar)
    const officer_name = s(pick(body, ["officer_name", "authorized_name", "added_by_name"]));

    const note = s(pick(body, ["note"])) || "";

    // GS tarafı hem eski hem yeni formatı kabul ediyor.
    const r = await gsCall("reservations.add", {
      restaurant_name,
      reservation_no,
      date,
      time,
      datetime, // eski akış uyumluluğu
      customer_full_name,
      customer_phone,
      table_no,
      kids_u7,
      officer_name,
      note,
      // actor_email otomatik (gs-gateway)
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

