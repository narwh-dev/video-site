# Agent Collaboration Guide

## Project Goal

Build a Cloudflare-native Star Trek video catalog and playback site for `video.startrekchina.org`. The project goal is to host and operate the site entirely within the Cloudflare ecosystem: runtime, data, storage, access control, preview/production deployment, and edge delivery should all use Cloudflare services wherever practical.

The MVP should provide public catalog browsing, search, detail pages, authorized playback, user features, an admin backend, and persisted danmaku.

This repository is still at the planning/scaffold stage. At the time this guide was updated, the root contains only the basic repository files and project guidance. Keep changes small and architecture-focused until the app scaffold exists.

## Detailed Plan Pointer

If `.sisyphus/plans/star-trek-video-site-architecture.md` is added later, read it before changing architecture or task order. Until then, treat this guide and `README.md` as the working project direction.

## Chosen Stack

- App framework: React Router Framework Mode with TypeScript; do not substitute a client-only React SPA.
- Styling and UI: Tailwind CSS with coss ui as the default component library (based on Base UI), following a clean minimalist interface. Local docs: `docs/coss-ui/README.md`.
- Build/runtime integration: Vite with Cloudflare's `@cloudflare/vite-plugin`.
- Runtime target: Cloudflare Workers, with local SSR and preview behavior verified in `workerd`.
- Primary SSR target: Workers, not Cloudflare Pages.
- Deployment target: Cloudflare Workers environments for preview and production.
- Testing baseline: typecheck, lint, Vitest, Playwright E2E, and CI.

## Cloudflare Architecture

- Keep the application fully Cloudflare-first; do not introduce a non-Cloudflare hosting, database, object storage, CDN, or admin-gating dependency unless the project direction is explicitly revised.
- Use separate preview and production Cloudflare Workers environments.
- Run the full-stack React Router app on Cloudflare Workers through Cloudflare's Vite plugin.
- Use route loaders for reads, route actions/fetchers for mutations, and resource routes for JSON, subtitle, and media proxy responses.
- Inject Cloudflare bindings through the Worker entry/load context; client modules must never access bindings directly.
- Prefer Web Platform APIs and Cloudflare bindings over Node.js APIs. Enable only the compatibility flags required by verified dependencies.
- Use D1 for relational application data.
- Use R2 for private media objects.
- Use Cloudflare Access to gate `/admin` and admin API routes.
- Use Cloudflare edge delivery and Worker routes for playback resolution and private media proxying.
- Keep real Cloudflare account IDs, tokens, source URLs, and secrets out of the repository.

## Auth And Authorization Model

- Admin access is protected by Cloudflare Access before app-level admin logic runs.
- Normal user login uses Better Auth with GitHub OAuth and Resend email magic links.
- Guests may browse and play content that the resolver marks as allowed.
- Login is required for user-specific features such as favorites, watch history, and danmaku submission.
- Admins manage catalog data, sources, subtitles, and danmaku moderation through Access-gated routes.

## Data And Storage Model

- D1 stores catalog metadata for series, seasons, episodes, movies, sources, subtitles, users, favorites, watch history, persisted danmaku, moderation state, and admin audit data.
- R2 stores private media objects that must not be exposed as raw private URLs in client payloads.
- Source records should distinguish provider type and access behavior, including `public_url`, `r2`, `rustfs`, and `openlist`.
- Prefer Cloudflare-native storage and data services for new application capabilities. Avoid adding external databases, object stores, queues, or media delivery services for MVP work.
- Content entry is manual admin CRUD for the MVP. Do not add external metadata scraping or sync unless a later plan explicitly adds it.

## Playback And Player Model

- Browser delivery targets are MP4 and HLS.
- MKV is source or ingest only. Do not claim reliable browser MKV playback.
- Use Artplayer with hls.js for HLS playback and native HLS fallback where supported.
- Use `artplayer-plugin-danmuku` for danmaku display.
- Use WebVTT for subtitles.
- Persisted danmaku is the MVP model: guests can read approved danmaku, logged-in users can submit, and admins can hide or delete. Realtime Durable Objects danmaku is future scope.

## Source Signing And Playback Protection

- Direct playback must be constrained to private or authorized content only.
- Signed URLs are access-control and hotlink mitigation controls, not legal authorization to distribute media.
- Public direct URLs may be returned directly when the source is intentionally public.
- Private R2 sources should resolve through Worker proxy endpoints with TTL-bound signed path tokens.
- Resolver responses must not expose raw private R2 URLs or durable secrets to the client.
- RustFS and OpenList are MVP direct or external sources unless future provider signing adapters are added.
- Handle signed URL expiry and Range request expectations in the playback flow.
- Do not make DRM claims for the MVP.

## MVP Exclusions

- No transcoding pipeline.
- No public uploads.
- No external metadata scraping or sync.
- No realtime Durable Objects danmaku or presence.
- No DRM implementation or DRM marketing claims.
- No guarantee of browser MKV playback.

## Testing Expectations

- Keep type safety strict and run `npm run typecheck` once the app scaffold exists.
- Run `npm run lint` for style and static checks.
- Use Vitest for unit and integration coverage around data access, source resolution, signing, auth behavior, and player-facing API contracts.
- Use Playwright for catalog, auth-adjacent flows, admin CRUD, playback page behavior, subtitles, danmaku, and signed URL expiry cases.
- Maintain CI for pull requests and production-bound changes.

## Collaboration Guardrails

- Start from this guide and `README.md`; if a detailed plan file exists later, read it before changing architecture or task order.
- Keep this repository free of secrets, tokens, private source URLs, and real Cloudflare IDs.
- Keep the MVP fully hosted on Cloudflare services unless the project direction is explicitly revised.
- Do not broaden the MVP beyond the stated exclusions without updating the plan through the orchestrator.
- Prefer small, reviewable changes with verification notes.
- Preserve the React Router Framework Mode + Vite + Cloudflare Workers runtime choice unless the plan is formally revised.
- Keep admin concerns behind Cloudflare Access and keep user auth separate through Better Auth.
- Treat signed URL work as application access control and hotlink mitigation, not as a substitute for rights management.
