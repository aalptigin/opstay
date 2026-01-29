"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type Meta = {
  reservation_no?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  table_no?: string;
  restaurant?: "Happy Moons" | "Roof" | string;

  // ekleyen yetkili için olası anahtarlar
  added_by?: string;
  added_by_name?: string;
  staff_name?: string;
  created_by?: string;
  created_by_name?: string;

  note?: string;
};

function safeParseMeta(summary: any): Meta {
  if (!summary || typeof summary !== "string") return {};
  try {
    const obj = JSON.parse(summary);
    if (obj && typeof obj === "object") return obj as Meta;
    return {};
  } catch {
    return {};
  }
}

function toISODate(year: string, month: string, day: string) {
  const y = year.trim();
  const m = month.trim();
  const d = day.trim();
  if (!y || !m || !d) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

type AnyRow = {
  record_id?: string;
  reservation_id?: string;
  full_name?: string;
  guest_full_name?: string;
  phone?: string;
  datetime?: string;
  date?: string;
  time?: string;
  table_no?: string;
  reservation_no?: string;
  restaurant?: string;
  added_by?: string;
  added_by_name?: string;
  staff_name?: string;
  created_by?: string;
  created_by_name?: string;
  summary?: string;
};

export default function KayitKontrolPage() {
  const now = new Date();

  // kontrol formu (mevcut)
  const [reservationNo, setReservationNo] = useState("");
  const [day, setDay] = useState(pad2(now.getDate()));
  const [month, setMonth] = useState(pad2(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [time, setTime] = useState("19:00");
  const [guestFullName, setGuestFullName] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [phone, setPhone] = useState("");

  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isoDate = useMemo(() => toISODate(year, month, day), [year, month, day]);

  // ✅ yeni: tarih ile arama (sadece gün/ay/yıl)
  const [sDay, setSDay] = useState(pad2(now.getDate()));
  const [sMonth, setSMonth] = useState(pad2(now.getMonth() + 1));
  const [sYear, setSYear] = useState(String(now.getFullYear()));
  const isoSearchDate = useMemo(() => toISODate(sYear, sMonth, sDay), [sYear, sMonth, sDay]);

  const [dateRows, setDateRows] = useState<any[]>([]);
  const [dateLoading, setDateLoading] = useState(false);
  const [dateMsg, setDateMsg] = useState<string | null>(null);

  async function searchByDate() {
    setDateLoading(true);
    setDateMsg(null);
    setDateRows([]);

    try {
      const d = isoSearchDate;
      if (!d) throw new Error("Tarih girin.");

      const res = await fetch("/api/panel/core/records", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kayıtlar alınamadı");

      const rows: AnyRow[] = data?.rows || [];
      const mapped = rows
        .map((r) => {
          const meta = safeParseMeta(r.summary);

          // tarih yakalama: meta.date > r.date > datetime içinden
          let dateStr =
            meta.date ||
            r.date ||
            (typeof r.datetime === "string" && r.datetime.includes("T") ? r.datetime.split("T")[0] : "") ||
            "";

          // saat yakalama: meta.time > r.time > datetime içinden
          let timeStr =
            meta.time ||
            r.time ||
            (typeof r.datetime === "string" && r.datetime.includes("T")
              ? r.datetime.split("T")[1]?.slice(0, 5)
              : "") ||
            "";

          const ekleyen =
            meta.added_by_name ||
            meta.staff_name ||
            meta.created_by_name ||
            meta.added_by ||
            meta.created_by ||
            r.added_by_name ||
            r.staff_name ||
            r.created_by_name ||
            r.added_by ||
            r.created_by ||
            "-";

          const restoran = meta.restaurant || r.restaurant || "-";

          return {
            id: r.record_id || r.reservation_id || "-",
            reservation_no: meta.reservation_no || r.reservation_no || "-",
            date: dateStr || "-",
            time: timeStr || "-",
            guest_full_name: r.guest_full_name || r.full_name || "-",
            phone: r.phone || "-",
            table_no: meta.table_no || r.table_no || "-",
            restoran,
            ekleyen,
          };
        })
        .filter((x) => x.date === d)
        .sort((a, b) => String(a.time).localeCompare(String(b.time)));

      setDateRows(mapped);
      if (mapped.length === 0) setDateMsg("Bu tarihte kayıt bulunamadı.");
    } catch (e: any) {
      setDateMsg(e?.message || "Hata");
    } finally {
      setDateLoading(false);
    }
  }

  // sayfa ilk açılışta bugünün tarihine göre liste getir (sessiz)
  useEffect(() => {
    searchByDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function check() {
    setLoading(true);
    setMsg(null);
    setResult(null);

    try {
      const payload = {
        reservation_no: reservationNo.trim(),
        date: isoDate,
        time: time.trim(),
        guest_full_name: guestFullName.trim(),
        table_no: tableNo.trim(),
        phone: phone.trim(),

        // geriye dönük uyumluluk
        full_name: guestFullName.trim(),
      };

      const res = await fetch("/api/panel/core/records/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kontrol edilemedi");

      setResult(data?.result ?? data);
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  const resolved = useMemo(() => {
    if (!result) return null;

    const candidate =
      result?.row ||
      result?.record ||
      result?.match ||
      result?.found ||
      result?.data ||
      result;

    const row = candidate?.row || candidate;
    const meta = safeParseMeta(row?.summary ?? result?.summary);

    const ekleyen =
      meta.added_by_name ||
      meta.staff_name ||
      meta.created_by_name ||
      meta.added_by ||
      meta.created_by ||
      row?.added_by_name ||
      row?.created_by_name ||
      row?.added_by ||
      row?.created_by ||
      result?.added_by_name ||
      result?.created_by_name ||
      result?.added_by ||
      result?.created_by ||
      "-";

    const restoran =
      meta.restaurant ||
      row?.restaurant ||
      result?.restaurant ||
      "-";

    return {
      reservation_no: meta.reservation_no || row?.reservation_no || reservationNo || "-",
      date: meta.date || row?.date || isoDate || "-",
      time: meta.time || row?.time || time || "-",
      guest_full_name: row?.full_name || row?.guest_full_name || result?.guest_full_name || guestFullName || "-",
      table_no: meta.table_no || row?.table_no || tableNo || "-",
      phone: row?.phone || result?.phone || phone || "-",
      restoran,
      ekleyen,
      raw: result,
    };
  }, [result, reservationNo, isoDate, time, guestFullName, tableNo, phone]);

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Kayıt Kontrol</h1>

      {/* ✅ yeni: sadece tarih ile arama (başlığın altında) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/70">
            Gün/Ay/Yıl ile arama
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <input
                value={sDay}
                onChange={(e) => setSDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className="w-14 bg-transparent text-white outline-none text-sm"
                placeholder="GG"
              />
              <span className="text-white/30">/</span>
              <input
                value={sMonth}
                onChange={(e) => setSMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className="w-14 bg-transparent text-white outline-none text-sm"
                placeholder="AA"
              />
              <span className="text-white/30">/</span>
              <input
                value={sYear}
                onChange={(e) => setSYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-20 bg-transparent text-white outline-none text-sm"
                placeholder="YYYY"
              />
            </div>

            <button
              type="button"
              onClick={searchByDate}
              disabled={dateLoading}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
            >
              {dateLoading ? "Aranıyor..." : "Ara"}
            </button>
          </div>
        </div>

        <div className="mt-3 text-sm text-white/70">{dateMsg}</div>

        {dateRows.length > 0 && (
          <div className="mt-4 overflow-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="text-white/55">
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3">Saat</th>
                  <th className="text-left px-4 py-3">Rez No</th>
                  <th className="text-left px-4 py-3">Misafir</th>
                  <th className="text-left px-4 py-3">Masa</th>
                  <th className="text-left px-4 py-3">Telefon</th>
                  <th className="text-left px-4 py-3">Restoran</th>
                  <th className="text-left px-4 py-3">Yetkili</th>
                </tr>
              </thead>
              <tbody className="text-white/85">
                {dateRows.map((r, idx) => (
                  <tr key={`${r.id}-${idx}`} className="border-b border-white/10 last:border-b-0">
                    <td className="px-4 py-3 text-white/70">{r.time}</td>
                    <td className="px-4 py-3">{r.reservation_no}</td>
                    <td className="px-4 py-3">{r.guest_full_name}</td>
                    <td className="px-4 py-3 text-white/70">{r.table_no}</td>
                    <td className="px-4 py-3 text-white/70">{r.phone}</td>
                    <td className="px-4 py-3">{r.restoran}</td>
                    <td className="px-4 py-3 text-white/70">{r.ekleyen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <p className="mt-4 text-sm text-white/60">
        Rezervasyon bilgileri ile operasyon doğrulaması yapın.
      </p>

      {/* mevcut kontrol formu (aynen korunuyor) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60">Rezervasyon Numarası</label>
            <input
              value={reservationNo}
              onChange={(e) => setReservationNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              placeholder="Örn: RZV-1023"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Masa Numarası</label>
            <input
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              placeholder="Örn: 12"
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
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60">Saat</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold tracking-[0.10em] text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Misafir Adı Soyadı</label>
            <input
              value={guestFullName}
              onChange={(e) => setGuestFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              placeholder="Örn: Ad Soyad"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Telefon Numarası</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              placeholder="05xx..."
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm text-white/70">{msg}</div>
          <button
            onClick={check}
            disabled={loading}
            className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
          >
            {loading ? "Kontrol ediliyor..." : "Kontrol Et"}
          </button>
        </div>

        {resolved && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold">Sonuç</div>

            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div className="text-white/70">
                <div className="text-white/45 text-xs">Rezervasyon Numarası</div>
                <div className="text-white">{resolved.reservation_no}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/45 text-xs">Masa Numarası</div>
                <div className="text-white">{resolved.table_no}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/45 text-xs">Gün/Ay/Yıl</div>
                <div className="text-white">{resolved.date}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/45 text-xs">Saat</div>
                <div className="text-white">{resolved.time}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/45 text-xs">Misafir</div>
                <div className="text-white">{resolved.guest_full_name}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/45 text-xs">Telefon</div>
                <div className="text-white">{resolved.phone}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/45 text-xs">Restoran</div>
                <div className="text-white">{resolved.restoran}</div>
              </div>

              <div className="text-white/70">
                <div className="text-white/45 text-xs">Ekleyen Yetkili</div>
                <div className="text-white">{resolved.ekleyen}</div>
              </div>
            </div>

            <details className="mt-4">
              <summary className="text-xs text-white/50 cursor-pointer select-none">
                Teknik detay (ham çıktı)
              </summary>
              <pre className="mt-3 text-xs text-white/70 whitespace-pre-wrap">
                {JSON.stringify(resolved.raw, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </motion.div>
    </div>
  );
}
