"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, InventoryItem, InventoryTxn, DepotType, TxnType } from "@/lib/org/types";

const DEPOT_LABELS: Record<DepotType, { label: string; icon: string; color: string }> = {
    cleaning: { label: "Temizlik Deposu", icon: "🧹", color: "text-purple-400" },
    food: { label: "Gıda Deposu", icon: "🍎", color: "text-green-400" },
};

export default function InventoryPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [txns, setTxns] = useState<InventoryTxn[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDepot, setActiveDepot] = useState<DepotType>("cleaning");
    const [showTxnModal, setShowTxnModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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

                const invRes = await fetch("/api/org/inventory");
                const invData = await invRes.json();
                if (invRes.ok) {
                    setItems(invData.items || []);
                    setTxns(invData.txns || []);
                }
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const filteredItems = items.filter((item) => item.depotType === activeDepot);
    const criticalItems = filteredItems.filter((item) => item.currentLevel < item.minLevel);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">DEPO</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Depo Yönetimi</h1>
            <p className="mt-2 text-sm text-white/60">Stok takibi ve giriş/çıkış hareketleri</p>

            {/* Depot Tabs */}
            <div className="mt-6 flex gap-4">
                {(Object.entries(DEPOT_LABELS) as [DepotType, typeof DEPOT_LABELS[DepotType]][]).map(([type, config]) => (
                    <button
                        key={type}
                        onClick={() => setActiveDepot(type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeDepot === type
                                ? "bg-white/10 border border-white/20 text-white"
                                : "bg-white/5 border border-transparent text-white/60 hover:bg-white/10"
                            }`}
                    >
                        <span className="text-lg">{config.icon}</span>
                        <span>{config.label}</span>
                        {items.filter((i) => i.depotType === type && i.currentLevel < i.minLevel).length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                                !
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Critical Alert */}
            {criticalItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                    <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                        ⚠️ Kritik Stok Uyarısı
                    </div>
                    <p className="text-sm text-white/70">
                        {criticalItems.length} ürün kritik seviyenin altında: {criticalItems.map((i) => i.name).join(", ")}
                    </p>
                </motion.div>
            )}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Toplam Ürün</p>
                    <p className="text-2xl font-bold text-white">{filteredItems.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Kritik Seviye</p>
                    <p className={`text-2xl font-bold ${criticalItems.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {criticalItems.length}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bugün Giriş</p>
                    <p className="text-2xl font-bold text-emerald-400">+0</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bugün Çıkış</p>
                    <p className="text-2xl font-bold text-amber-400">-0</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition">
                    + Stok Girişi
                </button>
                <button className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition">
                    - Stok Çıkışı
                </button>
                {(user?.role === "PRESIDENT" || user?.role === "UNIT_MANAGER") && (
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition">
                        + Yeni Ürün
                    </button>
                )}
            </div>

            {/* Items List */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Ürün</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Birim</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase">Mevcut</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase">Min. Seviye</th>
                            <th className="text-center py-3 px-4 text-xs font-medium text-white/50 uppercase">Durum</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item, i) => {
                            const isCritical = item.currentLevel < item.minLevel;
                            const percentage = Math.min(100, (item.currentLevel / item.minLevel) * 100);

                            return (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-white/5 hover:bg-white/5"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                                {activeDepot === "cleaning" ? "🧹" : "🍎"}
                                            </div>
                                            <span className="text-sm font-medium text-white">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-white/70">{item.unit}</td>
                                    <td className={`py-4 px-4 text-right text-sm font-bold ${isCritical ? "text-red-400" : "text-white"}`}>
                                        {item.currentLevel}
                                    </td>
                                    <td className="py-4 px-4 text-right text-sm text-white/50">{item.minLevel}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center">
                                            <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isCritical ? "bg-red-500" : "bg-emerald-500"}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30">
                                                +
                                            </button>
                                            <button className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/30">
                                                −
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
