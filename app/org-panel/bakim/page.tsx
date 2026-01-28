"use client";

import { useState, useEffect, useCallback } from "react";
import { Incident, IncidentStats, IncidentType, IncidentStatus, IncidentSeverity } from "@/lib/incidents/types";
import { IncidentKpiCards } from "./_components/IncidentKpiCards";
import { IncidentFilters } from "./_components/IncidentFilters";
import { IncidentsTable } from "./_components/IncidentsTable";
import { IncidentCreateModal } from "./_components/IncidentCreateModal";
import { IncidentDetailDrawer } from "./_components/IncidentDetailDrawer";

export default function BakimPage() {
    // Data state
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [stats, setStats] = useState<IncidentStats>({ open: 0, inProgress: 0, maintenance: 0, criticalToday: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [kpiFilter, setKpiFilter] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        type: "" as IncidentType | "",
        status: "" as IncidentStatus | "",
        severity: "" as IncidentSeverity | "",
        q: "",
    });

    // UI state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Build query params
            const params = new URLSearchParams();
            if (filters.type) params.append("type", filters.type);
            if (filters.status) params.append("status", filters.status);
            if (filters.severity) params.append("severity", filters.severity);
            if (filters.q) params.append("q", filters.q);

            // Apply KPI filter
            if (kpiFilter) {
                if (kpiFilter === "OPEN") {
                    params.set("status", "OPEN");
                } else if (kpiFilter === "IN_PROGRESS") {
                    params.set("status", "IN_PROGRESS");
                } else if (kpiFilter === "MAINTENANCE") {
                    params.set("type", "MAINTENANCE");
                } else if (kpiFilter === "CRITICAL") {
                    params.set("severity", "HIGH");
                }
            }

            const res = await fetch(`/api/incidents?${params.toString()}`);
            const data = await res.json();

            if (data.ok) {
                setIncidents(data.items);
                setStats(data.stats);
            } else {
                setError(data.error || "Veriler yüklenemedi");
            }
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    }, [filters, kpiFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle KPI card click
    const handleKpiFilterChange = (filter: string | null) => {
        setKpiFilter(filter);
        // Reset regular filters when using KPI filter
        if (filter) {
            setFilters({ type: "", status: "", severity: "", q: "" });
        }
    };

    // Handle view detail
    const handleViewDetail = (id: string) => {
        setDetailId(id);
        setDetailOpen(true);
    };

    // Handle success (refresh data)
    const handleSuccess = () => {
        loadData();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">🔧 Bakım & Arıza</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Arıza bildirimleri ve planlı bakım takibi
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition flex items-center gap-2"
                    >
                        <span>🔴</span>
                        Arıza Bildir
                    </button>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition flex items-center gap-2"
                    >
                        <span>🔧</span>
                        Planlı Bakım
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <IncidentKpiCards
                stats={stats}
                activeFilter={kpiFilter}
                onFilterChange={handleKpiFilterChange}
                loading={loading && incidents.length === 0}
            />

            {/* Filters */}
            <IncidentFilters
                filters={filters}
                onChange={(newFilters) => {
                    setFilters(newFilters);
                    setKpiFilter(null); // Clear KPI filter when using regular filters
                }}
            />

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <span className="text-red-700">⚠️ {error}</span>
                    <button
                        onClick={loadData}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                    >
                        Yeniden Dene
                    </button>
                </div>
            )}

            {/* Table */}
            <IncidentsTable
                items={incidents}
                loading={loading}
                onViewDetail={handleViewDetail}
            />

            {/* Create Modal */}
            <IncidentCreateModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleSuccess}
            />

            {/* Detail Drawer */}
            <IncidentDetailDrawer
                incidentId={detailId}
                isOpen={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setDetailId(null);
                }}
                onUpdate={handleSuccess}
            />
        </div>
    );
}
