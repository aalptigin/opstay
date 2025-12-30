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
        "border-white/5 text-white/70 hover:text-white hover:border-white/20",
        indent && "ml-3"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 -z-10 rounded-xl bg-[#0ea5ff] border border-[#38bdf8]"
          style={{ boxShadow: "0 0 0 1px rgba(56,189,248,0.35)" }}
          transition={{ duration: 0.2, ease }}
        />
      )}
      <span className={cx("relative z-10", active && "text-[#020617] font-medium")}>
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
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold tracking-[0.12em] uppercase text-white/60"
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
      {/* SOL MENÜ */}
      <aside className="w-64 border-r border-white/10 bg-black/30 flex flex-col">
        {/* Başlık */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-sm font-semibold">OPSSTAY PANEL</div>
          <div className="mt-1 text-[11px] text-white/60">
            Misafir ön kontrol alanı
          </div>
        </div>

        {/* Gruplar */}
        <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto text-sm">
          {/* Rezervasyon */}
          <Section
            title="Rezervasyon"
            open={openRez}
            onToggle={() => setOpenRez((v) => !v)}
          >
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
              href="/panel"
              label="Rezervasyon Kayıtları"
              active={pathname === "/panel"}
            />
          </Section>

          {/* Kara Liste */}
          <Section
            title="Kara Liste"
            open={openBlacklist}
            onToggle={() => setOpenBlacklist((v) => !v)}
          >
            <NavItem
              href="/panel/kayit/ekle"
              label="Kara Liste'ye Aktar"
              active={pathname === "/panel/kayit/ekle"}
            />
            <NavItem
              href="/panel/kayitlar"
              label="Kayıtlar"
              active={pathname === "/panel/kayitlar"}
            />
            <NavItem
              href="/panel/talepler"
              label="Talepler"
              active={pathname === "/panel/talepler"}
            />
          </Section>

          {/* İstatistikler */}
          <Section
            title="İstatistikler"
            open={openStats}
            onToggle={() => setOpenStats((v) => !v)}
          >
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
              <div className="text-sm font-semibold text-white">
                {me.full_name}
              </div>
              <div className="text-white/60">
                {me.restaurant_name} ·{" "}
                {me.role === "manager" ? "Müdür" : "Personel"}
              </div>
              <div className="text-[11px] text-white/40">{me.email}</div>
            </div>
          ) : (
            <div className="mb-3 text-xs text-white/40">
              Oturum bulunamadı.
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
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
