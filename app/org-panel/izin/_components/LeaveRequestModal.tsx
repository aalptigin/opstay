"use client";

import { useState } from "react";
import { CreateLeaveRequestInput, CreateLeaveRequestSchema } from "@/lib/leave/schema";
import { LeaveType, DayPart, LEAVE_TYPE_LABELS } from "@/lib/leave/types";

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateLeaveRequestInput) => Promise<void>;
}

export function LeaveRequestModal({ isOpen, onClose, onSubmit }: LeaveRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateLeaveRequestInput>>({
        type: LeaveType.ANNUAL,
        startPart: DayPart.FULL,
        endPart: DayPart.FULL,
    });
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = CreateLeaveRequestSchema.safeParse(formData);
        if (!result.success) {
            setError(result.error.issues[0].message);
            setLoading(false);
            return;
        }

        try {
            await onSubmit(result.data);
            onClose();
        } catch (err) {
            setError("Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Yeni İzin Talebi</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">İzin Türü</label>
                        <select
                            className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as LeaveType })}
                        >
                            {Object.entries(LEAVE_TYPE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç</label>
                            <input
                                type="date"
                                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                                value={formData.startDate || ""}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş</label>
                            <input
                                type="date"
                                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                                value={formData.endDate || ""}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                        <textarea
                            className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                            rows={3}
                            placeholder="İzin sebebi, notlar..."
                            value={formData.description || ""}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">{formData.description?.length || 0} / 10</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {loading ? "Oluşturuluyor..." : "Talep Oluştur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
