"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function AmbientMotionLayer() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <motion.div
                aria-hidden
                className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-3xl opacity-20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(14,165,255,0.4), rgba(14,165,255,0) 70%)",
                }}
            />
        </div>
    );
}

function QuoteBlock({ children }: { children: React.ReactNode }) {
    return (
        <blockquote className="my-12 border-l-4 border-[#0ea5ff] pl-6 py-2">
            <p className="text-2xl md:text-3xl font-serif italic text-white/90 leading-relaxed">
                "{children}"
            </p>
        </blockquote>
    );
}

export default function AboutPage() {
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

            <div className="mx-auto max-w-4xl px-6 py-24 pb-48">

                {/* HERO */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease }}
                    className="mb-20"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8">
                        Misafirperverliği <br />
                        <span className="text-[#0ea5ff]">Veriyle Yeniden Tanımlamak.</span>
                    </h1>
                    <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
                        Biz, teknolojiyi karmaşıklaştırmak için değil, insan ilişkilerini güçlendirmek için kullanan bir teknoloji şirketiyiz.
                    </p>
                </motion.div>

                {/* HİKAYEMİZ */}
                <section className="mb-24 space-y-8 text-lg text-white/70 leading-relaxed">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Neden Buradayız?</h2>
                    <p>
                        OpsStay, sektörün tam kalbinden gelen bir ihtiyaçla doğdu. Yıllarca restoran, kulüp ve otel işletmeciliğinde gördüğümüz en büyük boşluk şuydu: <strong>Mekanlar hafızasızdır.</strong>
                    </p>
                    <p>
                        Milyonlarca dolarlık yatırımlarla kurulan işletmeler, operasyonel hafızalarını vardiya defterlerine, post-it notlara veya yöneticilerin zihinlerine emanet ediyordu. Başarılı bir yönetici ayrıldığında, o işletmenin "ruhu" da onunla birlikte kapıdan çıkıp gidiyordu.
                    </p>
                    <p>
                        Biz buna son vermek istedik. Amacımız, işletmenin hafızasını kurumsallaştırmak, ancak bunu yaparken hizmet sektörünün en önemli kuralını ihlal etmemekti: <strong>Hız.</strong>
                    </p>

                    <QuoteBlock>
                        Teknoloji görünmez olmalıdır. Şef garsonunuz tablete bakarken değil, misafirin gözüne bakarken karar verebilmelidir.
                    </QuoteBlock>

                    <p>
                        Bu felsefe, OpsStay'in her satır koduna işlendi. Biz, yüzlerce butonu olan karmaşık paneller yapmıyoruz. Biz, saniyeler içinde karar vermenizi sağlayan, gürültüyü filtreleyen ve sadece gerçeği söyleyen yalın arayüzler tasarlıyoruz.
                    </p>
                </section>

                {/* DEĞERLERİMİZ */}
                <section className="mb-24">
                    <h2 className="text-2xl font-bold text-white mb-10 border-b border-white/10 pb-4">Temel Değerlerimiz</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0ea5ff]/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-3">Güven ve Mahremiyet</h3>
                            <p className="text-white/60">
                                Veri, günümüzün en tehlikeli varlığıdır. Biz veriyi toplarken paranoyak derecesinde titiz davranırız. Misafirlerinizin özel hayatı bizi ilgilendirmez; bizi ilgilendiren tek şey, onların işletmenizdeki güvenliği ve konforudur.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0ea5ff]/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-3">Operasyonel Mükemmellik</h3>
                            <p className="text-white/60">
                                "İdare eder" bizim sözlüğümüzde yoktur. Sistemlerimiz 7/24, en yoğun gecelerde, en stresli anlarda bile hatasız çalışmak zorundadır. Çünkü sizin bir saniye bile kaybetme lüksünüz olmadığını biliyoruz.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0ea5ff]/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-3">Sadelik</h3>
                            <p className="text-white/60">
                                Mühendisliğin zirvesi, karmaşık bir sorunu basit bir çözüme indirgemektir. Ekranlarımızda gereksiz tek bir piksel bile bulamazsınız. Her özellik, bir sorunu çözmek için oradadır.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0ea5ff]/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-3">Sürdürülebilirlik</h3>
                            <p className="text-white/60">
                                Biz müşterilerimizle "sat-kaç" değil, uzun vadeli ortaklıklar kurarız. İşletmeniz büyüdükçe, OpsStay de sizinle birlikte öğrenir, gelişir ve büyür.
                            </p>
                        </div>
                    </div>
                </section>

                {/* GELECEK VİZYONU */}
                <section className="bg-gradient-to-r from-[#0ea5ff]/10 to-transparent p-10 rounded-3xl border border-[#0ea5ff]/20">
                    <h2 className="text-3xl font-bold text-white mb-6">Geleceğe Bakış</h2>
                    <p className="text-lg text-white/80 leading-relaxed mb-8">
                        OpsStay olarak vizyonumuz, yeme-içme ve eğlence sektöründe "veriye dayalı misafirperverlik" standardını oluşturmaktır. Gelecekte, bir işletmenin başarısı sadece şefin yeteneğiyle değil, misafirini ne kadar iyi tanıdığıyla ölçülecek. Biz, o geleceği bugünden inşa ediyoruz.
                    </p>
                    <Link href="/cozumler" className="text-[#0ea5ff] font-bold hover:underline text-lg">
                        Çözümlerimizi İnceleyin →
                    </Link>
                </section>

            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#050a16]">
                <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-white/40">© 2026 OpsStay. Tüm hakları saklıdır.</div>
                    <div className="flex gap-8 text-sm font-medium text-white/60">
                        <Link href="/" className="hover:text-white transition">Ana Sayfa</Link>
                        <Link href="/cozumler" className="hover:text-white transition">Çözümler</Link>
                        <Link href="/gizlilik" className="hover:text-white transition">Gizlilik Politikası</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
