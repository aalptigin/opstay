"use client";

import React from "react";

export default function LineChart({
  labels,
  values,
  height = 220,
}: {
  labels: string[];
  values: number[];
  height?: number;
}) {
  const w = Math.max(600, labels.length * 60);
  const h = height;

  const max = Math.max(1, ...values);
  const pad = 30;

  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, labels.length - 1);
    const y = h - pad - (v * (h - pad * 2)) / max;
    return { x, y, v, i };
  });

  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className="w-full overflow-auto">
      <svg width={w} height={h} className="block">
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad + (1 - t) * (h - pad * 2);
          return (
            <g key={t}>
              <line x1={pad} x2={w - pad} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
              <text x={6} y={y + 4} fontSize="11" fill="rgba(255,255,255,0.45)">
                {Math.round(max * t)}
              </text>
            </g>
          );
        })}

        {/* line */}
        <path d={d} fill="none" stroke="rgba(56,189,248,0.95)" strokeWidth="2.5" />

        {/* points */}
        {pts.map((p) => (
          <g key={p.i}>
            <circle cx={p.x} cy={p.y} r={4} fill="rgba(56,189,248,0.95)" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.65)">
              {p.v}
            </text>
          </g>
        ))}

        {/* x labels */}
        {labels.map((lab, i) => {
          const x = pad + (i * (w - pad * 2)) / Math.max(1, labels.length - 1);
          return (
            <text
              key={lab + i}
              x={x}
              y={h - 10}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(255,255,255,0.45)"
            >
              {lab}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
