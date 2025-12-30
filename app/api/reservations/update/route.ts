import { NextRequest, NextResponse } from "next/server";

// ✅ Cloudflare Pages / Edge için zorunlu
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: process.env.GOOGLE_SCRIPT_TOKEN,
        action: "reservations.update",
        payload: {
          actor_email: body.actor_email, // normalde session’dan geliyor olmalı
          reservation_id: body.reservation_id,
          restaurant: body.restaurant,
          restaurant_name: body.restaurant, // GS tarafında da işine yarar
          reservation_no: body.reservation_no,
          table_no: body.table_no,
          date: body.date,
          time: body.time,
          customer_full_name: body.customer_full_name,
          full_name: body.customer_full_name,
          customer_phone: body.customer_phone,
          phone: body.customer_phone,
          note: body.note,
          customer_note: body.note,
        },
      }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message ?? "unknown error" },
      { status: 500 },
    );
  }
}
