"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type KpiCardProps = {
    title: string;
    value: string | number;
    subtext?: string;
    icon?: ReactNode;
    trend?: "up" | "down" | "neutral";
};

export default function KpiCard({ title, value, subtext, icon, trend }: KpiCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="shrink-0 min-w-[200px] rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,.15)] flex flex-col justify-between"
        >
            <div>
                <div className="flex items-center justify-between text-xs text-white/50 tracking-wider font-semibold uppercase">
                    {title}
                    {icon && <span className="text-white/40">{icon}</span>}
                </div>
                <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                    {value}
                </div>
            </div>
            {subtext && (
                <div className="mt-3 text-xs text-white/60 font-medium">
                    {subtext}
                </div>
            )}
        </motion.div>
    );
}
