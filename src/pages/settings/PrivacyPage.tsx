import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Users, ShieldBan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const PrivacyPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  useAppSettings();

  const visibilityOptions = [
    { value: "everyone", label: t("privacy.everyone"), icon: Eye },
    { value: "friends", label: t("privacy.friends_only"), icon: Users },
    { value: "nobody", label: t("privacy.nobody"), icon: EyeOff },
  ];

  const setVisibility = (value: string) => {
    updateSettings.mutate({ profile_visibility: value } as any);
    toast.success(t("privacy.updated"));
  };

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="glass border-b border-border/40 px-4 pt-10 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold font-display text-foreground">{t("privacy.title")}</h1>
      </div>
      <div className="px-5 pt-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">{t("privacy.visibility")}</p>
        {visibilityOptions.map((opt, i) => (
          <motion.button key={opt.value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setVisibility(opt.value)}
            className={`w-full bg-card border rounded-xl p-4 flex items-center gap-3 shadow-sm transition-all ${settings?.profile_visibility === opt.value ? "border-primary/50 ring-2 ring-primary/20" : "border-border/60"}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${settings?.profile_visibility === opt.value ? "bg-primary/20" : "bg-muted"}`}>
              <opt.icon className={`w-5 h-5 ${settings?.profile_visibility === opt.value ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <p className="text-sm font-medium text-foreground">{opt.label}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPage;
