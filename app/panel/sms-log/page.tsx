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

// Skeleton loading cell
function SkeletonCell() {
  return <div className="h-3 w-full rounded bg-white/10 animate-pulse" />;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/10">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonCell />
        </td>
      ))}
    </tr>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const st = s(status).toUpperCase();

  const cls =
    st === "SENT"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
      : st === "FAILED"
        ? "border-red-400/25 bg-red-400/10 text-red-300"
        : "border-white/15 bg-white/[0.06] text-white/75";

  return (
    <span className={cx("inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-medium", cls)}>
      {st || "-"}
    </span>
  );
}

// Mode badge component  
function ModeBadge({ mode }: { mode: string }) {
  const md = s(mode).toUpperCase();

  const cls =
    md === "DRY_RUN"
      ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
      : md === "LIVE"
        ? "border-blue-400/25 bg-blue-400/10 text-blue-300"
        : "border-white/15 bg-white/[0.06] text-white/75";

  return (
    <span className={cx("inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-medium", cls)}>
      {md || "-"}
    </span>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "default" | "green" | "red" | "amber";
}) {
  const colorClasses = {
    default: "border-white/10 bg-white/5",
    green: "border-emerald-400/20 bg-emerald-400/5",
    red: "border-red-400/20 bg-red-400/5",
    amber: "border-amber-400/20 bg-amber-400/5",
  };

  const textClasses = {
    default: "text-white",
    green: "text-emerald-300",
    red: "text-red-300",
    amber: "text-amber-300",
  };

  return (
    <div className={cx("rounded-2xl border p-4", colorClasses[color])}>
      <div className="text-xs text-white/60">{label}</div>
      <div className={cx("text-2xl font-semibold mt-1", textClasses[color])}>
        {value}
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="text-white font-semibold">{title}</div>
        <div className="mt-1 text-sm text-white/60">{desc}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [q, setQ] = useState("");
  const [restaurant, setRestaurant] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [mode, setMode] = useState<string>("all");

  // Selected row for detail panel
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/sms/logs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "SMS logları alınamadı");

      const rawRows = Array.isArray(data?.rows) ? data.rows : [];
      // Sort by created_at descending (newest first)
      const sorted = [...rawRows].sort((a, b) => {
        const aDate = s(a.created_at);
        const bDate = s(b.created_at);
        return bDate.localeCompare(aDate);
      });

      setRows(sorted);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Get unique restaurants for filter dropdown
  const restaurants = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const x = s(r.restaurant);
      if (x) set.add(x);
    });
    return ["all", ...Array.from(set).sort()];
  }, [rows]);

  // Filter rows
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows.filter((r) => {
      // Restaurant filter
      if (restaurant !== "all" && s(r.restaurant) !== restaurant) return false;

      // Status filter
      if (status !== "all" && s(r.status).toUpperCase() !== status) return false;

      // Mode filter
      if (mode !== "all" && s(r.mode).toUpperCase() !== mode) return false;

      // Search filter
      if (!qq) return true;

      const hay = [
        s(r.created_at),
        s(r.reservation_no),
        s(r.restaurant),
        s(r.customer_phone),
        s(r.sender_id),
        s(r.mode),
        s(r.status),
        s(r.message),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(qq);
    });
  }, [rows, q, restaurant, status, mode]);

  // Statistics
  const stats = useMemo(() => {
    const total = filtered.length;
    const sent = filtered.filter((r) => s(r.status).toUpperCase() === "SENT").length;
    const failed = filtered.filter((r) => s(r.status).toUpperCase() === "FAILED").length;
    const dryRun = filtered.filter((r) => s(r.mode).toUpperCase() === "DRY_RUN").length;
    return { total, sent, failed, dryRun };
  }, [filtered]);

  // Selected row
  const selectedRow = useMemo(() => {
    if (selectedIdx === null) return null;
    return filtered[selectedIdx] || null;
  }, [filtered, selectedIdx]);

  // Check if any filters active
  const hasActiveFilters = q.trim() !== "" || restaurant !== "all" || status !== "all" || mode !== "all";

  // Clear filters
  function clearFilters() {
    setQ("");
    setRestaurant("all");
    setStatus("all");
    setMode("all");
    setSelectedIdx(null);
  }

  // Export to CSV
  function exportCsv() {
    if (filtered.length === 0) return;

    const headers = ["Tarih", "Restoran", "Telefon", "Gönderen", "Mod", "Durum", "Rez No", "Mesaj"];
    const csvRows = [headers.join(",")];

    for (const r of filtered) {
      const row = [
        s(r.created_at),
        s(r.restaurant),
        s(r.customer_phone),
        s(r.sender_id),
        s(r.mode),
        s(r.status),
        s(r.reservation_no),
        `"${s(r.message).replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    }

    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sms-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 page-no-scroll">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SMS Logları</h1>
          <p className="text-white/60 text-sm">
            DRY-RUN ve LIVE SMS gönderim kayıtları. Rezervasyon bazlı takip yapabilirsiniz.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
          >
            Filtreyi Temizle
          </button>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className={cx(
              "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition",
              filtered.length === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            CSV İndir
          </button>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className={cx(
              "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition",
              refreshing && "opacity-60 cursor-not-allowed"
            )}
          >
            {refreshing ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <StatCard label="Toplam SMS" value={stats.total} color="default" />
        <StatCard label="Gönderildi" value={stats.sent} color="green" />
        <StatCard label="Başarısız" value={stats.failed} color="red" />
        <StatCard label="DRY-RUN" value={stats.dryRun} color="amber" />
      </motion.div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-xs text-white/60">Arama</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Telefon, restoran, mesaj..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Restoran</label>
            <select
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
            >
              {restaurants.map((x) => (
                <option key={x} value={x}>
                  {x === "all" ? "Tümü" : x}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/60">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
            >
              <option value="all">Tümü</option>
              <option value="SENT">Gönderildi</option>
              <option value="FAILED">Başarısız</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/60">Mod</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
            >
              <option value="all">Tümü</option>
              <option value="DRY_RUN">DRY-RUN</option>
              <option value="LIVE">LIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {err && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
          >
            {err}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 viewport-grid">
        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col min-h-0"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="text-sm text-white/70">
              {loading ? "Yükleniyor..." : `Toplam: ${filtered.length}`}
            </div>
          </div>

          <div className="overflow-auto flex-1 min-h-0 pb-3 vip-scroll">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="text-white/70 sticky top-0 z-20">
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Tarih</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Restoran</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Telefon</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Gönderen</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Mod</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Durum</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Rez No</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Mesaj</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="p-0" colSpan={8}>
                      <EmptyState
                        title={hasActiveFilters ? "Sonuç bulunamadı" : "Henüz SMS kaydı yok"}
                        desc={
                          hasActiveFilters
                            ? "Arama veya filtre kriterlerinizi değiştirin."
                            : "Rezervasyon oluşturulduğunda SMS logları burada görünecektir."
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => {
                    const isSelected = selectedIdx === idx;

                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedIdx(isSelected ? null : idx)}
                        className={cx(
                          "hover:bg-white/5 transition cursor-pointer",
                          isSelected && "bg-white/[0.06]"
                        )}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">{s(r.created_at) || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{s(r.restaurant) || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{s(r.customer_phone) || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{s(r.sender_id) || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ModeBadge mode={r.mode} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{s(r.reservation_no) || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="max-w-[300px] line-clamp-2 text-white/70">
                            {s(r.message) || "-"}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Detail panel */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-semibold text-white">SMS Detayı</div>
            <div className="text-xs text-white/50 mt-1">Bir satıra tıklayarak detayları görüntüleyin.</div>
          </div>

          <div className="p-4">
            <AnimatePresence mode="wait">
              {!selectedRow ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="text-sm text-white/70 font-semibold">Seçim yok</div>
                  <div className="mt-1 text-sm text-white/60">
                    Listeden bir SMS kaydı seçin.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Status & Mode */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedRow.status} />
                      <ModeBadge mode={selectedRow.mode} />
                    </div>
                    <div className="text-xs text-white/40 mt-2">
                      {s(selectedRow.created_at)}
                    </div>
                  </div>

                  {/* Restaurant & Phone */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white font-semibold">{s(selectedRow.restaurant) || "-"}</div>
                    <div className="text-white/55 text-sm mt-1 font-mono">
                      {s(selectedRow.customer_phone) || "-"}
                    </div>
                    <div className="text-white/35 text-xs mt-3">
                      Rez No: {s(selectedRow.reservation_no) || "-"}
                    </div>
                  </div>

                  {/* Sender ID */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-white/60">Gönderen ID</div>
                      <div className="text-white/80 mt-1">{s(selectedRow.sender_id) || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Message ID</div>
                      <div className="text-white/80 mt-1 font-mono text-xs truncate">
                        {s(selectedRow.message_id) || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Mesaj İçeriği</div>
                    <div className="text-white/80 mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {s(selectedRow.message) || "-"}
                    </div>
                  </div>

                  {/* Error if any */}
                  {s(selectedRow.error_message) && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
                      <div className="text-xs text-red-300/60">Hata Mesajı</div>
                      <div className="text-red-300/80 mt-2 text-sm">
                        {s(selectedRow.error_message)}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedIdx(null)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                  >
                    Seçimi Kaldır
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .page-no-scroll {
          height: calc(100dvh - 24px);
        }
        .viewport-grid {
          height: calc(100dvh - 320px);
        }

        .vip-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.06);
        }
        .vip-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .vip-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        }
        .vip-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.34),
            rgba(255, 255, 255, 0.16)
          );
          border-radius: 999px;
          border: 2px solid rgba(0, 0, 0, 0.35);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
        }
        .vip-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.44),
            rgba(255, 255, 255, 0.22)
          );
        }
        .vip-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }

        @media (max-width: 1024px) {
          .viewport-grid {
            height: auto;
          }
          .page-no-scroll {
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}
