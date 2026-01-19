"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";
import PricingModal from "./PricingModal";

export default function PricingGrid() {
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<
    "basic" | "premium" | "enterprise"
  >("basic");

  const handleOpenModal = (packageType: "basic" | "premium" | "enterprise") => {
    setSelectedPackage(packageType);
    setOpen(true);
  };

  return (
    <>
      <section className="px-6 pb-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* BASIC */}
            <PricingCard
              title="Basic"
              price="7.200 USD / yıl"
              tagline="Operasyonel yönetimi dijitalleştirin, ekibinizi tek platformda birleştirin."
              valuePoints={[
                "⏱ Manuel süreçleri %70 azaltır",
                "📍 Müşteri kaybını %45 önler",
                "👥 Ekip verimliliğini %60 artırır",
              ]}
              features={[
                "Rezervasyon yönetimi ve takip sistemi",
                "Otomatik SMS bildirimleri (onay + konum)",
                "Personel-yönetim iletişim kanalı",
                "İşletmeye özel uyarı listesi yönetimi",
                "Temel raporlama ve istatistikler",
                "Masaüstü ve mobil erişim",
                "Email ile müşteri desteği",
                "Standart veri güvenliği",
              ]}
              cta="Başvur"
              onCTA={() => handleOpenModal("basic")}
            />

            {/* PREMIUM */}
            <PricingCard
              highlighted
              title="Premium"
              price="11.400 USD / yıl"
              tagline="Müşteri memnuniyetini ölçümleyin, sadakati artırın, markanızı koruyun."
              valuePoints={[
                "🚫 Olumsuz yorumları %80 önceden yakalar",
                "❤️ Müşteri sadakatini %65 artırır",
                "🔁 Tekrar ziyaret oranını 2x yükseltir",
              ]}
              features={[
                "Rezervasyon yönetimi ve takip sistemi",
                "Otomatik SMS bildirimleri (onay + konum)",
                "Personel-yönetim iletişim kanalı",
                "İşletmeye özel uyarı listesi yönetimi",
                "Temel raporlama ve istatistikler",
                "Masaüstü ve mobil erişim",
                "Email ile müşteri desteği",
                "Standart veri güvenliği",
                "Müşteri memnuniyet puanlama sistemi (API)",
                "Google Yorum yönlendirme ve yönetimi",
                "Olumsuz geri dönüş otomatik alarm ve takip",
                "Kampanya ve bildirim yönetimi",
                "Gelişmiş analitik raporlar ve dashboard",
                "Mobil uygulama desteği (yakında)",
                "1 ay ücretsiz teknik destek",
                "Öncelikli müşteri desteği",
              ]}
              cta="Başvur"
              onCTA={() => handleOpenModal("premium")}
            />

            {/* ENTERPRISE */}
            <PricingCard
              title="Enterprise"
              price="Özel Teklif"
              tagline="Çok şubeli yapınızı merkezi yönetin, her lokasyonu bağımsız kontrol edin."
              valuePoints={[
                "🧩 Tüm şubelerde %100 standart hizmet",
                "🔐 KVKK uyumlu tam veri güvenliği",
                "📊 Üst yönetim için konsolide raporlar",
              ]}
              features={[
                "Rezervasyon yönetimi ve takip sistemi",
                "Otomatik SMS bildirimleri (onay + konum)",
                "Personel-yönetim iletişim kanalı",
                "İşletmeye özel uyarı listesi yönetimi",
                "Temel raporlama ve istatistikler",
                "Masaüstü ve mobil erişim",
                "Email ile müşteri desteği",
                "Standart veri güvenliği",
                "Müşteri memnuniyet puanlama sistemi (API)",
                "Google Yorum yönlendirme ve yönetimi",
                "Olumsuz geri dönüş otomatik alarm ve takip",
                "Kampanya ve bildirim yönetimi",
                "Gelişmiş analitik raporlar ve dashboard",
                "Mobil uygulama desteği (yakında)",
                "1 ay ücretsiz teknik destek",
                "Öncelikli müşteri desteği",
                "Şube bazlı rol ve yetkilendirme",
                "Genişletilmiş API ve entegrasyon desteği",
                "Kurumsal SLA ve garantili uptime",
                "Özel eğitim ve onboarding programı",
                "Dedicated hesap yöneticisi",
                "7/24 öncelikli teknik destek",
                "Özelleştirilebilir raporlama modülleri",
                "İsteğinize özel web sitesi entegrasyonu",
              ]}
              cta="Başvur"
              onCTA={() => handleOpenModal("enterprise")}
            />
          </div>
        </div>
      </section>

      {/* MODAL */}
      <PricingModal
        open={open}
        packageType={selectedPackage}
        onClose={() => setOpen(false)}
      />
    </>
  );
}