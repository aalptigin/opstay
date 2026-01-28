"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OrgSignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STAFF",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor");
            return;
        }

        if (formData.password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/org/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Kayıt başarısız");
                setLoading(false);
                return;
            }

            // Redirect to login page with success message
            router.push("/org-login?registered=true");
        } catch (err) {
            setError("Bağlantı hatası");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">OS</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Kayıt Ol</h1>
                        <p className="text-sm text-white/60 mt-1">Organizasyon Yönetim Sistemine Hoş Geldiniz</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                İsim
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Adınız Soyadınız"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="ornek@opstay.com"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                Şifre
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="En az 6 karakter"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                Şifre Tekrar
                            </label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Şifreyi tekrar girin"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                Rol
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                            >
                                <option value="STAFF">Personel</option>
                                <option value="UNIT_MANAGER">Birim Sorumlusu</option>
                                <option value="PRESIDENT">Başkan</option>
                            </select>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Kaydediliyor...
                                </span>
                            ) : (
                                "Kayıt Ol"
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/50">
                            Zaten hesabınız var mı?{" "}
                            <Link href="/org-login" className="text-blue-400 hover:text-blue-300 font-medium">
                                Giriş Yap
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-white/30 mt-6">
                    © 2026 OpsStay - Organizasyon Yönetim Platformu
                </p>
            </motion.div>
        </div>
    );
}
