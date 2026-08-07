import { findMovie, findSeries, type CatalogItem, type Movie, type Series } from "./catalog";

export type FavoriteSeed = {
  id: string;
  kind: "series" | "movie";
  favoritedAt: string;
};

export type FavoriteItem = {
  id: string;
  kind: "series" | "movie";
  favoritedAt: string;
  title: string;
  originalTitle?: string;
  year: number;
  meta: string;
  href: string;
  playHref: string | null;
  item: CatalogItem;
};

export const favoriteSeeds: FavoriteSeed[] = [
  { id: "strange-new-worlds", kind: "series", favoritedAt: "2026-08-01T10:20:00+08:00" },
  { id: "first-contact", kind: "movie", favoritedAt: "2026-07-28T21:05:00+08:00" },
  { id: "deep-space-nine", kind: "series", favoritedAt: "2026-07-15T16:40:00+08:00" },
  { id: "wrath-of-khan", kind: "movie", favoritedAt: "2026-06-20T09:12:00+08:00" },
];

function resolveSeriesFavorite(seed: FavoriteSeed, show: Series): FavoriteItem {
  const current = show.episodes.find((episode) => episode.progress > 0 && episode.progress < 100)
    ?? show.episodes.find((episode) => episode.playable)
    ?? null;
  return {
    id: seed.id,
    kind: "series",
    favoritedAt: seed.favoritedAt,
    title: show.title,
    originalTitle: show.originalTitle,
    year: show.year,
    meta: `${show.year} · ${show.seasonCount} 季`,
    href: `/series/${show.id}`,
    playHref: current?.playable ? `/watch/episode/${current.id}` : null,
    item: show,
  };
}

function resolveMovieFavorite(seed: FavoriteSeed, movie: Movie): FavoriteItem {
  return {
    id: seed.id,
    kind: "movie",
    favoritedAt: seed.favoritedAt,
    title: movie.title,
    originalTitle: movie.originalTitle,
    year: movie.year,
    meta: `${movie.year} · ${movie.duration} 分钟`,
    href: `/movies/${movie.id}`,
    playHref: movie.playable ? `/watch/movie/${movie.id}` : null,
    item: movie,
  };
}

export function resolveFavorite(seed: FavoriteSeed): FavoriteItem | null {
  if (seed.kind === "series") {
    const show = findSeries(seed.id);
    return show ? resolveSeriesFavorite(seed, show) : null;
  }
  const movie = findMovie(seed.id);
  return movie ? resolveMovieFavorite(seed, movie) : null;
}

export function getDefaultFavorites(): FavoriteItem[] {
  return favoriteSeeds
    .map((seed) => resolveFavorite(seed))
    .filter((item): item is FavoriteItem => item != null);
}

export function favoritesForScenario(scenario: string): FavoriteItem[] {
  if (scenario === "empty") return [];
  return getDefaultFavorites();
}
