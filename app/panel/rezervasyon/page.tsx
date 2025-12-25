"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type ReservationRow = {
  reservation_id?: string;
  datetime?: string; // ISO veya string
  full_name?: string;
  phone?: string;
  note?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function ReservationsPage() {
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Form state (Gün/Ay/Yıl tek kutu içinde)
  const now = new Date();
  const [day, setDay] = useState(pad2(now.getDate()));
  const [month, setMonth] = useState(pad2(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [time, setTime] = useState("19:00");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const isoDatetime = useMemo(() => {
    // Europe/Istanbul için server tarafında formatlarsın; burada string üretip gönderiyoruz.
    // YYYY-MM-DDTHH:mm:00
    const y = year.trim();
    const m = month.trim();
    const d = day.trim();
    const t = time.trim();
    return `${y}-${m}-${d}T${t}:00`;
  }, [day, month, year, time]);

  async function load() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rezervasyonlar alınamadı");
      setRows(data.rows || []);
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createReservation() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          datetime: isoDatetime,
          full_name: fullName,
          phone,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rezervasyon oluşturulamadı");

      setMsg("Rezervasyon oluşturuldu.");
      setFullName("");
      setPhone("");
      setNote("");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">REZERVASYON</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Rezervasyon Oluştur</h1>
      <p className="mt-2 text-sm text-white/60">
        Gün/Ay/Yıl tek kutuda; saat seçimi ile birlikte kaydedilir.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
      >
        {/* Gün/Ay/Yıl tek kutu */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60">Tarih (Gün / Ay / Yıl)</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <input
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className="w-14 bg-transparent text-white outline-none text-sm"
                placeholder="GG"
              />
              <span className="text-white/30">/</span>
              <input
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className="w-14 bg-transparent text-white outline-none text-sm"
                placeholder="AA"
              />
              <span className="text-white/30">/</span>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-20 bg-transparent text-white outline-none text-sm"
                placeholder="YYYY"
              />
              <div className="ml-auto text-xs text-white/40">Europe/Istanbul</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60">Saat</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">İsim Soyisim</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Burak Yılmaz"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Telefon</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="05xx..."
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/60">Not</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            placeholder="Kısa not..."
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-white/70">{msg}</div>
          <button
            type="button"
            onClick={createReservation}
            disabled={loading}
            className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Rezervasyon oluştur"}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="text-white font-semibold">Rezervasyonlar</div>
          <button
            type="button"
            onClick={load}
            className="text-sm text-white/70 hover:text-white"
          >
            Yenile
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-white/55">
              <tr className="border-t border-white/10">
                <th className="text-left px-5 py-3">Tarih/Saat</th>
                <th className="text-left px-5 py-3">İsim</th>
                <th className="text-left px-5 py-3">Telefon</th>
                <th className="text-left px-5 py-3">Not</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {rows.map((r, idx) => (
                <tr key={(r.reservation_id || "") + idx} className="border-t border-white/10">
                  <td className="px-5 py-3 text-white/70">{r.datetime || "-"}</td>
                  <td className="px-5 py-3">{r.full_name || "-"}</td>
                  <td className="px-5 py-3 text-white/70">{r.phone || "-"}</td>
                  <td className="px-5 py-3 text-white/70">{r.note || "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr className="border-t border-white/10">
                  <td className="px-5 py-10 text-white/55" colSpan={4}>
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
