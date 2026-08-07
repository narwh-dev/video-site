import { findMovie, series, type Episode, type Movie, type Series } from "./catalog";
import { episodeCode } from "../lib/watch";

export const PROTOTYPE_NOW = new Date("2026-08-07T18:30:00+08:00");

export type HistorySeed = {
  id: string;
  kind: "episode" | "movie";
  contentId: string;
  watchedAt: string;
  progress: number;
};

export type HistoryItem = {
  id: string;
  kind: "episode" | "movie";
  contentId: string;
  watchedAt: string;
  progress: number;
  title: string;
  belonging: string;
  watchHref: string;
  duration: number;
  playable: boolean;
  series?: Series;
  episode?: Episode;
  movie?: Movie;
};

export const historySeeds: HistorySeed[] = [
  {
    id: "hist-snw-2-4",
    kind: "episode",
    contentId: "strange-new-worlds-2-4",
    watchedAt: "2026-08-07T14:20:00+08:00",
    progress: 62,
  },
  {
    id: "hist-first-contact",
    kind: "movie",
    contentId: "first-contact",
    watchedAt: "2026-08-07T09:05:00+08:00",
    progress: 46,
  },
  {
    id: "hist-snw-2-1",
    kind: "episode",
    contentId: "strange-new-worlds-2-1",
    watchedAt: "2026-08-06T22:40:00+08:00",
    progress: 100,
  },
  {
    id: "hist-wrath",
    kind: "movie",
    contentId: "wrath-of-khan",
    watchedAt: "2026-08-06T12:15:00+08:00",
    progress: 18,
  },
  {
    id: "hist-ds9-1-1",
    kind: "episode",
    contentId: "deep-space-nine-1-1",
    watchedAt: "2026-08-01T20:10:00+08:00",
    progress: 35,
  },
  {
    id: "hist-motion",
    kind: "movie",
    contentId: "motion-picture",
    watchedAt: "2026-07-18T16:45:00+08:00",
    progress: 8,
  },
];

function resolveEpisodeHistory(seed: HistorySeed): HistoryItem | null {
  for (const show of series) {
    const episode = show.episodes.find((item) => item.id === seed.contentId);
    if (!episode) continue;
    const code = episodeCode(episode);
    return {
      id: seed.id,
      kind: "episode",
      contentId: seed.contentId,
      watchedAt: seed.watchedAt,
      progress: seed.progress,
      title: episode.title,
      belonging: `${show.title} · ${code}`,
      watchHref: `/watch/episode/${episode.id}`,
      duration: episode.duration,
      playable: episode.playable,
      series: show,
      episode,
    };
  }
  return null;
}

function resolveMovieHistory(seed: HistorySeed): HistoryItem | null {
  const movie = findMovie(seed.contentId);
  if (!movie) return null;
  return {
    id: seed.id,
    kind: "movie",
    contentId: seed.contentId,
    watchedAt: seed.watchedAt,
    progress: seed.progress,
    title: movie.title,
    belonging: "电影",
    watchHref: `/watch/movie/${movie.id}`,
    duration: movie.duration,
    playable: movie.playable,
    movie,
  };
}

export function resolveHistory(seed: HistorySeed): HistoryItem | null {
  if (seed.kind === "episode") return resolveEpisodeHistory(seed);
  return resolveMovieHistory(seed);
}

export function getDefaultHistory(): HistoryItem[] {
  return historySeeds
    .map((seed) => resolveHistory(seed))
    .filter((item): item is HistoryItem => item != null);
}

export function historyForScenario(scenario: string): HistoryItem[] {
  if (scenario === "empty") return [];
  return getDefaultHistory();
}
