"use client";

import { MealDelivery, MealType, MEAL_TYPE_LABELS, STATUS_LABELS, DIET_LABELS, ALLERGEN_LABELS } from "@/lib/meals/types";

interface MealDeliveriesTableProps {
    deliveries: MealDelivery[];
    loading?: boolean;
    mealFilter?: MealType | null;
    onMealFilterChange?: (meal: MealType | null) => void;
    onDeliver?: (delivery: MealDelivery) => void;
    onReportIssue?: (delivery: MealDelivery) => void;
}

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const STATUS_COLORS = {
    PENDING: "bg-amber-100 text-amber-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-slate-100 text-slate-600",
    ISSUE: "bg-red-100 text-red-700",
};

export function MealDeliveriesTable({
    deliveries,
    loading,
    mealFilter,
    onMealFilterChange,
    onDeliver,
    onReportIssue,
}: MealDeliveriesTableProps) {
    const filteredDeliveries = mealFilter
        ? deliveries.filter((d) => d.mealType === mealFilter)
        : deliveries;

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-14 bg-slate-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Meal type tabs */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Dağıtım Listesi</h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => onMealFilterChange?.(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${!mealFilter ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        Tümü
                    </button>
                    {MEAL_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => onMealFilterChange?.(type)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${mealFilter === type ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {MEAL_TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
            </div>

            {filteredDeliveries.length === 0 ? (
                <div className="p-8 text-center">
                    <span className="text-3xl block mb-2">🍽️</span>
                    <p className="text-slate-500">Dağıtım kaydı yok</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kişi</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Öğün</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Diyet/Alerjen</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDeliveries.map((delivery) => {
                                const person = delivery.person;
                                const isOnLeave = person?.isOnLeave;
                                const canDeliver = delivery.status === "PENDING" && !isOnLeave;

                                return (
                                    <tr key={delivery.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {person?.fullName || "—"}
                                                    {isOnLeave && (
                                                        <span className="ml-2 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs">İzinli</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {person?.unitName} {person?.shiftLabel && `• ${person.shiftLabel}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-sm font-medium">
                                                {MEAL_TYPE_LABELS[delivery.mealType]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[delivery.status]}`}>
                                                {STATUS_LABELS[delivery.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {person?.dietTags?.map((d) => (
                                                    <span key={d} className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-xs" title={DIET_LABELS[d]}>
                                                        🥗
                                                    </span>
                                                ))}
                                                {person?.allergenTags?.map((a) => (
                                                    <span key={a} className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-xs" title={ALLERGEN_LABELS[a]}>
                                                        🚨
                                                    </span>
                                                ))}
                                                {(!person?.dietTags?.length && !person?.allergenTags?.length) && (
                                                    <span className="text-slate-400 text-xs">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canDeliver && (
                                                    <button
                                                        onClick={() => onDeliver?.(delivery)}
                                                        className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition"
                                                    >
                                                        Teslim Et
                                                    </button>
                                                )}
                                                {delivery.status === "PENDING" && !isOnLeave && (
                                                    <button
                                                        onClick={() => onReportIssue?.(delivery)}
                                                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition"
                                                    >
                                                        Sorun
                                                    </button>
                                                )}
                                                {isOnLeave && delivery.status === "PENDING" && (
                                                    <span className="px-3 py-1.5 text-slate-400 text-sm" title="Kişi izinli">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
