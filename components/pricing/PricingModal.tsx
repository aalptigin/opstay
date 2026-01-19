"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Toast from "@/components/ui/Toast";

type Props = {
  open: boolean;
  onClose: () => void;
  packageType?: "basic" | "premium" | "enterprise";
};

export default function PricingModal({
  open,
  onClose,
  packageType = "basic",
}: Props) {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "info",
  });

  const packageNames = {
    basic: "Basic",
    premium: "Premium",
    enterprise: "Enterprise",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/pricing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          packageType,
          requestType: "offer",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          show: true,
          message: "Başvurunuz alındı! En kısa sürede size dönüş yapacağız.",
          type: "success",
        });
        setFormData({
          businessName: "",
          contactName: "",
          phone: "",
          email: "",
        });
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setToast({
          show: true,
          message: data.error || "Bir hata oluştu. Lütfen tekrar deneyin.",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Bağlantı hatası. Lütfen tekrar deneyin.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              onClick={handleBackdropClick}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed z-50 inset-0 flex items-center justify-center px-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && !loading) {
                  onClose();
                }
              }}
            >
              <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#0a1020] to-[#050a16] border border-white/20 shadow-2xl shadow-black/50 overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#0ea5ff]/20 to-[#0891e6]/20 border-b border-white/10 px-8 py-6">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 mb-3">
                        <span className="h-2 w-2 rounded-full bg-[#0ea5ff] animate-pulse" />
                        <span className="text-xs font-bold text-[#0ea5ff] uppercase tracking-wider">
                          {packageNames[packageType]} Paket
                        </span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-white">
                        Başvuru Formu
                      </h3>
                      <p className="text-sm text-white/60 mt-2 max-w-md">
                        Bilgilerinizi paylaşın, ekibimiz sizinle en kısa sürede
                        iletişime geçsin.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      disabled={loading}
                      className="h-10 w-10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 hover:text-white disabled:opacity-50 border border-white/10"
                      aria-label="Kapat"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* İşletme Adı */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="businessName"
                        className="block text-sm font-semibold text-white mb-2.5"
                      >
                        İşletme Adı
                        <span className="text-[#0ea5ff] ml-1">*</span>
                      </label>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        minLength={2}
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessName: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-[#0ea5ff] focus:ring-2 focus:ring-[#0ea5ff]/20 transition-all backdrop-blur-sm"
                        placeholder="Restoran / Otel / Kulüp Adı"
                        disabled={loading}
                      />
                    </div>

                    {/* Yetkili Adı */}
                    <div>
                      <label
                        htmlFor="contactName"
                        className="block text-sm font-semibold text-white mb-2.5"
                      >
                        Yetkili Adı Soyadı
                        <span className="text-[#0ea5ff] ml-1">*</span>
                      </label>
                      <input
                        id="contactName"
                        name="contactName"
                        type="text"
                        required
                        minLength={2}
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-[#0ea5ff] focus:ring-2 focus:ring-[#0ea5ff]/20 transition-all backdrop-blur-sm"
                        placeholder="Ad Soyad"
                        disabled={loading}
                      />
                    </div>

                    {/* Telefon */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-white mb-2.5"
                      >
                        Telefon
                        <span className="text-[#0ea5ff] ml-1">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        pattern="[0-9]{10,11}"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-[#0ea5ff] focus:ring-2 focus:ring-[#0ea5ff]/20 transition-all backdrop-blur-sm"
                        placeholder="05XX XXX XX XX"
                        disabled={loading}
                      />
                    </div>

                    {/* E-posta */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-white mb-2.5"
                      >
                        E-posta Adresi
                        <span className="text-[#0ea5ff] ml-1">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-[#0ea5ff] focus:ring-2 focus:ring-[#0ea5ff]/20 transition-all backdrop-blur-sm"
                        placeholder="ornek@sirket.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="rounded-xl bg-[#0ea5ff]/10 border border-[#0ea5ff]/20 p-4">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-[#0ea5ff] flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm text-white/80 leading-relaxed">
                        Başvurunuz alındıktan sonra <strong className="text-white">48 saat içinde</strong>{" "}
                        size detaylı bilgi ve özel teklif sunmak üzere
                        ulaşacağız.
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-[#0ea5ff] to-[#0891e6] px-7 py-4 text-base font-bold text-white hover:from-[#36b6ff] hover:to-[#0ea5ff] transition-all shadow-[0_14px_40px_rgba(14,165,255,.3)] hover:shadow-[0_18px_50px_rgba(14,165,255,.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Gönderiliyor...
                      </span>
                    ) : (
                      "Başvuruyu Gönder"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}