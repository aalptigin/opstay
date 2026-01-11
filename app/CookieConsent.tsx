"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};
export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("opsstay_cookie_consent");
      if (!stored) {
        setIsVisible(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    saveAndClose(allAccepted);
  };
  const handleSaveSelection = () => {
    saveAndClose(preferences);
  };
  const saveAndClose = (prefs: CookiePreferences) => {
    localStorage.setItem("opsstay_cookie_consent", JSON.stringify(prefs));
    setIsVisible(false);
    
    if (prefs.analytics) {
      console.log("Analytics cookies enabled");
    }
  };
  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#050a16]/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="p-6 md:p-8">
              {/* Başlık ve İkon */}
              <div className="flex items-start gap-4">
                <div className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0ea5ff]/10 text-[#0ea5ff]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h.01" />
                    <path d="M12 7h.01" />
                    <path d="M17 7h.01" />
                    <path d="M7 12h.01" />
                    <path d="M12 12h.01" />
                    <path d="M17 12h.01" />
                    <path d="M7 17h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">Çerez Tercihleriniz</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    OpsStay olarak deneyiminizi iyileştirmek için çerezleri kullanıyoruz. Zorunlu çerezler sitenin çalışması için gereklidir. Analitik ve pazarlama çerezlerine izin vermek size kalmış.
                    Detaylı bilgi için <Link href="/cerezler" className="text-[#0ea5ff] hover:underline">Çerez Politikamızı</Link> inceleyebilirsiniz.
                  </p>
                </div>
              </div>
              {/* Detaylar Bölümü */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="pt-6 space-y-4">
                      {/* Zorunlu */}
                      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
                        <div>
                          <div className="font-semibold text-white text-sm">Zorunlu Çerezler</div>
                          <div className="text-xs text-white/50 mt-1">Sitenin çalışması için gereklidir. Kapatılamaz.</div>
                        </div>
                        <div className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full border-2 border-transparent bg-[#0ea5ff] opacity-50">
                          <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                        </div>
                      </div>
                      {/* Analitik */}
                      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
                        <div>
                          <div className="font-semibold text-white text-sm">Analitik ve Performans</div>
                          <div className="text-xs text-white/50 mt-1">Sitemizi nasıl kullandığınızı anlamamıza yardımcı olur.</div>
                        </div>
                        <button
                          onClick={() => togglePreference("analytics")}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            preferences.analytics ? "bg-[#0ea5ff]" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`${
                              preferences.analytics ? "translate-x-5" : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                      {/* Pazarlama */}
                      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
                        <div>
                          <div className="font-semibold text-white text-sm">Pazarlama</div>
                          <div className="text-xs text-white/50 mt-1">Size özel teklifler sunmamızı sağlar.</div>
                        </div>
                        <button
                          onClick={() => togglePreference("marketing")}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            preferences.marketing ? "bg-[#0ea5ff]" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`${
                              preferences.marketing ? "translate-x-5" : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Butonlar */}
              <div className="mt-6 flex flex-col md:flex-row items-center gap-3 md:justify-end border-t border-white/10 pt-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm font-medium text-white/70 hover:text-white transition px-4 py-2"
                >
                  {showDetails ? "Detayları Gizle" : "Ayarları Yönet"}
                </button>
                <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
                  {showDetails && (
                    <button
                      onClick={handleSaveSelection}
                      className="w-full md:w-auto rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                    >
                      Seçimi Kaydet
                    </button>
                  )}
                  <button
                    onClick={handleAcceptAll}
                    className="w-full md:w-auto rounded-xl bg-[#0ea5ff] px-8 py-3 text-sm font-semibold text-[#061021] hover:bg-[#36b6ff] transition shadow-[0_0_20px_rgba(14,165,255,0.3)]"
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}