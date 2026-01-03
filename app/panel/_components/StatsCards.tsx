"use client";

import React from "react";

type StatItem = {
  label: string;
  value: string | number;
  subLabel?: string;
  className?: string; // gerekirse kart bazlı ek stil
};

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export default function StatsCards({
  items,
  columnsClassName = "grid grid-cols-2 md:grid-cols-4 gap-3",
}: {
  items: StatItem[];
  columnsClassName?: string;
}) {
  return (
    <div className={columnsClassName}>
      {items.map((it, i) => (
        <div
          key={`${it.label}-${i}`}
          className={cx(
            "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4",
            it.className
          )}
        >
          <div className="text-xs text-white/55">{it.label}</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{it.value}</div>
          {it.subLabel ? <div className="mt-1 text-xs text-white/45">{it.subLabel}</div> : null}
        </div>
      ))}
    </div>
  );
}
