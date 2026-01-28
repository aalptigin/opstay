"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryItem, DepotType } from "@/lib/org/types";
import { ProductOption } from "@/lib/integrations/n8nProducts";
import { InventoryProductCombobox } from "./InventoryProductCombobox";

interface InventoryInModalProps {
    isOpen: boolean;
    depotType: DepotType;
    items: InventoryItem[];
    onClose: () => void;
    onSuccess: () => void;
}

export function InventoryInModal({
    isOpen,
    depotType,
    items,
    onClose,
    onSuccess,
}: InventoryInModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [qty, setQty] = useState("");
    const [notes, setNotes] = useState("");

    // Convert local inventory items to ProductOption format
    const localProducts: ProductOption[] = items
        .filter((i) => i.depotType === depotType)
        .map((i) => ({
            id: i.id,
            name: i.name,
            unitLabel: i.unit,
            depotType: i.depotType,
            source: "internal" as const,
            currentLevel: i.currentLevel,
            minLevel: i.minLevel,
        }));

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedProduct(null);
            setQty("");
            setNotes("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedProduct) {
            setError("Lütfen bir ürün seçin");
            return;
        }

        const qtyNum = Number(qty);
        if (qtyNum <= 0) {
            setError("Miktar 0'dan büyük olmalıdır");
            return;
        }

        setLoading(true);

        try {
            // Product is already created by combobox if it was new
            // Just create the transaction
            const res = await fetch("/api/org/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: selectedProduct.id,
                    type: "in",
                    qty: qtyNum,
                    notes: notes || `Stok girişi: ${qtyNum} ${selectedProduct.unitLabel}`,
                    source: "form",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "İşlem başarısız");
                setLoading(false);
                return;
            }

            // Success
            setSelectedProduct(null);
            setQty("");
            setNotes("");
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
                    <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">📥 Stok Girişi</h2>
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
                        {/* Product Selection - Dynamic Combobox */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Ürün *
                            </label>
                            <InventoryProductCombobox
                                depotType={depotType}
                                localProducts={localProducts}
                                value={selectedProduct}
                                onChange={setSelectedProduct}
                                placeholder="Ürün ara veya yaz..."
                            />
                            <p className="mt-1 text-xs text-slate-400">
                                Listeden seçin veya yeni ürün adı yazıp ekleyin
                            </p>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Miktar *
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                    placeholder="0"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                                    required
                                />
                                <span className="text-slate-500 text-sm min-w-[60px] text-center">
                                    {selectedProduct?.unitLabel || "adet"}
                                </span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Açıklama
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Opsiyonel not..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
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
                                disabled={loading || !selectedProduct || !qty}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Kaydediliyor...
                                    </span>
                                ) : (
                                    "Giriş Yap"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
