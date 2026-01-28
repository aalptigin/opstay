"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IncidentType, IncidentSeverity } from "@/lib/incidents/types";

interface IncidentCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function IncidentCreateModal({
    isOpen,
    onClose,
    onSuccess,
}: IncidentCreateModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        type: "INCIDENT" as IncidentType,
        title: "",
        description: "",
        severity: "MED" as IncidentSeverity,
        dueAt: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.description) {
            setError("Başlık ve açıklama zorunludur");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formData.type,
                    title: formData.title,
                    description: formData.description,
                    severity: formData.severity,
                    dueAt: formData.dueAt || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "İşlem başarısız");
                setLoading(false);
                return;
            }

            // Reset and close
            setFormData({
                type: "INCIDENT",
                title: "",
                description: "",
                severity: "MED",
                dueAt: "",
            });
            onSuccess();
            onClose();
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                >
                    <div className={`px-6 py-4 border-b border-slate-200 ${formData.type === "INCIDENT"
                            ? "bg-gradient-to-r from-red-50 to-orange-50"
                            : "bg-gradient-to-r from-blue-50 to-cyan-50"
                        }`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">
                                {formData.type === "INCIDENT" ? "🔴 Arıza Bildirimi" : "🔧 Planlı Bakım"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Type selection */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "INCIDENT" })}
                                className={`flex-1 py-2 rounded-lg font-medium transition ${formData.type === "INCIDENT"
                                        ? "bg-red-500 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                🔴 Arıza
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "MAINTENANCE" })}
                                className={`flex-1 py-2 rounded-lg font-medium transition ${formData.type === "MAINTENANCE"
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                🔧 Bakım
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Başlık *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Kısa başlık..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Açıklama *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detaylı açıklama..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
                                required
                            />
                        </div>

                        {/* Severity */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Öncelik</label>
                            <div className="flex gap-2">
                                {[
                                    { value: "LOW", label: "Düşük", color: "bg-slate-100 text-slate-600" },
                                    { value: "MED", label: "Orta", color: "bg-amber-100 text-amber-700" },
                                    { value: "HIGH", label: "Yüksek", color: "bg-red-100 text-red-700" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, severity: opt.value as IncidentSeverity })}
                                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${formData.severity === opt.value
                                                ? opt.color + " ring-2 ring-offset-1 ring-slate-400"
                                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Hedef Tarih (Opsiyonel)
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.dueAt}
                                onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 transition ${formData.type === "INCIDENT"
                                        ? "bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/20"
                                        : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/20"
                                    }`}
                            >
                                {loading ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
