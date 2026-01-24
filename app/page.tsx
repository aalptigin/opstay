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
                İtibar &amp; Müşteri Deneyimi Koruma Platformu
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
        <motion.div whileHover={{ y: -10, transition: { duration: 0.3 } }}>
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
            Ürün konumlandırma
          </span>
          <h3 className="mt-6 text-3xl lg:text-4xl font-extrabold leading-tight text-[#0b1326] tracking-tight">
            OpsStay, restoranlar için{" "}
            <span className="bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] bg-clip-text text-transparent">
              İtibar ve Müşteri Deneyimi Koruma Platformu
            </span>{" "}
            olarak tasarlanır.
          </h3>
          <p className="mt-5 text-base text-[#0b1326]/75 leading-relaxed">
            Rezervasyon sonrası bilgilendirme, müşteri puanlama, Google yorum dönüşümü, olumsuz deneyim geri kazanımı,
            CRM yönetimi, restoran bazlı uyarı listesi ve kampanya bildirimi tek bir akışta birleşir.
          </p>
          <p className="mt-4 text-base text-[#0b1326]/75 leading-relaxed">
            Yönetim paneli; müşteri ilişkileri ekibinin ve görevli personelin sahada kullanabileceği kadar hızlı, net ve
            pratik olacak şekilde kurgulanır. Amaç: doğru aksiyonu, doğru anda, minimum tıklamayla almak.
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
                <span>Restoran bazlı izolasyon: Uyarı verisi yalnızca ilgili şubede görünür.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>Ölçülebilir fayda: tıklama, dönüşüm, kampanya performansı ve aksiyon raporları.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>Mobile-first: hızlı açılış, okunabilirlik ve minimum işlem adımı.</span>
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
                <span>Olumlu deneyimi Google yorumuna dönüştürme oranında artış.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>Olumsuz deneyimi erken yakalayıp telafi ile itibar kaybını azaltma.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0ea5ff] flex-shrink-0" />
                <span>CRM segmentasyon + kampanyalarla doluluk ve gelir artırma.</span>
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

/* ----------------------------- NEW UI BLOCKS ----------------------------- */

function PhoneFrame({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[290px]">
      <div className="text-center">
        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-[#e8f4ff] to-[#dbeeff] px-4 py-1.5 text-[11px] font-semibold text-[#0b66c3] border border-[#cfe9ff] shadow-sm">
          {title}
        </div>
      </div>

      <div className="mt-5 relative rounded-[34px] bg-[#0b1326] p-[10px] shadow-[0_30px_90px_rgba(10,16,32,.22)] ring-1 ring-black/10">
        <div className="absolute left-1/2 top-[10px] -translate-x-1/2 h-5 w-28 rounded-full bg-black/50" />
        <div className="rounded-[26px] bg-white overflow-hidden">
          <div className="h-10 bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] flex items-center justify-between px-4">
            <div className="text-white text-xs font-bold">OpsStay Asistan</div>
            <div className="text-white/90 text-[11px] font-semibold">İletişim</div>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function StarRow({ value = 4 }: { value?: number }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center justify-center gap-1.5">
      {stars.map((s) => (
        <span
          key={s}
          className={[
            "text-lg leading-none",
            s <= value ? "text-[#f59e0b]" : "text-[#cbd5e1]",
          ].join(" ")}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function TechnicalWorkingPrinciple() {
  return (
    <section className="bg-[#f7fbff] pb-24 pt-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="text-[11px] tracking-[0.35em] text-[#0ea5ff] font-bold">
            TEKNİK ÇALIŞMA PRENSİBİ
          </div>
          <h3 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0b1326] tracking-tight">
            Rezervasyon → Puanlama → Akıllı Aksiyon
          </h3>
          <p className="mt-4 text-base md:text-lg text-[#0b1326]/75 leading-relaxed max-w-3xl mx-auto">
            Rezervasyon oluştuğunda otomatik bilgilendirme gider. Çıkışta puan toplanır. Skora göre ya Google yorum linki
            ile dönüşüm yapılır ya da geri kazanım görevi açılır ve itibar kaybı büyümeden müdahale edilir.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div>
            <PhoneFrame title="ADIM 1: Otomatik Bilgilendirme (SMS/WhatsApp)">
              <div className="rounded-2xl border border-[#e6eef7] bg-gradient-to-br from-white to-[#f7fbff] p-4 shadow-sm">
                <div className="text-xs font-bold text-[#0b1326]">
                  Rezervasyon Onayı
                </div>
                <div className="mt-2 text-[12px] text-[#0b1326]/80 leading-relaxed">
                  Merhaba <b>Ahmet Bey</b>, rezervasyonunuz onaylandı.
                  <br />
                  <span className="font-semibold">Tarih:</span> 23.01.2026 &nbsp; <span className="font-semibold">Saat:</span> 19:30
                  <br />
                  <span className="font-semibold">Şube:</span> Happy Moons &nbsp; <span className="font-semibold">Kişi:</span> 4
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#e8f4ff] px-3 py-1 text-[11px] font-semibold text-[#0b66c3]">
                    Konuma Git
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold text-[#334155]">
                    Düzenle / İptal
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#e6eef7] bg-white p-4 shadow-sm">
                <div className="text-xs font-bold text-[#0b1326]">
                  Çıkışta 1 tıkla puanlayın
                </div>
                <div className="mt-2 text-[12px] text-[#0b1326]/75">
                  Deneyiminiz nasıldı?
                </div>
                <div className="mt-3">
                  <StarRow value={5} />
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] px-5 py-2 text-xs font-bold text-white">
                    Puanla
                  </span>
                </div>
              </div>
            </PhoneFrame>

            <div className="mt-6 text-center">
              <div className="font-extrabold text-[#0b1326]">
                Rezervasyon Sonrası Akış
              </div>
              <p className="mt-2 text-sm text-[#0b1326]/70 leading-relaxed">
                Konum linki, rezervasyon detayları ve opsiyonel değişiklik/iptal bağlantısı tek akışta gider.
                Şube bazında şablon + saat planlaması + dil seçimi ile özelleştirilebilir.
              </p>
            </div>
          </div>

          <div>
            <PhoneFrame title="ADIM 2: Puan Toplama (API + Web)">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-[#e8f4ff] to-[#dbeeff] border border-[#cfe9ff] grid place-items-center shadow-sm">
                  <span className="text-[#0b66c3] font-extrabold text-lg">HM</span>
                </div>
                <div className="mt-5 text-lg font-extrabold text-[#0b1326]">
                  Happy Moons
                </div>
                <div className="mt-1 text-[12px] text-[#0b1326]/70">
                  Hizmet kalitemizi artırmamıza yardımcı edin.
                </div>

                <div className="mt-6">
                  <StarRow value={4} />
                  <div className="mt-1 text-[11px] text-[#0b1326]/60">
                    1 (kötü) — 5 (harika)
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#e6eef7] bg-white p-4 text-left shadow-sm">
                  <div className="text-xs font-bold text-[#0b1326]">
                    Deneyiminizi anlatın
                  </div>
                  <div className="mt-2 h-20 rounded-xl border border-[#e6eef7] bg-[#f8fafc] p-3 text-[12px] text-[#0b1326]/60">
                    Kısa bir not yazın...
                  </div>
                  <div className="mt-4">
                    <div className="w-full rounded-xl bg-[#0b1326] px-4 py-3 text-center text-sm font-extrabold text-white">
                      Puanı Gönder
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-[#0b1326]/60">
                  Puan ve notlar; zaman damgası, şube ve (varsa) servis bilgisiyle sisteme işlenir.
                </div>
              </div>
            </PhoneFrame>

            <div className="mt-6 text-center">
              <div className="font-extrabold text-[#0b1326]">“Çıkarken Puanla” Entegrasyonu</div>
              <p className="mt-2 text-sm text-[#0b1326]/70 leading-relaxed">
                Cihaz/servisten API ile skor alınır. CRM segmentasyonu için işlenir ve otomatik aksiyonlar tetiklenir:
                olumlu → Google yorum, olumsuz → geri kazanım görevi.
              </p>
            </div>
          </div>

          <div>
            <PhoneFrame title="ADIM 3: Akıllı Yönlendirme (Dönüşüm / Geri Kazanım)">
              <div className="rounded-2xl border border-[#e6eef7] bg-gradient-to-br from-white to-[#f7fbff] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-[#0b1326]/60">
                      OPERASYON MERKEZİ
                    </div>
                    <div className="text-lg font-extrabold text-[#0b1326]">Canlı Akış</div>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-[#0b1326] text-white grid place-items-center text-sm font-black">
                    !
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#e6eef7] bg-white p-3">
                    <div className="text-[11px] text-[#0b1326]/60 font-semibold">Bekleyen</div>
                    <div className="mt-1 text-xl font-extrabold text-[#0b1326]">3</div>
                  </div>
                  <div className="rounded-2xl border border-[#e6eef7] bg-white p-3">
                    <div className="text-[11px] text-[#0b1326]/60 font-semibold">Ortalama</div>
                    <div className="mt-1 text-xl font-extrabold text-[#0b1326]">4.9</div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-[#e6eef7] bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-[#0b1326]">
                          Ayşe K.
                        </div>
                        <div className="mt-1 text-[12px] text-[#0b1326]/70">
                          Skor: <span className="font-bold text-[#16a34a]">5.0</span> · Otomatik dönüşüm
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-[#e8f4ff] px-3 py-1 text-[11px] font-semibold text-[#0b66c3]">
                        Google’a Yönlendirildi
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#fee2e2] bg-[#fff7f7] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-[#0b1326]">
                          Burak Y.
                        </div>
                        <div className="mt-1 text-[12px] text-[#0b1326]/70">
                          Skor: <span className="font-bold text-[#dc2626]">2.0</span> · “Servis yavaştı”
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-[#dc2626] px-3 py-1 text-[11px] font-semibold text-white">
                        Acil Müdahale
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#dc2626] px-3 py-2 text-[12px] font-extrabold text-white">
                        Hemen Ara
                      </span>
                      <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-3 py-2 text-[12px] font-extrabold text-[#0b1326] border border-[#e6eef7]">
                        İncele
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#e6eef7] bg-white p-4">
                  <div className="text-xs font-bold text-[#0b1326]">Yönlendirme Mantığı</div>
                  <div className="mt-2 text-[12px] text-[#0b1326]/75 leading-relaxed">
                    <span className="font-extrabold text-[#16a34a]">Skor ≥ 4</span> → Google Yorum Linki (doğru şube)
                    <br />
                    <span className="font-extrabold text-[#dc2626]">Skor &lt; 4</span> → Geri kazanım görevi + arama sonucu CRM’e işlenir
                  </div>
                </div>
              </div>
            </PhoneFrame>

            <div className="mt-6 text-center">
              <div className="font-extrabold text-[#0b1326]">İtibar Koruma Akışı</div>
              <p className="mt-2 text-sm text-[#0b1326]/70 leading-relaxed">
                Olumlu deneyim ölçülür ve Google yoruma dönüşür. Olumsuz deneyimde görev açılır, neden kategorisi ve aksiyon CRM’e işlenir;
                tekrar eden olumsuzluklarda uyarı seviyesi yükselir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ variant }: { variant: "star" | "shield" | "users" | "alert" | "megaphone" | "mobile" }) {
  const base = "h-10 w-10 rounded-2xl grid place-items-center border shadow-sm";
  const map: Record<string, { bg: string; fg: string; glyph: string }> = {
    star: { bg: "bg-[#fff7ed] border-[#fed7aa]", fg: "text-[#9a3412]", glyph: "★" },
    shield: { bg: "bg-[#ecfeff] border-[#a5f3fc]", fg: "text-[#0e7490]", glyph: "🛡" },
    users: { bg: "bg-[#eef2ff] border-[#c7d2fe]", fg: "text-[#3730a3]", glyph: "👥" },
    alert: { bg: "bg-[#fff1f2] border-[#fecdd3]", fg: "text-[#9f1239]", glyph: "⚠" },
    megaphone: { bg: "bg-[#f0fdf4] border-[#bbf7d0]", fg: "text-[#166534]", glyph: "📣" },
    mobile: { bg: "bg-[#f8fafc] border-[#e2e8f0]", fg: "text-[#0b1326]", glyph: "📱" },
  };
  const cfg = map[variant];
  return (
    <div className={[base, cfg.bg].join(" ")}>
      <div className={["text-lg", cfg.fg].join(" ")} aria-hidden>
        {cfg.glyph}
      </div>
    </div>
  );
}

function FeatureCard({
  badge,
  title,
  body,
  icon,
}: {
  badge: string;
  title: string;
  body: string;
  icon: "star" | "shield" | "users" | "alert" | "megaphone" | "mobile";
}) {
  return (
    <motion.div
      className="rounded-2xl border border-[#e6eef7] bg-white shadow-[0_10px_30px_rgba(10,16,32,.08)] hover:shadow-[0_15px_40px_rgba(10,16,32,.12)] transition-all p-6"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between gap-4">
        <FeatureIcon variant={icon} />
        <span className="inline-flex items-center rounded-full border border-[#e6eef7] bg-[#f7fbff] px-3 py-1 text-[11px] font-semibold text-[#0b1326]/70">
          {badge}
        </span>
      </div>
      <div className="mt-4 text-lg font-extrabold text-[#0b1326]">{title}</div>
      <p className="mt-2 text-sm text-[#0b1326]/70 leading-relaxed">{body}</p>
    </motion.div>
  );
}

function CorporateSolutions() {
  return (
    <section className="bg-[#f7fbff] pb-24 pt-2">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="text-[11px] tracking-[0.35em] text-[#0ea5ff] font-bold">
            KURUMSAL ÇÖZÜMLER
          </div>
          <h3 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0b1326] tracking-tight">
            Uçtan uca itibar koruma akışı
          </h3>
          <p className="mt-4 text-base md:text-lg text-[#0b1326]/75 leading-relaxed max-w-3xl mx-auto">
            Otomatik bilgilendirme, puanlama entegrasyonu, Google yorum dönüşümü, geri kazanım araması, restoran bazlı uyarı listesi
            izolasyonu, CRM ve kampanya yönetimi tek panelde birleşir.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="star"
            badge="Smart Redirect"
            title="Google Yorum Dönüşümü"
            body="Eşik üstü skorda otomatik mesaj + doğru şube Google linki (place_id). Tıklama ve dönüşüm ölçümü ile performansı yönetin."
          />
          <FeatureCard
            icon="shield"
            badge="Real-time Alerts"
            title="Kriz Önleme Kalkanı"
            body="Olumsuz deneyimi sosyal medyaya düşmeden yakalayın. Operasyon panelinde görev açın; hızlı telafi ile itibar kaybını azaltın."
          />
          <FeatureCard
            icon="users"
            badge="Timeline CRM"
            title="CRM & Segmentasyon"
            body="Rezervasyon + skor + görev + notlar tek profilde. VIP/düzenli/hassas/riskli segmentleri üretin ve hedefleyin."
          />
          <FeatureCard
            icon="alert"
            badge="Restaurant Isolation"
            title="Restoran Bazlı Uyarı"
            body="Uyarı listesi her restoran için izole çalışır. Rezervasyon sırasında otomatik kontrol yapılır; uyarı UI’da net görünür."
          />
          <FeatureCard
            icon="megaphone"
            badge="Scheduling + Reporting"
            title="Akıllı Kampanya"
            body="Segment → mesaj şablonu → zamanlama → gönderim → raporlama. Uyarı segmentini dahil/hariç tutma kuralı desteklenir."
          />
          <FeatureCard
            icon="mobile"
            badge="Mobile-first"
            title="Operasyon Paneli"
            body="Personelin sahada kullanacağı hızda. Minimum tıklama, okunabilirlik, hızlı aksiyon; görev ve uyarılar tek ekranda."
          />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- END NEW UI BLOCKS ----------------------------- */

function ContactSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
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
                    İtibar &amp; Müşteri Deneyimi Koruma Platformu
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                İtibarınızı koruyun, deneyimi ölçün
              </h3>
              <p className="mt-3 text-sm text-white/75 leading-relaxed">
                Yeni özellikler, entegrasyonlar ve ürün güncellemeleri için e-posta adresinizi bırakın.
              </p>
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
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-sm text-white/60">© 2026 OpsStay. Tüm hakları saklıdır.</div>
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
              <div className="text-xs text-white/40">İtibar &amp; Müşteri Deneyimi Koruma Platformu</div>
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
                <Pill>İTİBAR &amp; MÜŞTERİ DENEYİMİ KORUMA</Pill>
                <motion.h1
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease }}
                  className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white tracking-tight"
                >
                  Olumlu deneyimi
                  <br />
                  Google yoruma dönüştürün.
                  <br />
                  Olumsuzu erken yakalayıp telafi edin.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease, delay: 0.1 }}
                  className="mt-5 text-base md:text-lg text-white/90 leading-relaxed max-w-xl"
                >
                  OpsStay; rezervasyon sonrası bilgilendirme, puanlama, Google yorum dönüşümü, geri kazanım araması,
                  restoran bazlı uyarı listesi ve CRM/kampanya yönetimini tek akışta birleştirir.
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
                    href="#iletisim"
                    className="inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm px-7 py-3 text-sm font-bold text-[#0b1326] hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    İletişime Geçin
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
              UÇTAN UCA İTİBAR KORUMA AKIŞI
            </div>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0b1326] leading-tight tracking-tight">
              Her şube için aynı standart,{" "}
              <span className="bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] bg-clip-text text-transparent">
                her aksiyon için ölçülebilir sonuç.
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-[#0b1326]/75 leading-relaxed max-w-3xl mx-auto">
              Rezervasyon sonrası mesajlar, puanlama, yorum dönüşümü ve geri kazanım; tek panelde yönetilir.
              Müşteri deneyimi ölçülür, itibar korunur, ekip doğru anda doğru adımı atar.
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
              şubenizin itibar akışı
            </span>{" "}
            görünür.
          </h3>
          <p className="mt-4 max-w-3xl text-base text-[#0b1326]/75 leading-relaxed">
            Hostes/rezervasyon ekibi, servis ve yönetim aynı çerçevede çalışır: bilgilendirme → puanlama → dönüşüm / geri kazanım.
            Her senaryo, scroll ile akış halinde anlatılır.
          </p>

          <div className="mt-14 space-y-14">
            <ScenarioRow
              tag="Rezervasyon ekibi"
              titleOnImage="Hostes / Rezervasyon"
              caption=""
              image="/images/scenario-1.jpg"
              heading="Rezervasyon sonrası otomatik bilgilendirme."
              body="Rezervasyon oluşturulduğunda konum, onay bilgisi ve opsiyonel değişiklik/iptal bağlantısı otomatik gider. Şube bazında şablon ve zamanlama yönetilir."
              bullets={[
                "Template + saat planlaması + dil seçimi ile şube bazlı yönetim.",
                "Harita linki ve rezervasyon detayı tek mesajda.",
                "Misafir yolculuğu daha düzenli ve ölçülebilir hale gelir.",
              ]}
              quote="Mesajlar otomatik gidince ekip aynı işi tekrar tekrar yapmıyor; odağımız hizmete kayıyor."
            />
            <ScenarioRow
              tag="Müşteri ilişkileri"
              titleOnImage="Geri Kazanım / Çağrı"
              caption=""
              image="/images/scenario-2.jpg"
              heading="Olumsuz deneyimi erken yakalayın ve telafi edin."
              body="Skor eşik altındaysa görev açılır: “Müşteriyi ara, olumsuz olan nedir?” Sebep kategorisi, notlar ve aksiyon CRM’e işlenir."
              bullets={[
                "Düşük skor → otomatik görev + önceliklendirme.",
                "Arama sonucu CRM zaman çizelgesinde saklanır.",
                "Tekrarlayan olumsuzluklarda uyarı seviyesi yükselir.",
              ]}
              quote="Sorun büyümeden aramak, hem itibar hem sadakat tarafında fark yaratıyor."
            />
            <ScenarioRow
              tag="Servis ekibi"
              titleOnImage="Servis / Operasyon"
              caption=""
              image="/images/scenario-3.jpg"
              heading="Deneyimi ölçün, aksiyonu standardize edin."
              body="Puan ve yorumlar tek yerde toplanır. Operasyon ekibi, canlı akıştan hangi misafire hangi aksiyonun gerektiğini anında görür."
              bullets={[
                "Puanlama API veya web form üzerinden anlık toplanır.",
                "Olumlu deneyim → Google yoruma tek tık yönlendirme.",
                "Raporlama ile ekip performansı ve süreç kalitesi izlenir.",
              ]}
              quote="Aksiyon netleşince servis tarafında ‘ne yapacağız’ sorusu ortadan kalkıyor."
            />
            <ScenarioRow
              tag="Yönetim"
              titleOnImage="CRM / Kampanya"
              caption=""
              image="/images/scenario-4.jpg"
              heading="CRM ile ilişkiyi sistematik yönetin."
              body="Rezervasyon geçmişi + puanlar + görevler + notlarla müşteri profili oluşur. Segment bazlı kampanyalarla doluluk ve gelir artırılır."
              bullets={[
                "VIP/düzenli/hassas/riskli segmentasyon.",
                "Kampanya planlama → gönderim → dönüşüm raporu.",
                "Restoran bazlı uyarı listesi izolasyonu ile güvenli kullanım.",
              ]}
              quote="Artık yalnızca gün kurtarmıyoruz; müşteri ilişkisini yönetiyoruz."
            />
          </div>

          <div className="mt-14 flex items-center justify-between text-xs text-[#0b1326]/50 flex-wrap gap-4">
            <span>© 2026 OpsStay. Tüm hakları saklıdır.</span>
            <span>OpsStay, itibar ve deneyim akışını uçtan uca yönetir.</span>
          </div>
        </div>
      </Reveal>

      {/* NEW: Teknik Çalışma Prensibi */}
      <Reveal id="teknik" className="bg-[#f7fbff]">
        <TechnicalWorkingPrinciple />
      </Reveal>

      {/* NEW: Kurumsal Çözümler */}
      <Reveal id="moduller" className="bg-[#f7fbff]">
        <CorporateSolutions />
      </Reveal>

      {/* İletişim */}
      <Reveal className="bg-[#0a1020]">
        <ContactSection />
      </Reveal>
    </main>
  );
}
