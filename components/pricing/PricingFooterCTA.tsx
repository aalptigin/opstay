"use client";

export default function PricingFooterCTA() {
  return (
    <section className="border-t border-white/10 py-20 text-center px-6 relative">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
          Hangi paket{" "}
          <span className="bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] bg-clip-text text-transparent">
            senin için
          </span>{" "}
          uygun?
        </h2>

        <p className="text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
          OpsStay, restoran ve eğlence mekânlarının operasyonuna göre
          ölçeklenir. İşletmenize en uygun paketi seçin veya özel bir teklif
          için bizimle iletişime geçin.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("table")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-8 py-4 text-sm font-bold text-white hover:bg-white/15 transition-all hover:scale-105 active:scale-95"
          >
            Paketleri Karşılaştır
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-white/50">
            Sorularınız mı var?{" "}
            <a
              href="mailto:info@opsstay.com"
              className="text-[#0ea5ff] hover:underline font-medium"
            >
              info@opsstay.com
            </a>{" "}
            adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </section>
  );
}