import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/** Updates the user's last_seen timestamp every 2 minutes while active. */
export const usePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updatePresence = () => {
      supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("user_id", user.id).then();
    };

    updatePresence();
    const interval = setInterval(updatePresence, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};
