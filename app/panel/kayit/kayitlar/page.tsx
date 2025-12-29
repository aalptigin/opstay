"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type RowAny = Record<string, any>;

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

function s(v: any) {
  return String(v ?? "").trim();
}

function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === null || v === undefined) continue;
    const out = String(v).trim();
    if (out !== "") return v;
  }
  return "";
}

function normRestaurant(v: any) {
  const r = s(v).toLowerCase();
  if (!r) return "";
  if (r === "happy moons" || r === "happy_moons" || r === "happy-moons")
    return "Happy Moons";
  if (r === "roof") return "Roof";
  return s(v);
}

function rowRestaurant(row: RowAny) {
  return normRestaurant(pick(row, ["restaurant", "restaurant_name"]));
}

function rowRezNo(row: RowAny) {
  return s(pick(row, ["reservation_no", "rez_no", "reservationNumber", "reservation_id"]));
}

function rowMasa(row: RowAny) {
  return s(pick(row, ["table_no", "masa", "masa_no", "tableNumber"]));
}

function rowDate(row: RowAny) {
  return s(pick(row, ["date", "gun_ay_yil", "dayMonthYear"]));
}

function rowTime(row: RowAny) {
  return s(pick(row, ["time", "saat"]));
}

function rowCustomer(row: RowAny) {
  return s(
    pick(row, ["customer_full_name", "full_name", "guest_full_name", "name_surname"])
  );
}

function rowPhone(row: RowAny) {
  return s(pick(row, ["customer_phone", "phone", "guest_phone", "telefon"]));
}

function rowKids(row: RowAny) {
  return s(pick(row, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"]));
}

function rowOfficer(row: RowAny) {
  return s(
    pick(row, [
      "officer_name",
      "authorized_name",
      "added_by_name",
      "created_by_name",
      "authorized_na",
      "authorized_name ",
    ])
  );
}

function rowNote(row: RowAny) {
  return s(pick(row, ["note", "customer_note", "not", "aciklama"]));
}

function rowStatus(row: RowAny) {
  return s(pick(row, ["status", "state"])).toLowerCase();
}

async function fetchRows(): Promise<RowAny[]> {
  // API’nin {rows:[...]} veya doğrudan [...] dönmesine tolerant
  const res = await fetch("/api/records", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  const rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
  return rows;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function KayitlarPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RowAny[]>([]);
  const [q, setQ] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState<
    "all" | "happy-moons" | "roof"
  >("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchRows();
      setRows(Array.isArray(r) ? r : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const blacklistRows = useMemo(() => {
    return (rows || []).filter((r) => rowStatus(r) === "blacklist");
  }, [rows]);

  const filtered = useMemo(() => {
    const query = s(q).toLowerCase();

    return blacklistRows.filter((r) => {
      const rest = rowRestaurant(r);
      const restLower = rest.toLowerCase();

      if (restaurantFilter === "happy-moons" && restLower !== "happy moons")
        return false;
      if (restaurantFilter === "roof" && restLower !== "roof") return false;

      if (!query) return true;

      const hay = [
        rest,
        rowRezNo(r),
        rowMasa(r),
        rowDate(r),
        rowTime(r),
        rowCustomer(r),
        rowPhone(r),
        rowKids(r),
        rowOfficer(r),
        rowNote(r),
      ]
        .map((x) => s(x).toLowerCase())
        .join(" ");

      return hay.includes(query);
    });
  }, [blacklistRows, q, restaurantFilter]);

  const total = blacklistRows.length;
  const shown = filtered.length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="text-3xl font-semibold tracking-tight text-white"
          >
            Kayıtlar
          </motion.h1>
          <p className="mt-1 text-sm text-white/60">
            Kara Liste / Kayıt verilerini burada görürsün.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/panel/kayit/ekle"
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
              "border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition"
            )}
          >
            Kara Liste&apos;ye Aktar
          </Link>

          <button
            onClick={load}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
              "border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition"
            )}
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Arama */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-2">Arama</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İsim, telefon, rez no, tarih..."
            className={cx(
              "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm",
              "text-white placeholder:text-white/30 outline-none focus:border-white/20"
            )}
          />
        </div>

        {/* Restoran */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-2">Restoran</div>
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value as any)}
            className={cx(
              "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm",
              "text-white outline-none focus:border-white/20"
            )}
          >
            <option value="all">Hepsi</option>
            <option value="happy-moons">Happy Moons</option>
            <option value="roof">Roof</option>
          </select>
        </div>

        {/* Özet */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-2">Özet</div>
          <div className="text-sm text-white/90">
            Toplam: <span className="font-semibold">{total}</span> / Görünen:{" "}
            <span className="font-semibold">{shown}</span>
          </div>
          {loading ? (
            <div className="mt-2 text-xs text-white/40">Yükleniyor…</div>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="px-4 py-3 text-left font-medium">Restoran</th>
                <th className="px-4 py-3 text-left font-medium">Rez. No</th>
                <th className="px-4 py-3 text-left font-medium">Masa</th>
                <th className="px-4 py-3 text-left font-medium">Gün/Ay/Yıl</th>
                <th className="px-4 py-3 text-left font-medium">Saat</th>
                <th className="px-4 py-3 text-left font-medium">Müşteri</th>
                <th className="px-4 py-3 text-left font-medium">Telefon</th>
                <th className="px-4 py-3 text-left font-medium">Çocuk (7-)</th>
                <th className="px-4 py-3 text-left font-medium">Yetkili</th>
                <th className="px-4 py-3 text-left font-medium">Not</th>
                <th className="px-4 py-3 text-left font-medium">Durum</th>
                {/* Düzen bozulmasın diye sütun duruyor ama buton yok */}
                <th className="px-4 py-3 text-left font-medium">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r, idx) => {
                const rest = rowRestaurant(r) || "-";
                const rez = rowRezNo(r) || "-";
                const masa = rowMasa(r) || "-";
                const date = rowDate(r) || "-";
                const time = rowTime(r) || "-";
                const cust = rowCustomer(r) || "-";
                const phone = rowPhone(r) || "-";
                const kids = rowKids(r) || "-";
                const officer = rowOfficer(r) || "-";
                const note = rowNote(r) || "-";

                return (
                  <tr
                    key={r?.id ?? r?.row_id ?? `${idx}`}
                    className={cx(
                      "border-t border-white/10",
                      "hover:bg-white/[0.04] transition"
                    )}
                  >
                    <td className="px-4 py-3 text-white/90 font-medium">
                      {rest}
                    </td>
                    <td className="px-4 py-3 text-white/80">{rez}</td>
                    <td className="px-4 py-3 text-white/80">{masa}</td>
                    <td className="px-4 py-3 text-white/80">{date}</td>
                    <td className="px-4 py-3 text-white/80">{time}</td>
                    <td className="px-4 py-3 text-white/90">{cust}</td>
                    <td className="px-4 py-3 text-white/80">{phone}</td>
                    <td className="px-4 py-3 text-white/80">{kids}</td>
                    <td className="px-4 py-3 text-white/80">{officer}</td>
                    <td className="px-4 py-3 text-white/80">{note}</td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
                        blacklist
                      </span>
                    </td>

                    <td className="px-4 py-3 text-white/30">—</td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td
                    colSpan={12}
                    className="px-4 py-10 text-center text-white/50"
                  >
                    Kayıt bulunamadı.
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
