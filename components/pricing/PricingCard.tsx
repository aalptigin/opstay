"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Props = {
  title: string;
  price: string;
  monthly?: string;
  tagline: string;
  highlightLabel?: string;
  valuePoints?: string[];
  features?: string[];
  cta: string;
  highlighted?: boolean;
  onCTA?: () => void;
};

export default function PricingCard({
  title,
  price,
  monthly,
  tagline,
  highlightLabel,
  valuePoints = [],
  features = [],
  cta,
  highlighted,
  onCTA,
}: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative rounded-3xl border p-8 flex flex-col overflow-hidden min-h-[600px] ${highlighted
          ? "border-[#0ea5ff] bg-gradient-to-b from-[#0ea5ff]/15 to-[#050a16] scale-[1.05] shadow-[0_20px_60px_rgba(14,165,255,0.3)]"
          : "border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        }`}
      role="article"
      aria-label={`${title} paketi`}
    >
      {highlightLabel && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] text-white font-bold shadow-lg">
          {highlightLabel}
        </span>
      )}

      <h3 className="text-2xl font-bold text-white">{title}</h3>

      <div className="mt-4">
        <div className="text-4xl font-extrabold text-white">{price}</div>
        {monthly && (
          <div className="text-sm text-white/60 mt-1 font-medium">{monthly}</div>
        )}
      </div>

      <p className="mt-4 text-white/70 leading-relaxed text-sm">{tagline}</p>

      {valuePoints.length > 0 && (
        <div className="mt-6 space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs font-bold text-[#0ea5ff] uppercase tracking-wider mb-2">
            İş Değeri
          </div>
          {valuePoints.map((v, i) => (
            <div key={i} className="text-xs font-semibold text-white flex items-start gap-2 leading-relaxed">
              <span className="flex-shrink-0 mt-0.5">•</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      )}

      <ul className="mt-6 space-y-2.5 text-sm text-white/70 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="text-green-400 flex-shrink-0 mt-0.5 text-xs">✓</span>
            <span className="leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCTA}
        className={`mt-8 rounded-xl py-3.5 text-sm font-bold transition-all shadow-lg hover:shadow-xl ${highlighted
            ? "bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] text-white hover:from-[#36b6ff] hover:to-[#0ea5ff] shadow-[0_10px_30px_rgba(14,165,255,0.3)] hover:scale-105"
            : "bg-white/10 text-white hover:bg-white/15 border border-white/20"
          } active:scale-95`}
        aria-label={`${title} paketi için ${cta}`}
      >
        {cta}
      </button>
    </motion.div>
  );
}