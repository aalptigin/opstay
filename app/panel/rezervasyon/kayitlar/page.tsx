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

function normReservationRow(r: Row) {
  const restaurant = s(pick(r, ["restaurant", "restaurant_name"]));
  const reservation_no = s(
    pick(r, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id"])
  );
  const table_no = s(pick(r, ["table_no", "table_n0", "masa_no"]));

  let date = normalizeDate(pick(r, ["date", "gun_ay_yil"]));
  let time = normalizeTime(pick(r, ["time", "saat"]));

  const customer_full_name = s(
    pick(r, ["customer_full_name", "full_name", "guest_full_name"])
  );
  const customer_phone = s(pick(r, ["customer_phone", "phone", "guest_phone"]));

  const kids_u7 = s(pick(r, ["kids_u7", "child_u7", "children_u7"]));
  const officer_name = s(pick(r, ["officer_name", "authorized_name"]));
  const officer_email = s(pick(r, ["officer_email", "authorized_email"]));

  const note = s(pick(r, ["note", "customer_note"]));

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
    officer_name,
    officer_email,
    note,
  };
}

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // filtreler
  const [q, setQ] = useState("");
  const [restaurant, setRestaurant] = useState<string>("all");
  const [date, setDate] = useState<string>(""); // dd/MM/yyyy

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const r1 = await fetch("/api/reservations", { cache: "no-store" });
        const j1 = await r1.json();

        const rr = Array.isArray(j1?.rows) ? j1.rows : [];
        const normalized = rr.map(normReservationRow);

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
    const d = date.trim();

    return rows.filter((r) => {
      if (restaurant !== "all" && s(r.restaurant) !== restaurant) return false;
      if (d && s(r.date) !== d) return false;

      if (!qq) return true;

      const hay = [
        r.restaurant,
        r.reservation_no,
        r.table_no,
        r.date,
        r.time,
        r.customer_full_name,
        r.customer_phone,
        r.officer_name,
        r.officer_email,
        r.note,
      ]
        .map((x) => s(x).toLowerCase())
        .join(" | ");

      return hay.includes(qq);
    });
  }, [rows, q, restaurant, date]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rezervasyon Kayıtları</h1>
          <p className="text-white/60 text-sm">
            Filtrele, ara ve gerekirse kara liste ile çapraz kontrol et.
          </p>
        </div>

        <button
          onClick={() => location.reload()}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Yenile
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs text-white/60">Arama</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rez. no, müşteri, telefon, not..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Restoran</label>
            <select
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
            >
              {restaurants.map((x) => (
                <option key={x} value={x}>
                  {x === "all" ? "Tümü" : x}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/60">Gün/Ay/Yıl (dd/MM/yyyy)</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="29/12/2025"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm text-white/70">
            {loading ? "Yükleniyor..." : `Toplam: ${filtered.length}`}
          </div>
          {err ? <div className="text-sm text-red-300">{err}</div> : null}
        </div>

        <div className="overflow-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-black/20 text-white/70">
              <tr>
                <th className="text-left px-4 py-3">Restoran</th>
                <th className="text-left px-4 py-3">Rez. No</th>
                <th className="text-left px-4 py-3">Masa</th>
                <th className="text-left px-4 py-3">Gün/Ay/Yıl</th>
                <th className="text-left px-4 py-3">Saat</th>
                <th className="text-left px-4 py-3">Müşteri</th>
                <th className="text-left px-4 py-3">Telefon</th>
                <th className="text-left px-4 py-3">Çocuk (7-)</th>
                <th className="text-left px-4 py-3">Yetkili</th>
                <th className="text-left px-4 py-3">Not</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filtered.map((r, idx) => {
                const officer = s(r.officer_name) || s(r.officer_email) || "-";
                const kids = s(r.kids_u7) || "-";

                return (
                  <tr
                    key={String(r.reservation_id || r.id || idx)}
                    className="hover:bg-white/5"
                  >
                    <td className="px-4 py-3">{s(r.restaurant) || "-"}</td>
                    <td className="px-4 py-3">{s(r.reservation_no) || "-"}</td>
                    <td className="px-4 py-3">{s(r.table_no) || "-"}</td>
                    <td className="px-4 py-3">{normalizeDate(r.date) || "-"}</td>
                    <td className="px-4 py-3">{normalizeTime(r.time) || "-"}</td>
                    <td className="px-4 py-3">{s(r.customer_full_name) || "-"}</td>
                    <td className="px-4 py-3">{s(r.customer_phone) || "-"}</td>
                    <td className="px-4 py-3">{kids}</td>
                    <td className="px-4 py-3">{officer}</td>
                    <td className="px-4 py-3">{s(r.note) || "-"}</td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-white/50" colSpan={10}>
                    Sonuç bulunamadı.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
