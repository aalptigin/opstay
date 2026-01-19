"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Row = Record<string, any>;

const ease = [0.22, 1, 0.36, 1] as const;

function s(v: any) {
    return String(v ?? "").trim();
}

function cx(...a: Array<string | false | undefined | null>) {
    return a.filter(Boolean).join(" ");
}

function SkeletonRow() {
    return (
        <tr className="border-b border-white/10">
            {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
                </td>
            ))}
        </tr>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const p = s(priority).toLowerCase();

    const cls =
        p === "high"
            ? "border-red-400/25 bg-red-400/10 text-red-300"
            : p === "medium"
                ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                : "border-white/15 bg-white/[0.06] text-white/75";

    const label = p === "high" ? "Yüksek" : p === "medium" ? "Orta" : p === "low" ? "Düşük" : p;

    return (
        <span className={cx("inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-medium", cls)}>
            {label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const st = s(status).toLowerCase();

    const cls =
        st === "completed"
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            : st === "in_progress"
                ? "border-blue-400/25 bg-blue-400/10 text-blue-300"
                : st === "pending"
                    ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                    : st === "cancelled"
                        ? "border-neutral-400/25 bg-neutral-400/10 text-neutral-300"
                        : "border-white/15 bg-white/[0.06] text-white/75";

    const label =
        st === "completed" ? "Tamamlandı" :
            st === "in_progress" ? "İşlemde" :
                st === "pending" ? "Bekliyor" :
                    st === "cancelled" ? "İptal" : st;

    return (
        <span className={cx("inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-medium", cls)}>
            {label}
        </span>
    );
}

function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-white/20"}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
            ))}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colorClasses: Record<string, string> = {
        default: "border-white/10 bg-white/5 text-white",
        amber: "border-amber-400/20 bg-amber-400/5 text-amber-300",
        red: "border-red-400/20 bg-red-400/5 text-red-300",
        blue: "border-blue-400/20 bg-blue-400/5 text-blue-300",
        emerald: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
    };

    return (
        <div className={cx("rounded-2xl border p-4", colorClasses[color] || colorClasses.default)}>
            <div className="text-xs text-white/60">{label}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
    );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="px-4 py-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </div>
                <div className="text-white font-semibold">{title}</div>
                <div className="mt-1 text-sm text-white/60">{desc}</div>
            </div>
        </div>
    );
}

export default function CallbacksPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const [restaurant, setRestaurant] = useState("all");
    const [priority, setPriority] = useState("all");
    const [status, setStatus] = useState("all");

    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState("");

    async function load(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setErr("");

        try {
            const res = await fetch("/api/callbacks", { cache: "no-store" });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.error || "Yüklenemedi");

            const rawRows = Array.isArray(data?.rows) ? data.rows : [];
            // Sort by priority (high first) then by created_at
            const sorted = [...rawRows].sort((a, b) => {
                const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
                const aPriority = priorityOrder[s(a.priority).toLowerCase()] ?? 3;
                const bPriority = priorityOrder[s(b.priority).toLowerCase()] ?? 3;
                if (aPriority !== bPriority) return aPriority - bPriority;
                return s(b.created_at).localeCompare(s(a.created_at));
            });

            setRows(sorted);
        } catch (e: any) {
            setErr(e?.message || "Hata");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const restaurants = useMemo(() => {
        const set = new Set<string>();
        rows.forEach((r) => {
            const x = s(r.restaurant);
            if (x) set.add(x);
        });
        return ["all", ...Array.from(set).sort()];
    }, [rows]);

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (restaurant !== "all" && s(r.restaurant) !== restaurant) return false;
            if (priority !== "all" && s(r.priority).toLowerCase() !== priority) return false;
            if (status !== "all" && s(r.status).toLowerCase() !== status) return false;
            return true;
        });
    }, [rows, restaurant, priority, status]);

    const stats = useMemo(() => {
        const total = rows.length;
        const pending = rows.filter((r) => s(r.status).toLowerCase() === "pending").length;
        const inProgress = rows.filter((r) => s(r.status).toLowerCase() === "in_progress").length;
        const high = rows.filter((r) => s(r.priority).toLowerCase() === "high" && s(r.status).toLowerCase() !== "completed").length;
        return { total, pending, inProgress, high };
    }, [rows]);

    const selectedRow = useMemo(() => {
        if (selectedIdx === null) return null;
        return filtered[selectedIdx] || null;
    }, [filtered, selectedIdx]);

    useEffect(() => {
        if (selectedRow) {
            setNotes(s(selectedRow.notes));
        }
    }, [selectedRow]);

    async function updateStatus(newStatus: string) {
        if (!selectedRow) return;
        setUpdating(true);

        try {
            const res = await fetch("/api/callbacks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    callback_id: selectedRow.callback_id,
                    status: newStatus,
                    notes,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Güncellenemedi");

            await load(true);
            setSelectedIdx(null);
        } catch (e: any) {
            setErr(e?.message || "Hata");
        } finally {
            setUpdating(false);
        }
    }

    function clearFilters() {
        setRestaurant("all");
        setPriority("all");
        setStatus("all");
        setSelectedIdx(null);
    }

    return (
        <div className="space-y-4 page-no-scroll">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Geri Arama Listesi</h1>
                    <p className="text-white/60 text-sm">
                        Olumsuz değerlendirme yapan müşterilere geri dönüş yapın.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button onClick={clearFilters} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">
                        Temizle
                    </button>
                    <button onClick={() => load(true)} disabled={refreshing} className={cx("rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition", refreshing && "opacity-60")}>
                        {refreshing ? "Yenileniyor..." : "Yenile"}
                    </button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Toplam" value={stats.total} color="default" />
                <StatCard label="Bekleyen" value={stats.pending} color="amber" />
                <StatCard label="İşlemde" value={stats.inProgress} color="blue" />
                <StatCard label="Yüksek Öncelik" value={stats.high} color="red" />
            </motion.div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                    <div>
                        <label className="text-xs text-white/60">Restoran</label>
                        <select value={restaurant} onChange={(e) => setRestaurant(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none">
                            {restaurants.map((x) => <option key={x} value={x}>{x === "all" ? "Tümü" : x}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-white/60">Öncelik</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none">
                            <option value="all">Tümü</option>
                            <option value="high">Yüksek</option>
                            <option value="medium">Orta</option>
                            <option value="low">Düşük</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-white/60">Durum</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none">
                            <option value="all">Tümü</option>
                            <option value="pending">Bekliyor</option>
                            <option value="in_progress">İşlemde</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="cancelled">İptal</option>
                        </select>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {err && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{err}</motion.div>}
            </AnimatePresence>

            <div className="grid lg:grid-cols-[1fr_400px] gap-4 viewport-grid">
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="text-sm text-white/70">{loading ? "Yükleniyor..." : `Toplam: ${filtered.length}`}</div>
                    </div>

                    <div className="overflow-auto flex-1 min-h-0 pb-3 vip-scroll">
                        <table className="min-w-[800px] w-full text-sm">
                            <thead className="text-white/70 sticky top-0 z-20">
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Öncelik</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Restoran</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Müşteri</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Telefon</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Puan</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Durum</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Tarih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />) : filtered.length === 0 ? (
                                    <tr><td className="p-0" colSpan={7}><EmptyState title="Geri arama yok" desc="Henüz olumsuz değerlendirme bulunmuyor." /></td></tr>
                                ) : (
                                    filtered.map((r, idx) => {
                                        const rat = parseInt(s(r.rating), 10);
                                        return (
                                            <tr key={idx} onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)} className={cx("hover:bg-white/5 transition cursor-pointer", selectedIdx === idx && "bg-white/[0.06]")}>
                                                <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={r.priority} /></td>
                                                <td className="px-4 py-3 whitespace-nowrap">{s(r.restaurant) || "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{s(r.customer_name) || "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{s(r.customer_phone) || "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{rat > 0 ? <RatingStars rating={rat} /> : "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                                                <td className="px-4 py-3 whitespace-nowrap text-white/60">{s(r.created_at) || "-"}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-sm font-semibold text-white">Geri Arama Detayı</div>
                    </div>
                    <div className="p-4">
                        <AnimatePresence mode="wait">
                            {!selectedRow ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                    <div className="text-sm text-white/70 font-semibold">Seçim yok</div>
                                    <div className="mt-1 text-sm text-white/60">Bir geri arama seçin.</div>
                                </motion.div>
                            ) : (
                                <motion.div key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <PriorityBadge priority={selectedRow.priority} />
                                            <StatusBadge status={selectedRow.status} />
                                        </div>
                                        <RatingStars rating={parseInt(s(selectedRow.rating), 10)} />
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-white font-semibold">{s(selectedRow.customer_name) || "-"}</div>
                                        <a href={`tel:${s(selectedRow.customer_phone)}`} className="text-blue-400 text-lg font-mono mt-1 block hover:underline">
                                            {s(selectedRow.customer_phone) || "-"}
                                        </a>
                                        <div className="text-white/35 text-xs mt-3">{s(selectedRow.restaurant)}</div>
                                    </div>

                                    {s(selectedRow.feedback) && (
                                        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
                                            <div className="text-xs text-red-300/60">Müşteri Şikayeti</div>
                                            <div className="text-red-300/80 mt-2 text-sm whitespace-pre-wrap">{s(selectedRow.feedback)}</div>
                                        </div>
                                    )}

                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <label className="text-xs text-white/60">Notlar</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Görüşme notlarını buraya yazın..."
                                            rows={3}
                                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => updateStatus("in_progress")} disabled={updating || s(selectedRow.status) === "in_progress"} className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-300 hover:bg-blue-400/20 transition disabled:opacity-50">
                                            İşleme Al
                                        </button>
                                        <button onClick={() => updateStatus("completed")} disabled={updating} className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-400/20 transition disabled:opacity-50">
                                            Tamamla
                                        </button>
                                    </div>

                                    <button onClick={() => updateStatus("cancelled")} disabled={updating} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition disabled:opacity-50">
                                        İptal Et
                                    </button>

                                    <button onClick={() => setSelectedIdx(null)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">
                                        Seçimi Kaldır
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .page-no-scroll { height: calc(100dvh - 24px); }
        .viewport-grid { height: calc(100dvh - 290px); }
        .vip-scroll { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.06); }
        .vip-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .vip-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.06); border-radius: 999px; }
        .vip-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.16)); border-radius: 999px; border: 2px solid rgba(0, 0, 0, 0.35); }
        @media (max-width: 1024px) { .viewport-grid { height: auto; } .page-no-scroll { height: auto; } }
      `}</style>
        </div>
    );
}
