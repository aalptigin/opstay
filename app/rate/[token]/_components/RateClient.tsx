"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type RatingData = {
    rating_id: string;
    restaurant: string;
    customer_name?: string;
    status: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

function Star({
    filled,
    hovered,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: {
    filled: boolean;
    hovered: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="focus:outline-none transition-transform active:scale-90"
        >
            <svg
                className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${filled || hovered ? "text-amber-400" : "text-neutral-300"
                    }`}
                fill={filled || hovered ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
            </svg>
        </button>
    );
}

function CategoryRating({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        filled={star <= value}
                        hovered={star <= hover}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                    />
                ))}
            </div>
        </div>
    );
}

export default function RateClient() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ratingData, setRatingData] = useState<RatingData | null>(null);

    // Ana puan
    const [overallRating, setOverallRating] = useState(0);
    const [overallHover, setOverallHover] = useState(0);

    // Kategori puanları
    const [foodQuality, setFoodQuality] = useState(0);
    const [serviceSpeed, setServiceSpeed] = useState(0);
    const [cleanliness, setCleanliness] = useState(0);
    const [atmosphere, setAtmosphere] = useState(0);

    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: genel puan, 2: detay puanları

    useEffect(() => {
        if (!token) return;

        async function loadRating() {
            try {
                const res = await fetch(`/api/rating/${token}`);
                const data = await res.json();

                if (!res.ok || !data.ok) {
                    setError(data?.error || "Değerlendirme bulunamadı");
                    return;
                }

                if (data.rating?.status === "completed") {
                    setError("Bu değerlendirme zaten tamamlanmış");
                    return;
                }

                setRatingData(data.rating);
            } catch (e: any) {
                setError(e?.message || "Bir hata oluştu");
            } finally {
                setLoading(false);
            }
        }

        loadRating();
    }, [token]);

    async function handleSubmit() {
        if (overallRating === 0) return;

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch(`/api/rating/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    overall_rating: overallRating,
                    food_quality: foodQuality,
                    service_speed: serviceSpeed,
                    cleanliness: cleanliness,
                    atmosphere: atmosphere,
                    feedback,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
                setError(data?.error || "Gönderilemedi");
                return;
            }

            setSubmitted(true);

            // Ortalama puana göre yönlendir
            const avg = parseFloat(data.average || "0");
            if (avg >= 4) {
                // Olumlu - teşekkür + Google yorum
                router.push(`/rate/thank-you?r=${ratingData?.restaurant || ""}`);
            } else {
                // Olumsuz - geri arama
                router.push("/rate/callback-confirmed");
            }
        } catch (e: any) {
            setError(e?.message || "Bir hata oluştu");
        } finally {
            setSubmitting(false);
        }
    }

    const ratingLabels = ["", "Çok Kötü", "Kötü", "Orta", "İyi", "Mükemmel"];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-500"
                >
                    Yükleniyor...
                </motion.div>
            </div>
        );
    }

    if (error && !ratingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-neutral-800 mb-2">Hata</h1>
                    <p className="text-neutral-600">{error}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-800">
                        {ratingData?.restaurant || "Restoranımız"}
                    </h1>
                    <p className="text-neutral-600 mt-2">
                        Deneyiminizi değerlendirin
                    </p>
                    {ratingData?.customer_name && (
                        <p className="text-neutral-500 text-sm mt-1">
                            Merhaba, {ratingData.customer_name}
                        </p>
                    )}
                </div>

                {/* Step 1: Genel Puan */}
                {currentStep === 1 && (
                    <>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-neutral-700 mb-3 text-center">
                                Genel deneyiminizi nasıl buldunuz?
                            </h2>
                        </div>

                        {/* Stars */}
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    filled={star <= overallRating}
                                    hovered={star <= overallHover}
                                    onClick={() => setOverallRating(star)}
                                    onMouseEnter={() => setOverallHover(star)}
                                    onMouseLeave={() => setOverallHover(0)}
                                />
                            ))}
                        </div>

                        {/* Rating Label */}
                        <AnimatePresence mode="wait">
                            {(overallRating > 0 || overallHover > 0) && (
                                <motion.div
                                    key={overallHover || overallRating}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="text-center mb-6"
                                >
                                    <span className="text-lg font-medium text-neutral-700">
                                        {ratingLabels[overallHover || overallRating]}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Next Button */}
                        <button
                            onClick={() => setCurrentStep(2)}
                            disabled={overallRating === 0}
                            className={`w-full py-4 rounded-2xl text-white font-semibold transition-all ${overallRating === 0
                                ? "bg-neutral-300 cursor-not-allowed"
                                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                }`}
                        >
                            Devam Et →
                        </button>
                    </>
                )}

                {/* Step 2: Detay Puanları */}
                {currentStep === 2 && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-neutral-700 mb-1 text-center">
                                Lütfen değerlendirmenizi tamamlayın
                            </h2>
                            <p className="text-sm text-neutral-500 text-center">
                                Aşağıdaki kategorileri puanlayın (isteğe bağlı)
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <CategoryRating
                                label="🍽️ Yemek Kalitesi"
                                value={foodQuality}
                                onChange={setFoodQuality}
                            />
                            <CategoryRating
                                label="⚡ Servis Hızı"
                                value={serviceSpeed}
                                onChange={setServiceSpeed}
                            />
                            <CategoryRating
                                label="✨ Temizlik"
                                value={cleanliness}
                                onChange={setCleanliness}
                            />
                            <CategoryRating
                                label="🎵 Atmosfer"
                                value={atmosphere}
                                onChange={setAtmosphere}
                            />
                        </div>

                        {/* Feedback */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                💬 Eklemek istediğiniz bir şey var mı?
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Deneyiminizi bizimle paylaşın..."
                                rows={3}
                                className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 resize-none"
                            />
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 py-4 rounded-2xl border-2 border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 transition-all active:scale-[0.98]"
                            >
                                ← Geri
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || submitted}
                                className={`flex-[2] py-4 rounded-2xl text-white font-semibold transition-all ${submitting || submitted
                                    ? "bg-neutral-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                    }`}
                            >
                                {submitting ? "Gönderiliyor..." : submitted ? "Gönderildi ✓" : "Gönder"}
                            </button>
                        </div>
                    </>
                )}

                {/* Privacy */}
                <p className="text-xs text-neutral-400 text-center mt-4">
                    Değerlendirmeniz hizmet kalitemizi artırmak için kullanılacaktır.
                </p>
            </motion.div>
        </div>
    );
}
