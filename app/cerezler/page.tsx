"use client";
import Link from "next/link";
import { motion } from "framer-motion";
export default function CookiePolicyPage() {
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
            Son Güncelleme: 12 Ocak 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Çerez Politikası
          </h1>
          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Web sitemizde kullanılan çerezler hakkında bilgi edinin.
          </p>
        </motion.div>
        {/* İçerik */}
        <div className="space-y-12 text-white/70 leading-relaxed">
          
          {/* 1. Çerez Nedir */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              1. Çerez Nedir?
            </h2>
            <p>
              Çerezler, web sitelerinin cihazınıza yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar, siteyi ziyaret ettiğinizde tercihlerinizi hatırlamak, oturumunuzu yönetmek ve size daha iyi bir deneyim sunmak için kullanılır.
            </p>
          </section>
          {/* 2. Neden Kullanıyoruz */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              2. Çerezleri Neden Kullanıyoruz?
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0ea5ff]" />
                <span><strong className="text-white">Site İşlevselliği:</strong> Oturumunuzun açık kalması ve tercihlerinizin hatırlanması için</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0ea5ff]" />
                <span><strong className="text-white">Güvenlik:</strong> Yetkisiz erişimi önlemek ve hesabınızı korumak için</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0ea5ff]" />
                <span><strong className="text-white">Analiz:</strong> Sitemizin nasıl kullanıldığını anlamak ve iyileştirmek için</span>
              </li>
            </ul>
          </section>
          {/* 3. Çerez Türleri */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              3. Kullandığımız Çerez Türleri
            </h2>
            
            <div className="space-y-4">
              {/* Zorunlu */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-green-500/10 border-b border-white/10 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-green-400">🔒 Zorunlu Çerezler</div>
                      <div className="text-xs text-white/50 mt-1">Sitenin çalışması için gereklidir</div>
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Her Zaman Aktif</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm mb-4">
                    Bu çerezler olmadan site düzgün çalışmaz. Oturum yönetimi, güvenlik ve temel işlevler için gereklidir. Devre dışı bırakılamazlar.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="text-left py-2 text-white/60">Çerez Adı</th>
                          <th className="text-left py-2 text-white/60">Amaç</th>
                          <th className="text-left py-2 text-white/60">Süre</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/70">
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono text-xs">session_token</td>
                          <td className="py-2">Oturum kimliğinizi saklar</td>
                          <td className="py-2">Oturum</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono text-xs">csrf_token</td>
                          <td className="py-2">Güvenlik doğrulaması</td>
                          <td className="py-2">Oturum</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-xs">opsstay_cookie_consent</td>
                          <td className="py-2">Çerez tercihlerinizi saklar</td>
                          <td className="py-2">1 yıl</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Analitik */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-blue-500/10 border-b border-white/10 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-blue-400">📊 Analitik Çerezler</div>
                      <div className="text-xs text-white/50 mt-1">Site kullanımını anlamamıza yardımcı olur</div>
                    </div>
                    <span className="text-xs bg-white/10 text-white/50 px-3 py-1 rounded-full">İzne Bağlı</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm mb-4">
                    Bu çerezler, ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Tüm veriler anonimleştirilmiş olarak işlenir ve kimliğinizi tespit etmek için kullanılmaz.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="text-left py-2 text-white/60">Çerez Adı</th>
                          <th className="text-left py-2 text-white/60">Sağlayıcı</th>
                          <th className="text-left py-2 text-white/60">Amaç</th>
                          <th className="text-left py-2 text-white/60">Süre</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/70">
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono text-xs">_ga</td>
                          <td className="py-2">Google</td>
                          <td className="py-2">Benzersiz ziyaretçi tanımlama</td>
                          <td className="py-2">2 yıl</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-2 font-mono text-xs">_ga_*</td>
                          <td className="py-2">Google</td>
                          <td className="py-2">Oturum durumu</td>
                          <td className="py-2">2 yıl</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-xs">_gid</td>
                          <td className="py-2">Google</td>
                          <td className="py-2">Günlük ziyaretçi ayrımı</td>
                          <td className="py-2">24 saat</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Pazarlama */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-purple-500/10 border-b border-white/10 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-purple-400">📣 Pazarlama Çerezleri</div>
                      <div className="text-xs text-white/50 mt-1">Size özel içerik sunmamızı sağlar</div>
                    </div>
                    <span className="text-xs bg-white/10 text-white/50 px-3 py-1 rounded-full">İzne Bağlı</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm">
                    Bu çerezler, ilgi alanlarınıza uygun içerik ve reklamlar sunmak için kullanılabilir. Şu anda aktif pazarlama çerezi kullanılmamaktadır, ancak ileride eklenebilir.
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* 4. Tercihler */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              4. Çerez Tercihlerinizi Yönetme
            </h2>
            <p>
              Zorunlu çerezler dışındaki çerezleri kabul edip etmemeye siz karar verirsiniz.
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="font-semibold text-white mb-2">🍪 Site Üzerinden</div>
                <p className="text-sm">
                  Sitemizi ilk ziyaretinizde görünen çerez bildiriminden tercihlerinizi belirleyebilirsiniz. Daha sonra bu tercihleri değiştirmek için sayfanın altındaki "Çerez Ayarları" bağlantısını kullanabilirsiniz.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="font-semibold text-white mb-2">🌐 Tarayıcı Ayarları</div>
                <p className="text-sm">
                  Tarayıcınızın ayarlarından tüm çerezleri engelleyebilir veya silebilirsiniz. Ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.
                </p>
              </div>
            </div>
          </section>
          {/* 5. Üçüncü Taraf */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              5. Üçüncü Taraf Çerezleri
            </h2>
            <p>
              Sitemizde Google Analytics gibi üçüncü taraf hizmetlerinin çerezleri bulunabilir. Bu çerezler, ilgili şirketlerin gizlilik politikalarına tabidir:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0ea5ff] hover:underline">
                  Google Gizlilik Politikası →
                </a>
              </li>
            </ul>
          </section>
          {/* 6. Güncelleme */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              6. Politika Güncellemeleri
            </h2>
            <p>
              Bu Çerez Politikası, yasal düzenlemeler veya hizmet değişiklikleri doğrultusunda güncellenebilir. Değişiklikler bu sayfada yayımlanır.
            </p>
          </section>
          {/* İletişim */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              7. İletişim
            </h2>
            <p>
              Çerezler hakkında sorularınız için <a href="mailto:info@opsstay.com" className="text-[#0ea5ff]">info@opsstay.com</a> adresinden bize ulaşabilirsiniz.
            </p>
          </section>
          {/* Gizlilik Linki */}
          <section>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-white/60 mb-3">Kişisel verilerin işlenmesi hakkında detaylı bilgi için:</p>
              <Link 
                href="/gizlilik" 
                className="inline-flex items-center gap-2 text-[#0ea5ff] font-medium hover:underline"
              >
                Gizlilik Politikası →
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