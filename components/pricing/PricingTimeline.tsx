"use client";

import { motion } from "framer-motion";

export default function PricingTimeline() {
  const steps = [
    {
      t: "Rezervasyon",
      d: "Müşteri rezervasyon yapar",
      icon: "📅",
    },
    {
      t: "Otomatik SMS",
      d: "Onay + konum linki gönderilir",
      icon: "📱",
    },
    {
      t: "Puanlama",
      d: "Çıkış sonrası memnuniyet alınır",
      icon: "⭐",
    },
    {
      t: "Akıllı Yönlendirme",
      d: "Olumlu → Google | Olumsuz → geri dönüş",
      icon: "🔄",
    },
    {
      t: "Sadakat",
      d: "Kampanya ve tekrar ziyaret",
      icon: "❤️",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 pt-12 pb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          OpsStay Akışı
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Rezervasyondan sadakate kadar müşteri yolculuğunun her adımında
          yanınızdayız
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="relative rounded-2xl border border-white/10 p-5 bg-gradient-to-b from-white/5 to-transparent hover:border-[#0ea5ff]/30 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="text-sm text-[#0ea5ff] font-bold mb-2">{s.t}</div>
            <div className="text-xs text-white/70 leading-relaxed">{s.d}</div>

            {/* Connection line (hidden on mobile and last item) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}