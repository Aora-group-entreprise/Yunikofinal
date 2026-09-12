import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

interface UserProfile {
  user_id: string;
  pseudo: string;
  avatar_url: string | null;
  status: string | null;
  last_seen: string | null;
  isFriend: boolean;
}

const FriendsPage = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  useAppSettings();

  useEffect(() => { if (user) loadFriends(); }, [user]);
  useEffect(() => { if (search.trim().length >= 2) searchUsers(); else setResults([]); }, [search]);

  const loadFriends = async () => {
    if (!user) return;
    const { data } = await supabase.from("friendships").select("user_id, friend_id").or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq("status", "accepted");
    const friendIds = data?.map(f => f.user_id === user.id ? f.friend_id : f.user_id) || [];
    if (friendIds.length === 0) { setFriends([]); return; }
    const { data: profiles } = await supabase.from("profiles").select("user_id, pseudo, avatar_url, status, last_seen").in("user_id", friendIds);
    setFriends(profiles?.map((p: any) => ({ ...p, isFriend: true })) || []);
  };

  const searchUsers = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("user_id, pseudo, avatar_url, status, last_seen").ilike("pseudo", `%${search}%`).neq("user_id", user.id).limit(10);
    const { data: friendships } = await supabase.from("friendships").select("friend_id, user_id").or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    const friendSet = new Set(friendships?.map(f => f.user_id === user.id ? f.friend_id : f.user_id) || []);
    setResults(data?.map((p: any) => ({ ...p, isFriend: friendSet.has(p.user_id) })) || []);
  };

  const addFriend = async (friendId: string) => {
    if (!user) return;
    const { error } = await supabase.from("friendships").insert({ user_id: user.id, friend_id: friendId, status: "accepted" });
    if (error) { toast.error(t("common.error")); return; }
    toast.success(t("friends.added"));
    setResults(prev => prev.map(r => r.user_id === friendId ? { ...r, isFriend: true } : r));
    loadFriends();
  };

  const isOnline = (p: UserProfile) => p.last_seen ? (Date.now() - new Date(p.last_seen).getTime()) < 5 * 60 * 1000 : false;

  const displayList = search.trim().length >= 2 ? results : friends;

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold font-display text-foreground">
          {search.trim().length >= 2 ? t("friends.search_title") : t("friends.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {search.trim().length >= 2 ? `${results.length} ${t("friends.results")}` : `${friends.length} ${t("friends.count")}`}
        </p>
      </div>
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={t("friends.search_placeholder")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm shadow-sm" />
        </div>
      </div>
      <BannerAd className="mx-5 mb-4" />
      <div className="px-5 space-y-2">
        {displayList.map((p, i) => (
          <motion.div key={p.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-card border border-border/60 rounded-xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
            <div className="relative cursor-pointer" onClick={() => navigate(`/user/${p.user_id}`)}>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-primary overflow-hidden">
                {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : p.pseudo.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${isOnline(p) ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/user/${p.user_id}`)}>
              <p className="font-semibold text-foreground text-sm">{p.pseudo}</p>
              <p className={`text-xs ${isOnline(p) ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                {isOnline(p) ? t("friends.online") : t("friends.offline")}
              </p>
            </div>
            {p.isFriend ? (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(`/chat?user=${p.user_id}`)} className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/30">
                <MessageCircle className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => addFriend(p.user_id)} className="p-2.5 rounded-xl gradient-primary text-primary-foreground glow-primary">
                <UserPlus className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        ))}
        {displayList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {search.trim().length >= 2 ? t("friends.no_results") : t("friends.empty")}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default FriendsPage;
