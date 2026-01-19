"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-[11px] font-medium tracking-[0.25em] text-white/90 shadow-lg shadow-black/10">
      {children}
    </span>
  );
}

export default function PricingHero() {
  return (
    <section className="text-center py-24 px-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <Pill>İŞLETMENİZE ÖZEL PAKETLER</Pill>

        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
          İşletmenize{" "}
          <span className="bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] bg-clip-text text-transparent">
            En Uygun Çözümü
          </span>{" "}
          Seçin
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          OpsStay ile rezervasyon yönetiminden müşteri memnuniyetine,
          operasyonel verimliliğe kadar her şeyi tek platformdan kontrol edin.
        </p>

        <p className="mt-4 text-sm text-white/50 max-w-xl mx-auto leading-relaxed">
          Otomatik bilgilendirme, akıllı puanlama, Google yorum yönetimi ve
          müşteri sadakati araçları ile markanızı güçlendirin.
        </p>
      </motion.div>
    </section>
  );
}