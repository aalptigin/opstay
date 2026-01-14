"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Row = Record<string, any>;
function s(v: any) {
  return String(v ?? "").trim();
}

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
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

function normPhone(v: any) {
  return String(v ?? "").replace(/[^\d+]/g, "").trim();
}

// date: API GET normalize -> dd/MM/yyyy dönebiliyor. Edit ekranda TR format gösterelim.
function formatTRDate(v: any) {
  const raw = s(v);
  if (!raw) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw.replace(/\./g, "/");
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      const out = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
      return out.replace(/\./g, "/");
    }
  }
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

function formatTRTime(v: any) {
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

function validateForm(x: {
  restaurant: string;
  reservationNo: string;
  tableNo: string;
  date: string;
  time: string;
  customerFullName: string;
  customerPhone: string;
  peopleCount: string;
  kidsU7: string;
}) {
  const errs: string[] = [];
  if (!s(x.restaurant)) errs.push("Restoran zorunludur.");
  if (!s(x.reservationNo)) errs.push("Rez. No zorunludur.");
  if (!s(x.tableNo)) errs.push("Masa No zorunludur.");
  if (!s(x.date)) errs.push("Tarih zorunludur.");
  if (!s(x.time)) errs.push("Saat zorunludur.");
  if (!s(x.customerFullName)) errs.push("Müşteri adı zorunludur.");
  if (!s(x.customerPhone)) errs.push("Telefon zorunludur.");

  const pc = s(x.peopleCount);
  if (pc && !/^\d+$/.test(pc)) errs.push("Kişi sayısı sadece rakam olmalıdır.");
  const ku = s(x.kidsU7);
  if (ku && !/^\d+$/.test(ku)) errs.push("Çocuk sayısı sadece rakam olmalıdır.");

  return errs;
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
  const [peopleCount, setPeopleCount] = useState(""); // ✅ kişi sayısı (toplam)
  const [kidsU7, setKidsU7] = useState(""); // ✅ çocuk sayısı
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const searchRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/reservations", { cache: "no-store" });
      const j = await r.json();
      setRows(Array.isArray(j?.rows) ? j.rows : []);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    async function boot() {
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

    boot();
    return () => {
      alive = false;
    };
  }, []);

  // bir kayıt seçildiğinde form alanlarını doldur
  useEffect(() => {
    setMsg("");
    if (!selected) {
      setRestaurant("");
      setReservationNo("");
      setTableNo("");
      setDate("");
      setTime("");
      setCustomerFullName("");
      setCustomerPhone("");
      setPeopleCount("");
      setKidsU7("");
      setNote("");
      return;
    }

    const rest = s(pick(selected, ["restaurant", "restaurant_name"]));
    const rz = s(pick(selected, ["reservation_no", "reservation_n0"]));
    const tb = s(pick(selected, ["table_no", "masa_no"]));

    const d = s(pick(selected, ["date", "gun_ay_yil"]));
    const t = s(pick(selected, ["time", "saat"]));

    const cn = s(pick(selected, ["customer_full_name", "full_name"]));
    const cp = s(pick(selected, ["customer_phone", "phone"]));

    const pc = s(
      pick(selected, [
        "total_guests",
        "people_count",
        "guest_count",
        "kisi_sayisi_toplam",
        "kisi_sayisi",
        "total_people",
        "person_count",
      ])
    );

    const ku = s(pick(selected, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"]));

    const nt = s(pick(selected, ["note", "customer_note"]));

    setRestaurant(rest);
    setReservationNo(rz);
    setTableNo(tb);
    setDate(d ? formatTRDate(d) : "");
    setTime(t ? formatTRTime(t) : "");
    setCustomerFullName(cn);
    setCustomerPhone(normPhone(cp));
    setPeopleCount(pc);
    setKidsU7(ku);
    setNote(nt);
  }, [selected]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;

    return rows.filter((r) => {
      const hay = [
        pick(r, ["restaurant", "restaurant_name"]),
        pick(r, ["reservation_no", "reservation_n0"]),
        pick(r, ["customer_full_name", "full_name"]),
        pick(r, ["customer_phone", "phone"]),
        pick(r, ["table_no", "masa_no"]),
        pick(r, ["date", "gun_ay_yil"]),
        pick(r, ["time", "saat"]),
      ]
        .map((x) => s(x).toLowerCase())
        .join(" | ");

      return hay.includes(qq);
    });
  }, [rows, q]);

  const selectedId = useMemo(() => {
    if (!selected) return "";
    return s(pick(selected, ["reservation_id", "resarvation_id"]));
  }, [selected]);

  async function handleSave() {
    if (!selected) return;

    setMsg("");
    const reservation_id = s(pick(selected, ["reservation_id", "resarvation_id"]));
    if (!reservation_id) {
      setMsg("reservation_id alanı bulunamadı");
      return;
    }

    const errs = validateForm({
      restaurant,
      reservationNo,
      tableNo,
      date,
      time,
      customerFullName,
      customerPhone,
      peopleCount,
      kidsU7,
    });

    if (errs.length) {
      setMsg(errs[0]);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/reservations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id,

          restaurant,
          restaurant_name: restaurant,

          reservation_no: reservationNo,
          table_no: tableNo,

          date,
          time,

          customer_full_name: customerFullName,
          customer_phone: normPhone(customerPhone),

          // ✅ kişi + çocuk sayısı
          total_guests: s(peopleCount),
          people_count: s(peopleCount),
          guest_count: s(peopleCount),

          kids_u7: s(kidsU7),
          child_u7: s(kidsU7),
          children_u7: s(kidsU7),

          note,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Kayıt güncellenemedi");
      }

      setMsg("Kayıt güncellendi.");

      setRows((prev) =>
        prev.map((r) => {
          const rid = s(pick(r, ["reservation_id", "resarvation_id"]));
          if (rid !== reservation_id) return r;

          return {
            ...r,
            restaurant,
            restaurant_name: restaurant,
            reservation_no: reservationNo,
            table_no: tableNo,
            date,
            time,
            customer_full_name: customerFullName,
            full_name: customerFullName,
            customer_phone: normPhone(customerPhone),
            phone: normPhone(customerPhone),

            total_guests: s(peopleCount),
            people_count: s(peopleCount),
            guest_count: s(peopleCount),
            kisi_sayisi: s(peopleCount),
            kisi_sayisi_toplam: s(peopleCount),

            kids_u7: s(kidsU7),
            child_u7: s(kidsU7),
            children_u7: s(kidsU7),

            note,
            customer_note: note,
          };
        })
      );

      setSelected((prev) => {
        if (!prev) return prev;
        const rid = s(pick(prev, ["reservation_id", "resarvation_id"]));
        if (rid !== reservation_id) return prev;
        return {
          ...prev,
          restaurant,
          restaurant_name: restaurant,
          reservation_no: reservationNo,
          table_no: tableNo,
          date,
          time,
          customer_full_name: customerFullName,
          full_name: customerFullName,
          customer_phone: normPhone(customerPhone),
          phone: normPhone(customerPhone),

          total_guests: s(peopleCount),
          people_count: s(peopleCount),
          guest_count: s(peopleCount),
          kisi_sayisi: s(peopleCount),
          kisi_sayisi_toplam: s(peopleCount),

          kids_u7: s(kidsU7),
          child_u7: s(kidsU7),
          children_u7: s(kidsU7),

          note,
          customer_note: note,
        };
      });
    } catch (e: any) {
      setMsg(e?.message || "Kayıt güncellenemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Rezervasyon Düzenle</h1>
          <p className="text-white/60 text-sm">
            Bu ekran, mevcut rezervasyonları listeden seçip temel bilgilerini güncellemeniz için hazırlanmıştır.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setMsg("");
              setTimeout(() => searchRef.current?.focus(), 0);
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Seçimi kaldır
          </button>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className={cx(
              "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10",
              loading ? "opacity-60 cursor-not-allowed" : ""
            )}
          >
            {loading ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs text-white/60">Arama</label>
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rez. no / müşteri / telefon..."
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
        />
        <div className="mt-2 text-xs text-white/45">İpucu: Telefon, rezervasyon no veya müşteri adı ile arayabilirsiniz.</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Sol: Liste */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm text-white/70">{loading ? "Yükleniyor..." : `Kayıt: ${filtered.length}`}</div>
            {err ? <div className="text-sm text-red-300">{err}</div> : null}
          </div>

          {/* ✅ Scroll var ama gizli */}
          <div className="max-h-[520px] overflow-auto hide-scrollbar">
            {loading ? (
              <div className="p-4 space-y-2 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-white/10" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-8 text-sm text-white/50">Sonuç bulunamadı.</div>
            ) : (
              filtered.map((r, idx) => {
                const rowId = s(pick(r, ["reservation_id", "resarvation_id"])) || `row-${idx}`;
                const active = selectedId && selectedId === s(pick(r, ["reservation_id", "resarvation_id"]));

                const label = `${s(pick(r, ["restaurant", "restaurant_name"]))} • ${s(
                  pick(r, ["reservation_no", "reservation_n0"])
                )} • ${s(pick(r, ["customer_full_name", "full_name"]))}`;

                const d = s(pick(r, ["date", "gun_ay_yil"]));
                const t = s(pick(r, ["time", "saat"]));
                const ph = s(pick(r, ["customer_phone", "phone"]));

                const pc = s(
                  pick(r, [
                    "total_guests",
                    "people_count",
                    "guest_count",
                    "kisi_sayisi_toplam",
                    "kisi_sayisi",
                    "total_people",
                    "person_count",
                  ])
                );
                const ku = s(pick(r, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"]));

                return (
                  <button
                    key={rowId}
                    onClick={() => setSelected(r)}
                    className={cx(
                      "w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/5",
                      active ? "bg-white/10" : ""
                    )}
                  >
                    <div className="text-sm">{label || "-"}</div>
                    <div className="text-xs text-white/50">
                      {formatTRDate(d) || "-"} • {formatTRTime(t) || "-"} • {ph ? normPhone(ph) : "-"}
                      <span className="ml-2 text-white/35">• Kişi: {pc || "-"} • Çocuk: {ku || "-"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Sağ: Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Seçili Rezervasyon</div>
            {selectedId ? <div className="text-xs text-white/45">ID: {selectedId}</div> : null}
          </div>

          {!selected ? (
            <div className="mt-3 text-sm text-white/50">Soldan bir rezervasyon seçin.</div>
          ) : (
            <div className="mt-3 space-y-3 text-sm">
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
                    placeholder="29/12/2025"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                  <div className="mt-1 text-[11px] text-white/40">Format: dd/MM/yyyy</div>
                </div>
                <div>
                  <label className="text-xs text-white/60">Saat</label>
                  <input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="19:00"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                  <div className="mt-1 text-[11px] text-white/40">Format: HH:mm</div>
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
                  onBlur={() => setCustomerPhone((p) => normPhone(p))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  inputMode="tel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60">Kişi sayısı (Toplam)</label>
                  <input
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(e.target.value.replace(/[^\d]/g, ""))}
                    inputMode="numeric"
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">7 yaş altı çocuk</label>
                  <input
                    value={kidsU7}
                    onChange={(e) => setKidsU7(e.target.value.replace(/[^\d]/g, ""))}
                    inputMode="numeric"
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60">Not</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20 min-h-[90px]"
                />
              </div>

              <div className="pt-3 sticky bottom-[-1px] -mx-4 px-4 pb-4 bg-[#0b1220]/55 backdrop-blur border-t border-white/10">
                <div className="flex items-center justify-between gap-3 pt-3">
                  <span
                    className={cx(
                      "text-xs",
                      msg
                        ? /hata|bulunamadı|güncellenemedi|error|zorunludur/i.test(msg)
                          ? "text-red-200"
                          : "text-emerald-200"
                        : "text-white/60"
                    )}
                  >
                    {msg ? msg : "Değişiklikleri kaydetmek için Kaydet’e basın."}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(null);
                        setMsg("");
                        setTimeout(() => searchRef.current?.focus(), 0);
                      }}
                      disabled={saving}
                      className={cx(
                        "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10",
                        saving ? "opacity-60 cursor-not-allowed" : ""
                      )}
                    >
                      Vazgeç
                    </button>

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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Scrollbar gizle (scroll çalışır) */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge (legacy) */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
