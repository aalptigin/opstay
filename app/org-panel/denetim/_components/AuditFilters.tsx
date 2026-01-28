"use client";

import { useState, useEffect } from "react";
import { ENTITY_TYPES, AUDIT_RESULTS, AUDIT_SEVERITIES } from "@/lib/audit/types";

interface AuditFiltersProps {
    onChange: (filters: any) => void;
    activeFilters: any;
}

export function AuditFilters({ onChange, activeFilters }: AuditFiltersProps) {
    const [actionOptions, setActionOptions] = useState<string[]>([]);

    // Fetch unique actions for autocomplete
    useEffect(() => {
        fetch("/api/audit/actions")
            .then(res => res.json())
            .then(data => {
                if (data.ok && Array.isArray(data.actions)) {
                    setActionOptions(data.actions);
                }
            })
            .catch(() => { });
    }, []);

    const handleChange = (key: string, value: any) => {
        onChange({ ...activeFilters, [key]: value || undefined, page: 1 }); // Reset page on filter
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 block">Detaylı Filtreleme</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Search */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Arama</label>
                    <input
                        type="text"
                        placeholder="ID, User, IP..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 transition"
                        value={activeFilters.q || ""}
                        onChange={(e) => handleChange("q", e.target.value)}
                    />
                </div>

                {/* Entity Type */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Kaynak Tipi</label>
                    <select
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white"
                        value={activeFilters.entityType || ""}
                        onChange={(e) => handleChange("entityType", e.target.value)}
                    >
                        <option value="">Tümü</option>
                        {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Result */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Sonuç</label>
                    <select
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white"
                        value={activeFilters.result || ""}
                        onChange={(e) => handleChange("result", e.target.value)}
                    >
                        <option value="">Tümü</option>
                        {AUDIT_RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {/* Severity */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Önem Derecesi</label>
                    <select
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white"
                        value={activeFilters.severity || ""}
                        onChange={(e) => handleChange("severity", e.target.value)}
                    >
                        <option value="">Tümü</option>
                        {AUDIT_SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* From Date */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Başlangıç</label>
                    <input
                        type="datetime-local"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                        value={activeFilters.fromDate?.substring(0, 16) || ""}
                        onChange={(e) => handleChange("fromDate", e.target.value)}
                    />
                </div>

                {/* To Date */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Bitiş</label>
                    <input
                        type="datetime-local"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                        value={activeFilters.toDate?.substring(0, 16) || ""}
                        onChange={(e) => handleChange("toDate", e.target.value)}
                    />
                </div>

                {/* Action Autocomplete (Simple Select for now) */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Aksiyon</label>
                    <select
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white"
                        value={activeFilters.actionPrefix || ""}
                        onChange={(e) => handleChange("actionPrefix", e.target.value)}
                    >
                        <option value="">Tümü</option>
                        {actionOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={() => onChange({ page: 1, pageSize: 25 })}
                        className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition"
                    >
                        Filtreleri Sıfırla
                    </button>
                </div>

            </div>
        </div>
    );
}
