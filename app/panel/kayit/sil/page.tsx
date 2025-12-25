"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Row = { record_id: string; full_name: string; phone: string; risk_level: string; summary: string };

export default function KayitSilPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);
    const res = await fetch("/api/records", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setRows(data.rows || []);
    else setMsg(data?.error || "Liste alınamadı");
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.full_name || "").toLowerCase().includes(s) ||
      (r.phone || "").toLowerCase().includes(s) ||
      (r.record_id || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  async function del(record_id: string) {
    setMsg(null);
    const res = await fetch("/api/records", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ record_id }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data?.error || "Silinemedi");
    setMsg("Kayıt silindi.");
    await load();
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Kayıt Sil</h1>

      <div className="mt-4">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-[420px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          placeholder="Ara: isim / telefon / id" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
      >
        <div className="px-5 py-4 text-sm text-white/70">{msg}</div>
        <div className="divide-y divide-white/10">
          {filtered.map((r) => (
            <div key={r.record_id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-white font-semibold">{r.full_name}</div>
                <div className="text-white/60 text-sm">{r.phone} • {r.risk_level}</div>
                <div className="text-white/55 text-sm mt-1">{r.summary}</div>
                <div className="text-white/35 text-xs mt-2">ID: {r.record_id}</div>
              </div>
              <button
                onClick={() => del(r.record_id)}
                className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm text-red-100"
              >
                Sil
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-sm text-white/55">Kayıt bulunamadı.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
