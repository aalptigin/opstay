"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export type ActionItemType =
    | { type: "negative_rating"; id: string; customer: string; score: number; comment?: string }
    | { type: "positive_rating"; id: string; customer: string; score: number; comment?: string }
    | { type: "warning_match"; id: string; customer: string; reason: string; reservation_no?: string };

type ActionQueueProps = {
    items: ActionItemType[];
};

export default function ActionQueue({ items }: ActionQueueProps) {
    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
                Şu an aksiyon bekleyen iş yok. Harika!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#162031] to-[#0f1724] p-4 hover:border-white/20 transition-colors"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {item.type === "negative_rating" && (
                                    <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-200 border border-red-500/20">
                                        Olumsuz Puan ({item.score})
                                    </span>
                                )}
                                {item.type === "positive_rating" && (
                                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-200 border border-emerald-500/20">
                                        Olumlu Puan ({item.score})
                                    </span>
                                )}
                                {item.type === "warning_match" && (
                                    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-200 border border-amber-500/20">
                                        Uyarı Eşleşmesi
                                    </span>
                                )}
                                <span className="text-xs text-white/40">• Şimdi</span>
                            </div>

                            <h4 className="text-sm font-semibold text-white truncate pr-4">
                                {item.customer}
                            </h4>

                            <p className="mt-1 text-xs text-white/60 line-clamp-1">
                                {item.type === "warning_match" ? item.reason : (item.comment || "Yorum yok")}
                            </p>
                        </div>

                        <div className="shrink-0 self-center">
                            {item.type === "negative_rating" && (
                                <Link
                                    href={`/panel/ratings?id=${item.id}&action=callback`}
                                    className="inline-flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors"
                                >
                                    Geri arama aç
                                </Link>
                            )}
                            {item.type === "positive_rating" && (
                                <button
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors"
                                    onClick={() => alert("Google linki gönderildi (Demo)")}
                                >
                                    Link gönder
                                </button>
                            )}
                            {item.type === "warning_match" && (
                                <Link
                                    href={`/panel/rezervasyon?q=${item.reservation_no}`}
                                    className="inline-flex items-center justify-center rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors"
                                >
                                    İncele
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
