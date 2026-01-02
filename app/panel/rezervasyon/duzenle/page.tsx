"use client";

import { useEffect, useMemo, useState } from "react";

type Row = Record<string, any>;

function s(v: any) {
  return String(v ?? "").trim();
}

/** Daha güvenli: birden çok olası anahtardan ilk dolu değeri seç */
function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === null || v === undefined) continue;
    const sv = s(v);
    if (sv !== "") return v;
  }
  return "";
}

/** Telefon normalize (opsiyonel): boşluk, tire vb temizle */
function normPhone(v: any) {
  return String(v ?? "").replace(/[^\d+]/g, "").trim();
}

/** fetch response'u güvenli JSON'a çevir (500/HTML vb. durumlarda patlamasın) */
async function safeReadJson(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return { _raw: "" };
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

/** Hata mesajını her durumda güvenli stringe çevir */
function errMsg(e: any, fallback: string) {
  // Error instance
  if (e && typeof e === "object" && "message" in e) return s((e as any).message) || fallback;
  // string
  if (typeof e === "string") return s(e) || fallback;
  // unknown
  return fallback;
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

  /** Satır için güvenli "kimlik": id yoksa rez no ile devam */
  function rowKey(r: Row, idx?: number) {
    const id = s(pick(r, ["reservation_id", "resarvation_id", "id"]));
    const rez = s(pick(r, ["reservation_no", "reservation_n0", "rez_no"]));
    return id || rez || `row-${idx ?? 0}`;
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch("/api/reservations", { cache: "no-store" });
        const j = await safeReadJson(r);

        if (!alive) return;

        if (!r.ok) {
          const message = s(j?.error) || s(j?._raw) || `Yükleme hatası (${r.status})`;
          setErr(message);
          setRows([]);
          return;
        }

        setRows(Array.isArray(j?.rows) ? j.rows : []);
      } catch (e: any) {
        if (!alive) return;
        setErr(errMsg(e, "Yükleme hatası"));
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

    setRestaurant(s(pick(selected, ["restaurant", "restaurant_name"])));
    setReservationNo(s(pick(selected, ["reservation_no", "reservation_n0", "rez_no"])));
    setTableNo(s(pick(selected, ["table_no", "masa_no", "table_n0"])));
    setDate(s(pick(selected, ["date", "gun_ay_yil", "dayMonthYear"])));
    setTime(s(pick(selected, ["time", "saat"])));
    setCustomerFullName(s(pick(selected, ["customer_full_name", "full_name", "guest_full_name"])));
    setCustomerPhone(s(pick(selected, ["customer_phone", "phone", "telefon"])));
    setNote(s(pick(selected, ["note", "customer_note", "summary", "not"])));
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
        r.rez_no,
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
      // ✅ En güvenlisi: önce id (varsa), yoksa rez no ile de devam etmeyi dene
      const reservation_id = s(pick(selected, ["reservation_id", "resarvation_id", "id"]));
      const reservation_no_fallback = s(pick(selected, ["reservation_no", "reservation_n0", "rez_no"])) || s(reservationNo);

      // En azından bir tanesi olmalı
      if (!reservation_id && !reservation_no_fallback) {
        throw new Error("Güncelleme için rezervasyon kimliği bulunamadı (reservation_id veya rezervasyon no).");
      }

      const payload = {
        // backend sadece reservation_id istiyorsa bile gönderiyoruz; yoksa fallback alanı da gider
        reservation_id: reservation_id || undefined,
        reservation_no: reservationNo || reservation_no_fallback || undefined,

        restaurant,
        restaurant_name: restaurant, // bazı backendlerde bu isim kullanılabiliyor

        table_no: tableNo,
        date,
        time,

        customer_full_name: customerFullName,
        full_name: customerFullName, // legacy
        customer_phone: normPhone(customerPhone),
        phone: normPhone(customerPhone), // legacy

        note,
        customer_note: note, // legacy
      };

      const res = await fetch("/api/reservations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);

      // ✅ JSON dönmese bile patlamasın
      if (!res.ok) {
        const serverErr = s(data?.error) || s(data?._raw) || `Kayıt güncellenemedi (${res.status})`;
        throw new Error(serverErr);
      }

      // bazı route'lar {ok:true} döndürür, bazıları boş döner; ikisini de kabul edelim
      if (data && typeof data === "object" && "ok" in data && !data.ok) {
        const serverErr = s((data as any)?.error) || "Kayıt güncellenemedi";
        throw new Error(serverErr);
      }

      setMsg("Kayıt güncellendi.");

      // local state’i de güncelle
      const targetKey = reservation_id || reservation_no_fallback;

      setRows((prev) =>
        prev.map((r, idx) => {
          const k = rowKey(r, idx);
          // Önce reservation_id ile, yoksa rez no ile yakala
          const match =
            (reservation_id && k === reservation_id) ||
            (!reservation_id && reservation_no_fallback && k === reservation_no_fallback);

          if (!match) return r;

          return {
            ...r,
            restaurant,
            restaurant_name: restaurant,
            reservation_no: reservationNo || reservation_no_fallback,
            reservation_n0: reservationNo || reservation_no_fallback,
            table_no: tableNo,
            date,
            time,
            customer_full_name: customerFullName,
            full_name: customerFullName,
            customer_phone: normPhone(customerPhone),
            phone: normPhone(customerPhone),
            note,
            customer_note: note,
          };
        })
      );

      // seçili kaydı da güncel tut (liste ile tutarsız kalmasın)
      setSelected((prev) => {
        if (!prev) return prev;
        const k = rowKey(prev);
        if (reservation_id && k !== reservation_id) return prev;
        if (!reservation_id && reservation_no_fallback && k !== reservation_no_fallback) return prev;

        return {
          ...prev,
          restaurant,
          restaurant_name: restaurant,
          reservation_no: reservationNo || reservation_no_fallback,
          reservation_n0: reservationNo || reservation_no_fallback,
          table_no: tableNo,
          date,
          time,
          customer_full_name: customerFullName,
          full_name: customerFullName,
          customer_phone: normPhone(customerPhone),
          phone: normPhone(customerPhone),
          note,
          customer_note: note,
        };
      });
    } catch (e: any) {
      setMsg(errMsg(e, "Kayıt güncellenemedi"));
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
              const key = rowKey(r, idx);
              const active =
                !!selected && rowKey(selected) === key;

              const label = `${s(
                pick(r, ["restaurant", "restaurant_name"])
              )} • ${s(pick(r, ["reservation_no", "reservation_n0", "rez_no"]))} • ${s(
                pick(r, ["customer_full_name", "full_name"])
              )}`;

              return (
                <button
                  key={key}
                  onClick={() => setSelected(r)}
                  className={[
                    "w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/5",
                    active ? "bg-white/10" : "",
                  ].join(" ")}
                >
                  <div className="text-sm">{label || "-"}</div>
                  <div className="text-xs text-white/50">
                    {s(pick(r, ["date", "gun_ay_yil"]))} • {s(pick(r, ["time", "saat"]))} •{" "}
                    {s(pick(r, ["customer_phone", "phone"]))}
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
