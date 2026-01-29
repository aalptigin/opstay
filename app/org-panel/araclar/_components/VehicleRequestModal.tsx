"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vehicle } from "@/lib/org/types";

interface VehicleRequestModalProps {
    isOpen: boolean;
    vehicle: Vehicle | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function VehicleRequestModal({
    isOpen,
    vehicle,
    onClose,
    onSuccess,
}: VehicleRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        purpose: "",
        startTime: "",
        endTime: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicle) return;

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/org/vehicles/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vehicleId: vehicle.id,
                    purpose: formData.purpose,
                    startTime: formData.startTime || undefined,
                    endTime: formData.endTime || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Talep oluşturulamadı");
                setLoading(false);
                return;
            }

            // Reset form and close
            setFormData({ purpose: "", startTime: "", endTime: "" });
            onSuccess();
            onClose();
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !vehicle) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">📋 Araç Talebi</h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {vehicle.plate} - {vehicle.model}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Purpose */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Kullanım Amacı *
                            </label>
                            <textarea
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                placeholder="Araç kullanım amacını açıklayın..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
                                required
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Başlangıç Zamanı
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Tahmini Bitiş
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                            ℹ️ Talebiniz onay için yöneticinize gönderilecektir.
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
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 transition"
                            >
                                {loading ? "Gönderiliyor..." : "Talep Oluştur"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
