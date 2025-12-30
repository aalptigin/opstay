"use client";

import { useEffect, useMemo, useState } from "react";

type Row = Record<string, any>;
function s(v: any) {
  return String(v ?? "").trim();
}

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [q, setQ] = useState("");

  // seçim & form state
  const [selected, setSelected] = useState<Row | null>(null);
  const [restaurant, setRestaurant] = useState("");
  const [reservationNo, setReservationNo] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customerFullName, setCustomerFullName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch("/api/reservations", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        setRows(Array.isArray(j?.rows) ? j.rows : []);
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

  // bir kayıt seçildiğinde form alanlarını doldur
  useEffect(() => {
    if (!selected) {
      setRestaurant("");
      setReservationNo("");
      setTableNo("");
      setDate("");
      setTime("");
      setCustomerFullName("");
      setCustomerPhone("");
      setNote("");
      return;
    }

    setRestaurant(s(selected.restaurant || selected.restaurant_name));
    setReservationNo(s(selected.reservation_no || selected.reservation_n0));
    setTableNo(s(selected.table_no || selected.masa_no));
    setDate(s(selected.date || selected.gun_ay_yil));
    setTime(s(selected.time || selected.saat));
    setCustomerFullName(s(selected.customer_full_name || selected.full_name));
    setCustomerPhone(s(selected.customer_phone || selected.phone));
    setNote(s(selected.note || selected.customer_note));
  }, [selected]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;

    return rows.filter((r) => {
      const hay = [
        r.restaurant,
        r.restaurant_name,
        r.reservation_no,
        r.reservation_n0,
        r.customer_full_name,
        r.full_name,
        r.customer_phone,
        r.phone,
      ]
        .map((x) => s(x).toLowerCase())
        .join(" | ");

      return hay.includes(qq);
    });
  }, [rows, q]);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setMsg("");

    try {
      const reservation_id = s(
        selected.reservation_id ||
          selected.resarvation_id || // eski yazım varsa da destekle
          ""
      );
      if (!reservation_id) {
        throw new Error("reservation_id alanı bulunamadı");
      }

      const res = await fetch("/api/reservations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id,
          restaurant,
          reservation_no: reservationNo,
          table_no: tableNo,
          date,
          time,
          customer_full_name: customerFullName,
          customer_phone: customerPhone,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Kayıt güncellenemedi");
      }

      setMsg("Kayıt güncellendi.");

      // local state’i de güncelle
      setRows((prev) =>
        prev.map((r) =>
          s(r.reservation_id || r.resarvation_id) === reservation_id
            ? {
                ...r,
                restaurant,
                restaurant_name: restaurant,
                reservation_no: reservationNo,
                table_no: tableNo,
                date,
                time,
                customer_full_name: customerFullName,
                full_name: customerFullName,
                customer_phone: customerPhone,
                phone: customerPhone,
                note,
                customer_note: note,
              }
            : r
        )
      );
    } catch (e: any) {
      setMsg(e?.message || "Kayıt güncellenemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Rezervasyon Düzenle</h1>
        <p className="text-white/60 text-sm">
          Bu ekran, mevcut rezervasyonları listeden seçip temel bilgilerini
          güncellemeniz için hazırlanmıştır.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs text-white/60">Arama</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rez. no / müşteri / telefon..."
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Sol: Liste */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm text-white/70">
              {loading ? "Yükleniyor..." : `Kayıt: ${filtered.length}`}
            </div>
            {err ? <div className="text-sm text-red-300">{err}</div> : null}
          </div>

          <div className="max-h-[520px] overflow-auto">
            {filtered.map((r, idx) => {
              const rowId =
                s(r.reservation_id || r.resarvation_id) || `row-${idx}`;
              const active =
                selected &&
                (s(selected.reservation_id || selected.resarvation_id) ===
                  s(r.reservation_id || r.resarvation_id));

              const label = `${s(
                r.restaurant || r.restaurant_name
              )} • ${s(r.reservation_no || r.reservation_n0)} • ${s(
                r.customer_full_name || r.full_name
              )}`;

              return (
                <button
                  key={rowId}
                  onClick={() => setSelected(r)}
                  className={[
                    "w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/5",
                    active ? "bg-white/10" : "",
                  ].join(" ")}
                >
                  <div className="text-sm">{label || "-"}</div>
                  <div className="text-xs text-white/50">
                    {s(r.date || r.gun_ay_yil)} • {s(r.time || r.saat)} •{" "}
                    {s(r.customer_phone || r.phone)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sağ: Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium mb-2">Seçili Rezervasyon</div>

          {!selected ? (
            <div className="text-sm text-white/50">
              Soldan bir rezervasyon seçin.
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-white/60">Restoran</label>
                <input
                  value={restaurant}
                  onChange={(e) => setRestaurant(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60">Rez. No</label>
                  <input
                    value={reservationNo}
                    onChange={(e) => setReservationNo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Masa No</label>
                  <input
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60">Tarih</label>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Saat</label>
                  <input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60">Müşteri</label>
                <input
                  value={customerFullName}
                  onChange={(e) => setCustomerFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-white/60">Telefon</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-white/60">Not</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20 min-h-[80px]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-white/60">{msg}</span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#0ea5ff] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
