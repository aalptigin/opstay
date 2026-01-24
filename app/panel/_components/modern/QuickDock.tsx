"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function QuickDock() {
    const items = [
        { label: "Oluştur", href: "/panel/rezervasyon", icon: "+" },
        { label: "Düzenle", href: "/panel/rezervasyon/duzenle", icon: "✎" },
        { label: "Uyarı Ekle", href: "/panel/kayit/yeni", icon: "!" },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl p-2 shadow-2xl shadow-black/50"
            >
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group relative flex flex-col items-center justify-center rounded-xl bg-white/5 px-5 py-3 text-white transition-all hover:bg-white/10 hover:-translate-y-1 hover:scale-105 active:scale-95"
                    >
                        <span className="text-lg font-bold">{item.icon}</span>
                        <span className="sr-only">{item.label}</span>

                        {/* Tooltip */}
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-white/10">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </motion.div>
        </div>
    );
}
