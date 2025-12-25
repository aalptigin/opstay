"use client";

export default function FloatingMinus() {
  return (
    <button
      type="button"
      aria-label="Quick action"
      className="fixed left-4 top-24 z-50 grid h-10 w-10 place-items-center rounded-full bg-[#0b1326]/80 backdrop-blur border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.35)]"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Yukarı"
    >
      <span className="text-[#0ea5ff] text-xl leading-none">−</span>
    </button>
  );
}
