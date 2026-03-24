import { type ReactNode, createContext, useContext, useState } from "react";
import { type Language, type Translations, translations } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "antifraud-language";
const VALID_LANGUAGES: Language[] = ["pt", "en", "es", "fr", "de", "zh", "ar"];

function isValidLanguage(lang: string): lang is Language {
  return VALID_LANGUAGES.includes(lang as Language);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && isValidLanguage(stored)) {
        return stored;
      }
      const local = localStorage.getItem(STORAGE_KEY);
      if (local && isValidLanguage(local)) {
        return local;
      }
    } catch (_e) {
      // ignore storage errors
    }
    return "pt";
  });

  const setLanguage = (lang: Language) => {
    if (isValidLanguage(lang)) {
      setLanguageState(lang);
      try {
        sessionStorage.setItem(STORAGE_KEY, lang);
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (_e) {
        // ignore storage errors
      }
    }
  };

  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
