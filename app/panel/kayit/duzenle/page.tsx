"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Row = { record_id: string; full_name: string; phone: string; risk_level: string; summary: string };

export default function KayitDuzenlePage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/records", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(selected),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg(data?.error || "Güncellenemedi");
    setMsg("Kayıt güncellendi.");
    await load();
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Kayıt Düzenle</h1>

      <div className="mt-4">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-[420px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          placeholder="Ara: isim / telefon / id" />
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-5 py-4 text-sm text-white/70">{msg}</div>
          <div className="divide-y divide-white/10 max-h-[520px] overflow-auto">
            {filtered.map((r) => (
              <button
                key={r.record_id}
                onClick={() => setSelected({ ...r })}
                className="w-full text-left px-5 py-4 hover:bg-white/5"
              >
                <div className="text-white font-semibold">{r.full_name}</div>
                <div className="text-white/60 text-sm">{r.phone} • {r.risk_level}</div>
                <div className="text-white/35 text-xs mt-1">ID: {r.record_id}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-sm text-white/55">Kayıt bulunamadı.</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
        >
          {!selected ? (
            <div className="text-white/60 text-sm">Düzenlemek için soldan bir kayıt seçin.</div>
          ) : (
            <>
              <div className="text-white/35 text-xs">ID: {selected.record_id}</div>

              <div className="mt-4">
                <label className="text-xs text-white/60">İsim Soyisim</label>
                <input value={selected.full_name}
                  onChange={(e) => setSelected({ ...selected, full_name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Telefon</label>
                <input value={selected.phone}
                  onChange={(e) => setSelected({ ...selected, phone: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Seviye</label>
                <select
                  value={selected.risk_level}
                  onChange={(e) => setSelected({ ...selected, risk_level: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="bilgi">Bilgi</option>
                  <option value="dikkat">Dikkat</option>
                  <option value="kritik">Kritik</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Özet</label>
                <textarea value={selected.summary}
                  onChange={(e) => setSelected({ ...selected, summary: e.target.value })}
                  className="mt-2 w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-sm text-white/70">{saving ? "Kaydediliyor..." : ""}</div>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
                >
                  Kaydet
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
