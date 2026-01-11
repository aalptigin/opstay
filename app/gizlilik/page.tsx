"use client";
import Link from "next/link";
import { motion } from "framer-motion";
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050a16] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#050a16]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-[#0ea5ff] transition">
            OpsStay
          </Link>
          <Link 
            href="/" 
            className="text-sm font-medium text-white/60 hover:text-white transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            Ana Sayfa
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center rounded-full border border-[#0ea5ff]/30 bg-[#0ea5ff]/10 px-4 py-1.5 text-xs font-medium text-[#0ea5ff] mb-6">
            KVKK Uyumlu • Son Güncelleme: 12 Ocak 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Gizlilik Politikası
          </h1>
          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Veri güvenliğiniz bizim için önceliktir.
          </p>
        </motion.div>
        {/* İçerik */}
        <div className="space-y-12 text-white/70 leading-relaxed">
          
          {/* 1. Hizmetin Tanımı */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              1. Hizmetin Tanımı
            </h2>
            <p>
              OpsStay; restoran, bar, lounge ve gece kulübü gibi yeme-içme ve eğlence sektöründe faaliyet gösteren işletmelere yönelik bir <strong className="text-white">operasyonel yönetim yazılımıdır</strong>.
            </p>
            <p className="mt-4">
              Platform; rezervasyon yönetimi, misafir kayıt sistemi ve operasyonel raporlama hizmetleri sunar.
            </p>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 mt-4">
              <div className="flex gap-3">
                <span className="text-amber-400">⚠️</span>
                <div className="text-sm text-amber-200/80">
                  <strong className="text-amber-300">Önemli:</strong> OpsStay, misafirler hakkında <strong>otomatik profilleme veya algoritmik karar alma</strong> işlemi yapmaz. Sistemdeki tüm notlar ve değerlendirmeler, işletme personeli tarafından manuel olarak girilir.
                </div>
              </div>
            </div>
          </section>
          {/* 2. İşlenen Veriler */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              2. İşlenen Kişisel Veriler
            </h2>
            
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="font-semibold text-white mb-3">İşletme Kullanıcıları (Yönetici/Personel)</div>
                <ul className="text-sm space-y-2">
                  <li>• Ad, soyad, e-posta, telefon</li>
                  <li>• İşletme adı ve pozisyon bilgisi</li>
                  <li>• Oturum bilgileri (IP, giriş zamanı)</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="font-semibold text-white mb-3">İşletme Misafirleri</div>
                <ul className="text-sm space-y-2">
                  <li>• Ad, soyad, telefon</li>
                  <li>• Rezervasyon bilgileri (tarih, saat, masa)</li>
                  <li>• İşletme personelinin girdiği servis notları</li>
                </ul>
              </div>
            </div>
          </section>
          {/* 3. Roller */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              3. Sorumluluk Dağılımı
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#0ea5ff]/20 bg-[#0ea5ff]/5 p-5">
                <div className="font-semibold text-[#0ea5ff] mb-2">OpsStay</div>
                <div className="text-sm">Veri işleyen olarak teknik altyapıyı sağlar, verileri güvenli şekilde saklar.</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                <div className="font-semibold text-purple-400 mb-2">İşletme</div>
                <div className="text-sm">Veri sorumlusu olarak hangi verilerin toplanacağına karar verir, misafirlerini bilgilendirir.</div>
              </div>
            </div>
          </section>
          {/* 4. Aktarım */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              4. Verilerin Aktarımı
            </h2>
            <p>
              Veriler yalnızca hizmetin sunulması için zorunlu olan altyapı sağlayıcılarıyla (bulut hizmetleri, güvenlik servisleri) ve yasal yükümlülük halinde yetkili kurumlarla paylaşılır.
            </p>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 mt-4">
              <div className="flex gap-3">
                <span className="text-red-400">🚫</span>
                <div className="text-sm text-red-200/80">
                  Kişisel veriler pazarlama amacıyla üçüncü taraflara satılmaz, kiralanmaz veya ticari amaçla paylaşılmaz.
                </div>
              </div>
            </div>
          </section>
          {/* 5. Saklama */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              5. Veri Saklama
            </h2>
            <p>
              Kişisel veriler, işlenme amaçlarının gerektirdiği süre ve yasal saklama süreleri boyunca muhafaza edilir. Süre dolan veriler güvenli yöntemlerle silinir veya anonim hale getirilir.
            </p>
          </section>
          {/* 6. Güvenlik */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              6. Güvenlik Önlemleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                <div className="font-semibold text-green-400 mb-3">Teknik</div>
                <ul className="text-sm space-y-1">
                  <li>• TLS şifreli veri aktarımı</li>
                  <li>• Veritabanı şifreleme</li>
                  <li>• DDoS koruması</li>
                </ul>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <div className="font-semibold text-blue-400 mb-3">İdari</div>
                <ul className="text-sm space-y-1">
                  <li>• Rol tabanlı erişim kontrolü</li>
                  <li>• Gizlilik taahhütleri</li>
                  <li>• Erişim logları</li>
                </ul>
              </div>
            </div>
          </section>
          {/* 7. Yaş */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              7. Yaş Sınırı
            </h2>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🔞</div>
                <div className="text-sm">
                  Platform yalnızca 18 yaşını doldurmuş kullanıcılara açıktır. 18 yaş altı bireylerin verileri bilerek toplanmaz.
                </div>
              </div>
            </div>
          </section>
          {/* 8. Haklar */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              8. KVKK Kapsamındaki Haklarınız
            </h2>
            <p>
              6698 sayılı Kanun'un 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme, işlemeye itiraz etme ve zararın giderilmesini isteme haklarına sahipsiniz.
            </p>
            <div className="rounded-lg border border-[#0ea5ff]/20 bg-[#0ea5ff]/5 p-4 mt-4">
              <div className="text-sm">
                Başvurularınızı <a href="mailto:info@opsstay.com" className="text-[#0ea5ff] font-medium">info@opsstay.com</a> adresine iletebilirsiniz. Talepler en geç 30 gün içinde yanıtlanır.
              </div>
            </div>
          </section>
          {/* 9. Güncellemeler */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              9. Politika Güncellemeleri
            </h2>
            <p>
              Bu politika yasal düzenlemeler veya hizmet değişiklikleri doğrultusunda güncellenebilir. Önemli değişiklikler web sitesinde duyurulur.
            </p>
          </section>
          {/* Çerez Linki */}
          <section>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-white/60 mb-3">Çerez kullanımı hakkında detaylı bilgi için:</p>
              <Link 
                href="/cerezler" 
                className="inline-flex items-center gap-2 text-[#0ea5ff] font-medium hover:underline"
              >
                Çerez Politikası →
              </Link>
            </div>
          </section>
        </div>
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          © 2026 OpsStay. Tüm hakları saklıdır.
        </div>
      </div>
    </main>
  );
}