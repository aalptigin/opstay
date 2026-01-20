"use client";

import { useEffect, useMemo, useState } from "react";

type Row = Record<string, any>;

function s(v: any) {
  return String(v ?? "").trim();
}

function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === null || v === undefined) continue;
    const str = String(v).trim();
    if (str !== "") return v;
  }
  return "";
}

// dd/MM/yyyy
function isDDMMYYYY(x: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(x);
}

function normalizeDate(v: any) {
  const raw = s(v);
  if (!raw) return "";
  if (isDDMMYYYY(raw)) return raw;

  // 29.12.2025 -> 29/12/2025
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw.replace(/\./g, "/");

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const out = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
    return out.replace(/\./g, "/");
  }
  return raw;
}

function normalizeTime(v: any) {
  const raw = s(v);
  if (!raw) return "";
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;

  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (m) return `${String(parseInt(m[1], 10)).padStart(2, "0")}:${m[2]}`;

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  }
  return raw;
}

function normRecordRow(r: Row) {
  const restaurant = s(pick(r, ["restaurant", "restaurant_name"]));
  const reservation_no = s(
    pick(r, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id", "rez_no"])
  );
  const table_no = s(pick(r, ["table_no", "table_n0", "masa_no"]));

  const date = normalizeDate(pick(r, ["date", "gun_ay_yil", "created_date"]));
  const time = normalizeTime(pick(r, ["time", "saat", "created_time"]));

  const customer_full_name = s(pick(r, ["customer_full_name", "full_name", "guest_full_name", "name_surname"]));
  const customer_phone = s(pick(r, ["customer_phone", "phone", "guest_phone"]));

  const kids_u7 = s(pick(r, ["kids_u7", "child_u7", "children_u7"]));

  // records / warning list typically has risk field
  const risk_level = s(pick(r, ["risk_level", "risk", "level", "severity"]));

  const officer_name = s(pick(r, ["officer_name", "authorized_name", "added_by_name"]));
  const officer_email = s(pick(r, ["officer_email", "authorized_email"]));

  const note = s(pick(r, ["note", "customer_note", "blacklist_note", "summary"]));
  const status = s(pick(r, ["status", "state"])) || "blacklist"; // default to blacklist for UI if missing

  return {
    ...r,
    restaurant,
    reservation_no,
    table_no,
    date,
    time,
    customer_full_name,
    customer_phone,
    kids_u7,
    risk_level,
    officer_name,
    officer_email,
    note,
    status
  };
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
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
    </tr>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-white/10" />
        <div className="text-white font-semibold">{title}</div>
        <div className="mt-1 text-sm text-white/60">{desc}</div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, desc }: { title: string; value: string | number; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
      <div className="text-xs font-bold text-white/60 tracking-wider mb-2 uppercase">{title}</div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-white/60">{desc}</div>
    </div>
  );
}

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // filtreler
  const [q, setQ] = useState("");
  const [restaurant, setRestaurant] = useState<string>("all");

  // küçük UX iyileştirmeleri
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const r1 = await fetch("/api/records", { cache: "no-store" });
        const j1 = await r1.json();

        if (!r1.ok) throw new Error(j1?.error || "Kayıtlar alınamadı");

        const rr = Array.isArray(j1?.rows) ? j1.rows : [];
        const normalized = rr.map(normRecordRow);

        if (!alive) return;
        setRows(normalized);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Yükleme hatası");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  async function reload() {
    setRefreshing(true);
    setErr("");
    try {
      const r1 = await fetch("/api/records", { cache: "no-store" });
      const j1 = await r1.json();
      if (!r1.ok) throw new Error(j1?.error || "Kayıtlar alınamadı");

      const rr = Array.isArray(j1?.rows) ? j1.rows : [];
      const normalized = rr.map(normRecordRow);

      setRows(normalized);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setRefreshing(false);
    }
  }

  const restaurants = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const x = s(r.restaurant);
      if (x) set.add(x);
    });
    return ["all", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows.filter((r) => {
      if (restaurant !== "all" && s(r.restaurant) !== restaurant) return false;

      if (!qq) return true;

      const hay = [
        r.restaurant,
        r.reservation_no,
        r.table_no,
        r.date,
        r.time,
        r.customer_full_name,
        r.customer_phone,
        r.risk_level,
        r.officer_name,
        r.officer_email,
        r.note,
      ]
        .map((x) => s(x).toLowerCase())
        .join(" | ");

      return hay.includes(qq);
    });
  }, [rows, q, restaurant]);

  const hasActiveFilters = useMemo(() => {
    return q.trim() !== "" || restaurant !== "all";
  }, [q, restaurant]);

  // Stats Logic
  const todayDate = useMemo(() => {
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date()).replace(/\./g, "/");
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    let todayCount = 0;

    // Basit bir risk hesabı: eğer risk_level doluysa ve 'yüksek'/'high' içeriyorsa
    // veya sadece dolu olmasını da sayabiliriz, kullanıcının görselindeki "0 Yüksek risk (yaklaşık)"
    // Buradaki veri biraz mock gibi, ama biz mantıklı bir hesap yapalım.
    let highRiskCount = 0;

    rows.forEach(r => {
      if (s(r.date) === todayDate) todayCount++;
      const risk = s(r.risk_level).toLowerCase();
      if (risk && (risk.includes("yüksek") || risk.includes("high") || risk.includes("kritik"))) {
        highRiskCount++;
      }
    });

    // Dagilim icin en cok kayit olan restorani bulalim
    // "0/5 Happy Moons / Roof" -> 5 toplam kayit, 0'i su anki secili restoranda gibi duruyor
    // Veya "En cok / Ikinci" gibi. 
    // Kullanici gorselinde "0/5 Happy Moons / Roof" yaziyor.
    // Biz buraya en cok kayit olan 2 restorani koyalim.
    const restCounts: Record<string, number> = {};
    rows.forEach(r => {
      const nm = s(r.restaurant) || "Bilinmeyen";
      restCounts[nm] = (restCounts[nm] || 0) + 1;
    });
    const sorted = Object.entries(restCounts).sort((a, b) => b[1] - a[1]);

    const dagilimText = sorted.length > 0
      ? `${sorted[0][1]} ${sorted[0][0]}${sorted.length > 1 ? ` / ${sorted[1][0]}` : ''}`
      : "Veri yok";

    return {
      total,
      today: todayCount,
      highRisk: highRiskCount,
      dagilim: dagilimText
    };
  }, [rows, todayDate]);

  const getRiskBadgeStyles = (risk: string) => {
    const r = risk.toLowerCase();
    if (r.includes("düşük") || r.includes("low") || r.includes("az")) {
      return "bg-yellow-400/10 text-yellow-400 ring-yellow-400/20";
    }
    if (r.includes("orta") || r.includes("medium") || r.includes("med")) {
      return "bg-orange-400/10 text-orange-400 ring-orange-400/20";
    }
    return "bg-red-400/10 text-red-400 ring-red-400/20";
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uyarı Listesi Kayıtları</h1>
          <div className="text-white/60 mt-1">Uyarı listesine eklenen misafirleri burada filtreleyip hızlıca inceleyebilirsiniz.</div>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition">
            Uyarı Listesi'ne Aktar
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition">
            Düzenle
          </button>
          <button
            onClick={reload}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
          >
            {refreshing ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="TOPLAM"
          value={stats.total}
          desc="Uyarı listesi kaydı"
        />
        <StatsCard
          title="BUGÜN"
          value={stats.today}
          desc={`Tarih: ${todayDate}`}
        />
        <StatsCard
          title="RİSK"
          value={stats.highRisk}
          desc="Yüksek risk (yaklaşık)"
        />
        <StatsCard
          title="DAĞILIM"
          value={filtered.length + "/" + stats.total}
          desc={restaurant !== 'all' ? restaurant : (rows.length > 0 ? "Tüm Restoranlar" : "-")}
        />
      </div>

      {/* Filter Stats Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs text-white/50 mb-1 block">Arama</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İsim, telefon, not, risk, tarih..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-white/30 transition placeholder:text-white/20"
          />
          <div className="opacity-40 text-[10px] mt-1.5 ml-1">İpucu: Telefon veya isim parçalarıyla arayabilirsiniz.</div>
        </div>

        <div className="w-full md:w-64">
          <label className="text-xs text-white/50 mb-1 block">Restoran</label>
          <div className="relative">
            <select
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-white/30 transition appearance-none"
            >
              {restaurants.map((x) => (
                <option key={x} value={x}>
                  {x === "all" ? "Tümü" : x}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none opacity-50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>
          <div className="opacity-40 text-[10px] mt-1.5 ml-1">Not: "Tümü" tüm restoranları gösterir.</div>
        </div>

        <div className="hidden md:block h-[60px] w-px bg-white/10 mx-2 self-center" />

        <div className="min-w-[120px] pb-5">
          <div className="text-xs text-white/50 mb-1">Özet</div>
          <div className="font-semibold text-white">Toplam: {rows.length} / Görünen: {filtered.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1220] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/50 uppercase bg-white/5 font-medium">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4">Restoran</th>
                <th className="px-6 py-4">Gün/Ay/Yıl</th>
                <th className="px-6 py-4">Saat</th>
                <th className="px-6 py-4">Misafir</th>
                <th className="px-6 py-4">Telefon</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4">Yetkili</th>
                <th className="px-6 py-4">Not</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="p-0" colSpan={8}>
                    <EmptyState
                      title={hasActiveFilters ? "Sonuç bulunamadı" : "Henüz kayıt yok"}
                      desc={
                        hasActiveFilters
                          ? "Arama kriterlerinizi değiştirin."
                          : "Burada uyarı listesine eklenen kayıtlar yer alacaktır."
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const officer = s(r.officer_name) || s(r.officer_email) || "-";
                  const risk = s(r.risk_level) || "-";
                  const key = String(r.reservation_id || r.id || idx);

                  return (
                    <tr key={key} className="hover:bg-white/5 transition group">
                      <td className="px-6 py-4 font-medium text-white">{s(r.restaurant) || "-"}</td>
                      <td className="px-6 py-4 text-white/70">{normalizeDate(r.date) || "-"}</td>
                      <td className="px-6 py-4 text-white/70">{normalizeTime(r.time) || "-"}</td>
                      <td className="px-6 py-4 text-white">{s(r.customer_full_name) || "-"}</td>
                      <td className="px-6 py-4 text-white/70 font-mono text-xs">{s(r.customer_phone) || "-"}</td>
                      <td className="px-6 py-4">
                        {risk !== "-" ? <span className={cx("inline-flex items-center rounded px-2 py-1 text-xs font-medium ring-1 ring-inset", getRiskBadgeStyles(risk))}>{risk}</span> : "-"}
                      </td>
                      <td className="px-6 py-4 text-white/70">{officer}</td>
                      <td className="px-6 py-4 text-white/70 max-w-[200px] truncate" title={s(r.note)}>{s(r.note) || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
