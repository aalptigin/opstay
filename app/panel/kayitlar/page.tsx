"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type RowAny = Record<string, any>;

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

function s(v: any) {
  return String(v ?? "").trim();
}

function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === null || v === undefined) continue;
    const out = String(v).trim();
    if (out !== "") return v;
  }
  return "";
}

function normRestaurant(v: any) {
  const raw = s(v);
  const r = raw.toLowerCase().replace(/\s+/g, " ").trim();
  if (!r) return "";

  if (
    r === "happy moons" ||
    r === "happy_moons" ||
    r === "happy-moons" ||
    r === "happymoons" ||
    r === "happy moon"
  )
    return "Happy Moons";

  if (r === "roof" || r === "roof restaurant") return "Roof";

  return raw;
}

function normalizeDateYMD(v: any) {
  const raw = s(v);
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split(".");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return raw;
}

function normalizeTimeHHmm(v: any) {
  const raw = s(v);
  if (!raw) return "";
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;

  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (m) return `${String(parseInt(m[1], 10)).padStart(2, "0")}:${m[2]}`;

  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(11, 16);

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return raw;
}

function formatTRDateFromYMD(ymd: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || "-";
  const [yyyy, mm, dd] = ymd.split("-");
  return `${dd}.${mm}.${yyyy}`;
}

function todayYMD() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function rowId(row: RowAny) {
  return s(pick(row, ["record_id", "id", "row_id", "uuid"]));
}

function rowRestaurant(row: RowAny) {
  return normRestaurant(pick(row, ["restaurant", "restaurant_name"]));
}

function rowDateYMD(row: RowAny) {
  const d = normalizeDateYMD(pick(row, ["date", "created_date", "gun_ay_yil", "dayMonthYear"]));
  const dt = s(pick(row, ["datetime", "created_at", "createdAt"]));
  const d2 = dt ? normalizeDateYMD(dt.slice(0, 10)) : "";
  return d || d2;
}

function rowTimeHHmm(row: RowAny) {
  const t = normalizeTimeHHmm(pick(row, ["time", "created_time", "saat"]));
  const dt = s(pick(row, ["datetime", "created_at", "createdAt"]));
  const t2 = dt ? normalizeTimeHHmm(dt.slice(11, 16)) : "";
  return t || t2;
}

function rowCustomer(row: RowAny) {
  return s(pick(row, ["full_name", "customer_full_name", "subject_person_name", "guest_full_name", "name_surname"]));
}

function rowPhone(row: RowAny) {
  return s(pick(row, ["phone", "customer_phone", "subject_phone", "guest_phone", "telefon"]));
}

function rowOfficer(row: RowAny) {
  return s(
    pick(row, [
      "officer_name",
      "authorized_name",
      "created_by_name",
      "added_by_name",
      "actor_name",
      "staff_full_name",
    ])
  );
}

function rowNote(row: RowAny) {
  const altKey = ["black", "list", "_note"].join("");
  return s(pick(row, ["note", altKey, "customer_note", "summary", "reason", "not", "aciklama"]));
}

function rowRisk(row: RowAny) {
  return s(pick(row, ["risk_level", "risk", "severity", "level"]));
}

function rowStatus(row: RowAny) {
  return s(pick(row, ["status", "state", "type", "mode"])).toLowerCase();
}

function isAlertListRow(row: RowAny) {
  const st = rowStatus(row);

  // tolerant işaretleme: "black..." veya "kara..." gibi backend varyasyonlarını yakalar
  if (st.includes("black")) return true;
  if (st.includes("kara")) return true;
  if (st === "bl" || st === "b") return true;

  const flag =
    (row as any).is_blacklist ??
    (row as any).isBlacklisted ??
    (row as any).blacklist ??
    (row as any).blacklisted ??
    null;

  if (flag === true) return true;

  const lt = s(pick(row, ["list_type", "listType"])).toLowerCase();
  if (lt.includes("black")) return true;

  return false;
}

async function fetchRows(): Promise<RowAny[]> {
  const res = await fetch("/api/records", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  const rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
  return rows;
}

const ease = [0.22, 1, 0.36, 1] as const;

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="text-xs text-white/55 tracking-[0.18em] font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-white">{value}</div>
      {sub ? <div className="mt-1 text-sm text-white/60">{sub}</div> : null}
    </div>
  );
}

export default function KayitlarPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RowAny[]>([]);
  const [q, setQ] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState<"all" | "happy-moons" | "roof">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchRows();
      setRows(Array.isArray(r) ? r : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const alertRows = useMemo(() => {
    const list = (rows || []).filter((r) => isAlertListRow(r));
    return list.slice().sort((a, b) => {
      const ka = `${rowDateYMD(a)} ${rowTimeHHmm(a)}`;
      const kb = `${rowDateYMD(b)} ${rowTimeHHmm(b)}`;
      return kb.localeCompare(ka);
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const query = s(q).toLowerCase();

    return alertRows.filter((r) => {
      const rest = rowRestaurant(r);
      const restLower = rest.toLowerCase();

      if (restaurantFilter === "happy-moons" && restLower !== "happy moons") return false;
      if (restaurantFilter === "roof" && restLower !== "roof") return false;

      if (!query) return true;

      const hay = [
        rest,
        rowDateYMD(r),
        rowTimeHHmm(r),
        rowCustomer(r),
        rowPhone(r),
        rowOfficer(r),
        rowRisk(r),
        rowNote(r),
        rowId(r),
      ]
        .map((x) => s(x).toLowerCase())
        .join(" | ");

      return hay.includes(query);
    });
  }, [alertRows, q, restaurantFilter]);

  const total = alertRows.length;
  const shown = filtered.length;

  const kpis = useMemo(() => {
    const today = todayYMD();
    const todayCount = alertRows.filter((r) => rowDateYMD(r) === today).length;

    const riskHigh = alertRows.filter((r) => {
      const x = s(rowRisk(r)).toLowerCase();
      if (!x) return false;
      if (x.includes("high") || x.includes("yüksek")) return true;
      if (x === "3" || x === "4" || x === "5") return true;
      return false;
    }).length;

    return { todayCount, riskHigh };
  }, [alertRows]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYITLAR</div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="mt-2 text-2xl md:text-3xl font-extrabold text-white"
          >
            Uyarı Listesi Kayıtları
          </motion.h1>
          <p className="mt-2 text-sm text-white/60">
            Uyarı listesine eklenen misafirleri burada filtreleyip hızlıca inceleyebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/panel/kayit/ekle"
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm",
              "border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition"
            )}
          >
            Uyarı Listesi&apos;ne Aktar
          </Link>

          <button
            onClick={load}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm",
              "border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition",
              loading ? "opacity-60 cursor-not-allowed" : ""
            )}
            disabled={loading}
          >
            {loading ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard label="TOPLAM" value={total} sub="Uyarı listesi kaydı" />
        <StatCard label="BUGÜN" value={kpis.todayCount} sub={`Tarih: ${formatTRDateFromYMD(todayYMD())}`} />
        <StatCard label="RİSK" value={kpis.riskHigh} sub="Yüksek risk (yaklaşık)" />
      </motion.div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-2">Arama</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İsim, telefon, not, risk, tarih..."
            className={cx(
              "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm",
              "text-white placeholder:text-white/30 outline-none focus:border-white/20"
            )}
          />
          <div className="mt-2 text-xs text-white/45">İpucu: Telefon veya isim parçalarıyla arayabilirsiniz.</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-2">Restoran</div>
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value as any)}
            className={cx(
              "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm",
              "text-white outline-none focus:border-white/20"
            )}
          >
            <option value="all">Tümü</option>
            <option value="happy-moons">Happy Moons</option>
            <option value="roof">Roof</option>
          </select>
          <div className="mt-2 text-xs text-white/45">Not: “Tümü” tüm restoranları gösterir.</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-2">Özet</div>
          <div className="text-sm text-white/90">
            Toplam: <span className="font-semibold">{total}</span> / Görünen:{" "}
            <span className="font-semibold">{shown}</span>
          </div>
          {loading ? <div className="mt-2 text-xs text-white/40">Yükleniyor…</div> : null}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="px-4 py-3 text-left font-medium">Restoran</th>
                <th className="px-4 py-3 text-left font-medium">Gün/Ay/Yıl</th>
                <th className="px-4 py-3 text-left font-medium">Saat</th>
                <th className="px-4 py-3 text-left font-medium">Misafir</th>
                <th className="px-4 py-3 text-left font-medium">Telefon</th>
                <th className="px-4 py-3 text-left font-medium">Risk</th>
                <th className="px-4 py-3 text-left font-medium">Yetkili</th>
                <th className="px-4 py-3 text-left font-medium">Not</th>
                <th className="px-4 py-3 text-left font-medium">Durum</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-white/10 animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 rounded bg-white/10" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  {filtered.map((r, idx) => {
                    const id = rowId(r) || `${idx}`;

                    const rest = rowRestaurant(r) || "-";
                    const d = rowDateYMD(r);
                    const t = rowTimeHHmm(r);

                    const cust = rowCustomer(r) || "-";
                    const phone = rowPhone(r) || "-";
                    const officer = rowOfficer(r) || "-";
                    const note = rowNote(r) || "-";
                    const risk = rowRisk(r) || "-";

                    return (
                      <tr
                        key={id}
                        className={cx("border-t border-white/10", "hover:bg-white/[0.04] transition")}
                      >
                        <td className="px-4 py-3 text-white/90 font-medium whitespace-nowrap">{rest}</td>
                        <td className="px-4 py-3 text-white/80 whitespace-nowrap">
                          {d ? formatTRDateFromYMD(d) : "-"}
                        </td>
                        <td className="px-4 py-3 text-white/80 whitespace-nowrap">{t || "-"}</td>
                        <td className="px-4 py-3 text-white/90">{cust}</td>
                        <td className="px-4 py-3 text-white/80 whitespace-nowrap">{phone}</td>
                        <td className="px-4 py-3 text-white/80 whitespace-nowrap">{risk}</td>
                        <td className="px-4 py-3 text-white/80">{officer}</td>
                        <td className="px-4 py-3 text-white/80 min-w-[320px]">{note}</td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
                            uyarı
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 ? (
                    <tr className="border-t border-white/10">
                      <td colSpan={9} className="px-4 py-10 text-center text-white/50">
                        Kayıt bulunamadı.
                      </td>
                    </tr>
                  ) : null}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
