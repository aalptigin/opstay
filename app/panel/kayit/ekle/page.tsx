// app/panel/kayit/ekle/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type ApiRow = {
  record_id: string;
  full_name: string;
  phone: string;
  risk_level: string;
  summary: string;
};

type Me = { user: { full_name: string; role: string; restaurant_name: string } };

type BlacklistMeta = {
  reservation_no?: string;
  date?: string; // YYYY-MM-DD
  table_no?: string;
  added_by?: string;
  note?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function safeParseMeta(summary: string): BlacklistMeta {
  if (!summary) return {};
  try {
    const obj = JSON.parse(summary);
    if (obj && typeof obj === "object") return obj as BlacklistMeta;
    return {};
  } catch {
    // Eski kayıtlar düz metin olabilir
    return { note: summary };
  }
}

function buildSummary(meta: BlacklistMeta) {
  // API mevcut yapısını bozmadan: summary içine JSON koyuyoruz
  return JSON.stringify(
    {
      reservation_no: meta.reservation_no || "",
      date: meta.date || "",
      table_no: meta.table_no || "",
      added_by: meta.added_by || "",
      note: meta.note || "",
    },
    null,
    0
  );
}

export default function KayitEklePage() {
  // form state
  const [reservationNo, setReservationNo] = useState("");
  const now = new Date();
  const [day, setDay] = useState(pad2(now.getDate()));
  const [month, setMonth] = useState(pad2(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [guestFullName, setGuestFullName] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [phone, setPhone] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [note, setNote] = useState("");

  // list + filter state
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [q, setQ] = useState("");
  const [fDay, setFDay] = useState("");
  const [fMonth, setFMonth] = useState("");
  const [fYear, setFYear] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isoDate = useMemo(() => {
    const y = year.trim();
    const m = month.trim();
    const d = day.trim();
    if (!y || !m || !d) return "";
    return `${y}-${m}-${d}`;
  }, [day, month, year]);

  const filterIsoDate = useMemo(() => {
    const y = fYear.trim();
    const m = fMonth.trim();
    const d = fDay.trim();
    if (!y || !m || !d) return "";
    return `${y}-${m}-${d}`;
  }, [fDay, fMonth, fYear]);

  async function loadMe() {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const d = (await r.json()) as Me;
      if (r.ok && d?.user?.full_name) setAddedBy(d.user.full_name);
    } catch {
      // sessiz geç
    }
  }

  async function loadList() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/records", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setRows(data.rows || []);
      else setMsg(data?.error || "Liste alınamadı");
    } catch (e: any) {
      setMsg(e?.message || "Liste alınamadı");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadMe();
    loadList();
  }, []);

  noted: {
    /* (bilinçli olarak boş) */
  }

  const normalizedRows = useMemo(() => {
    return rows.map((r) => {
      const meta = safeParseMeta(r.summary || "");
      return { r, meta };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return normalizedRows.filter(({ r, meta }) => {
      // tarih filtresi (GG/AA/YYYY girilirse sadece o gün)
      if (filterIsoDate) {
        if ((meta.date || "") !== filterIsoDate) return false;
      }

      if (!s) return true;

      const hay = [
        r.record_id || "",
        r.full_name || "",
        r.phone || "",
        r.risk_level || "",
        meta.reservation_no || "",
        meta.table_no || "",
        meta.added_by || "",
        meta.date || "",
        meta.note || "",
        r.summary || "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [normalizedRows, q, filterIsoDate]);

  async function onSubmit() {
    setMsg(null);
    setSaving(true);

    try {
      const payload = {
        full_name: guestFullName, // API ile uyumlu
        phone,
        risk_level: "kritik", // blacklist kaydı
        summary: buildSummary({
          reservation_no: reservationNo,
          date: isoDate,
          table_no: tableNo,
          added_by: addedBy,
          note,
        }),
      };

      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");

      setMsg("Blacklist kaydı eklendi.");
      setReservationNo("");
      setGuestFullName("");
      setTableNo("");
      setPhone("");
      setNote("");

      await loadList();
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Blacklist’e Kayıt Ekle</h1>
      <p className="mt-2 text-sm text-white/60">
        Rezervasyon kaydı üzerinden misafiri blacklist’e ekleyin ve aynı ekranda mevcut kayıtları görüntüleyin.
      </p>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60">Rezervasyon numarası</label>
            <input
              value={reservationNo}
              onChange={(e) => setReservationNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: RZV-10294"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Gün / Ay / Yıl</label>
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
              <div className="ml-auto text-xs text-white/40">{isoDate || "—"}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60">Misafir adı soyadı</label>
            <input
              value={guestFullName}
              onChange={(e) => setGuestFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Ad Soyad"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Masa numarası</label>
            <input
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: 12"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Telefon numarası</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="05xx..."
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Ekleyen yetkili (isim soyisim)</label>
            <input
              value={addedBy}
              onChange={(e) => setAddedBy(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Yetkili Ad Soyad"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/60">Not</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            placeholder="Kısa ve net şekilde açıklayın."
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-white/70">{msg}</div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Blacklist’e Ekle"}
          </button>
        </div>
      </motion.div>

      {/* FİLTRE + LİSTE */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
      >
        <div className="px-5 py-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="text-white font-semibold">Blacklist Kayıtları</div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Tarih filtresi (GG/AA/YYYY) */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
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
                className="ml-2 text-xs text-white/55 hover:text-white"
              >
                Temizle
              </button>
            </div>

            {/* Genel arama */}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full sm:w-[340px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
              placeholder="Ara: rezervasyon no, isim, masa, telefon, yetkili..."
            />

            <button type="button" onClick={loadList} className="text-sm text-white/70 hover:text-white">
              Yenile
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-white/55">
              <tr className="border-t border-white/10">
                <th className="text-left px-5 py-3">Rez. No</th>
                <th className="text-left px-5 py-3">Tarih</th>
                <th className="text-left px-5 py-3">Misafir</th>
                <th className="text-left px-5 py-3">Masa</th>
                <th className="text-left px-5 py-3">Telefon</th>
                <th className="text-left px-5 py-3">Ekleyen</th>
                <th className="text-left px-5 py-3">Not</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {loadingList ? (
                <tr className="border-t border-white/10">
                  <td className="px-5 py-10 text-white/55" colSpan={7}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td className="px-5 py-10 text-white/55" colSpan={7}>
                    Kayıt yok.
                  </td>
                </tr>
              ) : (
                filtered.map(({ r, meta }) => (
                  <tr key={r.record_id} className="border-t border-white/10">
                    <td className="px-5 py-3 text-white/70">{meta.reservation_no || "-"}</td>
                    <td className="px-5 py-3 text-white/70">{meta.date || "-"}</td>
                    <td className="px-5 py-3">{r.full_name || "-"}</td>
                    <td className="px-5 py-3 text-white/70">{meta.table_no || "-"}</td>
                    <td className="px-5 py-3 text-white/70">{r.phone || "-"}</td>
                    <td className="px-5 py-3 text-white/70">{meta.added_by || "-"}</td>
                    <td className="px-5 py-3 text-white/70">
                      <div className="max-w-[520px] line-clamp-2">{meta.note || "-"}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
