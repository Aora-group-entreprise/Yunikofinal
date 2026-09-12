# Yunikofinal — Yusheng base + Yuniko functionality

Yusheng is the application/UI base. Yuniko is integrated into it; Yuniko is not used as a replacement base.

Integrated source layers:
- `src/` — Yusheng application base and responsive UI.
- `src/yuniko/` — Yuniko frontend feature source being wired into the Yusheng shell/routes.
- `artifacts/yuniko/` — original Yuniko frontend source retained for complete feature recovery.
- `artifacts/api-server/` — Yuniko API and infrastructure, including Stories/Live/calls/media support.
- `lib/` — Yuniko shared API/database packages retained for PostgreSQL/Drizzle integration.

Required preserved functionality: Feed, Posts, Stories, Live, Likes, Comments, Shares, Friends/Follows, Notifications, Private Chat, Audio/Video Calls, Profiles, Settings, language support, security, Yuniko API, PostgreSQL/Drizzle, Supabase Storage, Cloudflare and monetization infrastructure.

Security: never copy `.env` or credentials into the repository.
