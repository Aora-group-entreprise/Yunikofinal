# Yuniko fusion source

Yunikofinal uses the Yusheng ZIP as the base. The complete Yuniko source is recovered under `yuniko-source/` for the integration phase.

Rules for the integration phase:
- Yusheng remains the UI/application base.
- Yuniko functionality is integrated into that base; it is not a replacement base.
- Preserve Feed, Posts, Stories, Live, Likes, Comments, Shares, Friends/Follows, Notifications, Private Chat, Audio/Video Calls, Profiles, Settings, language support, security, Yuniko API, PostgreSQL/Drizzle, Supabase Storage and monetization infrastructure.
- Do not copy secrets from `.env`.
- Do not replace Yuniko's JWT/PostgreSQL/Drizzle/Supabase Storage/Cloudflare stack with another stack.
