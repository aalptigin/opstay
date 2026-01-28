"use client";

import { IncidentStats } from "@/lib/incidents/types";

interface IncidentKpiCardsProps {
    stats: IncidentStats;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    loading?: boolean;
}

interface KpiCard {
    key: string;
    label: string;
    value: number;
    icon: string;
    color: string;
    bgColor: string;
}

export function IncidentKpiCards({
    stats,
    activeFilter,
    onFilterChange,
    loading,
}: IncidentKpiCardsProps) {
    const cards: KpiCard[] = [
        {
            key: "OPEN",
            label: "Açık Arıza",
            value: stats.open,
            icon: "🔴",
            color: "text-red-600",
            bgColor: "bg-red-50 border-red-200 hover:bg-red-100",
        },
        {
            key: "IN_PROGRESS",
            label: "Devam Eden",
            value: stats.inProgress,
            icon: "🔵",
            color: "text-blue-600",
            bgColor: "bg-blue-50 border-blue-200 hover:bg-blue-100",
        },
        {
            key: "MAINTENANCE",
            label: "Planlı Bakım",
            value: stats.maintenance,
            icon: "🔧",
            color: "text-amber-600",
            bgColor: "bg-amber-50 border-amber-200 hover:bg-amber-100",
        },
        {
            key: "CRITICAL",
            label: "Bugün Kritik",
            value: stats.criticalToday,
            icon: "⚡",
            color: "text-purple-600",
            bgColor: "bg-purple-50 border-purple-200 hover:bg-purple-100",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse"
                    >
                        <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                        <div className="h-8 bg-slate-200 rounded w-12" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => (
                <button
                    key={card.key}
                    onClick={() => onFilterChange(activeFilter === card.key ? null : card.key)}
                    className={`text-left rounded-xl p-4 border transition-all ${activeFilter === card.key
                            ? `${card.bgColor} ring-2 ring-offset-1 ring-slate-400`
                            : `bg-white border-slate-200 hover:bg-slate-50`
                        }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">{card.label}</span>
                        <span className="text-lg">{card.icon}</span>
                    </div>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    {activeFilter === card.key && (
                        <span className="text-xs text-slate-500 mt-1 block">Tıklayarak temizle</span>
                    )}
                </button>
            ))}
        </div>
    );
}
