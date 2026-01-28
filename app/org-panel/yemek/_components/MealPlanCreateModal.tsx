"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MealType, MealPlanItem, AllergenTag, DietTag, MEAL_TYPE_LABELS, ALLERGEN_LABELS, DIET_LABELS } from "@/lib/meals/types";

interface MealPlanCreateModalProps {
    isOpen: boolean;
    date: string;
    onClose: () => void;
    onSuccess: () => void;
}

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
const ALLERGEN_OPTIONS: AllergenTag[] = ["GLUTEN", "NUTS", "DAIRY", "EGG", "SEAFOOD", "SOY"];
const DIET_OPTIONS: DietTag[] = ["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "LACTOSE_FREE", "HALAL"];

interface MealItemForm {
    mealType: MealType;
    title: string;
    description: string;
    allergens: AllergenTag[];
    diets: DietTag[];
    plannedPortions: number;
}

const defaultItem = (mealType: MealType): MealItemForm => ({
    mealType,
    title: "",
    description: "",
    allergens: [],
    diets: [],
    plannedPortions: 10,
});

export function MealPlanCreateModal({ isOpen, date, onClose, onSuccess }: MealPlanCreateModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState<MealItemForm[]>([
        defaultItem("BREAKFAST"),
        defaultItem("LUNCH"),
    ]);

    const updateItem = (index: number, updates: Partial<MealItemForm>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        setItems(newItems);
    };

    const toggleArrayItem = <T,>(arr: T[], item: T): T[] => {
        return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    };

    const addMeal = () => {
        const usedTypes = items.map((i) => i.mealType);
        const availableType = MEAL_TYPES.find((t) => !usedTypes.includes(t));
        if (availableType) {
            setItems([...items, defaultItem(availableType)]);
        }
    };

    const removeMeal = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate
        for (const item of items) {
            if (!item.title || item.title.length < 2) {
                setError("Her öğün için başlık gerekli (min 2 karakter)");
                return;
            }
        }

        setLoading(true);

        try {
            const res = await fetch("/api/meals/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date,
                    unitScope: "ALL",
                    items: items.map((i) => ({
                        mealType: i.mealType,
                        title: i.title,
                        description: i.description || undefined,
                        allergens: i.allergens,
                        diets: i.diets,
                        plannedPortions: i.plannedPortions,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "İşlem başarısız");
                return;
            }

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
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
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
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                >
                    <div className="sticky top-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-red-50 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">🍽️ Yeni Yemek Planı</h2>
                                <p className="text-sm text-slate-500">
                                    {new Date(date).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
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

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {items.map((item, index) => (
                            <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <select
                                        value={item.mealType}
                                        onChange={(e) => updateItem(index, { mealType: e.target.value as MealType })}
                                        className="px-3 py-2 rounded-lg border border-slate-200 font-medium focus:border-blue-500 outline-none"
                                    >
                                        {MEAL_TYPES.map((t) => (
                                            <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
                                        ))}
                                    </select>
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMeal(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Kaldır
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateItem(index, { title: e.target.value })}
                                    placeholder="Menü başlığı *"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-3"
                                />

                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(index, { description: e.target.value })}
                                    placeholder="Açıklama (opsiyonel)"
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mb-3 resize-none"
                                />

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Porsiyon</label>
                                        <input
                                            type="number"
                                            value={item.plannedPortions}
                                            onChange={(e) => updateItem(index, { plannedPortions: Number(e.target.value) })}
                                            min={1}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Allergens */}
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Alerjenler</label>
                                    <div className="flex flex-wrap gap-1">
                                        {ALLERGEN_OPTIONS.map((a) => (
                                            <button
                                                key={a}
                                                type="button"
                                                onClick={() => updateItem(index, { allergens: toggleArrayItem(item.allergens, a) })}
                                                className={`px-2 py-1 rounded text-xs font-medium transition ${item.allergens.includes(a)
                                                        ? "bg-red-500 text-white"
                                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                                    }`}
                                            >
                                                {ALLERGEN_LABELS[a]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Diets */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Diyet Etiketleri</label>
                                    <div className="flex flex-wrap gap-1">
                                        {DIET_OPTIONS.map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => updateItem(index, { diets: toggleArrayItem(item.diets, d) })}
                                                className={`px-2 py-1 rounded text-xs font-medium transition ${item.diets.includes(d)
                                                        ? "bg-green-500 text-white"
                                                        : "bg-green-50 text-green-600 hover:bg-green-100"
                                                    }`}
                                            >
                                                {DIET_LABELS[d]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {items.length < 3 && (
                            <button
                                type="button"
                                onClick={addMeal}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 transition"
                            >
                                + Öğün Ekle
                            </button>
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
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition"
                            >
                                {loading ? "Kaydediliyor..." : "Planı Kaydet"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
