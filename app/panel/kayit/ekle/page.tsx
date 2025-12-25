"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function KayitEklePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<"bilgi" | "dikkat" | "kritik">("bilgi");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit() {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          risk_level: level,
          summary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");
      setMsg("Kayıt eklendi.");
      setFullName("");
      setPhone("");
      setSummary("");
      setLevel("bilgi");
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Kayıt Ekle</h1>
      <p className="mt-2 text-sm text-white/60">Operasyon doğrulaması için yeni kayıt oluşturun.</p>

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
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Ad Soyad" />
          </div>
          <div>
            <label className="text-xs text-white/60">Telefon</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="05xx..." />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/60">Seviye</label>
          <div className="mt-2 grid sm:grid-cols-3 gap-3">
            {[
              { k: "bilgi", t: "Bilgi", d: "Kayıt amaçlı." },
              { k: "dikkat", t: "Dikkat", d: "Operasyona etkisi olabilir." },
              { k: "kritik", t: "Kritik", d: "Öncelikli değerlendirme." },
            ].map((x) => (
              <button
                key={x.k}
                type="button"
                onClick={() => setLevel(x.k as any)}
                className={[
                  "text-left rounded-xl border px-4 py-3",
                  level === x.k ? "border-[#0ea5ff]/60 bg-[#0ea5ff]/10" : "border-white/10 bg-white/5",
                ].join(" ")}
              >
                <div className="text-sm text-white font-semibold">{x.t}</div>
                <div className="text-xs text-white/55 mt-1">{x.d}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/60">Özet</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
            className="mt-2 w-full min-h-[140px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            placeholder="Kısa ve net şekilde açıklayın." />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-white/70">{msg}</div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kaydı Ekle"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
