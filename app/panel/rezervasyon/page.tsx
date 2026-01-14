"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type ReservationRow = {
  reservation_id?: string;

  restaurant?: "Happy Moons" | "Roof";

  reservation_no?: string;
  table_no?: string;

  date?: string;
  time?: string;

  customer_full_name?: string;
  customer_phone?: string;

  kids_u7?: string;
  child_u7?: string;
  officer_name?: string;
  authorized_name?: string;

  guest_count?: string;
  people_count?: string;
  total_guests?: string;

  note?: string;

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

    added_by?: string;
    added_by_name?: string;
    added_at?: string;
    created_at?: string;

    restaurant?: string;
    restaurant_name?: string;
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

  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Misafir Sorgulama
  const [lookupName, setLookupName] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<BlacklistCheckResponse | null>(null);

  // Tablo filtre
  const [tableFilterName, setTableFilterName] = useState("");
  const [tableFilterPhone, setTableFilterPhone] = useState("");

  function normPhone(v: string) {
    return String(v ?? "").replace(/[^\d+]/g, "").trim();
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
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const m = raw.match(/^(\d{2})[\/\.](\d{2})[\/\.](\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;

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

  function formatTRDateTime(v: any) {
    const raw = s(v);
    if (!raw) return "-";
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const out = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d);
      return out.replace(/\./g, "/");
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return formatTRDate(raw);
    return raw;
  }

  // Restoran seçimi
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

  // ✅ kişi + çocuk (sıra: kişi -> çocuk)
  const [peopleCount, setPeopleCount] = useState("");
  const [childU7Count, setChildU7Count] = useState("");

  const [staffFullName, setStaffFullName] = useState("");
  const [note, setNote] = useState("");

  // ✅ restoran bazlı rez no (Happy Moons / Roof ayrı ve senkron)
  const lastResNoKey = useMemo(() => `opsstay_last_reservation_no::${restaurant}`, [restaurant]);

  function nextReservationNo(curr: string) {
    const raw = s(curr);
    if (!raw) return raw;
    if (/^\d+$/.test(raw)) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) return String(n + 1);
      return raw;
    }
    const m = raw.match(/^(.*?)(\d+)\s*$/);
    if (m) {
      const prefix = m[1] ?? "";
      const num = parseInt(m[2], 10);
      if (!Number.isNaN(num)) return `${prefix}${num + 1}`;
    }
    return raw;
  }

  // ✅ Restoran değişince, o restoranın son numarasını yükle (yoksa listeden türet)
  useEffect(() => {
    try {
      const v = localStorage.getItem(lastResNoKey) || "";
      if (s(v)) {
        setReservationNo(v);
        return;
      }
    } catch {
      // ignore
    }

    // localStorage boşsa: mevcut rows içinden o restoranın en büyük numarasını bulup +1 öner
    const list = (rows || []).filter((r) => (r.restaurant || "") === restaurant);
    let best: string = "";
    let bestNum = -1;

    for (const r of list) {
      const rn = s(r.reservation_no);
      if (!rn) continue;

      // sadece sayı ise
      if (/^\d+$/.test(rn)) {
        const n = parseInt(rn, 10);
        if (!Number.isNaN(n) && n > bestNum) {
          bestNum = n;
          best = rn;
        }
        continue;
      }

      // sonda sayı varsa (RZV-12)
      const m = rn.match(/(\d+)\s*$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n) && n > bestNum) {
          bestNum = n;
          best = rn;
        }
      }
    }

    if (bestNum >= 0) {
      const candidate = nextReservationNo(best);
      setReservationNo(candidate);
      try {
        localStorage.setItem(lastResNoKey, s(candidate));
      } catch {
        // ignore
      }
    } else {
      // hiç kayıt yoksa: 1
      setReservationNo("1");
      try {
        localStorage.setItem(lastResNoKey, "1");
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant, lastResNoKey, rows]); // rows bağımlılığı eklendi

  // ✅ input değiştikçe o restoran anahtarına yaz (Roof dahil senkron)
  useEffect(() => {
    try {
      const v = s(reservationNo);
      if (v) localStorage.setItem(lastResNoKey, v);
    } catch {
      // ignore
    }
  }, [reservationNo, lastResNoKey]);

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
    setLookupErr(null);
    setLookupResult(null);
  }

  function onLookupPhone(v: string) {
    const p = normPhone(v);
    setLookupPhone(p);
    setCustomerPhone(p);
    setTableFilterPhone(p);
    setLookupErr(null);
    setLookupResult(null);
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
  function viewPeopleCount(r: ReservationRow) {
    return r.people_count || r.guest_count || r.total_guests || "-";
  }

  // Tek alan girilince geçmişten tamamla
  const derivedLookup = useMemo(() => {
    const n = lookupName.trim().toLowerCase();
    const p = normPhone(lookupPhone);

    let nameFromHistory = "";
    let phoneFromHistory = "";

    if (p) {
      const hit = (rows || [])
        .slice()
        .sort((a, b) => {
          const da = normalizeToISODate(viewDate(a));
          const db = normalizeToISODate(viewDate(b));
          if (da !== db) return String(db).localeCompare(String(da));
          const ta = String(viewTime(a) || "");
          const tb = String(viewTime(b) || "");
          return tb.localeCompare(ta);
        })
        .find((r) => {
          const rp = normPhone(String(viewCustomerPhone(r)));
          return rp === p || rp.includes(p);
        });

      if (hit) nameFromHistory = String(viewCustomerName(hit) || "").trim();
    }

    if (n) {
      const hit = (rows || [])
        .slice()
        .sort((a, b) => {
          const da = normalizeToISODate(viewDate(a));
          const db = normalizeToISODate(viewDate(b));
          if (da !== db) return String(db).localeCompare(String(da));
          const ta = String(viewTime(a) || "");
          const tb = String(viewTime(b) || "");
          return tb.localeCompare(ta);
        })
        .find((r) => String(viewCustomerName(r) || "").trim().toLowerCase().includes(n));

      if (hit) phoneFromHistory = normPhone(String(viewCustomerPhone(hit) || ""));
    }

    return { nameFromHistory, phoneFromHistory };
  }, [rows, lookupName, lookupPhone]);

  async function runBlacklistLookup(name: string, phone: string) {
    const nRaw = String(name ?? "").trim();
    const pRaw = normPhone(phone ?? "");

    const n = nRaw || derivedLookup.nameFromHistory || "";
    const p = pRaw || derivedLookup.phoneFromHistory || "";

    setLookupErr(null);
    setLookupResult(null);

    if (!nRaw && !pRaw) return;

    if (!n || !p) {
      const missing = !n && !p ? "ad soyad ve telefon" : !n ? "ad soyad" : "telefon";
      setLookupErr(
        `Sorgu için ${missing} gerekli. ${missing === "telefon" ? "Geçmiş kayıtlardan telefon bulunamadı." : missing === "ad soyad" ? "Geçmiş kayıtlardan isim bulunamadı." : ""}`.trim()
      );
      return;
    }

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

  // dropdown: dışarı tıkla / ESC
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

        // ✅ kişi sayısı (çocuktan önce)
        guest_count: s(peopleCount),
        people_count: s(peopleCount),
        total_guests: s(peopleCount),

        datetime: datetimeISO,
        full_name: s(customerFullName),
        phone: normPhone(customerPhone),
      };

      // çocuk
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

      // ✅ sonraki rez no (restoran bazlı) + localStorage senkron
      const nextNo = nextReservationNo(reservationNo);
      try {
        if (s(nextNo)) localStorage.setItem(lastResNoKey, s(nextNo));
      } catch {
        // ignore
      }
      setReservationNo(nextNo);

      setTableNo("");
      setDate(`${yyyy}-${mm}-${dd}`);
      setTime("19:00");
      setCustomerFullName("");
      setCustomerPhone("");
      setPeopleCount("");
      setChildU7Count("");
      setStaffFullName("");
      setNote("");

      await load();
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  // geçmiş rezervasyonlar
  const guestHistoryRows = useMemo(() => {
    const n = lookupName.trim().toLowerCase();
    const p = normPhone(lookupPhone);

    if (!n && !p) return [];

    return (rows || [])
      .filter((r) => {
        const rn = String(r.customer_full_name || r.full_name || "").trim().toLowerCase();
        const rp = normPhone(String(r.customer_phone || r.phone || ""));
        const nameOk = !n || (rn && rn.includes(n));
        const phoneOk = !p || (rp && rp.includes(p));
        return nameOk && phoneOk;
      })
      .sort((a, b) => {
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
        if (hasAnyFilter) return true;
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

    if (hasAnyFilter) {
      return list.sort((a, b) => {
        const da = normalizeToISODate(viewDate(a));
        const db = normalizeToISODate(viewDate(b));
        if (da !== db) return String(db).localeCompare(String(da));
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

  // Risk rengi
  const riskUI = useMemo(() => {
    const risk = String(lookupResult?.match?.risk_level || "").toLowerCase();
    const isHigh = /yüksek|high|kritik|critical/.test(risk);
    const isMid = /orta|medium/.test(risk);
    const isLow = /düşük|low/.test(risk);

    if (isHigh)
      return { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-100", sub: "text-red-100/80" };
    if (isMid)
      return { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-100", sub: "text-amber-100/80" };
    if (isLow)
      return { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-100", sub: "text-yellow-100/80" };
    return { border: "border-amber-500/25", bg: "bg-amber-500/10", text: "text-amber-100", sub: "text-amber-100/80" };
  }, [lookupResult]);

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
        {/* Sağ üst: Restoran seçimi */}
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

        {/* Misafir Sorgulama */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Misafir Sorgulama</div>
              <div className="mt-1 text-xs text-white/60">
                Ad Soyad veya Telefon ile sorgu yapılır. Girilen bilgiler rezervasyon formuna ve aşağıdaki liste filtresine eş
                zamanlı aktarılır.
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
                disabled={lookupLoading || (!lookupName.trim() && !lookupPhone.trim())}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {lookupLoading ? "Sorgulanıyor..." : "Sorgula"}
              </button>
            </div>
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="text-xs text-white/60">Ad Soyad</label>
              <input
                value={lookupName}
                onChange={(e) => onLookupName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="Örn: Burak Yılmaz"
              />
              {lookupName.trim() && !lookupPhone.trim() && derivedLookup.phoneFromHistory ? (
                <div className="mt-1 text-[11px] text-white/40">
                  Geçmiş kayıtlardan bulunan telefon ile sorgulanabilir:{" "}
                  <span className="text-white/60">{derivedLookup.phoneFromHistory}</span>
                </div>
              ) : null}
            </div>

            <div className="min-w-0">
              <label className="text-xs text-white/60">Telefon</label>
              <input
                value={lookupPhone}
                onChange={(e) => onLookupPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="05xx..."
                inputMode="tel"
              />
              <div className="mt-1 text-[11px] text-white/40">Sadece rakam girmeniz yeterli (boşluk/çizgi fark etmez).</div>

              {lookupPhone.trim() && !lookupName.trim() && derivedLookup.nameFromHistory ? (
                <div className="mt-1 text-[11px] text-white/40">
                  Geçmiş kayıtlardan bulunan isim ile sorgulanabilir:{" "}
                  <span className="text-white/60">{derivedLookup.nameFromHistory}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3">
            {lookupErr ? (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{lookupErr}</div>
            ) : null}

            {lookupLoading ? (
              <div className="text-xs text-white/45">Sorgulanıyor...</div>
            ) : lookupResult?.ok ? (
              lookupResult.is_blacklisted ? (
                // ✅ 1) KUTULAR AYNI HİZADA: 4 eşit kolonlu grid
                <div className={cx("rounded-xl border px-4 py-3", riskUI.border, riskUI.bg, riskUI.text)}>
                  <div className="font-semibold">Uyarı: Bu misafir uyarı listesinde bulunuyor.</div>

                  <div className={cx("mt-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs", riskUI.sub)}>
                    <div className="min-w-0 space-y-1">
                      <div className="opacity-70 whitespace-nowrap">Risk</div>
                      <div className="font-semibold truncate">
                        {lookupResult.match?.risk_level ? lookupResult.match.risk_level : "Belirtilmemiş"}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="opacity-70 whitespace-nowrap">Uyarı listesi restoranı</div>
                      <div className="font-semibold truncate">
                        {lookupResult.match?.restaurant || lookupResult.match?.restaurant_name || "Belirtilmemiş"}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="opacity-70 whitespace-nowrap">Ekleyen</div>
                      <div className="font-semibold truncate">
                        {lookupResult.match?.added_by_name || lookupResult.match?.added_by || "Belirtilmemiş"}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="opacity-70 whitespace-nowrap">Eklenme tarihi</div>
                      <div className="font-semibold truncate">
                        {lookupResult.match?.added_at || lookupResult.match?.created_at
                          ? formatTRDateTime(lookupResult.match?.added_at || lookupResult.match?.created_at || "")
                          : "Belirtilmemiş"}
                      </div>
                    </div>
                  </div>

                  <div className={cx("mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs", riskUI.sub)}>
                    <div className="min-w-0 space-y-1">
                      <div className="opacity-70 whitespace-nowrap">Kayıt sahibi</div>
                      <div className="font-semibold truncate">{lookupResult.match?.full_name ? lookupResult.match.full_name : "Belirtilmemiş"}</div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="opacity-70 whitespace-nowrap">Not</div>
                      <div className="font-semibold line-clamp-2">{lookupResult.match?.note ? lookupResult.match.note : "Belirtilmemiş"}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  Uyarı listesinde yer almıyor.
                </div>
              )
            ) : (
              <div className="text-xs text-white/45">
                {lookupName.trim() || lookupPhone.trim()
                  ? "Sorgulamak için \"Sorgula\" butonuna basın."
                  : "Sorgulamak için Ad Soyad veya Telefon girin."}
              </div>
            )}
          </div>

          {/* Önceki rezervasyonlar */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Önceki Rezervasyonlar</div>
                <div className="text-[11px] text-white/50 mt-1">
                  {lookupName.trim() || lookupPhone.trim() ? `Eşleşen kayıt: ${guestHistoryRows.length}` : "Görüntülemek için Ad Soyad veya Telefon girin."}
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
                  {lookupName.trim() || lookupPhone.trim() ? (
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
                        Ad Soyad veya Telefon girince geçmiş rezervasyonlar listelenir.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FORM GRID - 2 kolonlu ilk bölüm */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label className="text-xs text-white/60">Rezervasyon numarası</label>
            <input
              value={reservationNo}
              onChange={(e) => setReservationNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: RZV-1024"
            />
            <div className="mt-1 text-[11px] text-white/40">Öneri: POS/defter numarası ile aynı format.</div>
          </div>

          <div className="min-w-0">
            <label className="text-xs text-white/60">Masa numarası</label>
            <input
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: 12"
              inputMode="numeric"
            />
          </div>

          <div className="min-w-0">
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

          <div className="min-w-0">
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
        </div>

        {/* ✅ 3 KOLONLU DÜZEN: Kişi sayısı + Çocuk sayısı + Yetkili adı */}
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="min-w-0">
            <label className="text-xs text-white/60">Kişi sayısı (toplam)</label>
            <input
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="0"
              inputMode="numeric"
            />
          </div>

          <div className="min-w-0">
            <label className="text-xs text-white/60">7 yaş altı çocuk</label>
            <input
              value={childU7Count}
              onChange={(e) => setChildU7Count(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="0"
              inputMode="numeric"
            />
          </div>

          <div className="min-w-0">
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
                  setPeopleCount("");
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
            <div className="text-xs text-white/50 mt-1">{listLoading ? "Yükleniyor..." : `Toplam: ${filteredRows.length}`}</div>
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
                <th className="text-left px-5 py-3 whitespace-nowrap">Kişi Sayısı</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Çocuk (7-)</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Yetkili</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Not</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {listLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="border-t border-white/10 animate-pulse">
                    {Array.from({ length: 11 }).map((__, j) => (
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
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{viewPeopleCount(r)}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.kids_u7 || r.child_u7 || "-"}</td>
                      <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.officer_name || r.authorized_name || "-"}</td>
                      <td className="px-5 py-3 text-white/70 min-w-[260px]">{r.note || "-"}</td>
                    </tr>
                  ))}

                  {filteredRows.length === 0 && (
                    <tr className="border-t border-white/10">
                      <td className="px-5 py-10 text-white/55" colSpan={11}>
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