import type { Metadata } from "next";
import "./globals.css";
import CookieConsent from "./CookieConsent";
import { LanguageProvider } from "./_components/LanguageContext";

export const metadata: Metadata = {
  title: "OpsStay – İtibar Koruma ve Müşteri Deneyimi Platformu",
  description:
    "Rezervasyon sonrası bilgilendirme, müşteri puanlama, Google yorum dönüşümü, olumsuz deneyim geri kazanımı, blacklist yönetimi ve kampanya bildirimi tek bir akışta birleşir.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <LanguageProvider>
          {children}
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}