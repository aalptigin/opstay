"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { MODULES, User, Role } from "@/lib/org/types";
import { getAccessibleModules, getRoleLabel } from "@/lib/org/rbac";

export default function ModuleSelectionPanel() {
    const router = useRouter();
    const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch("/api/org/auth/me");
                const data = await res.json();

                if (!res.ok) {
                    router.push("/org-login");
                    return;
                }

                setUser(data.user);
            } catch {
                router.push("/org-login");
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/org/auth/logout", { method: "POST" });
        router.push("/org-login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/60">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const accessibleModules = getAccessibleModules(user.role as Role);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">OS</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">OpsStay</h1>
                            <p className="text-xs text-white/50">Organizasyon Yönetim Paneli</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-white/50">{getRoleLabel(user.role as Role)}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-sm transition"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz, {user.name.split(" ")[0]}!</h2>
                    <p className="text-white/60">Çalışmak istediğiniz modülü seçin</p>
                </div>

                {/* Module Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {accessibleModules.map((module, index) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={module.path}>
                                <div
                                    className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                                    style={{
                                        boxShadow: `0 0 40px ${module.color}10`,
                                    }}
                                >
                                    {/* Glow effect */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                                        style={{
                                            background: `radial-gradient(circle at center, ${module.color}, transparent 70%)`,
                                        }}
                                    />

                                    <div className="relative z-10">
                                        <div
                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4"
                                            style={{ backgroundColor: `${module.color}20` }}
                                        >
                                            {module.icon}
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{module.label}</h3>
                                        <p className="text-sm text-white/50">Yönetim modülüne git →</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Stats (for authorized users) */}
                {(user.role === "PRESIDENT" || user.role === "UNIT_MANAGER") && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">📊 Hızlı Özet</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-2xl font-bold text-emerald-400">2</p>
                                <p className="text-sm text-white/50">Kullanılabilir Araç</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-2xl font-bold text-amber-400">3</p>
                                <p className="text-sm text-white/50">Bekleyen Onay</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-2xl font-bold text-red-400">1</p>
                                <p className="text-sm text-white/50">Kritik Stok Uyarısı</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-2xl font-bold text-blue-400">5</p>
                                <p className="text-sm text-white/50">Bugünkü İşlem</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
