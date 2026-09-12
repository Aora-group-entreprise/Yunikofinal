import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Smile } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import BannerAd from "@/components/BannerAd";
import ReportButton from "@/components/ReportButton";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

interface RoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  translated_content: string | null;
  created_at: string;
  pseudo?: string;
  avatar_url?: string | null;
  showOriginal?: boolean;
}

const EMOJI_LIST = ["😀","😂","❤️","🔥","👍","😍","🥺","😭","🤔","💯","✨","🎉","😎","🙏","💀"];

const RoomChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomIcon, setRoomIcon] = useState("🌍");
  const [showEmojis, setShowEmojis] = useState(false);
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileCache = useRef<Map<string, { pseudo: string; avatar_url: string | null }>>(new Map());
  useAppSettings();

  useEffect(() => {
    if (!roomId || !user) return;
    loadRoom();
    loadMessages();
    const channel = supabase.channel(`room-${roomId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "room_messages", filter: `room_id=eq.${roomId}` }, async (payload) => {
      const newMsg = payload.new as RoomMessage;
      const profile = await getProfile(newMsg.user_id);
      const translated = settings?.auto_translate && newMsg.user_id !== user.id ? await translateText(newMsg.content) : null;
      setMessages(prev => [...prev, { ...newMsg, ...profile, translated_content: translated }]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, user]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadRoom = async () => {
    if (!roomId) return;
    const { data } = await supabase.from("rooms").select("name, icon").eq("id", roomId).single();
    if (data) { setRoomName(data.name); setRoomIcon(data.icon); }
  };

  const getProfile = async (userId: string) => {
    if (profileCache.current.has(userId)) return profileCache.current.get(userId)!;
    const { data } = await supabase.from("profiles").select("pseudo, avatar_url").eq("user_id", userId).single();
    const profile = { pseudo: data?.pseudo || "User", avatar_url: data?.avatar_url || null };
    profileCache.current.set(userId, profile);
    return profile;
  };

  const translateText = async (text: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("translate", { body: { text, targetLang: settings?.translate_target || settings?.language || "fr" } });
      if (error) return null;
      return data?.translated || null;
    } catch { return null; }
  };

  const loadMessages = async () => {
    if (!roomId) return;
    const { data } = await supabase.from("room_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }).limit(100);
    if (!data) return;
    const enriched = await Promise.all(data.map(async (msg) => {
      const profile = await getProfile(msg.user_id);
      let translated = msg.translated_content;
      if (settings?.auto_translate && msg.user_id !== user?.id && !translated) translated = await translateText(msg.content);
      return { ...msg, ...profile, translated_content: translated };
    }));
    setMessages(enriched);
  };

  const handleSend = async () => {
    if (!message.trim() || !user || !roomId) return;
    const content = message.trim();
    setMessage("");
    setShowEmojis(false);
    const { error } = await supabase.from("room_messages").insert({ room_id: roomId, user_id: user.id, content });
    if (error) toast.error(t("rooms.send_error"));
  };

  const toggleOriginal = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, showOriginal: !m.showOriginal } : m));
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <div className="glass border-b border-border/40 px-4 pt-10 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/rooms")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">{roomIcon}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{roomName}</p>
          <p className="text-[10px] text-primary font-medium">{t("rooms.public_room")}</p>
        </div>
      </div>
      <BannerAd className="mx-4 mt-2" />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        {messages.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">{t("rooms.first_message")}</div>}
        {messages.map((msg) => {
          const isMe = msg.user_id === user?.id;
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-primary overflow-hidden">
                      {msg.avatar_url ? <img src={msg.avatar_url} alt="" className="w-full h-full object-cover" /> : (msg.pseudo || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-medium text-primary">{msg.pseudo}</span>
                  </div>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? "gradient-primary text-primary-foreground rounded-br-md glow-primary" : "bg-card border border-border/60 text-foreground rounded-bl-md"}`}>
                  {msg.translated_content && !isMe && !msg.showOriginal ? (
                    <div>
                      <span>{msg.translated_content}</span>
                      <button onClick={() => toggleOriginal(msg.id)} className="block text-[10px] opacity-60 mt-1 italic underline">{t("translation.view_original")}</button>
                    </div>
                  ) : msg.showOriginal && msg.translated_content && !isMe ? (
                    <div>
                      <span>{msg.content}</span>
                      <button onClick={() => toggleOriginal(msg.id)} className="block text-[10px] opacity-60 mt-1 italic underline">↩</button>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {!isMe && <ReportButton contentType="room_message" contentId={msg.id} reportedUserId={msg.user_id} />}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      {showEmojis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass border-t border-border/40 px-4 py-2 flex flex-wrap gap-2">
          {EMOJI_LIST.map(e => (
            <button key={e} onClick={() => { setMessage(prev => prev + e); setShowEmojis(false); }} className="text-xl hover:scale-125 transition-transform">{e}</button>
          ))}
        </motion.div>
      )}
      <div className="glass border-t border-border/40 px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("rooms.input_placeholder")}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all shadow-sm" />
            <button onClick={() => setShowEmojis(!showEmojis)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><Smile className="w-4 h-4" /></button>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} className="p-2.5 rounded-xl gradient-primary text-primary-foreground glow-primary shadow-md"><Send className="w-4 h-4" /></motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoomChatPage;
