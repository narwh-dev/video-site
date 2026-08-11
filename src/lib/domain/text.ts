import type { MultilingualTitle } from "../../data/types.ts";

export function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesMultilingual(
  title: MultilingualTitle,
  q: string,
): boolean {
  const needle = normalizeText(q);
  if (!needle) {
    return true;
  }
  if (normalizeText(title.zhHans).includes(needle)) {
    return true;
  }
  if (title.zhHant !== undefined && normalizeText(title.zhHant).includes(needle)) {
    return true;
  }
  if (title.en !== undefined && normalizeText(title.en).includes(needle)) {
    return true;
  }
  return false;
}

export function includesCode(q: string, code: string): boolean {
  const needle = q.trim().toUpperCase();
  if (!needle) {
    return true;
  }
  return code.toUpperCase().includes(needle);
}
