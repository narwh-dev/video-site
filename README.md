# video-site

https://video.startrekchina.org

Star Trek China video catalog and playback site. The project goal is to run the application entirely on the Cloudflare ecosystem, with Cloudflare Workers as the primary runtime and Cloudflare services providing data, storage, access control, deployment, and edge delivery.

## Project Goal

Build a Cloudflare-first video site for public catalog browsing, search, detail pages, authorized playback, user features, admin management, and persisted danmaku.

The MVP should stay focused on a full-stack React Router application deployed directly to Cloudflare Workers through Cloudflare's Vite plugin, backed by Cloudflare-native services wherever practical.

## Cloudflare Architecture

- Runtime: Cloudflare Workers through `@cloudflare/vite-plugin`, with local SSR running in `workerd`.
- Framework: React Router Framework Mode with TypeScript and Vite; this is not a client-only SPA.
- Database: Cloudflare D1 for catalog metadata, users, favorites, watch history, danmaku, moderation state, and audit records.
- Media storage: Cloudflare R2 for private media objects.
- Admin protection: Cloudflare Access for `/admin` and admin API routes.
- Delivery: Worker-based playback resolution and proxy endpoints for private sources, with TTL-bound signed path tokens.
- Environments: separate Cloudflare preview and production environments.

## MVP Scope

- Public browsing and search for series, seasons, episodes, movies, and detail pages.
- Authorized MP4/HLS playback with Artplayer, hls.js, WebVTT subtitles, and danmaku display.
- Better Auth user login with GitHub OAuth and Resend email magic links.
- User favorites, watch history, and logged-in danmaku submission.
- Access-gated admin CRUD for catalog data, sources, subtitles, and danmaku moderation.

## Guardrails

- Keep real Cloudflare account IDs, tokens, source URLs, and secrets out of the repository.
- Do not expose raw private R2 URLs or durable secrets to clients.
- Treat signed URLs as application access control and hotlink mitigation, not DRM or rights management.
- MKV is source or ingest only; browser playback targets are MP4 and HLS.
- No transcoding pipeline, public uploads, external metadata scraping, realtime danmaku, or DRM in the MVP.
