"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Row = {
  datetime: string;
  full_name: string;
  phone: string;
  note: string;
};

export default function PanelPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await fetch("/api/reservations", { cache: "no-store" });
        if (!res.ok) throw new Error("Rezervasyonlar alınamadı.");
        const data = await res.json();
        if (!alive) return;
        setRows(Array.isArray(data.rows) ? data.rows : []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Hata oluştu.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        String(r.full_name || "").toLowerCase().includes(s) ||
        String(r.phone || "").toLowerCase().includes(s) ||
        String(r.datetime || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">
            REZERVASYON
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">
            Rezervasyon Yönetimi
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Tarih/saat, isim, telefon ve not.
          </p>
        </div>

        <div className="w-full sm:w-[320px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara: isim, telefon, tarih…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,.30)] overflow-hidden"
      >
        <div className="grid grid-cols-[190px_1.2fr_180px] px-5 py-4 text-xs text-white/55 border-b border-white/10">
          <div>Tarih/Saat</div>
          <div>İsim Soyisim</div>
          <div>Telefon</div>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-sm text-white/55">Yükleniyor…</div>
        ) : err ? (
          <div className="px-5 py-10 text-sm text-red-200">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-sm text-white/55">Kayıt bulunamadı.</div>
        ) : (
          filtered.map((r, idx) => (
            <div
              key={idx}
              className="px-5 py-4 border-b border-white/10 last:border-b-0"
            >
              <div className="grid grid-cols-[190px_1.2fr_180px] items-start">
                <div className="text-sm text-white/85">{r.datetime}</div>
                <div className="text-sm text-white/90 font-semibold">
                  {r.full_name}
                </div>
                <div className="text-sm text-white/75">{r.phone}</div>
              </div>
              <div className="mt-3 text-sm text-white/60">
                <span className="text-white/45">Not:</span> {r.note || "-"}
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
