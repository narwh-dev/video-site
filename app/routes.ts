import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("series", "routes/catalog.tsx", { id: "series-catalog" }),
  route("movies", "routes/catalog.tsx", { id: "movies-catalog" }),
  route("series/:id", "routes/series-detail.tsx", { id: "series-detail" }),
  route("series/:id/season/:number", "routes/series-detail.tsx", { id: "series-season-detail" }),
  route("movies/:id", "routes/movie-detail.tsx"),
  route("search", "routes/search.tsx"),
  route("watch/episode/:id", "routes/watch-episode.tsx"),
  route("watch/movie/:id", "routes/watch-movie.tsx"),
  route("login", "routes/placeholder.tsx", { id: "login-placeholder" }),
  route("favorites", "routes/placeholder.tsx", { id: "favorites-placeholder" }),
  route("history", "routes/placeholder.tsx", { id: "history-placeholder" }),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
