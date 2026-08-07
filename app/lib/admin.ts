import type { Scenario } from "./prototype";

export const adminStates = [
  "default",
  "selected",
  "dirty",
  "validation-error",
  "submitting",
  "delete-confirm",
  "action-error",
] as const;

export type AdminState = (typeof adminStates)[number];

export type VisibilityFilter = "all" | "visible" | "hidden";
export type CatalogSort = "updated" | "title" | "year";

export type CatalogListQuery = {
  q: string;
  visibility: VisibilityFilter;
  sort: CatalogSort;
};

export type CatalogListItem = {
  id: string;
  title: string;
  visibility: "visible" | "hidden";
  updatedAt: string;
  year?: number;
};

const listAdminStates = new Set<AdminState>(["default", "delete-confirm", "action-error"]);
const formAdminStates = new Set<AdminState>(["default", "dirty", "validation-error", "submitting", "action-error"]);

export function parseAdminStateParam(search: string): AdminState | null {
  const params = new URLSearchParams(search);
  for (const value of params.getAll("adminState")) {
    if (adminStates.includes(value as AdminState)) return value as AdminState;
  }
  return null;
}

export function resolveAdminState(
  scenario: Scenario | string,
  adminStateParam: string | null | undefined,
  allowed: ReadonlySet<AdminState> | readonly AdminState[],
  fallback: AdminState = "default",
): AdminState {
  if (scenario !== "default") return fallback;
  const allowedSet = allowed instanceof Set ? allowed : new Set(allowed);
  if (adminStateParam && allowedSet.has(adminStateParam as AdminState)) {
    return adminStateParam as AdminState;
  }
  return fallback;
}

export function resolveListAdminState(scenario: Scenario | string, search: string) {
  return resolveAdminState(scenario, parseAdminStateParam(search), listAdminStates);
}

export function resolveFormAdminState(scenario: Scenario | string, search: string) {
  return resolveAdminState(scenario, parseAdminStateParam(search), formAdminStates);
}

export function parseCatalogListQuery(search: string): CatalogListQuery {
  const params = new URLSearchParams(search);
  const visibilityRaw = params.get("visibility") ?? "all";
  const sortRaw = params.get("sort") ?? "updated";
  const visibility: VisibilityFilter =
    visibilityRaw === "visible" || visibilityRaw === "hidden" ? visibilityRaw : "all";
  const sort: CatalogSort =
    sortRaw === "title" || sortRaw === "year" || sortRaw === "updated" ? sortRaw : "updated";
  return {
    q: (params.get("q") ?? "").trim(),
    visibility,
    sort,
  };
}

export function filterAndSortCatalogItems<T extends CatalogListItem>(
  items: readonly T[],
  query: CatalogListQuery,
): T[] {
  const needle = query.q.toLocaleLowerCase("zh-CN");
  const filtered = items.filter((item) => {
    if (query.visibility !== "all" && item.visibility !== query.visibility) return false;
    if (!needle) return true;
    return item.title.toLocaleLowerCase("zh-CN").includes(needle);
  });
  return [...filtered].sort((a, b) => {
    if (query.sort === "title") return a.title.localeCompare(b.title, "zh-CN");
    if (query.sort === "year") return (b.year ?? 0) - (a.year ?? 0);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function removeAdminItemById<T extends { id: string }>(items: readonly T[], id: string) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return { items: [...items], removed: null as T | null, index: -1 };
  const next = [...items];
  const [removed] = next.splice(index, 1);
  return { items: next, removed, index };
}

export function formatAdminDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function visibilityLabel(value: "visible" | "hidden") {
  return value === "visible" ? "展示" : "隐藏";
}

export function playableLabel(value: boolean) {
  return value ? "可播放" : "不可播放";
}

export function requiredError(value: string) {
  return value.trim() ? null : "此字段为必填项";
}

export function yearError(value: string) {
  if (!value.trim()) return "此字段为必填项";
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return "请输入有效年份";
  return null;
}

export function positiveIntError(value: string, label = "编号") {
  if (!value.trim()) return "此字段为必填项";
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) return `请输入有效${label}`;
  return null;
}

export function durationError(value: string) {
  if (!value.trim()) return "此字段为必填项";
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "请输入有效时长（分钟）";
  return null;
}

export type SeriesFormValues = {
  title: string;
  originalTitle: string;
  year: string;
  description: string;
  tags: string;
  visibility: "visible" | "hidden";
  hasPoster: boolean;
  hasBanner: boolean;
};

export type SeasonFormValues = {
  number: string;
  title: string;
  description: string;
  visibility: "visible" | "hidden";
  hasPoster: boolean;
};

export type EpisodeFormValues = {
  number: string;
  title: string;
  originalTitle: string;
  description: string;
  duration: string;
  airDate: string;
  visibility: "visible" | "hidden";
  hasThumbnail: boolean;
};

export type MovieFormValues = {
  title: string;
  originalTitle: string;
  year: string;
  duration: string;
  description: string;
  tags: string;
  visibility: "visible" | "hidden";
  hasPoster: boolean;
  hasBanner: boolean;
};

export function validateSeriesForm(values: SeriesFormValues) {
  return {
    title: requiredError(values.title),
    year: yearError(values.year),
  };
}

export function validateSeasonForm(values: SeasonFormValues) {
  return {
    number: positiveIntError(values.number, "季号"),
    title: requiredError(values.title),
  };
}

export function validateEpisodeForm(values: EpisodeFormValues) {
  return {
    number: positiveIntError(values.number, "集号"),
    title: requiredError(values.title),
    duration: durationError(values.duration),
  };
}

export function validateMovieForm(values: MovieFormValues) {
  return {
    title: requiredError(values.title),
    year: yearError(values.year),
    duration: durationError(values.duration),
  };
}

export function hasFormErrors(errors: Record<string, string | null | undefined>) {
  return Object.values(errors).some(Boolean);
}
