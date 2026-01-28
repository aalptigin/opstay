import type { Metadata } from "next";
import PricingHero from "@/components/pricing/PricingHero";
import PricingGrid from "@/components/pricing/PricingGrid";
import PricingCompare from "@/components/pricing/PricingCompare";
import PricingTimeline from "@/components/pricing/PricingTimeline";
import PricingFooterCTA from "@/components/pricing/PricingFooterCTA";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Fiyatlandırma - OpsStay | Profesyonel Rezervasyon ve Müşteri Yönetimi",
  description:
    "OpsStay fiyatlandırma paketleri. Basic, Premium ve Enterprise planları ile rezervasyon yönetimi, müşteri puanlama ve Google yorum yönlendirme özelliklerine sahip olun.",
  keywords: [
    "restoran rezervasyon fiyat",
    "müşteri yönetim sistemi",
    "opsstay pricing",
    "rezervasyon yazılımı fiyat",
  ],
  openGraph: {
    title: "Fiyatlandırma - OpsStay",
    description:
      "OpsStay ile rezervasyon sadece başlangıç. Müşteri deneyimini, memnuniyeti ve sadakati tek panelden yönetin.",
    type: "website",
    locale: "tr_TR",
  },
};

function AmbientMotionLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full blur-3xl opacity-40 animate-pulse"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(14,165,255,0.5), rgba(14,165,255,0) 60%)",
        }}
      />
      <div
        className="absolute top-32 -right-28 h-[440px] w-[440px] rounded-full blur-3xl opacity-35 animate-pulse"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.4), rgba(59,130,246,0) 60%)",
          animationDelay: "1s",
        }}
      />
    </div>
  );
}

function NavBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-gradient-to-b from-[#050a16]/98 to-[#050a16]/85 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/20">
        <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_12px_40px_rgba(14,165,255,.35),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-white/20 transition-transform hover:scale-105">
              <Image
                src="/images/opsstay-logo.jpeg"
                alt="OpsStay"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </span>
            <div className="leading-tight">
              <div className="text-white font-bold tracking-tight text-sm transition-colors group-hover:text-[#0ea5ff]">
                OpsStay
              </div>
              <div className="text-[10px] text-white/60 font-medium">
                Müşteri Ön Kontrol & Güvenli İşletme
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link
              href="/cozumler"
              className="hover:text-white transition-all relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#0ea5ff] after:transition-all hover:after:w-full"
            >
              Çözümler
            </Link>
            <Link
              href="/hakkimizda"
              className="hover:text-white transition-all relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#0ea5ff] after:transition-all hover:after:w-full"
            >
              Hakkımızda
            </Link>
            <Link
              href="/pricing"
              className="text-[#0ea5ff] relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#0ea5ff]"
            >
              Fiyatlandırma
            </Link>
          </div>
          <Link
            href="/panel-secici"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] px-6 py-2.5 text-sm font-bold text-white hover:from-[#36b6ff] hover:to-[#0ea5ff] transition-all shadow-[0_14px_40px_rgba(14,165,255,.3)] hover:shadow-[0_18px_50px_rgba(14,165,255,.4)] hover:scale-105 active:scale-95"
          >
            Giriş Yap
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050a16]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-white/40">
            © 2026 OpsStay. Tüm hakları saklıdır.
          </div>
          <div className="flex gap-8 text-sm font-medium text-white/60">
            <Link href="/" className="hover:text-white transition">
              Ana Sayfa
            </Link>
            <Link href="/cozumler" className="hover:text-white transition">
              Çözümler
            </Link>
            <Link href="/hakkimizda" className="hover:text-white transition">
              Hakkımızda
            </Link>
            <Link href="/gizlilik" className="hover:text-white transition">
              Gizlilik Politikası
            </Link>
          </div>
          <div className="text-xs text-white/40">
            Müşteri Ön Kontrol & Güvenli İşletme
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#050a16] text-white relative isolate overflow-hidden">
      <AmbientMotionLayer />
      <NavBar />

      <div className="pt-16">
        <PricingHero />
        <PricingGrid />
        <PricingTimeline />
        <PricingCompare />
        <PricingFooterCTA />
      </div>

      <Footer />
    </main>
  );
}