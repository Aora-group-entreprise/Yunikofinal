import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

interface ReportButtonProps {
  contentType: "post" | "message" | "room_message" | "anonymous_message" | "profile";
  contentId: string;
  reportedUserId: string;
  className?: string;
}

const REASONS = [
  { key: "spam", label: "Spam" },
  { key: "harassment", label: "Harassment" },
  { key: "inappropriate", label: "Inappropriate content" },
  { key: "hate_speech", label: "Hate speech" },
  { key: "other", label: "Other" },
];

const ReportButton = ({ contentType, contentId, reportedUserId, className = "" }: ReportButtonProps) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReport = async (reason: string) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      content_type: contentType,
      content_id: contentId,
      reason,
    } as any);
    setLoading(false);
    setShowMenu(false);
    if (error?.code === "23505") {
      toast.info(t("report.already_reported") || "Already reported");
    } else if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("report.success") || "Report submitted");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" title="Report">
        <Flag className="w-3.5 h-3.5" />
      </button>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-8 z-50 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
            {REASONS.map(r => (
              <button key={r.key} disabled={loading} onClick={() => handleReport(r.key)}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportButton;
