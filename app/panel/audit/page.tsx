"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, AuditLog } from "@/lib/org/types";
import { getActionLabel } from "@/lib/org/audit";

const MODULE_LABELS: Record<string, string> = {
    auth: "Kimlik Doğrulama",
    vehicles: "Araç",
    inventory: "Depo",
    meals: "Yemek",
    maintenance: "Bakım",
    leave: "İzin",
    training: "Eğitim",
};

export default function AuditPage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterModule, setFilterModule] = useState<string>("all");

    useEffect(() => {
        async function loadData() {
            try {
                const authRes = await fetch("/api/org/auth/me");
                const authData = await authRes.json();
                if (!authRes.ok || authData.user?.role !== "PRESIDENT") {
                    router.push("/panel/home");
                    return;
                }
                setUser(authData.user);

                const auditRes = await fetch("/api/org/audit");
                const auditData = await auditRes.json();
                if (auditRes.ok) {
                    setLogs(auditData.logs || []);
                }
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const filteredLogs = filterModule === "all"
        ? logs
        : logs.filter((l) => l.module === filterModule);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("tr-TR");
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
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">DENETİM</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Denetim Kayıtları</h1>
            <p className="mt-2 text-sm text-white/60">Tüm sistem işlemlerinin kaydı</p>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterModule("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterModule === "all" ? "bg-blue-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                >
                    Tümü
                </button>
                {Object.entries(MODULE_LABELS).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilterModule(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterModule === key ? "bg-blue-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Toplam Kayıt</p>
                    <p className="text-2xl font-bold text-white">{logs.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bugün</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {logs.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Giriş</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        {logs.filter((l) => l.action === "LOGIN").length}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">İşlem</p>
                    <p className="text-2xl font-bold text-amber-400">
                        {logs.filter((l) => l.action !== "LOGIN" && l.action !== "LOGOUT").length}
                    </p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Tarih/Saat</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Kullanıcı</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">İşlem</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Modül</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Varlık</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.slice(0, 100).map((log, i) => (
                            <motion.tr
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className="border-b border-white/5 hover:bg-white/5"
                            >
                                <td className="py-3 px-4 text-xs text-white/70 whitespace-nowrap">
                                    {formatDate(log.createdAt)}
                                </td>
                                <td className="py-3 px-4 text-sm text-white font-medium">
                                    {log.actorId}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${log.action === "LOGIN" ? "bg-emerald-500/20 text-emerald-400" :
                                            log.action === "LOGOUT" ? "bg-slate-500/20 text-slate-400" :
                                                log.action === "CREATE" ? "bg-blue-500/20 text-blue-400" :
                                                    log.action === "UPDATE" ? "bg-amber-500/20 text-amber-400" :
                                                        log.action === "DELETE" ? "bg-red-500/20 text-red-400" :
                                                            "bg-purple-500/20 text-purple-400"
                                        }`}>
                                        {getActionLabel(log.action)}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-white/70">
                                    {MODULE_LABELS[log.module] || log.module}
                                </td>
                                <td className="py-3 px-4 text-xs text-white/50">
                                    {log.entityType} {log.entityId ? `#${log.entityId.slice(-6)}` : ""}
                                </td>
                                <td className="py-3 px-4 text-xs text-white/40 font-mono">
                                    {log.ip}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredLogs.length === 0 && (
                    <div className="p-12 text-center text-white/50">
                        <p className="text-4xl mb-2">📝</p>
                        <p>Kayıt bulunamadı</p>
                    </div>
                )}
            </div>
        </div>
    );
}
