"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaveReportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    unitId?: string; // Current user's unit or selected
}

export function LeaveReportDrawer({ isOpen, onClose }: LeaveReportDrawerProps) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExport = async (format: "csv" | "pdf") => {
        if (!startDate || !endDate) return alert("Tarih aralığı seçiniz");

        setLoading(true);
        // Mock export simulation
        setTimeout(() => {
            alert(`Rapor (${format.toUpperCase()}) başarıyla oluşturuldu ve indirildi.`);
            setLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-[60]"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 bottom-0 w-96 bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">İzin Raporu</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="p-6 space-y-6 flex-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Rapor Başlangıç</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Rapor Bitiş</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-800 mb-2">Rapor İçeriği</h3>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Tüm izin talepleri ve durumları</li>
                                    <li>Onaylayan/Reddeden bilgileri</li>
                                    <li>Toplam kullanılan gün sayıları</li>
                                    <li>Çakışma analizleri</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
                            <button
                                onClick={() => handleExport("csv")}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 disabled:opacity-50"
                            >
                                {loading ? "Hazırlanıyor..." : "📥 CSV Olarak İndir"}
                            </button>
                            <button
                                onClick={() => handleExport("pdf")}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50"
                            >
                                {loading ? "Hazırlanıyor..." : "📄 PDF Olarak İndir"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
