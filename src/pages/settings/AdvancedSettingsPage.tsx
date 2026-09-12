import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Trash2, RotateCcw, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const AdvancedSettingsPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { updateSettings } = useSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  useAppSettings();

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  const handleResetPrefs = () => {
    updateSettings.mutate({
      notif_messages: true, notif_likes: true, notif_sounds: true, notif_vibration: true,
      profile_visibility: "everyone", theme: "light-futuristic", accent_color: "cyan",
      language: "fr", auto_translate: false, translate_target: "fr",
    } as any);
  };

  const items = [
    { icon: Users, label: t("advanced.multi_accounts"), desc: t("advanced.multi_desc"), color: "primary", action: () => { signOut(); navigate("/auth"); } },
    { icon: RotateCcw, label: "Reset", desc: t("advanced.multi_desc"), color: "primary", action: handleResetPrefs },
    { icon: LogOut, label: t("profile.signout"), desc: "", color: "destructive", action: handleSignOut },
  ];

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="glass border-b border-border/40 px-4 pt-10 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold font-display text-foreground">{t("advanced.title")}</h1>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {items.map((item, i) => (
          <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={item.action}
            className={`w-full bg-card border rounded-xl p-4 flex items-center gap-3 shadow-sm transition-all active:scale-[0.98] ${item.color === "destructive" ? "border-destructive/20 hover:bg-destructive/5" : "border-border/60 hover:border-primary/20"}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color === "destructive" ? "bg-destructive/10" : "bg-primary/10"}`}>
              <item.icon className={`w-5 h-5 ${item.color === "destructive" ? "text-destructive" : "text-primary"}`} />
            </div>
            <div className="text-left flex-1">
              <p className={`text-sm font-medium ${item.color === "destructive" ? "text-destructive" : "text-foreground"}`}>{item.label}</p>
              {item.desc && <p className="text-xs text-muted-foreground">{item.desc}</p>}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AdvancedSettingsPage;
