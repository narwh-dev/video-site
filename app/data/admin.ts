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

export const pendingDanmaku: PendingDanmaku[] = [
  {
    id: "pd-1",
    content: "这一段舰桥对话太稳了",
    relatedTitle: "奇异新世界 · S02E04",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-2-4",
    submittedAt: "2026-08-07T09:12:00+08:00",
  },
  {
    id: "pd-2",
    content: "字幕时间轴还差一点",
    relatedTitle: "第一类接触",
    relatedKind: "movie",
    relatedId: "first-contact",
    submittedAt: "2026-08-07T08:48:00+08:00",
  },
  {
    id: "pd-3",
    content: "请审核：欢迎新船员加入档案站",
    relatedTitle: "下一代 · S01E01",
    relatedKind: "episode",
    relatedId: "the-next-generation-1-1",
    submittedAt: "2026-08-06T22:15:00+08:00",
  },
  {
    id: "pd-4",
    content: "画质切换后声音有点空",
    relatedTitle: "可汗怒吼",
    relatedKind: "movie",
    relatedId: "wrath-of-khan",
    submittedAt: "2026-08-06T21:03:00+08:00",
  },
  {
    id: "pd-5",
    content: "这一镜构图像档案封面",
    relatedTitle: "奇异新世界 · S01E03",
    relatedKind: "episode",
    relatedId: "strange-new-worlds-1-3",
    submittedAt: "2026-08-06T19:40:00+08:00",
  },
  {
    id: "pd-6",
    content: "弹幕字号建议默认再小一号",
    relatedTitle: "深空九号 · S02E02",
    relatedKind: "episode",
    relatedId: "deep-space-nine-2-2",
    submittedAt: "2026-08-06T16:22:00+08:00",
  },
  {
    id: "pd-7",
    content: "社区整理辛苦了，继续维护",
    relatedTitle: "超越星辰",
    relatedKind: "movie",
    relatedId: "beyond",
    submittedAt: "2026-08-06T14:05:00+08:00",
  },
  {
    id: "pd-8",
    content: "无原名条目的标题显示正常吗",
    relatedTitle: "边疆来信 · S01E01",
    relatedKind: "episode",
    relatedId: "frontier-letters-1-1",
    submittedAt: "2026-08-06T11:58:00+08:00",
  },
];

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

export function dashboardSummary() {
  return {
    seriesCount: adminSeries.length,
    movieCount: adminMovies.length,
    sourceCount: SOURCE_COUNT,
    pendingDanmakuCount: PENDING_DANMAKU_COUNT,
  };
}
