"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MealTxn } from "@/lib/org/types";

export default function MealsPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [txns, setTxns] = useState<MealTxn[]>([]);
    const [loading, setLoading] = useState(true);

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

                // Mock data
                setTxns([
                    { id: "mtx_1", unitId: "unit_1", qty: 25, deliveredBy: "Ahmet", receivedBy: "Mehmet", createdAt: new Date().toISOString() },
                    { id: "mtx_2", unitId: "unit_2", qty: 15, deliveredBy: "Ahmet", receivedBy: "Ali", createdAt: new Date().toISOString() },
                    { id: "mtx_3", unitId: "unit_3", qty: 10, deliveredBy: "Ahmet", receivedBy: "Veli", createdAt: new Date(Date.now() - 86400000).toISOString() },
                ]);
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const todayTxns = txns.filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString());
    const todayTotal = todayTxns.reduce((sum, t) => sum + t.qty, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">YEMEK</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Yemek Dağıtımı</h1>
            <p className="mt-2 text-sm text-white/60">Yemek teslim takibi</p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bugün Toplam</p>
                    <p className="text-2xl font-bold text-emerald-400">{todayTotal} porsiyon</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bugün Dağıtım</p>
                    <p className="text-2xl font-bold text-blue-400">{todayTxns.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bu Hafta</p>
                    <p className="text-2xl font-bold text-white">{txns.reduce((s, t) => s + t.qty, 0)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Ortalama</p>
                    <p className="text-2xl font-bold text-white">{Math.round(txns.reduce((s, t) => s + t.qty, 0) / Math.max(1, txns.length))}</p>
                </div>
            </div>

            {/* Add Distribution */}
            <div className="mt-6">
                <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition">
                    + Yeni Dağıtım Kaydı
                </button>
            </div>

            {/* Distribution List */}
            <div className="mt-6 space-y-4">
                {txns.map((txn, i) => (
                    <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl">
                                🍽️
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {txn.qty} porsiyon
                                </p>
                                <p className="text-xs text-white/50">
                                    Teslim: {txn.deliveredBy} → {txn.receivedBy}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/70">
                                {new Date(txn.createdAt).toLocaleDateString("tr-TR")}
                            </p>
                            <p className="text-xs text-white/50">
                                {new Date(txn.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
