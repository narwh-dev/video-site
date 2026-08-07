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
  route("login", "routes/login.tsx"),
  route("favorites", "routes/favorites.tsx"),
  route("history", "routes/history.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
