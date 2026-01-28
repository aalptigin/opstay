"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, InventoryItem, DepotType } from "@/lib/org/types";
import { InventoryInModal } from "./_components/InventoryInModal";
import { InventoryOutModal } from "./_components/InventoryOutModal";

export default function OrgInventoryPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<DepotType>("cleaning");

    // Modal states
    const [inModalOpen, setInModalOpen] = useState(false);
    const [outModalOpen, setOutModalOpen] = useState(false);

    // Quick action loading state
    const [quickLoading, setQuickLoading] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setError(null);
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
            } else {
                setError(invData.error || "Envanter yüklenemedi");
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

    const filteredItems = items.filter((i) => i.depotType === activeTab);
    const criticalCount = filteredItems.filter((i) => i.currentLevel < i.minLevel).length;

    // Quick +/- handlers
    const handleQuickIn = async (item: InventoryItem) => {
        setQuickLoading(item.id + "-in");
        try {
            const res = await fetch("/api/org/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: item.id,
                    type: "in",
                    qty: 1,
                    notes: "Hızlı giriş (+1)",
                    source: "quick",
                }),
            });

            if (res.ok) {
                await loadData();
            }
        } catch (err) {
            console.error("Quick in error:", err);
        } finally {
            setQuickLoading(null);
        }
    };

    const handleQuickOut = async (item: InventoryItem) => {
        if (item.currentLevel === 0) return;

        setQuickLoading(item.id + "-out");
        try {
            const res = await fetch("/api/org/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: item.id,
                    type: "out",
                    qty: 1,
                    notes: "Hızlı çıkış (-1)",
                    source: "quick",
                }),
            });

            if (res.ok) {
                await loadData();
            }
        } catch (err) {
            console.error("Quick out error:", err);
        } finally {
            setQuickLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
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
                        <h1 className="text-xl font-bold text-slate-800">📦 Depo & Stok Yönetimi</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setInModalOpen(true)}
                            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition"
                        >
                            + Giriş
                        </button>
                        <button
                            onClick={() => setOutModalOpen(true)}
                            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition"
                        >
                            − Çıkış
                        </button>
                    </div>
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

                {/* Depot Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("cleaning")}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${activeTab === "cleaning"
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        🧹 Temizlik Deposu
                        {items.filter(i => i.depotType === "cleaning" && i.currentLevel < i.minLevel).length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                                {items.filter(i => i.depotType === "cleaning" && i.currentLevel < i.minLevel).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("food")}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${activeTab === "food"
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        🍎 Gıda Deposu
                        {items.filter(i => i.depotType === "food" && i.currentLevel < i.minLevel).length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                                {items.filter(i => i.depotType === "food" && i.currentLevel < i.minLevel).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Critical Alert */}
                {criticalCount > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-800">Kritik Stok Uyarısı</p>
                            <p className="text-sm text-red-600">{criticalCount} ürün minimum seviyenin altında</p>
                        </div>
                    </div>
                )}

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <span className="text-4xl block mb-3">📦</span>
                        <p className="text-slate-500 mb-4">Bu depoda henüz ürün yok</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item) => {
                            const isCritical = item.currentLevel < item.minLevel;
                            const percentage = Math.min(100, (item.currentLevel / Math.max(item.minLevel, 1)) * 100);
                            const isQuickLoading = quickLoading?.startsWith(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-xl p-5 border shadow-sm transition hover:shadow-md ${isCritical ? "border-red-300" : "border-slate-200"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{item.name}</h3>
                                            <p className="text-sm text-slate-500">{item.unit}</p>
                                        </div>
                                        {isCritical && (
                                            <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold animate-pulse">
                                                Kritik!
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-end justify-between mb-3">
                                        <div>
                                            <p className="text-3xl font-bold text-slate-800">{item.currentLevel}</p>
                                            <p className="text-xs text-slate-400">Min: {item.minLevel}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleQuickIn(item)}
                                                disabled={isQuickLoading}
                                                className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 font-bold hover:bg-emerald-200 disabled:opacity-50 transition flex items-center justify-center"
                                            >
                                                {quickLoading === item.id + "-in" ? (
                                                    <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    "+"
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleQuickOut(item)}
                                                disabled={item.currentLevel === 0 || isQuickLoading}
                                                className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 font-bold hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                                                title={item.currentLevel === 0 ? "Stok yok" : ""}
                                            >
                                                {quickLoading === item.id + "-out" ? (
                                                    <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    "−"
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${isCritical ? "bg-red-500" : "bg-emerald-500"}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            <InventoryInModal
                isOpen={inModalOpen}
                depotType={activeTab}
                items={items}
                onClose={() => setInModalOpen(false)}
                onSuccess={loadData}
            />
            <InventoryOutModal
                isOpen={outModalOpen}
                depotType={activeTab}
                items={items}
                onClose={() => setOutModalOpen(false)}
                onSuccess={loadData}
            />
        </div>
    );
}
