import { movies, series } from "./catalog";

export type Visibility = "visible" | "hidden";

export type AdminSeries = {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  seasonCount: number;
  episodeCount: number;
  visibility: Visibility;
  updatedAt: string;
  tags: string[];
  description?: string;
  hasPoster: boolean;
  hasBanner: boolean;
};

export type AdminMovie = {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  duration: number;
  playable: boolean;
  visibility: Visibility;
  updatedAt: string;
  tags: string[];
  description?: string;
  hasPoster: boolean;
  hasBanner: boolean;
};

export type AdminSeason = {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  episodeCount: number;
  visibility: Visibility;
  updatedAt: string;
  description?: string;
  hasPoster: boolean;
};

export type AdminEpisode = {
  id: string;
  seriesId: string;
  seasonId: string;
  seasonNumber: number;
  number: number;
  title: string;
  originalTitle?: string;
  duration: number;
  playable: boolean;
  visibility: Visibility;
  updatedAt: string;
  description?: string;
  airDate?: string;
  hasThumbnail: boolean;
};

export type PendingDanmaku = {
  id: string;
  content: string;
  relatedTitle: string;
  relatedKind: "episode" | "movie";
  relatedId: string;
  submittedAt: string;
};

export type RecentAction = {
  id: string;
  action: string;
  target: string;
  actor: string;
  at: string;
  result: "success" | "failed";
};

export type SourceProvider = "public_url" | "r2" | "rustfs" | "openlist";
export type SourceQuality = "1080p" | "720p" | "480p" | "auto";

export type AdminSource = {
  id: string;
  relatedKind: "episode" | "movie";
  relatedId: string;
  relatedTitle: string;
  provider: SourceProvider;
  label: string;
  quality: SourceQuality;
  enabled: boolean;
  updatedAt: string;
  url: string;
  objectPath: string;
  resourceUrl: string;
};

export type AdminSubtitle = {
  id: string;
  relatedKind: "episode" | "movie";
  relatedId: string;
  relatedTitle: string;
  language: string;
  label: string;
  isDefault: boolean;
  enabled: boolean;
  updatedAt: string;
  fileName: string;
  fileSize: number;
};

export type DanmakuStatus = "pending" | "approved" | "hidden";

export type AdminDanmaku = {
  id: string;
  content: string;
  relatedTitle: string;
  relatedKind: "episode" | "movie";
  relatedId: string;
  submittedAt: string;
  status: DanmakuStatus;
  timePoint: number;
  contextTitle: string;
  author: string;
};

export type AdminAudit = {
  id: string;
  at: string;
  actor: string;
  action: string;
  actionType: string;
  target: string;
  result: "success" | "failed";
  details: Record<string, string>;
};

export type RelatedContentOption = {
  key: string;
  kind: "episode" | "movie";
  id: string;
  label: string;
};

const UPDATED_BASE = "2026-08-";

function updatedAt(index: number, hour = 10) {
  const day = String((index % 6) + 1).padStart(2, "0");
  const h = String((hour + index) % 24).padStart(2, "0");
  const m = String((index * 7) % 60).padStart(2, "0");
  return `${UPDATED_BASE}${day}T${h}:${m}:00+08:00`;
}

export const adminSeries: AdminSeries[] = series.map((item, index) => ({
  id: item.id,
  title: item.title,
  originalTitle: item.originalTitle,
  year: item.year,
  seasonCount: item.seasonCount,
  episodeCount: item.episodes.length,
  visibility: index === 12 || index === 13 ? "hidden" : "visible",
  updatedAt: updatedAt(index, 9),
  tags: [...item.tags],
  description: item.description,
  hasPoster: index !== 12,
  hasBanner: index !== 13,
}));

export const adminMovies: AdminMovie[] = movies.map((item, index) => ({
  id: item.id,
  title: item.title,
  originalTitle: item.originalTitle,
  year: item.year,
  duration: item.duration,
  playable: item.playable,
  visibility: index === 4 || index === 9 || index === 15 ? "hidden" : "visible",
  updatedAt: updatedAt(index, 14),
  tags: [...item.tags],
  description: item.description,
  hasPoster: index !== 14,
  hasBanner: index !== 15,
}));

export function seasonsForSeries(seriesId: string): AdminSeason[] {
  const show = series.find((item) => item.id === seriesId);
  if (!show) return [];
  return Array.from({ length: show.seasonCount }, (_, index) => {
    const number = index + 1;
    const episodes = show.episodes.filter((episode) => episode.season === number);
    return {
      id: `${seriesId}-s${number}`,
      seriesId,
      number,
      title: `第 ${number} 季`,
      episodeCount: episodes.length,
      visibility: number === show.seasonCount && seriesId === "archive-nine" ? "hidden" : "visible",
      updatedAt: updatedAt(index + show.seasonCount, 11),
      description: number === 1 ? "开场与航程建立。" : undefined,
      hasPoster: number !== 3 || seriesId !== "strange-new-worlds",
    };
  });
}

export function episodesForSeason(seriesId: string, seasonId: string): AdminEpisode[] {
  const show = series.find((item) => item.id === seriesId);
  if (!show) return [];
  const seasonNumber = Number(seasonId.split("-s").pop());
  if (!Number.isFinite(seasonNumber)) return [];
  return show.episodes
    .filter((episode) => episode.season === seasonNumber)
    .map((episode, index) => ({
      id: episode.id,
      seriesId,
      seasonId,
      seasonNumber,
      number: episode.number,
      title: episode.title,
      originalTitle: episode.number === 2 ? `Log ${episode.number}` : undefined,
      duration: episode.duration,
      playable: episode.playable,
      visibility: episode.number === 6 ? "hidden" : "visible",
      updatedAt: updatedAt(index + seasonNumber, 16),
      description: episode.synopsis || undefined,
      airDate: `202${(seasonNumber % 5) + 2}-0${(episode.number % 9) + 1}-1${episode.number % 9}`,
      hasThumbnail: episode.number !== 7,
    }));
}

export function findAdminSeries(id: string) {
  return adminSeries.find((item) => item.id === id);
}

export function findAdminMovie(id: string) {
  return adminMovies.find((item) => item.id === id);
}

export function findAdminSeason(seriesId: string, seasonId: string) {
  return seasonsForSeries(seriesId).find((item) => item.id === seasonId);
}

export function findAdminEpisode(seriesId: string, seasonId: string, episodeId: string) {
  return episodesForSeason(seriesId, seasonId).find((item) => item.id === episodeId);
}

export const SOURCE_COUNT = 42;
export const PENDING_DANMAKU_COUNT = 8;

export const adminSources: AdminSource[] = [
  {
    id: "src-1",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    relatedTitle: "奇异新世界 · S02E04",
    provider: "public_url",
    label: "公开 1080p",
    quality: "1080p",
    enabled: true,
    updatedAt: "2026-08-07T10:12:00+08:00",
    url: "https://cdn.example.com/snw/s02e04-1080.mp4",
    objectPath: "",
    resourceUrl: "",
  },
  {
    id: "src-2",
    relatedKind: "movie",
    relatedId: "first-contact",
    relatedTitle: "第一类接触",
    provider: "public_url",
    label: "公开 720p",
    quality: "720p",
    enabled: true,
    updatedAt: "2026-08-07T09:40:00+08:00",
    url: "https://media.example.com/movies/first-contact-720.mp4",
    objectPath: "",
    resourceUrl: "",
  },
  {
    id: "src-3",
    relatedKind: "episode",
    relatedId: "the-next-generation-1-1",
    relatedTitle: "下一代 · S01E01",
    provider: "r2",
    label: "R2 主源",
    quality: "1080p",
    enabled: true,
    updatedAt: "2026-08-06T22:18:00+08:00",
    url: "",
    objectPath: "catalog/tng/s01e01/master.m3u8",
    resourceUrl: "",
  },
  {
    id: "src-4",
    relatedKind: "movie",
    relatedId: "wrath-of-khan",
    relatedTitle: "可汗怒吼",
    provider: "r2",
    label: "R2 备份",
    quality: "720p",
    enabled: false,
    updatedAt: "2026-08-06T20:05:00+08:00",
    url: "",
    objectPath: "movies/wrath-of-khan/720p.mp4",
    resourceUrl: "",
  },
  {
    id: "src-5",
    relatedKind: "episode",
    relatedId: "deep-space-nine-2-2",
    relatedTitle: "深空九号 · S02E02",
    provider: "rustfs",
    label: "RustFS 主仓",
    quality: "1080p",
    enabled: true,
    updatedAt: "2026-08-06T18:33:00+08:00",
    url: "",
    objectPath: "",
    resourceUrl: "rustfs://fleet-archive/ds9/s02e02",
  },
  {
    id: "src-6",
    relatedKind: "movie",
    relatedId: "beyond",
    relatedTitle: "超越星辰",
    provider: "rustfs",
    label: "RustFS 镜像",
    quality: "auto",
    enabled: true,
    updatedAt: "2026-08-06T16:12:00+08:00",
    url: "",
    objectPath: "",
    resourceUrl: "rustfs://fleet-archive/movies/beyond",
  },
  {
    id: "src-7",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-1-3",
    relatedTitle: "奇异新世界 · S01E03",
    provider: "openlist",
    label: "OpenList 直链",
    quality: "1080p",
    enabled: true,
    updatedAt: "2026-08-06T14:50:00+08:00",
    url: "",
    objectPath: "",
    resourceUrl: "https://openlist.example.com/d/snw/s01e03.mp4",
  },
  {
    id: "src-8",
    relatedKind: "movie",
    relatedId: "into-darkness",
    relatedTitle: "暗黑无界",
    provider: "openlist",
    label: "OpenList 备用",
    quality: "480p",
    enabled: false,
    updatedAt: "2026-08-05T21:08:00+08:00",
    url: "",
    objectPath: "",
    resourceUrl: "https://openlist.example.com/d/movies/into-darkness.mp4",
  },
  {
    id: "src-9",
    relatedKind: "episode",
    relatedId: "frontier-letters-1-1",
    relatedTitle: "边疆来信 · S01E01",
    provider: "public_url",
    label: "社区公开源",
    quality: "720p",
    enabled: true,
    updatedAt: "2026-08-05T18:22:00+08:00",
    url: "https://community.example.com/frontier/s01e01.mp4",
    objectPath: "",
    resourceUrl: "",
  },
  {
    id: "src-10",
    relatedKind: "movie",
    relatedId: "motion-picture",
    relatedTitle: "星际旅行：无限太空",
    provider: "r2",
    label: "R2 归档",
    quality: "1080p",
    enabled: true,
    updatedAt: "2026-08-05T12:40:00+08:00",
    url: "",
    objectPath: "movies/motion-picture/1080p.mp4",
    resourceUrl: "",
  },
  {
    id: "src-11",
    relatedKind: "episode",
    relatedId: "voyager-1-1",
    relatedTitle: "航海家号 · S01E01",
    provider: "rustfs",
    label: "RustFS 低码率",
    quality: "480p",
    enabled: false,
    updatedAt: "2026-08-04T23:15:00+08:00",
    url: "",
    objectPath: "",
    resourceUrl: "rustfs://fleet-archive/voyager/s01e01-480",
  },
  {
    id: "src-12",
    relatedKind: "movie",
    relatedId: "nemesis",
    relatedTitle: "复仇女神",
    provider: "openlist",
    label: "OpenList 试验",
    quality: "720p",
    enabled: true,
    updatedAt: "2026-08-04T09:05:00+08:00",
    url: "",
    objectPath: "",
    resourceUrl: "https://openlist.example.com/d/movies/nemesis.mp4",
  },
];

export const adminSubtitles: AdminSubtitle[] = [
  {
    id: "sub-1",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    relatedTitle: "奇异新世界 · S02E04",
    language: "zh-Hans",
    label: "简体中文",
    isDefault: true,
    enabled: true,
    updatedAt: "2026-08-07T09:30:00+08:00",
    fileName: "snw-s02e04-zh.vtt",
    fileSize: 48_230,
  },
  {
    id: "sub-2",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    relatedTitle: "奇异新世界 · S02E04",
    language: "en",
    label: "English",
    isDefault: false,
    enabled: true,
    updatedAt: "2026-08-07T09:28:00+08:00",
    fileName: "snw-s02e04-en.vtt",
    fileSize: 52_110,
  },
  {
    id: "sub-3",
    relatedKind: "movie",
    relatedId: "first-contact",
    relatedTitle: "第一类接触",
    language: "zh-Hans",
    label: "简体中文",
    isDefault: true,
    enabled: true,
    updatedAt: "2026-08-06T21:40:00+08:00",
    fileName: "first-contact-zh.vtt",
    fileSize: 61_004,
  },
  {
    id: "sub-4",
    relatedKind: "movie",
    relatedId: "wrath-of-khan",
    relatedTitle: "可汗怒吼",
    language: "zh-Hans",
    label: "简中",
    isDefault: true,
    enabled: true,
    updatedAt: "2026-08-06T18:02:00+08:00",
    fileName: "wrath-of-khan-zh.vtt",
    fileSize: 55_880,
  },
  {
    id: "sub-5",
    relatedKind: "movie",
    relatedId: "wrath-of-khan",
    relatedTitle: "可汗怒吼",
    language: "zh-Hant",
    label: "繁体中文",
    isDefault: false,
    enabled: false,
    updatedAt: "2026-08-06T17:50:00+08:00",
    fileName: "wrath-of-khan-zh-hant.vtt",
    fileSize: 56_120,
  },
  {
    id: "sub-6",
    relatedKind: "episode",
    relatedId: "the-next-generation-1-1",
    relatedTitle: "下一代 · S01E01",
    language: "en",
    label: "English",
    isDefault: true,
    enabled: true,
    updatedAt: "2026-08-05T16:18:00+08:00",
    fileName: "tng-s01e01-en.vtt",
    fileSize: 44_900,
  },
  {
    id: "sub-7",
    relatedKind: "episode",
    relatedId: "deep-space-nine-2-2",
    relatedTitle: "深空九号 · S02E02",
    language: "zh-Hans",
    label: "简体中文",
    isDefault: false,
    enabled: true,
    updatedAt: "2026-08-05T11:05:00+08:00",
    fileName: "ds9-s02e02-zh.vtt",
    fileSize: 39_440,
  },
  {
    id: "sub-8",
    relatedKind: "movie",
    relatedId: "beyond",
    relatedTitle: "超越星辰",
    language: "zh-Hans",
    label: "简体中文",
    isDefault: true,
    enabled: true,
    updatedAt: "2026-08-04T20:22:00+08:00",
    fileName: "beyond-zh.vtt",
    fileSize: 58_760,
  },
  {
    id: "sub-9",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    relatedTitle: "奇异新世界 · S02E04",
    language: "ja",
    label: "日本語",
    isDefault: false,
    enabled: false,
    updatedAt: "2026-08-04T14:10:00+08:00",
    fileName: "snw-s02e04-ja.vtt",
    fileSize: 50_220,
  },
];

export const adminDanmaku: AdminDanmaku[] = [
  {
    id: "pd-1",
    content: "这一段舰桥对话太稳了",
    relatedTitle: "奇异新世界 · S02E04",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    submittedAt: "2026-08-07T09:12:00+08:00",
    status: "pending",
    timePoint: 742,
    contextTitle: "舰桥决策",
    author: "档案员A",
  },
  {
    id: "pd-2",
    content: "字幕时间轴还差一点",
    relatedTitle: "第一类接触",
    relatedKind: "movie",
    relatedId: "first-contact",
    submittedAt: "2026-08-07T08:48:00+08:00",
    status: "pending",
    timePoint: 1260,
    contextTitle: "开场航段",
    author: "观影者B",
  },
  {
    id: "pd-3",
    content: "请审核：欢迎新船员加入档案站",
    relatedTitle: "下一代 · S01E01",
    relatedKind: "episode",
    relatedId: "the-next-generation-1-1",
    submittedAt: "2026-08-06T22:15:00+08:00",
    status: "pending",
    timePoint: 95,
    contextTitle: "开场",
    author: "新船员",
  },
  {
    id: "pd-4",
    content: "画质切换后声音有点空",
    relatedTitle: "可汗怒吼",
    relatedKind: "movie",
    relatedId: "wrath-of-khan",
    submittedAt: "2026-08-06T21:03:00+08:00",
    status: "pending",
    timePoint: 1880,
    contextTitle: "对峙段落",
    author: "技术反馈",
  },
  {
    id: "pd-5",
    content: "这一镜构图像档案封面",
    relatedTitle: "奇异新世界 · S01E03",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-1-3",
    submittedAt: "2026-08-06T19:40:00+08:00",
    status: "pending",
    timePoint: 510,
    contextTitle: "外景航拍",
    author: "构图党",
  },
  {
    id: "pd-6",
    content: "弹幕字号建议默认再小一号",
    relatedTitle: "深空九号 · S02E02",
    relatedKind: "episode",
    relatedId: "deep-space-nine-2-2",
    submittedAt: "2026-08-06T16:22:00+08:00",
    status: "pending",
    timePoint: 220,
    contextTitle: "空间站走廊",
    author: "设置建议",
  },
  {
    id: "pd-7",
    content: "社区整理辛苦了，继续维护",
    relatedTitle: "超越星辰",
    relatedKind: "movie",
    relatedId: "beyond",
    submittedAt: "2026-08-06T14:05:00+08:00",
    status: "pending",
    timePoint: 640,
    contextTitle: "中段航行",
    author: "社区成员",
  },
  {
    id: "pd-8",
    content: "无原名条目的标题显示正常吗",
    relatedTitle: "边疆来信 · S01E01",
    relatedKind: "episode",
    relatedId: "frontier-letters-1-1",
    submittedAt: "2026-08-06T11:58:00+08:00",
    status: "pending",
    timePoint: 40,
    contextTitle: "片头",
    author: "测试员",
  },
  {
    id: "ad-1",
    content: "这一镜构图稳",
    relatedTitle: "奇异新世界 · S02E04",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    submittedAt: "2026-08-05T20:12:00+08:00",
    status: "approved",
    timePoint: 330,
    contextTitle: "舰桥俯视",
    author: "观影者C",
  },
  {
    id: "ad-2",
    content: "经典开场音乐太有感觉",
    relatedTitle: "第一类接触",
    relatedKind: "movie",
    relatedId: "first-contact",
    submittedAt: "2026-08-05T18:40:00+08:00",
    status: "approved",
    timePoint: 12,
    contextTitle: "片头曲",
    author: "乐迷",
  },
  {
    id: "ad-3",
    content: "斯波克这段逻辑清晰",
    relatedTitle: "可汗怒吼",
    relatedKind: "movie",
    relatedId: "wrath-of-khan",
    submittedAt: "2026-08-05T15:22:00+08:00",
    status: "approved",
    timePoint: 980,
    contextTitle: "战术讨论",
    author: "逻辑党",
  },
  {
    id: "ad-4",
    content: "欢迎回来，舰长",
    relatedTitle: "下一代 · S01E01",
    relatedKind: "episode",
    relatedId: "the-next-generation-1-1",
    submittedAt: "2026-08-04T22:05:00+08:00",
    status: "approved",
    timePoint: 180,
    contextTitle: "舰桥就位",
    author: "老粉",
  },
  {
    id: "ad-5",
    content: "空间站灯光氛围很好",
    relatedTitle: "深空九号 · S02E02",
    relatedKind: "episode",
    relatedId: "deep-space-nine-2-2",
    submittedAt: "2026-08-04T19:33:00+08:00",
    status: "approved",
    timePoint: 455,
    contextTitle: "站台全景",
    author: "氛围组",
  },
  {
    id: "ad-6",
    content: "这段追逐戏剪辑紧凑",
    relatedTitle: "超越星辰",
    relatedKind: "movie",
    relatedId: "beyond",
    submittedAt: "2026-08-04T12:18:00+08:00",
    status: "approved",
    timePoint: 2100,
    contextTitle: "追逐",
    author: "剪辑观察",
  },
  {
    id: "hd-1",
    content: "请勿剧透后续剧情",
    relatedTitle: "奇异新世界 · S02E04",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    submittedAt: "2026-08-03T21:40:00+08:00",
    status: "hidden",
    timePoint: 1500,
    contextTitle: "高潮前",
    author: "匿名",
  },
  {
    id: "hd-2",
    content: "无关广告内容已隐藏",
    relatedTitle: "第一类接触",
    relatedKind: "movie",
    relatedId: "first-contact",
    submittedAt: "2026-08-03T18:05:00+08:00",
    status: "hidden",
    timePoint: 700,
    contextTitle: "中段",
    author: "广告号",
  },
  {
    id: "hd-3",
    content: "人身攻击用语",
    relatedTitle: "可汗怒吼",
    relatedKind: "movie",
    relatedId: "wrath-of-khan",
    submittedAt: "2026-08-03T14:22:00+08:00",
    status: "hidden",
    timePoint: 1120,
    contextTitle: "对峙",
    author: "违规用户",
  },
  {
    id: "hd-4",
    content: "重复刷屏测试",
    relatedTitle: "下一代 · S01E01",
    relatedKind: "episode",
    relatedId: "the-next-generation-1-1",
    submittedAt: "2026-08-02T10:11:00+08:00",
    status: "hidden",
    timePoint: 60,
    contextTitle: "开场",
    author: "刷屏机",
  },
];

export const pendingDanmaku: PendingDanmaku[] = adminDanmaku
  .filter((item) => item.status === "pending")
  .map(({ id, content, relatedTitle, relatedKind, relatedId, submittedAt }) => ({
    id,
    content,
    relatedTitle,
    relatedKind,
    relatedId,
    submittedAt,
  }));

export const recentActions: RecentAction[] = [
  {
    id: "ra-1",
    action: "更新系列",
    target: "奇异新世界",
    actor: "管理员",
    at: "2026-08-07T10:20:00+08:00",
    result: "success",
  },
  {
    id: "ra-2",
    action: "通过弹幕",
    target: "这一镜构图稳",
    actor: "管理员",
    at: "2026-08-07T09:55:00+08:00",
    result: "success",
  },
  {
    id: "ra-3",
    action: "隐藏电影",
    target: "终极先锋",
    actor: "管理员",
    at: "2026-08-07T09:10:00+08:00",
    result: "success",
  },
  {
    id: "ra-4",
    action: "新建单集",
    target: "奇异新世界 · S03E08",
    actor: "管理员",
    at: "2026-08-06T23:40:00+08:00",
    result: "success",
  },
  {
    id: "ra-5",
    action: "更新来源",
    target: "第一类接触 / 公开链接",
    actor: "管理员",
    at: "2026-08-06T21:18:00+08:00",
    result: "failed",
  },
  {
    id: "ra-6",
    action: "上传字幕",
    target: "可汗怒吼 / 简中",
    actor: "管理员",
    at: "2026-08-06T18:02:00+08:00",
    result: "success",
  },
  {
    id: "ra-7",
    action: "删除单集",
    target: "档案九 · S09E03",
    actor: "管理员",
    at: "2026-08-06T15:33:00+08:00",
    result: "success",
  },
  {
    id: "ra-8",
    action: "隐藏弹幕",
    target: "请勿剧透后续剧情",
    actor: "管理员",
    at: "2026-08-06T12:11:00+08:00",
    result: "success",
  },
];

export const adminAuditLogs: AdminAudit[] = [
  {
    id: "al-1",
    at: "2026-08-07T10:20:00+08:00",
    actor: "管理员",
    action: "更新系列",
    actionType: "catalog.update",
    target: "奇异新世界",
    result: "success",
    details: { "对象类型": "系列", "对象 ID": "strange-new-worlds", "变更": "简介与标签", IP: "10.0.0.12" },
  },
  {
    id: "al-2",
    at: "2026-08-07T09:55:00+08:00",
    actor: "管理员",
    action: "通过弹幕",
    actionType: "danmaku.approve",
    target: "这一镜构图稳",
    result: "success",
    details: { "弹幕 ID": "ad-1", "关联内容": "奇异新世界 · S02E04", "原状态": "待审核" },
  },
  {
    id: "al-3",
    at: "2026-08-07T09:10:00+08:00",
    actor: "管理员",
    action: "隐藏电影",
    actionType: "catalog.hide",
    target: "终极先锋",
    result: "success",
    details: { "对象类型": "电影", "对象 ID": "final-frontier", "原因": "来源暂不可用" },
  },
  {
    id: "al-4",
    at: "2026-08-06T23:40:00+08:00",
    actor: "管理员",
    action: "新建单集",
    actionType: "catalog.create",
    target: "奇异新世界 · S03E08",
    result: "success",
    details: { "系列": "奇异新世界", "季": "S03", "集号": "8" },
  },
  {
    id: "al-5",
    at: "2026-08-06T21:18:00+08:00",
    actor: "管理员",
    action: "更新来源",
    actionType: "source.update",
    target: "第一类接触 / 公开链接",
    result: "failed",
    details: { "来源 ID": "src-2", "错误": "URL 校验失败", "尝试值": "http://insecure.example.com/x.mp4" },
  },
  {
    id: "al-6",
    at: "2026-08-06T18:02:00+08:00",
    actor: "管理员",
    action: "上传字幕",
    actionType: "subtitle.upload",
    target: "可汗怒吼 / 简中",
    result: "success",
    details: { "字幕 ID": "sub-4", "文件": "wrath-of-khan-zh.vtt", "大小": "55 KB" },
  },
  {
    id: "al-7",
    at: "2026-08-06T15:33:00+08:00",
    actor: "管理员",
    action: "删除单集",
    actionType: "catalog.delete",
    target: "档案九 · S09E03",
    result: "success",
    details: { "系列": "银河档案：跨越九个时代的漫长航行记录", "单集 ID": "archive-nine-9-3" },
  },
  {
    id: "al-8",
    at: "2026-08-06T12:11:00+08:00",
    actor: "管理员",
    action: "隐藏弹幕",
    actionType: "danmaku.hide",
    target: "请勿剧透后续剧情",
    result: "success",
    details: { "弹幕 ID": "hd-1", "原因": "剧透", "操作人备注": "保留证据" },
  },
  {
    id: "al-9",
    at: "2026-08-05T16:40:00+08:00",
    actor: "管理员",
    action: "新建来源",
    actionType: "source.create",
    target: "航海家号 · S01E01 / RustFS",
    result: "success",
    details: { "来源 ID": "src-11", "类型": "RustFS", "清晰度": "480p" },
  },
  {
    id: "al-10",
    at: "2026-08-05T11:05:00+08:00",
    actor: "管理员",
    action: "更新字幕",
    actionType: "subtitle.update",
    target: "深空九号 · S02E02 / 简体中文",
    result: "success",
    details: { "字幕 ID": "sub-7", "变更": "启用状态", "设为默认": "否" },
  },
  {
    id: "al-11",
    at: "2026-08-04T20:22:00+08:00",
    actor: "值班编辑",
    action: "批量通过弹幕",
    actionType: "danmaku.bulk_approve",
    target: "3 条弹幕",
    result: "success",
    details: { "数量": "3", "范围": "待审核列表", "结果": "全部成功" },
  },
  {
    id: "al-12",
    at: "2026-08-04T09:05:00+08:00",
    actor: "值班编辑",
    action: "禁用来源",
    actionType: "source.disable",
    target: "暗黑无界 / OpenList",
    result: "failed",
    details: { "来源 ID": "src-8", "错误": "并发冲突", "重试建议": "刷新后重试" },
  },
];

export function relatedContentOptions(): RelatedContentOption[] {
  const episodeOptions: RelatedContentOption[] = series.flatMap((show) =>
    show.episodes
      .filter((episode) => episode.number <= 2 || episode.id === "strange-new-worlds-2-4")
      .slice(0, 3)
      .map((episode) => ({
        key: `episode:${episode.id}`,
        kind: "episode" as const,
        id: episode.id,
        label: `${show.title} · S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`,
      })),
  );
  const movieOptions: RelatedContentOption[] = movies.slice(0, 10).map((movie) => ({
    key: `movie:${movie.id}`,
    kind: "movie" as const,
    id: movie.id,
    label: movie.title,
  }));
  return [...episodeOptions.slice(0, 18), ...movieOptions];
}

export function findAdminSource(id: string) {
  return adminSources.find((item) => item.id === id);
}

export function findAdminSubtitle(id: string) {
  return adminSubtitles.find((item) => item.id === id);
}

export function findAdminAudit(id: string) {
  return adminAuditLogs.find((item) => item.id === id);
}

export function dashboardSummary() {
  return {
    seriesCount: adminSeries.length,
    movieCount: adminMovies.length,
    sourceCount: SOURCE_COUNT,
    pendingDanmakuCount: pendingDanmaku.length,
  };
}
