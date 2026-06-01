"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Direction, Language } from "@/lib/types";
import {
  getDirection,
  getLocale,
  t,
  type TranslationKey,
} from "@/lib/i18n/translations";

interface LanguageContextValue {
  language: Language;
  direction: Direction;
  locale: string;
  setLanguage: (lang: Language) => void;
  translate: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "kush-system-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === "ar" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = getDirection(language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const translate = useCallback(
    (key: TranslationKey) => t(language, key),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      direction: getDirection(language),
      locale: getLocale(language),
      setLanguage,
      translate,
    }),
    [language, setLanguage, translate]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { translate, language, direction, locale, setLanguage } =
    useLanguage();
  return { t: translate, language, direction, locale, setLanguage };
}
