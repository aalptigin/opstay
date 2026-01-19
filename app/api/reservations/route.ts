import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

/**
 * Bu route:
 * - Sheets’ten gelen tarih/saat alanlarını dd/MM/yyyy + HH:mm formatına normalize eder
 * - Çocuk sayısı ve yetkili adı için UI uyumluluk alias’ları ekler
 * - Eski/yeni field isimlerini tek yerde toparlar
 * - Rezervasyon sonrası DRY-RUN SMS simülasyonu yapar (Netgsm entegrasyonuna hazır)
 * - DRY-RUN SMS loglarını Google Sheets "SMS_LOGS" sheet'ine yazar (Code.gs: sms.log.add)
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

  const m = dt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) {
    return {
      date: date || `${m[3]}/${m[2]}/${m[1]}`,
      time: time || `${m[4]}:${m[5]}`,
    };
  }

  return { date, time };
}

/* =========================
   SMS - Using centralized config
========================= */

import { getSmsConfigByName, buildReservationSmsText } from "@/lib/sms";


function makeMessageId() {
  try {
    // bazı edge ortamlarda randomUUID desteklenebilir; değilse fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyCrypto: any = (globalThis as any).crypto;
    if (anyCrypto && typeof anyCrypto.randomUUID === "function") {
      return `SIM-${anyCrypto.randomUUID()}`;
    }
  } catch { }
  return `SIM-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
}

async function sendDryRunSms(payload: {
  to: string;
  senderId: string;
  text: string;
}) {
  // DRY-RUN: Netgsm'e GITME
  console.log("📩 DRY-RUN SMS", {
    to: payload.to,
    senderId: payload.senderId,
    text: payload.text,
    mode: "dry_run",
  });

  return {
    ok: true,
    mode: "dry_run" as const,
    messageId: makeMessageId(),
  };
}

function pickRowsFromGsResult(r: any) {
  // gsCall dönüşleri farklı olabilir:
  // - { ok:true, rows:[...] }
  // - { ok:true, data:{ ok:true, rows:[...] } }
  // - { ok:true, data:{ rows:[...] } }
  // - { ok:true, data:[...] }
  if (Array.isArray(r?.rows)) return r.rows;
  if (Array.isArray(r?.data?.rows)) return r.data.rows;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.data?.data)) return r.data.data; // extra tolerance
  if (Array.isArray(r?.data?.result?.rows)) return r.data.result.rows;
  return [];
}

/* =========================
   ROUTES
========================= */

export async function GET() {
  try {
    const r = await gsCall<any>("reservations.list", {});
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

    const rows = pickRowsFromGsResult(r);
    return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const restaurant_name = s(pick(body, ["restaurant_name", "restaurant"]));
    const reservation_no = s(
      pick(body, ["reservation_no", "reservationNumber", "reservation_id"])
    );

    let date = normalizeDate(pick(body, ["date", "gun_ay_yil"]));
    let time = normalizeTime(pick(body, ["time", "saat"]));
    const datetime = s(pick(body, ["datetime"]));
    ({ date, time } = normalizeFromDatetime(date, time, datetime));

    const customer_full_name = s(
      pick(body, ["customer_full_name", "full_name", "guest_full_name"])
    );
    const customer_phone = s(
      pick(body, ["customer_phone", "phone", "guest_phone"])
    );
    const table_no = s(pick(body, ["table_no", "masa_no", "tableNumber"]));
    const kids_u7 = s(
      pick(body, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"])
    );

    const total_guests = s(
      pick(body, [
        "total_guests",
        "people_count",
        "guest_count",
        "kisi_sayisi_toplam",
        "kisi_sayisi",
        "total_people",
        "person_count",
      ])
    );

    const officer_name = s(
      pick(body, ["officer_name", "authorized_name", "added_by_name"])
    );

    const note = s(pick(body, ["note"])) || "";

    const r = await gsCall("reservations.add", {
      restaurant_name,
      reservation_no,
      date,
      time,
      datetime,
      customer_full_name,
      customer_phone,
      table_no,
      kids_u7,
      total_guests,
      officer_name,
      note,
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

    /* =========================
       DRY-RUN SMS TETIKLE + SHEETS LOG
    ========================= */

    try {
      if (process.env.NETGSM_MODE === "DRY_RUN") {
        const cfg = getSmsConfigByName(restaurant_name);
        if (cfg && customer_phone) {
          const smsText = buildReservationSmsText({
            date,
            time,
            totalGuests: total_guests,
            mapsUrl: cfg.mapsUrl,
            signature: cfg.signature,
          });

          const smsRes = await sendDryRunSms({
            to: customer_phone,
            senderId: cfg.senderId,
            text: smsText,
          });

          await gsCall("sms.log.add", {
            reservation_no,
            restaurant: restaurant_name,
            customer_phone,
            sender_id: cfg.senderId,
            message: smsText,
            mode: "DRY_RUN",
            status: smsRes.ok ? "SENT" : "FAILED",
          });
        }
      }
    } catch (smsErr) {
      console.error("SMS DRY-RUN ERROR", smsErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
