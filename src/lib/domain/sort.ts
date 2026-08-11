import type { Series } from "../../data/types.ts";

export type SeriesSortKey = "updated" | "year" | "title";

export function byUpdatedDesc(
  a: { updatedAt: string },
  b: { updatedAt: string },
): number {
  if (a.updatedAt < b.updatedAt) {
    return 1;
  }
  if (a.updatedAt > b.updatedAt) {
    return -1;
  }
  return 0;
}

export function byYearDesc(a: { year: number }, b: { year: number }): number {
  return b.year - a.year;
}

export function byYearAsc(a: { year: number }, b: { year: number }): number {
  return a.year - b.year;
}

export function byTitleZh(
  a: { title: { zhHans: string } },
  b: { title: { zhHans: string } },
): number {
  return a.title.zhHans.localeCompare(b.title.zhHans, "zh-Hans-CN");
}

export function sortSeries(
  list: readonly Series[],
  sort: SeriesSortKey,
  updatedAtOf: (slug: string) => string,
): Series[] {
  const copy = list.slice();
  if (sort === "year") {
    copy.sort((a, b) => {
      const year = byYearDesc(a, b);
      if (year !== 0) {
        return year;
      }
      return byTitleZh(a, b);
    });
    return copy;
  }
  if (sort === "title") {
    copy.sort(byTitleZh);
    return copy;
  }
  copy.sort((a, b) => {
    const updated = byUpdatedDesc(
      { updatedAt: updatedAtOf(a.slug) },
      { updatedAt: updatedAtOf(b.slug) },
    );
    if (updated !== 0) {
      return updated;
    }
    return byTitleZh(a, b);
  });
  return copy;
}
