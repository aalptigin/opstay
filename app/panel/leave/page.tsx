"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, LeaveRequest, LeaveStatus } from "@/lib/org/types";

const STATUS_LABELS: Record<LeaveStatus, { label: string; color: string }> = {
    pending: { label: "Beklemede", color: "bg-amber-500/20 text-amber-400" },
    approved: { label: "Onaylandı", color: "bg-emerald-500/20 text-emerald-400" },
    rejected: { label: "Reddedildi", color: "bg-red-500/20 text-red-400" },
};

export default function LeavePage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
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
                setRequests([
                    { id: "lev_1", userId: "usr_staff1", startDate: "2026-02-01", endDate: "2026-02-05", days: 5, reason: "Aile ziyareti", status: "pending", createdAt: new Date().toISOString() },
                    { id: "lev_2", userId: "usr_manager1", startDate: "2026-03-10", endDate: "2026-03-15", days: 6, reason: "Tatil", status: "approved", approverId: "usr_president", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
                ]);
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const canApprove = user?.role === "PRESIDENT" || user?.role === "UNIT_MANAGER";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">İZİN</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Yıllık İzin Takibi</h1>
            <p className="mt-2 text-sm text-white/60">İzin talepleri ve onay durumu</p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Bekleyen</p>
                    <p className="text-2xl font-bold text-amber-400">
                        {requests.filter((r) => r.status === "pending").length}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Onaylanan</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        {requests.filter((r) => r.status === "approved").length}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Toplam Gün</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {requests.filter((r) => r.status === "approved").reduce((s, r) => s + r.days, 0)}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">Kalan Hak</p>
                    <p className="text-2xl font-bold text-white">14 gün</p>
                </div>
            </div>

            {/* Add Request */}
            <div className="mt-6">
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition">
                    + Yeni İzin Talebi
                </button>
            </div>

            {/* Requests List */}
            <div className="mt-6 space-y-4">
                {requests.map((req, i) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-xl bg-white/5 border border-white/10"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center text-2xl">
                                    🏖️
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {req.days} Gün İzin
                                    </h3>
                                    <p className="text-sm text-white/60">
                                        {req.startDate} - {req.endDate}
                                    </p>
                                </div>
                            </div>

                            <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_LABELS[req.status].color}`}>
                                {STATUS_LABELS[req.status].label}
                            </span>
                        </div>

                        {req.reason && (
                            <div className="mt-4 p-3 rounded-lg bg-white/5">
                                <p className="text-sm text-white/70">{req.reason}</p>
                            </div>
                        )}

                        {canApprove && req.status === "pending" && (
                            <div className="mt-4 flex gap-2">
                                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500">
                                    Onayla
                                </button>
                                <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-500">
                                    Reddet
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
