"use client";

import { Incident } from "@/lib/incidents/types";

interface IncidentsTableProps {
    items: Incident[];
    loading?: boolean;
    onViewDetail: (id: string) => void;
    onStatusChange?: (id: string, status: string) => void;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    OPEN: { label: "Açık", className: "bg-red-100 text-red-700" },
    IN_PROGRESS: { label: "Devam Ediyor", className: "bg-blue-100 text-blue-700" },
    RESOLVED: { label: "Çözüldü", className: "bg-green-100 text-green-700" },
};

const SEVERITY_BADGES: Record<string, { label: string; className: string }> = {
    LOW: { label: "Düşük", className: "bg-slate-100 text-slate-600" },
    MED: { label: "Orta", className: "bg-amber-100 text-amber-700" },
    HIGH: { label: "Yüksek", className: "bg-red-100 text-red-700" },
};

const TYPE_LABELS: Record<string, string> = {
    INCIDENT: "Arıza",
    MAINTENANCE: "Bakım",
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getDueStatus(dueAt: string | null | undefined): { label: string; className: string } | null {
    if (!dueAt) return null;
    const now = new Date();
    const due = new Date(dueAt);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) {
        return { label: "SLA Aşıldı", className: "bg-red-500 text-white" };
    }
    if (diffHours < 4) {
        return { label: `${diffHours}s kaldı`, className: "bg-amber-500 text-white" };
    }
    if (diffHours < 24) {
        return { label: `${diffHours}s kaldı`, className: "bg-blue-100 text-blue-700" };
    }
    const diffDays = Math.floor(diffHours / 24);
    return { label: `${diffDays}g kaldı`, className: "bg-slate-100 text-slate-600" };
}

export function IncidentsTable({
    items,
    loading,
    onViewDetail,
}: IncidentsTableProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <span className="text-4xl block mb-3">📋</span>
                <h3 className="font-semibold text-slate-700 mb-2">Henüz kayıt yok</h3>
                <p className="text-slate-500 text-sm">Yeni arıza bildirimi veya planlı bakım ekleyin</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kayıt</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Öncelik</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sorumlu</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tarih</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">SLA</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => {
                            const statusBadge = STATUS_BADGES[item.status];
                            const severityBadge = SEVERITY_BADGES[item.severity];
                            const dueStatus = item.status !== "RESOLVED" ? getDueStatus(item.dueAt) : null;

                            return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-800">{item.title}</p>
                                            <p className="text-xs text-slate-500">
                                                {item.refNo} • {TYPE_LABELS[item.type]}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                            {statusBadge.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityBadge.className}`}>
                                            {severityBadge.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.assignedTo ? (
                                            <span className="text-sm text-slate-700">{item.assignedTo.name}</span>
                                        ) : (
                                            <span className="text-sm text-slate-400">Atanmadı</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-slate-600">{formatDate(item.createdAt)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {dueStatus ? (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${dueStatus.className}`}>
                                                {dueStatus.label}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => onViewDetail(item.id)}
                                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            Detay
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
