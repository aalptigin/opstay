"use client";

import { LeaveOverviewPayload } from "@/lib/leave/types";

interface LeaveKpiProps {
    kpi: LeaveOverviewPayload["kpi"];
    loading?: boolean;
}

export function LeaveKpiCards({ kpi, loading }: LeaveKpiProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
            </div>
        );
    }

    const cards = [
        { label: "Bekleyen Talepler", value: kpi.pendingCount, color: "bg-amber-50 text-amber-700 border-amber-100", icon: "⏳" },
        { label: "Bugün İzinli", value: kpi.todayOutCount, color: "bg-blue-50 text-blue-700 border-blue-100", icon: "🏖️" },
        { label: "Bu Ay Kullanılan", value: kpi.approvedMonthDays + " gün", color: "bg-teal-50 text-teal-700 border-teal-100", icon: "📅" },
        { label: "Çakışma / Risk", value: kpi.conflictsCount, color: kpi.conflictsCount > 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-600 border-slate-200", icon: "⚠️" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((c, i) => (
                <div key={i} className={`p-4 rounded-xl border ${c.color} flex items-center justify-between`}>
                    <div>
                        <p className="text-xs font-semibold uppercase opacity-70 mb-1">{c.label}</p>
                        <p className="text-2xl font-bold">{c.value}</p>
                    </div>
                    <span className="text-2xl">{c.icon}</span>
                </div>
            ))}
        </div>
    );
}
