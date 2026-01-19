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

function SkeletonCell() {
    return <div className="h-3 w-full rounded bg-white/10 animate-pulse" />;
}

function SkeletonRow() {
    return (
        <tr className="border-b border-white/10">
            {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <SkeletonCell />
                </td>
            ))}
        </tr>
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

function StatusBadge({ status }: { status: string }) {
    const st = s(status).toLowerCase();

    const cls =
        st === "completed"
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            : st === "pending"
                ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                : "border-white/15 bg-white/[0.06] text-white/75";

    return (
        <span className={cx("inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-medium", cls)}>
            {st === "completed" ? "Tamamlandı" : st === "pending" ? "Bekliyor" : st || "-"}
        </span>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colorClasses: Record<string, string> = {
        default: "border-white/10 bg-white/5 text-white",
        amber: "border-amber-400/20 bg-amber-400/5 text-amber-300",
        emerald: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
        red: "border-red-400/20 bg-red-400/5 text-red-300",
        blue: "border-blue-400/20 bg-blue-400/5 text-blue-300",
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
                    <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                </div>
                <div className="text-white font-semibold">{title}</div>
                <div className="mt-1 text-sm text-white/60">{desc}</div>
            </div>
        </div>
    );
}

export default function RatingsPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const [q, setQ] = useState("");
    const [restaurant, setRestaurant] = useState("all");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    async function load(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setErr("");

        try {
            const res = await fetch("/api/ratings", { cache: "no-store" });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.error || "Yüklenemedi");

            const rawRows = Array.isArray(data?.rows) ? data.rows : [];
            // Sort by created_at descending
            const sorted = [...rawRows].sort((a, b) => {
                const aDate = s(a.created_at);
                const bDate = s(b.created_at);
                return bDate.localeCompare(aDate);
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
        const qq = q.trim().toLowerCase();

        return rows.filter((r) => {
            if (restaurant !== "all" && s(r.restaurant) !== restaurant) return false;
            if (statusFilter !== "all" && s(r.status).toLowerCase() !== statusFilter) return false;

            if (ratingFilter !== "all") {
                const rat = parseInt(s(r.rating), 10);
                if (ratingFilter === "positive" && rat < 4) return false;
                if (ratingFilter === "negative" && rat >= 4) return false;
            }

            if (!qq) return true;

            const hay = [
                s(r.created_at),
                s(r.restaurant),
                s(r.customer_phone),
                s(r.customer_name),
                s(r.feedback),
                s(r.rating),
            ].join(" ").toLowerCase();

            return hay.includes(qq);
        });
    }, [rows, q, restaurant, ratingFilter, statusFilter]);

    const stats = useMemo(() => {
        const total = filtered.length;
        const completed = filtered.filter((r) => s(r.status).toLowerCase() === "completed").length;
        const pending = filtered.filter((r) => s(r.status).toLowerCase() === "pending").length;
        const positive = filtered.filter((r) => parseInt(s(r.rating), 10) >= 4).length;
        const negative = filtered.filter((r) => parseInt(s(r.rating), 10) < 4 && parseInt(s(r.rating), 10) > 0).length;

        const avgRating = completed > 0
            ? (filtered.filter((r) => s(r.status) === "completed").reduce((sum, r) => sum + parseInt(s(r.rating), 10), 0) / completed).toFixed(1)
            : "-";

        return { total, completed, pending, positive, negative, avgRating };
    }, [filtered]);

    const selectedRow = useMemo(() => {
        if (selectedIdx === null) return null;
        return filtered[selectedIdx] || null;
    }, [filtered, selectedIdx]);

    function clearFilters() {
        setQ("");
        setRestaurant("all");
        setRatingFilter("all");
        setStatusFilter("all");
        setSelectedIdx(null);
    }

    return (
        <div className="space-y-4 page-no-scroll">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Değerlendirmeler</h1>
                    <p className="text-white/60 text-sm">
                        Müşteri çıkış değerlendirmeleri. Ortalama puan: {stats.avgRating}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button onClick={clearFilters} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">
                        Temizle
                    </button>
                    <button onClick={() => load(true)} disabled={refreshing} className={cx("rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition", refreshing && "opacity-60 cursor-not-allowed")}>
                        {refreshing ? "Yenileniyor..." : "Yenile"}
                    </button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Toplam" value={stats.total} color="default" />
                <StatCard label="Tamamlanan" value={stats.completed} color="blue" />
                <StatCard label="Bekleyen" value={stats.pending} color="amber" />
                <StatCard label="Olumlu (4-5)" value={stats.positive} color="emerald" />
                <StatCard label="Olumsuz (1-3)" value={stats.negative} color="red" />
            </motion.div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <label className="text-xs text-white/60">Arama</label>
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Telefon, isim, yorum..." className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20" />
                    </div>
                    <div>
                        <label className="text-xs text-white/60">Restoran</label>
                        <select value={restaurant} onChange={(e) => setRestaurant(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none">
                            {restaurants.map((x) => <option key={x} value={x}>{x === "all" ? "Tümü" : x}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-white/60">Puan</label>
                        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none">
                            <option value="all">Tümü</option>
                            <option value="positive">Olumlu (4-5)</option>
                            <option value="negative">Olumsuz (1-3)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-white/60">Durum</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none">
                            <option value="all">Tümü</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="pending">Bekliyor</option>
                        </select>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {err && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{err}</motion.div>}
            </AnimatePresence>

            <div className="grid lg:grid-cols-[1fr_360px] gap-4 viewport-grid">
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="text-sm text-white/70">{loading ? "Yükleniyor..." : `Toplam: ${filtered.length}`}</div>
                    </div>

                    <div className="overflow-auto flex-1 min-h-0 pb-3 vip-scroll">
                        <table className="min-w-[900px] w-full text-sm">
                            <thead className="text-white/70 sticky top-0 z-20">
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Tarih</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Restoran</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Müşteri</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Telefon</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Puan</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Durum</th>
                                    <th className="text-left px-4 py-3 bg-[#0b1220]">Yorum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />) : filtered.length === 0 ? (
                                    <tr><td className="p-0" colSpan={7}><EmptyState title="Değerlendirme yok" desc="Henüz değerlendirme kaydı bulunmuyor." /></td></tr>
                                ) : (
                                    filtered.map((r, idx) => {
                                        const rat = parseInt(s(r.rating), 10);
                                        return (
                                            <tr key={idx} onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)} className={cx("hover:bg-white/5 transition cursor-pointer", selectedIdx === idx && "bg-white/[0.06]")}>
                                                <td className="px-4 py-3 whitespace-nowrap">{s(r.created_at) || "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{s(r.restaurant) || "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{s(r.customer_name) || "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{s(r.customer_phone) || "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{rat > 0 ? <RatingStars rating={rat} /> : "-"}</td>
                                                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                                                <td className="px-4 py-3"><div className="max-w-[200px] truncate text-white/70">{s(r.feedback) || "-"}</div></td>
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
                        <div className="text-sm font-semibold text-white">Değerlendirme Detayı</div>
                    </div>
                    <div className="p-4">
                        <AnimatePresence mode="wait">
                            {!selectedRow ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                    <div className="text-sm text-white/70 font-semibold">Seçim yok</div>
                                    <div className="mt-1 text-sm text-white/60">Bir değerlendirme seçin.</div>
                                </motion.div>
                            ) : (
                                <motion.div key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                                        <RatingStars rating={parseInt(s(selectedRow.rating), 10)} />
                                        <div className="text-2xl font-bold text-white mt-2">{s(selectedRow.rating) || "-"} / 5</div>
                                        <StatusBadge status={selectedRow.status} />
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-white font-semibold">{s(selectedRow.customer_name) || "-"}</div>
                                        <div className="text-white/55 text-sm mt-1 font-mono">{s(selectedRow.customer_phone) || "-"}</div>
                                        <div className="text-white/35 text-xs mt-3">{s(selectedRow.restaurant)} • {s(selectedRow.reservation_no) || "No Rez"}</div>
                                    </div>

                                    {s(selectedRow.feedback) && (
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <div className="text-xs text-white/60">Müşteri Yorumu</div>
                                            <div className="text-white/80 mt-2 text-sm whitespace-pre-wrap">{s(selectedRow.feedback)}</div>
                                        </div>
                                    )}

                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <div className="text-xs text-white/60">Oluşturulma</div>
                                            <div className="text-white/80 mt-1">{s(selectedRow.created_at) || "-"}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-white/60">Değerlendirme</div>
                                            <div className="text-white/80 mt-1">{s(selectedRow.rated_at) || "-"}</div>
                                        </div>
                                    </div>

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
        .viewport-grid { height: calc(100dvh - 320px); }
        .vip-scroll { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.06); }
        .vip-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .vip-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.06); border-radius: 999px; }
        .vip-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.16)); border-radius: 999px; border: 2px solid rgba(0, 0, 0, 0.35); }
        @media (max-width: 1024px) { .viewport-grid { height: auto; } .page-no-scroll { height: auto; } }
      `}</style>
        </div>
    );
}
