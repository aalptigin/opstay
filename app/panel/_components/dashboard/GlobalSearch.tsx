"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SearchResult = {
    id: string;
    name: string;
    phone: string;
    note?: string;
    risk_level?: string;
};

type GlobalSearchProps = {
    onSearch: (query: string) => void;
    loading?: boolean;
    results: SearchResult[];
    onClear: () => void;
};

export default function GlobalSearch({ onSearch, loading, results, onClear }: GlobalSearchProps) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleClear = () => {
        setQuery("");
        onClear();
        inputRef.current?.focus();
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#060c15] shadow-xl focus-within:ring-2 focus-within:ring-[#0ea5ff]/50 transition-all">
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-transparent px-5 py-4 text-base text-white placeholder-white/30 outline-none"
                        placeholder="Misafir Sorgula: İsim, Tel No veya Rez No..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {query && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-2 text-white/40 hover:text-white transition-colors"
                                title="Temizle"
                            >
                                ✕
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !query}
                            className="rounded-xl bg-[#0ea5ff] px-4 py-2 text-sm font-semibold text-[#06121f] disabled:opacity-50 hover:bg-[#0ea5ff]/90 transition-colors"
                        >
                            {loading ? "..." : "Sorgula"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Results Dropdown Area */}
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-0 w-full rounded-2xl border border-white/10 bg-[#0b1220]/95 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,.5)] overflow-hidden z-20"
                    >
                        <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
                            {results.map((res) => (
                                <div key={res.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-white">{res.name}</div>
                                            <div className="text-sm text-white/50">{res.phone}</div>
                                        </div>
                                        {res.risk_level && (
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${res.risk_level === 'high' ? 'bg-red-500/20 text-red-300' :
                                                    res.risk_level === 'medium' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                {res.risk_level} Risk
                                            </span>
                                        )}
                                    </div>
                                    {res.note && (
                                        <div className="mt-2 text-xs text-white/40 bg-white/5 p-2 rounded">
                                            Not: {res.note}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-2 bg-white/5 text-center text-xs text-white/30 border-t border-white/5">
                            {results.length} sonuç bulundu
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
