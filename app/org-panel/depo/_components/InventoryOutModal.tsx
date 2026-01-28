"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryItem, DepotType } from "@/lib/org/types";

interface InventoryOutModalProps {
    isOpen: boolean;
    depotType: DepotType;
    items: InventoryItem[];
    onClose: () => void;
    onSuccess: () => void;
}

export function InventoryOutModal({
    isOpen,
    depotType,
    items,
    onClose,
    onSuccess,
}: InventoryOutModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [formData, setFormData] = useState({
        itemId: "",
        qty: "",
        notes: "",
        recipient: "",
    });

    const filteredItems = items.filter((i) => i.depotType === depotType);
    const selectedItem = filteredItems.find((i) => i.id === formData.itemId);

    // Check if this will make stock critical
    const checkCritical = () => {
        if (!selectedItem || !formData.qty) return false;
        const qty = Number(formData.qty);
        const newLevel = selectedItem.currentLevel - qty;
        return newLevel < selectedItem.minLevel;
    };

    const handleQtyChange = (value: string) => {
        setFormData({ ...formData, qty: value });

        const qty = Number(value);
        if (selectedItem && qty > 0) {
            const newLevel = selectedItem.currentLevel - qty;
            if (newLevel < selectedItem.minLevel) {
                setWarning(`Bu çıkış ile stok kritik seviyenin altına düşecek (${newLevel} < ${selectedItem.minLevel}). Onay gerekecektir.`);
            } else {
                setWarning("");
            }
        } else {
            setWarning("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.itemId || !formData.qty) {
            setError("Ürün ve miktar zorunludur");
            return;
        }

        const qty = Number(formData.qty);
        if (qty <= 0) {
            setError("Miktar 0'dan büyük olmalıdır");
            return;
        }

        if (selectedItem && qty > selectedItem.currentLevel) {
            setError(`Yetersiz stok. Mevcut: ${selectedItem.currentLevel} ${selectedItem.unit}`);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/org/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: formData.itemId,
                    type: "out",
                    qty,
                    notes: formData.notes || `Stok çıkışı: ${formData.recipient || "Belirtilmedi"}`,
                    source: "form",
                    requiresApproval: checkCritical(), // Backend will handle approval logic
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "İşlem başarısız");
                setLoading(false);
                return;
            }

            // Reset and close
            setFormData({ itemId: "", qty: "", notes: "", recipient: "" });
            setWarning("");
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
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">📤 Stok Çıkışı</h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {depotType === "cleaning" ? "🧹 Temizlik Deposu" : "🍎 Gıda Deposu"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Ürün *
                            </label>
                            <select
                                value={formData.itemId}
                                onChange={(e) => {
                                    setFormData({ ...formData, itemId: e.target.value, qty: "" });
                                    setWarning("");
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                                required
                            >
                                <option value="">Ürün seçin...</option>
                                {filteredItems.map((item) => (
                                    <option key={item.id} value={item.id} disabled={item.currentLevel === 0}>
                                        {item.name} (Mevcut: {item.currentLevel} {item.unit})
                                        {item.currentLevel === 0 ? " - Stok yok" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Miktar * {selectedItem && <span className="text-slate-400">(Max: {selectedItem.currentLevel})</span>}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem?.currentLevel || undefined}
                                    value={formData.qty}
                                    onChange={(e) => handleQtyChange(e.target.value)}
                                    placeholder="0"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                                    required
                                />
                                <span className="text-slate-500 text-sm min-w-[60px]">
                                    {selectedItem?.unit || "adet"}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Kime Verildi
                            </label>
                            <input
                                type="text"
                                value={formData.recipient}
                                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                placeholder="Birim / Kişi adı..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Açıklama
                            </label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Opsiyonel not..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                            />
                        </div>

                        {warning && (
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                                ⚠️ {warning}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

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
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 transition"
                            >
                                {loading ? "İşleniyor..." : "Çıkış Yap"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
