"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function AmbientMotionLayer() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <motion.div
                aria-hidden
                className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full blur-3xl opacity-40"
                animate={{ y: [0, -14, 0], opacity: [0.28, 0.55, 0.28] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background:
                        "radial-gradient(circle at 30% 30%, rgba(14,165,255,0.5), rgba(14,165,255,0) 60%)",
                }}
            />
            <motion.div
                aria-hidden
                className="absolute top-32 -right-28 h-[440px] w-[440px] rounded-full blur-3xl opacity-35"
                animate={{ x: [0, 14, 0], opacity: [0.22, 0.5, 0.22] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background:
                        "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.4), rgba(59,130,246,0) 60%)",
                }}
            />
            <motion.div
                aria-hidden
                className="absolute bottom-[-220px] left-[20%] h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
                animate={{ y: [0, 18, 0], opacity: [0.18, 0.35, 0.18] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background:
                        "radial-gradient(circle at 30% 30%, rgba(2,132,199,0.35), rgba(2,132,199,0) 62%)",
                }}
            />
        </div>
    );
}

function SectionHeading({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight ${className}`}
        >
            {children}
        </h2>
    );
}

function TextBlock({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-3xl">
            {children}
        </p>
    );
}

export default function SolutionsPage() {
    return (
        <main className="min-h-screen bg-[#050a16] text-white relative isolate overflow-hidden">
            <AmbientMotionLayer />

            {/* Header */}
            <div className="border-b border-white/10 bg-[#050a16]/95 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-[#0ea5ff] transition">
                        OpsStay
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium text-white/60 hover:text-white transition flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        Ana Sayfa
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-24 pb-48">
                {/* HERO */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center rounded-full border border-[#0ea5ff]/30 bg-[#0ea5ff]/10 px-5 py-2 text-xs font-bold tracking-widest text-[#0ea5ff] mb-8">
                        ÇÖZÜM MİMARİSİ
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
                        Operasyonel Körlüğü <br />
                        <span className="text-[#0ea5ff]">Ortadan Kaldırın.</span>
                    </h1>
                    <p className="mt-8 text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                        Yüksek profilli işletmelerde en büyük risk, bilgi eksikliğidir. OpsStay, misafir kapıdan girmeden önce "kimi ağırladığınızı" bilmenizi sağlayan istihbarat katmanıdır.
                    </p>
                </motion.div>

                {/* BÖLÜM 1: SORUN */}
                <section className="mb-32">
                    <div className="border-l-4 border-white/10 pl-8 ml-4 md:ml-0">
                        <h3 className="text-sm font-bold text-[#0ea5ff] tracking-widest uppercase mb-4">Mevcut Durum</h3>
                        <SectionHeading>Karanlıkta Yürütülen Operasyonlar</SectionHeading>
                        <TextBlock>
                            Günümüzün ultra lüks restoranları, gece kulüpleri ve "fine dining" işletmeleri, müşterilerini ağırlarken aslında büyük bir kumar oynuyor. Rezervasyon sistemleri yalnızca bir isim, bir saat ve bir masa numarası verir. Peki ya o ismin arkasındaki hikaye?
                        </TextBlock>
                        <TextBlock>
                            Güvenlik ekibi, gece kapıda bekleyen kalabalığı yönetirken kimin "istenmeyen" olduğunu, kimin daha önce içeride taşkınlık çıkardığını veya kimin diğer şubelerinizde sorun yarattığını bilmiyor. Resepsiyon ekibi, VIP bir misafiri sıradan bir prosedürle karşılarken, aslında markanızın en sadık müşterisini kaybediyor olabilirsiniz.
                        </TextBlock>
                        <TextBlock>
                            Bu bilgi kopukluğu, biz buna <strong className="text-white">"Operasyonel Körlük"</strong> diyoruz. İşletmenizin hafızası, çalışanlarınızın nöbet defterlerine, WhatsApp gruplarına veya kişisel hafızalarına sıkışıp kalmış durumda. Personel değiştiğinde, hafıza silinir. Ve işletmeniz her şeye sıfırdan başlamak zorunda kalır.
                        </TextBlock>
                    </div>
                </section>

                {/* BÖLÜM 2: OPSSTAY ÇÖZÜMÜ */}
                <section className="mb-32 relative">
                    <div className="absolute -left-20 top-0 w-1 bg-gradient-to-b from-[#0ea5ff] to-transparent h-full hidden lg:block opacity-30" />

                    <h3 className="text-sm font-bold text-[#0ea5ff] tracking-widest uppercase mb-4">OpsStay Yaklaşımı</h3>
                    <SectionHeading>
                        <span className="text-[#0ea5ff]">Ön Kontrol</span> Katmanı
                    </SectionHeading>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-[#0ea5ff]/20 flex items-center justify-center text-[#0ea5ff] mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Ortak Dil ve Kurumsal Hafıza</h4>
                            <p className="text-white/60 leading-relaxed">
                                OpsStay, farklı departmanların (Güvenlik, Resepsiyon, F&B) konuştuğu dili standartlaştırır. "Sorunlu müşteri" tanımı, sübjektif yorumlardan çıkarılıp doğrulanmış operasyonel kayıtlara dayanır. Böylece, İstanbul şubenizdeki bir vukuat, Bodrum şubenizdeki kapı ekibi için anında görünür bir "Risk Uyarısı"na dönüşür.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-[#0ea5ff]/20 flex items-center justify-center text-[#0ea5ff] mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Mahremiyet Odaklı İstihbarat</h4>
                            <p className="text-white/60 leading-relaxed">
                                En büyük endişeniz veri güvenliği. OpsStay bu yüzden tasarlandı. Sistemimiz, personelinize misafirin tüm hayat hikayesini vermez. Sadece operasyonu yönetmek için gereken <strong className="text-white">"Check Edildi"</strong> veya <strong className="text-[#0ea5ff]">"Risk Seviyesi: Yüksek"</strong> bilgisini verir. Kararı yine insan verir, ancak bu kez gözü kapalı değil, bilerek verir.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-[#0ea5ff]/20 flex items-center justify-center text-[#0ea5ff] mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Proaktif Zaman Yönetimi</h4>
                            <p className="text-white/60 leading-relaxed">
                                Misafir kapıya geldiğinde kimlik sormak, telefonla teyit almak... Bunlar lüks deneyimi öldüren amatörlüklerdir. OpsStay ile ön kontrol, rezervasyon anında başlar. Misafir kapıya geldiğinde, ekibiniz zaten hazırdır. Sürpriz yok, kaos yok. Sadece akıcı, profesyonel bir karşılama var.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-[#0ea5ff]/20 flex items-center justify-center text-[#0ea5ff] mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M22 12h-4" /><path d="M6 12H2" /><path d="M5.6 5.6l2.8 2.8" /><path d="M18.4 18.4l-2.8-2.8" /><path d="M18.4 5.6l-2.8 2.8" /><path d="M5.6 18.4l2.8-2.8" /></svg>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Zincir Yönetimi için Standart</h4>
                            <p className="text-white/60 leading-relaxed">
                                Birden fazla mekanı yöneten gruplar için OpsStay, merkezi bir sinir sistemidir. Bir şubenizde yaşanan olumsuz deneyim, tüm grubun hafızasına işlenir. Marka itibarınız, tekil çalışanların inisiyatifine bırakılamayacak kadar değerlidir.
                            </p>
                        </div>
                    </div>
                </section>

                {/* BÖLÜM 3: NEDEN ŞİMDİ? */}
                <section className="bg-gradient-to-br from-[#0ea5ff]/10 to-transparent rounded-3xl p-10 md:p-16 border border-[#0ea5ff]/20">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Neden OpsStay'e Geçmelisiniz?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <p className="text-white/70 leading-relaxed mb-6">
                                Eğlence ve yeme-içme sektörü artık sadece "iyi yemek" veya "iyi müzik" satmıyor. Güven satıyor. Konfor satıyor. Ve en önemlisi, <strong>ayrıcalık</strong> satıyor.
                            </p>
                            <p className="text-white/70 leading-relaxed">
                                Müşterilerinizi tanıyamamak, onlara o ayrıcalığı sunamamak demektir. OpsStay, size bu gücü geri veriyor. Karmaşık CRM sistemlerinin içinde boğulmadan, sadece operasyon anında ihtiyacınız olan o kritik "tek cümleyi" size fısıldayan bir partner olarak yanınızdayız.
                            </p>
                        </div>
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-[#0ea5ff] flex items-center justify-center text-black font-bold">✓</div>
                                <span className="text-lg text-white font-medium">Riskleri kapıda durdurun</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-[#0ea5ff] flex items-center justify-center text-black font-bold">✓</div>
                                <span className="text-lg text-white font-medium">Sürdürülebilir hizmet kalitesi</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-[#0ea5ff] flex items-center justify-center text-black font-bold">✓</div>
                                <span className="text-lg text-white font-medium">KVKK uyumlu güvenli altyapı</span>
                            </div>
                            <div className="mt-8 pt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-xl bg-[#0ea5ff] px-8 py-4 text-sm font-bold text-[#061021] hover:bg-[#36b6ff] transition-all shadow-[0_0_30px_rgba(14,165,255,0.3)] hover:shadow-[0_0_50px_rgba(14,165,255,0.5)]"
                                >
                                    Şimdi Başlayın
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#050a16]">
                <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-white/40">© 2026 OpsStay. Tüm hakları saklıdır.</div>
                    <div className="flex gap-8 text-sm font-medium text-white/60">
                        <Link href="/" className="hover:text-white transition">Ana Sayfa</Link>
                        <Link href="/hakkimizda" className="hover:text-white transition">Hakkımızda</Link>
                        <Link href="/gizlilik" className="hover:text-white transition">Gizlilik Politikası</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
