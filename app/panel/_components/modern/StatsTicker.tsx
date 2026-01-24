"use client";

import { motion } from "framer-motion";

type StatItem = {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
    highlight?: boolean;
};

type StatsTickerProps = {
    stats: StatItem[];
};

export default function StatsTicker({ stats }: StatsTickerProps) {
    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-3 px-1">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`
              shrink-0 flex items-center gap-3 rounded-full border px-5 py-2.5 transition-all
              ${stat.highlight
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                                : "border-white/5 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                            }
            `}
                    >
                        <span className="text-xs font-medium uppercase tracking-wider opacity-60">
                            {stat.label}
                        </span>
                        <span className="text-sm font-bold tracking-tight text-white">
                            {stat.value}
                        </span>
                        {stat.trend === "up" && (
                            <span className="text-[10px] text-emerald-400">↑</span>
                        )}
                        {stat.trend === "down" && (
                            <span className="text-[10px] text-rose-400">↓</span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
