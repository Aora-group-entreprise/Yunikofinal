import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface UserSettings {
  id: string;
  user_id: string;
  notif_messages: boolean;
  notif_likes: boolean;
  notif_sounds: boolean;
  notif_vibration: boolean;
  profile_visibility: string;
  blocked_users: string[];
  theme: string;
  accent_color: string;
  language: string;
  auto_translate: boolean;
  translate_target: string;
}

const defaultSettings: Omit<UserSettings, "id" | "user_id"> = {
  notif_messages: true,
  notif_likes: true,
  notif_sounds: true,
  notif_vibration: true,
  profile_visibility: "everyone",
  blocked_users: [],
  theme: "light-futuristic",
  accent_color: "cyan",
  language: "fr",
  auto_translate: false,
  translate_target: "fr",
};

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["user_settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        // Create default settings
        const { data: newData, error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id, ...defaultSettings })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData as UserSettings;
      }
      return data as UserSettings;
    },
    enabled: !!user,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_settings", user?.id] });
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    },
  });

  return { settings, isLoading, updateSettings };
};
