"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function KayitKontrolPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    setMsg(null);
    setResult(null);
    try {
      const res = await fetch("/api/records/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kontrol edilemedi");
      setResult(data.result);
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Kayıt Kontrol</h1>
      <p className="mt-2 text-sm text-white/60">İsim ve/veya telefon ile operasyon doğrulaması yapın.</p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60">İsim Soyisim</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          </div>
          <div>
            <label className="text-xs text-white/60">Telefon</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm text-white/70">{msg}</div>
          <button
            onClick={check}
            disabled={loading}
            className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
          >
            {loading ? "Kontrol ediliyor..." : "Kontrol Et"}
          </button>
        </div>

        {result && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold">Sonuç</div>
            <pre className="mt-3 text-xs text-white/70 whitespace-pre-wrap">
{JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>
    </div>
  );
}
