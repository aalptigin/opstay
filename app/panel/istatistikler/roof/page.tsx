"use client";

import { useEffect, useMemo, useState } from "react";
import LineChart from "../_components/LineChart";

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

function normalizeDate(v: any) {
  const raw = s(v);
  if (!raw) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
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

function lastNDays(n: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const str = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .format(d)
      .replace(/\./g, "/");
    out.push(str);
  }
  return out;
}

/** Sadece kara liste kayıtlarını saymak için */
function isBlacklistRow(r: Row) {
  const status = s(
    pick(r, ["status", "state", "type", "record_type", "kind", "category"])
  ).toLowerCase();

  const statusBlacklist =
    status === "blacklist" ||
    status === "kara_liste" ||
    status === "kara liste" ||
    status === "bl" ||
    status === "ban" ||
    status === "banned";

  const flagVal = pick(r, ["is_blacklist", "blacklist", "in_blacklist", "kara_liste"]);
  const flag =
    flagVal === true ||
    String(flagVal).toLowerCase() === "true" ||
    String(flagVal) === "1";

  const mode = s(pick(r, ["mode"])).toLowerCase();
  const modeBlacklist = mode === "blacklist" || mode === "kara_liste" || mode === "kara liste";

  return statusBlacklist || flag || modeBlacklist;
}

export default function Page() {
  const REST = "Roof";
  const DAYS = 7;

  const [reservations, setReservations] = useState<Row[]>([]);
  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const [r1, r2] = await Promise.all([
          fetch("/api/reservations", { cache: "no-store" }),
          fetch("/api/records", { cache: "no-store" }),
        ]);
        const j1 = await r1.json();
        const j2 = await r2.json();

        if (!alive) return;
        setReservations(Array.isArray(j1?.rows) ? j1.rows : []);
        setRecords(Array.isArray(j2?.rows) ? j2.rows : []);
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

  const days = useMemo(() => lastNDays(DAYS), []);

  const stats = useMemo(() => {
    const resByDay = new Map<string, number>();
    const blByDay = new Map<string, number>();

    // reservations -> sadece rezervasyonlar
    for (const r of reservations) {
      const rest = s(pick(r, ["restaurant", "restaurant_name"]));
      if (rest !== REST) continue;

      const d = normalizeDate(pick(r, ["date", "gun_ay_yil"]));
      if (!d) continue;

      resByDay.set(d, (resByDay.get(d) || 0) + 1);
    }

    // records -> SADECE kara liste kayıtları
    for (const r of records) {
      const rest = s(pick(r, ["restaurant", "restaurant_name"]));
      if (rest !== REST) continue;

      if (!isBlacklistRow(r)) continue;

      const d =
        normalizeDate(
          pick(r, ["date", "gun_ay_yil", "created_date", "created_at_date", "created_at"])
        ) || "";
      if (!d) continue;

      blByDay.set(d, (blByDay.get(d) || 0) + 1);
    }

    const resSeries = days.map((d) => resByDay.get(d) || 0);
    const blSeries = days.map((d) => blByDay.get(d) || 0);

    const totalRes = resSeries.reduce((a, b) => a + b, 0);
    const totalBL = blSeries.reduce((a, b) => a + b, 0);

    return { resSeries, blSeries, totalRes, totalBL };
  }, [reservations, records, days]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">İstatistikler • {REST}</h1>
          <p className="text-white/60 text-sm">
            {DAYS} günlük özet (rezervasyon ve kara liste).
          </p>
        </div>

        <button
          onClick={() => location.reload()}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Yenile
        </button>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Toplam Rezervasyon</div>
          <div className="text-3xl font-semibold mt-1">
            {loading ? "-" : stats.totalRes}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Toplam Kara Liste</div>
          <div className="text-3xl font-semibold mt-1">
            {loading ? "-" : stats.totalBL}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Günlük Rezervasyon Sayısı</div>
          <div className="text-xs text-white/50">dd/MM/yyyy</div>
        </div>
        <div className="mt-3">
          <LineChart labels={days.map((d) => d.slice(0, 5))} values={stats.resSeries} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Günlük Kara Liste</div>
          <div className="text-xs text-white/50">dd/MM/yyyy</div>
        </div>
        <div className="mt-3">
          <LineChart labels={days.map((d) => d.slice(0, 5))} values={stats.blSeries} />
        </div>
      </div>
    </div>
  );
}
