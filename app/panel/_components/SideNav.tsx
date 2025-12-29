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
          // NOT: Bu sayfa yoksa (ileride) oluşturabiliriz.
          { label: "Rezervasyon Düzenle", href: "/panel/rezervasyon/duzenle" },
          { label: "Rezervasyon Kayıtları", href: "/panel/rezervasyon/kayitlar" },
        ],
      },
      {
        id: "kara-liste",
        title: "Kara Liste",
        items: [
          // Mevcutta kara liste ekleme / kayıt ekle ekranınız ayrıysa burayı ona bağlayın.
          { label: "Kara Liste'ye Aktar", href: "/panel/kayit/ekle" },
          { label: "Kayıtlar", href: "/panel/kayit/kayitlar" },
          // Talepler sadece manager görsün:
          { label: "Talepler", href: "/panel/talepler", roles: ["manager"] },
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
    // pathname değişince aktif grup açık kalsın
    setOpenGroups((prev) => ({ ...defaultOpen, ...prev }));
  }, [defaultOpen]);

  function toggleGroup(id: string) {
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  }

  const role = me?.user.role;

  return (
    <aside className="w-[280px] shrink-0 border-r border-white/10 bg-[#070b16]">
      <div className="p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="text-sm font-semibold tracking-wide">OPSSTAY PANEL</div>
          <div className="mt-1 text-xs text-white/60">Misafir ön kontrol alanı</div>
        </div>

        <nav className="mt-4 space-y-2">
          {groups.map((g) => {
            const isOpen = !!openGroups[g.id];
            return (
              <div key={g.id} className="rounded-2xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className={cx(
                    "w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold transition",
                    "hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{g.title}</span>
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
                                  "block rounded-xl px-3 py-2 text-sm transition border",
                                  active
                                    ? "bg-[#0ea5e9]/15 border-[#0ea5e9]/30 text-white"
                                    : "border-transparent text-white/80 hover:bg-white/5 hover:text-white"
                                )}
                              >
                                {it.label}
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

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Çıkış yap
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
