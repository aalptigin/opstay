"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Role } from "@/lib/org/types";
import { getRoleLabel } from "@/lib/org/rbac";
import { OverviewData } from "@/lib/overview/types";
import { KpiCard, KpiCardSkeleton } from "./_components/KpiCard";
import { RecentActivityList } from "./_components/RecentActivityList";
import { UpcomingDatesList } from "./_components/UpcomingDatesList";
import { QuickActions } from "./_components/QuickActions";
import { GlobalSearch } from "./_components/GlobalSearch";

export default function OrgPanelPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Overview data state
    const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewError, setOverviewError] = useState<string | null>(null);

    // Check auth
    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch("/api/org/auth/me");
                const data = await res.json();
                if (!res.ok) {
                    router.push("/org-login");
                    return;
                }
                setUser(data.user);
            } catch {
                router.push("/org-login");
            } finally {
                setAuthLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    // Load overview data
    useEffect(() => {
        if (!user) return;

        async function loadOverview() {
            try {
                setOverviewLoading(true);
                setOverviewError(null);
                const res = await fetch("/api/overview");
                if (!res.ok) {
                    throw new Error("Failed to load overview data");
                }
                const data = await res.json();
                setOverviewData(data);
            } catch (err) {
                console.error("Error loading overview:", err);
                setOverviewError("Veriler yüklenemedi. Lütfen tekrar deneyin.");
            } finally {
                setOverviewLoading(false);
            }
        }

        loadOverview();
    }, [user]);

    const handleRetry = () => {
        setOverviewError(null);
        setOverviewLoading(true);
        window.location.reload();
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
                        <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Kontrol Paneli</h2>
                    <p className="text-sm text-slate-500">Depo & Organizasyon Özeti</p>
                </div>

                {/* Search and Menu */}
                <div className="flex items-center gap-4">
                    <GlobalSearch placeholder="Ara..." />

                    {/* User Info */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="text-sm">
                            <span className="font-medium text-slate-700">{user?.name}</span>
                            <span className="text-slate-400 ml-1">({user && getRoleLabel(user.role as Role)})</span>
                        </div>
                    </div>

                    <Link href="/panel-secici">
                        <button className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">
                            ← Ana Menü
                        </button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Error State */}
                {overviewError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="font-semibold text-red-800">Hata</p>
                                    <p className="text-sm text-red-600">{overviewError}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {overviewLoading ? (
                        <>
                            <KpiCardSkeleton />
                            <KpiCardSkeleton />
                            <KpiCardSkeleton />
                            <KpiCardSkeleton />
                        </>
                    ) : overviewData ? (
                        <>
                            <KpiCard
                                title="Kullanılabilir Araç"
                                value={overviewData.kpi.availableVehicles}
                                icon="🚗"
                                color="#10b981"
                                borderColor="#10b981"
                                href="/org-panel/araclar?status=available"
                            />
                            <KpiCard
                                title="Kritik Stok"
                                value={overviewData.kpi.criticalStockItems}
                                icon="⚠️"
                                color="#f59e0b"
                                borderColor="#f59e0b"
                                critical={overviewData.kpi.criticalStockItems > 0}
                                href="/org-panel/depo?status=critical"
                            />
                            <KpiCard
                                title="Bekleyen Onay"
                                value={overviewData.kpi.pendingApprovals}
                                icon="⏳"
                                color="#3b82f6"
                                borderColor="#3b82f6"
                                href="/org-panel/onaylar"
                            />
                            <KpiCard
                                title="Açık Arıza"
                                value={overviewData.kpi.openIncidents}
                                icon="🔧"
                                color="#8b5cf6"
                                borderColor="#8b5cf6"
                                href="/org-panel/bakim?status=open"
                            />
                        </>
                    ) : null}
                </div>

                {/* Quick Actions */}
                {overviewData && (
                    <div className="mb-6">
                        <QuickActions actions={overviewData.quickActions} loading={overviewLoading} />
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800">Son Hareketler</h3>
                        </div>
                        <RecentActivityList
                            activities={overviewData?.recentActivity || []}
                            loading={overviewLoading}
                        />
                    </div>

                    {/* Upcoming Dates */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800">Yaklaşan Tarihler</h3>
                        </div>
                        <UpcomingDatesList
                            dates={overviewData?.upcomingDates || []}
                            loading={overviewLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
