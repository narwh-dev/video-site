export type MediaKind = "series" | "movie";

export type Episode = {
  id: string;
  season: number;
  number: number;
  title: string;
  synopsis: string;
  duration: number;
  playable: boolean;
  progress: number;
};

export type Series = {
  id: string;
  kind: "series";
  title: string;
  originalTitle?: string;
  year: number;
  tags: string[];
  description?: string;
  seasonCount: number;
  playable: boolean;
  featured?: boolean;
  episodes: Episode[];
};

export type Movie = {
  id: string;
  kind: "movie";
  title: string;
  originalTitle?: string;
  year: number;
  tags: string[];
  description?: string;
  duration: number;
  playable: boolean;
  progress: number;
  featured?: boolean;
};

export type CatalogItem = Series | Movie;

const seriesSeed = [
  ["strange-new-worlds", "奇异新世界", "Strange New Worlds", 2022, 3, ["探索", "剧情"]],
  ["the-next-generation", "下一代", "The Next Generation", 1987, 7, ["经典", "探索"]],
  ["deep-space-nine", "深空九号", "Deep Space Nine", 1993, 7, ["空间站", "剧情"]],
  ["voyager", "航海家号", "Voyager", 1995, 7, ["探索", "冒险"]],
  ["enterprise", "进取号", "Enterprise", 2001, 4, ["前传", "探索"]],
  ["discovery", "发现号", "Discovery", 2017, 5, ["剧情", "冒险"]],
  ["picard", "皮卡德", "Picard", 2020, 3, ["剧情", "经典"]],
  ["lower-decks", "下层舰员", "Lower Decks", 2020, 5, ["动画", "喜剧"]],
  ["prodigy", "神童", "Prodigy", 2021, 2, ["动画", "冒险"]],
  ["the-original-series", "原初系列", "The Original Series", 1966, 3, ["经典", "探索"]],
  ["short-treks", "短途", "Short Treks", 2018, 2, ["短片", "选集"]],
  ["animated-series", "动画系列", "The Animated Series", 1973, 2, ["动画", "经典"]],
  ["archive-nine", "银河档案：跨越九个时代的漫长航行记录", "Archive Nine", 1979, 9, ["档案", "经典"]],
  ["frontier-letters", "边疆来信", "", 2025, 1, ["社区", "短片"]],
] as const;

const movieSeed = [
  ["motion-picture", "星际旅行：无限太空", "The Motion Picture", 1979, 132, true],
  ["wrath-of-khan", "可汗怒吼", "The Wrath of Khan", 1982, 113, true],
  ["search-for-spock", "寻找斯波克", "The Search for Spock", 1984, 105, true],
  ["voyage-home", "抢救未来", "The Voyage Home", 1986, 119, true],
  ["final-frontier", "终极先锋", "The Final Frontier", 1989, 107, false],
  ["undiscovered-country", "未来之城", "The Undiscovered Country", 1991, 110, true],
  ["generations", "日换星移", "Generations", 1994, 118, true],
  ["first-contact", "第一类接触", "First Contact", 1996, 111, true],
  ["insurrection", "星空反攻", "Insurrection", 1998, 103, true],
  ["nemesis", "复仇女神", "Nemesis", 2002, 116, false],
  ["star-trek-2009", "星际迷航", "Star Trek", 2009, 127, true],
  ["into-darkness", "暗黑无界", "Into Darkness", 2013, 132, true],
  ["beyond", "超越星辰", "Beyond", 2016, 122, true],
  ["section-31", "第31区", "Section 31", 2025, 96, true],
  ["memory-alpha", "阿尔法记忆：一部没有原名的社区档案电影", "", 2024, 94, true],
  ["lost-transmission", "消失的通讯", "Lost Transmission", 2023, 101, false],
  ["long-way-home", "返航之路：穿越漫长未知疆域直到群星重新出现", "The Long Way Home Across the Unknown", 2026, 148, true],
  ["silent-orbit", "寂静轨道", "Silent Orbit", 2022, 108, true],
] as const;

function makeEpisodes(seriesId: string, seasons: number): Episode[] {
  const count = seriesId === "strange-new-worlds" ? 8 : seriesId === "archive-nine" ? 3 : 4;
  return Array.from({ length: seasons * count }, (_, index) => {
    const season = Math.floor(index / count) + 1;
    const number = (index % count) + 1;
    const episodeCode = `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
    return {
      id: `${seriesId}-${season}-${number}`,
      season,
      number,
      title: number === 4 ? "在两颗恒星之间等待黎明的漫长一夜" : `航行日志 ${episodeCode}`,
      synopsis: number === 7 ? "" : "舰员面对一项无法只靠技术解决的选择，并重新理解探索的意义。",
      duration: 45 + ((season + number) % 9),
      playable: !(seriesId === "archive-nine" && season === 9) && number !== 6,
      progress: seriesId === "strange-new-worlds" && season === 2 && number === 4 ? 62 : number === 1 ? 0 : number === 3 ? 100 : 0,
    };
  });
}

export const series: Series[] = seriesSeed.map((item, index) => ({
  id: item[0],
  kind: "series",
  title: item[1],
  originalTitle: item[2] || undefined,
  year: item[3],
  seasonCount: item[4],
  tags: [...item[5]],
  description: index === 13 ? undefined : "一支舰队、一段未知航程，以及在遥远世界之间建立理解的持续尝试。",
  playable: index !== 12,
  featured: index === 0,
  episodes: makeEpisodes(item[0], item[4]),
}));

export const movies: Movie[] = movieSeed.map((item, index) => ({
  id: item[0],
  kind: "movie",
  title: item[1],
  originalTitle: item[2] || undefined,
  year: item[3],
  duration: item[4],
  playable: item[5],
  progress: index === 7 ? 46 : index === 1 ? 100 : 0,
  tags: index % 3 === 0 ? ["冒险", "剧情"] : ["科幻", "探索"],
  description: index === 14 ? undefined : "一次重要任务把熟悉的舰员带到新的边界，他们必须在责任与信念之间作出决定。",
  featured: index === 7,
}));

export const allCatalog: CatalogItem[] = [...series, ...movies];

export const titleCardPalette = ["#111111", "#3B82F6", "#FB923C", "#34D399"] as const;

export function titleCardColor(id: string) {
  const bannerId = id.endsWith("-banner") ? id.slice(0, -"-banner".length) : id;
  const catalogIndex = allCatalog.findIndex((item) => item.id === bannerId);
  if (catalogIndex >= 0) return titleCardPalette[catalogIndex % titleCardPalette.length];

  let episodeIndex = allCatalog.length;
  for (const item of series) {
    for (const episode of item.episodes) {
      if (episode.id === id) return titleCardPalette[episodeIndex % titleCardPalette.length];
      episodeIndex += 1;
    }
  }
  return titleCardPalette[0];
}

export function findSeries(id: string): Series | undefined {
  return series.find((item) => item.id === id);
}

export function findMovie(id: string): Movie | undefined {
  return movies.find((item) => item.id === id);
}

export function defaultSeason(item: Series, persona: string): number {
  if (persona === "user") {
    const recent = item.episodes.find((episode) => episode.progress > 0 && episode.progress < 100);
    if (recent) return recent.season;
  }
  return item.episodes.find((episode) => episode.playable)?.season ?? 1;
}

export function searchCatalog(query: string) {
  const needle = query.trim().toLocaleLowerCase("zh-CN");
  if (!needle) return [];
  const catalogResults = allCatalog.filter((item) =>
    `${item.title} ${item.originalTitle ?? ""} ${item.tags.join(" ")}`.toLocaleLowerCase("zh-CN").includes(needle),
  );
  const episodeResults = series.flatMap((show) => show.episodes
    .filter((episode) => `${episode.title} ${show.title}`.toLocaleLowerCase("zh-CN").includes(needle))
    .map((episode) => ({ ...episode, kind: "episode" as const, seriesTitle: show.title, seriesId: show.id, seriesYear: show.year })));
  return [...catalogResults, ...episodeResults];
}
