import { motion } from "framer-motion";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";

interface BannerAdProps {
  position?: "top" | "bottom";
  className?: string;
}

const BannerAd = ({ position = "top", className = "" }: BannerAdProps) => {
  useAppSettings();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      className={`w-full h-[40px] flex items-center justify-center glass rounded-lg overflow-hidden ${className}`}>
      <span className="text-xs text-muted-foreground tracking-wider">✨ {t("ad.text")}</span>
    </motion.div>
  );
};

export default BannerAd;
