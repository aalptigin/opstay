"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type ReservationRow = {
  reservation_id?: string;

  restaurant?: "Happy Moons" | "Roof";

  reservation_no?: string;
  table_no?: string;

  date?: string; // YYYY-MM-DD veya dd/MM/yyyy (API normalize edebilir)
  time?: string; // HH:mm

  customer_full_name?: string;
  customer_phone?: string;

  // ✅ Alan adları (GS/UI uyumluluk)
  kids_u7?: string;
  child_u7?: string;
  officer_name?: string;
  authorized_name?: string;

  note?: string;

  // eski alanlar gelebilir (geriye uyumluluk)
  datetime?: string;
  full_name?: string;
  phone?: string;
};

type BlacklistCheckResponse = {
  ok: true;
  is_blacklisted: boolean;
  match?: {
    full_name?: string;
    phone?: string;
    note?: string;
    risk_level?: string;
  };
  message?: string;
};

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

function s(v: any) {
  return String(v ?? "").trim();
}

export default function ReservationsPage() {
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Yükleme state'lerini ayır (liste / kayıt)
  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Misafir Sorgulama (Ad Soyad + Telefon)
  const [lookupName, setLookupName] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<BlacklistCheckResponse | null>(null);

  // Tablo filtre (sorgulama alanı ile eş zamanlı)
  const [tableFilterName, setTableFilterName] = useState("");
  const [tableFilterPhone, setTableFilterPhone] = useState("");

  function normPhone(v: string) {
    // +90 vb. ihtimalini bozmadan, tamamen sayıya çek
    const cleaned = String(v ?? "").replace(/[^\d+]/g, "").trim();
    // Tipik TR girişleri için: +90 varsa +90xxxxx..., 0 ile başlıyorsa 0xxxxxxxxxx
    return cleaned;
  }

  function todayISO() {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function normalizeToISODate(v: any) {
    const raw = String(v ?? "").trim();
    if (!raw) return "";
    // ISO already
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    // TR format like 02/01/2026 or 02.01.2026
    const m = raw.match(/^(\d{2})[\/\.](\d{2})[\/\.](\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;

    // datetime string
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);

    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const yyyy = String(d.getFullYear());
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    return raw;
  }

  function formatTRDate(v: any) {
    const raw = s(v);
    if (!raw) return "-";
    // dd/MM/yyyy ise aynen
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    // 29.12.2025 -> 29/12/2025
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw.replace(/\./g, "/");
    // ISO
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
    // datetime
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
    if (!raw) return "-";
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

  // Restoran seçimi (buton + mini menü)
  const [restaurant, setRestaurant] = useState<"Happy Moons" | "Roof">("Happy Moons");
  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const restaurantWrapRef = useRef<HTMLDivElement | null>(null);

  // Form state
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const [reservationNo, setReservationNo] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [date, setDate] = useState(`${yyyy}-${mm}-${dd}`);
  const [time, setTime] = useState("19:00");
  const [customerFullName, setCustomerFullName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [childU7Count, setChildU7Count] = useState("");
  const [staffFullName, setStaffFullName] = useState("");
  const [note, setNote] = useState("");

  const datetimeISO = useMemo(() => {
    const d = (date || "").trim();
    const t = (time || "").trim();
    if (!d || !t) return "";
    return `${d}T${t}:00`;
  }, [date, time]);

  function onLookupName(v: string) {
    setLookupName(v);
    setCustomerFullName(v);
    setTableFilterName(v);
  }

  function onLookupPhone(v: string) {
    const p = normPhone(v);
    setLookupPhone(p);
    setCustomerPhone(p);
    setTableFilterPhone(p);
  }

  function resetLookupAndFilters(syncFormToo = false) {
    setLookupName("");
    setLookupPhone("");
    setLookupErr(null);
    setLookupResult(null);
    setTableFilterName("");
    setTableFilterPhone("");

    if (syncFormToo) {
      setCustomerFullName("");
      setCustomerPhone("");
    }
  }

  function validateBeforeSave() {
    const errs: string[] = [];
    if (!s(reservationNo)) errs.push("Rezervasyon numarası zorunludur.");
    if (!s(tableNo)) errs.push("Masa numarası zorunludur.");
    if (!s(date)) errs.push("Tarih zorunludur.");
    if (!s(time)) errs.push("Saat zorunludur.");
    if (!s(customerFullName)) errs.push("Müşteri isim soyisim zorunludur.");
    if (!s(customerPhone)) errs.push("Müşteri telefon numarası zorunludur.");
    if (!s(staffFullName)) errs.push("Rezervasyonu alan yetkili adı zorunludur.");
    return errs;
  }

  async function load() {
    setMsg(null);
    setListLoading(true);
    try {
      const res = await fetch("/api/reservations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rezervasyonlar alınamadı");
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setListLoading(false);
    }
  }

  async function runBlacklistLookup(name: string, phone: string) {
    const n = String(name ?? "").trim();
    const p = normPhone(phone ?? "");

    setLookupErr(null);
    setLookupResult(null);

    if (!n || !p) return;

    setLookupLoading(true);
    try {
      const res = await fetch("/api/blacklist/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ full_name: n, phone: p }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Sorgulama başarısız.");

      setLookupResult(data as BlacklistCheckResponse);
    } catch (e: any) {
      setLookupErr(e?.message || "Sorgulama sırasında hata oluştu.");
    } finally {
      setLookupLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Restoran dropdown: dışarı tıkla / ESC kapat
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!restaurantOpen) return;
      const el = restaurantWrapRef.current;
      const t = e.target as any;
      if (el && t && !el.contains(t)) setRestaurantOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setRestaurantOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [restaurantOpen]);

  // Otomatik sorgu (debounce): Ad Soyad + Telefon dolunca 450ms sonra kontrol
  useEffect(() => {
    const n = lookupName.trim();
    const p = lookupPhone.trim();

    setLookupErr(null);

    if (!n || !p) {
      setLookupResult(null);
      return;
    }

    const t = setTimeout(() => {
      runBlacklistLookup(n, p);
    }, 450);

    return () => clearTimeout(t);
  }, [lookupName, lookupPhone]);

  async function createReservation() {
    setMsg(null);

    const errs = validateBeforeSave();
    if (errs.length) {
      setMsg(errs[0]);
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        restaurant,

        reservation_no: s(reservationNo),
        table_no: s(tableNo),

        date: s(date),
        time: s(time),

        customer_full_name: s(customerFullName),
        customer_phone: normPhone(customerPhone),

        officer_name: s(staffFullName),
        note: s(note),

        // geriye uyumluluk (backend eski alanları kullanıyorsa)
        datetime: datetimeISO,
        full_name: s(customerFullName),
        phone: normPhone(customerPhone),
      };

      // her iki restoran için de çocuk sayısı
      const kids = s(childU7Count);
      payload.kids_u7 = kids;
      payload.child_u7 = kids;

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rezervasyon oluşturulamadı");

      setMsg("Rezervasyon oluşturuldu.");

      setReservationNo("");
      setTableNo("");
      setDate(`${yyyy}-${mm}-${dd}`);
      setTime("19:00");
      setCustomerFullName("");
      setCustomerPhone("");
      setChildU7Count("");
      setStaffFullName("");
      setNote("");

      // Sorgulama alanı da temizlensin (form ile çakışmasın)
      resetLookupAndFilters(false);

      await load();
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  // Listeyi ekranda tutarlı göstermek için (bazı kayıtlar eski format olabilir)
  function viewDate(r: ReservationRow) {
    if (r.date) return r.date;
    if (r.datetime) return String(r.datetime).slice(0, 10);
    return "-";
  }
  function viewTime(r: ReservationRow) {
    if (r.time) return r.time;
    if (r.datetime) return String(r.datetime).slice(11, 16);
    return "-";
  }
  function viewCustomerName(r: ReservationRow) {
    return r.customer_full_name || r.full_name || "-";
  }
  function viewCustomerPhone(r: ReservationRow) {
    return r.customer_phone || r.phone || "-";
  }

  // ✅ Misafir sorgulama doluyken: aynı misafirin geçmiş rezervasyonlarını da çıkar
  const guestHistoryRows = useMemo(() => {
    const n = lookupName.trim().toLowerCase();
    const p = normPhone(lookupPhone);

    if (!n || !p) return [];

    return (rows || [])
      .filter((r) => {
        const rn = String(r.customer_full_name || r.full_name || "").trim().toLowerCase();
        const rp = normPhone(String(r.customer_phone || r.phone || ""));
        // name + phone ikisi de eşleşsin (includes ile toleranslı)
        return rn && rp && rn.includes(n) && rp.includes(p);
      })
      .sort((a, b) => {
        // tarih desc, saat desc
        const da = normalizeToISODate(viewDate(a));
        const db = normalizeToISODate(viewDate(b));
        if (da !== db) return String(db).localeCompare(String(da));
        const ta = String(viewTime(a) || "");
        const tb = String(viewTime(b) || "");
        return tb.localeCompare(ta);
      });
  }, [rows, lookupName, lookupPhone]);

  const filteredRows = useMemo(() => {
    const n = tableFilterName.trim().toLowerCase();
    const p = normPhone(tableFilterPhone);

    const hasAnyFilter = !!n || !!p;
    const today = todayISO();

    const list = (rows || [])
      .filter((r) => {
        // ✅ Misafir sorgulama/filtre kullanılıyorsa: tarih kısıtı kaldır (geçmiş rezervasyonlar da görünsün)
        if (hasAnyFilter) return true;

        // ✅ Filtre yoksa: sadece bugünün rezervasyonları
        const rd = normalizeToISODate(viewDate(r));
        return rd === today;
      })
      .filter((r) => {
        const rn = String(r.customer_full_name || r.full_name || "").toLowerCase();
        const rp = normPhone(String(r.customer_phone || r.phone || ""));
        const nameOk = !n || rn.includes(n);
        const phoneOk = !p || rp.includes(p);
        return nameOk && phoneOk;
      });

    // ✅ Filtre varsa: tarih (desc) + saat (asc) ile sırala; yoksa mevcut davranış (saat asc)
    if (hasAnyFilter) {
      return list.sort((a, b) => {
        const da = normalizeToISODate(viewDate(a));
        const db = normalizeToISODate(viewDate(b));
        if (da !== db) return String(db).localeCompare(String(da)); // yeni tarih üstte
        const ta = String(viewTime(a) || "");
        const tb = String(viewTime(b) || "");
        return ta.localeCompare(tb);
      });
    }

    return list.sort((a, b) => {
      const ta = String(viewTime(a) || "");
      const tb = String(viewTime(b) || "");
      return ta.localeCompare(tb);
    });
  }, [rows, tableFilterName, tableFilterPhone]);

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">REZERVASYON</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Rezervasyon Oluştur</h1>
      <p className="mt-2 text-sm text-white/60">Restoran seçimi ile birlikte rezervasyon bilgilerini kaydedin.</p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 relative"
      >
        {/* 1) Sağ üst: Restoran seçimi */}
        <div className="absolute -top-4 right-4 z-20" ref={restaurantWrapRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRestaurantOpen((v) => !v)}
              className="rounded-xl border border-white/15 bg-[#050B14]/90 px-4 py-2 text-sm text-white/90 shadow-lg backdrop-blur"
              title="Restoran seç"
            >
              {restaurant} ▾
            </button>

            {restaurantOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#050B14]/95 backdrop-blur shadow-xl overflow-hidden">
                {(["Happy Moons", "Roof"] as const).map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => {
                      setRestaurant(x);
                      setRestaurantOpen(false);
                    }}
                    className={cx(
                      "w-full text-left px-4 py-3 text-sm",
                      restaurant === x ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"
                    )}
                  >
                    {x}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Misafir Sorgulama (EN ÜSTTE) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Misafir Sorgulama</div>
              <div className="mt-1 text-xs text-white/60">
                Ad Soyad + Telefon ile sorgu yapılır. Girilen bilgiler rezervasyon formuna ve aşağıdaki liste filtresine
                eş zamanlı aktarılır.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => resetLookupAndFilters(true)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                Temizle
              </button>

              <button
                type="button"
                onClick={() => runBlacklistLookup(lookupName, lookupPhone)}
                disabled={lookupLoading || !lookupName.trim() || !lookupPhone.trim()}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {lookupLoading ? "Sorgulanıyor..." : "Sorgula"}
              </button>
            </div>
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60">Ad Soyad</label>
              <input
                value={lookupName}
                onChange={(e) => onLookupName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="Örn: Burak Yılmaz"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Telefon</label>
              <input
                value={lookupPhone}
                onChange={(e) => onLookupPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="05xx..."
                inputMode="tel"
              />
              <div className="mt-1 text-[11px] text-white/40">Sadece rakam girmeniz yeterli (boşluk/çizgi fark etmez).</div>
            </div>
          </div>

          <div className="mt-3">
            {lookupErr ? (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {lookupErr}
              </div>
            ) : null}

            {lookupLoading ? (
              <div className="text-xs text-white/45">Sorgulanıyor...</div>
            ) : lookupResult?.ok ? (
              lookupResult.is_blacklisted ? (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  <div className="font-semibold">Uyarı: Bu misafir kara listede görünüyor.</div>
                  {lookupResult.match?.risk_level ? (
                    <div className="mt-1 text-xs text-amber-100/80">Risk: {lookupResult.match.risk_level}</div>
                  ) : null}
                  {lookupResult.match?.note ? (
                    <div className="mt-1 text-xs text-amber-100/80">Not: {lookupResult.match.note}</div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  Kara listede eşleşme bulunamadı.
                </div>
              )
            ) : (
              <div className="text-xs text-white/45">
                {lookupName.trim() && lookupPhone.trim()
                  ? "Sonuç bekleniyor..."
                  : "Sorgulamak için Ad Soyad ve Telefon girin."}
              </div>
            )}
          </div>

          {/* ✅ Önceki rezervasyonlar (Misafir sorgulama ile birlikte) */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Önceki Rezervasyonlar</div>
                <div className="text-[11px] text-white/50 mt-1">
                  {lookupName.trim() && lookupPhone.trim()
                    ? `Eşleşen kayıt: ${guestHistoryRows.length}`
                    : "Görüntülemek için Ad Soyad ve Telefon girin."}
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[260px] border-t border-white/10">
              <table className="w-full text-sm">
                <thead className="text-white/55">
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2 whitespace-nowrap">Tarih</th>
                    <th className="text-left px-4 py-2 whitespace-nowrap">Saat</th>
                    <th className="text-left px-4 py-2 whitespace-nowrap">Restoran</th>
                    <th className="text-left px-4 py-2 whitespace-nowrap">Rez. No</th>
                    <th className="text-left px-4 py-2 whitespace-nowrap">Masa</th>
                    <th className="text-left px-4 py-2 whitespace-nowrap">Not</th>
                  </tr>
                </thead>

                <tbody className="text-white/85">
                  {lookupName.trim() && lookupPhone.trim() ? (
                    guestHistoryRows.length ? (
                      guestHistoryRows.map((r, idx) => (
                        <tr key={(r.reservation_id || "") + "h" + idx} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-4 py-2 text-white/70 whitespace-nowrap">{formatTRDate(viewDate(r))}</td>
                          <td className="px-4 py-2 text-white/70 whitespace-nowrap">{formatTRTime(viewTime(r))}</td>
                          <td className="px-4 py-2 text-white/70 whitespace-nowrap">{r.restaurant || "-"}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{r.reservation_no || "-"}</td>
                          <td className="px-4 py-2 text-white/70 whitespace-nowrap">{r.table_no || "-"}</td>
                          <td className="px-4 py-2 text-white/70 min-w-[220px]">{r.note || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-4 text-white/55" colSpan={6}>
                          Bu misafir için geçmiş rezervasyon bulunamadı.
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td className="px-4 py-4 text-white/55" colSpan={6}>
                        Ad Soyad ve Telefon girilince geçmiş rezervasyonlar listelenir.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FORM GRID */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {/* 2) Rezervasyon No */}
          <div>
            <label className="text-xs text-white/60">Rezervasyon numarası</label>
            <input
              value={reservationNo}
              onChange={(e) => setReservationNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: RZV-1024"
            />
            <div className="mt-1 text-[11px] text-white/40">Öneri: POS/defter numarası ile aynı format.</div>
          </div>

          {/* 3) Masa No */}
          <div>
            <label className="text-xs text-white/60">Masa numarası</label>
            <input
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: 12"
              inputMode="numeric"
            />
          </div>

          {/* 4) Gün/Ay/Yıl (date) */}
          <div>
            <label className="text-xs text-white/60">Gün / Ay / Yıl</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            />
            <div className="mt-3">
              <label className="text-xs text-white/60">Müşteri isim soyisim</label>
              <input
                value={customerFullName}
                onChange={(e) => setCustomerFullName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="Örn: Burak Yılmaz"
              />
            </div>
          </div>

          {/* 5) Saat (time) */}
          <div>
            <label className="text-xs text-white/60">Saat</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            />
            <div className="mt-3">
              <label className="text-xs text-white/60">Müşteri telefon numarası</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onBlur={() => setCustomerPhone((p) => normPhone(p))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="05xx..."
                inputMode="tel"
              />
            </div>
          </div>

          {/* 8) 7 yaş altı çocuk sayısı */}
          <div>
            <label className="text-xs text-white/60">7 yaş altı çocuk sayısı</label>
            <input
              value={childU7Count}
              onChange={(e) => setChildU7Count(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="0"
              inputMode="numeric"
            />
          </div>

          {/* 9) Yetkili adı */}
          <div>
            <label className="text-xs text-white/60">Rezervasyonu alan yetkili (isim soyisim)</label>
            <input
              value={staffFullName}
              onChange={(e) => setStaffFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Operasyon Personeli"
            />
          </div>
        </div>

        {/* Not */}
        <div className="mt-4">
          <label className="text-xs text-white/60">Müşteri notu</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            placeholder="Kısa not..."
          />
        </div>

        {/* Sticky Action Bar */}
        <div className="mt-5 sticky bottom-[-1px] -mx-5 px-5 pt-4 pb-5 bg-[#0b1220]/55 backdrop-blur border-t border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-white/70">
              {msg ? (
                <span
                  className={cx(
                    "inline-flex rounded-xl border px-3 py-2",
                    /hata|olamadı|zorunludur|başarısız|error/i.test(msg)
                      ? "border-red-500/25 bg-red-500/10 text-red-200"
                      : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                  )}
                >
                  {msg}
                </span>
              ) : (
                <span className="text-white/50">Alanları doldurun ve kaydedin.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setReservationNo("");
                  setTableNo("");
                  setDate(`${yyyy}-${mm}-${dd}`);
                  setTime("19:00");
                  setCustomerFullName("");
                  setCustomerPhone("");
                  setChildU7Count("");
                  setStaffFullName("");
                  setNote("");
                  setMsg(null);
                }}
                disabled={saving}
                className={cx(
                  "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10",
                  saving ? "opacity-60 cursor-not-allowed" : ""
                )}
              >
                Formu temizle
              </button>

              <button
                type="button"
                onClick={createReservation}
                disabled={saving}
                className={cx(
                  "rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60",
                  saving ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                )}
              >
                {saving ? "Kaydediliyor..." : "Rezervasyon oluştur"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Bugünün Rezervasyonları</div>
            <div className="text-xs text-white/50 mt-1">
              {listLoading ? "Yükleniyor..." : `Toplam: ${filteredRows.length}`}
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={listLoading}
            className={cx("text-sm text-white/70 hover:text-white", listLoading ? "opacity-60 cursor-not-allowed" : "")}
          >
            {listLoading ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-white/55">
              <tr className="border-t border-white/10">
                <th className="text-left px-5 py-3 whitespace-nowrap">Restoran</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Rez. No</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Masa</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Gün/Ay/Yıl</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Saat</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Müşteri</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Telefon</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Çocuk (7-)</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Yetkili</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Not</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {listLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="border-t border-white/10 animate-pulse">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-3 rounded bg-white/10" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  {filteredRows.map((r, idx) => (
                    <tr key={(r.reservation_id || "") + idx} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.restaurant || "-"}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{r.reservation_no || "-"}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.table_no || "-"}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{formatTRDate(viewDate(r))}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{formatTRTime(viewTime(r))}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{viewCustomerName(r)}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{viewCustomerPhone(r)}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.kids_u7 || r.child_u7 || "-"}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.officer_name || r.authorized_name || "-"}</td>
                      <td className="px-5 py-3 text-white/70 min-w-[260px]">{r.note || "-"}</td>
                    </tr>
                  ))}

                  {filteredRows.length === 0 && (
                    <tr className="border-t border-white/10">
                      <td className="px-5 py-10 text-white/55" colSpan={10}>
                        Sonuç yok. (Bugünün rezervasyonları listelenir. Sorgulama alanları ile filtrelenir.)
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
