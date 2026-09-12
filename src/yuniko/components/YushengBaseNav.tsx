import { Inbox, UserPlus, User, Globe, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useUnreadNotifications } from "@yusheng/hooks/useNotifications";

// Yusheng's navigation implementation reused as Yuniko's navigation base.
const YushengBaseNav = () => {
  const [pathname, navigate] = useLocation();
  const unreadCount = useUnreadNotifications();
  const items = [
    { icon: Inbox, path: "/messages" },
    { icon: UserPlus, path: "/add-friends" },
    { icon: Globe, path: "/", center: true },
    { icon: Bell, path: "/notifications" },
    { icon: User, path: "/profile" },
  ];
  return <div className="fixed bottom-0 left-0 right-0 z-50"><div className="glass border-t border-border/40 px-4 py-2.5 safe-area-bottom"><div className="flex items-center justify-around max-w-lg mx-auto">{items.map(item => { const active = item.path === "/" ? pathname === "/" : pathname === item.path || pathname.startsWith(item.path + "/"); if (item.center) return <button key={item.path} onClick={() => navigate(item.path)} className="relative -mt-6" aria-label="Home"><motion.div whileTap={{scale:.9}} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg ${active ? "gradient-primary glow-primary" : "bg-primary/90 hover:bg-primary"}`}><item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" /></motion.div></button>; return <button key={item.path} onClick={() => navigate(item.path)} className="relative flex items-center justify-center w-10 h-10 rounded-xl" aria-label={item.path.slice(1)}>{active && <motion.div layoutId="yuniko-nav-indicator" className="absolute inset-0 rounded-xl bg-primary/10" />}<div className="relative"><item.icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />{item.path === "/notifications" && unreadCount > 0 && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center"><span className="text-[8px] font-bold text-destructive-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span></div>}</div></button>; })}</div></div></div>;
};
export default YushengBaseNav;
