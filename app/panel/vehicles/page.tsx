"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Vehicle, VehicleStatus } from "@/lib/org/types";

const STATUS_LABELS: Record<VehicleStatus, { label: string; color: string }> = {
    available: { label: "Kullanılabilir", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    in_use: { label: "Kullanımda", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    maintenance: { label: "Bakımda", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    broken: { label: "Arızalı", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function VehiclesPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<VehicleStatus | "all">("all");

    useEffect(() => {
        async function loadData() {
            try {
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
                }
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const filteredVehicles = filter === "all"
        ? vehicles
        : vehicles.filter((v) => v.status === filter);

    const getDaysUntil = (date?: string): number | null => {
        if (!date) return null;
        return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">ARAÇ</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Araç Yönetimi</h1>
            <p className="mt-2 text-sm text-white/60">Araç envanteri, talep ve bakım takibi</p>

            {/* Filters & Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                    {(["all", "available", "in_use", "maintenance", "broken"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/5 text-white/70 hover:bg-white/10"
                                }`}
                        >
                            {status === "all" ? "Tümü" : STATUS_LABELS[status].label}
                        </button>
                    ))}
                </div>

                {(user?.role === "PRESIDENT" || user?.role === "UNIT_MANAGER") && (
                    <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition">
                        + Yeni Araç Ekle
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["available", "in_use", "maintenance", "broken"] as VehicleStatus[]).map((status) => (
                    <div key={status} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${STATUS_LABELS[status].color}`}>
                            {STATUS_LABELS[status].label}
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">
                            {vehicles.filter((v) => v.status === status).length}
                        </p>
                    </div>
                ))}
            </div>

            {/* Vehicle List */}
            <div className="mt-6 space-y-4">
                {filteredVehicles.map((vehicle, i) => {
                    const insuranceDays = getDaysUntil(vehicle.insuranceExpiry);
                    const inspectionDays = getDaysUntil(vehicle.inspectionExpiry);
                    const hasWarning = (insuranceDays !== null && insuranceDays <= 30) || (inspectionDays !== null && inspectionDays <= 30);

                    return (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-5 rounded-xl bg-white/5 border ${hasWarning ? "border-amber-500/30" : "border-white/10"} hover:bg-white/10 transition`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                                        🚗
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{vehicle.plate}</h3>
                                        <p className="text-sm text-white/60">{vehicle.model}</p>
                                    </div>
                                </div>

                                <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_LABELS[vehicle.status].color}`}>
                                    {STATUS_LABELS[vehicle.status].label}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-white/50">Kilometre</p>
                                    <p className="text-white font-medium">{vehicle.km.toLocaleString()} km</p>
                                </div>
                                <div>
                                    <p className="text-white/50">Sigorta Bitiş</p>
                                    <p className={`font-medium ${insuranceDays !== null && insuranceDays <= 30 ? "text-amber-400" : "text-white"}`}>
                                        {vehicle.insuranceExpiry || "-"}
                                        {insuranceDays !== null && insuranceDays <= 30 && (
                                            <span className="ml-1 text-xs">({insuranceDays} gün)</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/50">Muayene Bitiş</p>
                                    <p className={`font-medium ${inspectionDays !== null && inspectionDays <= 30 ? "text-amber-400" : "text-white"}`}>
                                        {vehicle.inspectionExpiry || "-"}
                                        {inspectionDays !== null && inspectionDays <= 30 && (
                                            <span className="ml-1 text-xs">({inspectionDays} gün)</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-end gap-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500">
                                        Talep Oluştur
                                    </button>
                                    <Link href={`/panel/vehicles/${vehicle.id}`}>
                                        <button className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20">
                                            Detay
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {filteredVehicles.length === 0 && (
                    <div className="p-12 text-center text-white/50">
                        <p className="text-4xl mb-2">🚗</p>
                        <p>Bu kategoride araç bulunmuyor</p>
                    </div>
                )}
            </div>
        </div>
    );
}
