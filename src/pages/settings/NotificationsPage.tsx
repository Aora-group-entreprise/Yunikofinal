import { motion } from "framer-motion";
import { ArrowLeft, Bell, Heart, Volume2, Vibrate } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  useAppSettings();

  const toggle = (key: string, value: boolean) => {
    updateSettings.mutate({ [key]: value } as any);
  };

  const items = [
    { key: "notif_messages", icon: Bell, label: t("notif_settings.messages"), desc: t("notif_settings.messages_desc") },
    { key: "notif_likes", icon: Heart, label: t("notif_settings.likes"), desc: t("notif_settings.likes_desc") },
    { key: "notif_sounds", icon: Volume2, label: t("notif_settings.sounds"), desc: t("notif_settings.sounds_desc") },
    { key: "notif_vibration", icon: Vibrate, label: t("notif_settings.vibration"), desc: t("notif_settings.vibration_desc") },
  ];

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="glass border-b border-border/40 px-4 pt-10 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold font-display text-foreground">{t("notif_settings.title")}</h1>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {items.map((item, i) => (
          <motion.div key={item.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><item.icon className="w-5 h-5 text-primary" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch checked={settings?.[item.key as keyof typeof settings] as boolean ?? true} onCheckedChange={(v) => toggle(item.key, v)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
