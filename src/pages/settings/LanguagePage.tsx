import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const LanguagePage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [search, setSearch] = useState("");
  useAppSettings();

  const setLang = (code: string) => {
    updateSettings.mutate({ language: code, translate_target: code } as any);
    toast.success(t("language.updated"));
  };

  const filtered = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="glass border-b border-border/40 px-4 pt-10 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold font-display text-foreground">{t("language.title")}</h1>
      </div>
      <div className="px-5 pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={t("language.search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm shadow-sm" />
        </div>
        <div className="space-y-2">
          {filtered.map((lang, i) => (
            <motion.button key={lang.code} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              onClick={() => setLang(lang.code)}
              className={`w-full bg-card border rounded-xl p-3.5 flex items-center gap-3 shadow-sm transition-all ${settings?.language === lang.code ? "border-primary/50 ring-2 ring-primary/20" : "border-border/60"}`}>
              <span className="text-xl">{lang.flag}</span>
              <p className="text-sm font-medium text-foreground flex-1 text-left">{lang.label}</p>
              {settings?.language === lang.code && <Check className="w-4 h-4 text-primary" />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguagePage;
