"use client";

import { motion } from "framer-motion";

type HeaderProps = {
    date: string;
    restaurantName?: string;
};

export default function Header({ date, restaurantName }: HeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pb-6 border-b border-white/5"
        >
            <div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        O
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">OPSTAY</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                    {date} · <span className="text-white/60 font-medium">{restaurantName || "Yükleniyor..."}</span>
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
                    <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white uppercase">
                        M
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
