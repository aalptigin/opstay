"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { MeUser } from "./PanelShell";

function NavItem({ href, label }: { href: string; label: string }) {
  const p = usePathname();
  const active = p === href;
  return (
    <Link
      href={href}
      className={clsx(
        "block rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

export default function Sidebar({ me }: { me: MeUser | null }) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-72 border-r border-white/10 bg-[#061022] min-h-screen">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="font-semibold tracking-wide">opssstay-1</div>
        <div className="text-xs text-white/50 mt-1">Yetkili Panel</div>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-[11px] uppercase tracking-wider text-white/40 px-2 mt-2">Menü</div>
        <NavItem href="/panel/reservations" label="Rezervasyon" />

        <div className="text-[11px] uppercase tracking-wider text-white/40 px-2 mt-4">KAYIT</div>
        <NavItem href="/panel/records/add" label="Kayıt Ekle" />
        <NavItem href="/panel/records/delete" label="Kayıt Sil" />
        <NavItem href="/panel/records/edit" label="Kayıt Düzenle" />
        <NavItem href="/panel/records/check" label="Kayıt Kontrol" />

        <div className="text-[11px] uppercase tracking-wider text-white/40 px-2 mt-4">Talepler</div>
        <NavItem href="/panel/requests" label="Talepler" />
      </div>

      {/* Bottom user info (zorunlu) */}
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="text-xs text-white/60">
          {me ? `${me.role === "manager" ? "Manager" : "Staff"} • ${me.restaurant_name || "—"}` : "—"}
        </div>
        <div className="text-sm font-medium mt-1">{me ? me.full_name : "—"}</div>
      </div>
    </aside>
  );
}
