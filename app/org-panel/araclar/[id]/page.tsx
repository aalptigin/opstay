"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Vehicle, VehicleAssignment, MaintenanceTicket, User, VehicleStatus } from "@/lib/org/types";

const STATUS_CONFIG: Record<VehicleStatus, { label: string; bgColor: string; textColor: string }> = {
    available: { label: "Kullanılabilir", bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
    in_use: { label: "Kullanımda", bgColor: "bg-blue-100", textColor: "text-blue-700" },
    maintenance: { label: "Bakımda", bgColor: "bg-amber-100", textColor: "text-amber-700" },
    broken: { label: "Arızalı", bgColor: "bg-red-100", textColor: "text-red-700" },
};

const ASSIGNMENT_STATUS: Record<string, { label: string; color: string }> = {
    pending: { label: "Beklemede", color: "bg-amber-100 text-amber-700" },
    approved: { label: "Onaylandı", color: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
    in_progress: { label: "Devam Ediyor", color: "bg-blue-100 text-blue-700" },
    completed: { label: "Tamamlandı", color: "bg-slate-100 text-slate-700" },
};

export default function VehicleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id as string;

    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"info" | "history" | "maintenance">("info");

    useEffect(() => {
        async function loadData() {
            try {
                // Auth
                const authRes = await fetch("/api/org/auth/me");
                if (!authRes.ok) {
                    router.push("/org-login");
                    return;
                }
                const authData = await authRes.json();
                setUser(authData.user);

                // Vehicle detail
                const vehRes = await fetch(`/api/org/vehicles/${vehicleId}`);
                if (!vehRes.ok) {
                    const data = await vehRes.json();
                    setError(data.error || "Araç bulunamadı");
                    setLoading(false);
                    return;
                }

                const vehData = await vehRes.json();
                setVehicle(vehData.vehicle);
                setAssignments(vehData.assignments || []);
                setTickets(vehData.tickets || []);
            } catch {
                setError("Veriler yüklenemedi");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router, vehicleId]);

    // Date helpers
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("tr-TR");
    };

    const getDaysRemaining = (dateStr?: string) => {
        if (!dateStr) return null;
        const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getExpiryBadge = (dateStr?: string) => {
        const days = getDaysRemaining(dateStr);
        if (days === null) return null;
        if (days < 0) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Süresi Doldu</span>;
        if (days <= 7) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">{days} gün</span>;
        if (days <= 30) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">{days} gün</span>;
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">{days} gün</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
                <p className="text-slate-500">Yükleniyor...</p>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
                <p className="text-red-500 mb-4">⚠️ {error || "Araç bulunamadı"}</p>
                <Link href="/org-panel/araclar" className="text-blue-500 hover:underline">
                    ← Araç Listesine Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/org-panel/araclar" className="text-slate-400 hover:text-slate-600">
                            ← Geri
                        </Link>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">🚗 {vehicle.plate}</h1>
                            <p className="text-sm text-slate-500">{vehicle.model}</p>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${STATUS_CONFIG[vehicle.status].bgColor} ${STATUS_CONFIG[vehicle.status].textColor}`}>
                        {STATUS_CONFIG[vehicle.status].label}
                    </span>
                </div>
            </nav>

            <div className="p-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: "info", label: "Bilgiler" },
                        { id: "history", label: "Kullanım Geçmişi" },
                        { id: "maintenance", label: "Bakım Kayıtları" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                                    ? "bg-white shadow text-slate-800"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "info" && (
                    <div className="grid grid-cols-2 gap-6">
                        {/* Main Info */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Araç Bilgileri</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-500">Plaka</span>
                                    <span className="font-medium text-slate-800">{vehicle.plate}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-500">Model</span>
                                    <span className="font-medium text-slate-800">{vehicle.model}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-500">Kilometre</span>
                                    <span className="font-medium text-slate-800">{vehicle.km.toLocaleString()} km</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-slate-500">Kayıt Tarihi</span>
                                    <span className="font-medium text-slate-800">{formatDate(vehicle.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Önemli Tarihler</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-500">Sigorta Bitiş</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-800">{formatDate(vehicle.insuranceExpiry)}</span>
                                        {getExpiryBadge(vehicle.insuranceExpiry)}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-slate-500">Muayene Bitiş</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-800">{formatDate(vehicle.inspectionExpiry)}</span>
                                        {getExpiryBadge(vehicle.inspectionExpiry)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Amaç</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Durum</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">KM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400">
                                            Henüz kullanım kaydı yok
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((a) => (
                                        <tr key={a.id} className="border-t border-slate-100">
                                            <td className="py-3 px-4 text-slate-700">{formatDate(a.createdAt)}</td>
                                            <td className="py-3 px-4 text-slate-700">{a.purpose || "-"}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${ASSIGNMENT_STATUS[a.status]?.color || "bg-slate-100 text-slate-700"}`}>
                                                    {ASSIGNMENT_STATUS[a.status]?.label || a.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-700">
                                                {a.startKm && a.endKm ? `${a.startKm} → ${a.endKm}` : "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "maintenance" && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tür</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Öncelik</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Durum</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Notlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            Henüz bakım kaydı yok
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((t) => (
                                        <tr key={t.id} className="border-t border-slate-100">
                                            <td className="py-3 px-4 text-slate-700">{formatDate(t.createdAt)}</td>
                                            <td className="py-3 px-4 text-slate-700">{t.type}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${t.priority === "urgent" ? "bg-red-100 text-red-700" :
                                                        t.priority === "high" ? "bg-amber-100 text-amber-700" :
                                                            "bg-slate-100 text-slate-700"
                                                    }`}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-700">{t.status}</td>
                                            <td className="py-3 px-4 text-slate-500 text-sm">{t.notes || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
