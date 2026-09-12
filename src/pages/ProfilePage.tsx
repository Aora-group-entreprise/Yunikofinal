import { useRef } from "react";
import { motion } from "framer-motion";
import { Settings, LogOut, Shield, Bell, Moon, ChevronRight, Sparkles, Camera, Globe, Languages, Newspaper, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  useAppSettings();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(t("profile.upload_error")); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success(t("profile.avatar_updated"));
  };

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  const menuItems = [
    { icon: Newspaper, label: t("profile.menu.feed"), desc: t("profile.menu.feed_desc"), route: "/feed" },
    { icon: EyeOff, label: t("profile.menu.anonymous"), desc: t("profile.menu.anonymous_desc"), route: "/anonymous" },
    { icon: Bell, label: t("profile.menu.notifications"), desc: t("profile.menu.notifications_desc"), route: "/settings/notifications" },
    { icon: Shield, label: t("profile.menu.privacy"), desc: t("profile.menu.privacy_desc"), route: "/settings/privacy" },
    { icon: Moon, label: t("profile.menu.appearance"), desc: t("profile.menu.appearance_desc"), route: "/settings/appearance" },
    { icon: Globe, label: t("profile.menu.language"), desc: t("profile.menu.language_desc"), route: "/settings/language" },
    { icon: Languages, label: t("profile.menu.translation"), desc: t("profile.menu.translation_desc"), route: "/settings/translation" },
    { icon: Settings, label: t("profile.menu.settings"), desc: t("profile.menu.settings_desc"), route: "/settings/advanced" },
  ];

  return (
    <div className="min-h-screen gradient-bg pb-16">
      <div className="px-4 sm:px-6 pt-10 sm:pt-12 pb-5 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center glow-primary shadow-lg overflow-hidden">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <Sparkles className="w-10 h-10 text-primary-foreground" />}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors">
            <Camera className="w-3.5 h-3.5 text-foreground" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </motion.div>
        <h1 className="text-xl font-bold font-display text-foreground">{profile?.pseudo || t("profile.user")}</h1>
        <p className="text-sm text-primary font-medium mt-1">{t("profile.online")}</p>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>
      <BannerAd className="mx-5 mb-4" />
      <div className="px-5 space-y-2">
        {menuItems.map((item, i) => (
          <motion.button key={item.route} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => navigate(item.route)}
            className="w-full bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition-all shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><item.icon className="w-5 h-5 text-primary" /></div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        ))}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} onClick={handleSignOut}
          className="w-full bg-card border border-destructive/20 rounded-xl p-4 flex items-center gap-3 hover:bg-destructive/5 active:scale-[0.98] transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><LogOut className="w-5 h-5 text-destructive" /></div>
          <p className="text-sm font-medium text-destructive">{t("profile.signout")}</p>
        </motion.button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
