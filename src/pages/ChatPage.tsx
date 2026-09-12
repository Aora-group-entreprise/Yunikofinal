import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, Send, Smile, Mic, Heart, ThumbsUp, Image, Copy, Play, X } from "lucide-react";
import CallModal from "@/components/CallModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
  reactions: string[];
  message_type: string;
  media_url: string | null;
}

const EMOJI_LIST = ["😀","😂","❤️","🔥","👍","😍","🥺","😭","🤔","💯","✨","🎉","😎","🙏","💀"];

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ pseudo: string; avatar_url: string | null; last_seen: string | null } | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatUserId = searchParams.get("user");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const isOnline = otherUser?.last_seen
    ? (Date.now() - new Date(otherUser.last_seen).getTime()) < 5 * 60 * 1000
    : false;

  useEffect(() => {
    if (!user || !chatUserId) return;
    loadOtherUser();
    loadMessages();
    markAsRead();
    const channel = supabase.channel("chat-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${chatUserId}` }, (payload) => {
        const newMsg = payload.new as any;
        if (newMsg.receiver_id === user.id) {
          setMessages(prev => [...prev, { ...newMsg, reactions: [] }]);
          supabase.from("messages").update({ read: true }).eq("id", newMsg.id).then();
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, chatUserId]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadOtherUser = async () => {
    if (!chatUserId) return;
    const { data } = await supabase.from("profiles").select("pseudo, avatar_url, last_seen").eq("user_id", chatUserId).single();
    if (data) setOtherUser(data as any);
  };

  const loadMessages = async () => {
    if (!user || !chatUserId) return;
    const { data } = await supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatUserId}),and(sender_id.eq.${chatUserId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    if (!data) return;
    const msgIds = data.map(m => m.id);
    const { data: reactions } = msgIds.length > 0
      ? await supabase.from("message_reactions").select("*").in("message_id", msgIds)
      : { data: [] };
    const reactionMap = new Map<string, string[]>();
    reactions?.forEach(r => { const arr = reactionMap.get(r.message_id) || []; arr.push(r.emoji); reactionMap.set(r.message_id, arr); });
    setMessages(data.map(m => ({ ...m, reactions: reactionMap.get(m.id) || [], message_type: m.message_type || "text", media_url: m.media_url || null })));
  };

  const markAsRead = async () => {
    if (!user || !chatUserId) return;
    await supabase.from("messages").update({ read: true }).eq("sender_id", chatUserId).eq("receiver_id", user.id).eq("read", false);
  };

  const handleSend = async () => {
    if (!message.trim() || !user || !chatUserId) return;
    const content = message.trim();
    setMessage("");
    setShowEmojis(false);
    const { data } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: chatUserId, content, message_type: "text" }).select().single();
    if (data) setMessages(prev => [...prev, { ...data, reactions: [], message_type: "text", media_url: null }]);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !chatUserId) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) { toast.error("Format non supporté"); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erreur d'upload"); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const msgType = isVideo ? "video" : "image";
    const { data } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: chatUserId, content: isVideo ? "📹 Vidéo" : "📷 Photo", message_type: msgType, media_url: publicUrl }).select().single();
    if (data) setMessages(prev => [...prev, { ...data, reactions: [], message_type: msgType, media_url: publicUrl }]);
    toast.success(`${isVideo ? "Vidéo" : "Photo"} envoyée ✓`);
  };

  const toggleReaction = async (msgId: string, emoji: string) => {
    if (!user) return;
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    if (msg.reactions.includes(emoji)) {
      await supabase.from("message_reactions").delete().eq("message_id", msgId).eq("user_id", user.id).eq("emoji", emoji);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: m.reactions.filter(r => r !== emoji) } : m));
    } else {
      await supabase.from("message_reactions").insert({ message_id: msgId, user_id: user.id, emoji });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: [...m.reactions, emoji] } : m));
    }
  };

  const copyMessage = (content: string) => { navigator.clipboard.writeText(content); toast.success("Copié ✓"); };

  const renderMessageContent = (msg: Message) => {
    if (msg.message_type === "image" && msg.media_url) {
      return <div className="cursor-pointer" onClick={() => setPreviewMedia(msg.media_url)}><img src={msg.media_url} alt="" className="max-w-[200px] rounded-lg" /></div>;
    }
    if (msg.message_type === "video" && msg.media_url) {
      return (
        <div className="relative cursor-pointer" onClick={() => setPreviewMedia(msg.media_url)}>
          <video src={msg.media_url} className="max-w-[200px] rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 rounded-lg"><Play className="w-8 h-8 text-primary-foreground" /></div>
        </div>
      );
    }
    return <span>{msg.content}</span>;
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col pb-20">
      {/* Header */}
      <div className="glass border-b border-border/40 px-4 pt-10 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/inbox")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative cursor-pointer" onClick={() => chatUserId && navigate(`/user/${chatUserId}`)}>
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-primary overflow-hidden">
            {otherUser?.avatar_url ? <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" /> : (otherUser?.pseudo || "?").charAt(0).toUpperCase()}
          </div>
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${isOnline ? "bg-green-500" : "bg-muted-foreground/40"}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{otherUser?.pseudo || "..."}</p>
          <p className={`text-[10px] font-medium ${isOnline ? "text-green-600" : "text-muted-foreground"}`}>
            {isOnline ? "En ligne" : "Hors ligne"}
          </p>
        </div>
        <button onClick={() => { setCallType("audio"); setCallOpen(true); }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Phone className="w-4 h-4" /></button>
        <button onClick={() => { setCallType("video"); setCallOpen(true); }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Video className="w-4 h-4" /></button>
      </div>

      <BannerAd className="mx-4 mt-2" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        {messages.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">Aucun message. Dites bonjour ! 👋</div>}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? "gradient-primary text-primary-foreground rounded-br-md glow-primary" : "bg-card border border-border/60 text-foreground rounded-bl-md"}`}>
                  {renderMessageContent(msg)}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                  {msg.reactions.map((r, j) => <span key={j} className="text-xs">{r}</span>)}
                  <div className="flex gap-0.5 ml-1">
                    <button onClick={() => toggleReaction(msg.id, "❤️")} className="hover:scale-125 transition-transform"><Heart className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
                    <button onClick={() => toggleReaction(msg.id, "👍")} className="hover:scale-125 transition-transform"><ThumbsUp className="w-3 h-3 text-muted-foreground hover:text-primary" /></button>
                    <button onClick={() => copyMessage(msg.content)} className="hover:scale-125 transition-transform"><Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass border-t border-border/40 px-4 py-2 flex flex-wrap gap-2">
          {EMOJI_LIST.map(e => (
            <button key={e} onClick={() => { setMessage(prev => prev + e); setShowEmojis(false); }} className="text-xl hover:scale-125 transition-transform">{e}</button>
          ))}
        </motion.div>
      )}

      {/* Input */}
      <div className="glass border-t border-border/40 px-3 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => mediaInputRef.current?.click()} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Image className="w-5 h-5" /></button>
          <input ref={mediaInputRef} type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
          <div className="flex-1 relative">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Écrire un message..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all shadow-sm" />
            <button onClick={() => setShowEmojis(!showEmojis)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><Smile className="w-4 h-4" /></button>
          </div>
          <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Mic className="w-5 h-5" /></button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} className="p-2.5 rounded-xl gradient-primary text-primary-foreground glow-primary shadow-md"><Send className="w-4 h-4" /></motion.button>
        </div>
      </div>

      {/* Media preview modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewMedia(null)}>
          <button className="absolute top-10 right-4 text-primary-foreground bg-foreground/40 rounded-full p-2"><X className="w-5 h-5" /></button>
          {previewMedia.match(/\.(mp4|webm|mov)/) ? <video src={previewMedia} controls autoPlay className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" /> : <img src={previewMedia} alt="" className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" />}
        </div>
      )}

      <CallModal isOpen={callOpen} onClose={() => setCallOpen(false)} otherUser={otherUser} callType={callType} />
      <BottomNav />
    </div>
  );
};

export default ChatPage;
