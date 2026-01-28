"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MealDelivery, MEAL_TYPE_LABELS, IssueType, ISSUE_TYPE_LABELS } from "@/lib/meals/types";

interface DeliveryActionModalProps {
    isOpen: boolean;
    delivery: MealDelivery | null;
    mode: "deliver" | "issue";
    onClose: () => void;
    onConfirm: (data: { action: "DELIVER" | "ISSUE"; note?: string; issueType?: IssueType }) => void;
    loading?: boolean;
}

const ISSUE_TYPES: IssueType[] = ["PERSON_ABSENT", "WRONG_MEAL", "ALLERGEN_RISK", "NO_STOCK", "OTHER"];

export function DeliveryActionModal({
    isOpen,
    delivery,
    mode,
    onClose,
    onConfirm,
    loading,
}: DeliveryActionModalProps) {
    const [issueType, setIssueType] = useState<IssueType>("PERSON_ABSENT");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (mode === "issue") {
            if (!issueType) {
                setError("Sorun türü seçiniz");
                return;
            }
            if (note.length < 10) {
                setError("Açıklama en az 10 karakter olmalı");
                return;
            }
            onConfirm({ action: "ISSUE", issueType, note });
        } else {
            onConfirm({ action: "DELIVER", note: note || undefined });
        }
    };

    if (!isOpen || !delivery) return null;

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
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                >
                    <div className={`px-6 py-4 border-b border-slate-200 ${mode === "deliver"
                            ? "bg-gradient-to-r from-green-50 to-emerald-50"
                            : "bg-gradient-to-r from-red-50 to-orange-50"
                        }`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">
                                {mode === "deliver" ? "✅ Teslim Onayı" : "⚠️ Sorun Bildir"}
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
                        {/* Delivery info */}
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="font-semibold text-slate-800">{delivery.person?.fullName}</p>
                            <p className="text-sm text-slate-500">
                                {MEAL_TYPE_LABELS[delivery.mealType]} • {delivery.person?.unitName}
                            </p>
                        </div>

                        {/* Issue type (only for issue mode) */}
                        {mode === "issue" && (
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">Sorun Türü *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ISSUE_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setIssueType(type)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${issueType === type
                                                    ? "bg-red-500 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                        >
                                            {ISSUE_TYPE_LABELS[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Note */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                {mode === "issue" ? "Açıklama *" : "Not (opsiyonel)"}
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={mode === "issue" ? "Detaylı açıklama yazın..." : "Opsiyonel not..."}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
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
                                className={`px-6 py-2 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 transition ${mode === "deliver"
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20"
                                        : "bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/20"
                                    }`}
                            >
                                {loading ? "..." : mode === "deliver" ? "Teslim Et" : "Bildir"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
