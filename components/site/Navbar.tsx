import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-gradient-to-b from-[#0a1020]/90 to-[#0a1020]/55 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0ea5ff] text-[#061021] font-bold">
                o
              </span>
              <span className="leading-tight">
                <span className="block text-white font-semibold tracking-tight">opsstay</span>
                <span className="block text-[11px] text-white/60 -mt-0.5">
                  Misafir Ön Kontrol &amp; Güvenli Konaklama
                </span>
              </span>
            </Link>

            {/* Links */}
            <nav className="hidden md:flex items-center gap-5 text-sm text-white/80">
              <a href="#cozumler" className="hover:text-white">Çözümler</a>
              <a href="#hakkimizda" className="hover:text-white">Hakkımızda</a>
              <a href="#neler" className="hover:text-white">Neler yapabiliriz</a>
            </nav>

            {/* CTA */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-[#0ea5ff] px-4 py-2 text-sm font-semibold text-[#061021] hover:bg-[#36b6ff] transition"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
