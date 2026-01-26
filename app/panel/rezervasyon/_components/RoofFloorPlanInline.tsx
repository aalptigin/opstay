"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ENTITIES,
  SEAT_MARKERS,
  GREEN_PLANTERS,
  PURPLE_BLOCKS,
  WALL_LINES,
  AREA_LABELS,
  SAHNE_AREA,
  BAR_AREA,
  KITCHEN_AREA,
  STAIRS_AREA,
  STATUS_COLORS,
  PNG_WIDTH,
  PNG_HEIGHT,
  EntityStatus,
  PlanEntity,
} from "../../../../lib/roofPlanData";

type TableStatus = "free" | "occupied" | "reserved" | "unknown";

type Props = {
  selectedTable?: string;
  onSelect: (tableNo: string) => void;
  date?: string;
  time?: string;
};

function normTable(v: string) {
  return String(v ?? "").trim();
}

async function fetchRoofStatuses(date?: string, time?: string) {
  const qs = new URLSearchParams();
  qs.set("restaurant", "Roof");
  if (date) qs.set("date", date);
  if (time) qs.set("time", time);

  try {
    const res = await fetch(`/api/pos/tables?${qs.toString()}`, { cache: "no-store" });
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
  } catch {
    return null;
  }
}

function getStatusColor(status: TableStatus) {
  // Map internal status to roofPlanData status for colors
  let mapped: EntityStatus = "available";
  if (status === "occupied") mapped = "occupied";
  if (status === "reserved") mapped = "reserved";
  if (status === "free") mapped = "available";

  // Handle unknown/default
  if (status === "unknown") return { fill: "#4b5563", stroke: "#374151" };

  return STATUS_COLORS[mapped] || STATUS_COLORS.available;
}

export default function RoofFloorPlanInline({ selectedTable, onSelect, date, time }: Props) {
  const [statuses, setStatuses] = useState<Record<string, TableStatus>>({});
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<"all" | "teras" | "loca" | "bekleme">("all");
  const [showDetails, setShowDetails] = useState(false);

  const selected = normTable(selectedTable || "");

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      const map = await fetchRoofStatuses(date, time);
      if (!mounted) return;
      setStatuses(map || {});
      setLoading(false);
    }
    run();
    return () => {
      mounted = false;
    };
  }, [date, time]);

  const filteredEntities = useMemo(() => {
    return ENTITIES.filter(e => {
      if (selectedZone === "all") return true;
      // Infer zone from ID
      let zone = "teras";
      if (e.id.startsWith("L")) zone = "loca";
      if (e.id.startsWith("B")) zone = "bekleme"; // Booth -> Bekleme logic from previous file? Or just map it.
      // Previous file: B* -> zone: "bekleme".

      return zone === selectedZone;
    });
  }, [selectedZone]);

  const zoneStats = useMemo(() => {
    let teras = 0, loca = 0, bekleme = 0;
    ENTITIES.forEach(e => {
      if (e.id.startsWith("L")) loca++;
      else if (e.id.startsWith("B")) bekleme++;
      else teras++; // Default T*
    });
    return { teras, loca, bekleme };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#080c14] overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0c1220] px-4 py-3 flex-wrap">
        <div>
          <div className="text-white font-semibold text-sm">Roof Restoran - Oturma Planı</div>
          <div className="text-[11px] text-white/50 mt-0.5">
            Otomatik ölçeklenen interaktif plan
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "Tümü", count: ENTITIES.length },
            { id: "teras", label: "Teras", count: zoneStats.teras },
            { id: "loca", label: "Loca", count: zoneStats.loca },
            { id: "bekleme", label: "Bekleme", count: zoneStats.bekleme },
          ].map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setSelectedZone(z.id as typeof selectedZone)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition ${selectedZone === z.id ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/5"
                }`}
            >
              {z.label} ({z.count})
            </button>
          ))}

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              const map = await fetchRoofStatuses(date, time);
              setStatuses(map || {});
              setLoading(false);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/70 hover:bg-white/10"
          >
            {loading ? "..." : "🔄"}
          </button>
        </div>
      </div>

      <div className="bg-[#050810] p-4 flex justify-center">
        {/* RESPONSIVE CONTAINER: w-full, but aspect ratio preserved */}
        <div className="w-full max-w-[900px]">
          <svg
            viewBox={`0 0 ${PNG_WIDTH} ${PNG_HEIGHT}`}
            className="w-full h-auto drop-shadow-2xl select-none"
          >
            {/* --- Background / Areas --- */}

            {/* SAHNE */}
            <rect x={SAHNE_AREA.x} y={SAHNE_AREA.y} width={SAHNE_AREA.w} height={SAHNE_AREA.h} fill="#1a2744" rx="2" />

            {/* BAR */}
            <path d={`M ${WALL_LINES.filter(l => l.color === "#0ea5ff").map(l => `${l.x1} ${l.y1} L ${l.x2} ${l.y2}`).join(" ")}`} stroke="#0ea5ff" strokeWidth="1.5" fill="none" opacity="0.3" />
            <rect x={BAR_AREA.x} y={BAR_AREA.y} width={BAR_AREA.w} height={BAR_AREA.h} fill="none" />

            {/* KITCHEN */}
            <rect x={KITCHEN_AREA.x} y={KITCHEN_AREA.y} width={KITCHEN_AREA.w} height={KITCHEN_AREA.h} fill="#12162a" opacity="0.5" rx="4" />

            {/* LOCA FRAME */}
            <path d={`M 50 112 L 50 227 L 276 227 L 276 112 Z`} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

            {/* --- Walls / Lines --- */}
            {WALL_LINES.map((l, i) => (
              <line
                key={`w-${i}`}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={l.color || "white"}
                strokeWidth={l.width || 0.5}
                opacity={l.color ? 0.4 : 0.1}
                strokeDasharray={l.color ? undefined : "4 4"}
              />
            ))}

            {/* --- Labels --- */}
            {AREA_LABELS.map((lbl) => (
              <g key={lbl.id} opacity="0.5">
                <text x={lbl.x} y={lbl.y} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">{lbl.text}</text>
                {lbl.subText && <text x={lbl.x} y={lbl.y + 10} fill="#475569" fontSize="6" textAnchor="middle">{lbl.subText}</text>}
              </g>
            ))}

            {/* --- Decor: Green Planters --- */}
            {GREEN_PLANTERS.map((p, i) => (
              <rect key={`gp-${i}`} x={p.x} y={p.y} width={p.w} height={p.h} fill="#059669" opacity="0.4" rx="1.5" />
            ))}

            {/* --- Decor: Purple Blocks --- */}
            {PURPLE_BLOCKS.map((b, i) => (
              <circle key={`pb-${i}`} cx={b.cx} cy={b.cy} r={b.r} fill="#a855f7" opacity="0.4" />
            ))}

            {/* --- Decor: Chairs (Always visible per request? Or maybe faint) --- */}
            {SEAT_MARKERS.map((s, i) => (
              <circle key={`sm-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#374151" opacity="0.3" />
            ))}

            {/* --- Tables --- */}
            {filteredEntities.map((ent) => {
              const st = statuses[ent.id] ?? "unknown"; // Default unknown
              const isSelected = Boolean(selected && ent.id.toLowerCase() === selected.toLowerCase());
              const colors = getStatusColor(st);

              // Determine shape based on kind
              // All entities are rects generally in this data except possily round ones but 'w'/'h' implies rect. 
              // If kind was 'round', we would use circle. But data has x,y,w,h.

              return (
                <g key={ent.id} onClick={() => onSelect(ent.id)} className="cursor-pointer group">
                  {/* Selection Glow */}
                  {isSelected && (
                    <rect
                      x={ent.x - 4} y={ent.y - 4}
                      width={ent.w + 8} height={ent.h + 8}
                      rx="6"
                      fill="none"
                      stroke="#0ea5ff"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Table Body */}
                  <rect
                    x={ent.x} y={ent.y}
                    width={ent.w} height={ent.h}
                    rx="4"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    className="transition-colors hover:brightness-110"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                  />

                  {/* Label */}
                  <text
                    x={ent.x + ent.w / 2}
                    y={ent.y + ent.h / 2 + 2} // visually centered
                    textAnchor="middle"
                    fill="white"
                    fontSize={Math.min(ent.w, ent.h) * 0.4} // Dynamic font size
                    fontWeight="bold"
                    className="pointer-events-none"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                  >
                    {ent.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#0c1220] px-4 py-2.5">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            <div className="w-3 H-3 rounded" style={{ backgroundColor: "#10b981", width: 12, height: 12 }} /> Boş
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f59e0b", width: 12, height: 12 }} /> Rezerve
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444", width: 12, height: 12 }} /> Dolu
          </div>
        </div>

        {selected && (
          <div className="text-xs text-white/80">
            Seçilen: <span className="font-bold text-[#0ea5ff]">{selected}</span>
          </div>
        )}
      </div>
    </div>
  );
}