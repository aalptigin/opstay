"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Role = "manager" | "staff";
type Me = { user: { role: Role; full_name: string; restaurant_name: string; email?: string } };

type Row = Record<string, any>;

const ease = [0.22, 1, 0.36, 1] as const;

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
    const str = String(v).trim();
    if (str !== "") return v;
  }
  return "";
}

function todayYMD() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normRestaurant(v: any) {
  const raw = s(v);
  const r = raw.toLowerCase().replace(/\s+/g, " ").trim();
  if (!r) return "";
  if (
    r === "happy moons" ||
    r === "happy_moons" ||
    r === "happy-moons" ||
    r === "happymoons" ||
    r === "happy moon"
  )
    return "Happy Moons";
  if (r === "roof" || r === "roof restaurant") return "Roof";
  return raw.trim();
}

function normalizeDateYMD(v: any) {
  const raw0 = s(v);
  if (!raw0) return "";

  // "YYYY-MM-DD ..." => first 10 chars
  const raw = raw0.trim();
  const ymdHead = raw.slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymdHead)) return ymdHead;

  // dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  // dd.MM.yyyy
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split(".");
    return `${yyyy}-${mm}-${dd}`;
  }

  // ISO datetime
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

function normalizeTimeHHmm(v: any) {
  const raw = s(v);
  if (!raw) return "";
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;

  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (m) return `${String(parseInt(m[1], 10)).padStart(2, "0")}:${m[2]}`;

  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(11, 16);

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return raw;
}

function formatTRDateFromYMD(ymd: string) {
  // "YYYY-MM-DD" -> "DD.MM.YYYY"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || "-";
  const [yyyy, mm, dd] = ymd.split("-");
  return `${dd}.${mm}.${yyyy}`;
}

function normReservationRow(r: Row) {
  const restaurant = normRestaurant(pick(r, ["restaurant", "restaurant_name"]));
  const reservation_no = s(
    pick(r, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id", "rez_no"])
  );
  const table_no = s(pick(r, ["table_no", "table_n0", "masa_no"]));

  const date = normalizeDateYMD(pick(r, ["date", "gun_ay_yil", "dayMonthYear", "created_at", "createdAt"]));
  const time = normalizeTimeHHmm(pick(r, ["time", "saat", "created_time"]));

  // legacy datetime (ISO)
  const dt = s(pick(r, ["datetime"]));
  const dateFromDT = dt ? normalizeDateYMD(String(dt).slice(0, 10)) : "";
  const timeFromDT = dt ? normalizeTimeHHmm(String(dt).slice(11, 16)) : "";

  const customer_full_name = s(pick(r, ["customer_full_name", "full_name", "guest_full_name", "name_surname"]));
  const customer_phone = s(pick(r, ["customer_phone", "phone", "guest_phone", "telefon"]));

  const kids_u7 = s(pick(r, ["kids_u7", "child_u7", "children_u7", "cocuk_7_alti"]));
  const officer_name = s(pick(r, ["officer_name", "authorized_name", "added_by_name"]));
  const note = s(pick(r, ["note", "customer_note", "summary", "not"]));

  const finalDate = date || dateFromDT;
  const finalTime = time || timeFromDT;

  return {
    ...r,
    restaurant,
    reservation_no,
    table_no,
    date: finalDate,
    time: finalTime,
    customer_full_name,
    customer_phone,
    kids_u7,
    officer_name,
    note,
  };
}

type ReqStatus = "open" | "in_review" | "resolved" | "rejected";

function trStatus(st: ReqStatus) {
  if (st === "open") return "Yeni";
  if (st === "in_review") return "İncelemede";
  if (st === "resolved") return "Kapandı";
  return "Reddedildi";
}

function pillClass(st: ReqStatus) {
  if (st === "in_review") return "border-yellow-300/25 bg-yellow-500/10 text-yellow-100";
  if (st === "resolved") return "border-emerald-300/25 bg-emerald-500/10 text-emerald-100";
  if (st === "rejected") return "border-red-300/25 bg-red-500/10 text-red-100";
  return "border-white/10 bg-white/5 text-white/80";
}

function normRequestRow(r: Row) {
  const request_id = s(pick(r, ["request_id", "id"]));
  const created_at = s(pick(r, ["created_at", "createdAt", "date"]));
  const guest_full_name = s(pick(r, ["guest_full_name", "subject_person_name", "full_name", "name"]));
  const guest_phone = s(pick(r, ["guest_phone", "subject_phone", "phone"]));
  const summary = s(pick(r, ["summary", "reason", "note"]));
  const status = (s(pick(r, ["status"])) as ReqStatus) || "open";
  const response_text = s(pick(r, ["response_text", "manager_response", "manager_response_text"]));
  return { request_id, created_at, guest_full_name, guest_phone, summary, status, response_text };
}

function normRecordRow(r: Row) {
  const record_id = s(pick(r, ["record_id", "id"]));
  const full_name = s(pick(r, ["full_name", "customer_full_name", "subject_person_name", "name_surname"]));
  const phone = s(pick(r, ["phone", "customer_phone", "subject_phone", "telefon"]));
  const date = normalizeDateYMD(pick(r, ["date", "created_date", "gun_ay_yil", "created_at", "createdAt"]));
  const time = normalizeTimeHHmm(pick(r, ["time", "created_time", "saat"]));
  const note = s(pick(r, ["note", "blacklist_note", "customer_note", "summary", "reason"]));
  const restaurant_name = normRestaurant(pick(r, ["restaurant_name", "restaurant"]));
  const risk_level = s(pick(r, ["risk_level", "risk", "severity", "level"]));
  const authorized_name = s(pick(r, ["authorized_name", "officer_name", "created_by_name", "added_by_name", "actor_name"]));
  const created_at = s(pick(r, ["created_at", "createdAt", "datetime"]));
  return { ...r, record_id, full_name, phone, date, time, note, restaurant_name, risk_level, authorized_name, created_at };
}

function rowStatusLower(row: Row) {
  return s(pick(row, ["status", "state", "type", "mode", "list_type", "listType"])).toLowerCase();
}

function isWarningRow(row: Row) {
  // Backend mantığı aynı kalsın; sadece UI metinleri değişecek.
  const st = rowStatusLower(row);
  if (st.includes("black")) return true; // blacklist, blacklisted
  if (st.includes("kara")) return true;
  if (st === "bl" || st === "b") return true;

  const flag =
    (row as any).is_blacklist ??
    (row as any).isBlacklisted ??
    (row as any).blacklist ??
    (row as any).blacklisted ??
    null;

  if (flag === true) return true;
  return false;
}

function onlyDigits(v: any) {
  return s(v).replace(/\D/g, "");
}

function nameNorm(v: any) {
  return s(v).toLowerCase().replace(/\s+/g, " ").trim();
}

type CheckMode = "name" | "phone" | "both";

export default function PanelPage() {
  const [me, setMe] = useState<Me | null>(null);

  // filters
  const [restaurant, setRestaurant] = useState<string>("all");
  const [date, setDate] = useState<string>(todayYMD());
  const [q, setQ] = useState("");

  // data
  const [rezRows, setRezRows] = useState<Row[]>([]);
  const [reqRows, setReqRows] = useState<any[]>([]);
  const [recordRows, setRecordRows] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // guest check
  const [checkMode, setCheckMode] = useState<CheckMode>("both");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState<string | null>(null);
  const [checkMatches, setCheckMatches] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;

    async function loadAll() {
      setLoading(true);
      setErr(null);

      try {
        const [meRes, rezRes, reqRes, recRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }).catch(() => null),
          fetch("/api/reservations", { cache: "no-store" }),
          fetch("/api/requests", { cache: "no-store" }).catch(() => null),
          fetch("/api/records", { cache: "no-store" }).catch(() => null),
        ]);

        // me
        if (meRes && (meRes as any).ok) {
          const d = await (meRes as any).json();
          if (alive && d?.user) setMe(d);
        }

        // reservations
        if (!rezRes.ok) throw new Error("Rezervasyonlar alınamadı.");
        const rezJson = await rezRes.json();
        const rawRez = Array.isArray(rezJson?.rows) ? rezJson.rows : Array.isArray(rezJson) ? rezJson : [];
        const normalizedRez = rawRez.map(normReservationRow);
        if (alive) setRezRows(normalizedRez);

        // requests
        if (reqRes && (reqRes as any).ok) {
          const reqJson = await (reqRes as any).json();
          const rawReq = Array.isArray(reqJson?.rows) ? reqJson.rows : Array.isArray(reqJson) ? reqJson : [];
          const normalizedReq = rawReq.map(normRequestRow);
          if (alive) setReqRows(normalizedReq);
        } else if (alive) {
          setReqRows([]);
        }

        // records
        if (recRes && (recRes as any).ok) {
          const recJson = await (recRes as any).json();
          const rawRec = Array.isArray(recJson?.rows) ? recJson.rows : Array.isArray(recJson) ? recJson : [];
          const normalizedRec = rawRec.map(normRecordRow);
          if (alive) setRecordRows(normalizedRec);
        } else if (alive) {
          setRecordRows([]);
        }
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Hata oluştu.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAll();
    return () => {
      alive = false;
    };
  }, []);

  // default restaurant selection from session (if exists)
  useEffect(() => {
    const sessionRestaurant = normRestaurant(me?.user?.restaurant_name);
    if (!sessionRestaurant) return;
    setRestaurant((prev) => (prev === "all" ? sessionRestaurant : prev));
  }, [me]);

  const restaurants = useMemo(() => {
    const set = new Set<string>();
    rezRows.forEach((r) => {
      const x = normRestaurant((r as any).restaurant);
      if (x) set.add(x);
    });
    return ["all", ...Array.from(set)];
  }, [rezRows]);

  const filteredReservations = useMemo(() => {
    const qq = s(q).toLowerCase();
    const d = s(date);

    return rezRows
      .filter((r: any) => {
        const rowRest = normRestaurant(r.restaurant);
        const selRest = normRestaurant(restaurant);

        // restoran filtresi
        if (restaurant !== "all" && rowRest !== selRest) return false;

        // tarih filtresi (daha tolerant)
        const rowDate = normalizeDateYMD(r.date);
        if (d && rowDate !== d) return false;

        if (!qq) return true;

        const hay = [
          rowRest,
          r.reservation_no,
          r.table_no,
          rowDate,
          normalizeTimeHHmm(r.time),
          r.customer_full_name,
          r.customer_phone,
          r.officer_name,
          r.note,
        ]
          .map((x) => s(x).toLowerCase())
          .join(" | ");

        return hay.includes(qq);
      })
      .sort((a: any, b: any) => {
        const ta = `${normalizeDateYMD(a.date)} ${normalizeTimeHHmm(a.time)}`;
        const tb = `${normalizeDateYMD(b.date)} ${normalizeTimeHHmm(b.time)}`;
        return ta.localeCompare(tb);
      });
  }, [rezRows, q, restaurant, date]);

  const openRequests = useMemo(() => {
    const list = (reqRows || []).filter((r: any) => r.status === "open" || r.status === "in_review");
    return list.slice().sort((a: any, b: any) => s(b.created_at).localeCompare(s(a.created_at)));
  }, [reqRows]);

  const warningRows = useMemo(() => {
    const list = (recordRows || []).filter((r: any) => isWarningRow(r));
    return list.slice().sort((a: any, b: any) => {
      const ka = `${normalizeDateYMD(a.date)} ${normalizeTimeHHmm(a.time)}`;
      const kb = `${normalizeDateYMD(b.date)} ${normalizeTimeHHmm(b.time)}`;
      return kb.localeCompare(ka);
    });
  }, [recordRows]);

  const kpis = useMemo(() => {
    const totalToday = filteredReservations.length;

    const inReview = openRequests.filter((r: any) => r.status === "in_review").length;
    const openCount = openRequests.filter((r: any) => r.status === "open").length;
    const reqTotal = openCount + inReview;

    const uniquePhones = new Map<string, number>();
    filteredReservations.forEach((r: any) => {
      const p = onlyDigits(r.customer_phone);
      if (!p) return;
      uniquePhones.set(p, (uniquePhones.get(p) || 0) + 1);
    });
    const repeatedPhones = Array.from(uniquePhones.values()).filter((n) => n >= 2).length;

    // approx "uyarı": bugünkü rezervasyon telefonları uyarı listesi telefonlarıyla çakışıyor mu?
    const warningPhones = new Set(warningRows.map((x: any) => onlyDigits(x.phone)).filter(Boolean));
    const approxMatches = filteredReservations.filter((r: any) => warningPhones.has(onlyDigits(r.customer_phone))).length;

    return {
      totalToday,
      reqTotal,
      inReview,
      repeatedPhones,
      approxMatches,
    };
  }, [filteredReservations, openRequests, warningRows]);

  // Quick check typing syncs into the list search
  useEffect(() => {
    const name = s(guestName);
    const phone = s(guestPhone);

    if (!name && !phone) return;

    if (checkMode === "name") setQ(name);
    else if (checkMode === "phone") setQ(phone);
    else setQ([name, phone].filter(Boolean).join(" ").trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestName, guestPhone, checkMode]);

  function localMatchFallback(mode: CheckMode, name: string, phone: string) {
    const nn = nameNorm(name);
    const pp = onlyDigits(phone);

    const list = warningRows.filter((r: any) => {
      const rn = nameNorm(pick(r, ["full_name", "customer_full_name", "subject_person_name", "name_surname"]));
      const rp = onlyDigits(pick(r, ["phone", "customer_phone", "subject_phone", "telefon"]));

      if (mode === "name") return !!nn && rn.includes(nn);
      if (mode === "phone") return !!pp && !!rp && (rp.includes(pp) || pp.includes(rp));
      // both
      if (!nn || !pp) return false;
      const nameOk = rn.includes(nn);
      const phoneOk = !!rp && (rp.includes(pp) || pp.includes(rp));
      return nameOk && phoneOk;
    });

    return list;
  }

  async function runCheck() {
    const name = s(guestName);
    const phone = s(guestPhone);

    setChecking(true);
    setCheckMsg(null);
    setCheckMatches([]);

    try {
      // mode bazlı doğrulama
      if (checkMode === "name" && !name) throw new Error("Ad Soyad girin.");
      if (checkMode === "phone" && !phone) throw new Error("Telefon girin.");
      if (checkMode === "both" && (!name || !phone)) throw new Error("Ad Soyad ve Telefon birlikte girin.");

      // mode bazlı body: boş alan göndermeyelim (API tarafında 'missing criteria' sorunu için)
      const body: any = {};
      if (checkMode === "name" || checkMode === "both") body.full_name = name;
      if (checkMode === "phone" || checkMode === "both") body.phone = phone;

      let matches: any[] = [];

      try {
        const res = await fetch("/api/records/check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Sorgulama başarısız.");

        matches = Array.isArray(data?.matches) ? data.matches : [];
      } catch {
        // API hata verirse fallback'e düşeceğiz
        matches = [];
      }

      // API boş döndüyse: panelde zaten çekilmiş "uyarı listesi" kayıtlarından fallback
      if (matches.length === 0) {
        matches = localMatchFallback(checkMode, name, phone);
      }

      setCheckMatches(matches);

      if (matches.length > 0) {
        setCheckMsg(`Uyarı: Uyarı listesinde ${matches.length} eşleşme bulundu.`);
      } else {
        setCheckMsg("Eşleşme bulunamadı.");
      }
    } catch (e: any) {
      setCheckMsg(e?.message || "Hata");
    } finally {
      setChecking(false);
    }
  }

  function clearCheck() {
    setGuestName("");
    setGuestPhone("");
    setCheckMsg(null);
    setCheckMatches([]);
  }

  const firstMatch = checkMatches?.[0];

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* HERO */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">OPSSTAY</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Operasyon Kontrol Merkezi</h1>
          <p className="mt-2 text-sm text-white/60">
            Seçili restoran ve tarih için rezervasyonlar, talepler ve uyarı listesi eşleşmeleri.
          </p>
        </div>

        {/* Filters */}
        <div className="w-full lg:w-auto flex flex-wrap gap-3 items-center justify-end">
          <div className="min-w-[220px]">
            <label className="text-xs text-white/60">Restoran</label>
            <select
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none appearance-none shadow-[0_10px_30px_rgba(0,0,0,.25)]"
            >
              {restaurants.map((x) => (
                <option key={x} value={x} className="bg-[#0b1220] text-white">
                  {x === "all" ? "Tümü" : x}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px]">
            <label className="text-xs text-white/60">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35 shadow-[0_10px_30px_rgba(0,0,0,.18)]"
            />
          </div>

          <div className="min-w-[260px]">
            <label className="text-xs text-white/60">Hızlı arama</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: isim, telefon, rez no…"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#0ea5ff]/35 shadow-[0_10px_30px_rgba(0,0,0,.18)]"
            />
          </div>
        </div>
      </div>

      {/* STATUS / ERROR */}
      {err ? (
        <div className="mt-5 rounded-2xl border border-red-300/25 bg-red-500/10 px-5 py-4 text-sm text-red-100">
          {err}
        </div>
      ) : null}

      {/* KPI CARDS */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-xl p-5 shadow-[0_30px_90px_rgba(0,0,0,.30)]">
          <div className="text-xs text-white/55 tracking-[0.18em] font-semibold">BUGÜN</div>
          <div className="mt-2 text-3xl font-extrabold text-white">{kpis.totalToday}</div>
          <div className="mt-1 text-sm text-white/60">Rezervasyon</div>
          <div className="mt-4">
            <Link href="/panel/rezervasyon/kayitlar" className="text-sm text-[#7dd3fc] hover:text-white">
              Kayıtlara git →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-xl p-5 shadow-[0_30px_90px_rgba(0,0,0,.30)]">
          <div className="text-xs text-white/55 tracking-[0.18em] font-semibold">TALEPLER</div>
          <div className="mt-2 text-3xl font-extrabold text-white">{kpis.reqTotal}</div>
          <div className="mt-1 text-sm text-white/60">
            Açık ({openRequests.filter((r: any) => r.status === "open").length}) · İncelemede ({kpis.inReview})
          </div>
          <div className="mt-4">
            <Link href="/panel/talepler" className="text-sm text-[#7dd3fc] hover:text-white">
              Taleplere git →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-xl p-5 shadow-[0_30px_90px_rgba(0,0,0,.30)]">
          <div className="text-xs text-white/55 tracking-[0.18em] font-semibold">UYARI</div>
          <div className="mt-2 text-3xl font-extrabold text-white">{kpis.approxMatches}</div>
          <div className="mt-1 text-sm text-white/60">Uyarı listesi ile olası eşleşme</div>
          <div className="mt-4">
            <Link href="/panel/kayitlar" className="text-sm text-[#7dd3fc] hover:text-white">
              Uyarı listesi kayıtları →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-xl p-5 shadow-[0_30px_90px_rgba(0,0,0,.30)]">
          <div className="text-xs text-white/55 tracking-[0.18em] font-semibold">OPERASYON</div>
          <div className="mt-2 text-3xl font-extrabold text-white">{kpis.repeatedPhones}</div>
          <div className="mt-1 text-sm text-white/60">Tekrarlayan telefon</div>
          <div className="mt-4 text-xs text-white/45">Aynı gün içinde 2+ kayıt görünen telefonlar.</div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2 items-start">
        {/* LEFT: Today's reservations */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,.30)] overflow-hidden flex flex-col"
        >
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">Rezervasyon Akışı</div>
              <div className="text-xs text-white/55 mt-1">
                {restaurant === "all" ? "Tüm restoranlar" : normRestaurant(restaurant)} · {formatTRDateFromYMD(date)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/panel/rezervasyon"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Oluştur
              </Link>
              <Link
                href="/panel/rezervasyon/duzenle"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Düzenle
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-sm text-white/55">Yükleniyor…</div>
          ) : filteredReservations.length === 0 ? (
            <div className="px-5 py-10 text-sm text-white/55">Seçili tarih/restoran için kayıt yok.</div>
          ) : (
            <div className="divide-y divide-white/10 overflow-auto flex-1 min-h-0">
              {filteredReservations.map((r: any, idx: number) => (
                <div key={String(r.reservation_id || r.id || idx)} className="px-5 py-4 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                          {s(r.time) || "--:--"}
                        </span>
                        <span className="text-white/90 font-semibold truncate">{s(r.customer_full_name) || "-"}</span>
                        <span className="text-white/55 text-sm">{s(r.customer_phone) || "-"}</span>
                      </div>

                      <div className="mt-2 text-sm text-white/60">
                        <span className="text-white/45">Rez:</span> {s(r.reservation_no) || "-"}{" "}
                        <span className="text-white/45">· Masa:</span> {s(r.table_no) || "-"}{" "}
                        <span className="text-white/45">· Restoran:</span> {s(r.restaurant) || "-"}{" "}
                        <span className="text-white/45">· Çocuk:</span> {s(r.kids_u7) || "-"}
                      </div>

                      <div className="mt-2 text-sm text-white/60">
                        <span className="text-white/45">Not:</span> {s(r.note) || "-"}
                      </div>
                    </div>

                    <Link
                      href="/panel/rezervasyon/duzenle"
                      className="shrink-0 rounded-xl bg-[#0ea5ff] px-4 py-2 text-sm font-semibold text-[#06121f] hover:opacity-95 shadow-[0_10px_24px_rgba(14,165,255,.15)]"
                      title="Rezervasyon düzenleme ekranına git"
                    >
                      Düzenle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* RIGHT: Action center */}
        <div className="space-y-5">
          {/* Guest check */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] backdrop-blur-xl p-5 shadow-[0_30px_90px_rgba(0,0,0,.25)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-semibold">Misafir Sorgulama</div>
                <div className="mt-1 text-sm text-white/60">
                  Uyarı listesi kontrolü: Ad Soyad ile, Telefon ile veya Ad Soyad + Telefon birlikte sorgulayabilirsiniz.
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearCheck}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Temizle
                </button>
                <button
                  type="button"
                  onClick={runCheck}
                  disabled={checking}
                  className="rounded-xl bg-[#0ea5ff] px-4 py-2 text-sm font-semibold text-[#06121f] disabled:opacity-60 shadow-[0_10px_24px_rgba(14,165,255,.15)]"
                >
                  {checking ? "Sorgulanıyor..." : "Sorgula"}
                </button>
              </div>
            </div>

            {/* Mode pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { id: "name", label: "Ad Soyad" },
                { id: "phone", label: "Telefon" },
                { id: "both", label: "Ad + Telefon" },
              ].map((m) => {
                const active = checkMode === (m.id as CheckMode);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCheckMode(m.id as CheckMode)}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-sm transition",
                      active
                        ? "border-[#0ea5ff]/40 bg-[#0ea5ff]/10 text-white shadow-[0_12px_30px_rgba(14,165,255,.10)]"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    )}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60">Ad Soyad</label>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Örn: Burak Yılmaz"
                  disabled={checkMode === "phone"}
                  className={cx(
                    "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35",
                    checkMode === "phone" && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Telefon</label>
                <input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="05xx..."
                  inputMode="tel"
                  disabled={checkMode === "name"}
                  className={cx(
                    "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35",
                    checkMode === "name" && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
            </div>

            {checkMsg ? (
              <div
                className={cx(
                  "mt-4 rounded-2xl border px-4 py-3 text-sm",
                  checkMatches.length > 0
                    ? "border-red-300/25 bg-red-500/10 text-red-100"
                    : "border-emerald-300/25 bg-emerald-500/10 text-emerald-100"
                )}
              >
                <div className="font-semibold">{checkMsg}</div>

                {checkMatches.length > 0 && firstMatch ? (
                  <div className="mt-3">
                    <div className="text-xs text-red-100/70 mb-2">Eşleşme detayı</div>

                    <div className="rounded-xl border border-red-300/15 bg-black/20 px-4 py-4">
                      <div className="text-sm font-semibold">
                        {s(pick(firstMatch, ["full_name", "customer_full_name", "subject_person_name", "name_surname"])) || "-"}
                      </div>
                      <div className="text-sm text-red-100/80 mt-1">
                        {s(pick(firstMatch, ["phone", "customer_phone", "subject_phone", "telefon"])) || "-"}
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="text-xs text-red-100/75">
                          <div className="text-red-100/60">Risk</div>
                          <div className="mt-1 text-red-100/90 font-semibold">
                            {s(pick(firstMatch, ["risk_level", "risk", "severity", "level"])) || "-"}
                          </div>
                        </div>
                        <div className="text-xs text-red-100/75">
                          <div className="text-red-100/60">Uyarı listesi restoranı</div>
                          <div className="mt-1 text-red-100/90 font-semibold">
                            {normRestaurant(pick(firstMatch, ["restaurant_name", "restaurant"])) || "-"}
                          </div>
                        </div>
                        <div className="text-xs text-red-100/75">
                          <div className="text-red-100/60">Ekleyen</div>
                          <div className="mt-1 text-red-100/90 font-semibold">
                            {s(pick(firstMatch, ["authorized_name", "officer_name", "created_by_name", "added_by_name", "actor_name"])) || "-"}
                          </div>
                        </div>

                        <div className="text-xs text-red-100/75 md:col-span-2">
                          <div className="text-red-100/60">Not</div>
                          <div className="mt-1 text-red-100/90">
                            {s(pick(firstMatch, ["note", "reason", "summary", "blacklist_note"])) || "Not yok"}
                          </div>
                        </div>
                        <div className="text-xs text-red-100/75">
                          <div className="text-red-100/60">Eklenme tarihi</div>
                          <div className="mt-1 text-red-100/90 font-semibold">
                            {formatTRDateFromYMD(normalizeDateYMD(pick(firstMatch, ["date", "created_at", "createdAt", "datetime"]))) || "-"}{" "}
                            {normalizeTimeHHmm(pick(firstMatch, ["time", "created_time", "datetime"])) || ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link href="/panel/kayitlar" className="text-sm text-[#7dd3fc] hover:text-white">
                        Uyarı listesi kayıtlarını aç →
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </motion.div>

          {/* Open requests */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,.22)]"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Açık Talepler</div>
                <div className="text-xs text-white/55 mt-1">Yeni / İncelemede olan son kayıtlar</div>
              </div>
              <Link href="/panel/talepler" className="text-sm text-[#7dd3fc] hover:text-white">
                Tümü →
              </Link>
            </div>

            {openRequests.length === 0 ? (
              <div className="px-5 py-8 text-sm text-white/55">Açık talep yok.</div>
            ) : (
              <div className="divide-y divide-white/10">
                {openRequests.slice(0, 5).map((r: any) => (
                  <div key={r.request_id} className="px-5 py-4 hover:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-white/90 font-semibold truncate">{r.guest_full_name || "İsim girilmemiş"}</div>
                        <div className="text-sm text-white/60 mt-1">{r.guest_phone || "-"}</div>
                        <div className="text-sm text-white/60 mt-2 line-clamp-2">{r.summary || "Not eklenmemiş"}</div>
                      </div>
                      <span
                        className={cx(
                          "shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                          pillClass((r.status as ReqStatus) || "open")
                        )}
                      >
                        {trStatus(((r.status as ReqStatus) || "open") as ReqStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent warning list */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,.22)]"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Uyarı Listesi</div>
                <div className="text-xs text-white/55 mt-1">Son eklenen kayıtlar</div>
              </div>
              <Link href="/panel/kayitlar" className="text-sm text-[#7dd3fc] hover:text-white">
                Tümü →
              </Link>
            </div>

            {warningRows.length === 0 ? (
              <div className="px-5 py-8 text-sm text-white/55">Kayıt yok.</div>
            ) : (
              <div className="divide-y divide-white/10">
                {warningRows.slice(0, 5).map((r: any) => (
                  <div key={r.record_id || r.id} className="px-5 py-4 hover:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-white/90 font-semibold truncate">{r.full_name || "-"}</div>
                        <div className="text-sm text-white/60 mt-1">{r.phone || "-"}</div>
                        <div className="text-xs text-white/45 mt-2">
                          {r.restaurant_name ? `${r.restaurant_name} · ` : ""}
                          {formatTRDateFromYMD(normalizeDateYMD(r.date))} {s(r.time) ? `• ${s(r.time)}` : ""}
                        </div>
                      </div>
                      <div className="text-xs text-white/45 max-w-[220px] line-clamp-3">{s(r.note) || "Not yok"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] backdrop-blur-xl p-5 shadow-[0_30px_90px_rgba(0,0,0,.22)]"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-white font-semibold">Hızlı İşlemler</div>
            <div className="text-sm text-white/60 mt-1">
              Panelin en sık kullanılan aksiyonlarına tek tıkla erişin.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel/rezervasyon"
              className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] hover:opacity-95 shadow-[0_10px_24px_rgba(14,165,255,.15)]"
            >
              Rezervasyon Oluştur
            </Link>
            <Link
              href="/panel/rezervasyon/duzenle"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10"
            >
              Rezervasyon Düzenle
            </Link>
            <Link
              href="/panel/kayit/ekle"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10"
            >
              Uyarı Listesi’ne Aktar
            </Link>
          </div>
        </div>

        {me?.user ? (
          <div className="mt-4 text-xs text-white/45">
            Oturum: {me.user.full_name} · {me.user.restaurant_name} · {me.user.role === "manager" ? "Müdür" : "Personel"}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
