"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

export default function CallbackConfirmedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </motion.div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-neutral-800 mb-2">
                    Geri Bildiriminiz Alındı
                </h1>
                <p className="text-neutral-600 mb-6">
                    Değerlendirmeniz için teşekkür ederiz. Yaşadığınız deneyimi daha iyi
                    anlayabilmek için en kısa sürede sizinle iletişime geçeceğiz.
                </p>

                {/* Info Box */}
                <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-800 text-left">
                            Yetkililerimiz sizinle telefon aracılığıyla iletişime geçecektir.
                            Lütfen bilinmeyen numaralardan gelen aramaları yanıtlayın.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-sm text-neutral-400">
                    Görüşleriniz bizim için önemli. Anlayışınız için teşekkür ederiz.
                </p>
            </motion.div>
        </div>
    );
}
