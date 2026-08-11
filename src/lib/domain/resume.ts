import type { Episode, Series, WatchProgress } from "../../data/types.ts";

export function pickResumeEpisode(
  series: Series,
  progressList: readonly WatchProgress[],
): Episode | null {
  const relevant = progressList
    .filter((p) => p.slug === series.slug)
    .slice()
    .sort((a, b) => {
      if (a.updatedAt < b.updatedAt) {
        return 1;
      }
      if (a.updatedAt > b.updatedAt) {
        return -1;
      }
      return 0;
    });

  const flat = series.seasons.flatMap((s) => s.episodes);

  for (const progress of relevant) {
    const episode = flat.find((e) => e.code === progress.episodeCode);
    if (episode?.playable) {
      return episode;
    }
  }

  for (const episode of flat) {
    if (episode.playable) {
      return episode;
    }
  }
  return null;
}

export function seasonForEpisode(
  series: Series,
  code: string,
): number | null {
  for (const season of series.seasons) {
    if (season.episodes.some((e) => e.code === code)) {
      return season.number;
    }
  }
  return null;
}
