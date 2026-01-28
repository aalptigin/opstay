"use client";

import { AuditListResponse } from "@/lib/audit/types";

interface AuditKpiCardsProps {
    aggregates: AuditListResponse["aggregates"];
    loading?: boolean;
    onFilterChange: (key: string, value: any) => void;
}

export function AuditKpiCards({ aggregates, loading, onFilterChange }: AuditKpiCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 h-24 animate-pulse" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            key: "total",
            label: "Toplam Olay",
            value: aggregates.total,
            icon: "📋",
            color: "bg-blue-50 text-blue-700 border-blue-100",
            onClick: () => { /* Clear filters? */ }
        },
        {
            key: "critical",
            label: "Kritik Olaylar",
            value: aggregates.critical,
            icon: "🚨",
            color: "bg-red-50 text-red-700 border-red-100",
            onClick: () => onFilterChange("severity", "CRITICAL")
        },
        {
            key: "fail",
            label: "Başarısız",
            value: aggregates.fail,
            icon: "❌",
            color: "bg-orange-50 text-orange-700 border-orange-100",
            onClick: () => onFilterChange("result", "FAIL")
        },
        {
            key: "suspicious",
            label: "Şüpheli",
            value: aggregates.suspicious,
            icon: "🕵️",
            color: "bg-slate-800 text-white border-slate-700",
            onClick: () => { /* Custom suspicious filter? */ }
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => (
                <button
                    key={card.key}
                    onClick={card.onClick}
                    className={`flex items-start justify-between p-4 rounded-xl border transition-all hover:scale-[1.02] ${card.color}`}
                >
                    <div className="text-left">
                        <p className="text-xs font-semibold uppercase opacity-80 mb-1">{card.label}</p>
                        <p className="text-3xl font-bold">{card.value}</p>
                    </div>
                    <span className="text-2xl opacity-50">{card.icon}</span>
                </button>
            ))}
        </div>
    );
}
