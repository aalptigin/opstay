"use client";

import { useState } from "react";

type CheckMode = "name" | "phone" | "both";

type ProGuestInquiryProps = {
    mode: CheckMode;
    onModeChange: (m: CheckMode) => void;
    name: string;
    onNameChange: (v: string) => void;
    phone: string;
    onPhoneChange: (v: string) => void;
    onSearch: () => void;
    onClear: () => void;
    loading: boolean;
    message: string | null;
    hasMatches: boolean;
};

export default function ProGuestInquiry({
    mode,
    onModeChange,
    name,
    onNameChange,
    phone,
    onPhoneChange,
    onSearch,
    onClear,
    loading,
    message,
    hasMatches,
}: ProGuestInquiryProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold uppercase text-slate-800 tracking-widest">Misafir Sorgulama</h3>
                    <p className="text-xs text-slate-400 mt-1">Uyarı listesi kontrolü yapın.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClear}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-500 transition-colors"
                    >
                        Temizle
                    </button>
                    <button
                        onClick={onSearch}
                        disabled={loading}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all"
                    >
                        {loading ? "..." : "Sorgula"}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100/80 rounded-lg mb-4 gap-1">
                {[
                    { id: "name", label: "Ad Soyad" },
                    { id: "phone", label: "Telefon" },
                    { id: "both", label: "Ad + Telefon" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onModeChange(tab.id as CheckMode)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === tab.id
                                ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={mode === "phone" ? "opacity-30 pointer-events-none" : ""}>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Ad Soyad</label>
                    <input
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Örn: Burak Yılmaz"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors shadow-sm"
                    />
                </div>
                <div className={mode === "name" ? "opacity-30 pointer-events-none" : ""}>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Telefon</label>
                    <input
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="05xx..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors shadow-sm"
                    />
                </div>
            </div>

            {/* Message Area */}
            {message && (
                <div className={`mt-4 p-3 rounded-lg text-xs font-medium border ${hasMatches ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {hasMatches ? "⚠️ " : "✓ "} {message}
                </div>
            )}
        </div>
    );
}
