import type { MultilingualTitle } from "../../data/types.ts";
import { includesCode, matchesMultilingual, normalizeText } from "./text.ts";

export type FavoritesHistorySort =
  | "addedAt-desc"
  | "addedAt-asc"
  | "updatedAt-desc"
  | "updatedAt-asc"
  | "title";

export type ItemAccessors<T> = {
  title: (item: T) => MultilingualTitle;
  code?: (item: T) => string | undefined;
  addedAt?: (item: T) => string;
  updatedAt?: (item: T) => string;
};

export function filterByQuery<T>(
  items: readonly T[],
  q: string,
  accessors: ItemAccessors<T>,
): T[] {
  const needle = normalizeText(q);
  if (!needle) {
    return items.slice();
  }
  return items.filter((item) => {
    if (matchesMultilingual(accessors.title(item), q)) {
      return true;
    }
    const code = accessors.code?.(item);
    if (code !== undefined && includesCode(q, code)) {
      return true;
    }
    return false;
  });
}

export function sortItems<T>(
  items: readonly T[],
  sort: FavoritesHistorySort,
  accessors: ItemAccessors<T>,
): T[] {
  const copy = items.slice();
  if (sort === "title") {
    copy.sort((a, b) =>
      accessors.title(a).zhHans.localeCompare(accessors.title(b).zhHans, "zh-Hans-CN"),
    );
    return copy;
  }

  const field: "addedAt" | "updatedAt" =
    sort.startsWith("addedAt") ? "addedAt" : "updatedAt";
  const desc = sort.endsWith("desc");
  const read = field === "addedAt" ? accessors.addedAt : accessors.updatedAt;

  copy.sort((a, b) => {
    const av = read?.(a) ?? "";
    const bv = read?.(b) ?? "";
    if (av < bv) {
      return desc ? 1 : -1;
    }
    if (av > bv) {
      return desc ? -1 : 1;
    }
    return accessors
      .title(a)
      .zhHans.localeCompare(accessors.title(b).zhHans, "zh-Hans-CN");
  });
  return copy;
}

export function nextFocusIndexAfterRemoval(
  listLength: number,
  removedIndex: number,
): number {
  if (listLength <= 0) {
    return -1;
  }
  if (removedIndex < 0 || removedIndex >= listLength) {
    return -1;
  }
  const remaining = listLength - 1;
  if (remaining <= 0) {
    return -1;
  }
  if (removedIndex < remaining) {
    return removedIndex;
  }
  return remaining - 1;
}
