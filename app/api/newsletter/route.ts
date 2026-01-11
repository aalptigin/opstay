import { NextResponse } from "next/server";
import { gsCall } from "@/lib/gs-gateway";
export const runtime = "edge";
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function fmtDateTimeTR() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return { date, time };
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    // Validasyon
    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gerekli." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }
    const { date, time } = fmtDateTimeTR();
    // Google Sheets'e kaydet
    const r = await gsCall("newsletter.add", {
      email,
      date,
      time,
      source: "website",
    });
    if (!r.ok) {
      // Eğer zaten kayıtlıysa da başarılı say
      if (r.error?.includes("already") || r.error?.includes("exists") || r.error?.includes("duplicate")) {
        return NextResponse.json({ ok: true, message: "Zaten kayıtlısınız." });
      }
      return NextResponse.json({ error: r.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, message: "Başarıyla kaydoldunuz!" });
  } catch (e: any) {
    console.error("Newsletter API Error:", e);
    return NextResponse.json({ error: e?.message || "Bir hata oluştu." }, { status: 500 });
  }
}
export async function GET() {
  // Newsletter listesini çekme (sadece yöneticiler için)
  try {
    const r = await gsCall<any[]>("newsletter.list", {});
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    const rows = Array.isArray(r.data) ? r.data : [];
    return NextResponse.json({ rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}