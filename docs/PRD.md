# PRD: Star Trek China 视频站（video.startrekchina.org）

| 项目 | 内容 |
| --- | --- |
| 文档状态 | Draft（规划阶段，尚未有应用脚手架） |
| 文档版本 | v0.4 |
| 最后更新 | 2026-08-06 |
| 相关文档 | [AGENT.md](../AGENT.md)、[README.md](../README.md)、[设计指导](../DESIGN.md)、[前端 PRD（高保真原型）](PRD-frontend.md) |

> 当前阶段聚焦前端高保真原型，页面级详细规格见 [前端 PRD](PRD-frontend.md)；本文件保留总体范围、约束与后端相关约定。

---

## 1. 背景与概述

Star Trek China 需要为社区提供一个视频目录与播放站点，承载系列剧集、分季、分集、电影等影视内容的浏览、检索、播放与社区互动。

本项目采用 **Cloudflare 优先（Cloudflare-first）** 的架构原则：运行时、数据库、对象存储、访问控制、预览/生产部署以及边缘分发全部使用 Cloudflare 生态服务，尽量不引入外部依赖。

站点目标域名：`video.startrekchina.org`。

## 2. 项目目标（Goals）

- 提供一个全栈（SSR）视频站点，以 React Router Framework Mode 运行于 Cloudflare Workers。
- 提供公开的目录浏览、搜索与详情页能力。
- 提供授权播放能力（MP4 / HLS），含字幕与弹幕展示。
- 提供用户功能：收藏、观看历史、登录后弹幕投稿。
- 提供管理后台：目录数据、来源（source）、字幕的 CRUD 以及弹幕审核。
- 提供持久化弹幕（persisted danmaku）模型。
- 全程使用 Cloudflare 服务承载数据、存储、访问控制与分发。

## 3. 非目标（Non-Goals / MVP 排除项）

MVP 明确**不做**以下事项：

- 不提供转码管线（transcoding pipeline）。
- 不支持公开上传。
- 不做外部元数据抓取或同步（内容录入为人工后台 CRUD）。
- 不做实时（Realtime）Durable Objects 弹幕或在线状态（仅做持久化弹幕）。
- 不实现 DRM，也不做 DRM 宣传。
- 不承诺浏览器端 MKV 播放（MKV 仅作为源文件/入库格式，浏览器播放目标为 MP4 与 HLS）。

## 4. 目标用户与角色

| 角色 | 描述 | 权限 |
| --- | --- | --- |
| 访客（Guest） | 未登录用户 | 浏览目录、搜索、查看详情、播放 resolver 标记为允许的内容、阅读已审核通过的弹幕 |
| 已登录用户（User） | 通过 Better Auth 登录（GitHub OAuth / Resend 邮件魔法链接） | 访客权限 + 收藏、观看历史、弹幕投稿 |
| 管理员（Admin） | 通过 Cloudflare Access 门禁 | 目录数据、来源、字幕 CRUD，弹幕审核（隐藏/删除），查看管理审计数据 |

## 5. 用户故事

### 5.1 访客

- 作为访客，我可以浏览系列、季、集、电影的目录列表，以便发现内容。
- 作为访客，我可以按关键词搜索内容，以便快速定位目标影视。
- 作为访客，我可以打开详情页查看元数据与可播放来源，以便了解内容。
- 作为访客，我可以播放被授权的内容（MP4/HLS），以便在线观看。
- 作为访客，我可以阅读已审核通过的弹幕，以获得观看氛围。

### 5.2 已登录用户

- 作为已登录用户，我可以收藏内容，以便日后快速找回。
- 作为已登录用户，我的观看历史会被记录，以便继续观看。
- 作为已登录用户，我可以提交弹幕（需管理员审核后展示），以参与互动。
- 作为已登录用户，我可以使用 GitHub OAuth 或邮箱魔法链接登录，以获得上述能力。

### 5.3 管理员

- 作为管理员，我可以通过 Cloudflare Access 门禁进入 `/admin` 与后台 API。
- 作为管理员，我可以对系列、季、集、电影、来源、字幕进行增删改查。
- 作为管理员，我可以隐藏或删除弹幕，以维护社区内容质量。
- 作为管理员，我可以查看管理审计记录，以便追踪后台操作。

## 6. 功能需求

### 6.1 公开目录与内容

| ID | 需求 | 优先级 |
| --- | --- | --- |
| F-101 | 提供公开的系列（series）/ 季（season）/ 集（episode）/ 电影（movie）目录浏览 | P0 |
| F-102 | 提供搜索能力（关键词检索目录元数据） | P0 |
| F-103 | 提供内容详情页（元数据 + 来源 + 字幕 + 弹幕入口） | P0 |
| F-104 | 目录数据由管理员手工 CRUD 维护，MVP 不做外部元数据同步 | P0 |

### 6.2 播放

| ID | 需求 | 优先级 |
| --- | --- | --- |
| F-201 | 浏览器播放目标为 MP4 与 HLS | P0 |
| F-202 | 使用 Artplayer（配合 hls.js）播放 HLS，支持原生 HLS 回退 | P0 |
| F-203 | 使用 `artplayer-plugin-danmuku` 展示弹幕 | P0 |
| F-204 | 字幕使用 WebVTT 格式 | P0 |
| F-205 | 播放页需处理签名 URL 过期与 Range 请求预期 | P0 |
| F-206 | 访客可播放 resolver 标记为允许的内容 | P0 |

### 6.3 用户与认证

| ID | 需求 | 优先级 |
| --- | --- | --- |
| F-301 | 普通用户登录使用 Better Auth，支持 GitHub OAuth 与 Resend 邮件魔法链接 | P0 |
| F-302 | 用户可收藏/取消收藏内容（favorites） | P0 |
| F-303 | 记录用户观看历史（watch history） | P0 |
| F-304 | 登录用户可提交弹幕，弹幕经审核后对访客可见 | P0 |
| F-305 | 用户功能与访客浏览、播放权限分离 | P0 |

### 6.4 管理后台

| ID | 需求 | 优先级 |
| --- | --- | --- |
| F-401 | `/admin` 与后台 API 由 Cloudflare Access 门禁保护（先于应用级逻辑执行） | P0 |
| F-402 | 目录数据（系列/季/集/电影）、来源、字幕的管理 CRUD | P0 |
| F-403 | 弹幕审核：隐藏或删除（moderation state） | P0 |
| F-404 | 记录管理操作审计数据（admin audit data） | P1 |

### 6.5 来源与播放保护

| ID | 需求 | 优先级 |
| --- | --- | --- |
| F-501 | 来源记录区分 provider 类型与访问行为：`public_url`、`r2`、`rustfs`、`openlist` | P0 |
| F-502 | 公有来源可直连公开 URL 返回 | P0 |
| F-503 | 私有 R2 来源经 Worker 代理端点解析，使用 TTL 受限的签名路径令牌 | P0 |
| F-504 | resolver 响应不得向客户端暴露原始私有 R2 URL 或持久密钥 | P0 |
| F-505 | RustFS / OpenList 作为 MVP 直接或外部来源；签名适配器为未来扩展 | P0 |
| F-506 | 签名 URL 视为访问控制与防盗链手段，而非法律上的分发授权或 DRM | P0 |

### 6.6 弹幕

| ID | 需求 | 优先级 |
| --- | --- | --- |
| F-601 | 持久化弹幕为 MVP 模型：访客可读已审核弹幕，登录用户可投稿，管理员可隐藏/删除 | P0 |
| F-602 | 实时 Durable Objects 弹幕为未来范围 | P1 |

## 7. 数据与存储模型

- **D1（关系型数据）**：系列、季、集、电影、来源、字幕、用户、收藏、观看历史、持久化弹幕、审核状态、管理审计数据。
- **R2（媒体对象）**：存放私有媒体对象，禁止以原始私有 URL 形式出现在客户端负载中。
- 新应用能力优先使用 Cloudflare 原生存储与数据服务；MVP 不引入外部数据库、对象存储、队列或媒体分发服务。

## 8. 技术架构要求（约束）

- 框架：React Router Framework Mode + TypeScript；不是纯 React SPA，也不使用 React Router Library Mode 代替全栈框架能力。
- 构建与运行时集成：Vite + Cloudflare 官方维护的 `@cloudflare/vite-plugin`，开发、预览和生产均以 Workers runtime（`workerd`）行为为准。
- 组件库：**coss ui** 为默认前端组件库（基于 Base UI + Tailwind CSS，复制粘贴自有模式），所有界面组件优先从 coss ui 选取；本地文档见 [coss-ui/README.md](coss-ui/README.md)。
- 设计指导：根目录 [DESIGN.md](../DESIGN.md) 作为项目级设计指导，高保真原型及后续前端实现均以其视觉系统、排版、色彩、间距、圆角与组件样式为设计基线。
- 样式与 UI：Tailwind CSS + coss ui 组件体系，干净极简的界面风格。
- SSR 与数据变更：公开页面使用 React Router runtime SSR；读取使用 route loaders，变更使用 route actions/fetchers，JSON、字幕与媒体代理等非页面响应使用 resource routes。
- Cloudflare bindings：D1、R2、Images 等 bindings 由 Worker 入口注入 React Router load context，只允许服务端 loader/action/resource route 或 Worker 入口访问。
- 运行时 API：优先使用 Web Platform API 与 Cloudflare bindings；仅为经过验证的依赖启用最小必要的 Node.js compatibility flag，并在 `workerd` 中验证。
- 缓存：MVP 不引入 Next.js ISR 语义；公开匿名 SSR 响应按需使用 Cloudflare Cache/HTTP 缓存，用户态、管理端及含 `Set-Cookie` 的响应必须 `private` 或 `no-store`。
- 图片：海报、缩略图和横幅按需使用 Cloudflare Images binding 或 URL transformations，不依赖框架专属图片组件。
- 部署：独立的 Cloudflare Workers 预览与生产环境。
- 访问控制：管理员走 Cloudflare Access；普通用户走 Better Auth，两者分离。
- 分发：Cloudflare 边缘分发 + Worker 路由用于播放解析与私有媒体代理。

### 8.1 框架选型决策

本项目选择 **React Router Framework Mode + Vite + `@cloudflare/vite-plugin`**，原因如下：

1. Cloudflare Vite plugin 由 Cloudflare 维护，SSR 开发环境直接运行在 Workers runtime，并可将 bindings 注入 route context；部署链路不需要把其他平台的构建产物二次转换为 Worker。
2. 本项目的主要服务端模式是目录查询、表单 CRUD、认证、R2 流式代理和 HTTP 缓存，均可由 loaders、actions、resource routes 与 Worker 入口直接表达，不依赖 RSC、Next Server Actions、Next middleware、PPR 或 ISR。
3. Next.js 可通过 `@opennextjs/cloudflare` 部署到 Workers，但该适配器由 OpenNext 社区维护，`next dev` 与生产 `workerd` 运行时不同；对“Cloudflare 原生优先”的新项目会增加适配层、版本跟随和环境差异。
4. 纯 React + Vite SPA 虽可与 Worker API 同部署，但不提供运行时 SSR，不满足公开目录、详情与搜索页面的 SSR 目标。

只有在后续出现不可替代的 Next.js 专属需求，并通过 M0 原型证明其收益高于 OpenNext 的适配成本时，才重新评估 Next.js。详细事实、能力边界和一方来源见 [Cloudflare 全栈框架选型研究](research/cloudflare-framework-selection.md)。

### 8.2 版本与当前平台边界

- 脚手架以 Cloudflare C3 当时生成的 React Router 模板为基线，提交 lockfile 并固定 React Router、Vite、`@cloudflare/vite-plugin` 与 Wrangler 版本；不在 PRD 中长期锁死某个框架大版本。
- 截至 2026-08-06，Cloudflare 文档已描述 React Router v8 支持，但官方模板仍处于 v7 到 v8 的过渡状态；M0 必须记录实际生成版本并验证升级路径。
- Cloudflare Vite plugin 当前不支持 React Router Framework Mode 的 SPA mode 与 prerendering；MVP 采用 runtime SSR，不把 React Router 自身的 prerender 能力计入架构承诺。
- [Cloudflare 官方 agent setup prompt](https://developers.cloudflare.com/agent-setup/prompt.md) 作为开发环境基线，用于安装 Cloudflare skills 与 docs、bindings、builds、observability MCP；配置只辅助开发，不进入生产依赖或运行时。

## 9. 非功能需求

| 类别 | 需求 |
| --- | --- |
| 安全 | 仓库不得包含真实 Cloudflare 账户 ID、令牌、私有来源 URL 与密钥 |
| 安全 | 不得向客户端暴露原始私有 R2 URL 或持久密钥 |
| 性能 | React Router runtime SSR 部署于 Workers；公开匿名响应按测量结果使用 Cloudflare 边缘缓存 |
| 可测试性 | 类型检查严格（typecheck）、lint、Vitest 单测/集成、Playwright E2E、CI 必须保持 |
| 可维护性 | 小步、可评审的变更，并附验证说明 |
| 合规 | 签名 URL 仅作为访问控制与防盗链，不构成版权管理承诺 |

## 10. 测试与验收基线

- `npm run typecheck`：严格类型检查（应用脚手架建立后）。
- `npm run lint`：风格与静态检查。
- Vitest：覆盖数据访问、来源解析、签名、认证行为与播放相关 API 契约的单测/集成测试。
- Playwright：覆盖目录浏览、认证相关流程、后台 CRUD、播放页行为、字幕、弹幕、签名 URL 过期场景的 E2E。
- CI：为 Pull Request 与生产变更维护持续集成。

## 11. 成功指标（候选）

- 目录数据完整性：所有已入库内容均有可播放来源。
- 播放成功率：签名 URL 过期导致的播放失败占比。
- 审核效率：弹幕从投稿到审核完成的平均耗时。
- 站点可用性：Worker 部署与边缘分发的稳定性。

> 注：规划阶段暂未定义具体量化目标，待脚手架建立后补充。

## 12. 里程碑（草案）

| 阶段 | 内容 |
| --- | --- |
| M0 脚手架 | 使用 Cloudflare C3 建立 React Router Framework Mode + Vite + Workers 脚手架，固定版本并完成 `workerd`、bindings、typecheck/lint/CI 验证 |
| M1 目录 | D1 schema、公开目录浏览/搜索/详情页 |
| M2 播放 | resolver、签名令牌、代理端点、Artplayer 播放页、字幕、弹幕展示 |
| M3 用户 | Better Auth 登录（GitHub OAuth + Resend 邮件魔法链接）、收藏、观看历史、弹幕投稿 |
| M4 后台 | Cloudflare Access 门禁、后台 CRUD、弹幕审核、审计 |

> 里程碑为草案，具体任务顺序以后续架构计划为准。

## 13. 风险与开放问题

- **React Router 版本过渡**：Cloudflare 框架文档与当前模板可能处于不同大版本，M0 必须以 C3 实际产物为准固定版本，并验证升级而非手工猜测兼容性。
- **Cloudflare Vite plugin 边界**：当前 React Router 集成不支持 SPA mode 与 prerendering；公开页面缓存采用 runtime SSR + Cloudflare 缓存，不承诺框架级 ISR。
- **Better Auth on Workers**：需在 `workerd` 预览环境验证 GitHub OAuth、D1 session、cookie、magic link 一次性消费与 Resend 邮件链路，并固定包含已知安全修复的稳定版本。
- **签名 URL 与 Range 请求**：私有媒体代理需在 TTL 过期与分片请求之间保持正确行为。
- **弹幕审核体验**：审核前置（moderation-first）可能影响投稿即时反馈，需在详情页设计预期提示。
- **邮件魔法链接依赖**：Resend 为外部服务，仅用于 Better Auth 的邮件发送回调且不承载核心数据；API key 必须存放于 Worker Secret。
- **HLS 原生回退**：需要定义 Artplayer + hls.js 与原生 HLS 的分发顺序。

## 14. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v0.1 | 2026-08-05 | 依据 AGENT.md 与 README.md 初版建立 |
| v0.2 | 2026-08-05 | 默认组件库由 shadcn/ui 调整为 coss ui（本地文档见 docs/coss-ui/） |
| v0.3 | 2026-08-05 | 将根目录 DESIGN.md 纳入项目级设计指导 |
| v0.4 | 2026-08-06 | 按 Cloudflare 原生优先原则改用 React Router Framework Mode + Vite + Cloudflare Vite plugin；普通用户认证改用 Better Auth，并补充运行时、缓存、版本与选型边界 |
