"use client";

import { MealKpi } from "@/lib/meals/types";

interface MealKpiCardsProps {
    kpi: MealKpi;
    loading?: boolean;
    onFilterChange?: (filter: string | null) => void;
    activeFilter?: string | null;
}

export function MealKpiCards({ kpi, loading, onFilterChange, activeFilter }: MealKpiCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                        <div className="h-8 bg-slate-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { key: "planned", label: "Planlanan Öğün", value: kpi.planned, icon: "📋", color: "blue" },
        { key: "delivered", label: "Teslim Edilen", value: kpi.delivered, icon: "✅", color: "green" },
        { key: "pending", label: "Bekleyen", value: kpi.pending, icon: "⏳", color: "amber" },
        { key: "issues", label: "Sorunlu", value: kpi.issues, icon: "⚠️", color: "red" },
    ];

    const getColorClasses = (color: string, isActive: boolean) => {
        const base = {
            blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", ring: "ring-blue-500" },
            green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", ring: "ring-green-500" },
            amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", ring: "ring-amber-500" },
            red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", ring: "ring-red-500" },
        };
        const c = base[color as keyof typeof base];
        return isActive ? `${c.bg} ${c.border} ring-2 ${c.ring}` : `bg-white ${c.border} hover:${c.bg}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => {
                const isActive = activeFilter === card.key;
                const colorClasses = getColorClasses(card.color, isActive);
                const textColor = {
                    blue: "text-blue-600",
                    green: "text-green-600",
                    amber: "text-amber-600",
                    red: "text-red-600",
                }[card.color];

                return (
                    <button
                        key={card.key}
                        onClick={() => onFilterChange?.(isActive ? null : card.key)}
                        className={`rounded-xl border p-5 text-left transition-all ${colorClasses}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">{card.label}</p>
                                <p className={`text-3xl font-bold ${textColor}`}>{card.value}</p>
                            </div>
                            <span className="text-3xl">{card.icon}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
