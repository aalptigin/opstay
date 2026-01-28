"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Role, Vehicle, InventoryItem, VehicleAssignment, LeaveRequest } from "@/lib/org/types";
import { getRoleLabel } from "@/lib/org/rbac";

interface OverviewStats {
    vehicles: {
        available: number;
        inUse: number;
        maintenance: number;
        broken: number;
    };
    inventory: {
        criticalItems: number;
        totalItems: number;
    };
    pendingApprovals: number;
    upcomingDates: { plate: string; type: string; date: string }[];
}

export default function OverviewPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<OverviewStats | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch("/api/org/auth/me");
                const data = await res.json();

                if (!res.ok) {
                    router.push("/org-login");
                    return;
                }

                setUser(data.user);

                // Load stats (in a real app, this would be a separate API call)
                // For now, using mock data
                setStats({
                    vehicles: {
                        available: 1,
                        inUse: 1,
                        maintenance: 0,
                        broken: 0,
                    },
                    inventory: {
                        criticalItems: 1,
                        totalItems: 4,
                    },
                    pendingApprovals: 2,
                    upcomingDates: [
                        { plate: "34 XYZ 456", type: "Sigorta", date: "2026-02-10" },
                        { plate: "34 ABC 123", type: "Muayene", date: "2026-03-20" },
                    ],
                });
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user || !stats) return null;

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">GENEL</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Organizasyon Paneli</h1>
            <p className="mt-2 text-sm text-white/60">Tüm modüllerin özet görünümü</p>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vehicles */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">🚗</span>
                        <Link href="/panel/vehicles" className="text-xs text-blue-400 hover:underline">
                            Detay →
                        </Link>
                    </div>
                    <h3 className="text-sm text-white/60 mb-3">Araç Durumu</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/50">Kullanılabilir</span>
                            <span className="text-emerald-400 font-bold">{stats.vehicles.available}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Kullanımda</span>
                            <span className="text-blue-400 font-bold">{stats.vehicles.inUse}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Bakımda</span>
                            <span className="text-amber-400 font-bold">{stats.vehicles.maintenance}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Arızalı</span>
                            <span className="text-red-400 font-bold">{stats.vehicles.broken}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Inventory */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">📦</span>
                        <Link href="/panel/inventory" className="text-xs text-blue-400 hover:underline">
                            Detay →
                        </Link>
                    </div>
                    <h3 className="text-sm text-white/60 mb-3">Depo Durumu</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/50">Toplam Ürün</span>
                            <span className="text-white font-bold">{stats.inventory.totalItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/50">Kritik Seviye</span>
                            <span className={`font-bold ${stats.inventory.criticalItems > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                {stats.inventory.criticalItems}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Pending Approvals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">⏳</span>
                    </div>
                    <h3 className="text-sm text-white/60 mb-3">Bekleyen Onaylar</h3>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-amber-400">{stats.pendingApprovals}</p>
                        <p className="text-xs text-white/50 mt-1">talep bekliyor</p>
                    </div>
                </motion.div>

                {/* Today's Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">📅</span>
                    </div>
                    <h3 className="text-sm text-white/60 mb-3">Bugünkü İşlemler</h3>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-blue-400">5</p>
                        <p className="text-xs text-white/50 mt-1">işlem yapıldı</p>
                    </div>
                </motion.div>
            </div>

            {/* Upcoming Dates */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10"
            >
                <h3 className="text-lg font-semibold text-white mb-4">⚠️ Yaklaşan Tarihler</h3>
                <div className="space-y-3">
                    {stats.upcomingDates.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div>
                                <p className="text-sm font-medium text-white">{item.plate}</p>
                                <p className="text-xs text-white/50">{item.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-amber-400">{item.date}</p>
                                <p className="text-xs text-white/50">
                                    {Math.ceil((new Date(item.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} gün kaldı
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <Link href="/panel/vehicles">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer text-center">
                        <span className="text-2xl">🚗</span>
                        <p className="text-sm text-emerald-400 mt-2">Araç Yönetimi</p>
                    </div>
                </Link>
                <Link href="/panel/inventory">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer text-center">
                        <span className="text-2xl">📦</span>
                        <p className="text-sm text-amber-400 mt-2">Depo Yönetimi</p>
                    </div>
                </Link>
                <Link href="/panel/maintenance">
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition cursor-pointer text-center">
                        <span className="text-2xl">🔧</span>
                        <p className="text-sm text-purple-400 mt-2">Arıza & Bakım</p>
                    </div>
                </Link>
                <Link href="/panel/audit">
                    <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/20 hover:bg-slate-500/20 transition cursor-pointer text-center">
                        <span className="text-2xl">📝</span>
                        <p className="text-sm text-slate-400 mt-2">Denetim Kayıtları</p>
                    </div>
                </Link>
            </motion.div>
        </div>
    );
}
