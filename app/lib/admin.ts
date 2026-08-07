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
const danmakuAdminStates = new Set<AdminState>(["default", "selected", "delete-confirm", "action-error"]);

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

export function resolveDanmakuAdminState(scenario: Scenario | string, search: string) {
  return resolveAdminState(scenario, parseAdminStateParam(search), danmakuAdminStates);
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

export type SourceProvider = "public_url" | "r2" | "rustfs" | "openlist";
export type SourceQuality = "1080p" | "720p" | "480p" | "auto";

export type SourceFormValues = {
  relatedKey: string;
  provider: SourceProvider;
  label: string;
  quality: SourceQuality;
  enabled: boolean;
  url: string;
  objectPath: string;
  resourceUrl: string;
};

export type SubtitleFormValues = {
  relatedKey: string;
  language: string;
  label: string;
  isDefault: boolean;
  enabled: boolean;
  fileName: string;
  fileSize: number;
  fileStatus: "empty" | "parsing" | "success" | "format-error";
};

export type SourceListQuery = {
  contentType: "all" | "episode" | "movie";
  provider: "all" | SourceProvider;
  quality: "all" | SourceQuality;
  status: "all" | "enabled" | "disabled";
};

export type SubtitleListQuery = {
  q: string;
  language: string;
  status: "all" | "enabled" | "disabled" | "default";
};

export type DanmakuListQuery = {
  status: "pending" | "approved" | "hidden";
  q: string;
  related: string;
  submitted: string;
};

export type AuditListQuery = {
  date: string;
  actionType: string;
  q: string;
};

export const sourceProviderLabels: Record<SourceProvider, string> = {
  public_url: "公开链接",
  r2: "R2 对象",
  rustfs: "RustFS",
  openlist: "OpenList",
};

export function parseSourceListQuery(search: string): SourceListQuery {
  const params = new URLSearchParams(search);
  const contentTypeRaw = params.get("contentType") ?? "all";
  const providerRaw = params.get("provider") ?? "all";
  const qualityRaw = params.get("quality") ?? "all";
  const statusRaw = params.get("status") ?? "all";
  const contentType =
    contentTypeRaw === "episode" || contentTypeRaw === "movie" ? contentTypeRaw : "all";
  const provider =
    providerRaw === "public_url" || providerRaw === "r2" || providerRaw === "rustfs" || providerRaw === "openlist"
      ? providerRaw
      : "all";
  const quality =
    qualityRaw === "1080p" || qualityRaw === "720p" || qualityRaw === "480p" || qualityRaw === "auto"
      ? qualityRaw
      : "all";
  const status = statusRaw === "enabled" || statusRaw === "disabled" ? statusRaw : "all";
  return { contentType, provider, quality, status };
}

export function filterSources<T extends {
  relatedKind: "episode" | "movie";
  provider: SourceProvider;
  quality: SourceQuality;
  enabled: boolean;
}>(items: readonly T[], query: SourceListQuery): T[] {
  return items.filter((item) => {
    if (query.contentType !== "all" && item.relatedKind !== query.contentType) return false;
    if (query.provider !== "all" && item.provider !== query.provider) return false;
    if (query.quality !== "all" && item.quality !== query.quality) return false;
    if (query.status === "enabled" && !item.enabled) return false;
    if (query.status === "disabled" && item.enabled) return false;
    return true;
  });
}

export function httpsUrlError(value: string) {
  if (!value.trim()) return "此字段为必填项";
  if (!value.trim().startsWith("https://")) return "URL 必须以 https:// 开头";
  return null;
}

export function objectPathError(value: string) {
  return value.trim() ? null : "对象路径不能为空";
}

export function resourceUrlError(value: string) {
  if (!value.trim()) return "此字段为必填项";
  return null;
}

export function validateSourceForm(values: SourceFormValues) {
  const errors: Record<string, string | null> = {
    relatedKey: requiredError(values.relatedKey),
    label: requiredError(values.label),
    url: null,
    objectPath: null,
    resourceUrl: null,
  };
  if (values.provider === "public_url") errors.url = httpsUrlError(values.url);
  if (values.provider === "r2") errors.objectPath = objectPathError(values.objectPath);
  if (values.provider === "rustfs" || values.provider === "openlist") {
    errors.resourceUrl = resourceUrlError(values.resourceUrl);
  }
  return errors;
}

export function parseSubtitleListQuery(search: string): SubtitleListQuery {
  const params = new URLSearchParams(search);
  const statusRaw = params.get("status") ?? "all";
  const status =
    statusRaw === "enabled" || statusRaw === "disabled" || statusRaw === "default" ? statusRaw : "all";
  return {
    q: (params.get("q") ?? "").trim(),
    language: (params.get("language") ?? "").trim(),
    status,
  };
}

export function filterSubtitles<T extends {
  relatedTitle: string;
  language: string;
  label: string;
  enabled: boolean;
  isDefault: boolean;
}>(items: readonly T[], query: SubtitleListQuery): T[] {
  const needle = query.q.toLocaleLowerCase("zh-CN");
  return items.filter((item) => {
    if (query.language && item.language !== query.language) return false;
    if (query.status === "enabled" && !item.enabled) return false;
    if (query.status === "disabled" && item.enabled) return false;
    if (query.status === "default" && !item.isDefault) return false;
    if (!needle) return true;
    const haystack = `${item.relatedTitle} ${item.label} ${item.language}`.toLocaleLowerCase("zh-CN");
    return haystack.includes(needle);
  });
}

export function subtitleDefaultConflictError(
  values: Pick<SubtitleFormValues, "relatedKey" | "isDefault">,
  existing: readonly { id: string; relatedKind: "episode" | "movie"; relatedId: string; isDefault: boolean }[],
  currentId?: string,
) {
  if (!values.isDefault || !values.relatedKey) return null;
  const [kind, id] = values.relatedKey.split(":");
  if ((kind !== "episode" && kind !== "movie") || !id) return null;
  const conflict = existing.find(
    (item) =>
      item.id !== currentId &&
      item.isDefault &&
      item.relatedKind === kind &&
      item.relatedId === id,
  );
  if (!conflict) return null;
  return "同一内容只能有一个默认字幕，请先取消现有默认字幕后再设置。";
}

export function validateSubtitleForm(
  values: SubtitleFormValues,
  existing: readonly { id: string; relatedKind: "episode" | "movie"; relatedId: string; isDefault: boolean }[],
  currentId?: string,
) {
  return {
    relatedKey: requiredError(values.relatedKey),
    language: requiredError(values.language),
    label: requiredError(values.label),
    file: values.fileStatus === "format-error"
      ? "字幕格式无法解析，请上传 WebVTT 文件"
      : values.fileStatus === "empty" || !values.fileName
        ? "请选择字幕文件"
        : values.fileStatus === "parsing"
          ? "字幕解析中，请稍候"
          : null,
    isDefault: subtitleDefaultConflictError(values, existing, currentId),
  };
}

export function parseDanmakuListQuery(search: string): DanmakuListQuery {
  const params = new URLSearchParams(search);
  const statusRaw = params.get("status") ?? "pending";
  const status =
    statusRaw === "approved" || statusRaw === "hidden" || statusRaw === "pending" ? statusRaw : "pending";
  return {
    status,
    q: (params.get("q") ?? "").trim(),
    related: (params.get("related") ?? "").trim(),
    submitted: (params.get("submitted") ?? "").trim(),
  };
}

export function countDanmakuByStatus<T extends { status: "pending" | "approved" | "hidden" }>(
  items: readonly T[],
) {
  return items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { pending: 0, approved: 0, hidden: 0 },
  );
}

export function filterDanmaku<T extends {
  status: "pending" | "approved" | "hidden";
  content: string;
  relatedTitle: string;
  relatedId: string;
  submittedAt: string;
}>(items: readonly T[], query: DanmakuListQuery): T[] {
  const needle = query.q.toLocaleLowerCase("zh-CN");
  return items.filter((item) => {
    if (item.status !== query.status) return false;
    if (query.related && item.relatedId !== query.related && !item.relatedTitle.includes(query.related)) {
      return false;
    }
    if (query.submitted && !item.submittedAt.startsWith(query.submitted)) return false;
    if (!needle) return true;
    return `${item.content} ${item.relatedTitle}`.toLocaleLowerCase("zh-CN").includes(needle);
  });
}

export function applyDanmakuStatus<T extends { id: string; status: "pending" | "approved" | "hidden" }>(
  items: readonly T[],
  ids: readonly string[] | ReadonlySet<string>,
  status: "approved" | "hidden",
): T[] {
  const idSet = ids instanceof Set ? ids : new Set(ids);
  return items.map((item) => (idSet.has(item.id) ? { ...item, status } : item));
}

export function deleteDanmakuByIds<T extends { id: string }>(
  items: readonly T[],
  ids: readonly string[] | ReadonlySet<string>,
): T[] {
  const idSet = ids instanceof Set ? ids : new Set(ids);
  return items.filter((item) => !idSet.has(item.id));
}

export function formatDanmakuTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseAuditListQuery(search: string): AuditListQuery {
  const params = new URLSearchParams(search);
  return {
    date: (params.get("date") ?? "").trim(),
    actionType: (params.get("actionType") ?? "").trim(),
    q: (params.get("q") ?? "").trim(),
  };
}

export function filterAuditLogs<T extends {
  at: string;
  actionType: string;
  action: string;
  target: string;
  actor: string;
}>(items: readonly T[], query: AuditListQuery): T[] {
  const needle = query.q.toLocaleLowerCase("zh-CN");
  return items.filter((item) => {
    if (query.date && !item.at.startsWith(query.date)) return false;
    if (query.actionType && item.actionType !== query.actionType) return false;
    if (!needle) return true;
    return `${item.action} ${item.target} ${item.actor}`.toLocaleLowerCase("zh-CN").includes(needle);
  });
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function enabledLabel(value: boolean) {
  return value ? "启用" : "停用";
}

export function defaultLabel(value: boolean) {
  return value ? "默认" : "非默认";
}
