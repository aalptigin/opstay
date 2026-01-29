"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type RowAny = Record<string, any>;

const ease = [0.22, 1, 0.36, 1] as const;
const DEFAULT_RESTAURANT: "Happy Moons" | "Roof" = "Roof";

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
  return raw;
}

function toYMD(input: any) {
  const raw = s(input);
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split(".");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
}

function trDDMM(ymd: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || "";
  const [, mm, dd] = ymd.split("-");
  return `${dd}/${mm}`;
}

function lastNDaysYMD(n: number) {
  const out: string[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    out.push(`${yyyy}-${mm}-${dd}`);
  }
  return out;
}

async function fetchRows(url: string): Promise<RowAny[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} yüklenemedi (${res.status})`);
  const data = await res.json().catch(() => ({}));
  const rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
  return Array.isArray(rows) ? rows : [];
}

function rowRestaurant(r: RowAny) {
  return normRestaurant(pick(r, ["restaurant_name", "restaurant", "restuarant", "restaurantName"]));
}

function rowDateYMD(r: RowAny) {
  const d =
    toYMD(pick(r, ["date", "gun_ay_yil", "dayMonthYear", "created_date"])) ||
    toYMD(s(pick(r, ["datetime", "created_at", "createdAt"])).slice(0, 10));
  return d;
}

function rowRisk(r: RowAny) {
  return s(pick(r, ["risk_level", "risk", "severity", "level"]));
}

function asRiskBucket(v: string) {
  const x = s(v).toLowerCase();
  if (!x) return "";
  if (x.includes("yüksek") || x.includes("high") || x === "3") return "high";
  if (x.includes("orta") || x.includes("medium") || x === "2") return "medium";
  if (x.includes("düşük") || x.includes("low") || x === "1") return "low";
  return "";
}

function KPI({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="text-xs text-white/55 tracking-[0.18em] font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-white">{value}</div>
      {sub ? <div className="mt-1 text-sm text-white/60">{sub}</div> : null}
    </div>
  );
}

function MiniAreaChart({ title, labels, values }: { title: string; labels: string[]; values: number[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const w = 980;
  const h = 220;
  const padX = 18;
  const padY = 18;

  const maxV = Math.max(1, ...values);
  const minV = 0;

  const pts = useMemo(() => {
    const n = Math.max(1, values.length);
    return values.map((v, i) => {
      const x = padX + (i * (w - padX * 2)) / (n - 1 || 1);
      const y = padY + (1 - (v - minV) / (maxV - minV || 1)) * (h - padY * 2);
      return { x, y, v };
    });
  }, [values, maxV]);

  const linePath = useMemo(() => {
    if (!pts.length) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return d;
  }, [pts]);

  const areaPath = useMemo(() => {
    if (!pts.length) return "";
    const baseY = h - padY;
    return `${linePath} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
  }, [linePath, pts]);

  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }).map((_, i) => {
    const y = padY + (i * (h - padY * 2)) / gridLines;
    const v = Math.round(maxV - (i * maxV) / gridLines);
    return { y, v };
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white/90">{title}</div>
      </div>

      <div className="px-5 pb-5">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[240px] select-none" onMouseLeave={() => setHoverIdx(null)}>
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={padX} y1={t.y} x2={w - padX} y2={t.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x={w - padX} y={t.y - 6} textAnchor="end" fontSize="12" fill="rgba(255,255,255,0.35)">
                {t.v}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="rgba(14,165,255,0.10)" />
          <path d={linePath} fill="none" stroke="rgba(14,165,255,0.95)" strokeWidth="2.5" />

          {pts.map((p, i) => (
            <g key={i} onMouseMove={() => setHoverIdx(i)} style={{ cursor: "default" }}>
              <circle cx={p.x} cy={p.y} r={4} fill="rgba(14,165,255,0.95)" />
              <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
            </g>
          ))}

          {hoverIdx !== null && pts[hoverIdx] ? (
            <g>
              <line
                x1={pts[hoverIdx].x}
                y1={padY}
                x2={pts[hoverIdx].x}
                y2={h - padY}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              <rect
                x={Math.min(w - 220, pts[hoverIdx].x + 12)}
                y={Math.max(padY, pts[hoverIdx].y - 44)}
                width={200}
                height={40}
                rx={10}
                fill="rgba(0,0,0,0.55)"
                stroke="rgba(255,255,255,0.12)"
              />
              <text
                x={Math.min(w - 220, pts[hoverIdx].x + 24)}
                y={Math.max(padY, pts[hoverIdx].y - 18)}
                fontSize="12"
                fill="rgba(255,255,255,0.85)"
              >
                {labels[hoverIdx] || "-"} • {values[hoverIdx] ?? 0}
              </text>
            </g>
          ) : null}

          {labels.map((lb, i) => {
            const x = padX + (i * (w - padX * 2)) / (labels.length - 1 || 1);
            return (
              <text key={i} x={x} y={h - 6} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.45)">
                {lb}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function escapeHtml(x: any) {
  return String(x ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Pop-up/print YOK.
 * Direkt indirilebilir PDF üretir (Chrome pop-up engeline takılmaz).
 */
async function downloadPdfDirect(args: {
  restaurant: string;
  daysCount: 7 | 14 | 30;
  totals: { totalRes: number; totalBl: number; high: number; medium: number; low: number };
  daily: Array<{
    date: string;
    reservations: number;
    blacklist: number;
    high: number;
    medium: number;
    low: number;
  }>;
}) {
  const pdfMakeMod: any = await import("pdfmake/build/pdfmake");
  const pdfFontsMod: any = await import("pdfmake/build/vfs_fonts");

  const pdfMake = pdfMakeMod.default || pdfMakeMod;
  pdfMake.vfs = pdfFontsMod.pdfMake?.vfs;

  const { restaurant, daysCount, totals, daily } = args;
  const ts = new Date().toLocaleString("tr-TR");

  const body = [
    [
      { text: "Tarih (YMD)", style: "th" },
      { text: "Gün/Ay", style: "th" },
      { text: "Rez", style: "th", alignment: "right" },
      { text: "Uyarı Listesi", style: "th", alignment: "right" },
      { text: "Risk Y", style: "th", alignment: "right" },
      { text: "Risk O", style: "th", alignment: "right" },
      { text: "Risk D", style: "th", alignment: "right" },
    ],
    ...daily.map((r) => [
      escapeHtml(r.date),
      escapeHtml(trDDMM(r.date)),
      { text: String(r.reservations), alignment: "right" },
      { text: String(r.blacklist), alignment: "right" },
      { text: String(r.high), alignment: "right" },
      { text: String(r.medium), alignment: "right" },
      { text: String(r.low), alignment: "right" },
    ]),
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 52, 40, 40],
    watermark: { text: "OpsStay", color: "#0b1220", opacity: 0.08, bold: true },

    content: [
      { text: `İstatistikler • ${restaurant}`, style: "h1" },
      { text: `${daysCount} günlük özet (rezervasyon ve uyarı listesi) • Oluşturulma: ${ts}`, style: "sub" },

      { text: " ", margin: [0, 8, 0, 0] },

      {
        columns: [
          {
            width: "*",
            stack: [
              { text: `TOPLAM REZERVASYON (${daysCount}G)`, style: "kpiLabel" },
              { text: String(totals.totalRes), style: "kpiValue" },
              { text: "Seçili restoran", style: "kpiSub" },
            ],
            style: "kpiBox",
          },
          {
            width: "*",
            stack: [
              { text: `TOPLAM UYARI LİSTESİ (${daysCount}G)`, style: "kpiLabel" },
              { text: String(totals.totalBl), style: "kpiValue" },
              { text: "Seçili restoran", style: "kpiSub" },
            ],
            style: "kpiBox",
          },
        ],
        columnGap: 12,
      },

      { text: " ", margin: [0, 8, 0, 0] },

      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "RİSK (DAĞILIM)", style: "kpiLabel" },
              { text: `${totals.high}/${totals.medium}/${totals.low}`, style: "kpiValue" },
              { text: "Yüksek / Orta / Düşük", style: "kpiSub" },
            ],
            style: "kpiBox",
          },
          {
            width: "*",
            stack: [
              { text: "KAPSAM", style: "kpiLabel" },
              { text: String(daysCount), style: "kpiValue" },
              { text: "Günlük trend", style: "kpiSub" },
            ],
            style: "kpiBox",
          },
        ],
        columnGap: 12,
      },

      { text: " ", margin: [0, 10, 0, 0] },
      { text: "Günlük Döküm", style: "h2" },

      {
        table: {
          headerRows: 1,
          widths: ["*", 44, 34, 52, 40, 40, 40],
          body,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#f3f5f7" : null),
          hLineColor: () => "#e6e8eb",
          vLineColor: () => "#e6e8eb",
        },
      },

      { text: " ", margin: [0, 10, 0, 0] },
      {
        columns: [
          { text: "OpsStay • Panel Çıktısı", style: "footer" },
          { text: `${restaurant} • ${daysCount} Gün`, style: "footer", alignment: "right" },
        ],
      },
    ],

    styles: {
      h1: { fontSize: 18, bold: true, color: "#0b1220" },
      h2: { fontSize: 12, bold: true, margin: [0, 0, 0, 6], color: "#0b1220" },
      sub: { fontSize: 10, color: "#4b5563", margin: [0, 6, 0, 0] },

      kpiBox: { margin: [0, 0, 0, 0], fillColor: "#ffffff", color: "#0b1220" },
      kpiLabel: { fontSize: 8, bold: true, color: "#6b7280", letterSpacing: 0.6 },
      kpiValue: { fontSize: 18, bold: true, margin: [0, 4, 0, 0] },
      kpiSub: { fontSize: 9, color: "#6b7280", margin: [0, 3, 0, 0] },

      th: { fontSize: 8, bold: true, color: "#374151" },
      footer: { fontSize: 8, color: "#6b7280" },
    },

    defaultStyle: { fontSize: 10 },
  };

  const safeRestaurant = String(restaurant).toLowerCase().replace(/\s+/g, "-");
  const filename = `opsstay-istatistik-${safeRestaurant}-${daysCount}g.pdf`;

  pdfMake.createPdf(docDefinition).download(filename);
}

export default function IstatistiklerRoofPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [daysCount, setDaysCount] = useState<7 | 14 | 30>(7);

  const [reservations, setReservations] = useState<RowAny[]>([]);
  const [records, setRecords] = useState<RowAny[]>([]);
  const [posOrders, setPosOrders] = useState<any>(null);

  const restaurant = DEFAULT_RESTAURANT;

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [resRows, recRows] = await Promise.all([fetchRows("/api/panel/core/reservations"), fetchRows("/api/panel/core/records")]);
      setReservations(resRows);
      setRecords(recRows);

      // POS adisyon verilerini çek
      const today = new Date();
      const endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const startDateObj = new Date(today);
      startDateObj.setDate(startDateObj.getDate() - (daysCount - 1));
      const startDate = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, "0")}-${String(startDateObj.getDate()).padStart(2, "0")}`;

      const posRes = await fetch(`/api/pos/orders?restaurant=${encodeURIComponent(restaurant)}&start_date=${startDate}&end_date=${endDate}`, { cache: "no-store" });
      const posData = await posRes.json();
      if (posRes.ok) {
        setPosOrders(posData);
      }
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
      setReservations([]);
      setRecords([]);
      setPosOrders(null);
    } finally {
      setLoading(false);
    }
  }, [daysCount, restaurant]);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => lastNDaysYMD(daysCount), [daysCount]);
  const dayLabels = useMemo(() => days.map(trDDMM), [days]);

  const filteredReservations = useMemo(() => {
    return (reservations || []).filter((r) => rowRestaurant(r) === restaurant);
  }, [reservations, restaurant]);

  const filteredBlacklist = useMemo(() => {
    return (records || []).filter((r) => rowRestaurant(r) === restaurant);
  }, [records, restaurant]);

  const daily = useMemo(() => {
    const resMap = new Map<string, number>();
    const blMap = new Map<string, number>();
    const riskMap = new Map<string, { high: number; medium: number; low: number }>();

    for (const r of filteredReservations) {
      const d = rowDateYMD(r);
      if (!d) continue;
      resMap.set(d, (resMap.get(d) || 0) + 1);
    }

    for (const r of filteredBlacklist) {
      const d = rowDateYMD(r);
      if (!d) continue;

      blMap.set(d, (blMap.get(d) || 0) + 1);

      const b = asRiskBucket(rowRisk(r));
      if (!riskMap.has(d)) riskMap.set(d, { high: 0, medium: 0, low: 0 });
      if (b) riskMap.get(d)![b as "high" | "medium" | "low"]++;
    }

    return days.map((d) => {
      const rr = resMap.get(d) || 0;
      const bb = blMap.get(d) || 0;
      const rk = riskMap.get(d) || { high: 0, medium: 0, low: 0 };
      return { date: d, reservations: rr, blacklist: bb, ...rk };
    });
  }, [filteredReservations, filteredBlacklist, days]);

  const seriesReservations = useMemo(() => daily.map((x) => x.reservations), [daily]);
  const seriesBlacklist = useMemo(() => daily.map((x) => x.blacklist), [daily]);

  const totals = useMemo(() => {
    const totalRes = daily.reduce((a, b) => a + b.reservations, 0);
    const totalBl = daily.reduce((a, b) => a + b.blacklist, 0);

    const high = daily.reduce((a, b) => a + b.high, 0);
    const medium = daily.reduce((a, b) => a + b.medium, 0);
    const low = daily.reduce((a, b) => a + b.low, 0);

    return { totalRes, totalBl, high, medium, low };
  }, [daily]);

  const onDownloadPdf = useCallback(() => {
    downloadPdfDirect({ restaurant, daysCount, totals, daily });
  }, [restaurant, daysCount, totals, daily]);

  return (
    <div className="w-full relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_25%_10%,rgba(14,165,255,0.16),transparent_55%),radial-gradient(700px_320px_at_85%_15%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
              className="text-2xl md:text-3xl font-extrabold text-white"
            >
              İstatistikler · {restaurant}
            </motion.h1>
            <p className="mt-2 text-sm text-white/60">{daysCount} günlük özet (rezervasyon ve uyarı listesi).</p>
            {err ? <div className="mt-2 text-xs text-red-300/90">{err}</div> : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setDaysCount(7)}
                className={cx(
                  "px-3 py-2 text-xs rounded-lg transition",
                  daysCount === 7 ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10"
                )}
              >
                Son 7 Gün
              </button>
              <button
                onClick={() => setDaysCount(14)}
                className={cx(
                  "px-3 py-2 text-xs rounded-lg transition",
                  daysCount === 14 ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10"
                )}
              >
                Son 14 Gün
              </button>
              <button
                onClick={() => setDaysCount(30)}
                className={cx(
                  "px-3 py-2 text-xs rounded-lg transition",
                  daysCount === 30 ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10"
                )}
              >
                Son 30 Gün
              </button>
            </div>

            <button
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition"
              title="PDF doğrudan indirilecektir (pop-up yok)."
            >
              PDF olarak indir
            </button>

            <button
              onClick={load}
              disabled={loading}
              className={cx(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm",
                "border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition",
                loading ? "opacity-60 cursor-not-allowed" : ""
              )}
            >
              {loading ? "Yenileniyor..." : "Yenile"}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <KPI label={`TOPLAM REZERVASYON (${daysCount}G)`} value={totals.totalRes} sub="Seçili restoran" />
          <KPI label={`TOPLAM UYARI LİSTESİ (${daysCount}G)`} value={totals.totalBl} sub="Seçili restoran" />
          <KPI
            label={`TOPLAM GELİR (${daysCount}G)`}
            value={posOrders?.summary?.total_revenue ? `${posOrders.summary.total_revenue}₺` : "-"}
            sub={posOrders?.mode === "stub" ? "Mock veri" : "POS verisi"}
          />
          <KPI
            label={`ORT. ADİSYON (${daysCount}G)`}
            value={posOrders?.summary?.average_order ? `${posOrders.summary.average_order}₺` : "-"}
            sub={`${posOrders?.summary?.total_orders || 0} adisyon`}
          />
        </motion.div>

        <div className="mt-6 grid gap-4">
          <MiniAreaChart title="Günlük Rezervasyon Sayısı" labels={dayLabels} values={seriesReservations} />
          <MiniAreaChart title="Günlük Uyarı Listesi" labels={dayLabels} values={seriesBlacklist} />
        </div>
      </div>
    </div>
  );
}
