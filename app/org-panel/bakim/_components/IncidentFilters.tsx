"use client";

import { IncidentType, IncidentStatus, IncidentSeverity } from "@/lib/incidents/types";

interface IncidentFiltersProps {
    filters: {
        type: IncidentType | "";
        status: IncidentStatus | "";
        severity: IncidentSeverity | "";
        q: string;
    };
    onChange: (filters: IncidentFiltersProps["filters"]) => void;
}

export function IncidentFilters({ filters, onChange }: IncidentFiltersProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        value={filters.q}
                        onChange={(e) => onChange({ ...filters, q: e.target.value })}
                        placeholder="Kayıt ara (başlık, ref no)..."
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                    />
                </div>

                {/* Type filter */}
                <select
                    value={filters.type}
                    onChange={(e) => onChange({ ...filters, type: e.target.value as IncidentType | "" })}
                    className="px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                >
                    <option value="">Tüm Türler</option>
                    <option value="INCIDENT">🔴 Arıza</option>
                    <option value="MAINTENANCE">🔧 Bakım</option>
                </select>

                {/* Status filter */}
                <select
                    value={filters.status}
                    onChange={(e) => onChange({ ...filters, status: e.target.value as IncidentStatus | "" })}
                    className="px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                >
                    <option value="">Tüm Durumlar</option>
                    <option value="OPEN">Açık</option>
                    <option value="IN_PROGRESS">Devam Ediyor</option>
                    <option value="RESOLVED">Çözüldü</option>
                </select>

                {/* Severity filter */}
                <select
                    value={filters.severity}
                    onChange={(e) => onChange({ ...filters, severity: e.target.value as IncidentSeverity | "" })}
                    className="px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                >
                    <option value="">Tüm Öncelikler</option>
                    <option value="HIGH">Yüksek</option>
                    <option value="MED">Orta</option>
                    <option value="LOW">Düşük</option>
                </select>

                {/* Clear filters */}
                {(filters.type || filters.status || filters.severity || filters.q) && (
                    <button
                        onClick={() => onChange({ type: "", status: "", severity: "", q: "" })}
                        className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium"
                    >
                        ✕ Temizle
                    </button>
                )}
            </div>
        </div>
    );
}
