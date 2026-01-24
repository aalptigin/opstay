"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TableStatus = "free" | "occupied" | "reserved" | "unknown";

type Props = {
  selectedTable?: string;
  onSelect: (tableNo: string) => void;
  onClose: () => void;
  date?: string;
  time?: string;
};

// Masa tanımına genişlik/yükseklik ekledik ki görselle birebir olsun
type TableDef = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zone: "teras" | "loca" | "bekleme";
  seats: number;
};

const TABLES: TableDef[] = [
  // --- ÜST SIRA (SOL Teras) ---
  { id: "T15", x: 100, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },
  { id: "T17", x: 200, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },
  { id: "T18", x: 300, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },
  { id: "T20", x: 450, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },
  { id: "T22", x: 550, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },
  { id: "T24", x: 650, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },

  // --- ÜST SIRA (SAĞ Bar Kısmı) ---
  { id: "T26", x: 950, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },
  { id: "T28", x: 1050, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },
  { id: "T30", x: 1150, y: 80, width: 50, height: 70, zone: "teras", seats: 4 },

  // --- İKİNCİ SIRA (Küçük Masalar) ---
  { id: "T14", x: 80, y: 220, width: 60, height: 50, zone: "teras", seats: 4 }, // Sol Dikey

  { id: "T16", x: 200, y: 220, width: 60, height: 40, zone: "teras", seats: 2 },
  { id: "T19", x: 300, y: 220, width: 60, height: 40, zone: "teras", seats: 2 },
  { id: "T21", x: 450, y: 220, width: 60, height: 40, zone: "teras", seats: 2 },
  { id: "T23", x: 550, y: 220, width: 60, height: 40, zone: "teras", seats: 2 },

  { id: "T25", x: 950, y: 220, width: 60, height: 40, zone: "teras", seats: 2 },
  { id: "T27", x: 1050, y: 220, width: 60, height: 40, zone: "teras", seats: 2 },
  { id: "T29", x: 1150, y: 220, width: 60, height: 40, zone: "teras", seats: 2 },

  // --- SOL KENAR (Sahne Yanı) ---
  { id: "T1", x: 80, y: 600, width: 60, height: 50, zone: "teras", seats: 4 },
  { id: "T2", x: 80, y: 700, width: 60, height: 50, zone: "teras", seats: 4 },

  // --- ORTA LOCA ALANI (L Serisi) ---
  // Üst Loca Sırası
  { id: "L2", x: 220, y: 380, width: 70, height: 50, zone: "loca", seats: 4 },
  { id: "L4", x: 320, y: 380, width: 70, height: 50, zone: "loca", seats: 4 },
  { id: "L6", x: 420, y: 380, width: 70, height: 50, zone: "loca", seats: 4 },
  { id: "L8", x: 520, y: 380, width: 70, height: 50, zone: "loca", seats: 4 },

  // Alt Loca Sırası
  { id: "L1", x: 220, y: 500, width: 70, height: 50, zone: "loca", seats: 4 },
  { id: "L3", x: 320, y: 500, width: 70, height: 50, zone: "loca", seats: 4 },
  { id: "L5", x: 420, y: 500, width: 70, height: 50, zone: "loca", seats: 4 },
  { id: "L7", x: 520, y: 500, width: 70, height: 50, zone: "loca", seats: 4 },

  // --- SAĞ BEKLEME LOCALARI (B Serisi) ---
  { id: "B1", x: 750, y: 410, width: 40, height: 40, zone: "bekleme", seats: 2 },
  { id: "B2", x: 830, y: 410, width: 40, height: 40, zone: "bekleme", seats: 2 },
  { id: "B3", x: 940, y: 410, width: 40, height: 40, zone: "bekleme", seats: 2 },
  { id: "B4", x: 1020, y: 410, width: 40, height: 40, zone: "bekleme", seats: 2 },
  { id: "B5", x: 1120, y: 410, width: 40, height: 40, zone: "bekleme", seats: 2 },
  { id: "B6", x: 1200, y: 410, width: 40, height: 40, zone: "bekleme", seats: 2 },

  // --- ALT TERAS GRUBU ---
  // Üstteki Küçükler
  { id: "T3", x: 200, y: 620, width: 50, height: 40, zone: "teras", seats: 2 },
  { id: "T5", x: 320, y: 620, width: 50, height: 40, zone: "teras", seats: 2 },
  { id: "T7", x: 440, y: 620, width: 50, height: 40, zone: "teras", seats: 2 },
  { id: "T9", x: 560, y: 620, width: 50, height: 40, zone: "teras", seats: 2 },
  { id: "T11", x: 670, y: 630, width: 40, height: 50, zone: "teras", seats: 2 }, // Dikey

  // Alttaki Büyükler
  { id: "T4", x: 200, y: 720, width: 50, height: 60, zone: "teras", seats: 4 },
  { id: "T6", x: 320, y: 720, width: 50, height: 60, zone: "teras", seats: 4 },
  { id: "T8", x: 440, y: 720, width: 50, height: 60, zone: "teras", seats: 4 },
  { id: "T10", x: 560, y: 720, width: 50, height: 60, zone: "teras", seats: 4 },
  { id: "T12", x: 670, y: 720, width: 50, height: 60, zone: "teras", seats: 4 },

  // Ekstra Ara Masalar
  { id: "T13", x: 650, y: 440, width: 40, height: 50, zone: "teras", seats: 2 },
];

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

function normTable(v: string) {
  return String(v ?? "").trim();
}

function statusStyles(status: TableStatus) {
  if (status === "occupied")
    return {
      fill: "#ef4444",
      stroke: "#dc2626",
      label: "Dolu",
      color: "#fee2e2",
    };
  if (status === "reserved")
    return {
      fill: "#f59e0b",
      stroke: "#d97706",
      label: "Rezerve",
      color: "#fef3c7",
    };
  if (status === "free")
    return {
      fill: "#10b981",
      stroke: "#059669",
      label: "Boş",
      color: "#d1fae5",
    };
  return {
    fill: "#4b5563",
    stroke: "#374151",
    label: "Bilinmiyor",
    color: "#e5e7eb",
  };
}

async function fetchRoofStatuses(date?: string, time?: string) {
  const qs = new URLSearchParams();
  qs.set("restaurant", "Roof");
  if (date) qs.set("date", date);
  if (time) qs.set("time", time);

  const url = `/api/pos/tables?${qs.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.ok) return null;

  const map: Record<string, TableStatus> = {};
  const tables = data?.tables || {};

  for (const [id, status] of Object.entries(tables)) {
    const stRaw = String(status || "").toLowerCase();
    let st: TableStatus = "unknown";
    if (/occupied|dolu|busy/.test(stRaw)) st = "occupied";
    else if (/reserved|rezerv|hold/.test(stRaw)) st = "reserved";
    else if (/free|bos|available/.test(stRaw)) st = "free";
    map[id] = st;
  }

  return map;
}

// Sandalye bileşeni
function Chair({ x, y, status, angle = 0 }: { x: number; y: number; status: TableStatus, angle?: number }) {
  const ui = statusStyles(status);

  return (
    <g transform={`rotate(${angle}, ${x}, ${y})`}>
      <path
        d={`M ${x - 10} ${y - 8} Q ${x} ${y - 12} ${x + 10} ${y - 8} L ${x + 10} ${y + 8} Q ${x} ${y + 12} ${x - 10} ${y + 8} Z`}
        fill={ui.fill}
        stroke={ui.stroke}
        strokeWidth="1"
        opacity="0.9"
      />
      {/* Arkalık */}
      <path
        d={`M ${x - 10} ${y - 8} Q ${x} ${y - 15} ${x + 10} ${y - 8}`}
        fill="none"
        stroke={ui.stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

// Masa ve sandalye grubu
function TableWithChairs({ table, status, isSelected, onSelect }: {
  table: TableDef;
  status: TableStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const ui = statusStyles(status);
  const { x, y, width, height } = table;

  // Basit sandalye yerleşimi mantığı
  const isVertical = height > width;

  return (
    <g
      className="cursor-pointer transition-all duration-200 group"
      onClick={onSelect}
    >
      {/* Seçim Halkası */}
      {isSelected && (
        <rect
          x={x - width / 2 - 15}
          y={y - height / 2 - 15}
          width={width + 30}
          height={height + 30}
          rx="12"
          fill="none"
          stroke="#0ea5ff"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
      )}

      {/* Masa Gövdesi */}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx="6"
        fill={ui.fill}
        stroke={ui.stroke}
        strokeWidth="2"
        className="group-hover:brightness-110 transition-all"
        style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))" }}
      />

      {/* Sandalyeler */}
      {isVertical ? (
        <>
          {/* Sol ve Sağ */}
          <Chair x={x - width / 2 - 5} y={y - height / 4} status={status} angle={-90} />
          <Chair x={x - width / 2 - 5} y={y + height / 4} status={status} angle={-90} />
          <Chair x={x + width / 2 + 5} y={y - height / 4} status={status} angle={90} />
          <Chair x={x + width / 2 + 5} y={y + height / 4} status={status} angle={90} />
        </>
      ) : (
        <>
          {/* Üst ve Alt (veya yanlar genişse) */}
          {table.seats <= 2 ? (
            <>
              <Chair x={x - width / 2 - 5} y={y} status={status} angle={-90} />
              <Chair x={x + width / 2 + 5} y={y} status={status} angle={90} />
            </>
          ) : (
            <>
              <Chair x={x - width / 4} y={y - height / 2 - 5} status={status} angle={0} />
              <Chair x={x + width / 4} y={y - height / 2 - 5} status={status} angle={0} />
              <Chair x={x - width / 4} y={y + height / 2 + 5} status={status} angle={180} />
              <Chair x={x + width / 4} y={y + height / 2 + 5} status={status} angle={180} />
            </>
          )}
        </>
      )}

      {/* Masa Etiketi */}
      <text
        x={x}
        y={y + 5}
        fill="white"
        fontSize={Math.min(width, height) / 3}
        fontWeight="800"
        textAnchor="middle"
        style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
      >
        {table.id}
      </text>
    </g>
  );
}

export default function RoofFloorPlan({ selectedTable, onSelect, onClose, date, time }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [posErr, setPosErr] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, TableStatus>>({});
  const [selectedZone, setSelectedZone] = useState<"all" | "teras" | "loca" | "bekleme">("all");

  const selected = normTable(selectedTable || "");

  const filteredTables = TABLES.filter((t) => {
    const matchSearch = !q.trim() || t.id.toLowerCase().includes(q.trim().toLowerCase());
    const matchZone = selectedZone === "all" || t.zone === selectedZone;
    return matchSearch && matchZone;
  });

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setPosErr(null);
      try {
        const map = await fetchRoofStatuses(date, time);
        if (!mounted) return;

        if (!map) {
          setStatuses({});
          setPosErr("POS masa doluluk verisi alınamadı.");
          return;
        }
        setStatuses(map);
      } catch {
        if (!mounted) return;
        setStatuses({});
        setPosErr("POS masa doluluk verisi alınamadı.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [date, time]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const zoneStats = {
    teras: TABLES.filter((t) => t.zone === "teras").length,
    loca: TABLES.filter((t) => t.zone === "loca").length,
    bekleme: TABLES.filter((t) => t.zone === "bekleme").length,
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-[1400px] h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19] shadow-2xl"
          initial={{ y: 20, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.97, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#151b2b] px-6 py-4">
            <div>
              <div className="text-white font-bold text-xl">Roof Restoran</div>
              <div className="mt-0.5 text-xs text-white/55">
                Canlı Oturma Planı
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await fetchRoofStatuses(date, time); // Basit trigger
                  setLoading(false);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
              >
                {loading ? "..." : "🔄 Yenile"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-red-600/20 text-red-400 px-4 py-2 text-xs font-bold hover:bg-red-600/30 transition"
              >
                ✕ Kapat
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">

            {/* Sidebar Controls */}
            <div className="w-64 flex-shrink-0 border-r border-white/10 bg-[#111623] p-5 space-y-6 overflow-y-auto">
              <div>
                <label className="text-[11px] text-white/40 uppercase font-bold tracking-wider mb-2 block">Masa Ara</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="T15, L2..."
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#0ea5ff]"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/40 uppercase font-bold tracking-wider mb-2 block">Bölgeler</label>
                <div className="space-y-2">
                  {[
                    { id: "all", label: "Tümü", count: TABLES.length, color: "bg-gray-700" },
                    { id: "teras", label: "Teras", count: zoneStats.teras, color: "bg-emerald-600" },
                    { id: "loca", label: "Loca", count: zoneStats.loca, color: "bg-blue-600" },
                    { id: "bekleme", label: "Bekleme", count: zoneStats.bekleme, color: "bg-pink-600" }
                  ].map(z => (
                    <button
                      key={z.id}
                      onClick={() => setSelectedZone(z.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${selectedZone === z.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${z.color}`}></span>
                        {z.label}
                      </div>
                      <span className="opacity-50">{z.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <div className="w-3 h-3 rounded bg-[#10b981]"></div> Boş
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <div className="w-3 h-3 rounded bg-[#ef4444]"></div> Dolu
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <div className="w-3 h-3 rounded bg-[#f59e0b]"></div> Rezerve
                  </div>
                </div>
              </div>
            </div>

            {/* SVG MAP */}
            <div className="flex-1 bg-[#070b14] relative overflow-auto flex items-center justify-center p-10">
              {/* Harita */}
              <svg
                viewBox="0 0 1300 800"
                className="w-full max-w-[1200px] h-auto drop-shadow-2xl select-none"
              >
                {/* Zemin Grid (Opsiyonel) */}
                <defs>
                  <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.03" />
                  </pattern>
                </defs>
                <rect width="1300" height="800" fill="url(#floorGrid)" />

                {/* --- MİMARİ ALANLAR (SABİT) --- */}

                {/* Sahne */}
                <rect x="10" y="350" width="40" height="200" fill="#1e293b" rx="4" />
                <text x="25" y="450" fill="#475569" transform="rotate(-90 25 450)" textAnchor="middle" fontSize="12" fontWeight="bold">SAHNE</text>

                {/* Bar Alanı (Sağ Üst L) */}
                <path d="M 800 30 L 1250 30 L 1250 150 L 1150 150 L 1150 100 L 800 100 Z" fill="none" stroke="#0ea5ff" strokeWidth="2" opacity="0.3" />
                <text x="820" y="60" fill="#0ea5ff" fontSize="14" fontWeight="bold" opacity="0.7">BAR</text>

                {/* Servis Mutfağı (Alt Orta) */}
                <rect x="750" y="550" width="300" height="200" fill="#1e1b4b" opacity="0.3" />
                <text x="900" y="650" fill="#6366f1" textAnchor="middle" fontSize="14" fontWeight="bold" opacity="0.5">SERVİS MUTFAĞI</text>

                {/* Teras Saksılar / Duvarlar (Yeşil Çizgiler) */}
                <rect x="150" y="50" width="10" height="100" fill="#059669" rx="2" opacity="0.5" />
                <rect x="250" y="50" width="10" height="100" fill="#059669" rx="2" opacity="0.5" />
                <rect x="400" y="50" width="10" height="100" fill="#059669" rx="2" opacity="0.5" />

                {/* Loca Alanı Çizgisi */}
                <rect x="180" y="340" width="450" height="240" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="5 5" opacity="0.1" rx="20" />
                <text x="400" y="330" fill="white" textAnchor="middle" fontSize="12" opacity="0.4">LOCA ALANI</text>

                {/* Bekleme Alanı Çizgisi */}
                <rect x="720" y="380" width="550" height="100" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="5 5" opacity="0.1" rx="20" />

                {/* --- MASALAR --- */}
                {filteredTables.map((table) => {
                  const st = statuses[table.id] ?? "unknown";
                  const isSelected = Boolean(selected && table.id.toLowerCase() === selected.toLowerCase());

                  return (
                    <TableWithChairs
                      key={table.id}
                      table={table}
                      status={st}
                      isSelected={isSelected}
                      onSelect={() => onSelect(table.id)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Footer */}
          {selected && (
            <div className="border-t border-white/10 bg-[#151b2b] px-6 py-4 flex justify-between items-center">
              <div className="text-white">
                <span className="text-white/50 text-sm">Seçilen Masa:</span>
                <span className="ml-2 font-bold text-xl text-[#0ea5ff]">{selected}</span>
              </div>
              <button
                onClick={() => onSelect(selected)}
                className="bg-[#0ea5ff] text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
              >
                Bu Masayı Onayla
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}