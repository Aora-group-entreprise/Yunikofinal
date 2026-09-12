import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Image, Send, X, Plus, Newspaper } from "lucide-react";
import ReportButton from "@/components/ReportButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profile?: { pseudo: string; avatar_url: string | null };
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { pseudo: string; avatar_url: string | null };
}

const FeedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useAppSettings();

  const [showCreate, setShowCreate] = useState(searchParams.get("create") === "1");
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!user) return [];
      const { data: postsData } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
      if (!postsData) return [];
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, pseudo, avatar_url").in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const postIds = postsData.map(p => p.id);
      const { data: likes } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds);
      const { data: commentCounts } = await supabase.from("post_comments").select("post_id").in("post_id", postIds);
      const likesMap = new Map<string, { count: number; mine: boolean }>();
      for (const l of likes || []) {
        const e = likesMap.get(l.post_id) || { count: 0, mine: false };
        e.count++;
        if (l.user_id === user.id) e.mine = true;
        likesMap.set(l.post_id, e);
      }
      const commentsMap = new Map<string, number>();
      for (const c of commentCounts || []) {
        commentsMap.set(c.post_id, (commentsMap.get(c.post_id) || 0) + 1);
      }
      return postsData.map(p => ({
        ...p,
        profile: profileMap.get(p.user_id) || { pseudo: "User", avatar_url: null },
        likes_count: likesMap.get(p.id)?.count || 0,
        comments_count: commentsMap.get(p.id) || 0,
        liked_by_me: likesMap.get(p.id)?.mine || false,
      })) as Post[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    const channel = supabase.channel("feed-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const handleCreatePost = async () => {
    if (!user || !newContent.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({ user_id: user.id, content: newContent.trim() });
    setPosting(false);
    if (error) { toast.error(t("common.error")); return; }
    setNewContent("");
    setShowCreate(false);
    toast.success(t("feed.posted"));
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase.from("post_comments").select("*").eq("post_id", postId).order("created_at");
    if (!data) return;
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, pseudo, avatar_url").in("user_id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    setComments(data.map(c => ({ ...c, profile: profileMap.get(c.user_id) || { pseudo: "User", avatar_url: null } })));
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, content: commentText.trim() });
    setCommentText("");
    loadComments(postId);
    refetch();
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      await navigator.share({ title: "Yusheng", text: post.content });
    } else {
      await navigator.clipboard.writeText(post.content);
      toast.success(t("feed.copied"));
    }
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return t("feed.just_now");
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  return (
    <div className="min-h-screen gradient-bg pb-16">
      <div className="px-4 sm:px-6 pt-10 sm:pt-12 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">{t("feed.title")}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("feed.subtitle")}</p>
      </div>

      <div className="px-4 sm:px-6 mb-3 flex gap-2 sm:gap-3">
        <button onClick={() => {}} className="flex-1 bg-primary/10 border border-primary/20 rounded-xl py-2.5 sm:py-3 flex items-center justify-center gap-2 hover:bg-primary/20 transition-all">
          <Newspaper className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-primary">{t("feed.publications")}</span>
        </button>
        <button onClick={() => setShowCreate(true)} className="flex-1 gradient-primary rounded-xl py-2.5 sm:py-3 flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-all active:scale-[0.97]">
          <Plus className="w-4 h-4 text-primary-foreground" />
          <span className="text-xs sm:text-sm font-medium text-primary-foreground">{t("feed.create")}</span>
        </button>
      </div>

      <BannerAd className="mx-4 sm:mx-6 mb-3" />

      <div className="px-4 sm:px-6 space-y-3">
        {posts.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">{t("feed.empty")}</div>}
        {posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-primary overflow-hidden cursor-pointer"
                onClick={() => navigate(`/user/${post.user_id}`)}>
                {post.profile?.avatar_url ? <img src={post.profile.avatar_url} alt="" className="w-full h-full object-cover" /> : post.profile?.pseudo?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/user/${post.user_id}`)}>
                <p className="text-sm font-semibold text-foreground">{post.profile?.pseudo}</p>
                <p className="text-[10px] text-muted-foreground">{timeAgo(post.created_at)}</p>
              </div>
              {post.user_id !== user?.id && (
                <ReportButton contentType="post" contentId={post.id} reportedUserId={post.user_id} />
              )}
            </div>
            <div className="px-4 pb-3">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.image_url && <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />}
            <div className="px-4 py-3 border-t border-border/40 flex items-center gap-6">
              <button onClick={() => handleLike(post.id, post.liked_by_me)} className="flex items-center gap-1.5 group">
                <Heart className={`w-5 h-5 transition-colors ${post.liked_by_me ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-destructive"}`} />
                <span className="text-xs text-muted-foreground">{post.likes_count || ""}</span>
              </button>
              <button onClick={() => { setCommentingPostId(post.id); loadComments(post.id); }} className="flex items-center gap-1.5 group">
                <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground">{post.comments_count || ""}</span>
              </button>
              <button onClick={() => handleShare(post)} className="group">
                <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </motion.div>
        ))}
        {posts.length > 4 && <BannerAd className="my-2" />}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className="w-full max-w-lg bg-card rounded-t-3xl p-5 pb-8 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display text-foreground">{t("feed.new_post")}</h2>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder={t("feed.placeholder")}
                className="w-full h-32 bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <div className="flex items-center justify-between mt-4">
                <button className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  <Image className="w-5 h-5" />
                </button>
                <button onClick={handleCreatePost} disabled={posting || !newContent.trim()}
                  className="gradient-primary rounded-xl px-6 py-2.5 flex items-center gap-2 text-primary-foreground font-medium text-sm disabled:opacity-50 glow-primary hover:opacity-90 transition-all">
                  <Send className="w-4 h-4" />
                  {t("feed.publish")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {commentingPostId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className="w-full max-w-lg bg-card rounded-t-3xl p-5 pb-8 border-t border-border max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display text-foreground">{t("feed.comments")}</h2>
                <button onClick={() => setCommentingPostId(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide">
                {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("feed.no_comments")}</p>}
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-primary shrink-0 overflow-hidden cursor-pointer"
                      onClick={() => { setCommentingPostId(null); navigate(`/user/${c.user_id}`); }}>
                      {c.profile?.avatar_url ? <img src={c.profile.avatar_url} alt="" className="w-full h-full object-cover" /> : c.profile?.pseudo?.charAt(0).toUpperCase()}
                    </div>
                    <div className="bg-muted/50 rounded-xl px-3 py-2 flex-1">
                      <p className="text-xs font-semibold text-foreground">{c.profile?.pseudo}</p>
                      <p className="text-xs text-foreground mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={t("feed.comment_placeholder")}
                  onKeyDown={e => e.key === "Enter" && handleComment(commentingPostId)}
                  className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={() => handleComment(commentingPostId)} className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default FeedPage;
