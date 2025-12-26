// app/panel/kayit/sil/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Row = {
  record_id: string;
  full_name: string;
  phone: string;
  risk_level: string;
  summary: string;
};

type Me = { user: { role: "manager" | "staff" | string; full_name: string; restaurant_name: string } };

type BlacklistMeta = {
  reservation_no?: string;
  date?: string; // YYYY-MM-DD
  table_no?: string;
  added_by?: string;

  // ✅ Blacklist nedeni / notu
  reason?: string;
  note?: string;
};

function safeParseMeta(summary: string): BlacklistMeta {
  if (!summary) return {};
  try {
    const obj = JSON.parse(summary);
    if (obj && typeof obj === "object") return obj as BlacklistMeta;
    return {};
  } catch {
    // Eski kayıtlar düz metin olabilir -> not olarak göster
    return { note: summary };
  }
}

function isBlacklistRow(r: Row, meta: BlacklistMeta) {
  // Blacklist kaydı = risk_level "kritik" veya summary içinde meta alanları
  const hasMeta =
    !!meta?.reservation_no ||
    !!meta?.date ||
    !!meta?.table_no ||
    !!meta?.added_by ||
    !!meta?.reason ||
    !!meta?.note;

  return (r.risk_level || "").toLowerCase() === "kritik" || hasMeta;
}

export default function KayitSilPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [mode, setMode] = useState<"normal" | "blacklist">("normal");

  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Tarih filtresi (GG/AA/YYYY)
  const [fDay, setFDay] = useState("");
  const [fMonth, setFMonth] = useState("");
  const [fYear, setFYear] = useState("");

  const filterIsoDate = useMemo(() => {
    const y = fYear.trim();
    const m = fMonth.trim();
    const d = fDay.trim();
    if (!y || !m || !d) return "";
    return `${y}-${m}-${d}`;
  }, [fDay, fMonth, fYear]);

  const isManager = me?.user?.role === "manager";

  async function loadMe() {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) setMe(d);
    } catch {
      // sessiz geç
    }
  }

  async function load() {
    setMsg(null);
    const res = await fetch("/api/records", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setRows(data.rows || []);
    else setMsg(data?.error || "Liste alınamadı");
  }

  useEffect(() => {
    loadMe();
    load();
  }, []);

  // Müdür değilse blacklist modunu kapat (UI gizliliği)
  useEffect(() => {
    if (!isManager && mode === "blacklist") setMode("normal");
  }, [isManager, mode]);

  const normalized = useMemo(() => {
    return rows.map((r) => {
      const meta = safeParseMeta(r.summary || "");
      return { r, meta };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return normalized.filter(({ r, meta }) => {
      // Mode filtresi
      const bl = isBlacklistRow(r, meta);
      if (mode === "blacklist") {
        if (!bl) return false;
      } else {
        if (bl) return false;
      }

      // Tarih filtresi (meta.date)
      if (filterIsoDate) {
        if ((meta.date || "") !== filterIsoDate) return false;
      }

      if (!s) return true;

      const reasonText = (meta.reason || meta.note || "").toString();

      const hay = [
        r.record_id || "",
        r.full_name || "",
        r.phone || "",
        r.risk_level || "",
        meta.reservation_no || "",
        meta.table_no || "",
        meta.added_by || "",
        meta.date || "",
        reasonText || "",
        r.summary || "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [normalized, q, filterIsoDate, mode]);

  async function del(record_id: string) {
    setMsg(null);
    const res = await fetch("/api/records", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ record_id }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data?.error || "Silinemedi");
    setMsg(mode === "blacklist" ? "Blacklist kaydı silindi." : "Kayıt silindi.");
    await load();
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">
        {mode === "blacklist" ? "Blacklist Kayıt Sil" : "Kayıt Sil"}
      </h1>

      {/* Arama + Tarih filtresi */}
      <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full lg:w-[420px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          placeholder="Ara: isim / telefon / id"
        />

        {/* GG/AA/YYYY filtre */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 w-full lg:w-auto">
          <div className="text-xs text-white/55 mr-2 whitespace-nowrap">Tarih</div>
          <input
            value={fDay}
            onChange={(e) => setFDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="w-12 bg-transparent text-white outline-none text-sm"
            placeholder="GG"
          />
          <span className="text-white/30">/</span>
          <input
            value={fMonth}
            onChange={(e) => setFMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="w-12 bg-transparent text-white outline-none text-sm"
            placeholder="AA"
          />
          <span className="text-white/30">/</span>
          <input
            value={fYear}
            onChange={(e) => setFYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-16 bg-transparent text-white outline-none text-sm"
            placeholder="YYYY"
          />

          <button
            type="button"
            onClick={() => {
              setFDay("");
              setFMonth("");
              setFYear("");
            }}
            className="ml-auto text-xs text-white/55 hover:text-white"
          >
            Temizle
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
      >
        {/* Üst bar: mesaj + sağ üst blacklist butonu (sadece müdür) */}
        <div className="px-5 py-4 text-sm text-white/70 flex items-center justify-between gap-3">
          <div className="min-h-[20px]">{msg}</div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className="text-sm text-white/70 hover:text-white">
              Yenile
            </button>

            {isManager && (
              <button
                type="button"
                onClick={() => setMode(mode === "normal" ? "blacklist" : "normal")}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                {mode === "normal" ? "Blacklist kayıt sil" : "Normal kayıt sil"}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {filtered.map(({ r, meta }) => {
            const reason = (meta.reason || meta.note || "").toString().trim();

            return (
              <div key={r.record_id} className="px-5 py-4 flex items-start justify-between gap-4">
                {/* NORMAL */}
                {mode === "normal" && (
                  <div>
                    <div className="text-white font-semibold">{r.full_name}</div>
                    <div className="text-white/60 text-sm">
                      {r.phone} • {r.risk_level}
                    </div>
                    <div className="text-white/35 text-xs mt-1">ID: {r.record_id}</div>
                  </div>
                )}

                {/* BLACKLIST (sadece müdür açabilir) */}
                {mode === "blacklist" && (
                  <div className="w-full">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="text-white font-semibold">{r.full_name || "İsim girilmemiş"}</div>
                      <div className="text-white/60 text-sm">{r.phone || "-"}</div>
                      <div className="text-white/35 text-xs">ID: {r.record_id}</div>
                    </div>

                    <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="text-sm text-white/70">
                        <span className="text-white/45">Rezervasyon:</span> {meta.reservation_no || "-"}
                      </div>
                      <div className="text-sm text-white/70">
                        <span className="text-white/45">Tarih:</span> {meta.date || "-"}
                      </div>
                      <div className="text-sm text-white/70">
                        <span className="text-white/45">Masa:</span> {meta.table_no || "-"}
                      </div>

                      <div className="text-sm text-white/70 sm:col-span-2 lg:col-span-3">
                        <span className="text-white/45">Ekleyen yetkili:</span> {meta.added_by || "-"}
                      </div>

                      {/* ✅ NEDEN BLACKLISTE ALINDI? */}
                      <div className="text-sm text-white/70 sm:col-span-2 lg:col-span-3">
                        <span className="text-white/45">Blacklist notu (neden):</span>{" "}
                        {reason ? reason : "-"}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => del(r.record_id)}
                  className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm text-red-100"
                >
                  Sil
                </button>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-10 text-sm text-white/55">
              {mode === "blacklist" ? "Blacklist kaydı bulunamadı." : "Kayıt bulunamadı."}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
