"use client";

import { formatTimeAgo, formatDate, formatTime } from "@/lib/audit/utils";
import { AuditLog } from "@/lib/org/types";
import { RESULT_COLORS, SEVERITY_COLORS, RESULT_LABELS, SEVERITY_LABELS } from "@/lib/audit/types";

interface AuditTableProps {
    logs: AuditLog[];
    loading?: boolean;
    onViewDetail: (log: AuditLog) => void;
}

export function AuditTable({ logs, loading, onViewDetail }: AuditTableProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 bg-slate-50 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <span className="text-4xl block mb-4">🔍</span>
                <h3 className="text-lg font-semibold text-slate-800">Kayıt Bulunamadı</h3>
                <p className="text-slate-500">Seçilen kriterlere uygun denetim kaydı yok.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Zaman</th>
                            <th className="px-4 py-3">Kullanıcı</th>
                            <th className="px-4 py-3">Aksiyon</th>
                            <th className="px-4 py-3">Kaynak</th>
                            <th className="px-4 py-3">Sunucu</th>
                            <th className="px-4 py-3">Sonuç</th>
                            <th className="px-4 py-3 text-right">Detay</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => {
                            const resultColor = log.result ? RESULT_COLORS[log.result] || "bg-slate-100" : "bg-green-100 text-green-700";
                            const severityColor = log.severity && log.severity !== "LOW" ? SEVERITY_COLORS[log.severity] : "";
                            const isCritical = log.severity === "CRITICAL";

                            return (
                                <tr
                                    key={log.id}
                                    className={`group hover:bg-slate-50 transition-colors ${isCritical ? "bg-red-50/50" : ""}`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700" title={formatDate(log.createdAt, true)}>
                                                {formatTimeAgo(log.createdAt)}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono hidden group-hover:block">
                                                {formatTime(log.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {log.actorId.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="truncate max-w-[120px]" title={log.actorId}>
                                                {log.actorId}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{log.entityType}</span>
                                            {log.entityId && (
                                                <span className="text-xs text-slate-400 font-mono truncate max-w-[100px]" title={log.entityId}>
                                                    #{log.entityId.slice(-6)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                                        {log.ip}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {log.result && log.result !== "SUCCESS" && (
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold leading-none ${resultColor}`}>
                                                    {RESULT_LABELS[log.result] || log.result}
                                                </span>
                                            )}
                                            {log.severity && log.severity !== "LOW" && (
                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${severityColor}`}>
                                                    {SEVERITY_LABELS[log.severity] || log.severity}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => onViewDetail(log)}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-colors"
                                        >
                                            İncele
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
