"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Kontrol Paneli", href: "/org-panel", icon: "📊" },
    { label: "Araç Yönetimi", href: "/org-panel/araclar", icon: "🚗" },
    { label: "Depo & Stok", href: "/org-panel/depo", icon: "📦" },
    { label: "Bakım & Arıza", href: "/org-panel/bakim", icon: "🔧" },
    { label: "Yemek Dağıtımı", href: "/org-panel/yemek", icon: "🍽️" },
    { label: "İzin Takibi", href: "/org-panel/izin", icon: "📅" },
    { label: "Eğitim", href: "/org-panel/egitim", icon: "📚" },
    { label: "Denetim Logları", href: "/org-panel/denetim", icon: "📋" },
];

export function OrgSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/org-panel") {
            return pathname === "/org-panel";
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col">
            {/* Logo / Header */}
            <div className="p-4 border-b border-slate-200">
                <Link href="/org-panel" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-white text-lg">📦</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800">OpsStay</h1>
                        <p className="text-xs text-slate-500">Organizasyon Paneli</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active
                                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : "text-slate-700 hover:bg-slate-100"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">Kullanıcı</p>
                        <p className="text-xs text-slate-400">Başkan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
