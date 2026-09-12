import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, EyeOff, UserPlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  useAppSettings();

  const { data: profile } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
      return data;
    },
    enabled: !!userId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase.from("posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: isFriend } = useQuery({
    queryKey: ["is-friend", userId],
    queryFn: async () => {
      if (!user || !userId) return false;
      const { data } = await supabase.from("friendships").select("id")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .eq("status", "accepted").limit(1);
      return (data?.length || 0) > 0;
    },
    enabled: !!user && !!userId,
  });

  const isOnline = profile?.last_seen
    ? (Date.now() - new Date(profile.last_seen as string).getTime()) < 5 * 60 * 1000
    : false;

  const addFriend = async () => {
    if (!user || !userId) return;
    await supabase.from("friendships").insert({ user_id: user.id, friend_id: userId, status: "accepted" });
    toast.success(t("friends.added"));
  };

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="px-5 pt-10 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{t("profile.title") || "Profile"}</h1>
      </div>

      <div className="px-5 pt-4 pb-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center glow-primary shadow-lg overflow-hidden">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            : <span className="text-3xl font-bold text-primary-foreground">{(profile?.pseudo || "?").charAt(0).toUpperCase()}</span>}
        </motion.div>
        <h2 className="text-xl font-bold text-foreground">{profile?.pseudo || "..."}</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-muted-foreground/40"}`} />
          <span className={`text-xs font-medium ${isOnline ? "text-green-600" : "text-muted-foreground"}`}>
            {isOnline ? t("friends.online") : t("friends.offline")}
          </span>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="px-5 mb-4 flex gap-3">
          <button onClick={() => navigate(`/chat?user=${userId}`)}
            className="flex-1 bg-primary/10 border border-primary/20 rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-primary/20 transition-all">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("inbox.title")}</span>
          </button>
          <button onClick={() => navigate(`/anonymous?to=${userId}`)}
            className="flex-1 bg-muted border border-border rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-muted/80 transition-all">
            <EyeOff className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t("profile.menu.anonymous")}</span>
          </button>
          {!isFriend && (
            <button onClick={addFriend}
              className="px-4 gradient-primary rounded-xl py-3 flex items-center justify-center gap-2 glow-primary">
              <UserPlus className="w-4 h-4 text-primary-foreground" />
            </button>
          )}
        </div>
      )}

      <BannerAd className="mx-5 mb-4" />

      <div className="px-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t("feed.publications")} ({posts.length})</h3>
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
              {post.image_url && <img src={post.image_url} alt="" className="mt-2 rounded-lg max-h-48 object-cover w-full" />}
              <p className="text-[10px] text-muted-foreground mt-2">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {posts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t("feed.empty")}</p>}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default UserProfilePage;
