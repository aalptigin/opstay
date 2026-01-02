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
    const sv = s(v);
    if (sv !== "") return v;
  }
  return "";
}

function normPhone(v: any) {
  return String(v ?? "").replace(/[^\d+]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // id / no (fallback)
    const reservation_id = s(pick(body, ["reservation_id", "resarvation_id", "id"]));
    const reservation_no = s(pick(body, ["reservation_no", "reservation_n0", "rez_no"]));

    // ✅ En güvenlisi: gateway'e ikisini de gönder (id yoksa id=rez_no gibi davran)
    const effective_id = reservation_id || reservation_no;

    if (!effective_id) {
      return NextResponse.json(
        { ok: false, error: "Güncelleme için reservation_id veya reservation_no zorunlu." },
        { status: 400 }
      );
    }

    const restaurant = s(pick(body, ["restaurant", "restaurant_name"]));
    const table_no = s(pick(body, ["table_no", "table_n0", "masa_no"]));
    const date = s(pick(body, ["date", "gun_ay_yil"]));
    const time = s(pick(body, ["time", "saat"]));
    const customer_full_name = s(pick(body, ["customer_full_name", "full_name"]));
    const customer_phone = normPhone(pick(body, ["customer_phone", "phone"]));
    const note = s(pick(body, ["note", "customer_note"]));

    // Kids alanları (varsa)
    const kids_u7 = s(pick(body, ["kids_u7", "child_u7", "children_u7"]));

    // ✅ Apps Script action ismi sizde "reservations.update" olmalı
    // Eğer sizde farklı ise (ör. "reservations.edit"), aşağıdaki action'ı o isimle değiştirin.
    const r = await gsCall<any>("reservations.update", {
      reservation_id: effective_id,
      reservation_no: reservation_no || undefined,

      restaurant,
      restaurant_name: restaurant,

      table_no,
      date,
      time,

      customer_full_name,
      customer_phone,

      note,

      // çocuk sayısı (her iki restoran için de gönderilebilir)
      kids_u7: kids_u7 || undefined,
      child_u7: kids_u7 || undefined,

      // legacy uyumluluk (bazı eski akışlar bunları kullanır)
      full_name: customer_full_name || undefined,
      phone: customer_phone || undefined,
      datetime: date && time ? `${date}T${time}:00` : undefined,
    });

    if (!r?.ok) {
      return NextResponse.json(
        { ok: false, error: s(r?.error) || "Gateway update başarısız." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // ✅ 500'ün gerçek sebebini client'a sade şekilde döndür
    return NextResponse.json(
      { ok: false, error: s(e?.message) || "Update route error" },
      { status: 500 }
    );
  }
}
