import { SERIES, TODAY } from "./content.ts";
import { MANIFEST } from "./manifest.ts";
import type {
  AdminUser,
  ContentAdminRecord,
  InviteRecord,
  ModerationItem,
  StatsDay,
  TopSeriesEntry,
  UploadJob,
} from "./types.ts";

function daysOffset(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  let cy = y ?? 2026;
  let cm = m ?? 1;
  let cd = d ?? 1;
  if (days >= 0) {
    let remaining = days;
    while (remaining > 0) {
      const dim = cm === 2 ? 28 : [4, 6, 9, 11].includes(cm) ? 30 : 31;
      const room = dim - cd;
      if (remaining <= room) {
        cd += remaining;
        remaining = 0;
      } else {
        remaining -= room + 1;
        cd = 1;
        cm += 1;
        if (cm > 12) {
          cm = 1;
          cy += 1;
        }
      }
    }
  } else {
    let remaining = -days;
    while (remaining > 0) {
      if (cd > remaining) {
        cd -= remaining;
        remaining = 0;
      } else {
        remaining -= cd;
        cm -= 1;
        if (cm < 1) {
          cm = 12;
          cy -= 1;
        }
        cd = cm === 2 ? 28 : [4, 6, 9, 11].includes(cm) ? 30 : 31;
      }
    }
  }
  return `${cy}-${String(cm).padStart(2, "0")}-${String(cd).padStart(2, "0")}`;
}

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "u-admin-1",
    name: "档案管理员",
    handle: "archive-admin",
    email: "admin@starfleet-archive.example",
    role: "admin",
    status: "active",
    joinedAt: "2023-01-08",
    lastActiveAt: TODAY,
  },
  {
    id: "u-up-1",
    name: "上传官甲",
    handle: "uploader-alpha",
    email: "alpha@starfleet-archive.example",
    role: "uploader",
    status: "active",
    joinedAt: "2023-06-15",
    lastActiveAt: daysOffset(TODAY, -1),
  },
  {
    id: "u-up-2",
    name: "上传官乙",
    handle: "uploader-beta",
    email: "beta@starfleet-archive.example",
    role: "uploader",
    status: "active",
    joinedAt: "2024-02-20",
    lastActiveAt: daysOffset(TODAY, -3),
  },
  {
    id: "u-m-1",
    name: "林舟",
    handle: "linzhou",
    email: "linzhou@example.com",
    role: "member",
    status: "active",
    joinedAt: "2024-03-12",
    lastActiveAt: TODAY,
  },
  {
    id: "u-m-2",
    name: "王珊",
    handle: "wangshan",
    email: "wangshan@example.com",
    role: "member",
    status: "active",
    joinedAt: "2024-05-01",
    lastActiveAt: daysOffset(TODAY, -2),
  },
  {
    id: "u-m-3",
    name: "陈观星",
    handle: "chenguanxing",
    email: "chen@example.com",
    role: "member",
    status: "active",
    joinedAt: "2024-07-18",
    lastActiveAt: daysOffset(TODAY, -4),
  },
  {
    id: "u-m-4",
    name: "赵拾光",
    handle: "zhaoshiguang",
    email: "zhao@example.com",
    role: "member",
    status: "active",
    joinedAt: "2024-09-09",
    lastActiveAt: daysOffset(TODAY, -6),
  },
  {
    id: "u-m-5",
    name: "周停航",
    handle: "zhoutinghang",
    email: "zhou@example.com",
    role: "member",
    status: "suspended",
    joinedAt: "2024-11-22",
    lastActiveAt: daysOffset(TODAY, -20),
  },
];

export const INVITES: InviteRecord[] = [
  {
    id: "inv-1",
    code: "STCN-7K2P-9Q",
    maxUses: 1,
    usedCount: 1,
    expiresAt: daysOffset(TODAY, -5),
    createdAt: daysOffset(TODAY, -30),
    note: "内测首批",
  },
  {
    id: "inv-2",
    code: "STCN-3M8R-2A",
    maxUses: 5,
    usedCount: 2,
    expiresAt: daysOffset(TODAY, 10),
    createdAt: daysOffset(TODAY, -12),
    note: "社区贡献者",
  },
  {
    id: "inv-3",
    code: "STCN-5X1N-4B",
    maxUses: 10,
    usedCount: 0,
    expiresAt: daysOffset(TODAY, 20),
    createdAt: daysOffset(TODAY, -3),
    note: "开放日预留",
  },
  {
    id: "inv-4",
    code: "STCN-9P4T-6C",
    maxUses: 20,
    usedCount: 7,
    expiresAt: daysOffset(TODAY, 7),
    createdAt: daysOffset(TODAY, -18),
    note: "高校社团",
  },
  {
    id: "inv-5",
    code: "STCN-2H6W-8D",
    maxUses: 3,
    usedCount: 3,
    expiresAt: daysOffset(TODAY, -2),
    createdAt: daysOffset(TODAY, -25),
    note: "已用尽",
  },
];

export const UPLOAD_JOBS: UploadJob[] = [
  {
    id: "job-1",
    seriesSlug: "snw",
    episodeCode: "S02E06",
    stage: "queued",
    progress: 0,
    attempts: 0,
    updatedAt: TODAY,
    error: null,
  },
  {
    id: "job-2",
    seriesSlug: "dis",
    episodeCode: "S05E04",
    stage: "probing",
    progress: 12,
    attempts: 1,
    updatedAt: TODAY,
    error: null,
  },
  {
    id: "job-3",
    seriesSlug: "ld",
    episodeCode: "S05E03",
    stage: "transcoding",
    progress: 48,
    attempts: 1,
    updatedAt: daysOffset(TODAY, -1),
    error: null,
  },
  {
    id: "job-4",
    seriesSlug: "pic",
    episodeCode: "S03E04",
    stage: "packaging",
    progress: 82,
    attempts: 1,
    updatedAt: daysOffset(TODAY, -1),
    error: null,
  },
  {
    id: "job-5",
    seriesSlug: "tng",
    episodeCode: "S07E04",
    stage: "done",
    progress: 100,
    attempts: 1,
    updatedAt: daysOffset(TODAY, -2),
    error: null,
  },
  {
    id: "job-6",
    seriesSlug: "pro",
    episodeCode: "S02E01",
    stage: "failed",
    progress: 18,
    attempts: 2,
    updatedAt: daysOffset(TODAY, -1),
    error: "探测源文件失败（演示）",
  },
];

export const MODERATION_ITEMS: ModerationItem[] = [
  {
    id: "mod-1",
    target: "comment",
    excerpt: "这集节奏太慢了，浪费时间。",
    author: "匿名旅人",
    reporter: "王珊",
    reason: "人身攻击倾向",
    status: "pending",
    createdAt: TODAY,
  },
  {
    id: "mod-2",
    target: "danmaku",
    excerpt: "剧透：结尾反转……",
    author: "剧透星人",
    reporter: "林舟",
    reason: "剧透",
    status: "pending",
    createdAt: daysOffset(TODAY, -1),
  },
  {
    id: "mod-3",
    target: "comment",
    excerpt: "广告：加群领资源",
    author: "推广号",
    reporter: "陈观星",
    reason: "垃圾广告",
    status: "pending",
    createdAt: daysOffset(TODAY, -1),
  },
  {
    id: "mod-4",
    target: "danmaku",
    excerpt: "侮辱性词汇（已遮罩）",
    author: "过客",
    reporter: "赵拾光",
    reason: "不当言论",
    status: "pending",
    createdAt: daysOffset(TODAY, -2),
  },
  {
    id: "mod-5",
    target: "comment",
    excerpt: "字幕时间轴建议微调。",
    author: "王珊",
    reporter: "系统",
    reason: "误报",
    status: "kept",
    createdAt: daysOffset(TODAY, -3),
  },
  {
    id: "mod-6",
    target: "danmaku",
    excerpt: "联邦万岁！",
    author: "林舟",
    reporter: "过客",
    reason: "误报",
    status: "kept",
    createdAt: daysOffset(TODAY, -4),
  },
  {
    id: "mod-7",
    target: "comment",
    excerpt: "外链引流内容（已移除）",
    author: "外链号",
    reporter: "档案管理员",
    reason: "违规外链",
    status: "removed",
    createdAt: daysOffset(TODAY, -5),
  },
  {
    id: "mod-8",
    target: "danmaku",
    excerpt: "仇恨言论（已移除）",
    author: "封禁用户",
    reporter: "上传官甲",
    reason: "仇恨言论",
    status: "removed",
    createdAt: daysOffset(TODAY, -6),
  },
];

const DRAFT_SLUGS = new Set(["pic", "pro"]);

const CONTENT_UPDATED_OFFSETS: Record<string, number> = {
  tos: -40,
  tng: -35,
  ds9: -30,
  voy: -28,
  ent: -25,
  dis: -3,
  pic: -10,
  snw: -1,
  ld: -8,
  pro: -12,
  tmp: -50,
  twok: -48,
  fc: -45,
  st09: -2,
  stid: -20,
  stb: -15,
};

export const CONTENT_ADMIN: ContentAdminRecord[] = MANIFEST.map((entry) => ({
  slug: entry.slug,
  status: DRAFT_SLUGS.has(entry.slug) ? "draft" : "published",
  updatedAt: daysOffset(TODAY, CONTENT_UPDATED_OFFSETS[entry.slug] ?? -20),
}));

function buildStats30d(): StatsDay[] {
  const days: StatsDay[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = daysOffset(TODAY, -i);
    const phase = (29 - i) * 17;
    const wave = ((phase % 360) / 360) * 6.283185307179586;
    const sine = Math.sin(wave);
    const plays = Math.round(420 + sine * 160 + ((29 - i) % 7) * 18);
    const newMembers = Math.round(6 + sine * 3 + ((29 - i) % 5));
    days.push({ date, plays, newMembers });
  }
  return days;
}

export const STATS_30D: StatsDay[] = buildStats30d();

export const TOP_SERIES_7D: TopSeriesEntry[] = [
  { slug: "snw", plays: 1840 },
  { slug: "st09", plays: 1520 },
  { slug: "dis", plays: 1310 },
  { slug: "tng", plays: 980 },
  { slug: "ld", plays: 760 },
  { slug: "tos", plays: 640 },
];

export const TOP_SERIES_30D: TopSeriesEntry[] = [
  { slug: "snw", plays: 7120 },
  { slug: "tng", plays: 6540 },
  { slug: "dis", plays: 5980 },
  { slug: "st09", plays: 5210 },
  { slug: "ds9", plays: 4100 },
  { slug: "ld", plays: 3560 },
];

export const DASHBOARD_SUMMARY = {
  seriesCount: SERIES.filter((s) => s.kind === "series").length,
  movieCount: SERIES.filter((s) => s.kind === "movie").length,
  pendingModeration: MODERATION_ITEMS.filter((m) => m.status === "pending").length,
  activeUploads: UPLOAD_JOBS.filter(
    (j) =>
      j.stage === "queued" ||
      j.stage === "probing" ||
      j.stage === "transcoding" ||
      j.stage === "packaging",
  ).length,
} as const;
