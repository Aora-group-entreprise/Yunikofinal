import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, MessageCircle, Users, Check, Heart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

const NotificationsListPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  useAppSettings();

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const channel = supabase.channel("notifications-realtime").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
      setNotifications(prev => [payload.new as Notification, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (data) setNotifications(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClick = (notif: Notification) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageCircle className="w-5 h-5 text-primary" />;
      case "room": return <Users className="w-5 h-5 text-accent" />;
      case "like": return <Heart className="w-5 h-5 text-destructive" />;
      case "anonymous": return <Eye className="w-5 h-5 text-muted-foreground" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">{t("notifs.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} ${t("notifs.unread")}` : t("notifs.all_read")}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs text-primary font-medium px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Check className="w-3 h-3" /> {t("notifs.mark_all")}
          </button>
        )}
      </div>
      <BannerAd className="mx-5 mb-4" />
      <div className="px-5 space-y-2">
        {notifications.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">{t("notifs.empty")}</div>}
        {notifications.map((notif, i) => (
          <motion.button key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => handleClick(notif)}
            className={`w-full text-left bg-card border rounded-xl p-4 flex items-start gap-3 transition-all shadow-sm hover:shadow-md ${notif.read ? "border-border/60 opacity-70" : "border-primary/30 bg-primary/[0.03]"}`}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">{getIcon(notif.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${notif.read ? "text-foreground" : "text-foreground font-semibold"}`}>{notif.title}</p>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />}
              </div>
              {notif.body && <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.body}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(notif.created_at).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default NotificationsListPage;
