"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.trim().length >= 4;
  }, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Giriş başarısız. Bilgileri kontrol edin.");
        return;
      }

      // ✅ COOKIE'nin kesin oturması için: tam sayfa yönlendirme
      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") || "/panel";
      window.location.href = nextPath;
    } catch (err: any) {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const reduceMotion = useReducedMotion();

  const slides = [
    "/images/login-slides/slide-1.jpg",
    "/images/login-slides/slide-2.jpg",
    "/images/login-slides/slide-3.jpg",
    "/images/login-slides/slide-4.jpg",
  ];

  // Kesintisiz akış için iki kez kopyala
  const track = [...slides, ...slides];

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      {/* Arka plan: tam ekran akan görsel akışı + mevcut gradient overlay */}
      <div className="pointer-events-none fixed inset-0">
        {/* FULLSCREEN MARQUEE */}
        {!reduceMotion && (
          <motion.div
            className="absolute inset-0 flex"
            style={{ width: "200%", willChange: "transform" }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {track.map((src, i) => (
              <div key={`bg-${i}`} className="relative h-full w-1/8">
                {/* w-1/8: 8 öğe (4+4) => her biri ekranda dengeli akar */}
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={i < 2}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Reduce motion: sabit arka plan */}
        {reduceMotion && (
          <div className="absolute inset-0">
            <Image
              src={slides[0]}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Mevcut ışık efektin (korundu) */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_20%,rgba(14,165,255,0.18),transparent_55%),radial-gradient(1000px_500px_at_80%_10%,rgba(36,99,235,0.16),transparent_50%),radial-gradient(900px_500px_at_60%_90%,rgba(59,130,246,0.12),transparent_55%)]" />
        {/* Okunabilirlik için koyu katman (korundu) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,11,20,0.6),rgba(5,11,20,0.92))]" />
      </div>

      {/* Üst bar */}
      <header className="relative z-10 px-6 md:px-10 py-6 flex items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
            <span className="text-sm font-extrabold text-white">O</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">OpsStay</div>
            <div className="text-[11px] text-white/55">Yetkili Girişi</div>
          </div>
        </Link>

        <Link href="/" className="text-sm text-white/70 hover:text-white transition">
          Ana sayfaya dön
        </Link>
      </header>

      {/* Form */}
      <section className="relative z-10 px-6 md:px-10 pb-12">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block"
          >
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">
              YETKİLİ ERİŞİM
            </div>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight">
              Panel erişimi için güvenli giriş
            </h1>
            <p className="mt-4 text-white/65 text-sm leading-relaxed max-w-md">
              Operasyon süreçleri için yetkilendirilmiş kullanıcılar bu alandan panele erişir.
              Güvenlik ve oturum doğrulaması otomatik yürütülür.
            </p>

            <div className="mt-8 grid gap-3 max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Kurumsal doğrulama</div>
                <div className="text-sm text-white/60 mt-1">
                  Oturum açıldıktan sonra rol bazlı erişim uygulanır.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Hızlı ve tutarlı akış</div>
                <div className="text-sm text-white/60 mt-1">
                  Giriş sonrası yönlendirme otomatik yapılır.
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full"
          >
            <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-7">
              <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">
                GİRİŞ
              </div>
              <h2 className="mt-2 text-2xl font-extrabold">Yetkili Paneli</h2>
              <p className="mt-2 text-sm text-white/60">
                E-posta ve şifreniz ile devam edin.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-white/60">E-posta</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                    placeholder="ornek@firma.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
                >
                  {loading ? "Giriş yapılıyor..." : "Panele giriş yapın"}
                </button>

                <div className="text-xs text-white/45 leading-relaxed">
                  Giriş yaptığınızda rol ve yetki doğrulaması otomatik uygulanır.
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 px-6 md:px-10 pb-10">
        <div className="max-w-5xl mx-auto text-xs text-white/35">
          © {new Date().getFullYear()} OpsStay
        </div>
      </footer>
    </main>
  );
}
