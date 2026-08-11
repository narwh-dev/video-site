import {
  MANIFEST,
  MOVIE_EPISODE_CODE,
  episodeCode,
  type ManifestEntry,
} from "./manifest.ts";
import type {
  Episode,
  MultilingualTitle,
  Season,
  Series,
  WatchProgress,
} from "./types.ts";

export const TODAY = "2026-08-11";

const EPISODE_TITLES_ZH = [
  "深空回响",
  "曲速边缘",
  "联邦信使",
  "隐秘航道",
  "星图残页",
  "镜像裂隙",
  "第一接触",
  "时间回环",
  "舰桥守夜",
  "虫洞彼岸",
  "沉默协议",
  "光子风暴",
  "舰长日志",
  "失落殖民地",
  "相位异常",
  "记忆核心",
  "边界协定",
  "幽灵信号",
  "孢子跳跃",
  "联邦日",
  "绝境航线",
  "双生镜像",
  "星尘挽歌",
  "协议之外",
  "未知航标",
  "引擎室密语",
  "远征序章",
  "和平代价",
  "夜航守望",
  "最后一跃",
] as const;

const EPISODE_TITLES_EN = [
  "Deep Space Echo",
  "Warp Edge",
  "Federation Courier",
  "Hidden Passage",
  "Star Chart Fragment",
  "Mirror Rift",
  "First Contact",
  "Temporal Loop",
  "Bridge Vigil",
  "Beyond the Wormhole",
  "Silent Protocol",
  "Photon Storm",
  "Captain's Log",
  "Lost Colony",
  "Phase Anomaly",
  "Memory Core",
  "Border Accord",
  "Ghost Signal",
  "Spore Jump",
  "Federation Day",
  "Desperate Course",
  "Twin Mirror",
  "Stardust Elegy",
  "Beyond Protocol",
  "Unknown Beacon",
  "Engine Room Whispers",
  "Expedition Prologue",
  "Price of Peace",
  "Night Watch",
  "Final Leap",
] as const;

const DESCRIPTION_TEMPLATES = [
  (seriesTitle: string, epTitle: string) =>
    `在《${seriesTitle}》中，船员们面对${epTitle}带来的未知挑战，必须在联邦原则与生存之间做出抉择。`,
  (seriesTitle: string, epTitle: string) =>
    `本集《${epTitle}》记录了${seriesTitle}航程中的关键转折：一次探测任务意外揭开了更深的阴谋。`,
  (seriesTitle: string, epTitle: string) =>
    `${seriesTitle}的舰桥再次响起红色警报。《${epTitle}》讲述了船员如何以勇气与智慧化解危机。`,
] as const;

function hashKey(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h + input.charCodeAt(i) * (i + 1)) % 9973;
  }
  return h;
}

function pickIndex(key: string, length: number): number {
  return hashKey(key) % length;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function buildAirDate(
  year: number,
  season: number | null,
  episode: number | null,
  key: string,
): string {
  const h = hashKey(key);
  const monthBase = season === null ? 1 + (h % 12) : Math.min(12, Math.max(1, season * 2 - 1 + (h % 2)));
  const day = 1 + (h % 28);
  const yearOffset = season === null ? 0 : Math.max(0, (season ?? 1) - 1);
  const y = year + yearOffset;
  const epBump = episode === null ? 0 : Math.floor((episode - 1) / 4);
  const m = Math.min(12, monthBase + epBump);
  return `${y}-${pad2(m)}-${pad2(day)}`;
}

function buildEpisodeTitle(
  entry: ManifestEntry,
  code: string,
  isMovie: boolean,
): MultilingualTitle {
  if (isMovie) {
    return { ...entry.title };
  }
  const idx = pickIndex(`${entry.slug}:${code}`, EPISODE_TITLES_ZH.length);
  const zhHans = EPISODE_TITLES_ZH[idx] ?? EPISODE_TITLES_ZH[0];
  const en = EPISODE_TITLES_EN[idx] ?? EPISODE_TITLES_EN[0];
  const title: MultilingualTitle = { zhHans, en };
  if (entry.title.zhHant !== undefined) {
    title.zhHant = zhHans;
  }
  return title;
}

function buildDescription(
  seriesTitle: string,
  epTitle: string,
  key: string,
): string {
  const idx = pickIndex(key, DESCRIPTION_TEMPLATES.length);
  const template = DESCRIPTION_TEMPLATES[idx] ?? DESCRIPTION_TEMPLATES[0];
  return template(seriesTitle, epTitle);
}

function buildDurationSec(durationMin: number, key: string): number {
  const variation = (hashKey(key) % 4) - 1;
  return durationMin * 60 + variation * 60;
}

function buildSubtitleTracks(slug: string, code: string): Episode["subtitleTracks"] {
  if (slug === "tos" && code === "S03E06") {
    return [];
  }
  if (slug === "pro") {
    return ["zh-Hans"];
  }
  return ["zh-Hans", "en"];
}

function buildHasDanmaku(slug: string, code: string): boolean {
  if (slug === "ent") {
    return false;
  }
  if (slug === "pro" && code.startsWith("S02")) {
    return false;
  }
  return true;
}

function buildEpisode(
  entry: ManifestEntry,
  code: string,
  season: number | null,
  number: number | null,
): Episode {
  const key = `${entry.slug}:${code}`;
  const isMovie = entry.kind === "movie";
  const title = buildEpisodeTitle(entry, code, isMovie);
  const unplayable = entry.unplayable ?? [];
  return {
    code,
    season,
    number,
    title,
    durationSec: buildDurationSec(entry.durationMin, key),
    playable: !unplayable.includes(code),
    airDate: buildAirDate(entry.year, season, number, key),
    description: buildDescription(entry.title.zhHans, title.zhHans, key),
    subtitleTracks: buildSubtitleTracks(entry.slug, code),
    hasDanmaku: buildHasDanmaku(entry.slug, code),
  };
}

function buildSeries(entry: ManifestEntry): Series {
  const decade = `${Math.floor(entry.year / 10) * 10}s` as Series["decade"];
  let seasons: Season[];

  if (entry.kind === "movie") {
    seasons = [
      {
        number: 1,
        episodes: [buildEpisode(entry, MOVIE_EPISODE_CODE, null, null)],
      },
    ];
  } else {
    const seasonCounts = entry.seasons ?? [];
    seasons = seasonCounts.map((count, seasonIndex) => {
      const seasonNumber = seasonIndex + 1;
      const episodes: Episode[] = [];
      for (let ep = 1; ep <= count; ep += 1) {
        const code = episodeCode(seasonNumber, ep);
        episodes.push(buildEpisode(entry, code, seasonNumber, ep));
      }
      return { number: seasonNumber, episodes };
    });
  }

  const allEpisodes = seasons.flatMap((s) => s.episodes);
  return {
    slug: entry.slug,
    code: entry.code,
    kind: entry.kind,
    title: { ...entry.title },
    year: entry.year,
    decade,
    genres: [...entry.genres],
    summary: entry.summary,
    seasons,
    episodeCount: allEpisodes.length,
    playableEpisodeCount: allEpisodes.filter((e) => e.playable).length,
  };
}

export const SERIES: Series[] = MANIFEST.map(buildSeries);

const seriesBySlug = new Map(SERIES.map((s) => [s.slug, s]));

export function getSeries(slug: string): Series | null {
  return seriesBySlug.get(slug) ?? null;
}

export function getEpisode(slug: string, code: string): Episode | null {
  const series = getSeries(slug);
  if (!series) {
    return null;
  }
  for (const season of series.seasons) {
    const found = season.episodes.find((e) => e.code === code);
    if (found) {
      return found;
    }
  }
  return null;
}

export function listSeasons(slug: string): Season[] {
  return getSeries(slug)?.seasons ?? [];
}

export function episodeCountOf(slug: string): number {
  return getSeries(slug)?.episodeCount ?? 0;
}

export function firstPlayableEpisode(slug: string): Episode | null {
  const series = getSeries(slug);
  if (!series) {
    return null;
  }
  for (const season of series.seasons) {
    for (const episode of season.episodes) {
      if (episode.playable) {
        return episode;
      }
    }
  }
  return null;
}

export function clampSeason(slug: string, season: number): number {
  const series = getSeries(slug);
  if (!series || series.seasons.length === 0) {
    return 1;
  }
  const numbers = series.seasons.map((s) => s.number);
  const min = numbers[0] ?? 1;
  const max = numbers[numbers.length - 1] ?? 1;
  if (season < min) {
    return min;
  }
  if (season > max) {
    return max;
  }
  return season;
}

export function findEpisodeLocation(
  slug: string,
  code: string,
): { series: Series; episode: Episode; season: Season } | null {
  const series = getSeries(slug);
  if (!series) {
    return null;
  }
  for (const season of series.seasons) {
    const episode = season.episodes.find((e) => e.code === code);
    if (episode) {
      return { series, episode, season };
    }
  }
  return null;
}

export function allEpisodes(
  series?: Series,
): Array<{ series: Series; episode: Episode; season: Season }> {
  const list = series ? [series] : SERIES;
  const result: Array<{ series: Series; episode: Episode; season: Season }> = [];
  for (const s of list) {
    for (const season of s.seasons) {
      for (const episode of season.episodes) {
        result.push({ series: s, episode, season });
      }
    }
  }
  return result;
}

export function prevNextEpisode(
  slug: string,
  code: string,
): { prev: Episode | null; next: Episode | null } {
  const series = getSeries(slug);
  if (!series) {
    return { prev: null, next: null };
  }
  const flat = series.seasons.flatMap((s) => s.episodes);
  const index = flat.findIndex((e) => e.code === code);
  if (index < 0) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? (flat[index - 1] ?? null) : null,
    next: index < flat.length - 1 ? (flat[index + 1] ?? null) : null,
  };
}

export function resumeEpisodeFor(
  series: Series,
  progressList: WatchProgress[],
): Episode | null {
  const relevant = progressList
    .filter((p) => p.slug === series.slug)
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));

  for (const progress of relevant) {
    const episode = series.seasons
      .flatMap((s) => s.episodes)
      .find((e) => e.code === progress.episodeCode);
    if (episode?.playable) {
      return episode;
    }
  }

  for (const season of series.seasons) {
    for (const episode of season.episodes) {
      if (episode.playable) {
        return episode;
      }
    }
  }
  return null;
}

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function titleMatches(title: MultilingualTitle, q: string): boolean {
  if (!q) {
    return true;
  }
  const n = normalizeQuery(q);
  if (title.zhHans.toLowerCase().includes(n)) {
    return true;
  }
  if (title.zhHant?.toLowerCase().includes(n)) {
    return true;
  }
  if (title.en?.toLowerCase().includes(n)) {
    return true;
  }
  return false;
}

export function searchCatalog(options: {
  q: string;
  kind: "series" | "movie" | "all";
}): Series[] {
  const q = options.q;
  return SERIES.filter((s) => {
    if (options.kind !== "all" && s.kind !== options.kind) {
      return false;
    }
    return titleMatches(s.title, q);
  });
}

export function searchEpisodes(
  q: string,
): Array<{ series: Series; episode: Episode; season: Season }> {
  const n = normalizeQuery(q);
  const upper = q.trim().toUpperCase();
  return allEpisodes().filter(({ episode }) => {
    if (!n) {
      return true;
    }
    if (episode.code.toUpperCase().includes(upper)) {
      return true;
    }
    return titleMatches(episode.title, q);
  });
}
