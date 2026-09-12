
-- 1. Drop the insecure notification INSERT policy (allows inserting for any user_id)
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

-- 2. Create a SECURITY DEFINER function to insert notifications (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_link text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (p_user_id, p_type, p_title, p_body, p_link);
END;
$$;

-- 3. Trigger: auto-notify on post like
CREATE OR REPLACE FUNCTION public.notify_on_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id uuid;
  liker_pseudo text;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  SELECT pseudo INTO liker_pseudo FROM public.profiles WHERE user_id = NEW.user_id;
  PERFORM public.create_notification(
    post_owner_id,
    'like',
    COALESCE(liker_pseudo, 'Someone') || ' liked your post',
    NULL,
    '/feed'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_post_like
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_post_like();

-- 4. Trigger: auto-notify on post comment
CREATE OR REPLACE FUNCTION public.notify_on_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id uuid;
  commenter_pseudo text;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  SELECT pseudo INTO commenter_pseudo FROM public.profiles WHERE user_id = NEW.user_id;
  PERFORM public.create_notification(
    post_owner_id,
    'message',
    COALESCE(commenter_pseudo, 'Someone') || ' commented on your post',
    LEFT(NEW.content, 100),
    '/feed'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_post_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_post_comment();

-- 5. Trigger: auto-notify on anonymous message
CREATE OR REPLACE FUNCTION public.notify_on_anon_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.receiver_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;
  PERFORM public.create_notification(
    NEW.receiver_id,
    'anonymous',
    'You received an anonymous message',
    LEFT(NEW.content, 50),
    '/anonymous'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_anon_message
AFTER INSERT ON public.anonymous_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_anon_message();

-- 6. Storage: allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
