import { Inbox, UserPlus, User, Globe, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { useAppSettings } from "@/providers/AppSettingsProvider";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useUnreadNotifications();
  useAppSettings();

  const navItems = [
    { icon: Inbox, path: "/inbox" },
    { icon: UserPlus, path: "/friends" },
    { icon: Globe, path: "/rooms", center: true },
    { icon: Bell, path: "/notifications" },
    { icon: User, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass border-t border-border/40 px-4 py-2.5 safe-area-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            const isCenter = item.center;

            if (isCenter) {
              return (
                <button key={item.path} onClick={() => navigate(item.path)} className="relative -mt-6">
                  <motion.div whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${isActive ? "gradient-primary glow-primary" : "bg-primary/90 hover:bg-primary"}`}>
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </motion.div>
                </button>
              );
            }

            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors">
                {isActive && <motion.div layoutId="navIndicator" className="absolute inset-0 rounded-xl bg-primary/10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.path === "/notifications" && unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                      <span className="text-[8px] font-bold text-destructive-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
