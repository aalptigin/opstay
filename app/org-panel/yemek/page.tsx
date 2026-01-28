"use client";

import { useState, useEffect, useCallback } from "react";
import { MealOverviewPayload, MealDelivery, MealType, IssueType } from "@/lib/meals/types";
import { MealKpiCards } from "./_components/MealKpiCards";
import { MealPlanCard } from "./_components/MealPlanCard";
import { MealDeliveriesTable } from "./_components/MealDeliveriesTable";
import { DeliveryActionModal } from "./_components/DeliveryActionModal";
import { MealPlanCreateModal } from "./_components/MealPlanCreateModal";

function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}

export default function YemekPage() {
    // Date state
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    // Data state
    const [data, setData] = useState<MealOverviewPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [mealFilter, setMealFilter] = useState<MealType | null>(null);
    const [kpiFilter, setKpiFilter] = useState<string | null>(null);

    // Modal state
    const [createPlanOpen, setCreatePlanOpen] = useState(false);
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        delivery: MealDelivery | null;
        mode: "deliver" | "issue";
    }>({ isOpen: false, delivery: null, mode: "deliver" });
    const [actionLoading, setActionLoading] = useState(false);

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/meals/overview?date=${selectedDate}`);
            const result = await res.json();

            if (result.ok) {
                setData(result);
            } else {
                setError(result.error || "Veriler yüklenemedi");
            }
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter deliveries based on KPI selection
    const getFilteredDeliveries = () => {
        if (!data?.deliveries) return [];
        let deliveries = data.deliveries;

        if (kpiFilter === "delivered") {
            deliveries = deliveries.filter((d) => d.status === "DELIVERED");
        } else if (kpiFilter === "pending") {
            deliveries = deliveries.filter((d) => d.status === "PENDING");
        } else if (kpiFilter === "issues") {
            deliveries = deliveries.filter((d) => d.status === "ISSUE" || d.status === "CANCELLED");
        }

        return deliveries;
    };

    // Handlers
    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        setKpiFilter(null);
        setMealFilter(null);
    };

    const handleKpiFilter = (filter: string | null) => {
        setKpiFilter(filter);
    };

    const handleDeliver = (delivery: MealDelivery) => {
        setActionModal({ isOpen: true, delivery, mode: "deliver" });
    };

    const handleReportIssue = (delivery: MealDelivery) => {
        setActionModal({ isOpen: true, delivery, mode: "issue" });
    };

    const handleActionConfirm = async (input: { action: "DELIVER" | "ISSUE"; note?: string; issueType?: IssueType }) => {
        if (!actionModal.delivery) return;

        setActionLoading(true);
        try {
            const res = await fetch("/api/meals/deliveries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDate,
                    mealType: actionModal.delivery.mealType,
                    personId: actionModal.delivery.personId,
                    action: input.action,
                    note: input.note,
                    issueType: input.issueType,
                }),
            });

            if (res.ok) {
                setActionModal({ isOpen: false, delivery: null, mode: "deliver" });
                loadData();
            }
        } catch (err) {
            console.error("Action error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">🍽️ Yemek Dağıtımı</h2>
                        <p className="text-sm text-slate-500">Günlük yemek planı ve dağıtım takibi</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Date picker */}
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                            <button
                                onClick={() => handleDateChange(getTodayDate())}
                                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                            >
                                Bugün
                            </button>
                        </div>

                        {/* Actions */}
                        {data?.permissions?.canPlan && (
                            <button
                                onClick={() => setCreatePlanOpen(true)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition"
                            >
                                + Yeni Plan
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                        <span className="text-red-700">⚠️ {error}</span>
                        <button
                            onClick={loadData}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                        >
                            Yeniden Dene
                        </button>
                    </div>
                )}

                {/* KPI Cards */}
                <MealKpiCards
                    kpi={data?.kpi || { planned: 0, delivered: 0, pending: 0, issues: 0 }}
                    loading={loading && !data}
                    activeFilter={kpiFilter}
                    onFilterChange={handleKpiFilter}
                />

                {/* Two column layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Plan Card (1/3) */}
                    <div className="lg:col-span-1">
                        <MealPlanCard
                            plan={data?.plan || null}
                            loading={loading && !data}
                            onCreatePlan={data?.permissions?.canPlan ? () => setCreatePlanOpen(true) : undefined}
                        />
                    </div>

                    {/* Deliveries Table (2/3) */}
                    <div className="lg:col-span-2">
                        <MealDeliveriesTable
                            deliveries={getFilteredDeliveries()}
                            loading={loading && !data}
                            mealFilter={mealFilter}
                            onMealFilterChange={setMealFilter}
                            onDeliver={data?.permissions?.canDeliver ? handleDeliver : undefined}
                            onReportIssue={data?.permissions?.canDeliver ? handleReportIssue : undefined}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MealPlanCreateModal
                isOpen={createPlanOpen}
                date={selectedDate}
                onClose={() => setCreatePlanOpen(false)}
                onSuccess={loadData}
            />

            <DeliveryActionModal
                isOpen={actionModal.isOpen}
                delivery={actionModal.delivery}
                mode={actionModal.mode}
                onClose={() => setActionModal({ isOpen: false, delivery: null, mode: "deliver" })}
                onConfirm={handleActionConfirm}
                loading={actionLoading}
            />
        </div>
    );
}
