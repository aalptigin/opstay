"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Role = "manager" | "staff";
type Me = {
  user: {
    full_name: string;
    role: Role;
    restaurant_name: string;
    email: string;
  };
};

type NavItem = {
  label: string;
  href: string;
  roles?: Role[]; // boşsa herkes
};

type NavGroup = {
  id: string;
  title: string;
  items: NavItem[];
};

const ease = [0.22, 1, 0.36, 1] as const;

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

function isActive(pathname: string, href: string) {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function SideNav() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  // Me bilgisini al (role bazlı menü gizlemek için)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (j?.ok && j?.user) setMe({ user: j.user });
      } catch {
        // sessiz geç
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const groups: NavGroup[] = useMemo(() => {
    return [
      {
        id: "rezervasyon",
        title: "Rezervasyon",
        items: [
          { label: "Rezervasyon Oluştur", href: "/panel/rezervasyon" },
          { label: "Rezervasyon Düzenle", href: "/panel/rezervasyon/duzenle" },
          { label: "Rezervasyon Kayıtları", href: "/panel/rezervasyon/kayitlar" },
          { label: "SMS Logları", href: "/panel/sms-log" },
        ],
      },
      {
        id: "uyari-listesi",
        title: "Uyarı Listesi",
        items: [
          { label: "Uyarı Listesine Aktar", href: "/panel/kayit/ekle" },
          { label: "Kayıtlar", href: "/panel/kayit/kayitlar" },
          { label: "Talepler", href: "/panel/talepler", roles: ["manager"] },
        ],
      },
      {
        id: "degerlendirme",
        title: "Değerlendirme",
        items: [
          { label: "Puanlamalar", href: "/panel/ratings" },
          { label: "Geri Aramalar", href: "/panel/callbacks" },
        ],
      },
      {
        id: "istatistikler",
        title: "İstatistikler",
        items: [
          { label: "Happy Moons", href: "/panel/istatistikler/happy-moons" },
          { label: "Roof", href: "/panel/istatistikler/roof" },
        ],
      },
    ];
  }, []);

  // Aktif sayfa hangi gruptaysa o grup otomatik açık kalsın
  const defaultOpen = useMemo(() => {
    const open: Record<string, boolean> = {};
    for (const g of groups) {
      open[g.id] = g.items.some((it) => isActive(pathname, it.href));
    }
    return open;
  }, [groups, pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => ({ ...defaultOpen, ...prev }));
  }, [defaultOpen]);

  function toggleGroup(id: string) {
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  }

  const role = me?.user.role;

  return (
    <aside
      className={cx(
        "w-[280px] shrink-0 border-r border-white/10",
        "bg-gradient-to-b from-[#070b16] via-black/[0.35] to-[#020617]/70",
        "backdrop-blur-xl"
      )}
      style={{
        boxShadow:
          "inset -1px 0 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.35)",
      }}
    >
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

      <div className="p-4">
        <div
          className={cx(
            "rounded-2xl border border-white/10",
            "bg-gradient-to-b from-white/[0.08] to-white/[0.03]",
            "backdrop-blur-md px-3 py-3 relative overflow-hidden"
          )}
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(80%_120%_at_25%_0%,rgba(56,189,248,0.18),transparent_55%)]" />
          <div className="relative">
            <div className="text-sm font-semibold tracking-wide">OPSSTAY PANEL</div>
            <div className="mt-1 text-xs text-white/60">Misafir ön kontrol alanı</div>
          </div>
        </div>

        <nav className="mt-4 space-y-2 vip-scroll max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {/* Ana Sayfa Linki */}
          <Link
            href="/panel"
            className={cx(
              "block rounded-2xl px-4 py-3 text-sm font-medium transition border relative overflow-hidden mb-3",
              "focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25",
              pathname === "/panel"
                ? "text-white border-white/20 bg-gradient-to-r from-white/10 to-white/5 shadow-lg"
                : "border-white/8 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/15"
            )}
          >
            {pathname === "/panel" && (
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_30%_0%,rgba(255,255,255,0.12),transparent_60%)]" />
            )}
            <span className="relative">Operasyon Kontrol Merkezi</span>
          </Link>

          {groups.map((g) => {
            const isOpen = !!openGroups[g.id];
            return (
              <div
                key={g.id}
                className={cx(
                  "rounded-2xl border border-white/10 overflow-hidden",
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
                  onClick={() => toggleGroup(g.id)}
                  className={cx(
                    "w-full px-3 py-2 text-left text-sm font-semibold transition",
                    "hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/85">{g.title}</span>
                      {g.id === "degerlendirme" && (
                        <span className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className={cx("text-white/60 transition", isOpen && "rotate-180")}>▾</span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-2">
                        {g.items
                          .filter((it) => !it.roles || (role ? it.roles.includes(role) : true))
                          .map((it) => {
                            const active = isActive(pathname, it.href);
                            return (
                              <Link
                                key={it.href}
                                href={it.href}
                                className={cx(
                                  "block rounded-xl px-3 py-2 text-sm transition border relative overflow-hidden",
                                  "focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/25",
                                  active
                                    ? "text-[#020617] font-semibold border-white/20 bg-gradient-to-r from-[#0ea5ff] to-[#22d3ee]"
                                    : "border-transparent text-white/80 hover:bg-white/5 hover:text-white"
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
                                {active ? (
                                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_30%_0%,rgba(255,255,255,0.18),transparent_60%)]" />
                                ) : null}
                                <span className="relative">{it.label}</span>
                              </Link>
                            );
                          })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div
          className={cx(
            "mt-4 rounded-2xl border border-white/10",
            "bg-gradient-to-b from-white/[0.06] to-black/[0.30]",
            "backdrop-blur-md p-3"
          )}
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.22)",
          }}
        >
          <div className="text-xs text-white/60">
            {me?.user?.role ? (
              <>
                <div className="font-semibold text-white">
                  {me.user.role === "manager" ? "Manager" : "Staff"} • {me.user.restaurant_name}
                </div>
                <div className="mt-1">{me.user.full_name}</div>
              </>
            ) : (
              "Oturum bilgisi alınıyor..."
            )}
          </div>

          <form action="/api/auth/logout" method="post" className="mt-3">
            <button
              type="submit"
              className={cx(
                "w-full rounded-xl border px-3 py-2 text-sm transition",
                "border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.03]",
                "text-white/85 hover:from-white/[0.12] hover:to-white/[0.05]"
              )}
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.20)",
              }}
            >
              Çıkış yap
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
