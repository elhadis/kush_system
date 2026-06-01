"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-background border border-border">
      <Globe className="w-4 h-4 text-muted mx-1 hidden sm:block" />
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
          language === "en"
            ? "gradient-brand text-white shadow-md"
            : "text-muted hover:text-foreground"
        )}
        aria-pressed={language === "en"}
      >
        {t("english")}
      </button>
      <button
        onClick={() => setLanguage("ar")}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
          language === "ar"
            ? "gradient-brand text-white shadow-md"
            : "text-muted hover:text-foreground"
        )}
        aria-pressed={language === "ar"}
      >
        {t("arabic")}
      </button>
    </div>
  );
}
