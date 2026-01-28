"use client";

import { MealPlan, MealPlanItem, MEAL_TYPE_LABELS, ALLERGEN_LABELS, DIET_LABELS } from "@/lib/meals/types";

interface MealPlanCardProps {
    plan: MealPlan | null;
    loading?: boolean;
    onCreatePlan?: () => void;
}

function MealItemCard({ item }: { item: MealPlanItem }) {
    return (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 rounded bg-white text-sm font-medium text-slate-700 border border-slate-200">
                    {MEAL_TYPE_LABELS[item.mealType]}
                </span>
                <span className="text-sm text-slate-500">{item.plannedPortions} porsiyon</span>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
            {item.description && (
                <p className="text-sm text-slate-600 mb-2">{item.description}</p>
            )}
            <div className="flex flex-wrap gap-1">
                {item.allergens.map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                        🚨 {ALLERGEN_LABELS[a]}
                    </span>
                ))}
                {item.diets.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        🥗 {DIET_LABELS[d]}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function MealPlanCard({ plan, loading, onCreatePlan }: MealPlanCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="space-y-3">
                    <div className="h-20 bg-slate-100 rounded" />
                    <div className="h-20 bg-slate-100 rounded" />
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="text-4xl block mb-3">📋</span>
                <h3 className="font-semibold text-slate-700 mb-2">Bu tarih için plan yok</h3>
                <p className="text-slate-500 text-sm mb-4">Yeni bir yemek planı oluşturun</p>
                {onCreatePlan && (
                    <button
                        onClick={onCreatePlan}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition"
                    >
                        + Yeni Plan Oluştur
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-800">Günlük Plan</h3>
                    <p className="text-xs text-slate-500">
                        {new Date(plan.date).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-medium">
                    {plan.unitScope === "ALL" ? "Tüm Birimler" : plan.unitScope}
                </span>
            </div>
            <div className="p-5 space-y-3">
                {plan.items.map((item, i) => (
                    <MealItemCard key={i} item={item} />
                ))}
            </div>
        </div>
    );
}
