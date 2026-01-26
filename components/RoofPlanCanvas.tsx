"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  SEAT_MARKERS,
  GREEN_PLANTERS,
  PURPLE_BLOCKS,
  WALL_LINES,
  SAHNE_AREA,
  BAR_AREA,
  KITCHEN_AREA,
  STAIRS_AREA,
  AREA_LABELS,
  STATUS_COLORS,
  PNG_WIDTH,
  PNG_HEIGHT,
  type PlanEntity,
} from "@/lib/roofPlanData";
import { usePanZoom } from "@/lib/usePanZoom";

interface Props {
  selectedId: string | null;
  searchQuery: string;
  onSelectEntity: (entity: PlanEntity | null) => void;
  entities: PlanEntity[];
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export default function RoofPlanCanvas({
  selectedId,
  searchQuery,
  onSelectEntity,
  entities,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const contentBBox = useMemo(
    () => ({ x: 0, y: 0, width: PNG_WIDTH, height: PNG_HEIGHT }),
    []
  );

  const {
    transform,
    isReady,
    zoomIn,
    zoomOut,
    resetToFit,
    zoomToEntity,
    handlers,
  } = usePanZoom({
    containerRef,
    contentBBox,
    padding: 32,
  });

  // Overlay & UI state
  const [pngOpacity, setPngOpacity] = useState(50);
  const [vectorOpacity, setVectorOpacity] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const [detailMode, setDetailMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [layers, setLayers] = useState<{
    walls: boolean;
    areas: boolean;
    decor: boolean;
    seats: boolean;
    entities: boolean;
    labels: boolean;
  }>({
    walls: true,
    areas: true,
    decor: true,
    seats: true,
    entities: true,
    labels: true,
  });

  const [hoveredEntity, setHoveredEntity] = useState<{
    entity: PlanEntity;
    x: number;
    y: number;
  } | null>(null);

  // Search highlight
  const highlightedIds = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return [];
    return entities
      .filter((e) => e.id.toLowerCase().includes(q))
      .map((e) => e.id);
  }, [entities, searchQuery]);

  // Zoom to single search result
  useEffect(() => {
    if (!isReady) return;
    if (highlightedIds.length !== 1) return;
    const entity = entities.find((e) => e.id === highlightedIds[0]);
    if (!entity) return;

    zoomToEntity({
      x: entity.x - 30,
      y: entity.y - 30,
      width: entity.w + 60,
      height: entity.h + 60,
    });
  }, [highlightedIds, entities, zoomToEntity, isReady]);

  // Screen-space sizing (inverse scale; clamp for readability)
  const currentScale = transform.scale || 1;

  const baseStroke = detailMode ? 2 : 1.2;
  const strokeWidth = clamp(baseStroke / currentScale, 0.4, 4);
  const thinStroke = clamp(0.6 / currentScale, 0.2, 2);

  const labelSize = clamp((detailMode ? 10 : 7) / currentScale, 5, 16);
  const areaLabelSize = clamp((detailMode ? 8 : 6) / currentScale, 4, 14);
  const seatRadius = clamp((detailMode ? 5 : 4) / currentScale, 1.5, 10);

  const handleMouseMoveWithCoords = useCallback(
    (e: React.MouseEvent) => {
      handlers.onMouseMove(e);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Mouse -> container space
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Container space -> SVG space (world coords)
      const svgX = (px - transform.x) / (transform.scale || 1);
      const svgY = (py - transform.y) / (transform.scale || 1);

      setMousePos({
        x: Math.round(svgX),
        y: Math.round(svgY),
      });
    },
    [handlers, transform]
  );

  const handleHover = useCallback(
    (entity: PlanEntity | null, e: React.MouseEvent | null) => {
      if (!entity || !e || !containerRef.current) {
        setHoveredEntity(null);
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      setHoveredEntity({
        entity,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const toggleLayer = (key: keyof typeof layers) =>
    setLayers((p) => ({ ...p, [key]: !p[key] }));

  // Deselect on empty space click (important UX)
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // If clicking directly on SVG background, deselect
      // (Entity rects stop propagation below)
      onSelectEntity(null);
      handlers.onMouseDown(e);
    },
    [handlers, onSelectEntity]
  );

  // ------------------------------------------------------------
  // Minimap viewport calculation (fix: do NOT use containerRef.current in render conditionally)
  // ------------------------------------------------------------
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });

    return () => ro.disconnect();
  }, []);

  const viewRect = useMemo(() => {
    const s = transform.scale || 1;
    if (!s || containerSize.w <= 0 || containerSize.h <= 0) return null;

    return {
      x: -transform.x / s,
      y: -transform.y / s,
      w: containerSize.w / s,
      h: containerSize.h / s,
    };
  }, [transform.x, transform.y, transform.scale, containerSize.w, containerSize.h]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/10 bg-[#080f1a] flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-white/40">PNG</span>
          <input
            type="range"
            min="0"
            max="100"
            value={pngOpacity}
            onChange={(e) => setPngOpacity(Number(e.target.value))}
            className="w-14 h-1 accent-cyan-500"
          />
          <span className="text-[8px] text-white/50 w-5">{pngOpacity}</span>

          <span className="text-[8px] text-white/40 ml-2">Vec</span>
          <input
            type="range"
            min="0"
            max="100"
            value={vectorOpacity}
            onChange={(e) => setVectorOpacity(Number(e.target.value))}
            className="w-14 h-1 accent-green-500"
          />
          <span className="text-[8px] text-white/50 w-5">{vectorOpacity}</span>

          <button
            type="button"
            onClick={() => {
              setPngOpacity(50);
              setVectorOpacity(50);
            }}
            className="px-1.5 py-0.5 text-[8px] bg-amber-500/20 text-amber-400 rounded border border-amber-500/30"
            title="Difference Check"
          >
            Diff
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            className={`px-1.5 py-0.5 text-[8px] rounded border ${
              showGrid
                ? "bg-white/15 text-white border-white/30"
                : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            Grid
          </button>

          <button
            type="button"
            onClick={() => setDetailMode((v) => !v)}
            className={`px-1.5 py-0.5 text-[8px] rounded border ${
              detailMode
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            Detail
          </button>

          <div className="px-1.5 py-0.5 text-[8px] bg-white/5 text-white/40 rounded font-mono">
            {mousePos.x},{mousePos.y}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            className="w-5 h-5 text-white/60 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-xs"
          >
            −
          </button>
          <span className="text-[8px] text-white/50 w-10 text-center">
            {Math.round(currentScale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className="w-5 h-5 text-white/60 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-xs"
          >
            +
          </button>
          <button
            type="button"
            onClick={resetToFit}
            className="px-1.5 py-0.5 text-[8px] bg-cyan-600/30 text-cyan-300 rounded border border-cyan-500/30 hover:bg-cyan-600/50 ml-1"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Layers */}
      <div className="flex items-center gap-1 px-3 py-0.5 border-b border-white/10 bg-[#060c15] flex-shrink-0">
        {Object.entries(layers).map(([k, v]) => (
          <button
            key={k}
            type="button"
            onClick={() => toggleLayer(k as keyof typeof layers)}
            className={`px-1 py-0.5 text-[7px] rounded ${
              v ? "bg-white/15 text-white" : "text-white/30"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 bg-[#050810] cursor-grab active:cursor-grabbing overflow-hidden relative"
        {...handlers}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMoveWithCoords}
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
            Yükleniyor...
          </div>
        )}

        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0, opacity: isReady ? 1 : 0 }}
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {/* PNG */}
            {pngOpacity > 0 && (
              <image
                href="/images/roof-plan-reference.png"
                x="0"
                y="0"
                width={PNG_WIDTH}
                height={PNG_HEIGHT}
                opacity={pngOpacity / 100}
              />
            )}

            {/* Vector */}
            <g opacity={vectorOpacity / 100}>
              {/* Grid */}
              {showGrid && (
                <g>
                  {Array.from({ length: Math.ceil(PNG_WIDTH / 50) + 1 }).map((_, i) => (
                    <line
                      key={`gv${i}`}
                      x1={i * 50}
                      y1={0}
                      x2={i * 50}
                      y2={PNG_HEIGHT}
                      stroke="#fff"
                      strokeWidth={thinStroke}
                      opacity="0.15"
                    />
                  ))}
                  {Array.from({ length: Math.ceil(PNG_HEIGHT / 50) + 1 }).map((_, i) => (
                    <line
                      key={`gh${i}`}
                      x1={0}
                      y1={i * 50}
                      x2={PNG_WIDTH}
                      y2={i * 50}
                      stroke="#fff"
                      strokeWidth={thinStroke}
                      opacity="0.15"
                    />
                  ))}
                </g>
              )}

              {/* Walls */}
              {layers.walls &&
                WALL_LINES.map((w, i) => (
                  <line
                    key={`w${i}`}
                    x1={w.x1}
                    y1={w.y1}
                    x2={w.x2}
                    y2={w.y2}
                    stroke={w.color || "#fff"}
                    strokeWidth={w.color ? strokeWidth : thinStroke}
                    opacity={w.color ? 0.5 : 0.12}
                    strokeDasharray={w.color ? undefined : "2 2"}
                  />
                ))}

              {/* Areas */}
              {layers.areas && (
                <g>
                  <rect
                    x={SAHNE_AREA.x}
                    y={SAHNE_AREA.y}
                    width={SAHNE_AREA.w}
                    height={SAHNE_AREA.h}
                    fill="#1a2744"
                    stroke="#2d3f5e"
                    strokeWidth={thinStroke}
                    rx="2"
                  />

                  <rect
                    x={BAR_AREA.x}
                    y={BAR_AREA.y}
                    width={BAR_AREA.w}
                    height={BAR_AREA.h}
                    fill="#0d1a2e"
                    stroke="#0ea5ff"
                    strokeWidth={thinStroke}
                    opacity="0.5"
                    rx="2"
                  />

                  <rect
                    x={KITCHEN_AREA.x}
                    y={KITCHEN_AREA.y}
                    width={KITCHEN_AREA.w}
                    height={KITCHEN_AREA.h}
                    fill="#12162a"
                    opacity="0.4"
                    rx="2"
                  />

                  <rect
                    x={STAIRS_AREA.x}
                    y={STAIRS_AREA.y}
                    width={STAIRS_AREA.w}
                    height={STAIRS_AREA.h}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={thinStroke}
                    opacity="0.3"
                    rx="2"
                  />

                  {Array.from({ length: STAIRS_AREA.steps }).map((_, i) => (
                    <line
                      key={`st${i}`}
                      x1={STAIRS_AREA.x + 3}
                      y1={STAIRS_AREA.y + 8 + i * 10}
                      x2={STAIRS_AREA.x + STAIRS_AREA.w - 3}
                      y2={STAIRS_AREA.y + 8 + i * 10}
                      stroke="#a855f7"
                      strokeWidth={thinStroke * 0.5}
                      opacity="0.2"
                    />
                  ))}
                </g>
              )}

              {/* Decor */}
              {layers.decor && (
                <g>
                  {GREEN_PLANTERS.map((p, i) => (
                    <rect
                      key={`p${i}`}
                      x={p.x}
                      y={p.y}
                      width={p.w}
                      height={p.h}
                      fill="#059669"
                      rx="1"
                      opacity="0.6"
                    />
                  ))}
                  {PURPLE_BLOCKS.map((c, i) => (
                    <circle
                      key={`c${i}`}
                      cx={c.cx}
                      cy={c.cy}
                      r={c.r}
                      fill="#a855f7"
                      opacity="0.5"
                    />
                  ))}
                </g>
              )}

              {/* Seats */}
              {layers.seats &&
                SEAT_MARKERS.map((s, i) => (
                  <circle
                    key={`s${i}`}
                    cx={s.x}
                    cy={s.y}
                    r={seatRadius}
                    fill="#374151"
                    stroke="#4b5563"
                    strokeWidth={thinStroke * 0.4}
                    opacity="0.4"
                  />
                ))}

              {/* Entities */}
              {layers.entities &&
                entities.map((e) => {
                  const st = STATUS_COLORS[e.status];
                  const isSel = selectedId === e.id;
                  const isHl = highlightedIds.includes(e.id);

                  return (
                    <g
                      key={e.id}
                      className="cursor-pointer"
                      onMouseDown={(ev) => ev.stopPropagation()} // prevent deselect
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onSelectEntity(e);
                      }}
                      onMouseEnter={(ev) => handleHover(e, ev)}
                      onMouseLeave={() => handleHover(null, null)}
                    >
                      {(isSel || isHl) && (
                        <rect
                          x={e.x - 3}
                          y={e.y - 3}
                          width={e.w + 6}
                          height={e.h + 6}
                          rx="3"
                          fill="none"
                          stroke={isSel ? "#0ea5ff" : "#fbbf24"}
                          strokeWidth={strokeWidth * 1.5}
                          strokeDasharray={isSel ? undefined : "3 2"}
                          opacity={0.95}
                        />
                      )}

                      <rect
                        x={e.x}
                        y={e.y}
                        width={e.w}
                        height={e.h}
                        rx="2"
                        fill={st.fill}
                        stroke={st.stroke}
                        strokeWidth={strokeWidth}
                        opacity={0.95}
                      />
                    </g>
                  );
                })}

              {/* Labels */}
              {layers.labels && (
                <g>
                  {AREA_LABELS.map((a) => (
                    <g key={a.id}>
                      <text
                        x={a.x}
                        y={a.y}
                        fill="#fff"
                        fontSize={areaLabelSize}
                        fontWeight="600"
                        opacity="0.35"
                      >
                        {a.text}
                      </text>
                      {a.subText && (
                        <text
                          x={a.x}
                          y={a.y + areaLabelSize * 1.2}
                          fill="#fff"
                          fontSize={areaLabelSize * 0.8}
                          opacity="0.25"
                        >
                          {a.subText}
                        </text>
                      )}
                    </g>
                  ))}

                  {entities.map((e) => (
                    <text
                      key={`l${e.id}`}
                      x={e.x + e.w / 2}
                      y={e.y + e.h / 2 + labelSize * 0.3}
                      fill="#fff"
                      fontSize={labelSize}
                      fontWeight="700"
                      textAnchor="middle"
                      style={{
                        textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                        pointerEvents: "none",
                      }}
                    >
                      {e.id}
                    </text>
                  ))}
                </g>
              )}
            </g>
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredEntity && (
          <div
            className="absolute pointer-events-none z-50 bg-[#0c1220]/95 border border-white/20 rounded px-2 py-1 shadow-xl text-xs"
            style={{
              left: clamp(hoveredEntity.x + 10, 8, containerSize.w - 140),
              top: clamp(hoveredEntity.y - 10, 8, containerSize.h - 60),
            }}
          >
            <div className="text-white font-bold">{hoveredEntity.entity.id}</div>
            <div className="text-white/60 text-[10px]">
              Kap: {hoveredEntity.entity.capacity}
            </div>
            <div className="text-white/50 text-[10px]">
              Durum: {hoveredEntity.entity.status}
            </div>
          </div>
        )}

        {/* Minimap */}
        <div className="absolute bottom-2 right-2 w-28 h-16 bg-[#0a1020]/90 border border-white/15 rounded overflow-hidden">
          <svg
            viewBox={`0 0 ${PNG_WIDTH} ${PNG_HEIGHT}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {entities.map((e) => (
              <rect
                key={`m${e.id}`}
                x={e.x}
                y={e.y}
                width={e.w}
                height={e.h}
                fill={STATUS_COLORS[e.status].fill}
                opacity="0.75"
              />
            ))}

            {viewRect && (
              <rect
                x={viewRect.x}
                y={viewRect.y}
                width={viewRect.w}
                height={viewRect.h}
                fill="none"
                stroke="#0ea5ff"
                strokeWidth={2}
                opacity="0.85"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}