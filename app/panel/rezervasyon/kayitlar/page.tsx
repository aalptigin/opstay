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
  const reservation_no = s(pick(r, ["reservation_no", "reservation_n0", "reservationNumber", "reservation_id"]));
  const table_no = s(pick(r, ["table_no", "table_n0", "masa_no"]));

  let date = normalizeDate(pick(r, ["date", "gun_ay_yil"]));
  let time = normalizeTime(pick(r, ["time", "saat"]));

  const customer_full_name = s(pick(r, ["customer_full_name", "full_name", "guest_full_name"]));
  const customer_phone = s(pick(r, ["customer_phone", "phone", "guest_phone"]));

  const kids_u7 = s(pick(r, ["kids_u7", "child_u7", "children_u7"]));

  // kişi sayısı (toplam) - farklı olası kolon isimleri
  const people_count = s(
    pick(r, ["people_count", "guest_count", "total_guests", "total_people", "person_count", "kisi_sayisi", "kisi_sayisi_toplam"])
  );

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
    people_count,
    officer_name,
    officer_email,
    note,
  };
}

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

function SkeletonCell() {
  return <div className="h-3 w-full rounded bg-white/10 animate-pulse" />;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/10">
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
      <td className="px-4 py-3">
        <SkeletonCell />
      </td>
    </tr>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-white/10" />
        <div className="text-white font-semibold">{title}</div>
        <div className="mt-1 text-sm text-white/60">{desc}</div>
      </div>
    </div>
  );
}

function SmsBadge({ status, mode }: { status?: string; mode?: string }) {
  const st = s(status).toUpperCase();
  const md = s(mode).toUpperCase();

  const label = st ? (md ? `${st} (${md})` : st) : "YOK";

  const cls =
    st === "SENT"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
      : st === "FAILED"
      ? "border-red-400/25 bg-red-400/10 text-red-200"
      : st
      ? "border-white/15 bg-white/[0.06] text-white/75"
      : "border-white/12 bg-white/[0.04] text-white/55";

  return <span className={cx("inline-flex items-center rounded-xl border px-2.5 py-1 text-xs", cls)}>{label}</span>;
}

type SmsIndexResponse = {
  by_reservation_no?: Record<
    string,
    {
      created_at?: string;
      status?: string;
      mode?: string;
      sender_id?: string;
      customer_phone?: string;
    }
  >;
};

function withSms(rows: any[], smsIndex: SmsIndexResponse | null) {
  const map = smsIndex?.by_reservation_no || {};
  return (rows || []).map((r) => {
    const rn = s(r?.reservation_no);
    const sms = rn ? map[rn] : null;
    return {
      ...r,
      sms_status: sms ? s(sms.status) : "",
      sms_mode: sms ? s(sms.mode) : "",
      sms_created_at: sms ? s(sms.created_at) : "",
      sms_sender_id: sms ? s(sms.sender_id) : "",
    };
  });
}

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [smsIndex, setSmsIndex] = useState<SmsIndexResponse | null>(null);
  const [loadingSms, setLoadingSms] = useState(false);

  // filtreler
  const [q, setQ] = useState("");
  const [restaurant, setRestaurant] = useState<string>("all");
  const [date, setDate] = useState<string>(""); // dd/MM/yyyy

  // küçük UX iyileştirmeleri
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      setLoadingSms(true);

      try {
        const [r1, r2] = await Promise.all([
          fetch("/api/reservations", { cache: "no-store" }),
          fetch("/api/sms/index", { cache: "no-store" }),
        ]);

        const j1 = await r1.json();
        const j2 = await r2.json();

        if (!r1.ok) throw new Error(j1?.error || "Rezervasyonlar alınamadı");
        if (r2.ok) {
          if (!alive) return;
          setSmsIndex(j2 as SmsIndexResponse);
        } else {
          // SMS index bozulsa bile sayfa çalışsın
          if (!alive) return;
          setSmsIndex(null);
        }

        const rr = Array.isArray(j1?.rows) ? j1.rows : [];
        const normalized = rr.map(normReservationRow);
        const merged = withSms(normalized, r2.ok ? (j2 as SmsIndexResponse) : null);

        if (!alive) return;
        setRows(merged);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Yükleme hatası");
      } finally {
        if (!alive) return;
        setLoading(false);
        setLoadingSms(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  async function reload() {
    setRefreshing(true);
    setErr("");
    setLoadingSms(true);

    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/reservations", { cache: "no-store" }),
        fetch("/api/sms/index", { cache: "no-store" }),
      ]);

      const j1 = await r1.json();
      const j2 = await r2.json();

      if (!r1.ok) throw new Error(j1?.error || "Rezervasyonlar alınamadı");

      const rr = Array.isArray(j1?.rows) ? j1.rows : [];
      const normalized = rr.map(normReservationRow);

      const smsOk = r2.ok;
      setSmsIndex(smsOk ? (j2 as SmsIndexResponse) : null);

      const merged = withSms(normalized, smsOk ? (j2 as SmsIndexResponse) : null);

      setRows(merged);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setRefreshing(false);
      setLoadingSms(false);
    }
  }

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
        r.people_count,
        r.kids_u7,
        r.officer_name,
        r.officer_email,
        r.note,
        r.sms_status,
        r.sms_mode,
        r.sms_sender_id,
        r.sms_created_at,
      ]
        .map((x) => s(x).toLowerCase())
        .join(" | ");

      return hay.includes(qq);
    });
  }, [rows, q, restaurant, date]);

  const selectedRow = useMemo(() => {
    if (!selectedKey) return null;
    return filtered.find((r, idx) => {
      const key = String(r.reservation_id || r.id || idx);
      return key === selectedKey;
    });
  }, [filtered, selectedKey]);

  const hasActiveFilters = useMemo(() => {
    return q.trim() !== "" || restaurant !== "all" || date.trim() !== "";
  }, [q, restaurant, date]);

  const headerText = useMemo(() => {
    if (loading) return "Yükleniyor...";
    if (filtered.length === 0) return hasActiveFilters ? "Sonuç yok" : "Kayıt yok";
    return `Toplam: ${filtered.length}`;
  }, [loading, filtered.length, hasActiveFilters]);

  const smsStatusText = useMemo(() => {
    if (loadingSms) return "SMS yükleniyor...";
    return smsIndex ? "SMS index hazır" : "SMS index yok";
  }, [loadingSms, smsIndex]);

  return (
    <div className="space-y-4 page-no-scroll">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rezervasyon Kayıtları</h1>
          <p className="text-white/60 text-sm">Filtrele, ara ve gerekirse kara liste ile çapraz kontrol et.</p>
          <p className="text-white/35 text-xs mt-1">{smsStatusText}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setQ("");
              setRestaurant("all");
              setDate("");
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Filtreyi temizle
          </button>
          <button
            onClick={reload}
            disabled={refreshing}
            className={cx(
              "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10",
              refreshing ? "opacity-60 cursor-not-allowed" : ""
            )}
          >
            {refreshing ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>
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

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 viewport-grid">
        {/* ✅ Sol kartı flex-col yaptık: scroll alanı kalan yüksekliği düzgün alsın ve alttaki satır kesilmesin */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="text-sm text-white/70">{headerText}</div>
            {err ? <div className="text-sm text-red-300">{err}</div> : null}
          </div>

          {/* ✅ Scroll alanı flex-1 + min-h-0: en alttaki müşteri görünür
              ✅ pb ekledik: horizontal scrollbar/alt boşluk çakışmasın */}
          <div className="overflow-auto flex-1 min-h-0 pb-3 table-scroll vip-scroll">
            <table className="min-w-[1320px] w-full text-sm">
              {/* ✅ Şeffaf header yerine solid arka plan + z-index */}
              <thead className="text-white/70 sticky top-0 z-20">
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Restoran</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Rez. No</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">SMS</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Masa</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Gün/Ay/Yıl</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Saat</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Müşteri</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Telefon</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Kişi</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Çocuk (7-)</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Yetkili</th>
                  <th className="text-left px-4 py-3 bg-[#0b1220]">Not</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="p-0" colSpan={12}>
                      <EmptyState
                        title={hasActiveFilters ? "Sonuç bulunamadı" : "Henüz kayıt yok"}
                        desc={
                          hasActiveFilters
                            ? "Arama veya filtre kriterlerinizi değiştirin. Gerekirse filtreyi temizleyin."
                            : "Rezervasyon oluşturulduğunda burada listelenecektir."
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => {
                    const officer = s(r.officer_name) || s(r.officer_email) || "-";
                    const kids = s(r.kids_u7) || "-";
                    const ppl = s(r.people_count) || "-";
                    const key = String(r.reservation_id || r.id || idx);
                    const isSelected = key === selectedKey;

                    return (
                      <tr
                        key={key}
                        onClick={() => setSelectedKey((prev) => (prev === key ? "" : key))}
                        className={cx(
                          "hover:bg-white/5 transition cursor-pointer",
                          isSelected ? "bg-white/[0.06]" : ""
                        )}
                      >
                        <td className="px-4 py-3">{s(r.restaurant) || "-"}</td>
                        <td className="px-4 py-3">{s(r.reservation_no) || "-"}</td>
                        <td className="px-4 py-3">
                          <SmsBadge status={r.sms_status} mode={r.sms_mode} />
                        </td>
                        <td className="px-4 py-3">{s(r.table_no) || "-"}</td>
                        <td className="px-4 py-3">{normalizeDate(r.date) || "-"}</td>
                        <td className="px-4 py-3">{normalizeTime(r.time) || "-"}</td>
                        <td className="px-4 py-3">{s(r.customer_full_name) || "-"}</td>
                        <td className="px-4 py-3">{s(r.customer_phone) || "-"}</td>
                        <td className="px-4 py-3">{ppl}</td>
                        <td className="px-4 py-3">{kids}</td>
                        <td className="px-4 py-3">{officer}</td>
                        <td className="px-4 py-3">{s(r.note) || "-"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-semibold text-white">Detay</div>
            <div className="text-xs text-white/50 mt-1">Bir satıra tıklayarak detayları görüntüleyin.</div>
          </div>

          <div className="p-4">
            {!selectedRow ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-white/70 font-semibold">Seçim yok</div>
                <div className="mt-1 text-sm text-white/60">
                  Listeden bir rezervasyon seçin. Seçili satır vurgulanacaktır.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white font-semibold">{s(selectedRow.customer_full_name) || "-"}</div>
                  <div className="text-white/55 text-sm mt-1">{s(selectedRow.customer_phone) || "-"}</div>
                  <div className="text-white/35 text-xs mt-3">
                    {s(selectedRow.restaurant) || "-"} • {s(selectedRow.reservation_no) || "-"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">SMS Durumu</div>
                  <div className="mt-2 flex items-center gap-2">
                    <SmsBadge status={selectedRow.sms_status} mode={selectedRow.sms_mode} />
                    <div className="text-xs text-white/40">
                      {s(selectedRow.sms_created_at) ? `• ${s(selectedRow.sms_created_at)}` : ""}
                      {s(selectedRow.sms_sender_id) ? ` • ${s(selectedRow.sms_sender_id)}` : ""}
                    </div>
                  </div>
                  {!s(selectedRow.sms_status) ? (
                    <div className="text-xs text-white/45 mt-2">
                      Bu rezervasyon için SMS log kaydı bulunamadı. (Rez. No eşleşmesi gerekir.)
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-white/60">Tarih</div>
                    <div className="text-white/80 mt-1">{normalizeDate(selectedRow.date) || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Saat</div>
                    <div className="text-white/80 mt-1">{normalizeTime(selectedRow.time) || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Masa</div>
                    <div className="text-white/80 mt-1">{s(selectedRow.table_no) || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Çocuk (7-)</div>
                    <div className="text-white/80 mt-1">{s(selectedRow.kids_u7) || "-"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-white/60">Kişi</div>
                    <div className="text-white/80 mt-1">{s(selectedRow.people_count) || "-"}</div>
                  </div>
                  <div />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">Yetkili</div>
                  <div className="text-white/80 mt-1">
                    {s(selectedRow.officer_name) || s(selectedRow.officer_email) || "-"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">Not</div>
                  <div className="text-white/80 mt-2 whitespace-pre-wrap">{s(selectedRow.note) || "-"}</div>
                </div>

                <button
                  onClick={() => setSelectedKey("")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Seçimi kaldır
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollbar gizleme kaldırıldı; VIP scrollbar stili duruyor */}
      <style jsx global>{`
        /* Bu sayfada dış scroll'u kapatıp, scroll'u tablo alanına taşıyoruz */
        .page-no-scroll {
          height: calc(100dvh - 24px);
        }
        .viewport-grid {
          height: calc(100dvh - 260px);
        }

        /* VIP scroll görünümü (WebKit + Firefox) */
        .vip-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.06);
        }
        .vip-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .vip-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        }
        .vip-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.34),
            rgba(255, 255, 255, 0.16)
          );
          border-radius: 999px;
          border: 2px solid rgba(0, 0, 0, 0.35);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
        }
        .vip-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.44),
            rgba(255, 255, 255, 0.22)
          );
        }
        .vip-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }

        @media (max-width: 1024px) {
          .viewport-grid {
            height: auto;
          }
          .page-no-scroll {
            height: auto;
          }
          .table-scroll {
            max-height: 520px;
          }
        }
      `}</style>
    </div>
  );
}
