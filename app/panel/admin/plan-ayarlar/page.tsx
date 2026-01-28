"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const STORAGE_KEY = "opsstay_plan_admin_settings";

interface PlanSettings {
    floorCount: number;
}

function getSettings(): PlanSettings | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as PlanSettings;
    } catch {
        return null;
    }
}

function saveSettings(settings: PlanSettings): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        console.error("Ayarlar kaydedilemedi.");
    }
}

export default function PlanAyarlarPage() {
    const [floorCount, setFloorCount] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [saved, setSaved] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const settings = getSettings();
        if (settings && settings.floorCount > 0) {
            setFloorCount(settings.floorCount);
            setInputValue(String(settings.floorCount));
        }
    }, []);

    function handleSave() {
        const count = parseInt(inputValue, 10);
        if (isNaN(count) || count < 1) return;

        saveSettings({ floorCount: count });
        setFloorCount(count);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    const isFirstTime = floorCount === null;

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">ADMIN</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Plan Ayarları</h1>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mt-8"
            >
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 max-w-md">
                    {/* Ana Soru */}
                    <div className="text-center">
                        <div className="text-4xl mb-4">🏢</div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            {isFirstTime ? "Hoş Geldiniz!" : "Kat Sayısı"}
                        </h2>
                        <p className="text-sm text-white/60 mb-6">
                            {isFirstTime
                                ? "Başlamadan önce restoranınızın kaç kattan oluştuğunu belirtin."
                                : "Restoranınızın kat sayısını güncelleyebilirsiniz."}
                        </p>

                        {/* Input */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <label className="text-white/70 text-sm">Kat Sayısı:</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Örn: 3"
                                className="w-20 rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-lg text-white text-center font-bold outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Kaydet Butonu */}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!inputValue || parseInt(inputValue, 10) < 1}
                            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isFirstTime ? "Devam Et" : "Kaydet"}
                        </button>

                        {/* Success Message */}
                        {saved && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 text-sm text-emerald-400"
                            >
                                ✓ Kaydedildi
                            </motion.div>
                        )}
                    </div>

                    {/* Mevcut Sayı */}
                    {floorCount !== null && (
                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <span className="text-xs text-white/40">Mevcut:</span>
                            <span className="ml-2 text-white font-bold">{floorCount} kat</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
