import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

function pickRows(r: any) {
  const direct = Array.isArray(r?.rows) ? r.rows : null;
  if (direct) return direct;

  const dataRows = Array.isArray(r?.data?.rows) ? r.data.rows : null;
  if (dataRows) return dataRows;

  const dataArr = Array.isArray(r?.data) ? r.data : null;
  if (dataArr) return dataArr;

  const resultRows = Array.isArray(r?.result?.rows) ? r.result.rows : null;
  if (resultRows) return resultRows;

  return [];
}

function s(v: any) {
  return String(v ?? "").trim();
}

export async function GET() {
  try {
    const r = await gsCall<any>("sms.log.list", {});
    if (!r?.ok) return NextResponse.json({ error: r?.error || "error" }, { status: 400 });

    const rows = pickRows(r);

    // row sırası zaten "append" olduğu için en son görülen kaydı kazanan yapıyoruz
    const byReservationNo: Record<
      string,
      {
        created_at: string;
        status: string;
        mode: string;
        sender_id: string;
        customer_phone: string;
      }
    > = {};

    for (const row of rows) {
      const reservation_no = s(row?.reservation_no);
      if (!reservation_no) continue;

      byReservationNo[reservation_no] = {
        created_at: s(row?.created_at),
        status: s(row?.status),
        mode: s(row?.mode),
        sender_id: s(row?.sender_id),
        customer_phone: s(row?.customer_phone),
      };
    }

    return NextResponse.json(
      { by_reservation_no: byReservationNo },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
