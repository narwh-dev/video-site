---
title: Starfleet Archive Frontend Prototype Build Guidance Spec
status: ready-for-agent
labels:
  - ready-for-agent
source: Star Trek Video Site Requirements and Technical Design Document v1.6
scope: high-fidelity frontend prototype
updated: 2026-08-11
---

# Starfleet Archive Frontend Prototype Build Guidance Spec

## Problem Statement

The current PRD simultaneously contains product goals, the production system architecture, historical visual drafts, and the current high-fidelity prototype specification. If an execution-oriented agent implements directly from the full PRD, it must judge on its own which content belongs to the prototype, which belongs to the production backend, and which historical requirements are obsolete. It is also easy to miss route states, responsive details, keyboard interactions, and feedback states.

The project needs a build guide aimed at low-divergence execution-oriented agents: it must define a single source of truth, an implementation order, page and state boundaries, reusable component constraints, mock behavior boundaries, and verifiable completion criteria. This way the agent can build or review the prototype phase by phase without needing to fill in product design.

## Solution

Use PRD v1.6 Appendix B as the highest-priority baseline for visual, layout, interaction, and responsive behavior. Use the body chapters on roles, features, and routing to fill in business semantics. Build a high-fidelity React frontend prototype driven by local mock data.

The prototype must cover public pages, authentication, post-login content browsing, playback, personal area, settings, and administration console. All key actions must produce visible local feedback that is either reversible or confirmable, but must not imply integration with real authentication, media, storage, email, permission, or analytics services.

Follow this priority when executing. Do not improvise compromises when conflicts arise:

1. The explicit decisions and acceptance criteria in this spec.
2. The current prototype specification in PRD v1.6 Appendix B.
3. The business features, roles, and routing semantics in the PRD v1.6 body chapters.
4. Already visually accepted existing components and interaction patterns in the repository.
5. Appendix A is historical material only and is not a basis for current implementation.

The completion standard is not "the page opens" or "the build passes." It is that all target routes carry meaningful content in a real browser, that key states and interactions are operable, and that the prototype passes visual acceptance at 320px, 768px, 1024px, and 1440px.

## User Stories

1. As a visitor, I want to see a content-led public landing page, so that I can understand the archive before signing in.
2. As a visitor, I want the next content section to remain visible below the hero, so that the landing page feels like an archive rather than a marketing splash screen.
3. As a visitor, I want the top and collection filters to stay synchronized, so that changing a content type has one predictable result.
4. As a visitor, I want clear login and invitation registration entry points, so that I know how access is granted.
5. As a visitor, I want to switch between light and dark themes, so that I can inspect the interface in my preferred appearance.
6. As a visitor, I want unknown URLs to show a purposeful Starfleet-themed 404 page, so that I never encounter a blank screen.
7. As a member signing in, I want password, passkey and third-party sign-in choices to be visually separated, so that each authentication path is understandable.
8. As a member with two-factor authentication, I want to choose either an authenticator code or a backup code, so that I can complete the appropriate verification path.
9. As a keyboard user signing in, I want validation to focus the first invalid field, so that I can correct errors without searching the form.
10. As a new member, I want invitation-code registration to show a clear verification-email completion state, so that I know what happens next.
11. As a member recovering access, I want a neutral email-sent state, so that account existence is not disclosed.
12. As a member using OAuth for the first time, I want the connected identity and remaining account fields shown in one flow, so that account creation is clear.
13. As a signed-in member, I want a stable application shell with archive navigation, so that I can repeatedly browse without relearning the layout.
14. As a desktop member, I want to collapse the sidebar while keeping every destination accessible, so that I can prioritize content space.
15. As a tablet or mobile member, I want navigation in a focus-managed drawer, so that the same destinations remain usable without a fixed sidebar.
16. As a keyboard user, I want current navigation, focus and expanded state to be conveyed semantically, so that I can understand where I am.
17. As a member, I want sidebar search to replace the sidebar contents, so that search feels integrated into archive navigation.
18. As a member searching the archive, I want to filter all results, series or episodes and use arrow keys and Enter, so that search is efficient without a pointer.
19. As a member, I want Escape from search to return focus to the real search trigger, so that my keyboard position remains predictable.
20. As a member, I want a notification preview with unread status and a mark-all-read action, so that I can triage updates without leaving the page.
21. As a member, I want marking all preview notifications read to keep the preview open, so that I can see the result immediately.
22. As a member, I want account actions in a keyboard-operable menu, so that settings, administration, theme and sign-out remain compact and accessible.
23. As a returning member, I want the home hero to show my latest resumable episode, so that continuing playback is the primary action.
24. As a member, I want home content lanes for continuing, recent updates, popular titles, followed updates and series browsing, so that the archive supports repeated discovery.
25. As a touch user, I want every item in an overflowing home lane to remain reachable, so that mobile layouts do not silently truncate content.
26. As a member, I want media cards to show title, metadata, state and progress without image zoom effects, so that information remains stable and scannable.
27. As a member, I want an intentional home empty state when a personalized lane has no data, so that the interface still gives me a next action.
28. As a member browsing the catalog, I want to search multilingual titles and filter by type and decade, so that I can narrow the archive quickly.
29. As a member browsing the catalog, I want sorting and filters represented in validated URL parameters, so that refresh, sharing and Back/Forward preserve the result.
30. As a member, I want invalid catalog URL values to fall back safely, so that malformed links do not break the page.
31. As a member, I want one clear-filter action to reset search, type and decade while retaining sort, so that recovery from an over-filtered view is predictable.
32. As a member, I want a distinct no-results state, so that I can tell filtering from an actually empty archive.
33. As a member opening a series, I want a banner, multilingual identity, metadata, description and poster, so that the series record feels complete.
34. As a returning member opening a series, I want a single resume action based on progress, so that I can continue without inspecting every episode.
35. As a member, I want season selection reflected in a bounded URL parameter, so that deep links and browser navigation restore the same season.
36. As a member, I want episodes to show codes, multilingual titles, duration, completion and progress, so that I can choose the correct item quickly.
37. As a member following a series, I want follow and unfollow feedback with undo, so that accidental changes are recoverable.
38. As a member starting an episode, I want the watch route to identify the series and episode, so that links restore the intended playback context.
39. As a viewer, I want a fixed dark player surface in every site theme, so that video controls remain legible.
40. As a viewer, I want visible play, mute, progress, quality, audio, subtitle, speed, danmaku, picture-in-picture and fullscreen controls, so that the prototype represents the complete playback workflow.
41. As a keyboard viewer, I want player control groups to support roving focus and visible focus rings, so that controls are efficient and understandable.
42. As a viewer, I want the progress control to show time and a sprite-style preview state, so that seeking behavior is represented faithfully.
43. As a viewer, I want desktop player settings in anchored popovers, so that controls do not obscure the whole screen.
44. As a mobile viewer, I want player settings in a shared bottom drawer, so that controls remain touchable on a narrow screen.
45. As a mobile viewer, I want the episode list in a focus-managed drawer, so that selecting an episode closes the drawer and returns focus correctly.
46. As a tablet viewer, I want the episode list as a horizontal snapping lane below the player, so that it does not collide with the player.
47. As a viewer, I want subtitles, audio tracks, quality and speed to show an unambiguous selected option, so that settings are not conveyed by color alone.
48. As a viewer, I want danmaku visibility, density, opacity, mode and color controls, so that the prototype covers the expected viewing controls.
49. As a member sending danmaku, I want blank content rejected with an associated error, so that invalid submissions are understandable.
50. As a member interacting with danmaku, I want like and report actions with visible results, so that the moderation workflow is represented.
51. As a member reading an episode page, I want description and comments organized as tabs, so that content remains compact below playback.
52. As a member commenting, I want to post, reply, like, report and delete local mock comments, so that the major interaction states can be evaluated.
53. As a keyboard member reporting content, I want report reasons in a named toolbar with predictable focus, so that the action is accessible.
54. As a member, I want comment counts and visible comments to remain consistent after local changes, so that feedback does not contradict the page.
55. As a member, I want a unified personal-area shell for favorites, history, notifications and settings, so that these destinations feel related.
56. As a desktop member, I want personal-area section navigation fixed beside the content, so that switching sections is fast.
57. As a tablet or mobile member, I want the current personal section to open the same section navigation in a drawer, so that no second menu pattern is introduced.
58. As a member viewing favorites, I want multilingual search, sort and grid/list modes, so that I can manage a growing followed library.
59. As a member viewing history, I want multilingual and episode-code search, sort and grid/list modes, so that I can locate a previous episode.
60. As a member, I want favorite and history view state to remain usable after filtering, removal and undo, so that layout changes do not remove capabilities.
61. As a keyboard member removing an item, I want focus moved to the next visible removal action or an appropriate empty-state action, so that I do not lose my place.
62. As a member clearing history, I want a confirmation dialog and an undo toast, so that destructive changes are deliberate and reversible in the prototype.
63. As a member viewing notifications, I want all/unread filters, individual read state and mark-all-read, so that I can understand notification workflows.
64. As a member with no unread notifications, I want an intentional empty state and a route back to all notifications, so that the page is not blank.
65. As a member editing my profile, I want compact row-based settings with inline save status, so that changes feel immediate without a page-level save form.
66. As a member editing preferences, I want theme, language, subtitle, quality and playback behavior controls, so that common preferences are represented.
67. As a member choosing follow-system theme, I want the interface to react to system theme changes, so that the preference has visible meaning.
68. As a member editing notification preferences, I want in-app, email and archive switches with immediate status feedback, so that each channel is explicit.
69. As a member managing security, I want password, TOTP, backup code, passkey, linked account and session flows represented, so that the complete settings information architecture can be evaluated.
70. As a member managing security, I want destructive actions confirmed and focus restored to a surviving control, so that dynamic lists remain keyboard-safe.
71. As a member, I want only non-security settings persisted locally in the prototype, so that mock security state is not mistaken for durable account state.
72. As an uploader, I want a management console that exposes content and transcode work without admin-only controls, so that role differences are visible.
73. As an admin, I want dashboard, content, uploads, moderation, users, invites and statistics destinations, so that the complete operational information architecture can be reviewed.
74. As an admin, I want to preview uploader permissions, so that role-dependent menu and action visibility can be inspected without real authentication.
75. As an operator, I want data tables to provide search, filters, status, selection and empty states, so that operational workflows remain scannable.
76. As an uploader, I want content creation and upload dialogs with structured fields and validation, so that draft creation is represented without a backend.
77. As an uploader, I want upload jobs to show stage, progress, result and retry feedback, so that the transcode lifecycle is understandable.
78. As an admin, I want moderation rows to support keep, remove and sanction outcomes, so that review decisions have visible local feedback.
79. As an admin, I want user inspection and role/status actions, so that account administration can be evaluated.
80. As an admin, I want invitation creation with bounded uses and a localized expiry calendar, so that the invitation workflow is explicit and keyboard-operable.
81. As an admin, I want statistics to switch between 7-day and 30-day views, so that chart and ranking states can be inspected.
82. As a mobile operator, I want the management navigation in the same drawer pattern as the member shell, so that all admin destinations remain reachable.
83. As a user on a 320px screen, I want text, controls, media and fixed navigation to fit without horizontal page overflow, so that the prototype remains usable at the minimum width.
84. As a user on a 768px or 1024px screen, I want drawer transitions and single-column playback to follow the defined boundary, so that tablet layouts do not inherit desktop collisions.
85. As a user on a 1440px screen, I want the expanded archive layout to use space without oversized typography or decorative empty regions, so that the interface remains work-focused.
86. As a reduced-motion user, I want nonessential transitions removed and scrolling danmaku hidden, so that the prototype respects my system preference.
87. As a user of assistive technology, I want forms, dialogs, menus, tabs, toggles, toolbars and progress indicators to expose their native semantics, so that the interface is operable beyond visual presentation.
88. As a reviewer, I want every mock-only capability labeled and reported honestly, so that visual completion is not confused with production readiness.

## Implementation Decisions

### Scope and Source of Truth

- Build a high-fidelity frontend prototype, not a production application. Use local deterministic mock data and local UI state for authentication, playback, uploads, moderation, permissions and statistics.
- Preserve the information architecture and interaction contracts defined here when replacing mock data later. API integration is a separate implementation phase.
- Use PRD v1.6 Appendix B as the visual and interaction authority. Ignore Appendix A wherever it differs.
- Do not add product features, routes, decorative motifs, alternative navigation systems or component variants that are not required by this spec.
- Use Simplified Chinese as the primary interface language. Use Traditional Chinese and English for content metadata where specified; use monospace treatment for codes, time values and statistics.

### Technical Baseline

- Use React 19, TypeScript in strict mode, Vite, Tailwind CSS v4, coss-ui source components and Lucide React.
- Keep the prototype client-side and route through the History API. Do not add a routing, state-management or data-fetching dependency unless an existing implementation cannot satisfy a concrete requirement.
- Reuse the existing semantic design tokens and coss-ui primitives. Do not restyle the application with coss default colors.
- Use locally bundled Inter Variable, local system font fallbacks and local image assets. No runtime dependency on third-party font or image domains is allowed.
- Use explicit domain types for route state, catalog filters, playback options, account preferences and admin records. Avoid `any`, unchecked assertions and stringly typed state where a closed union exists.
- Keep pure parsing, normalization, sorting and serialization logic outside page rendering so it can be tested without a browser.
- Split page-level modules when modifying a large feature would otherwise require expanding an already oversized component. Do not perform an unrelated full rewrite solely to improve file size.

### Visual System

- The interface is a restrained archive application. Content imagery, metadata and playback are primary; surfaces use flat fills, fine borders and clear spacing.
- Warp blue is the only general accent. Green, amber and red are reserved for success, warning and danger semantics.
- Support light, dark and follow-system themes. First visit defaults to light. Persist the preference under the existing prototype theme key.
- Keep the player, adjacent controls, danmaku and episode-selection area on the fixed dark player palette in every site theme.
- Preserve the defined semantic token values from Appendix B. Do not introduce a competing palette or page-specific hard-coded theme system.
- Use 14px as the normal body scale, 11–13px for supporting text and 8–10px monospace text for compact codes where legible. Do not scale fonts with viewport width.
- Use the existing radius system: standard controls approximately 10px, compact controls 6–8px, alerts 14px and dialogs/drawers up to 18px. Media grids, media cards and their images remain square-cornered.
- Do not add heavy shadows, nested cards, floating page sections, hover image scaling, decorative particles, glowing effects or continuously animated decoration.
- Limit motion to short color, border, background and opacity transitions around 120ms and drawer movement around 160ms. Honor reduced motion.

### Component Discipline

- Use coss primitives for buttons, inputs, textareas, fields, forms, selections, switches, tabs, badges, progress, sliders, cards, empty states, alerts, menus, popovers, tooltips, sheets, drawers, dialogs, tables, toolbars, toggle groups, radio groups, autocomplete and calendars.
- Retain custom domain rendering only for player canvas, danmaku tracks, sprite preview and media-specific typography/layout.
- Use Lucide icons for controls. Icon-only commands require a Chinese accessible name and a tooltip where the purpose is not immediately familiar.
- Do not nest interactive elements. Composition of a trigger, close primitive, toolbar item and button must produce one final native button.
- Let component primitives own disclosure state semantics, outside-click behavior, Escape handling, focus trapping and focus restoration. Business handlers update domain state only.
- Use semantic primitive attributes as the only visual state source: `aria-current` for navigation/current episode, primitive pressed state for toggles, and primitive expanded/open state for disclosures.
- Use cards for individual media items, dialogs and genuine framed tools. Do not wrap full page sections in cards or place cards inside cards.
- Reuse shared wrappers for archive text buttons, icon buttons, selects, avatars, sheet triggers, personal-area navigation, skeleton boundaries and common headers.

### Routing and Restoration

- Support all routes listed in the Solution route scope: public, authentication, home, series catalog, series detail, watch, favorites, history, notifications, four settings routes, admin and all admin subsections.
- Unknown routes render the designed 404 page.
- Route changes update browser history and scroll the new page to the top. Back and Forward restore page, series, episode, season and personal-area selection.
- Normalize the settings entry route to the profile route with replacement, never with a new duplicate history entry.
- Catalog state uses validated `q`, `type`, `decade` and `sort` query parameters. Defaults are omitted. Input changes replace the current entry rather than adding one per character.
- Series detail uses no season query for season one and a validated, range-clamped `season` query for later seasons.
- Watch routes use stable series slugs and episode codes and restore the selected record after refresh.
- History search, sort and view are restorable query state. Invalid values normalize to defaults.
- Preserve the last legal catalog query when entering a detail page so breadcrumbs, sidebar links and return actions restore the prior result.

### Global Shell and Navigation

- At 1025px and above, render a fixed desktop sidebar. It is 240px from 1025–1439px, 256px from 1440px, and may collapse to 72px.
- Desktop sidebar content includes logo, search, main navigation, followed/recent accordion groups, archive notice and account entry.
- The collapsed sidebar keeps icons, notification state and account access visible. Search, destinations and account entry use right-side tooltips.
- At 1024px and below, replace the fixed sidebar with one 276px Sheet controlled by the mobile header. It always renders expanded labels and never inherits collapsed tooltips.
- At 767px and below, render a four-item bottom navigation: home, series, favorites and profile. Reserve content space so fixed navigation never occludes actions.
- The desktop top toolbar is sticky, 40px high, and contains breadcrumbs plus a named two-item toolbar for theme and notifications.
- Account navigation is a menu with settings, admin console, theme and sign-out. Theme remains a checkbox menu item and does not close the menu when toggled.
- Personal-area desktop navigation is fixed at 1025px and above. At 1024px and below, the current section itself opens the personal navigation Sheet; do not add a second hamburger button.
- Admin uses the same breakpoint philosophy and focus-managed mobile Sheet, with role-aware destinations and a clear return-to-frontend action.

### Search and Notifications

- Sidebar search replaces the sidebar navigation content. It is not a floating card.
- Search contains Back, autofocus input, all/series/episode scope, result count, result list and no-results feedback.
- Search exposes combobox/listbox/option semantics, arrow-key navigation, Enter activation and Escape return. Closing restores focus to the rendered search trigger.
- Desktop search may dim and block the main content, but the sidebar remains above the overlay. Mobile search stays inside the already open Sheet.
- Notification trigger shows an unread count. The preview shows the first three records, mark-all-read and a link to the full center.
- Opening a notification marks it read and navigates to its target. Mark-all-read leaves the popover open.
- Preview rows and the full notification center share the same unread-dot primitive and accessible unread wording.

### Public and Authentication Pages

- The public landing page uses a full-width real content image hero with text overlay, synchronized type filters and a visible hint of the collection section below.
- The landing collection uses 16:9 media cards and presents type, three-language identity as available, year and count/popularity metadata.
- Authentication uses a centered narrow Card, retaining an 8px framed panel on desktop and removing the frame on phone widths.
- Login supports password, two-factor method choice, six-slot numeric OTP, backup code, passkey, GitHub and Google mock paths.
- Register requires email, password, invitation code and terms. Forgot password accepts email. Both flows end in the same reusable email-result Empty layout.
- All submission flows use Form and Field validation. Reject whitespace-only invite codes, usernames, backup codes, comments, replies and danmaku.
- Turnstile is a clearly labeled mock success Alert. Never imply that a real anti-bot check occurred.
- Authentication stage changes move focus to the new stage heading or first relevant input.

### Home, Catalog and Series Detail

- Home begins with a fixed-dark resume hero and then ordered horizontal content lanes: continue watching, recent updates, popular, followed updates and browse by series.
- Each lane uses one ScrollArea. Show four visible columns at desktop and 1024px, three at 768–1023px, and two at 767px and below.
- Overflow controls move approximately 82% of the visible lane width. Only valid directions are displayed; when a focused control disappears at an edge, move focus to the remaining reverse control.
- Catalog offers multilingual search, type, decade and sort. Show a polite result summary for active successful filters and a distinct Empty state for no matches.
- Clearing catalog filters resets query/type/decade, retains sort, updates the URL and returns focus to search.
- Series detail uses banner plus summary and episode main area. Desktop may use a sticky summary with a single ScrollArea for short-view-height overflow.
- Summary contains poster, multilingual title, metadata, status, description, progress-aware resume, follow toggle and feedback.
- Season selection uses Tabs. Episode links and breadcrumbs derive from the same selected season state.
- Movies are modeled as a Series with one Episode and do not display meaningless season-selection UI.

### Watch Experience

- Use a two-column player and episode layout at 1025px and above, with an episode column around 320px. Use a single column at 1024px and below.
- The player is visually complete but does not need to decode or stream media. Its mock behavior must visibly update play state, time/progress, mute/volume, selected options, danmaku, picture-in-picture and fullscreen feedback.
- Desktop player controls use named left and right Toolbars plus a separately focusable volume Slider.
- At wide desktop, expose primary playback options as individual Popovers. At narrower desktop/tablet widths, consolidate secondary items without registering hidden toolbar controls.
- At phone widths, all player menu triggers share one controlled Drawer and identify the current panel by trigger identity. Episode selection uses a separate Drawer.
- The seek control includes elapsed/total time and a sprite-preview presentation. Its layout must not shift when preview content appears.
- Subtitle menu supports track, size, outline and vertical offset. Audio, quality and speed are mutually exclusive choices. Danmaku supports on/off, opacity, density, mode blocking and colors.
- Danmaku submission and comments are local state demonstrations with validation, success/error feedback and no network claim.
- Episode details and comments use Tabs. Comments support one reply level only in the prototype presentation.
- Selecting another episode updates route, selected state, progress context, details and comments coherently.

### Personal Area and Settings

- Favorites and history use a wide content region; notifications use a medium width; settings use a narrow 640–700px content column.
- Favorites and history each have independent search state, sort and grid/list ToggleGroup. All commands remain available in either view.
- Favorites search matches Simplified Chinese, Traditional Chinese and English titles. History search also matches episode code and multilingual episode titles.
- Distinguish a filtered no-results state from an empty underlying collection. Each state has a context-specific next action.
- Item removal uses a five-second undo Toast. Focus follows current visible order to the next item, previous item or appropriate empty-state action.
- Clearing history requires AlertDialog confirmation and offers undo. Escape/cancel restores trigger focus; confirmation focuses a stable resulting action.
- Notification center uses all/unread Tabs with one list DOM, individual read actions and a mark-all-read button outside the Tab sequence.
- Settings are separate routes and navigation items, not tab panels.
- Profile, preferences and notification settings auto-save mock values. Text fields debounce about 600ms; selects, radio groups and switches save immediately.
- Settings headings contain an `aria-live` save status: saving, saved or failed. Do not add a page-level Save button.
- Persist only versioned non-security settings. Invalid, damaged or unknown-version storage falls back to defaults. Storage write failure retains the edited UI value and shows failure.
- Security actions remain ephemeral across refresh. Use confirmation dialogs for disabling TOTP, removing passkeys/sessions and unlinking providers.

### Administration

- Admin sections are dashboard, content, uploads/transcoding, moderation, users, invitations and statistics.
- Role preview supports admin and uploader. Uploader sees content/upload duties and read-only publication state; admin sees publishing, users, invitations, moderation and statistics as defined.
- Tables and inspectors remain dense and work-focused. Filters display accurate visible counts and intentional no-results states.
- Content creation, upload and invitation creation use persistent Dialog roots and complete header, description, scrollable panel and footer structure.
- Content title and episode code reject whitespace-only values. Upload selects a series from a searchable controlled Combobox and keeps episode code separate.
- Invitation uses are a bounded integer from 1 through 20. Expiry uses a Chinese localized single-date Calendar and stores local `YYYY-MM-DD` without UTC conversion.
- Calendar is lazy-loaded as a secondary admin chunk and uses a same-size Skeleton during its short loading state.
- Moderation, user and invitation row actions use named Toolbars with visible outcomes. Destructive and sanction actions require the appropriate confirmation.
- Statistics provide 7-day and 30-day mock ranges, summary metrics, ranked series and clearly labeled mock chart data.

### Responsive Contract

- At 1440px and above: sidebar 256px, personal navigation visible, series summary may be 300px, home and catalog can show four columns.
- From 1025px through 1439px: sidebar 240px or collapsed 72px, personal navigation visible, watch remains two columns.
- From 768px through 1024px: navigation is a 276px Sheet, mobile header is sticky, personal navigation is a Sheet, watch is one column, episode selection is a horizontal snapping lane, series detail compresses and episodes use two columns.
- At 767px and below: mobile header plus four-item bottom nav, two-column or one-column media grids based on available item width, full-width player, danmaku sender below player and drawer-based episode/player menus.
- At every width, prevent horizontal page overflow, clipped controls, overlapping fixed layers, text occlusion and inaccessible off-screen actions.
- Fixed-format controls, media, toolbars and grids use stable dimensions, aspect ratios and responsive grid tracks so state changes do not move surrounding layout.

### Accessibility and Feedback

- Every control uses native button/link/input semantics through coss composition. Do not attach click behavior to generic containers.
- Every icon-only command has an accessible name. Form controls have visible labels or an explicit non-duplicated accessible name.
- Focus uses a visible 2px warp-blue outline with offset in both themes.
- Dialog, Sheet, Drawer, Menu and Popover behaviors include opening focus, keyboard traversal, Escape/outside close where applicable, background inertness and focus return.
- Current state is never color-only. Pair color with text, icon, checked/pressed state, badge or progress semantics.
- Use polite status announcements for saves, result counts, email completion and nonblocking feedback. Reserve alert behavior for errors requiring attention.
- Loading route chunks use Skeleton, failures use Alert with a recovery action, and empty data uses Empty with a next step. No state may render an unexplained blank region.
- Toasts last approximately five seconds and include undo for reversible local mutations.
- Local mock actions must use language such as "演示" (demo) or "模拟" (mock), or clearly local feedback where a user might otherwise infer a production side effect.

### Delivery Order

- Phase 1: establish semantic tokens, local assets, typography, theme persistence and primitive wrappers.
- Phase 2: implement History API route parsing, 404, shared shell, desktop/mobile navigation, search, toolbar, notifications and account menu.
- Phase 3: implement landing and authentication flows, including validation and completion states.
- Phase 4: implement home, catalog URL state, series detail season state and media card patterns.
- Phase 5: implement watch layout, responsive episode selection, player controls, danmaku and comments.
- Phase 6: implement personal shell, favorites, history, notifications and settings persistence/security demonstrations.
- Phase 7: implement admin role preview, tables, inspectors, dialogs, moderation, invitations and statistics.
- Phase 8: run full-route visual/accessibility acceptance, resolve defects, run production build and deploy the accepted prototype.
- Complete and visually accept each phase before starting the next. Do not postpone shared shell or responsive defects to the final phase.

## Testing Decisions

### Primary Test Seam

- The primary and highest test seam is the complete application in a real browser at its public routes. Tests assert externally visible behavior: rendered content, navigation result, URL restoration, focus movement, overlay behavior, responsive layout and feedback states.
- Do not test internal component state, CSS class names or implementation-specific hook calls when the same behavior can be observed through roles, labels, URL, focus and pixels.
- Use the existing coss-ui behavior as the semantic primitive seam. Do not duplicate tests for Base UI internals; test that each composed application workflow preserves the expected external contract.

### Unit-Test Seams

- Unit-test pure route parsing and normalization for catalog, series season, watch selection, personal area and history state.
- Unit-test multilingual matching, sorting and focus-candidate decisions for favorites/history.
- Unit-test versioned account-settings parsing and serialization, including damaged data, unknown versions and exclusion of security state.
- Unit-test form validators and notification grouping where behavior is independent of rendering.
- Follow the existing `node:test` plus strict assertion style for pure modules.

### Browser Route Matrix

- Public: landing, login password, login two-factor modes, OAuth onboarding, register form/success, forgot-password form/success and 404.
- Core member: home populated/empty lane, catalog default/filtered/no-result/invalid query, series detail season one/later season and movie detail.
- Watch: wide desktop controls, consolidated tablet controls, phone drawers, episode switch, danmaku validation/report and comment add/reply/delete/report.
- Personal: favorites grid/list/search/no-result/removal/undo, history restored query/clear confirmation/undo, notifications all/unread/mark-all-read.
- Settings: route normalization, all four deep links, Back/Forward, save states, storage reload/failure fallback, theme modes and every security confirmation.
- Admin: admin/uploader role previews, every subsection, filters/no-results, content/upload/invite dialogs, calendar, moderation outcomes and statistics range.

### Required Interaction Checks

- Exercise keyboard Tab, Shift+Tab, arrow keys, Enter, Space and Escape on navigation, search, toolbars, tabs, toggles, menus, popovers, sheets, drawers and dialogs.
- Confirm overlays trap focus when modal, make background content unavailable, close by every specified method and return focus to the originating or stable fallback control.
- Confirm Back/Forward and refresh restore legal route state and safely normalize illegal state.
- Confirm theme changes immediately update the rendered page and browser theme color; verify fixed player colors in every theme.
- Confirm loading, error, empty, success, destructive confirmation, undo and save feedback states where the feature exposes them.
- Confirm forms reject blank/invalid values, render associated error text and focus the first invalid control.

### Required Visual Checks

- Start the local Vite development server and record the actual URL.
- Inspect every affected route and important state at 320px, 768px, 1024px and 1440px.
- Inspect real screenshots, not only DOM or source. Check blank/black content, missing local images/fonts, horizontal overflow, clipping, text collision, unexpected overlap, fixed-header/bottom-nav obstruction, player/episode collision, spacing and hierarchy.
- At 320px, specifically check auth field fit, bottom navigation, media card labels, settings actions, admin dialogs and player drawers.
- At 768px and 1024px, specifically check the navigation breakpoint, personal-area Sheet, episode lane, table actions and dialog/calendar width.
- At 1440px, specifically check sidebar width, content maximum width, four-column lanes, series summary and two-column watch layout.
- Check light, dark and follow-system themes where relevant. Check reduced motion for any changed animation or danmaku behavior.
- Check the browser console and runtime for errors on public, core member, watch, personal/settings and admin route groups.

### Build and Deployment Gate

- A TypeScript/production build must pass after implementation, but build success alone is not visual acceptance.
- After browser acceptance, run the repository deployment script. Record the exact remote preview URL emitted by Wrangler.
- If browser control, build, authentication, network or deployment fails, report the local result and remote result separately and name the exact outstanding limitation.
- Completion reporting must include the local preview URL, routes/states checked, all four viewport sizes, screenshot observations, console findings, production build result and deployment URL/result.

## Out of Scope

- Real email/password authentication, OAuth, Passkey, TOTP, backup-code verification, session management or authorization enforcement.
- Real Cloudflare Turnstile validation.
- Real HLS playback, ArtPlayer integration, JASSUB rendering, media decoding, fullscreen/Picture-in-Picture browser integration or sprite generation.
- Real API requests, Cloudflare D1/KV/R2 data, signed playback tickets, caching or Workers backend logic.
- Real uploads, multipart transfer, ffprobe, transcoding, media quality control, publishing, rollback or deletion.
- Real danmaku/comment persistence, realtime transport, moderation enforcement, progress synchronization, favorites, notifications or email delivery.
- Real admin permissions, user sanctions, invitation issuance, analytics or operational audit logs.
- Full three-language interface localization. Content metadata examples may be multilingual; the prototype interface remains primarily Simplified Chinese.
- Pagination, context menus, preview cards or decorative frames without a PRD-defined workflow.
- SEO, robots headers, production security hardening, backend performance targets and infrastructure provisioning.
- New visual-test infrastructure, a new component library, a new state-management framework or broad architectural rewrite.
- Changes to the established product name, information architecture, route map, palette or interaction patterns without a new product decision.

## Further Notes

- "Prototype complete" means that the user-visible state and interaction can be evaluated, not that the underlying business operation exists.
- Mock data should be deterministic and rich enough to demonstrate populated, filtered, partially completed, completed, empty, loading, error and feedback states. Do not generate random data at runtime.
- Keep a small number of representative series and episodes rather than reproducing the full Star Trek catalog. Coverage of state variety matters more than record volume.
- Preserve copyright and compliance language where the public experience refers to access or content. Do not present non-profit status as a legal exemption.
- When a requirement is still ambiguous during execution, first inspect the accepted current prototype and Appendix B. If neither resolves it, stop and request a product decision instead of inventing a new interaction.
- The executing agent should maintain a phase checklist and attach visual observations to each checkpoint. A route is not done until its narrowest and widest required states have been inspected.
