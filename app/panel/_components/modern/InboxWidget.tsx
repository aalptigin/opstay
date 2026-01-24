"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type InboxItem = {
    id: string;
    title: string;
    desc: string;
    time: string;
    type: "warning" | "alert" | "success" | "neutral";
    actionLabel?: string;
    actionLink?: string;
};

type InboxWidgetProps = {
    items: InboxItem[];
};

export default function InboxWidget({ items }: InboxWidgetProps) {
    if (items.length === 0) {
        return (
            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 text-center">
                <div className="text-4xl opacity-20 mb-2">🎉</div>
                <h3 className="text-white/40 text-sm font-medium">Her şey yolunda</h3>
                <p className="text-white/20 text-xs mt-1">Aksiyon bekleyen işlem yok.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest">Inbox</h3>
                <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>

            <div className="space-y-2">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-[#0f172a] to-[#020617] p-4 hover:border-indigo-500/30 transition-all"
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'warning' ? 'bg-amber-500' :
                                item.type === 'alert' ? 'bg-rose-500' :
                                    item.type === 'success' ? 'bg-emerald-500' : 'bg-gray-500'
                            }`} />

                        <div className="pl-3">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{item.title}</h4>
                                <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.desc}</p>

                            {item.actionLink && (
                                <div className="mt-3">
                                    <Link href={item.actionLink} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-indigo-400 hover:text-indigo-300 transition-colors">
                                        {item.actionLabel || "İncele"} →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
