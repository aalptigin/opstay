"use client";
import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
const ease = [0.22, 1, 0.36, 1] as const;
// İSTEK: soldaki baloncuk kapalı
const SHOW_FLOATING_MINUS = false;
// İSTEK: senaryo görsellerinin altındaki caption kapalı
const SHOW_SCENARIO_CAPTION = false;
function AmbientMotionLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full blur-3xl opacity-40"
        animate={{ y: [0, -14, 0], opacity: [0.28, 0.55, 0.28] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(14,165,255,0.5), rgba(14,165,255,0) 60%)",
        }}
      />
      <motion.div
        aria-hidden
        className="absolute top-32 -right-28 h-[440px] w-[440px] rounded-full blur-3xl opacity-35"
        animate={{ x: [0, 14, 0], opacity: [0.22, 0.5, 0.22] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.4), rgba(59,130,246,0) 60%)",
        }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-220px] left-[20%] h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
        animate={{ y: [0, 18, 0], opacity: [0.18, 0.35, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(2,132,199,0.35), rgba(2,132,199,0) 62%)",
        }}
      />
    </div>
  );
}
function Reveal({
  children,
  className = "",
  delay = 0,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & Omit<HTMLMotionProps<"section">, "children">) {
  return (
    <motion.section
      {...rest}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.section>
  );
}
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-[11px] font-medium tracking-[0.25em] text-white/90 shadow-lg shadow-black/10">
      {children}
    </span>
  );
}
function LogoMark() {
  return (
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
  );
}
function NavBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="bg-gradient-to-b from-[#050a16]/98 to-[#050a16]/85 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/20">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <LogoMark />
            <div className="leading-tight">
              <div className="text-white font-bold tracking-tight text-sm transition-colors group-hover:text-[#0ea5ff]">
                OpsStay
              </div>
              <div className="text-[10px] text-white/60 font-medium">
                Müşteri Ön Kontrol &amp; Güvenli İşletme
              </div>
            </div>
          </div>
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
              className="hover:text-white transition-all relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#0ea5ff] after:transition-all hover:after:w-full"
            >
              Fiyatlandırma
            </Link>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] px-6 py-2.5 text-sm font-bold text-white hover:from-[#36b6ff] hover:to-[#0ea5ff] transition-all shadow-[0_14px_40px_rgba(14,165,255,.3)] hover:shadow-[0_18px_50px_rgba(14,165,255,.4)] hover:scale-105 active:scale-95"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
function FloatingMinus() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Yukarı çık"
      className="fixed left-5 top-24 z-40 h-12 w-12 rounded-full bg-[#071127]/90 border border-white/15 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,.4)] hover:bg-[#071127] hover:scale-110 hover:border-white/25 transition-all active:scale-95"
    >
      <div className="mx-auto h-[2px] w-5 rounded-full bg-white/85" />
    </button>
  );
}
function Trio() {
  return (
    <div className="mx-auto mt-12 max-w-6xl px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-8">
        <motion.div
          className="md:mt-8"
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-black/10 shadow-[0_20px_50px_rgba(10,16,32,.24)] hover:shadow-[0_25px_60px_rgba(10,16,32,.35)] transition-all">
            <Image
              src="/images/tri-1.jpg"
              alt=""
              width={900}
              height={650}
              className="h-[190px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
        >
          <div className="group relative overflow-hidden rounded-3xl border border-black/10 shadow-[0_25px_60px_rgba(10,16,32,.28)] hover:shadow-[0_30px_70px_rgba(10,16,32,.4)] transition-all">
            <Image
              src="/images/tri-2.jpg"
              alt=""
              width={1200}
              height={900}
              className="h-[250px] md:h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
        <motion.div
          className="md:mt-8"
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-black/10 shadow-[0_20px_50px_rgba(10,16,32,.24)] hover:shadow-[0_25px_60px_rgba(10,16,32,.35)] transition-all">
            <Image
              src="/images/tri-3.jpg"
              alt=""
              width={900}
              height={650}
              className="h-[190px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
function InfoCards() {
  return (
    <div className="mx-auto mt-12 max-w-6xl px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div>
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#e8f4ff] to-[#dbeeff] px-5 py-1.5 text-xs font-semibold text-[#0b66c3] border border-[#cfe9ff] shadow-sm">
            OpsStay hakkında
          </span>
          <h3 className="mt-6 text-3xl lg:text-4xl font-extrabold leading-tight text-[#0b1326] tracking-tight">
            OpsStay, misafir yolculuğuna{" "}
            <span className="bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] bg-clip-text text-transparent">
              ön kontrol katmanı
            </span>{" "}
            ekler.
          </h3>
          <p className="mt-5 text-base text-[#0b1326]/75 leading-relaxed">
            Günümüz konaklama işletmelerinde misafir bilgisi; farklı sistemlere dağılmış,
            tutarsız ve çoğu zaman operasyon ekibinin elinde yeterince hazırlanmış halde.
            OpsStay, bu dağınık yapıyı tek bir kurumsal görüşe çevirir.
          </p>
          <p className="mt-4 text-base text-[#0b1326]/75 leading-relaxed">
            Amacımız; resepsiyon, güvenlik, F&amp;B ve yönetim ekiplerine misafir daha
            otele gelmeden önce "Bu misafir bizim için ne ifade ediyor?" sorusunun
            cevabını sade ve anlaşılır bir dille sunmak.
          </p>
        </div>
        <div className="space-y-6">
          <motion.div
            className="rounded-2xl border border-[#d9eeff] bg-gradient-to-br from-white to-[#f7fbff] shadow-[0_10px_30px_rgba(10,16,32,.10)] hover:shadow-[0_15px_40px_rgba(10,16,32,.15)] p-6 transition-all"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="font-bold text-lg text-[#0b1326] mb-1">Neleri önemsiyoruz?</div>
            <ul className="mt-4 space-y-3 text-sm text-[#0b1326]/75 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>KVKK uyumu ve bilginin gizliliği</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>Departmanlar arası ortak ve sade bir dil</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>Operasyon ekibine gerçek anlamda zaman kazandırmak</span>
              </li>
            </ul>
          </motion.div>
          <motion.div
            className="rounded-2xl border border-[#d9eeff] bg-gradient-to-br from-white to-[#f7fbff] shadow-[0_10px_30px_rgba(10,16,32,.10)] hover:shadow-[0_15px_40px_rgba(10,16,32,.15)] p-6 transition-all"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="font-bold text-lg text-[#0b1326] mb-1">Nasıl sonuçlar hedefliyoruz?</div>
            <ul className="mt-4 space-y-3 text-sm text-[#0b1326]/75 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>Misafir ön kontrolünde yüksek zaman tasarrufu</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>Daha öngörülebilir check-in süreçleri</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>"Check edildi, sorun beklenmez" diyebildiğiniz kurumsal bir çerçeve</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
function ScenarioRow({
  tag,
  titleOnImage,
  caption,
  image,
  heading,
  body,
  bullets,
  quote,
}: {
  tag: string;
  titleOnImage: string;
  caption: string;
  image: string;
  heading: string;
  body: string;
  bullets: string[];
  quote: string;
}) {
  const showCaption = SHOW_SCENARIO_CAPTION && caption.trim().length > 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[540px_1fr] gap-12 items-start">
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-black/10 shadow-[0_25px_60px_rgba(10,16,32,.20)] hover:shadow-[0_30px_70px_rgba(10,16,32,.28)] transition-all group"
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
      >
        <Image
          src={image}
          alt=""
          width={1200}
          height={800}
          className="h-[260px] md:h-[300px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/0" />
        <div className="absolute left-5 top-5">
          <span className="inline-flex items-center rounded-full bg-black/50 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-white/95 border border-white/20 shadow-lg">
            {tag}
          </span>
        </div>
        <div className="absolute left-5 top-16 right-5">
          <div className="text-white font-extrabold text-2xl leading-tight drop-shadow-2xl">
            {titleOnImage}
          </div>
        </div>
        {showCaption ? (
          <div className="absolute left-5 bottom-5 right-5 text-xs text-white/80 backdrop-blur-sm bg-black/20 p-3 rounded-lg">
            {caption}
          </div>
        ) : null}
      </motion.div>
      <div>
        <h4 className="text-2xl md:text-3xl font-extrabold text-[#0b1326] leading-tight tracking-tight">
          {heading}
        </h4>
        <p className="mt-3 text-base text-[#0b1326]/75 leading-relaxed">{body}</p>
        <ul className="mt-6 space-y-3 text-sm text-[#0b1326]/75">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3.5 items-start">
              <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] flex-shrink-0 shadow-sm" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-l-3 border-[#0ea5ff] bg-gradient-to-r from-[#e8f4ff]/50 to-transparent pl-5 pr-4 py-3 text-sm italic text-[#0b66c3]/90 rounded-r-lg">
          "{quote}"
        </div>
      </div>
    </div>
  );
}
function ContactSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      // E-postayı backend'e gönder
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };
  return (
    <section id="iletisim" className="bg-[#0a1020]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,.4)] p-10 hover:border-white/20 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-white/75 text-sm font-medium">Talepleriniz için iletişime geçin.</div>
              <div className="mt-7">
                <a
                  className="block text-white text-lg font-bold hover:text-[#0ea5ff] transition-colors"
                  href="mailto:info@opsstay.com"
                >
                  info@opsstay.com
                </a>
              </div>
              <div className="mt-12 flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 border border-white/15 overflow-hidden backdrop-blur-sm hover:bg-white/20 transition-all">
                  <Image
                    src="/images/opsstay-logo.jpeg"
                    alt="OpsStay"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </span>
                <div>
                  <div className="text-white font-bold tracking-tight">OpsStay</div>
                  <div className="text-xs text-white/60 font-medium">
                    Müşteri Ön Kontrol &amp; Güvenli İşletme
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Riskleri azaltın, verinizi koruyun
              </h3>
              <p className="mt-3 text-sm text-white/75 leading-relaxed">
                Güncellemelerden ve yeni özelliklerden haberdar olmak için e-posta adresinizi bırakın.
              </p>
              {/* E-posta Kayıt Formu */}
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    required
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#0ea5ff]/50 focus:ring-2 focus:ring-[#0ea5ff]/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="rounded-xl bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] px-7 py-3.5 text-sm font-bold text-white hover:from-[#36b6ff] hover:to-[#0ea5ff] transition-all shadow-[0_14px_40px_rgba(14,165,255,.3)] hover:shadow-[0_18px_50px_rgba(14,165,255,.4)] hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Gönderiliyor..." : "Kayıt Ol"}
                  </button>
                </div>
                {status === "success" && (
                  <p className="mt-3 text-sm text-green-400">Başarıyla kaydoldunuz!</p>
                )}
                {status === "error" && (
                  <p className="mt-3 text-sm text-red-400">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                )}
              </form>
              <div className="mt-6">
                <a
                  href="mailto:info@opsstay.com?subject=Opsstay%20İletişim"
                  className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/15 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all"
                >
                  Doğrudan İletişime Geç
                </a>
              </div>
            </div>
          </div>
          {/* Footer Links */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Sol: Copyright */}
              <div className="text-sm text-white/60">
                © 2026 OpsStay. Tüm hakları saklıdır.
              </div>
              {/* Orta: Linkler */}
              <div className="flex items-center gap-6 text-sm">
                <a href="#cozumler" className="text-white/60 hover:text-white transition">
                  Çözümler
                </a>
                <a href="#hakkimizda" className="text-white/60 hover:text-white transition">
                  Hakkımızda
                </a>
                <Link href="/gizlilik" className="text-white/60 hover:text-white transition">
                  Gizlilik Politikası
                </Link>
              </div>
              {/* Sağ: Slogan */}
              <div className="text-xs text-white/40">
                Müşteri Ön Kontrol &amp; Güvenli İşletme
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen bg-[#f7fbff]">
      {/* Sürekli framer motion ambient layer */}
      <AmbientMotionLayer />
      <NavBar />
      {SHOW_FLOATING_MINUS ? <FloatingMinus /> : null}
      {/* HERO */}
      <section className="relative pt-16">
        <div className="relative h-[540px] md:h-[620px] w-full overflow-hidden">
          <Image src="/images/hero.jpg" alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_25%,rgba(0,0,0,.60),rgba(0,0,0,.20),rgba(0,0,0,0))]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 top-0">
            <div className="mx-auto max-w-6xl px-6">
              <div className="pt-20 md:pt-24 max-w-2xl">
                <Pill>KVKK UYUMLU ÖN KONTROL</Pill>
                <motion.h1
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease }}
                  className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white tracking-tight"
                >
                  Kişisel veri yok,
                  <br />
                  tam kontrol sizde.
                  <br />
                  Otel karar verir, sistem bilgilendirir.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease, delay: 0.1 }}
                  className="mt-5 text-base md:text-lg text-white/90 leading-relaxed max-w-xl"
                >
                  OpsStay, misafir geçmişini anonim ve kurumsal bir dile çevirerek yalnızca operasyon için gerekli özeti sunar.
                  Risk uyarısı gelir, son kararı her zaman işletme yönetimi verir.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease, delay: 0.2 }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <a
                    href="#cozumler"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] px-7 py-3 text-sm font-bold text-white hover:from-[#36b6ff] hover:to-[#0ea5ff] transition-all shadow-[0_14px_40px_rgba(14,165,255,.3)] hover:shadow-[0_18px_50px_rgba(14,165,255,.4)] hover:scale-105 active:scale-95"
                  >
                    OpsStay'i keşfedin
                  </a>
                  <a
                    href="#hakkimizda"
                    className="inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm px-7 py-3 text-sm font-bold text-[#0b1326] hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    Hakkımızda
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Çözümler */}
      <Reveal id="cozumler" className="bg-[#eef6ff] pb-20 pt-16">
        <Trio />
        <div className="mt-14">
          <div className="mx-auto max-w-4xl text-center px-6">
            <div className="text-[11px] tracking-[0.35em] text-[#0ea5ff] font-bold">
              TEK BAKIŞTA ÖN KONTROL ÇERÇEVESİ
            </div>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0b1326] leading-tight tracking-tight">
              Her misafir için aynı standart,{" "}
              <span className="bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] bg-clip-text text-transparent">
                her karar için aynı güven.
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-[#0b1326]/75 leading-relaxed max-w-3xl mx-auto">
              OpsStay, kişisel veri paylaşmadan misafir yolculuğuna dair kritik bilgileri tek ekranda toplar. Operasyon ekibi
              farklı sistemlere dağılmış notların peşinden koşmaz; net bir çerçeve üzerinden tutarlı karar alır.
            </p>
          </div>
        </div>
      </Reveal>
      {/* Hakkımızda */}
      <Reveal id="hakkimizda" className="bg-[#f7fbff] py-20">
        <InfoCards />
      </Reveal>
      {/* Akış */}
      <Reveal id="akıs" className="bg-[#f7fbff] pb-24 pt-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-[#e8f4ff] to-[#dbeeff] px-5 py-1.5 text-xs font-semibold text-[#0b66c3] border border-[#cfe9ff] shadow-sm">
            OpsStay sahada nasıl görünür?
          </div>
          <h3 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0b1326] leading-tight tracking-tight max-w-4xl">
            Ekranda sadece bir panel değil,{" "}
            <span className="bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] bg-clip-text text-transparent">
              tüm ekibinize net bir çerçeve
            </span>{" "}
            sunar.
          </h3>
          <p className="mt-4 max-w-3xl text-base text-[#0b1326]/75 leading-relaxed">
            Aşağı kaydırdıkça; resepsiyon, güvenlik, F&amp;B ve yönetim ekiplerinin OpsStay ile nasıl çalıştığını göreceksiniz.
            Her senaryo, scroll ile akış halinde anlatılır.
          </p>
          <div className="mt-14 space-y-14">
            <ScenarioRow
              tag="Ön büro ekibi"
              titleOnImage="Resepsiyon / Ön Büro"
              caption=""
              image="/images/scenario-1.jpg"
              heading="Kişisel veri yok, tam kontrol sizde."
              body="Misafir otele gelmeden önce geçmişi anonim ve kurumsal bir dille özetlenir. Check-in anı daha öngörülebilir hale gelir."
              bullets={[
                "Rezervasyon açıldığı anda ön kontrol süreci tetiklenir.",
                "Ekip, karmaşık veriler yerine sade bir değerlendirme görür.",
                "Operasyon, misafir gelmeden hazır olur.",
              ]}
              quote="Misafir gelmeden önce net bir özet görmek, resepsiyon ekibinin tonunu tamamen değiştiriyor."
            />
            <ScenarioRow
              tag="Güvenlik ekibi"
              titleOnImage="Güvenlik / Gece Operasyonu"
              caption=""
              image="/images/scenario-2.jpg"
              heading="Gece vardiyasında sürpriz değil, öngörü var."
              body="Gece ekibi için özet görünür; olağan dışı durumlar kurumsal bir ifade ile işaretlenir. Refleksle değil, bilgiyle hareket edilir."
              bullets={[
                "Olası riskli durumlar kişisel veri olmadan işaretlenir.",
                "Güvenlik ve resepsiyon aynı dilde konuşur.",
                "Notlar tek bir çerçevede toplanır.",
              ]}
              quote="Gece ekibi artık 'ne geliyor' sorusunu beklemeden yanıtlıyor."
            />
            <ScenarioRow
              tag="Restoran & bar"
              titleOnImage="F&B / Servis Ekibi"
              caption=""
              image="/images/scenario-3.jpg"
              heading="Masaya oturmadan önce beklentiyi bilirsiniz."
              body="OpsStay, deneyimi ilk temastan önce hazırlayabilmeniz için operasyonel olarak gerekli özeti sunar."
              bullets={[
                "Tercihler ve hassasiyetler özetlenir.",
                "Ekip daha tutarlı bir deneyim sunar.",
                "Marka algısı güçlenir.",
              ]}
              quote="Misafir daha sipariş vermeden neyi sevdiğini bilmek servisin kalitesini ciddi etkiliyor."
            />
            <ScenarioRow
              tag="İşletme yönetimi"
              titleOnImage="Yönetim / Operasyon"
              caption=""
              image="/images/scenario-4.jpg"
              heading="Masa numarasından değil, ilişki değerinden bakarsınız."
              body="Müşteriler tek tek olaylar yerine bütün deneyimleriyle izlenir. Stratejik kararlar daha net bir çerçeve ile desteklenir."
              bullets={[
                "Operasyonel riskler ve değerli müşteriler ayrışır.",
                "Departman notları standart dile oturur.",
                "Yönetim büyük resme bakar.",
              ]}
              quote="OpsStay, müşterilerimizi sadece 'masa' değil, 'ilişki' olarak görmemizi sağladı."
            />
          </div>
          <div className="mt-14 flex items-center justify-between text-xs text-[#0b1326]/50 flex-wrap gap-4">
            <span>© 2026 OpsStay. Tüm hakları saklıdır.</span>
            <span>OpsStay yalnızca operasyon doğrulaması üretir.</span>
          </div>
        </div>
      </Reveal>
      {/* İletişim */}
      <Reveal className="bg-[#0a1020]">
        <ContactSection />
      </Reveal>
    </main>
  );
}