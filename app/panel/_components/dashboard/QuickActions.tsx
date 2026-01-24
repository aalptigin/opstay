"use client";

import Link from "next/link";

export default function QuickActions() {
    return (
        <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 z-50 pointer-events-none">
            <div className="mx-auto max-w-3xl flex items-center justify-center gap-2 pointer-events-auto">
                <Link
                    href="/panel/rezervasyon"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#0ea5ff] px-6 py-3 text-sm font-bold text-[#06121f] shadow-[0_8px_20px_rgba(14,165,255,.3)] hover:transform hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(14,165,255,.4)] transition-all"
                >
                    <span>+</span> Rezervasyon Oluştur
                </Link>
                <Link
                    href="/panel/rezervasyon/duzenle"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#060c15]/80 backdrop-blur-xl px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-white/10 transition-colors"
                >
                    Düzenle
                </Link>
                <Link
                    href="/panel/kayit/yeni"
                    className="hidden sm:flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#060c15]/80 backdrop-blur-xl px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-white/10 transition-colors"
                >
                    Uyarıya Ekle
                </Link>
            </div>
        </div>
    );
}
