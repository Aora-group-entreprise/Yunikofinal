import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import BannerAd from "@/components/BannerAd";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

interface Room {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();
  useAppSettings();

  useEffect(() => {
    const loadRooms = async () => {
      const { data } = await supabase.from("rooms").select("*").order("created_at");
      if (data) setRooms(data);
    };
    loadRooms();
  }, []);

  return (
    <div className="min-h-screen gradient-bg pb-16">
      <div className="px-4 sm:px-6 pt-10 sm:pt-12 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">{t("rooms.title")}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("rooms.subtitle")}</p>
      </div>

      {/* Publication buttons */}
      <div className="px-4 sm:px-6 mb-3 flex gap-2 sm:gap-3">
        <button onClick={() => navigate("/feed")} className="flex-1 bg-primary/10 border border-primary/20 rounded-xl py-2.5 sm:py-3 flex items-center justify-center gap-2 hover:bg-primary/20 transition-all">
          <Newspaper className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-primary">{t("feed.publications")}</span>
        </button>
        <button onClick={() => navigate("/feed?create=1")} className="flex-1 gradient-primary rounded-xl py-2.5 sm:py-3 flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-all active:scale-[0.97]">
          <Plus className="w-4 h-4 text-primary-foreground" />
          <span className="text-xs sm:text-sm font-medium text-primary-foreground">{t("feed.create")}</span>
        </button>
      </div>

      <BannerAd className="mx-4 sm:mx-6 mb-3" />
      <div className="px-4 sm:px-6 space-y-2.5">
        {rooms.map((room, i) => (
          <motion.button key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="w-full bg-card border border-border/60 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-lg hover:border-primary/30 active:scale-[0.98] transition-all shadow-sm">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl sm:text-2xl shrink-0">{room.icon}</div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground truncate">{room.name}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">{room.description}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          </motion.button>
        ))}
        {rooms.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">{t("rooms.loading")}</div>}
      </div>
      <BottomNav />
    </div>
  );
};

export default RoomsPage;
