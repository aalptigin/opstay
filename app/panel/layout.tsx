"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  indent = false,
}: {
  href: string;
  label: string;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "relative block rounded-xl px-3 py-2 text-sm transition border",
        "border-white/8 text-white/70 hover:text-white",
        "hover:border-white/20 hover:bg-white/[0.04]",
        "focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25",
        indent && "ml-3"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className={cx(
            "absolute inset-0 -z-10 rounded-xl",
            "bg-gradient-to-r from-[#0ea5ff] to-[#22d3ee]",
            "border border-white/20"
          )}
          style={{
            boxShadow:
              "0 10px 30px rgba(14,165,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.12)",
          }}
          transition={{ duration: 0.2, ease }}
        />
      )}

      {/* küçük VIP shine */}
      <span
        className={cx(
          "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity",
          "bg-[radial-gradient(70%_120%_at_30%_0%,rgba(255,255,255,0.18),transparent_60%)]",
          active ? "opacity-100" : "group-hover:opacity-100"
        )}
      />

      <span className={cx("relative z-10", active && "text-[#020617] font-semibold")}>
        {label}
      </span>
    </Link>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
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
          "inset 0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cx(
          "w-full px-4 py-3 flex items-center justify-between",
          "text-xs font-semibold tracking-[0.12em] uppercase",
          "text-white/60 hover:text-white/75 transition"
        )}
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.18, ease }}
          className="text-white/40 text-[10px]"
        >
          ▾
        </motion.span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-1 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<Me["user"] | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [openRez, setOpenRez] = useState(true);
  const [openBlacklist, setOpenBlacklist] = useState(true);
  const [openStats, setOpenStats] = useState(true);

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
      {/* VIP scrollbar + küçük premium dokunuşlar */}
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

      {/* SOL MENÜ */}
      <aside
        className={cx(
          "w-64 shrink-0 sticky top-0 h-screen border-r border-white/10 flex flex-col",
          "bg-gradient-to-b from-black/[0.55] via-black/[0.35] to-[#020617]/70",
          "backdrop-blur-xl"
        )}
        style={{
          boxShadow:
            "inset -1px 0 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Başlık */}
        <div className="px-4 py-4 border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(80%_120%_at_20%_0%,rgba(56,189,248,0.18),transparent_55%)]" />
          <div className="relative">
            <div className="text-sm font-semibold tracking-wide">OPSSTAY PANEL</div>
            <div className="mt-1 text-[11px] text-white/60">Misafir ön kontrol alanı</div>
          </div>
        </div>

        {/* Gruplar */}
        <div className="flex-1 min-h-0 px-3 py-4 space-y-4 overflow-y-auto text-sm vip-scroll">
          {/* ✅ Operasyon Kontrol Merkezi (ana sayfa) */}
          <NavItem href="/panel" label="Operasyon Kontrol Merkezi" active={pathname === "/panel"} />

          {/* Rezervasyon */}
          <Section title="Rezervasyon" open={openRez} onToggle={() => setOpenRez((v) => !v)}>
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
          </Section>

          {/* Uyarı Listesi */}
          <Section title="Uyarı Listesi" open={openBlacklist} onToggle={() => setOpenBlacklist((v) => !v)}>
            <NavItem
              href="/panel/kayit/ekle"
              label="Uyarı Listesine Aktar"
              active={pathname === "/panel/kayit/ekle"}
            />
            <NavItem href="/panel/kayitlar" label="Kayıtlar" active={pathname === "/panel/kayitlar"} />
            <NavItem href="/panel/talepler" label="Talepler" active={pathname === "/panel/talepler"} />
          </Section>

          {/* İstatistikler */}
          <Section title="İstatistikler" open={openStats} onToggle={() => setOpenStats((v) => !v)}>
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
                "inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            {loggingOut ? "Çıkış yapılıyor..." : "Çıkış yap"}
          </button>
        </div>
      </aside>

      {/* SAĞ İÇERİK */}
      <main className="flex-1 min-h-screen bg-[#020617]">{children}</main>
    </div>
  );
}
