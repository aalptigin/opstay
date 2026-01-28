"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MaintenanceTicket, TicketStatus, TicketPriority, Vehicle } from "@/lib/org/types";

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
    open: { label: "Açık", color: "bg-red-500/20 text-red-400" },
    in_progress: { label: "İşlemde", color: "bg-blue-500/20 text-blue-400" },
    testing: { label: "Test", color: "bg-amber-500/20 text-amber-400" },
    closed: { label: "Kapalı", color: "bg-emerald-500/20 text-emerald-400" },
};

const PRIORITY_LABELS: Record<TicketPriority, { label: string; color: string }> = {
    low: { label: "Düşük", color: "text-slate-400" },
    normal: { label: "Normal", color: "text-blue-400" },
    high: { label: "Yüksek", color: "text-amber-400" },
    urgent: { label: "Acil", color: "text-red-400" },
};

export default function MaintenancePage() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");

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

                // Mock tickets for now
                setTickets([
                    {
                        id: "tkt_1",
                        vehicleId: "veh_1",
                        type: "repair",
                        priority: "high",
                        status: "open",
                        notes: "Sol ön lastik patladı, acil değişim gerekli",
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: "tkt_2",
                        vehicleId: "veh_2",
                        type: "maintenance",
                        priority: "normal",
                        status: "in_progress",
                        assignedTo: "Mehmet Usta",
                        notes: "Periyodik bakım - yağ değişimi",
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    },
                ]);
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const getVehicle = (id: string) => vehicles.find((v) => v.id === id);

    const filteredTickets = filterStatus === "all"
        ? tickets
        : tickets.filter((t) => t.status === filterStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">BAKIM</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Arıza & Bakım Takibi</h1>
            <p className="mt-2 text-sm text-white/60">Araç arıza ve bakım talepleri</p>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                    {(["all", "open", "in_progress", "testing", "closed"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterStatus === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/5 text-white/70 hover:bg-white/10"
                                }`}
                        >
                            {status === "all" ? "Tümü" : STATUS_LABELS[status].label}
                        </button>
                    ))}
                </div>

                <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition">
                    + Yeni Arıza Bildirimi
                </button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["open", "in_progress", "testing", "closed"] as TicketStatus[]).map((status) => (
                    <div key={status} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${STATUS_LABELS[status].color}`}>
                            {STATUS_LABELS[status].label}
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">
                            {tickets.filter((t) => t.status === status).length}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tickets */}
            <div className="mt-6 space-y-4">
                {filteredTickets.map((ticket, i) => {
                    const vehicle = getVehicle(ticket.vehicleId);

                    return (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                                        🔧
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {vehicle?.plate || "Bilinmeyen Araç"}
                                        </h3>
                                        <p className="text-sm text-white/60">{vehicle?.model}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_LABELS[ticket.priority].color}`}>
                                        {PRIORITY_LABELS[ticket.priority].label}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_LABELS[ticket.status].color}`}>
                                        {STATUS_LABELS[ticket.status].label}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 rounded-lg bg-white/5">
                                <p className="text-sm text-white/70">{ticket.notes}</p>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                                <div className="text-white/50">
                                    {ticket.assignedTo && (
                                        <span>Sorumlu: <span className="text-white">{ticket.assignedTo}</span></span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500">
                                        Güncelle
                                    </button>
                                    {ticket.status !== "closed" && (
                                        <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500">
                                            Kapat
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {filteredTickets.length === 0 && (
                    <div className="p-12 text-center text-white/50">
                        <p className="text-4xl mb-2">🔧</p>
                        <p>Bu kategoride kayıt bulunmuyor</p>
                    </div>
                )}
            </div>
        </div>
    );
}
