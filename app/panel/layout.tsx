"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Role = "manager" | "staff";

type Me = {
  user: {
    full_name: string;
    restaurant_name: string;
    email: string;
    role: Role;
  };
};

const ease = [0.22, 1, 0.36, 1] as const;

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "relative block rounded-xl px-4 py-2.5 text-sm transition border overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25",
        active
          ? "text-[#020617] font-semibold border-white/20 bg-gradient-to-r from-[#0ea5ff] to-[#22d3ee]"
          : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
      )}
      style={
        active
          ? {
            boxShadow:
              "0 10px 30px rgba(14,165,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.12)",
          }
          : undefined
      }
    >
      {active && (
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_30%_0%,rgba(255,255,255,0.18),transparent_60%)]" />
      )}
      <span className="relative">{label}</span>
    </Link>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
  isNew = false,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isNew?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl overflow-hidden border",
        "border-white/10",
        "bg-gradient-to-b from-white/[0.06] to-black/[0.35]",
        "backdrop-blur-md"
      )}
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.22)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cx(
          "w-full px-4 py-3 flex items-center justify-between",
          "text-xs font-semibold tracking-[0.12em] uppercase",
          "text-white/85 hover:text-white transition"
        )}
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {isNew && (
            <span className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm normal-case tracking-normal">
              NEW
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.18, ease }}
          className="text-white/40 text-[10px]"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-1 border-t border-white/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<Me["user"] | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Başlangıçta tüm bölümler kapalı (görseldeki gibi)
  const [openRez, setOpenRez] = useState(false);
  const [openBlacklist, setOpenBlacklist] = useState(false);
  const [openRating, setOpenRating] = useState(false);
  const [openStats, setOpenStats] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      setLoadingMe(true);
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const d = (await r.json()) as Me;
        if (!cancelled && r.ok && d?.user) setMe(d.user);
      } catch {
        // sessiz geç
      } finally {
        if (!cancelled) setLoadingMe(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mobilde route değiştiğinde sidebar'ı kapat
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // önemli değil
    } finally {
      setLoggingOut(false);
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex bg-[#020617] text-white">
      {/* VIP scrollbar */}
      <style jsx global>{`
        .vip-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 189, 248, 0.45) rgba(255, 255, 255, 0.06);
        }
        .vip-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .vip-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
        }
        .vip-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(56, 189, 248, 0.65),
            rgba(14, 165, 255, 0.35)
          );
          border-radius: 999px;
          border: 2px solid rgba(2, 6, 23, 0.65);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        }
        .vip-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(56, 189, 248, 0.8),
            rgba(14, 165, 255, 0.5)
          );
        }
      `}</style>

      {/* HAMBURGER MENU BUTTON (mobilde görünür) */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className={cx(
          "md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl",
          "bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl",
          "border border-white/20 shadow-lg",
          "hover:from-white/15 hover:to-white/8 transition"
        )}
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)"
        }}
        aria-label="Menüyü aç"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* BACKDROP (mobilde sidebar açıkken) */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SOL MENÜ */}
      <aside
        className={cx(
          "w-64 shrink-0 h-screen border-r border-white/10 flex flex-col",
          "bg-gradient-to-b from-[#070b16] via-black/[0.35] to-[#020617]/70",
          "backdrop-blur-xl",
          // Mobil: fixed + overlay, Masaüstü: sticky
          "fixed md:sticky top-0 z-40",
          "transition-transform duration-300 ease-out",
          // Mobilde kapalıyken ekran dışında
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          boxShadow:
            "inset -1px 0 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Başlık */}
        <div className="px-4 py-4 border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(80%_120%_at_25%_0%,rgba(56,189,248,0.18),transparent_55%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold tracking-wide">OPSSTAY PANEL</div>
              <div className="mt-1 text-[11px] text-white/60">Misafir ön kontrol alanı</div>
            </div>
            {/* Close button (mobilde görünür) */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Menüyü kapat"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Gruplar */}
        <div className="flex-1 min-h-0 px-3 py-4 space-y-3 overflow-y-auto text-sm vip-scroll">
          {/* Ana Sayfa */}
          <Link
            href="/panel"
            className={cx(
              "block rounded-2xl px-4 py-3 text-sm font-medium transition border relative overflow-hidden",
              "focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25",
              pathname === "/panel"
                ? "text-white border-white/15 bg-gradient-to-r from-white/10 to-white/5 shadow-lg"
                : "border-white/8 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/12"
            )}
            style={{
              boxShadow:
                pathname === "/panel"
                  ? "inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.25)"
                  : "inset 0 0 0 1px rgba(255,255,255,0.04), 0 8px 20px rgba(0,0,0,0.20)",
            }}
          >
            {pathname === "/panel" && (
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_30%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
            )}
            <span className="relative">Operasyon Kontrol Merkezi</span>
          </Link>

          {/* Rezervasyon */}
          <Section title="REZERVASYON" open={openRez} onToggle={() => setOpenRez((v) => !v)}>
            <NavItem
              href="/panel/rezervasyon"
              label="Rezervasyon Oluştur"
              active={pathname === "/panel/rezervasyon"}
            />
            <NavItem
              href="/panel/rezervasyon/duzenle"
              label="Rezervasyon Düzenle"
              active={pathname === "/panel/rezervasyon/duzenle"}
            />
            <NavItem
              href="/panel/rezervasyon/kayitlar"
              label="Rezervasyon Kayıtları"
              active={pathname === "/panel/rezervasyon/kayitlar"}
            />
            <NavItem
              href="/panel/sms-log"
              label="SMS Logları"
              active={pathname === "/panel/sms-log"}
            />
          </Section>

          {/* Uyarı Listesi */}
          <Section title="UYARI LISTESI" open={openBlacklist} onToggle={() => setOpenBlacklist((v) => !v)}>
            <NavItem
              href="/panel/kayit/ekle"
              label="Uyarı Listesine Aktar"
              active={pathname === "/panel/kayit/ekle"}
            />
            <NavItem href="/panel/kayitlar" label="Kayıtlar" active={pathname === "/panel/kayitlar"} />
            <NavItem href="/panel/talepler" label="Talepler" active={pathname === "/panel/talepler"} />
          </Section>

          {/* Değerlendirme */}
          <Section title="DEĞERLENDİRME" open={openRating} onToggle={() => setOpenRating((v) => !v)} isNew={true}>
            <NavItem
              href="/panel/ratings"
              label="Puanlamalar"
              active={pathname === "/panel/ratings"}
            />
            <NavItem
              href="/panel/callbacks"
              label="Geri Aramalar"
              active={pathname === "/panel/callbacks"}
            />
          </Section>

          {/* İstatistikler */}
          <Section title="İSTATİSTİKLER" open={openStats} onToggle={() => setOpenStats((v) => !v)}>
            <NavItem
              href="/panel/istatistikler/happy-moons"
              label="Happy Moons"
              active={pathname === "/panel/istatistikler/happy-moons"}
            />
            <NavItem
              href="/panel/istatistikler/roof"
              label="Roof"
              active={pathname === "/panel/istatistikler/roof"}
            />
          </Section>
        </div>

        {/* Oturum bilgisi + çıkış */}
        <div className="border-t border-white/10 px-4 py-4">
          <div className="text-xs text-white/60 mb-2">Oturum bilgisi</div>

          {loadingMe ? (
            <div className="text-xs text-white/40">Oturum bilgisi alınıyor...</div>
          ) : me ? (
            <div className="mb-3 text-xs space-y-1">
              <div className="text-sm font-semibold text-white">{me.full_name}</div>
              <div className="text-white/60">
                {me.restaurant_name} · {me.role === "manager" ? "Müdür" : "Personel"}
              </div>
              <div className="text-[11px] text-white/40">{me.email}</div>
            </div>
          ) : (
            <div className="mb-3 text-xs text-white/40">Oturum bulunamadı.</div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={cx(
              "w-full rounded-xl px-3 py-2 text-sm text-white transition",
              "border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.03]",
              "hover:from-white/[0.12] hover:to-white/[0.05]",
              "disabled:opacity-60"
            )}
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.20)",
            }}
          >
            {loggingOut ? "Çıkış yapılıyor..." : "Çıkış yap"}
          </button>
        </div>
      </aside>

      {/* SAĞ İÇERİK */}
      <main className="flex-1 min-h-screen bg-[#020617] md:ml-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
