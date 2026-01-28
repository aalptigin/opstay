"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Vehicle, VehicleStatus } from "@/lib/org/types";
import { VehicleCreateModal } from "./_components/VehicleCreateModal";
import { VehicleRequestModal } from "./_components/VehicleRequestModal";

const STATUS_CONFIG: Record<VehicleStatus, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    available: { label: "Kullanılabilir", bgColor: "bg-emerald-100", textColor: "text-emerald-700", borderColor: "border-emerald-300" },
    in_use: { label: "Kullanımda", bgColor: "bg-blue-100", textColor: "text-blue-700", borderColor: "border-blue-300" },
    maintenance: { label: "Bakımda", bgColor: "bg-amber-100", textColor: "text-amber-700", borderColor: "border-amber-300" },
    broken: { label: "Arızalı", bgColor: "bg-red-100", textColor: "text-red-700", borderColor: "border-red-300" },
};

export default function OrgVehiclesPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [filterStatus, setFilterStatus] = useState<VehicleStatus | null>(null);

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const authRes = await fetch("/api/org/auth/me");
            const authData = await authRes.json();
            if (!authRes.ok) {
                router.push("/org-login");
                return;
            }
            setUser(authData.user);

            const vehRes = await fetch("/api/org/vehicles");
            const vehData = await vehRes.json();
            if (vehRes.ok) {
                setVehicles(vehData.vehicles || []);
            } else {
                setError(vehData.error || "Araçlar yüklenemedi");
            }
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [router]);

    // Filtered vehicles
    const filteredVehicles = filterStatus
        ? vehicles.filter((v) => v.status === filterStatus)
        : vehicles;

    // Status counts
    const statusCounts = vehicles.reduce(
        (acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            return acc;
        },
        {} as Record<VehicleStatus, number>
    );

    // Handle request click
    const handleRequestClick = (vehicle: Vehicle) => {
        if (vehicle.status !== "available") return;
        setSelectedVehicle(vehicle);
        setRequestModalOpen(true);
    };

    // Handle modal success
    const handleCreateSuccess = () => {
        loadData(); // Refresh data
    };

    const handleRequestSuccess = () => {
        loadData(); // Refresh data
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/org-panel" className="text-slate-400 hover:text-slate-600">
                            ← Geri
                        </Link>
                        <div className="h-6 w-px bg-slate-200" />
                        <h1 className="text-xl font-bold text-slate-800">🚗 Araç Yönetimi</h1>
                    </div>
                    {user?.role !== "STAFF" && (
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition"
                        >
                            + Yeni Araç
                        </button>
                    )}
                </div>
            </nav>

            <div className="p-6">
                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-between">
                        <span>⚠️ {error}</span>
                        <button
                            onClick={loadData}
                            className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                )}

                {/* Status Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {(["available", "in_use", "maintenance", "broken"] as VehicleStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                            className={`bg-white rounded-xl p-4 border-2 shadow-sm transition-all hover:shadow-md ${filterStatus === status
                                    ? STATUS_CONFIG[status].borderColor + " ring-2 ring-offset-2 ring-" + status
                                    : "border-slate-200"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].textColor}`}>
                                    {STATUS_CONFIG[status].label}
                                </span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {statusCounts[status] || 0}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Filter indicator */}
                {filterStatus && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm text-slate-500">Filtre:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[filterStatus].bgColor} ${STATUS_CONFIG[filterStatus].textColor}`}>
                            {STATUS_CONFIG[filterStatus].label}
                        </span>
                        <button
                            onClick={() => setFilterStatus(null)}
                            className="text-sm text-slate-400 hover:text-slate-600"
                        >
                            ✕ Temizle
                        </button>
                    </div>
                )}

                {/* Vehicle Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Araç</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kilometre</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sigorta</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Muayene</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="text-4xl">🚗</span>
                                            <p className="text-slate-500">
                                                {filterStatus ? "Bu durumda araç yok" : "Henüz araç eklenmemiş"}
                                            </p>
                                            {!filterStatus && user?.role !== "STAFF" && (
                                                <button
                                                    onClick={() => setCreateModalOpen(true)}
                                                    className="mt-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200"
                                                >
                                                    + Yeni Araç Ekle
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
                                                    🚗
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{vehicle.plate}</p>
                                                    <p className="text-sm text-slate-500">{vehicle.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[vehicle.status].bgColor} ${STATUS_CONFIG[vehicle.status].textColor}`}>
                                                {STATUS_CONFIG[vehicle.status].label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-700">{vehicle.km.toLocaleString()} km</td>
                                        <td className="py-4 px-6 text-slate-700">{vehicle.insuranceExpiry || "-"}</td>
                                        <td className="py-4 px-6 text-slate-700">{vehicle.inspectionExpiry || "-"}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleRequestClick(vehicle)}
                                                disabled={vehicle.status !== "available"}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold mr-2 transition ${vehicle.status === "available"
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                    }`}
                                                title={vehicle.status !== "available" ? "Araç şu an kullanılabilir değil" : ""}
                                            >
                                                Talep
                                            </button>
                                            <Link
                                                href={`/org-panel/araclar/${vehicle.id}`}
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 inline-block"
                                            >
                                                Detay
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <VehicleCreateModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                userRole={user?.role || "STAFF"}
                userUnitId={user?.unitId}
            />
            <VehicleRequestModal
                isOpen={requestModalOpen}
                vehicle={selectedVehicle}
                onClose={() => {
                    setRequestModalOpen(false);
                    setSelectedVehicle(null);
                }}
                onSuccess={handleRequestSuccess}
            />
        </div>
    );
}
