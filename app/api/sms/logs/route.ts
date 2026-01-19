import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";

export const runtime = "edge";

function pickRows(r: any) {
  // Olası dönüşler:
  // 1) { ok:true, rows:[...] }
  // 2) { ok:true, data:{ rows:[...] } }
  // 3) { ok:true, data:[...] }
  // 4) { ok:true, result:{ rows:[...] } } (nadiren)
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

export async function GET() {
  try {
    const r = await gsCall<any>("sms.log.list", {});
    if (!r?.ok) return NextResponse.json({ error: r?.error || "error" }, { status: 400 });

    const rows = pickRows(r);

    return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
