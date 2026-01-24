"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type TimelineItem = {
    id: string;
    time: string;
    customer: string;
    phone: string;
    pax: string; // e.g. "4 Kişi"
    table?: string;
    note?: string;
    status: "past" | "current" | "future";
    tags?: string[];
};

type TimelineWidgetProps = {
    items: TimelineItem[];
    loading?: boolean;
};

export default function TimelineWidget({ items, loading }: TimelineWidgetProps) {
    if (loading) return <div className="text-white/30 text-sm p-4">Yükleniyor...</div>;

    if (items.length === 0) {
        return (
            <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-10 text-center">
                <div className="text-white/20 text-lg">Bugün için akış boş.</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Rezervasyon Akışı</h3>
                <Link href="/panel/rezervasyon" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">Takvimi Aç →</Link>
            </div>

            <div className="relative border-l border-white/5 ml-3 space-y-8 pl-8 py-2">
                {items.map((item, idx) => {
                    const isPast = item.status === "past";
                    const isCurrent = item.status === "current";

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: isPast ? 0.5 : 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative group"
                        >
                            {/* Dot */}
                            <div className={`
                            absolute -left-[39px] top-1.5 h-5 w-5 rounded-full border-4 border-[#020617] transition-all duration-500
                            ${isCurrent ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110" : "bg-slate-700"}
                            ${isPast ? "bg-slate-800" : ""}
                        `} />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl p-4 -m-4 hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-lg font-mono font-bold ${isCurrent ? "text-indigo-400" : "text-white/60"}`}>{item.time}</span>
                                        {item.table && <span className="text-xs font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded">Masa {item.table}</span>}
                                        {item.tags?.map(t => (
                                            <span key={t} className="text-[10px] uppercase font-bold text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10">{t}</span>
                                        ))}
                                    </div>
                                    <div className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">
                                        {item.customer}
                                        <span className="ml-2 text-sm font-normal text-slate-500">{item.pax}</span>
                                    </div>
                                    {item.note && (
                                        <div className="mt-1 text-sm text-slate-500 italic">“{item.note}”</div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                    <a href={`tel:${item.phone}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Ara">
                                        📞
                                    </a>
                                    <Link href={`/panel/rezervasyon/duzenle?id=${item.id}`} className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm font-bold border border-indigo-500/20 transition-all">
                                        Düzenle
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
