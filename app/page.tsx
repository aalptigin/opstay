"use client";

import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

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
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-[0.25em] text-white/85">
      {children}
    </span>
  );
}

function LogoMark() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0ea5ff] text-[#061021] shadow-[0_12px_30px_rgba(14,165,255,.35)]">
      <span className="text-sm font-black">O</span>
    </span>
  );
}

function NavBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="bg-gradient-to-b from-[#050a16]/95 to-[#050a16]/70 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-tight">
              <div className="text-white font-semibold tracking-tight">opsstay</div>
              <div className="text-[11px] text-white/55">Misafir Ön Kontrol &amp; Güvenli Konaklama</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/75">
            <a href="#cozumler" className="hover:text-white transition">Çözümler</a>
            <a href="#hakkimizda" className="hover:text-white transition">Hakkımızda</a>
            <a href="#akıs" className="hover:text-white transition">Neler yapabiliriz</a>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-[#0ea5ff] px-5 py-2 text-sm font-semibold text-[#061021] hover:bg-[#36b6ff] transition shadow-[0_14px_40px_rgba(14,165,255,.25)]"
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
      className="fixed left-5 top-24 z-40 h-11 w-11 rounded-full bg-[#071127]/85 border border-white/10 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,.35)] hover:bg-[#071127] transition"
    >
      <div className="mx-auto h-[2px] w-4 rounded-full bg-white/80" />
    </button>
  );
}

function Trio() {
  return (
    <div className="mx-auto mt-10 max-w-6xl px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-7">
        <div className="md:mt-6">
          <div className="relative overflow-hidden rounded-2xl border border-black/5 shadow-[0_20px_50px_rgba(10,16,32,.22)]">
            <Image src="/images/tri-1.jpg" alt="" width={900} height={650} className="h-[180px] w-full object-cover" />
          </div>
        </div>

        <div>
          <div className="relative overflow-hidden rounded-3xl border border-black/5 shadow-[0_25px_60px_rgba(10,16,32,.25)]">
            <Image src="/images/tri-2.jpg" alt="" width={1200} height={900} className="h-[240px] md:h-[270px] w-full object-cover" />
          </div>
        </div>

        <div className="md:mt-6">
          <div className="relative overflow-hidden rounded-2xl border border-black/5 shadow-[0_20px_50px_rgba(10,16,32,.22)]">
            <Image src="/images/tri-3.jpg" alt="" width={900} height={650} className="h-[180px] w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCards() {
  return (
    <div className="mx-auto mt-10 max-w-6xl px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <span className="inline-flex items-center rounded-full bg-[#e8f4ff] px-4 py-1 text-xs text-[#0b66c3] border border-[#cfe9ff]">
            Opsstay hakkında
          </span>

          <h3 className="mt-5 text-3xl font-extrabold leading-tight text-[#0b1326]">
            Opsstay, misafir yolculuğuna <span className="text-[#0ea5ff]">ön kontrol katmanı</span> ekler.
          </h3>

          <p className="mt-4 text-[#0b1326]/70 leading-relaxed">
            Günümüz konaklama işletmelerinde misafir bilgisi; farklı sistemlere dağılmış, tutarsız ve çoğu zaman operasyon ekibinin
            elinde yeterince hazırlanmış halde. Opsstay, bu dağınık yapıyı tek bir kurumsal görüşe çevirir.
          </p>
          <p className="mt-4 text-[#0b1326]/70 leading-relaxed">
            Amacımız; resepsiyon, güvenlik, F&amp;B ve yönetim ekiplerine misafir daha otele gelmeden önce
            “Bu misafir bizim için ne ifade ediyor?” sorusunun cevabını sade ve anlaşılır bir dille sunmak.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#d9eeff] bg-white/80 shadow-[0_10px_30px_rgba(10,16,32,.08)] p-5">
            <div className="font-semibold text-[#0b1326]">Neleri önemsiyoruz?</div>
            <ul className="mt-3 space-y-2 text-sm text-[#0b1326]/70">
              <li>• KVKK uyumu ve bilginin gizliliği</li>
              <li>• Departmanlar arası ortak ve sade bir dil</li>
              <li>• Operasyon ekibine gerçek anlamda zaman kazandırmak</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#d9eeff] bg-white/80 shadow-[0_10px_30px_rgba(10,16,32,.08)] p-5">
            <div className="font-semibold text-[#0b1326]">Nasıl sonuçlar hedefliyoruz?</div>
            <ul className="mt-3 space-y-2 text-sm text-[#0b1326]/70">
              <li>• Misafir ön kontrolünde yüksek zaman tasarrufu</li>
              <li>• Daha öngörülebilir check-in süreçleri</li>
              <li>• “Check edildi, sorun beklenmez” diyebildiğiniz kurumsal bir çerçeve</li>
            </ul>
          </div>
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10 items-start">
      <div className="relative overflow-hidden rounded-3xl border border-black/5 shadow-[0_25px_60px_rgba(10,16,32,.18)]">
        <Image src={image} alt="" width={1200} height={800} className="h-[250px] md:h-[280px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-xs text-white/90 border border-white/15">
            {tag}
          </span>
        </div>
        <div className="absolute left-4 top-14">
          <div className="text-white font-bold text-xl leading-tight">{titleOnImage}</div>
        </div>
        <div className="absolute left-4 bottom-4 right-4 text-xs text-white/75">{caption}</div>
      </div>

      <div>
        <h4 className="text-xl md:text-2xl font-extrabold text-[#0b1326]">{heading}</h4>
        <p className="mt-2 text-sm md:text-base text-[#0b1326]/70">{body}</p>

        <ul className="mt-5 space-y-2 text-sm text-[#0b1326]/75">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#0ea5ff]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-l-2 border-[#cfe9ff] pl-4 text-sm italic text-[#0b66c3]/80">
          “{quote}”
        </div>
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <section id="iletisim" className="bg-[#0a1020]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,.35)] p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Sol: sadece istenenler */}
            <div>
              <div className="text-white/70 text-sm">Talepleriniz için iletişime geçin.</div>

              <div className="mt-6">
                <a
                  className="block text-white font-semibold hover:text-white/90 transition"
                  href="mailto:info@opsstay.com"
                >
                  info@opsstay.com
                </a>
              </div>

              <div className="mt-10 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 border border-white/10">
                  <span className="text-white text-lg">✦</span>
                </span>
                <div>
                  <div className="text-white font-semibold tracking-tight">OPSSTAY</div>
                  <div className="text-xs text-white/55">Misafir Ön Kontrol &amp; Güvenli Konaklama</div>
                </div>
              </div>
            </div>

            {/* Sağ: sadece istenenler */}
            <div>
              <h3 className="text-3xl font-extrabold text-white leading-tight">Riskleri azaltın, verinizi koruyun</h3>
              <p className="mt-2 text-sm text-white/70">
                Entegrasyonlardan geri kalmamak için güncellemelerden ve yeni akışlardan haberdar olun.
              </p>

              <div className="mt-6">
                <a
                  href="mailto:info@opsstay.com?subject=Opsstay%20İletişim"
                  className="inline-flex items-center justify-center rounded-xl bg-[#0ea5ff] px-6 py-3 text-sm font-semibold text-[#061021] hover:bg-[#36b6ff] transition"
                >
                  İletişime geç
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/55">
            Tüm hakları saklıdır © 2025
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7fbff]">
      <NavBar />
      <FloatingMinus />

      {/* HERO — saydam/gri blok YOK: görsel net görünsün */}
      <section className="relative pt-14">
        <div className="relative h-[520px] md:h-[600px] w-full overflow-hidden">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          {/* Sadece okunabilirlik için hafif vignette; görüntüyü boğmaz */}
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_25%,rgba(0,0,0,.55),rgba(0,0,0,.15),rgba(0,0,0,0))]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 top-0">
            <div className="mx-auto max-w-6xl px-6">
              <div className="pt-16 md:pt-20 max-w-2xl">
                <Pill>KVKK UYUMLU ÖN KONTROL</Pill>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease }}
                  className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight text-white"
                >
                  Kişisel veri yok,
                  <br />
                  tam kontrol sizde.
                  <br />
                  Otel karar verir, sistem bilgilendirir.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease, delay: 0.08 }}
                  className="mt-4 text-sm md:text-base text-white/85"
                >
                  Opsstay, misafir geçmişini anonim ve kurumsal bir dile çevirerek yalnızca operasyon için gerekli özeti sunar.
                  Risk uyarısı gelir, son kararı her zaman işletme yönetimi verir.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease, delay: 0.16 }}
                  className="mt-6 flex flex-wrap gap-3"
                >
                  <a
                    href="#cozumler"
                    className="inline-flex items-center justify-center rounded-full bg-[#0ea5ff] px-5 py-2.5 text-sm font-semibold text-[#061021] hover:bg-[#36b6ff] transition shadow-[0_14px_40px_rgba(14,165,255,.25)]"
                  >
                    Opsstay’i keşfedin
                  </a>
                  <a
                    href="#akıs"
                    className="inline-flex items-center justify-center rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-[#0b1326] hover:bg-white transition"
                  >
                    Çözüm detaylarını inceleyin
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Çözümler — akışlı reveal */}
      <Reveal id="cozumler" className="bg-[#eef6ff] pb-16 pt-12">
        <Trio />

        <div className="mt-10">
          <div className="mx-auto max-w-4xl text-center px-6">
            <div className="text-[11px] tracking-[0.35em] text-[#0ea5ff] font-semibold">
              TEK BAKIŞTA ÖN KONTROL ÇERÇEVESİ
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[#0b1326] leading-tight">
              Her misafir için aynı standart, <span className="text-[#0ea5ff]">her karar için aynı güven.</span>
            </h2>
            <p className="mt-4 text-sm md:text-base text-[#0b1326]/70">
              Opsstay, kişisel veri paylaşmadan misafir yolculuğuna dair kritik bilgileri tek ekranda toplar. Operasyon ekibi
              farklı sistemlere dağılmış notların peşinden koşmaz; net bir çerçeve üzerinden tutarlı karar alır.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Hakkımızda */}
      <Reveal id="hakkimizda" className="bg-[#f7fbff] py-16">
        <InfoCards />
      </Reveal>

      {/* Akış */}
      <Reveal id="akıs" className="bg-[#f7fbff] pb-20 pt-6">
        <div className="mx-auto max-w-6xl px-6">
          <div className="inline-flex items-center rounded-full bg-[#e8f4ff] px-4 py-1 text-xs text-[#0b66c3] border border-[#cfe9ff]">
            Opsstay sahada nasıl görünür?
          </div>

          <h3 className="mt-4 text-3xl md:text-4xl font-extrabold text-[#0b1326] leading-tight">
            Ekranda sadece bir panel değil, <span className="text-[#0ea5ff]">tüm ekibinize net bir çerçeve</span> sunar.
          </h3>

          <p className="mt-3 max-w-3xl text-[#0b1326]/70">
            Aşağı kaydırdıkça; resepsiyon, güvenlik, F&amp;B ve yönetim ekiplerinin Opsstay ile nasıl çalıştığını göreceksiniz.
            Her senaryo, scroll ile akış halinde anlatılır.
          </p>

          <div className="mt-10 space-y-10">
            <ScenarioRow
              tag="Ön büro ekibi"
              titleOnImage="Resepsiyon / Ön Büro"
              caption="Görselleri kendi gerçek karelerinizle değiştirerek birebir aynı düzeni koruyabilirsiniz."
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
              caption="Görselleri kendi gerçek karelerinizle değiştirerek birebir aynı düzeni koruyabilirsiniz."
              image="/images/scenario-2.jpg"
              heading="Gece vardiyasında sürpriz değil, öngörü var."
              body="Gece ekibi için özet görünür; olağan dışı durumlar kurumsal bir ifade ile işaretlenir. Refleksle değil, bilgiyle hareket edilir."
              bullets={[
                "Olası riskli durumlar kişisel veri olmadan işaretlenir.",
                "Güvenlik ve resepsiyon aynı dilde konuşur.",
                "Notlar tek bir çerçevede toplanır.",
              ]}
              quote="Gece ekibi artık ‘ne geliyor’ sorusunu beklemeden yanıtlıyor."
            />

            <ScenarioRow
              tag="Restoran & bar"
              titleOnImage="F&B / Servis Ekibi"
              caption="Görselleri kendi gerçek karelerinizle değiştirerek birebir aynı düzeni koruyabilirsiniz."
              image="/images/scenario-3.jpg"
              heading="Masaya oturmadan önce beklentiyi bilirsiniz."
              body="Opsstay, deneyimi ilk temastan önce hazırlayabilmeniz için operasyonel olarak gerekli özeti sunar."
              bullets={[
                "Tercihler ve hassasiyetler özetlenir.",
                "Ekip daha tutarlı bir deneyim sunar.",
                "Marka algısı güçlenir.",
              ]}
              quote="Misafir daha sipariş vermeden neyi sevdiğini bilmek servisin kalitesini ciddi etkiliyor."
            />

            <ScenarioRow
              tag="Genel müdür & gelir"
              titleOnImage="Yönetim / Revenue"
              caption="Görselleri kendi gerçek karelerinizle değiştirerek birebir aynı düzeni koruyabilirsiniz."
              image="/images/scenario-4.jpg"
              heading="Oda numarasından değil, ilişki değerinden bakarsınız."
              body="Misafirler tek tek olaylar yerine bütün yolculuklarıyla izlenir. Stratejik kararlar daha net bir çerçeve ile desteklenir."
              bullets={[
                "Operasyonel riskler ve değerli segmentler ayrışır.",
                "Departman notları standart dile oturur.",
                "Yönetim büyük resme bakar.",
              ]}
              quote="Opsstay, misafirlerimizi sadece ‘oda’ değil, ‘ilişki’ olarak görmemizi sağladı."
            />
          </div>

          <div className="mt-10 flex items-center justify-between text-xs text-[#0b1326]/45">
            <span>© 2025 Opsstay. Tüm hakları saklıdır.</span>
            <span>Opsstay yalnızca operasyon doğrulaması üretir.</span>
          </div>
        </div>
      </Reveal>

      {/* İletişim — SAYFA İÇİNDE NET ŞEKİLDE VAR, LinkedIn/Dribbble YOK */}
      <Reveal className="bg-[#0a1020]">
        <ContactSection />
      </Reveal>
    </main>
  );
}
