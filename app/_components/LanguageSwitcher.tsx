"use client";

import { useLanguage } from "./LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-sm border border-white/10">
            <button
                onClick={() => setLanguage("tr")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === "tr"
                        ? "bg-white text-[#0b1326] shadow-sm"
                        : "text-white/60 hover:text-white/90"
                    }`}
            >
                TR
            </button>
            <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === "en"
                        ? "bg-white text-[#0b1326] shadow-sm"
                        : "text-white/60 hover:text-white/90"
                    }`}
            >
                EN
            </button>
        </div>
    );
}
