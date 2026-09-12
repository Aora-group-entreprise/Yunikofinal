import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, EyeOff, Search, ArrowLeft, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { toast } from "sonner";

interface AnonMsg {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

const AnonymousMessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useAppSettings();

  const [tab, setTab] = useState<"received" | "send">("received");
  const [messages, setMessages] = useState<AnonMsg[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ user_id: string; pseudo: string; avatar_url: string | null }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ user_id: string; pseudo: string } | null>(null);
  const [msgText, setMsgText] = useState("");
  const [replyTo, setReplyTo] = useState<AnonMsg | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (!user) return;
    loadMessages();
    const channel = supabase.channel("anon-msgs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "anonymous_messages", filter: `receiver_id=eq.${user.id}` }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;
    const { data } = await supabase.from("anonymous_messages").select("*").eq("receiver_id", user.id).order("created_at", { ascending: false });
    if (data) setMessages(data);
    // Mark as read
    await supabase.from("anonymous_messages").update({ read: true }).eq("receiver_id", user.id).eq("read", false);
  };

  const searchUsers = async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.from("profiles").select("user_id, pseudo, avatar_url").ilike("pseudo", `%${q}%`).limit(10);
    setSearchResults((data || []).filter(p => p.user_id !== user?.id));
  };

  const sendAnonymous = async () => {
    if (!user || !selectedUser || !msgText.trim()) return;
    const { error } = await supabase.from("anonymous_messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser.user_id,
      content: msgText.trim(),
    });
    if (error) { toast.error(t("common.error")); return; }
    toast.success(t("anon.sent"));
    setMsgText("");
    setSelectedUser(null);
    setSearch("");
  };

  const sendReply = async () => {
    if (!user || !replyTo || !replyText.trim()) return;
    // Reply goes back to sender (but sender_id is still current user → anonymous reply)
    const { error } = await supabase.from("anonymous_messages").insert({
      sender_id: user.id,
      receiver_id: replyTo.sender_id,
      content: replyText.trim(),
    });
    if (error) { toast.error(t("common.error")); return; }
    toast.success(t("anon.replied"));
    setReplyText("");
    setReplyTo(null);
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return t("feed.just_now");
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">{t("anon.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("anon.subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4 flex gap-3">
        <button onClick={() => setTab("received")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "received" ? "gradient-primary text-primary-foreground glow-primary" : "bg-card border border-border text-foreground"}`}>
          {t("anon.received")} {messages.length > 0 && `(${messages.length})`}
        </button>
        <button onClick={() => setTab("send")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "send" ? "gradient-primary text-primary-foreground glow-primary" : "bg-card border border-border text-foreground"}`}>
          {t("anon.send")}
        </button>
      </div>

      <BannerAd className="mx-5 mb-4" />

      {tab === "received" && (
        <div className="px-5 space-y-3">
          {messages.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">{t("anon.empty")}</div>}
          {messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">{t("anon.anonymous")}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(msg.created_at)}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
              <button onClick={() => setReplyTo(msg)} className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> {t("anon.reply")}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "send" && (
        <div className="px-5">
          {!selectedUser ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={e => searchUsers(e.target.value)} placeholder={t("anon.search_user")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
              </div>
              <div className="space-y-2">
                {searchResults.map(u => (
                  <button key={u.user_id} onClick={() => setSelectedUser(u)}
                    className="w-full bg-card border border-border/60 rounded-xl p-3 flex items-center gap-3 hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-primary overflow-hidden">
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : u.pseudo.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{u.pseudo}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div>
              <div className="bg-card border border-border/60 rounded-xl p-4 mb-4 flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t("anon.sending_to")} {selectedUser.pseudo}</p>
                  <p className="text-xs text-muted-foreground">{t("anon.identity_hidden")}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-xs text-primary">{t("anon.change")}</button>
              </div>
              <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder={t("anon.message_placeholder")}
                className="w-full h-28 bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3" />
              <button onClick={sendAnonymous} disabled={!msgText.trim()}
                className="w-full gradient-primary rounded-xl py-3 flex items-center justify-center gap-2 text-primary-foreground font-medium text-sm glow-primary disabled:opacity-50 hover:opacity-90 transition-all">
                <Send className="w-4 h-4" /> {t("anon.send_anonymous")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {replyTo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className="w-full max-w-lg bg-card rounded-t-3xl p-5 pb-8 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display text-foreground">{t("anon.reply_anonymous")}</h2>
                <button onClick={() => setReplyTo(null)}><span className="text-muted-foreground text-xl">×</span></button>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 mb-3 text-xs text-muted-foreground italic">"{replyTo.content}"</div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={t("anon.reply_placeholder")}
                className="w-full h-24 bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3" />
              <button onClick={sendReply} disabled={!replyText.trim()}
                className="w-full gradient-primary rounded-xl py-3 flex items-center justify-center gap-2 text-primary-foreground font-medium text-sm glow-primary disabled:opacity-50">
                <Send className="w-4 h-4" /> {t("anon.send_reply")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default AnonymousMessagesPage;
