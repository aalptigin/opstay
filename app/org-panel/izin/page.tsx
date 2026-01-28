"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaveOverviewPayload, LeaveRequest } from "@/lib/leave/types";
import { LeaveKpiCards } from "./_components/LeaveKpiCards";
import { LeaveRequestsList } from "./_components/LeaveRequestsList";
import { LeaveDetailPanel } from "./_components/LeaveDetailPanel";
import { LeaveRequestModal } from "./_components/LeaveRequestModal";
import { LeaveCalendar } from "./_components/LeaveCalendar";
import { LeaveReportDrawer } from "./_components/LeaveReportDrawer";

export default function LeavePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<LeaveOverviewPayload | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [activeTab, setActiveTab] = useState<"requests" | "calendar" | "balances">("requests");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/leave/overview");
            const json = await res.json();
            if (json.ok) {
                setData(json.data);
                // Preserve selection or default
                if (selectedRequest) {
                    const updated = json.data.requests.find((r: LeaveRequest) => r.id === selectedRequest.id);
                    setSelectedRequest(updated || null);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [selectedRequest]);

    useEffect(() => {
        fetchData();
    }, []); // Initial load only

    const handleCreate = async (input: any) => {
        const res = await fetch("/api/leave/requests", {
            method: "POST",
            body: JSON.stringify(input)
        });
        if (res.ok) {
            fetchData();
        } else {
            throw new Error("Failed");
        }
    };

    const handleAction = async (id: string, action: "approve" | "reject", body?: any) => {
        const res = await fetch(`/api/leave/requests/${id}/${action}`, {
            method: "POST",
            body: JSON.stringify(body || {})
        });
        if (res.ok) {
            await fetchData(); // Refresh data to update list and details
        } else {
            alert("İşlem başarısız");
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">İzin Takibi</h1>
                    <p className="text-sm text-slate-500">Personel izinleri ve onay süreçleri</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-600/20 transition"
                    >
                        + İzin Talebi
                    </button>
                    {data?.permissions.canManageBalances && (
                        <button
                            onClick={() => setShowReport(true)}
                            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50"
                        >
                            Rapor
                        </button>
                    )}
                </div>
            </header>

            {/* KPI */}
            <div className="px-6 pt-6 shrink-0">
                {data?.kpi && <LeaveKpiCards kpi={data.kpi} loading={loading && !data} />}
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-200 bg-white sticky top-0 z-10">
                <div className="flex gap-6">
                    {(["requests", "calendar", "balances"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 text-sm font-medium border-b-2 transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                        >
                            {tab === "requests" && "Talepler"}
                            {tab === "calendar" && "Takvim"}
                            {tab === "balances" && "Bakiyeler"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === "requests" && (
                    <div className="h-full flex">
                        {/* List */}
                        <div className="w-1/3 bg-white border-r border-slate-200 overflow-y-auto">
                            <LeaveRequestsList
                                requests={data?.requests || []}
                                loading={loading && !data}
                                activeId={selectedRequest?.id}
                                onSelect={setSelectedRequest}
                            />
                        </div>
                        {/* Details */}
                        <div className="w-2/3 bg-slate-50 overflow-y-auto">
                            <LeaveDetailPanel
                                request={selectedRequest}
                                canApprove={!!data?.permissions.canApprove}
                                onAction={handleAction}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "calendar" && (
                    <div className="h-full p-6 overflow-y-auto">
                        <LeaveCalendar requests={data?.requests || []} />
                    </div>
                )}

                {activeTab === "balances" && (
                    <div className="p-12 text-center text-slate-400">
                        <span className="text-4xl block mb-2">⚖️</span>
                        <p>Bakiye yönetimi geliştirme aşamasındadır.</p>
                        {/* Iterate existing balances here simply if needed */}
                    </div>
                )}
            </div>

            {/* Modals */}
            <LeaveRequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreate}
            />

            <LeaveReportDrawer
                isOpen={showReport}
                onClose={() => setShowReport(false)}
            />
        </div>
    );
}
