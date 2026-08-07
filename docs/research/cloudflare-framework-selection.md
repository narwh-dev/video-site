# Cloudflare 全栈框架选型研究：Next.js、React Router Framework Mode 与 React SPA

> 文档访问/核实日期：**2026-08-06**
> 结论适用范围：本项目当前规划阶段；目标运行时为 Cloudflare Workers，数据与对象存储为 D1/R2，后台由 Cloudflare Access 门禁，公开目录需要全栈 SSR。
> 来源规则：只引用产品/项目的一方文档与一方源码仓库；未采用博客测评、论坛回答或第三方兼容性列表。

## 1. 执行结论

### 1.1 明确建议

**本项目选择 React Router Framework Mode + Vite + `@cloudflare/vite-plugin`。不要选择纯 React SPA；Next.js + `@opennextjs/cloudflare` 保留为出现不可替代的 Next 专属需求时的备选。**

理由：

1. React Router 的 Worker 入口、bindings 注入、本地 `workerd` 开发与部署链路更直接；`@cloudflare/vite-plugin` 由 Cloudflare 维护，不需要将其他平台的构建产物二次转换为 Worker。[Cloudflare React Router 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)、[Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
2. 本项目的服务端需求集中于 SSR 目录查询、表单 CRUD、认证、D1/R2 bindings、流式媒体代理与 Cloudflare 缓存，可由 loaders、actions、resource routes 和 Worker 入口直接实现；当前 PRD 不依赖 RSC、PPR、Next middleware 或 Next ISR。
3. Auth.js 没有 React Router 正式集成，但认证供应商不是产品需求。Better Auth 有正式 React Router handler、Cloudflare Workers/D1、GitHub provider 与 magic-link plugin 文档，`sendMagicLink` 可调用 Resend，因此无需为保留 Auth.js 而锁定 Next.js。[Better Auth React Router](https://www.better-auth.com/docs/integrations/react-router)、[Better Auth D1](https://www.better-auth.com/docs/concepts/database#example-cloudflare-d1)、[GitHub provider](https://www.better-auth.com/docs/authentication/github)、[Magic link plugin](https://www.better-auth.com/docs/plugins/magic-link)、[Cloudflare Workers + Resend](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/)
4. 纯 SPA 不满足“全栈 SSR”硬约束。Cloudflare 将 SPA 定义为 CSR、浏览器再向 API 取数；即使 SPA 与 API Worker 一次部署，它仍不是 SSR。[Workers SPA 路由文档](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)

### 1.2 何时应反选 React Router、改用 Next.js

只有出现以下一项或多项不可替代需求，并通过原型证明其收益高于 OpenNext 适配成本时，才改用 **Next.js + `@opennextjs/cloudflare`**：

- 产品明确依赖 RSC、PPR、Next Server Actions、Next middleware 或 Next 生态中没有可接受替代的库。
- 内容量与更新模型确实需要 Next ISR、`revalidatePath`/`revalidateTag`，且团队愿意部署和维护 OpenNext 的 R2 incremental cache、DO queue 与 tag cache。[OpenNext 缓存组件](https://opennext.js.org/cloudflare/caching)
- 项目必须使用 Auth.js 的正式框架集成，且不接受 Better Auth 或其他有 Workers/React Router 支持的方案。
- `next/image` 的框架级 API 带来经测量的显著收益，且自行使用 Cloudflare Images transformation 不满足需求。

即使出现上述需求，也必须在 M0 对 OpenNext build/preview、bundle、冷启动、SSR、认证和 R2 Range 做生产运行时验证。Cloudflare 正式提供 Next.js 部署指南并不等于 OpenNext 是 Cloudflare 自维护的原生框架层。[Cloudflare Next.js 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

### 1.3 何时才可选纯 React SPA

只有明确删除“公开页面运行时 SSR/SEO/首屏 HTML”要求，并接受浏览器通过 API 获取目录、用户和管理数据时，才选择 React SPA + Vite。Cloudflare 的官方 React 模板确实是“一套部署中的 SPA 静态资源 + Worker API”，但客户端不能直接访问 bindings，必须经 Worker API。[Cloudflare React + Vite 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/)

## 2. 本项目的实际判定基线

本项目不是简单内容展示站。现有 [总体 PRD](../PRD.md) 和 [前端 PRD](../PRD-frontend.md) 要求：

- 公开系列、季、单集、电影、搜索、详情和播放页面；公开内容适合 SSR 输出可索引、可分享的首屏 HTML。
- D1 存目录、用户、收藏、观看历史、弹幕、审核和审计数据。
- 私有 R2 视频由 Worker 解析/代理，不能暴露原始私有 URL；必须处理签名过期和 HTTP Range。
- Better Auth 提供 GitHub OAuth 与 magic link，邮件发送回调使用 Resend；Access 单独保护 `/admin` 与后台 API。
- 管理端有大量 CRUD、筛选、分页、审核和审计表单。
- MP4/HLS 内容不应作为 Workers Static Assets 上传。Static Assets 单文件上限为 25 MiB，而 R2 Worker binding 能返回 `ReadableStream` 并支持 ranged reads，正好符合媒体代理边界。[Workers 限额](https://developers.cloudflare.com/workers/platform/limits/)、[R2 Workers API 与 ranged reads](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)

因此选型权重依次是：认证正确性与安全边界、Workers/D1/R2 原生可操作性、SSR 与 streaming、部署可复现性、缓存与图片能力，最后才是框架功能数量。

## 3. 截至 2026-08-06 的支持状态

| 方案 | 当前一方支持状态 | 版本/维护事实 | 判断 |
| --- | --- | --- | --- |
| Next.js + OpenNext | Cloudflare 文档明确支持并提供 C3、自动配置、官方模板；“大多数 Next.js 功能”受支持 | Cloudflare 官方模板当前锁定 Next 16.0.7、`@opennextjs/cloudflare` 1.14.0；适配器与文档标注由 **OpenNext community** 维护 | 可用于生产，但有社区适配层与版本跟随风险 |
| React Router Framework + Cloudflare Vite plugin | Cloudflare 当前框架页和插件页写“React Router v8 官方 SSR 支持” | Cloudflare 官方模板当前仍写“React Router 7”并锁定 7.9.6、Vite plugin 1.15.3；模板依赖刷新提交日期为 2026-05-29 | v7 仍有一方模板实证，但官方叙述已转向 v8；属于升级过渡期 |
| React SPA + Vite | Cloudflare 提供 C3、官方模板、Vite 插件、SPA 静态资源路由与 Worker API | Cloudflare 官方 React 模板由 `cloudflare/templates` 维护 | 正式支持，但不提供运行时 SSR |

来源：

- Next 支持表、部署和自动配置：[Cloudflare Next.js 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)、[自动配置](https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/)
- Next 当前模板依赖：[Cloudflare `next-starter-template/package.json`](https://github.com/cloudflare/templates/blob/main/next-starter-template/package.json)
- OpenNext 维护归属与工作原理：[OpenNext Cloudflare 文档](https://opennext.js.org/cloudflare)、[OpenNext 一方仓库](https://github.com/opennextjs/opennextjs-cloudflare)
- React Router 当前 Cloudflare 表述：[Cloudflare React Router 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)、[Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
- React Router v7 当前模板与最后刷新提交：[Cloudflare `react-router-starter-template/package.json`](https://github.com/cloudflare/templates/blob/main/react-router-starter-template/package.json)、[2026-05-29 依赖刷新提交](https://github.com/cloudflare/templates/commit/72bc7c63b9dd2ab3b3aeb6b1625dac9274711a3c)
- SPA 当前模板与框架页：[Cloudflare React + Vite 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/)、[Cloudflare React 模板](https://github.com/cloudflare/templates/tree/main/react-starter-template)

### 3.1 React Router v7 文档/模板不一致应如何解释

截至核实日存在真实的一方来源不一致，不能把任何一边省略：

- Cloudflare 框架指南（2026-06-19 更新）和 Vite 插件指南（2026-07-03 更新）均写“React Router v8”。[框架指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)、[插件指南](https://developers.cloudflare.com/workers/vite-plugin/)
- Cloudflare `templates/main` 中的正式发布模板仍明确描述“React Router 7”，依赖为 7.9.6，并使用 `@cloudflare/vite-plugin` 1.15.3。[模板 package.json](https://github.com/cloudflare/templates/blob/main/react-router-starter-template/package.json)、[模板 Vite 配置](https://github.com/cloudflare/templates/blob/main/react-router-starter-template/vite.config.ts)
- React Router 的版本化 7.9.4 文档仍可访问；v7 middleware 需要 `future.v8_middleware`，说明它本身就是向 v8 语义迁移的功能。[v7.9.4 middleware](https://reactrouter.com/7.9.4/how-to/middleware)

所以本报告对题设“React Router v7”给出可行性评价，但新项目不应手工长期锁死某个旧 v7：应通过 C3 创建、提交 lockfile、记录实际生成版本，并在 M0 验证 v8 升级。不能仅依据 Cloudflare 页面中的“v8”字样宣称当前公开模板已经完成 v8 切换。

## 4. 三种部署链路与适配层

### 4.1 Next.js + `@opennextjs/cloudflare`

部署链路：

```text
Next.js source
  -> next build
  -> @opennextjs/cloudflare 转换 Next 构建产物
  -> .open-next/worker.js + .open-next/assets
  -> Wrangler / opennextjs-cloudflare deploy
  -> Cloudflare Worker + Workers Static Assets
```

关键事实：

- OpenNext 不是 Next.js 内建的 Workers target。适配器先运行标准 Next build，再把产物转换成可由 Wrangler 本地运行和部署的 Worker 格式。[OpenNext 工作原理](https://opennext.js.org/cloudflare#how-opennextjscloudflare-works)
- Worker 入口是 `.open-next/worker.js`，静态资源目录是 `.open-next/assets`，必须启用 `nodejs_compat` 且 compatibility date 至少为 2024-09-23。[Cloudflare 手工配置](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- 日常 `next dev` 跑在 Node.js，不是生产 `workerd`；生产等价验证必须执行 OpenNext build/preview。OpenNext 自己也要求部署前用 Workers runtime preview。[Cloudflare Next.js 开发/预览说明](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)、[OpenNext 开发部署流程](https://opennext.js.org/cloudflare/howtos/dev-deploy)
- 若需要额外导出 Durable Object、scheduled handler 等，可以自定义 Worker，复用生成的 fetch handler；这比 React Router 的直接 Worker 入口多一层生成产物依赖。[OpenNext Custom Worker](https://opennext.js.org/cloudflare/howtos/custom-worker)

适配层归属：`@opennextjs/cloudflare` 由 OpenNext 社区维护；Cloudflare 官方文档、C3、Wrangler 自动配置和 Cloudflare 模板正式采用它。应把“Cloudflare 官方支持部署路径”和“适配器由 Cloudflare 自己维护”严格区分。[OpenNext 文档页脚与仓库](https://opennext.js.org/cloudflare)、[Cloudflare Next.js 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

### 4.2 React Router v7 Framework Mode + Vite + `@cloudflare/vite-plugin`

部署链路：

```text
React Router route modules + workers/app.ts
  -> react-router Vite plugin + Cloudflare Vite plugin
  -> client build (build/client) + server build / Worker
  -> generated deployment config
  -> wrangler deploy
  -> Cloudflare Worker + Workers Static Assets
```

关键事实：

- C3 模板包含 `react-router.config.ts`、`vite.config.ts`、`workers/app.ts` 和 Wrangler 配置；Worker fetch handler 直接调用 React Router `createRequestHandler`，并把 `{ env, ctx }` 注入 load context。[Cloudflare React Router 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)、[Cloudflare 模板 Worker 入口](https://github.com/cloudflare/templates/blob/main/react-router-starter-template/workers/app.ts)
- `@cloudflare/vite-plugin` 用 Vite Environment API 把 SSR 环境直接放进 Workers runtime；本地开发即运行于 `workerd`，bindings 使用本地模拟或 remote bindings。[Cloudflare Vite plugin 概览](https://developers.cloudflare.com/workers/vite-plugin/)、[Vite environments](https://developers.cloudflare.com/workers/vite-plugin/reference/vite-environments/)
- 插件自身位于 Cloudflare `workers-sdk` 仓库，由 Cloudflare 维护；React Router 框架由 React Router 项目维护。这里仍有两个项目的版本配合，但没有把另一平台的部署产物二次转换为 Workers 格式。[Cloudflare 插件仓库](https://github.com/cloudflare/workers-sdk/tree/main/packages/vite-plugin-cloudflare)、[React Router Framework 安装](https://reactrouter.com/start/framework/installation)
- 当前 Cloudflare 指南明确写：通过 Cloudflare Vite plugin 使用 React Router 时，**SPA mode 和 prerendering 暂不支持**。这不影响本项目所需的运行时 SSR，但意味着不能把 React Router 自身的 `ssr:false`/prerender 文档直接当成 Cloudflare 插件已支持能力。[Cloudflare React Router 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)、[React Router 渲染策略](https://reactrouter.com/7.9.4/start/framework/rendering)

### 4.3 纯 React SPA + Vite（可附 Worker API）

部署链路：

```text
React client source + optional worker/index.ts
  -> Vite build + Cloudflare Vite plugin
  -> dist static assets + Worker API bundle
  -> wrangler deploy
  -> one Worker deployment unit: Static Assets + optional API Worker
```

关键事实：

- Cloudflare 官方模板把 `src/App.tsx` 作为客户端，把 `worker/index.ts` 作为后端 API；`not_found_handling = "single-page-application"` 令导航回退到 `index.html`。[Cloudflare React + Vite 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/)
- Vite 默认生成 `dist` 静态文件；加入 Cloudflare Vite plugin 后，`vite build` 再由 `wrangler deploy` 部署，可同时增加后端 API。[Vite 官方静态部署文档的 Cloudflare 部分](https://vite.dev/guide/static-deploy.html#cloudflare)
- 静态资产通常先于 Worker 匹配，SPA 导航可不触发 Worker；`run_worker_first` 可只让 `/api/*` 等路径先进 Worker。[Workers SPA 高级路由](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- 这里没有 SSR adapter，因为根本没有运行时 SSR。即使把 React Router 作为 library/data mode 加进客户端，也不会自动变成 Framework Mode。[React Router 三种 mode](https://reactrouter.com/start/modes)

## 5. 关键能力边界对比

| 边界 | Next.js + OpenNext | React Router Framework + CF Vite plugin | 纯 React SPA + Vite |
| --- | --- | --- | --- |
| Workers bindings | Wrangler 声明后，通过 `getCloudflareContext().env` 访问；SSG 时需 async mode | Worker 直接拿 `env/ctx`，模板注入 `context.cloudflare`，loader/action 可直接使用 | 浏览器不能访问；仅 `worker/index.ts` API 可访问，再由客户端 fetch |
| D1/R2 | 可在 Server Component、Route Handler、Server Action 等服务端路径访问 | 可在 loader/action/resource route 或 Worker 入口访问 | 必须在 API Worker 访问 |
| Node.js 兼容 | 强制 `nodejs_compat`，Next 使用其“Node runtime”语义 | 运行在 `workerd`；需要 Node 包时启用兼容层，自动配置示例会加该 flag | 客户端无 Node 运行时；API Worker 按依赖选择 compat |
| SSR | 支持 | 支持，且为 Cloudflare React Router 模板默认 | 不支持 |
| HTML/data streaming | OpenNext 支持 response streaming | React Router 支持 Suspense promise streaming，官方模板使用 `renderToReadableStream` | 无 SSR streaming；API/R2 body 仍可用 Web Streams |
| 静态资源 | `.open-next/assets` -> Workers Static Assets | `build/client` -> Vite plugin/Workers Static Assets | `dist` -> Workers Static Assets，SPA fallback |
| ISR/再验证 | 支持，但生产配置可能需要 R2 incremental cache、DO queue、D1/DO tag cache | 没有 Next 式 ISR；可 runtime SSR + Workers Cache，自行定义 TTL/tag purge | 无 HTML ISR；静态资源按部署更新，API 可自行缓存 |
| 图片优化 | `next/image` 可接 Cloudflare Images binding 或 custom loader | 无框架内建等价物；直接使用 Images binding/URL transformation，自建组件/路由 | 同 React Router 的手工 Cloudflare Images 路径 |
| Framework middleware | 支持标准 Next middleware；Node.js middleware 尚不支持 | v7 需 `future.v8_middleware`；也可在直接 Worker 入口做全局前置逻辑 | 无服务端框架 middleware；Worker fetch handler 自行实现 |
| 数据变更 | Next Server Actions、Route Handlers 均受支持 | route `action` 仅服务端执行并从客户端 bundle 删除；完成后自动 revalidate loaders | 客户端调用显式 API；自行管理重取和乐观状态 |
| Cloudflare Access | 框架无关，放在 Worker/域名前；应用仍应校验 JWT | 同左 | 同左；注意 SPA 导航与 API 路由范围配置 |
| 适配维护者 | OpenNext community；Cloudflare 正式采用 | Cloudflare 维护 Vite plugin；React Router 维护框架 | Cloudflare 维护 Vite plugin/模板；React/Vite 各自维护前端工具 |

### 5.1 Bindings、D1 与 R2

Bindings 是 Workers runtime 注入的 capability，不是任一 React 框架的数据库 SDK。D1 通过 `env.DB: D1Database` 查询，R2 通过 bucket binding 读写，三种方案的底层能力相同。[D1 Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/)、[R2 Worker binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)

差异只在 bindings 到业务代码的距离：

- Next：`getCloudflareContext()` 提供 `env/cf/ctx`；SSG/ISR 构建路径须使用 async mode，并注意构建期会读取本地或 remote binding 数据。[OpenNext bindings](https://opennext.js.org/cloudflare/bindings)
- React Router：Cloudflare 模板把 bindings 放入 `context.cloudflare.env`，loader/action 直接消费；Worker 入口也能额外导出 Durable Objects、Workflows 等。[Cloudflare React Router bindings 示例](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)
- SPA：Cloudflare 明确指出 React 客户端不能直接访问 bindings，只能经 Worker API。[Cloudflare React bindings 说明](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/)

对本项目私有媒体，三者都能把 R2 `object.body` 作为 `ReadableStream` 返回，并把请求 Range 传给 `R2Bucket.get`。这部分应作为独立 HTTP 契约测试，不能假定“框架支持 streaming”就自动正确生成 `206`、`Content-Range`、`Content-Length`、ETag 和 token-expiry 行为。[R2 ranged reads](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#ranged-reads)、[R2 Worker 使用示例](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)

### 5.2 Node.js 兼容层

Workers 的 `nodejs_compat` 不是完整 Node.js。Cloudflare 文档将 API 分为原生完整/部分实现和 import-only/non-functional stubs；某些 polyfill 方法调用时仍会 noop 或抛出未实现错误。[Workers Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)

因此：

- Next/OpenNext 的 Node runtime 只是通过 Workers compatibility layer 实现，不能把“Next Node runtime”理解为可运行任意 Node 服务端包。
- React Router/SPA Worker 可优先使用 Web APIs 和 Cloudflare bindings，只为确实依赖 Node API 的包启用 compat，运行时面更小。
- 任一方案引入 Auth、ORM、图像或媒体依赖后，都必须在 `workerd` preview/E2E 中验证，不能只通过 Node/Vite dev 判定兼容。

### 5.3 SSR 与 streaming

- Cloudflare 的 Next 支持表明确列出 SSR 和 response streaming。[Cloudflare Next feature table](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- React Router Framework 默认 `ssr:true`，loader 可返回未 await 的 promise，由 Suspense/`<Await>` 流式交付；v7 文档默认在 4950 ms 后拒绝未完成 promise，可由 `streamTimeout` 调整。[React Router rendering](https://reactrouter.com/7.9.4/start/framework/rendering)、[Streaming with Suspense](https://reactrouter.com/7.9.4/how-to/suspense)
- Cloudflare React Router 模板的 server entry 使用 `renderToReadableStream`，是 Workers Web Streams 路径，不依赖 Node `renderToPipeableStream`。[Cloudflare 模板 `entry.server.tsx`](https://github.com/cloudflare/templates/blob/main/react-router-starter-template/app/entry.server.tsx)
- SPA 只有静态 `index.html` + hydration/CSR；API 与视频响应可 stream，但那不是 React HTML SSR。

### 5.4 静态资源与缓存/ISR

Workers Static Assets 会和 Worker 一次部署，默认匹配到文件时不执行 Worker，并在 Cloudflare 网络自动缓存。Vite plugin 会自动把 client build output 写入生成的 `assets.directory`；Next/OpenNext 则显式使用 `.open-next/assets`。[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Vite plugin static assets](https://developers.cloudflare.com/workers/vite-plugin/reference/static-assets/)、[OpenNext static assets](https://opennext.js.org/cloudflare/howtos/assets)

缓存需要区分三层：

1. **静态资源缓存**：三者都有；视频文件不放这里，因为单文件 25 MiB 上限，应放 R2。[Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
2. **公开 SSR HTTP 响应缓存**：框架无关的 Workers Cache 可在 Worker 前按 `Cache-Control` 缓存、tier、collapse requests，并支持 tag/path purge；用户态、`Set-Cookie` 和 Authorization 响应必须 bypass/private。[Workers Cache](https://developers.cloudflare.com/workers/cache/)
3. **Next 数据/路由缓存与 ISR**：OpenNext 为 Next 语义提供 incremental cache、revalidation queue、tag cache。小站推荐组合是 R2 incremental cache + DO queue + D1 tag cache；如果只做 SSR，不需要这些缓存配置。[OpenNext caching](https://opennext.js.org/cloudflare/caching)

React Router 没有 Next 式 ISR API。框架自身有 build-time prerender，但 Cloudflare 当前明确说 Cloudflare Vite plugin 的 React Router 集成暂不支持 prerender；所以本项目若选 RR，应以 runtime SSR + Workers Cache 为缓存模型，并在后台 CRUD 成功后主动 purge 对应标签/路径。[Cloudflare React Router 限制](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)、[Workers Cache purge](https://developers.cloudflare.com/workers/cache/#purging-the-cache)

另一个容易忽略的边界：低层 `caches.default` Cache API 的内容不跨数据中心复制，`cache.put` 不支持 tiered caching，而且 Cloudflare 文档写明 Access 前置的 Worker 当前不可使用 Cache API。Access 路径不应依赖该 API；优先使用新的 Workers Cache 或让 `/admin` 全部 private/no-store。[Workers Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)

### 5.5 图片优化

Next/OpenNext 是唯一提供框架级图片组件适配的方案：定义 `IMAGES` binding 后，OpenNext 提供 Next-compatible image optimization API；也可用 custom loader 指向 `/cdn-cgi/image/...`。限制包括仅支持指定图片格式、`minimumCacheTTL` 不受支持、转换可能产生额外费用。[OpenNext image optimization](https://opennext.js.org/cloudflare/howtos/image)、[Cloudflare Images + Next 集成](https://developers.cloudflare.com/images/optimization/transformations/integrate-with-frameworks/)

React Router 与 SPA 都能使用同一个 Images binding，把 R2 原始字节直接交给 `env.IMAGES.input(...).transform(...).output(...)`，但响应式 `srcset`、允许尺寸、缓存键和组件 API 由项目自己实现。Images binding 响应不会自动缓存，Cloudflare 建议启用 Workers Cache。[Images binding](https://developers.cloudflare.com/images/optimization/binding/)

本项目有大量海报、集缩略图和横幅，Next 的集成是实际收益；但它不处理视频转码，也不应与 R2 视频代理混为一谈。

### 5.6 Middleware、Access 与 Server Actions

**Next middleware**：OpenNext 支持 middleware，但 Next 15.2 引入的 Node.js middleware runtime 尚不支持。代码必须留在受支持的 middleware runtime/API 面内。[Cloudflare Next feature table](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

**React Router middleware**：v7 需开启 `future.v8_middleware`，会改变 loader/action context 类型；v8 文档已把 middleware 作为正式 API。即使不用 route middleware，也可在项目直接拥有的 Worker entry 中做请求级前置逻辑。[v7 middleware](https://reactrouter.com/7.9.4/how-to/middleware)、[当前 middleware](https://reactrouter.com/how-to/middleware)

**Cloudflare Access**：它在用户与 origin/Worker 之间作为认证层，所有 Access application 默认 deny，命中 Allow policy 才放行；框架 middleware 不能替代它。Cloudflare 同时要求 origin/Worker 校验 `Cf-Access-Jwt-Assertion` 的签名、issuer 和 audience，防止绕过配置。因此三种框架的 Access 安全能力相同，差别只在 JWT 校验代码放在 Next middleware/Route Handler、RR Worker/middleware，还是 SPA API Worker。[Access self-hosted app](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)、[Workers 验证 Access JWT](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)

**Server Actions**：

- OpenNext 明确支持 Next Server Actions。[Cloudflare Next feature table](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- React Router v7 也把服务端 route `action` 称为 Server Action：只在服务器执行、从 client bundle 删除，提交完成后自动重新验证页面 loaders；但它是基于路由/Form/fetcher 的数据变更模型，不是 Next RSC Server Action 协议。[React Router v7 actions](https://reactrouter.com/7.9.4/start/framework/actions)
- SPA 只有 `clientAction`/客户端事件和显式 API 请求；服务端授权与 D1 变更必须在 Worker API 重做，不能信任客户端。

## 6. 对本项目功能的适配与风险

### 6.1 Next.js + OpenNext

**适配性高：**

- 公开目录、搜索、详情使用 SSR/RSC；管理表单使用 Server Actions 或 Route Handlers；Auth.js 走其 Next.js 正式集成。
- D1/R2 均可经 `getCloudflareContext` 注入；R2 播放代理可用 Route Handler 返回 Web `Response` stream。
- `next/image` + Cloudflare Images 对项目海报/缩略图直接有价值。
- 后续确需内容页 ISR、按后台变更 `revalidatePath`/`revalidateTag` 时已有适配实现。

**主要风险：**

- 运行时与开发环境有差异：`next dev` 是 Node，生产是 `workerd`；必须把 OpenNext preview 放进 CI/E2E。
- 适配器由社区维护，Next 大版本/实验特性升级需等待兼容；不要无条件跟随 Next canary。
- 强制 Node compatibility layer 增加 bundle/兼容面。Workers 压缩后脚本上限为 Free 3 MiB、Paid 10 MiB，SSR/认证/ORM 依赖必须做 dry-run 检查。[Workers size limits](https://developers.cloudflare.com/workers/platform/limits/)
- ISR 不是“打开一个 flag”即可完整生产化；OpenNext 推荐配置会额外占用 R2、DO 和 D1。MVP 应先用 SSR + 静态资源缓存，只在有明确命中率/负载需求后启用 ISR。
- 私有视频 Range 代理是框架外 HTTP correctness 问题。不要让 Server Action 承担媒体响应；应使用 Route Handler 或轻量独立 Worker，并做大文件流式/Range E2E。

### 6.2 React Router Framework Mode + Cloudflare Vite plugin

**适配性高：**

- loader/action/fetcher 很适合目录读、收藏/历史、弹幕投稿和后台 CRUD；action 后自动重验 loader，管理端状态模型自然。
- resource route 可直接返回视频、字幕、JSON 等 `Response`；Cloudflare bindings 在 request context 内，R2 streaming 边界更短。[React Router resource routes](https://reactrouter.com/how-to/resource-routes)
- 本地开发即 `workerd`，更早暴露 Node API、bindings 和 streaming 差异。
- 可用 Workers Cache 给匿名目录 SSR 设置 TTL，并在管理 action 后 tag purge，不必引入 Next ISR 的 R2/DO/tag-cache 组合。
- Better Auth 的 React Router catch-all route 可直接调用 `auth.handler(request)`，D1 可作为内建数据库连接；GitHub provider 与 magic-link plugin 覆盖当前登录需求。[Better Auth React Router](https://www.better-auth.com/docs/integrations/react-router)、[Better Auth database](https://www.better-auth.com/docs/concepts/database)

**主要风险：**

- Better Auth 需要 Workers Node compatibility/AsyncLocalStorage 能力，必须在 `workerd` 中验证；固定当前稳定版本并只跟随其支持的最新稳定线。[Better Auth installation](https://www.better-auth.com/docs/installation)、[Cloudflare AsyncLocalStorage](https://developers.cloudflare.com/workers/runtime-apis/nodejs/asynclocalstorage/)
- Magic link 必须覆盖一次性消费、过期、重复点击、邮箱规范化与预注册账户测试；使用包含已知 magic-link 安全修复的版本，并评估 hashed token storage。[Better Auth security](https://www.better-auth.com/docs/reference/security)、[Magic-link security advisory](https://github.com/better-auth/better-auth/security/advisories/GHSA-qq9h-g4jm-xgf3)
- Better Auth 默认内存 rate-limit 不适合多实例 Workers，生产配置应使用 D1 或可靠 secondary storage。[Better Auth rate limit](https://www.better-auth.com/docs/concepts/rate-limit)
- Cloudflare 文档写 v8、模板仍锁 v7.9.6，存在升级窗口；必须 pin lockfile 并维护 v8 升级测试。
- Cloudflare plugin 当前不支持 RR prerender/SPA mode，因此不要把框架自身 SSG 文档当成部署能力；公开页采用 runtime SSR。
- 无 Next `<Image>`、ISR/tag revalidation 和 RSC 集成层，图片与 HTML 缓存策略由项目负责。
- v7 middleware 是 future flag；全局安全逻辑优先放 Access 和 Worker entry，不要把实验 route middleware 作为唯一防线。

### 6.3 纯 React SPA + Vite

**能实现的部分：**

- 播放器、弹幕 UI、后台高交互界面和所有客户端路由均可实现。
- 同一 Workers 部署可包含静态 SPA 与 `/api/*` Worker；API 可访问 D1/R2，Access 可门禁后台/API。
- 最少服务端框架代码、静态资源请求成本低，bindings 和 R2 proxy 逻辑完全原生 Worker。

**不适配当前约束：**

- 没有运行时 SSR，公开目录/搜索/详情初始 HTML 依赖 JS 与二次 API 请求，直接违反 PRD。
- 数据读取、变更、错误与 pending 状态需要在客户端和 API 两侧维护契约；相比 RR Framework 的 route loader/action，会产生更多 API plumbing。
- Access 只挡 `/admin` 静态导航仍不够：敏感 API 必须同样受 Access/应用授权保护，且 SPA fallback 路由要避免吞掉 OAuth callback/API 导航。[Workers SPA navigation caveat](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/#navigation-requests)
- 无框架图片优化、ISR、Server Actions 或服务端 route middleware。

## 7. React Router Framework Mode 与纯 Vite SPA 不能混为一谈

| 项目 | React Router Framework Mode | 纯 React SPA + Vite |
| --- | --- | --- |
| 顶层构建 | `@react-router/dev` Vite plugin + Cloudflare Vite plugin | `@vitejs/plugin-react` + Cloudflare Vite plugin |
| 路由定义 | Route Modules，框架生成类型与 server/client bundles | React Router library 可选；通常 BrowserRouter/Data Router，仅 client bundle |
| 首次文档请求 | Worker 执行 loaders 并 SSR HTML | Workers Static Assets 返回 `index.html`，浏览器 CSR |
| 客户端导航数据 | 自动请求 server loaders/`.data` | 客户端显式 fetch API 或 clientLoader |
| 变更 | server route `action`/Form/fetcher | 客户端事件 -> API endpoint |
| bindings | loader/action 的 server context 直接使用 | 浏览器绝不能使用；只有独立 API Worker 使用 |
| 产物 | client + SSR Worker | `dist` 静态文件 + 可选 API Worker |
| 当前 CF plugin 限制 | runtime SSR 支持；RR SPA/prerender 暂不支持 | SPA 是 Cloudflare 正式支持用例 |

React Router 自身的 Framework SPA Mode（`ssr:false`）又是第三个概念：它会在 build-time 预渲染 root shell，但 Cloudflare 当前明确建议需要 SPA 时使用 React 模板和 React Router library，而不是 Cloudflare plugin 的 RR Framework SPA Mode。[React Router SPA Mode](https://reactrouter.com/7.9.4/how-to/spa)、[Cloudflare React Router 注记](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)

## 8. 建议实施边界与 M0 决策门

采用 React Router Framework Mode 时，M0 应完成以下验证：

1. 用 Cloudflare C3 当前 React Router 模板创建最小项目，记录实际生成的大版本，pin React Router、Vite plugin 与 Wrangler，并提交 lockfile。
2. 配置独立 preview/production D1、R2、Images 和 secrets bindings；验证 bindings 通过 Worker entry/load context 到达 SSR loader、action 与 resource route，客户端 bundle 不包含绑定或密钥。
3. 验证 Better Auth stable + D1 + GitHub OAuth + magic-link plugin + Resend 回调，包括 cookie、session、CSRF/origin、一次性消费、过期、重复点击和 rate-limit storage。
4. 建立私有 R2 MP4/HLS Range 测试：首请求、分段、suffix range、条件请求、token 过期、HEAD/404、客户端 seek；确认响应全过程不 buffer 大对象。Workers 每 isolate 128 MiB，Cloudflare 明确建议大响应用 Streams。[Workers memory limits](https://developers.cloudflare.com/workers/platform/limits/#memory)
5. 验证 SSR/Suspense streaming、loaders/actions、resource routes、Cloudflare Images、Access JWT 校验和静态资源 headers。
6. 执行 `wrangler deploy --dry-run` 检查压缩 bundle 大小和 startup time；CI 使用 `workerd` 集成/E2E，而不是只在 Node 环境测试。
7. 匿名公开页面先按正确性做 runtime SSR；后续只对可公开共享的响应增加 Cloudflare 缓存，用户态和管理端保持 private/no-store。

**决策门：**若 React Router、Better Auth 与 Workers preview 均通过，且 bundle、冷启动、SSR streaming 与 R2 Range 达标，维持当前架构。若失败源于明确的框架能力缺口，先做最小 Next/OpenNext 对照原型再决定；不要退到 SPA 来规避 SSR 问题。

## 9. 最终排序

1. **React Router Framework Mode + `@cloudflare/vite-plugin`。** 它最符合 Cloudflare 原生优先的 Workers 全栈 SSR 架构；认证使用 Better Auth，新脚手架跟随 C3 实际生成版本并验证 v7/v8 过渡。
2. **Next.js + `@opennextjs/cloudflare`。** 仅在出现不可替代的 Next 专属需求时采用；能力面完整，但要承担社区适配层、版本跟随和 Node dev/`workerd` production 差异。
3. **纯 React SPA + Vite：不符合当前“全栈 SSR”约束。** 仅在正式删除 SSR 要求后考虑。

## 10. 主要一方来源索引

### Cloudflare Developers

- [Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [React Router on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)
- [React + Vite on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/)
- [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Cache](https://developers.cloudflare.com/workers/cache/)
- [Workers Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [D1 Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [Cloudflare Images binding](https://developers.cloudflare.com/images/optimization/binding/)
- [Cloudflare Access self-hosted applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Workers platform limits](https://developers.cloudflare.com/workers/platform/limits/)

### OpenNext Cloudflare

- [OpenNext Cloudflare overview and support](https://opennext.js.org/cloudflare)
- [Bindings](https://opennext.js.org/cloudflare/bindings)
- [Caching/ISR](https://opennext.js.org/cloudflare/caching)
- [Image optimization](https://opennext.js.org/cloudflare/howtos/image)
- [Develop and deploy](https://opennext.js.org/cloudflare/howtos/dev-deploy)
- [Static assets](https://opennext.js.org/cloudflare/howtos/assets)

### React Router 与 Vite

- [React Router modes](https://reactrouter.com/start/modes)
- [React Router v7 rendering strategies](https://reactrouter.com/7.9.4/start/framework/rendering)
- [React Router v7 actions](https://reactrouter.com/7.9.4/start/framework/actions)
- [React Router v7 streaming](https://reactrouter.com/7.9.4/how-to/suspense)
- [React Router v7 middleware](https://reactrouter.com/7.9.4/how-to/middleware)
- [Vite static deployment and Cloudflare integration](https://vite.dev/guide/static-deploy.html#cloudflare)

### 其他项目一方来源

- [Cloudflare 官方模板仓库](https://github.com/cloudflare/templates)
- [Cloudflare Vite plugin 源码](https://github.com/cloudflare/workers-sdk/tree/main/packages/vite-plugin-cloudflare)
- [OpenNext Cloudflare 源码](https://github.com/opennextjs/opennextjs-cloudflare)
- [Auth.js framework/status documentation](https://authjs.dev/getting-started)
- [Auth.js Cloudflare D1 adapter](https://authjs.dev/getting-started/adapters/d1)
- [Better Auth React Router integration](https://www.better-auth.com/docs/integrations/react-router)
- [Better Auth database and Cloudflare D1](https://www.better-auth.com/docs/concepts/database)
- [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github)
- [Better Auth magic-link plugin](https://www.better-auth.com/docs/plugins/magic-link)
