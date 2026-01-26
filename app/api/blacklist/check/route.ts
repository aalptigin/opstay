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

function normPhone(v: any) {
  return String(v ?? "").replace(/[^\d+]/g, "").trim();
}

function isTruthy(v: any) {
  if (v === true) return true;
  const t = String(v ?? "").trim().toLowerCase();
  return t === "true" || t === "1" || t === "yes" || t === "evet";
}

function isBlacklistedRow(row: any) {
  const flag = pick(row, ["is_blacklisted", "blacklisted", "in_blacklist", "kara_liste", "is_blacklist"]);
  if (isTruthy(flag)) return true;

  const status = s(pick(row, ["status", "record_status", "state"])).toLowerCase();
  if (status) {
    if (
      status.includes("black") ||
      status.includes("kara") ||
      status.includes("blok") ||
      status.includes("blocked") ||
      status.includes("ban")
    )
      return true;

    // Eğer status kullanıyorsanız ve "active" dışı bir şey blacklist sayılacaksa:
    if (status !== "active") return true;
  }

  const risk = s(pick(row, ["risk_level", "risk", "level"])).toLowerCase();
  if (risk) {
    if (risk.includes("high") || risk.includes("kritik") || risk.includes("critical") || risk.includes("severe"))
      return true;
  }

  return false;
}

function normalizeMatch(row: any) {
  const full_name = s(pick(row, ["full_name", "customer_full_name", "guest_full_name", "name_surname"]));
  const phone = s(pick(row, ["phone", "customer_phone", "guest_phone", "telefon"]));

  const note = s(pick(row, ["note", "blacklist_note", "customer_note", "summary", "not"]));
  const risk_level = s(pick(row, ["risk_level", "risk", "level"]));
  const restaurant = s(pick(row, ["restaurant", "venue", "otel", "hotel"]));
  const restaurant_name = s(pick(row, ["restaurant_name", "venue_name", "otel_adi", "hotel_name"]));

  // ✅ GOOGLE SHEETS'TEKİ GERÇEK ALAN ADLARINI KULLAN
  // Google Sheets'inizdeki Blacklist sheet'inde "authorized_name" alanı ekleyen kişiyi içeriyor
  const added_by_name = s(pick(row, [
    "authorized_name",    // ✅ Google Sheets'teki ana alan
    "officer_name",       // ✅ Alternatif alan
    "added_by_name",
    "added_by",
    "created_by",
    "author",
    "user",
    "operator"
  ]));

  // ✅ Google Sheets'te "created_at" alanı tarihi içeriyor
  const added_at = s(pick(row, [
    "created_at",         // ✅ Google Sheets'teki ana alan
    "added_at",
    "date_added",
    "entry_date",
    "timestamp",
    "record_date"
  ]));

  // ✅ added_by alanını added_by_name ile aynı yap
  const added_by = added_by_name;

  return {
    full_name,
    phone,
    note,
    risk_level,
    restaurant: restaurant || restaurant_name,
    restaurant_name: restaurant_name || restaurant,
    // ✅ GOOGLE SHEETS'TEKİ GERÇEK ALANLARI DÖNDÜR
    added_by,
    added_by_name,
    added_at,
    created_at: added_at // created_at'i de aynı değerle doldur
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const full_name = s(pick(body, ["full_name", "customer_full_name", "name"]));
    const phone = normPhone(pick(body, ["phone", "customer_phone", "telefon"]));

    if (!full_name || !phone) {
      return NextResponse.json(
        { error: "full_name ve phone zorunludur." },
        { status: 400 }
      );
    }

    // Mevcut sisteminizde check: records.check
    const r = await gsCall<any>("records.check", {
      phone,
      full_name,
      // actor_email otomatik
    });

    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

    // Gateway cevapları farklı şekillerde gelebilir: {data:[...]} / {matches:[...]} / doğrudan [...]
    const matches = Array.isArray((r as any).data)
      ? (r as any).data
      : Array.isArray((r as any).matches)
        ? (r as any).matches
        : Array.isArray(r)
          ? r
          : [];

    // Uyarı listesi kararı:
    // 1) satırda status/flag/risk varsa ona göre
    // 2) hiçbir belirteç yoksa, records.check'in doğası gereği eşleşme => blacklist kabul edilir
    let is_blacklisted = false;

    if (matches.length > 0) {
      const anyHasSignal = matches.some((m: any) =>
        s(pick(m, ["status", "record_status", "state", "risk_level", "is_blacklisted", "blacklisted", "in_blacklist"]))
      );

      if (anyHasSignal) {
        is_blacklisted = matches.some((m: any) => isBlacklistedRow(m));
      } else {
        // Sinyal yoksa (sheet sadece uyarı listesi satırları döndürüyorsa) -> eşleşme blacklist sayılır
        is_blacklisted = true;
      }
    }

    const match = matches.length > 0 ? normalizeMatch(matches[0]) : undefined;

    return NextResponse.json({
      ok: true,
      is_blacklisted,
      match,
      matches_count: matches.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}