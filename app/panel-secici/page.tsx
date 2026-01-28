"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PanelSelectorPage() {
    const router = useRouter();

    const panels = [
        {
            id: "rezervasyon",
            title: "Rezervasyon Yönetimi",
            subtitle: "Misafir & Masa Operasyonları",
            icon: "📅",
            path: "/panel/rezervasyon",
            color: "#3b82f6",
            bgGradient: "from-blue-600 to-indigo-700",
            items: [
                { icon: "📋", label: "Rezervasyonlar" },
                { icon: "⚠️", label: "Uyarı Listesi" },
                { icon: "⭐", label: "Değerlendirmeler" },
                { icon: "📊", label: "İstatistikler" },
            ],
        },
        {
            id: "organizasyon",
            title: "Depo & Organizasyon",
            subtitle: "Araç, Stok & Personel Yönetimi",
            icon: "📦",
            path: "/org-panel",
            color: "#10b981",
            bgGradient: "from-emerald-500 to-teal-600",
            items: [
                { icon: "🚗", label: "Araç Yönetimi" },
                { icon: "📦", label: "Depo & Stok" },
                { icon: "🔧", label: "Bakım & Arıza" },
                { icon: "🏖️", label: "İzin & Eğitim" },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/20">
                        <span className="text-3xl font-bold text-white">OS</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">OpsStay Panel</h1>
                    <p className="text-white/60">Yönetim sistemine hoş geldiniz</p>
                </motion.div>

                {/* Panel Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {panels.map((panel, index) => (
                        <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(panel.path)}
                            className="group cursor-pointer"
                        >
                            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                                {/* Background Glow */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${panel.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                                />

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div
                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                                            style={{ backgroundColor: `${panel.color}20` }}
                                        >
                                            {panel.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{panel.title}</h2>
                                            <p className="text-sm text-white/50">{panel.subtitle}</p>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {panel.items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 p-3 rounded-lg bg-white/5"
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                <span className="text-sm text-white/70">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Arrow */}
                                    <div className="mt-6 flex items-center justify-end text-white/50 group-hover:text-white transition-colors">
                                        <span className="text-sm mr-2">Panele Git</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-xs text-white/30 mt-8"
                >
                    © 2026 OpsStay - Kurumsal Yönetim Platformu
                </motion.p>
            </div>
        </div>
    );
}
