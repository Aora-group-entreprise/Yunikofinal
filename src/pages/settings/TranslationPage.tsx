import { motion } from "framer-motion";
import { ArrowLeft, Languages, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const TranslationPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  useAppSettings();

  const toggleTranslate = (value: boolean) => {
    updateSettings.mutate({ auto_translate: value } as any);
    toast.success(t("translation.updated"));
  };

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="glass border-b border-border/40 px-4 pt-10 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold font-display text-foreground">{t("translation.title")}</h1>
      </div>
      <div className="px-5 pt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Languages className="w-5 h-5 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{t("translation.auto")}</p>
            <p className="text-xs text-muted-foreground">{t("translation.auto_desc")}</p>
          </div>
          <Switch checked={settings?.auto_translate ?? false} onCheckedChange={toggleTranslate} />
        </motion.div>
        {settings?.auto_translate && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">{t("translation.target")}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              → <span className="font-semibold text-primary">{settings?.language?.toUpperCase()}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TranslationPage;
