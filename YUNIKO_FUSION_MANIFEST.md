# Yunikofinal — Yusheng base + Yuniko functional fusion

Yusheng is the stable base source tree in `src/yusheng` and supplies the root UI stylesheet.
Yuniko is the active functional application layer in `src/yuniko`.
Yuniko API/infrastructure is preserved under `artifacts/api-server` and shared packages under `lib`.

Preserved systems include Feed, Posts, Stories, Live, Likes, Comments, Shares, Friends/Follows,
Notifications, Private Chat, Audio/Video Calls, Profiles, Settings, language support, security,
PostgreSQL/Drizzle, Supabase Storage, Cloudflare and monetization infrastructure.

Binary assets referenced by Yuniko are recovered into `attached_assets` during the fusion build.
`.env` and credentials are never copied into the repository.
