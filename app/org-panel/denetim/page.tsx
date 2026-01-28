"use client";

import { useState, useEffect, useCallback } from "react";
import { AuditLog } from "@/lib/org/types";
import { AuditListResponse } from "@/lib/audit/types";
import { AuditKpiCards } from "./_components/AuditKpiCards";
import { AuditFilters } from "./_components/AuditFilters";
import { AuditTable } from "./_components/AuditTable";
import { AuditDetailDrawer } from "./_components/AuditDetailDrawer";

export default function AuditPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AuditListResponse | null>(null);
    const [filters, setFilters] = useState({
        page: 1,
        pageSize: 25,
        sortBy: "createdAt",
        sortDir: "desc"
    });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [liveMode, setLiveMode] = useState(false);

    // Fetch Data
    const fetchData = useCallback(async () => {
        if (!liveMode) setLoading(true);
        try {
            const query = new URLSearchParams();
            Object.entries(filters).forEach(([key, val]) => {
                if (val !== undefined && val !== "") query.append(key, String(val));
            });

            const res = await fetch(`/api/audit/logs?${query.toString()}`);
            const json = await res.json();

            if (json.ok) {
                setData(json);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters, liveMode]);

    // Initial Load & Effect
    useEffect(() => {
        fetchData();

        let interval: NodeJS.Timeout;
        if (liveMode) {
            interval = setInterval(fetchData, 10000); // Poll every 10s
        }
        return () => clearInterval(interval);
    }, [fetchData, liveMode]);

    // Handlers
    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleExport = async (format: "csv" | "json") => {
        try {
            const res = await fetch("/api/audit/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...filters, format })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `audit-export.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert("Dışa aktarma başarısız oldu.");
            }
        } catch (e) {
            console.error(e);
            alert("Bir hata oluştu.");
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Denetim Logları</h1>
                    <p className="text-slate-500 text-sm">Sistem genelindeki tüm kritik işlemleri izleyin ve raporlayın.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setLiveMode(!liveMode)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition ${liveMode ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-slate-600 border-slate-200"}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${liveMode ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
                        Canlı Mod
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-1" />

                    <button
                        onClick={() => handleExport("csv")}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                        📤 CSV İndir
                    </button>
                    <button
                        onClick={() => handleExport("json")}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 shadow-lg shadow-slate-900/10"
                    >
                        Dışa Aktar (JSON)
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            {data?.aggregates && (
                <AuditKpiCards
                    aggregates={data.aggregates}
                    loading={loading && !data}
                    onFilterChange={(k, v) => handleFilterChange({ [k]: v })}
                />
            )}

            {/* Filters */}
            <AuditFilters
                activeFilters={filters}
                onChange={handleFilterChange}
            />

            {/* Table */}
            <AuditTable
                logs={data?.items || []}
                loading={loading && !data}
                onViewDetail={setSelectedLog}
            />

            {/* Pagination */}
            {data && data.total > 0 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <div>
                        Toplam <strong>{data.total}</strong> kayıttan <strong>{(data.page - 1) * data.pageSize + 1}</strong> - <strong>{Math.min(data.page * data.pageSize, data.total)}</strong> arası gösteriliyor
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={data.page === 1}
                            onClick={() => handleFilterChange({ page: data.page - 1 })}
                            className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
                        >
                            Önceki
                        </button>
                        <button
                            disabled={data.page * data.pageSize >= data.total}
                            onClick={() => handleFilterChange({ page: data.page + 1 })}
                            className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
                        >
                            Sonraki
                        </button>
                    </div>
                </div>
            )}

            {/* Detail Drawer */}
            <AuditDetailDrawer
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
            />
        </div>
    );
}
