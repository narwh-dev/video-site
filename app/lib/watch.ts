import type { Episode, Movie, Series } from "../data/catalog";
import { findMovie, movies, series } from "../data/catalog";

export type WatchEpisodeContent = {
  kind: "episode";
  id: string;
  title: string;
  displayTitle: string;
  code: string;
  synopsis: string;
  duration: number;
  playable: boolean;
  progress: number;
  series: Series;
  episode: Episode;
  seasonEpisodes: Episode[];
  previous: Episode | null;
  next: Episode | null;
};

export type WatchMovieContent = {
  kind: "movie";
  id: string;
  title: string;
  displayTitle: string;
  synopsis: string;
  duration: number;
  playable: boolean;
  progress: number;
  movie: Movie;
  originalTitle?: string;
  year: number;
  tags: string[];
};

export type WatchContent = WatchEpisodeContent | WatchMovieContent;

export function episodeCode(episode: Episode): string {
  return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
}

export function findEpisodeContent(id: string): WatchEpisodeContent | undefined {
  for (const show of series) {
    const episode = show.episodes.find((item) => item.id === id);
    if (!episode) continue;
    const seasonEpisodes = show.episodes
      .filter((item) => item.season === episode.season)
      .slice()
      .sort((a, b) => a.number - b.number);
    const index = seasonEpisodes.findIndex((item) => item.id === episode.id);
    const previous = index > 0 ? seasonEpisodes[index - 1] : null;
    const next = index >= 0 && index < seasonEpisodes.length - 1 ? seasonEpisodes[index + 1] : null;
    const code = episodeCode(episode);
    return {
      kind: "episode",
      id: episode.id,
      title: episode.title,
      displayTitle: `${show.title} ${code}`,
      code,
      synopsis: episode.synopsis || "本集暂无简介。",
      duration: episode.duration,
      playable: episode.playable,
      progress: episode.progress,
      series: show,
      episode,
      seasonEpisodes,
      previous,
      next,
    };
  }
  return undefined;
}

export function findMovieContent(id: string): WatchMovieContent | undefined {
  const movie = findMovie(id);
  if (!movie) return undefined;
  return {
    kind: "movie",
    id: movie.id,
    title: movie.title,
    displayTitle: movie.title,
    synopsis: movie.description || "暂无简介。",
    duration: movie.duration,
    playable: movie.playable,
    progress: movie.progress,
    movie,
    originalTitle: movie.originalTitle,
    year: movie.year,
    tags: movie.tags,
  };
}

export function relatedForEpisode(content: WatchEpisodeContent, limit = 6) {
  return series.filter((item) => item.id !== content.series.id).slice(0, limit);
}

export function relatedForMovie(content: WatchMovieContent, limit = 6) {
  return movies.filter((item) => item.id !== content.id).slice(0, limit);
}

export function getAdjacentLabels(content: WatchEpisodeContent) {
  return {
    previousLabel: content.previous ? `上一集 ${episodeCode(content.previous)}` : "已是第一集",
    nextLabel: content.next ? `下一集 ${episodeCode(content.next)}` : "已是最后一集",
    previousDisabled: !content.previous,
    nextDisabled: !content.next,
  };
}

const SESSION_PROGRESS_PREFIX = "stc-watch-progress:";

export function readSessionProgress(contentId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${SESSION_PROGRESS_PREFIX}${contentId}`);
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeSessionProgress(contentId: string, seconds: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${SESSION_PROGRESS_PREFIX}${contentId}`, String(Math.floor(seconds)));
  } catch {
    return;
  }
}

export function clearSessionProgress(contentId: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(`${SESSION_PROGRESS_PREFIX}${contentId}`);
  } catch {
    return;
  }
}
