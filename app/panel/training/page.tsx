"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, TrainingLog } from "@/lib/org/types";

export default function TrainingPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [logs, setLogs] = useState<TrainingLog[]>([]);
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
                const now = new Date();
                setLogs([
                    { id: "trn_1", userId: "usr_staff1", trainingType: "İş Güvenliği", instructor: "Ahmet Hoca", location: "Toplantı Salonu", inTime: new Date(now.getTime() - 3600000 * 2).toISOString(), createdAt: now.toISOString() },
                    { id: "trn_2", userId: "usr_manager1", trainingType: "Liderlik", instructor: "Mehmet Bey", location: "Online", inTime: new Date(now.getTime() - 3600000 * 4).toISOString(), outTime: new Date(now.getTime() - 3600000).toISOString(), createdAt: now.toISOString() },
                ]);
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const activeTrainings = logs.filter((l) => !l.outTime);
    const completedToday = logs.filter((l) => l.outTime && new Date(l.createdAt).toDateString() === new Date().toDateString());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">EĞİTİM</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Eğitim Takibi</h1>
            <p className="mt-2 text-sm text-white/60">Eğitim giriş/çıkış kayıtları</p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400/70 text-sm">Şu An Eğitimde</p>
                    <p className="text-3xl font-bold text-emerald-400">{activeTrainings.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bugün Tamamlanan</p>
                    <p className="text-2xl font-bold text-white">{completedToday.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Toplam Kayıt</p>
                    <p className="text-2xl font-bold text-white">{logs.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Ortalama Süre</p>
                    <p className="text-2xl font-bold text-white">2.5 saat</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition">
                    + Eğitim Girişi
                </button>
                <button className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition">
                    Eğitim Çıkışı
                </button>
            </div>

            {/* Active Trainings */}
            {activeTrainings.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">🟢 Şu An Eğitimde</h3>
                    <div className="space-y-3">
                        {activeTrainings.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl">
                                        📚
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{log.trainingType}</p>
                                        <p className="text-xs text-white/50">
                                            Eğitmen: {log.instructor || "-"} | Yer: {log.location || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-emerald-400">
                                        {new Date(log.inTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                    <button className="mt-1 px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/30">
                                        Çıkış Yap
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Trainings */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Tamamlanan Eğitimler</h3>
                <div className="space-y-3">
                    {logs.filter((l) => l.outTime).map((log, i) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                                    ✅
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{log.trainingType}</p>
                                    <p className="text-xs text-white/50">
                                        Eğitmen: {log.instructor || "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right text-sm text-white/70">
                                <p>{new Date(log.inTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - {new Date(log.outTime!).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
                                <p className="text-xs text-white/50">
                                    {Math.round((new Date(log.outTime!).getTime() - new Date(log.inTime).getTime()) / 3600000 * 10) / 10} saat
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
