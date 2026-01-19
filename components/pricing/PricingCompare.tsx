export default function PricingCompare() {
  const rows = [
    // Temel Özellikler
    { category: "Temel Özellikler", feature: "", basic: "", premium: "", enterprise: "" },
    { category: "", feature: "Rezervasyon yönetimi ve takip", basic: "✔", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Otomatik SMS bildirimleri", basic: "✔", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Personel-yönetim iletişim kanalı", basic: "✔", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Uyarı listesi yönetimi", basic: "✔", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Temel raporlama", basic: "✔", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Masaüstü ve mobil erişim", basic: "✔", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Standart veri güvenliği", basic: "✔", premium: "✔", enterprise: "✔" },

    // Müşteri Yönetimi
    { category: "Müşteri Yönetimi", feature: "", basic: "", premium: "", enterprise: "" },
    { category: "", feature: "Müşteri puanlama sistemi (API)", basic: "—", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Google Yorum yönlendirme", basic: "—", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Olumsuz geri dönüş alarm ve takip", basic: "—", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Kampanya ve bildirim yönetimi", basic: "—", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Gelişmiş analitik dashboard", basic: "—", premium: "✔", enterprise: "✔" },

    // Kurumsal Özellikler
    { category: "Kurumsal Özellikler", feature: "", basic: "", premium: "", enterprise: "" },
    { category: "", feature: "Şube bazlı yetkilendirme", basic: "—", premium: "—", enterprise: "✔" },
    { category: "", feature: "Genişletilmiş API entegrasyonu", basic: "—", premium: "—", enterprise: "✔" },
    { category: "", feature: "Kurumsal SLA garantisi", basic: "—", premium: "—", enterprise: "✔" },
    { category: "", feature: "Dedicated hesap yöneticisi", basic: "—", premium: "—", enterprise: "✔" },
    { category: "", feature: "Özel eğitim ve onboarding", basic: "—", premium: "—", enterprise: "✔" },
    { category: "", feature: "Özelleştirilebilir raporlama", basic: "—", premium: "—", enterprise: "✔" },
    { category: "", feature: "İsteğe özel web sitesi", basic: "—", premium: "—", enterprise: "✔" },

    // Destek
    { category: "Destek ve Hizmetler", feature: "", basic: "", premium: "", enterprise: "" },
    { category: "", feature: "Email müşteri desteği", basic: "✔", premium: "✔", enterprise: "✔" },
    { category: "", feature: "Öncelikli müşteri desteği", basic: "—", premium: "✔", enterprise: "✔" },
    { category: "", feature: "1 ay ücretsiz teknik destek", basic: "—", premium: "✔", enterprise: "✔" },
    { category: "", feature: "7/24 öncelikli teknik destek", basic: "—", premium: "—", enterprise: "✔" },
    { category: "", feature: "Mobil uygulama (yakında)", basic: "—", premium: "✔", enterprise: "✔" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Detaylı Paket Karşılaştırması
        </h2>
        <p className="text-white/70">
          İşletmenize en uygun paketi seçmek için tüm özellikleri karşılaştırın
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 shadow-2xl shadow-black/20">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10 sticky top-0">
            <tr>
              <th
                scope="col"
                className="p-4 text-left font-bold text-white min-w-[300px]"
              >
                Özellik
              </th>
              <th
                scope="col"
                className="p-4 text-center font-bold text-white min-w-[120px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span>Basic</span>
                  <span className="text-xs font-normal text-white/60">
                    7.200 USD/yıl
                  </span>
                </div>
              </th>
              <th
                scope="col"
                className="p-4 text-center font-bold text-[#0ea5ff] min-w-[120px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span>Premium</span>
                  <span className="text-xs font-normal text-white/60">
                    11.400 USD/yıl
                  </span>
                </div>
              </th>
              <th
                scope="col"
                className="p-4 text-center font-bold text-white min-w-[120px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span>Enterprise</span>
                  <span className="text-xs font-normal text-white/60">
                    Özel Teklif
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              // Category header row
              if (r.category && !r.feature) {
                return (
                  <tr key={i} className="bg-white/5 border-t border-white/10">
                    <td
                      colSpan={4}
                      className="p-3 text-xs font-bold text-[#0ea5ff] uppercase tracking-wider"
                    >
                      {r.category}
                    </td>
                  </tr>
                );
              }

              // Regular feature row
              return (
                <tr
                  key={i}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-white/90 font-medium">{r.feature}</td>
                  <td className="p-4 text-center text-white/70">{r.basic}</td>
                  <td className="p-4 text-center text-[#0ea5ff] font-bold">
                    {r.premium}
                  </td>
                  <td className="p-4 text-center text-white/70">{r.enterprise}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-white/50">
          Tüm paketler yıllık olarak faturalandırılır. Aylık ödeme seçeneği bulunmamaktadır.
        </p>
      </div>
    </section>
  );
}