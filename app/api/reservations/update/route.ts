import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(process.env.GS_GATEWAY_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: process.env.OPSSTAY_API_TOKEN,
        action: "reservations.update",
        payload: {
          // actor_email opsiyonel, GS tarafı zorunlu kılmıyor
          actor_email: body.actor_email,

          reservation_id: body.reservation_id,

          restaurant: body.restaurant ?? body.restaurant_name,
          restaurant_name: body.restaurant_name ?? body.restaurant,

          reservation_no: body.reservation_no,
          table_no: body.table_no,

          date: body.date,   // "29/12/2025"
          time: body.time,   // "21:36"

          customer_full_name: body.customer_full_name ?? body.full_name,
          customer_phone: body.customer_phone ?? body.phone,

          note: body.note ?? body.customer_note,
        },
      }),
    });

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.ok ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "unexpected error" },
      { status: 500 }
    );
  }
}
