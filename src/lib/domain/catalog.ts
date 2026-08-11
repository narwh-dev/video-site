import type { ContentKind, Series } from "../../data/types.ts";
import { matchesMultilingual } from "./text.ts";
import { sortSeries, type SeriesSortKey } from "./sort.ts";

export type CatalogTypeFilter = "all" | ContentKind;
export type CatalogDecadeFilter = "all" | `${number}s`;

export type CatalogQuery = {
  q: string;
  type: CatalogTypeFilter;
  decade: CatalogDecadeFilter;
  sort: SeriesSortKey;
};

export function decadeOfYear(year: number): `${number}s` {
  return `${Math.floor(year / 10) * 10}s`;
}

export function applyCatalogQuery(
  series: readonly Series[],
  query: CatalogQuery,
  updatedAtOf: (slug: string) => string,
): Series[] {
  const filtered = series.filter((item) => {
    if (query.type !== "all" && item.kind !== query.type) {
      return false;
    }
    if (query.decade !== "all" && item.decade !== query.decade) {
      return false;
    }
    return matchesMultilingual(item.title, query.q);
  });
  return sortSeries(filtered, query.sort, updatedAtOf);
}
