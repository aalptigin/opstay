import { NextResponse } from "next/server";


export const runtime = "edge";


/**
* POS Masa Durumları
* - UI burayı çağırır: /api/pos/tables?restaurant=Roof&date=YYYY-MM-DD&time=HH:mm
* - Şu an STUB: hepsini "free" döndürür.
* - POS API hazır olunca:
* 1) POS endpoint'e istek at
* 2) gelen response'u { tables: { t1:"occupied", ... } } formatına çevir
*/
const ROOF_TABLE_IDS = [
...Array.from({ length: 29 }).map((_, i) => `t${i + 1}`),
...Array.from({ length: 8 }).map((_, i) => `L${i + 1}`),
...Array.from({ length: 4 }).map((_, i) => `B${i + 1}`),
];


export async function GET(req: Request) {
try {
const url = new URL(req.url);
const restaurant = String(url.searchParams.get("restaurant") || "").trim();
const date = String(url.searchParams.get("date") || "").trim();
const time = String(url.searchParams.get("time") || "").trim();


if (restaurant !== "Roof") {
return NextResponse.json(
{ ok: false, error: "Bu endpoint sadece Roof için kullanılır." },
{ status: 400 }
);
}


if (!date || !time) {
return NextResponse.json(
{ ok: false, error: "date ve time zorunludur." },
{ status: 400 }
);
}


// TODO: POS entegrasyonu burada yapılacak.
// Şimdilik tüm masaları boş dön.
const tables: Record<string, "free" | "reserved" | "occupied"> = {};
for (const id of ROOF_TABLE_IDS) tables[id] = "free";


return NextResponse.json(
{
ok: true,
restaurant,
date,
time,
tables,
updated_at: new Date().toISOString(),
mode: "stub",
},
{ headers: { "Cache-Control": "no-store" } }
);
} catch (e: any) {
return NextResponse.json(
{ ok: false, error: e?.message || "error" },
{ status: 500 }
);
}
}