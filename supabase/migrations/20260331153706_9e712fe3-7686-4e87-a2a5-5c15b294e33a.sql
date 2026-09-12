
-- User settings table for preferences
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  -- Notifications
  notif_messages boolean NOT NULL DEFAULT true,
  notif_likes boolean NOT NULL DEFAULT true,
  notif_sounds boolean NOT NULL DEFAULT true,
  notif_vibration boolean NOT NULL DEFAULT true,
  -- Privacy
  profile_visibility text NOT NULL DEFAULT 'everyone',
  blocked_users uuid[] DEFAULT '{}',
  -- Appearance
  theme text NOT NULL DEFAULT 'light-futuristic',
  accent_color text NOT NULL DEFAULT 'cyan',
  -- Language
  language text NOT NULL DEFAULT 'fr',
  -- Translation
  auto_translate boolean NOT NULL DEFAULT false,
  translate_target text NOT NULL DEFAULT 'fr',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add message_type and media_url to messages for photo/video support
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url text;
