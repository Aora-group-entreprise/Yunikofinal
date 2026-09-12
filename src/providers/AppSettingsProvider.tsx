import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSettings } from "@/hooks/useSettings";
import { setLanguage, getLanguage } from "@/lib/i18n";

interface AppSettingsContextType {
  theme: string;
  accentColor: string;
  language: string;
  forceUpdate: number;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  theme: "light-futuristic",
  accentColor: "cyan",
  language: "fr",
  forceUpdate: 0,
});

export const useAppSettings = () => useContext(AppSettingsContext);

function applyTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
}

function applyAccent(accent: string) {
  document.documentElement.setAttribute("data-accent", accent);
}

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Load from localStorage immediately to prevent flash
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("yusheng_theme");
    if (saved) applyTheme(saved);
    return saved || "light-futuristic";
  });
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem("yusheng_accent");
    if (saved) applyAccent(saved);
    return saved || "cyan";
  });
  const [language, setLang] = useState(() => {
    const saved = localStorage.getItem("yusheng_lang");
    if (saved) setLanguage(saved);
    return saved || "fr";
  });

  // Sync from DB when settings load
  useEffect(() => {
    if (!settings) return;

    const newTheme = settings.theme || "light-futuristic";
    const newAccent = settings.accent_color || "cyan";
    const newLang = settings.language || "fr";

    setTheme(newTheme);
    setAccentColor(newAccent);
    setLang(newLang);

    applyTheme(newTheme);
    applyAccent(newAccent);
    setLanguage(newLang);

    localStorage.setItem("yusheng_theme", newTheme);
    localStorage.setItem("yusheng_accent", newAccent);
    localStorage.setItem("yusheng_lang", newLang);

    setForceUpdate(n => n + 1);
  }, [settings?.theme, settings?.accent_color, settings?.language]);

  return (
    <AppSettingsContext.Provider value={{ theme, accentColor, language, forceUpdate }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
