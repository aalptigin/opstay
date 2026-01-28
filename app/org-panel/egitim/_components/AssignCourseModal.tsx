"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Course, TargetType } from "@/lib/training/types";

interface AssignCourseModalProps {
    isOpen: boolean;
    course: Course | null;
    onClose: () => void;
    onSuccess: () => void;
}

const TARGET_TYPES: { value: TargetType; label: string }[] = [
    { value: "ALL", label: "Tüm Personel" },
    { value: "UNIT", label: "Birim Seç" },
    { value: "PERSON", label: "Kişi Seç" },
];

// Mock units and people for demo
const MOCK_UNITS = [
    { id: "unit_1", name: "Yönetim" },
    { id: "unit_2", name: "Operasyon" },
    { id: "unit_3", name: "Mutfak" },
];

const MOCK_PEOPLE = [
    { id: "p1", name: "Ahmet Yılmaz", unit: "Yönetim" },
    { id: "p2", name: "Mehmet Kaya", unit: "Operasyon" },
    { id: "p3", name: "Ayşe Demir", unit: "Mutfak" },
    { id: "usr_current", name: "Mevcut Kullanıcı", unit: "Yönetim" },
];

export function AssignCourseModal({ isOpen, course, onClose, onSuccess }: AssignCourseModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [targetType, setTargetType] = useState<TargetType>("ALL");
    const [targetUnitId, setTargetUnitId] = useState("");
    const [targetPersonIds, setTargetPersonIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState("");
    const [isMandatory, setIsMandatory] = useState(true);
    const [note, setNote] = useState("");

    const togglePerson = (personId: string) => {
        setTargetPersonIds((prev) =>
            prev.includes(personId)
                ? prev.filter((id) => id !== personId)
                : [...prev, personId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!course) return;

        // Validate
        if (targetType === "UNIT" && !targetUnitId) {
            setError("Birim seçiniz");
            return;
        }
        if (targetType === "PERSON" && targetPersonIds.length === 0) {
            setError("En az bir kişi seçiniz");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/training/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course.id,
                    targetType,
                    targetUnitId: targetType === "UNIT" ? targetUnitId : undefined,
                    targetPersonIds: targetType === "PERSON" ? targetPersonIds : undefined,
                    dueDate: dueDate || undefined,
                    isMandatory,
                    note: note || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "İşlem başarısız");
                return;
            }

            // Reset
            setTargetType("ALL");
            setTargetUnitId("");
            setTargetPersonIds([]);
            setDueDate("");
            setIsMandatory(true);
            setNote("");

            onSuccess();
            onClose();
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !course) return null;

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
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
                >
                    <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">👥 Eğitim Ata</h2>
                                <p className="text-sm text-slate-500">{course.title}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Target Type */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Hedef Kitle</label>
                            <div className="space-y-2">
                                {TARGET_TYPES.map((t) => (
                                    <label key={t.value} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="targetType"
                                            value={t.value}
                                            checked={targetType === t.value}
                                            onChange={() => setTargetType(t.value)}
                                            className="w-4 h-4 text-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700">{t.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Unit Select */}
                        {targetType === "UNIT" && (
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Birim *</label>
                                <select
                                    value={targetUnitId}
                                    onChange={(e) => setTargetUnitId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Seçiniz...</option>
                                    {MOCK_UNITS.map((unit) => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Person Select */}
                        {targetType === "PERSON" && (
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-2">Kişiler *</label>
                                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                                    {MOCK_PEOPLE.map((person) => (
                                        <label key={person.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={targetPersonIds.includes(person.id)}
                                                onChange={() => togglePerson(person.id)}
                                                className="w-4 h-4 rounded text-indigo-500"
                                            />
                                            <span className="text-sm text-slate-700">{person.name}</span>
                                            <span className="text-xs text-slate-400">({person.unit})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Due Date */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Son Tarih (opsiyonel)</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                            />
                        </div>

                        {/* Mandatory */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isMandatory}
                                    onChange={(e) => setIsMandatory(e.target.checked)}
                                    className="w-4 h-4 rounded text-purple-500"
                                />
                                <span className="text-sm text-slate-600">Zorunlu eğitim olarak işaretle</span>
                            </label>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Not (opsiyonel)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Atama notu..."
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none resize-none"
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
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
                            >
                                {loading ? "Atanıyor..." : "Ata"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
