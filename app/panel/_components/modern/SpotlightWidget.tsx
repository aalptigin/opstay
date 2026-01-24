"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SearchResult = {
    id: string;
    title: string;
    subtitle: string;
    tag?: string;
    onSelect?: () => void;
};

type SpotlightWidgetProps = {
    onSearch: (q: string) => void;
    results: SearchResult[];
    loading: boolean;
};

export default function SpotlightWidget({ onSearch, results, loading }: SpotlightWidgetProps) {
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onSearch(val);
    };

    return (
        <div className="relative group z-30">
            <div className={`
             relative overflow-hidden rounded-2xl border transition-all duration-300
             ${focused ? "border-indigo-500/50 bg-[#0b1220] shadow-[0_0_30px_rgba(99,102,241,0.2)]" : "border-white/10 bg-[#060c15] hover:border-white/20"}
        `}>
                <div className="flex items-center px-4 py-3 gap-3">
                    <span className="text-white/40">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 200)}
                        placeholder="Misafir, telefon veya rezervasyon ara..."
                        className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                    />
                    {loading && <span className="animate-spin text-white/40">⟳</span>}
                </div>
            </div>

            <AnimatePresence>
                {(focused || query.length > 0) && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full mt-2 w-full origin-top rounded-xl border border-white/10 bg-[#020617]/95 backdrop-blur-xl p-2 shadow-2xl overflow-hidden"
                    >
                        <div className="max-h-[300px] overflow-y-auto space-y-1">
                            {results.map((res) => (
                                <div key={res.id} className="cursor-pointer group/item flex items-center justify-between rounded-lg p-2 hover:bg-white/10 transition-colors">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-200 group-hover/item:text-white">{res.title}</div>
                                        <div className="text-xs text-gray-500 group-hover/item:text-gray-400">{res.subtitle}</div>
                                    </div>
                                    {res.tag && <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">{res.tag}</span>}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
