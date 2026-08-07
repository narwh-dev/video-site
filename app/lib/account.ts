export type SelectableId = string;

export function toggleSelection(selected: ReadonlySet<SelectableId>, id: SelectableId): Set<SelectableId> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function selectAllIds(ids: readonly SelectableId[]): Set<SelectableId> {
  return new Set(ids);
}

export function clearSelection(): Set<SelectableId> {
  return new Set();
}

export function removeByIds<T extends { id: string }>(items: readonly T[], ids: ReadonlySet<string> | readonly string[]): T[] {
  const idSet = ids instanceof Set ? ids : new Set(ids);
  return items.filter((item) => !idSet.has(item.id));
}

export function removeById<T extends { id: string }>(items: readonly T[], id: string): { items: T[]; removed: T | null; index: number } {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return { items: [...items], removed: null, index: -1 };
  const removed = items[index];
  return {
    items: [...items.slice(0, index), ...items.slice(index + 1)],
    removed,
    index,
  };
}

export function insertAt<T>(items: readonly T[], item: T, index: number): T[] {
  const safeIndex = Math.max(0, Math.min(index, items.length));
  return [...items.slice(0, safeIndex), item, ...items.slice(safeIndex)];
}

export type HistoryDayGroup = "today" | "yesterday" | "earlier";

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function historyDayGroup(watchedAt: string | Date, now: Date): HistoryDayGroup {
  const watched = typeof watchedAt === "string" ? new Date(watchedAt) : watchedAt;
  const today = startOfLocalDay(now).getTime();
  const day = startOfLocalDay(watched).getTime();
  const diffDays = Math.round((today - day) / 86_400_000);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  return "earlier";
}

export function groupHistoryItems<T extends { watchedAt: string }>(
  items: readonly T[],
  now: Date,
): { key: HistoryDayGroup; label: string; items: T[] }[] {
  const buckets: Record<HistoryDayGroup, T[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  for (const item of items) {
    buckets[historyDayGroup(item.watchedAt, now)].push(item);
  }
  const labels: Record<HistoryDayGroup, string> = {
    today: "今天",
    yesterday: "昨天",
    earlier: "更早",
  };
  return (["today", "yesterday", "earlier"] as const)
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({ key, label: labels[key], items: buckets[key] }));
}

export function formatWatchedLabel(watchedAt: string, now: Date): string {
  const group = historyDayGroup(watchedAt, now);
  const date = new Date(watchedAt);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (group === "today") return `今天 ${time}`;
  if (group === "yesterday") return `昨天 ${time}`;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日 ${time}`;
}

export function formatFavoritedLabel(favoritedAt: string): string {
  const date = new Date(favoritedAt.includes("T") ? favoritedAt : `${favoritedAt}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return favoritedAt;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 收藏`;
}
