"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Role = "manager" | "staff";
type Me = {
  user: {
    full_name: string;
    role: Role;
    restaurant_name: string;
    email: string;
  };
};

const ease = [0.22, 1, 0.36, 1] as const;

function cx(...a: Array<string | false | undefined | null>) {
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
        "block rounded-xl px-3 py-2 text-sm transition border",
        indent ? "ml-3" : "",
        active
          ? "bg-[#0ea5ff]/15 text-white border-[#0ea5ff]/25"
          : "bg-transparent text-white/70 border-white/10 hover:bg-white/5 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

export default function PanelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) throw new Error("unauthorized");
        const data = (await res.json()) as Me;
        if (!alive) return;
        setMe(data);
      } catch {
        router.replace("/login");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  const nav = useMemo(() => {
    return [
      { href: "/panel/rezervasyon", label: "Rezervasyon" },
      { href: "/panel/kayit/ekle", label: "KAYIT • Kayıt Ekle", indent: true },
      { href: "/panel/kayit/sil", label: "KAYIT • Kayıt Sil", indent: true },
      { href: "/panel/kayit/duzenle", label: "KAYIT • Kayıt Düzenle", indent: true },
      { href: "/panel/kayit/kontrol", label: "KAYIT • Kayıt Kontrol", indent: true },
      { href: "/panel/talepler", label: "Talepler" },
    ];
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060a16] grid place-items-center">
        <div className="text-white/70 text-sm">Yükleniyor…</div>
      </div>
    );
  }

  return (
    // ✅ overflow-x-hidden + w-full: sağdaki beyaz şerit / yatay taşma kapanır
    <div className="min-h-screen w-full overflow-x-hidden bg-[#060a16]">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-50 border-b border-white/10 bg-[#050a16]/80 backdrop-blur-xl">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen((s) => !s)}
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
            aria-label="Menü"
          >
            ☰
          </button>
          <div className="text-white font-semibold tracking-tight">OPSSTAY PANEL</div>
          <button
            type="button"
            onClick={logout}
            className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition text-sm"
          >
            Çıkış
          </button>
        </div>
      </div>

      {/* ✅ Burada mx-auto / max-w kaldırıldı: panel tamamen sola 0’a 0 oturur */}
      <div className="w-full">
        {/* ✅ min-w-0: içerik genişleyip sağa taşmasın */}
        <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside
            className={cx(
              "lg:sticky lg:top-0 lg:h-screen border-r border-white/10 bg-gradient-to-b from-[#050a16] to-[#071127]",
              mobileOpen ? "block" : "hidden lg:block"
            )}
          >
            <div className="h-full flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0ea5ff] text-[#061021] shadow-[0_18px_55px_rgba(14,165,255,.25)]">
                  <span className="text-sm font-black">O</span>
                </span>
                <div className="leading-tight">
                  <div className="text-white font-semibold tracking-tight">OPSSTAY PANEL</div>
                  <div className="text-[12px] text-white/55">Misafir ön kontrol alanı</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {nav.map((i) => (
                  <NavItem
                    key={i.href}
                    href={i.href}
                    label={i.label}
                    indent={!!i.indent}
                    active={pathname === i.href}
                  />
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="text-white/85 font-semibold text-sm">
                  {me?.user.role === "manager" ? "Manager" : "Staff"} • {me?.user.restaurant_name}
                </div>
                <div className="text-white/55 text-sm mt-1">{me?.user.full_name}</div>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Çıkış yap
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            // ✅ min-w-0 + w-full: çocuklar taşırsa bile grid içinde kırpılır
            className="min-h-screen min-w-0 w-full"
          >
            <div className="px-5 py-6 lg:px-8 lg:py-10">{children}</div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
