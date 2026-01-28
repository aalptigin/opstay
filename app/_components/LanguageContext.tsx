"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "tr" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (tr: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("tr");

    // Load saved language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("opstay-language");
        if (saved === "tr" || saved === "en") {
            setLanguageState(saved);
        }
    }, []);

    // Wrapper to save to localStorage when changing language
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("opstay-language", lang);
    };

    const t = (tr: string, en: string) => {
        return language === "tr" ? tr : en;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
}
