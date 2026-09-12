import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

interface Conversation {
  userId: string;
  pseudo: string;
  avatarUrl: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

const InboxPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  useAppSettings();

  useEffect(() => {
    if (!user) return;
    loadConversations();
    const channel = supabase.channel("inbox-realtime").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => { loadConversations(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    const { data: messages } = await supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false });
    if (!messages) return;
    const convMap = new Map<string, { lastMsg: typeof messages[0]; unread: number }>();
    for (const msg of messages) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(otherId)) convMap.set(otherId, { lastMsg: msg, unread: 0 });
      if (msg.receiver_id === user.id && !msg.read) { const entry = convMap.get(otherId)!; entry.unread += 1; }
    }
    const userIds = Array.from(convMap.keys());
    if (userIds.length === 0) { setConversations([]); return; }
    const { data: profiles } = await supabase.from("profiles").select("user_id, pseudo, avatar_url, last_seen").in("user_id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    const convs: Conversation[] = userIds.map(uid => {
      const entry = convMap.get(uid)!;
      const profile = profileMap.get(uid);
      const lastSeen = (profile as any)?.last_seen;
      const isOnline = lastSeen ? (Date.now() - new Date(lastSeen).getTime()) < 5 * 60 * 1000 : false;
      return { userId: uid, pseudo: profile?.pseudo || "User", avatarUrl: profile?.avatar_url || null, lastMessage: entry.lastMsg.content, lastMessageTime: new Date(entry.lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), unreadCount: entry.unread, isOnline };
    });
    setConversations(convs);
  };

  const filtered = conversations.filter(c => c.pseudo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen gradient-bg pb-16">
      <div className="px-4 sm:px-6 pt-10 sm:pt-12 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">{t("inbox.title")}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{conversations.length} {t("inbox.conversations")}</p>
      </div>
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={t("inbox.search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm shadow-sm" />
        </div>
      </div>
      <BannerAd className="mx-5 mb-4" />
      <div className="px-5 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {conversations.length === 0 ? t("inbox.empty") : t("inbox.no_results")}
          </div>
        )}
        {filtered.map((conv, i) => (
          <motion.div key={conv.userId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/chat?user=${conv.userId}`)}
            className="bg-card border border-border/60 rounded-xl p-3.5 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition-all shadow-sm">
            <div className="relative" onClick={(e) => { e.stopPropagation(); navigate(`/user/${conv.userId}`); }}>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-primary shrink-0 overflow-hidden cursor-pointer">
                {conv.avatarUrl ? <img src={conv.avatarUrl} alt="" className="w-full h-full object-cover" /> : conv.pseudo.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${conv.isOnline ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">{conv.pseudo}</span>
                <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
            </div>
            {conv.unreadCount > 0 && (
              <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-primary-foreground">{conv.unreadCount}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default InboxPage;
