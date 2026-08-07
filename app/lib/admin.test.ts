import { describe, expect, it } from "vitest";
import {
  applyDanmakuStatus,
  countDanmakuByStatus,
  deleteDanmakuByIds,
  filterAndSortCatalogItems,
  httpsUrlError,
  objectPathError,
  parseAdminStateParam,
  parseCatalogListQuery,
  removeAdminItemById,
  resolveDanmakuAdminState,
  resolveFormAdminState,
  resolveListAdminState,
  subtitleDefaultConflictError,
  validateEpisodeForm,
  validateMovieForm,
  validateSeasonForm,
  validateSeriesForm,
  validateSourceForm,
  validateSubtitleForm,
} from "./admin";
import {
  adminDanmaku,
  adminMovies,
  adminSeries,
  adminSources,
  adminSubtitles,
  pendingDanmaku,
  recentActions,
} from "../data/admin";

describe("parseAdminStateParam", () => {
  it("reads first valid adminState", () => {
    expect(parseAdminStateParam("?adminState=dirty")).toBe("dirty");
    expect(parseAdminStateParam("?adminState=nope&adminState=submitting")).toBe("submitting");
    expect(parseAdminStateParam("")).toBeNull();
  });
});

describe("resolveListAdminState / resolveFormAdminState", () => {
  it("ignores adminState when scenario is not default", () => {
    expect(resolveListAdminState("loading", "?adminState=delete-confirm")).toBe("default");
    expect(resolveFormAdminState("error", "?adminState=dirty")).toBe("default");
  });

  it("accepts allowed states only", () => {
    expect(resolveListAdminState("default", "?adminState=delete-confirm")).toBe("delete-confirm");
    expect(resolveListAdminState("default", "?adminState=dirty")).toBe("default");
    expect(resolveFormAdminState("default", "?adminState=validation-error")).toBe("validation-error");
    expect(resolveFormAdminState("default", "?adminState=delete-confirm")).toBe("default");
  });
});

describe("parseCatalogListQuery", () => {
  it("normalizes q, visibility and sort", () => {
    expect(parseCatalogListQuery("?q=%20新世界%20&visibility=hidden&sort=title")).toEqual({
      q: "新世界",
      visibility: "hidden",
      sort: "title",
    });
    expect(parseCatalogListQuery("?visibility=nope&sort=nope")).toEqual({
      q: "",
      visibility: "all",
      sort: "updated",
    });
  });
});

describe("filterAndSortCatalogItems", () => {
  const sample = [
    { id: "a", title: "奇异新世界", visibility: "visible" as const, updatedAt: "2026-08-03T10:00:00+08:00", year: 2022 },
    { id: "b", title: "下一代", visibility: "hidden" as const, updatedAt: "2026-08-05T10:00:00+08:00", year: 1987 },
    { id: "c", title: "深空九号", visibility: "visible" as const, updatedAt: "2026-08-01T10:00:00+08:00", year: 1993 },
  ];

  it("filters by query and visibility", () => {
    const result = filterAndSortCatalogItems(sample, { q: "新", visibility: "visible", sort: "title" });
    expect(result.map((item) => item.id)).toEqual(["a"]);
  });

  it("sorts by updated, title and year", () => {
    expect(filterAndSortCatalogItems(sample, { q: "", visibility: "all", sort: "updated" }).map((item) => item.id)).toEqual(["b", "a", "c"]);
    expect(filterAndSortCatalogItems(sample, { q: "", visibility: "all", sort: "title" }).map((item) => item.id)).toEqual(
      [...sample].sort((a, b) => a.title.localeCompare(b.title, "zh-CN")).map((item) => item.id),
    );
    expect(filterAndSortCatalogItems(sample, { q: "", visibility: "all", sort: "year" }).map((item) => item.id)).toEqual(["a", "c", "b"]);
  });

  it("works against admin series and movies seed", () => {
    const seriesResult = filterAndSortCatalogItems(adminSeries, { q: "奇异", visibility: "all", sort: "title" });
    expect(seriesResult[0]?.id).toBe("strange-new-worlds");
    const moviesResult = filterAndSortCatalogItems(adminMovies, { q: "", visibility: "hidden", sort: "year" });
    expect(moviesResult.every((item) => item.visibility === "hidden")).toBe(true);
    expect(moviesResult.length).toBeGreaterThan(0);
  });
});

describe("removeAdminItemById", () => {
  it("removes by id and keeps order", () => {
    const result = removeAdminItemById([{ id: "1" }, { id: "2" }, { id: "3" }], "2");
    expect(result.items.map((item) => item.id)).toEqual(["1", "3"]);
    expect(result.removed?.id).toBe("2");
    expect(result.index).toBe(1);
  });
});

describe("form validators", () => {
  it("validates series/season/episode/movie required fields", () => {
    expect(validateSeriesForm({
      title: "",
      originalTitle: "",
      year: "abc",
      description: "",
      tags: "",
      visibility: "visible",
      hasPoster: false,
      hasBanner: false,
    })).toEqual({ title: "此字段为必填项", year: "请输入有效年份" });

    expect(validateSeasonForm({
      number: "0",
      title: "  ",
      description: "",
      visibility: "visible",
      hasPoster: false,
    })).toEqual({ number: "请输入有效季号", title: "此字段为必填项" });

    expect(validateEpisodeForm({
      number: "",
      title: "标题",
      originalTitle: "",
      description: "",
      duration: "-1",
      airDate: "",
      visibility: "visible",
      hasThumbnail: false,
    })).toEqual({ number: "此字段为必填项", title: null, duration: "请输入有效时长（分钟）" });

    expect(validateMovieForm({
      title: "电影",
      originalTitle: "",
      year: "1996",
      duration: "111",
      description: "",
      tags: "",
      visibility: "visible",
      hasPoster: true,
      hasBanner: true,
    })).toEqual({ title: null, year: null, duration: null });
  });
});

describe("admin seed data", () => {
  it("is deterministic with expected counts", () => {
    expect(adminSeries).toHaveLength(14);
    expect(adminMovies).toHaveLength(18);
    expect(pendingDanmaku).toHaveLength(8);
    expect(recentActions.length).toBeGreaterThanOrEqual(6);
    expect(pendingDanmaku[0]?.id).toBe("pd-1");
    expect(adminSources.length).toBeGreaterThanOrEqual(10);
    expect(new Set(adminSources.map((item) => item.provider)).size).toBe(4);
    expect(adminSubtitles.length).toBeGreaterThanOrEqual(8);
    expect(adminDanmaku).toHaveLength(18);
    expect(countDanmakuByStatus(adminDanmaku)).toEqual({ pending: 8, approved: 6, hidden: 4 });
  });
});

describe("source validators", () => {
  it("requires https prefix for public urls and object path for r2", () => {
    expect(httpsUrlError("")).toBe("此字段为必填项");
    expect(httpsUrlError("http://example.com/a.mp4")).toBe("URL 必须以 https:// 开头");
    expect(httpsUrlError("https://example.com/a.mp4")).toBeNull();
    expect(objectPathError("")).toBe("对象路径不能为空");
    expect(objectPathError("  ")).toBe("对象路径不能为空");
    expect(objectPathError("movies/a.mp4")).toBeNull();

    expect(validateSourceForm({
      relatedKey: "",
      provider: "public_url",
      label: "",
      quality: "1080p",
      enabled: true,
      url: "http://x",
      objectPath: "",
      resourceUrl: "",
    })).toEqual({
      relatedKey: "此字段为必填项",
      label: "此字段为必填项",
      url: "URL 必须以 https:// 开头",
      objectPath: null,
      resourceUrl: null,
    });

    expect(validateSourceForm({
      relatedKey: "movie:first-contact",
      provider: "r2",
      label: "主源",
      quality: "720p",
      enabled: true,
      url: "",
      objectPath: "",
      resourceUrl: "",
    }).objectPath).toBe("对象路径不能为空");
  });
});

describe("subtitle default conflict", () => {
  it("blocks a second default subtitle for the same content", () => {
    expect(subtitleDefaultConflictError(
      { relatedKey: "episode:strange-new-worlds-2-4", isDefault: true },
      adminSubtitles,
    )).toMatch(/只能有一个默认字幕/);

    expect(subtitleDefaultConflictError(
      { relatedKey: "episode:strange-new-worlds-2-4", isDefault: true },
      adminSubtitles,
      "sub-1",
    )).toBeNull();

    const errors = validateSubtitleForm(
      {
        relatedKey: "episode:strange-new-worlds-2-4",
        language: "en",
        label: "English",
        isDefault: true,
        enabled: true,
        fileName: "x.vtt",
        fileSize: 10,
        fileStatus: "success",
      },
      adminSubtitles,
    );
    expect(errors.isDefault).toMatch(/只能有一个默认字幕/);
  });
});

describe("danmaku status and bulk operations", () => {
  it("counts statuses and applies bulk approve/hide/delete", () => {
    expect(resolveDanmakuAdminState("default", "?adminState=selected")).toBe("selected");
    expect(resolveDanmakuAdminState("default", "?adminState=dirty")).toBe("default");

    const sample = [
      { id: "1", status: "pending" as const },
      { id: "2", status: "pending" as const },
      { id: "3", status: "approved" as const },
      { id: "4", status: "hidden" as const },
    ];
    expect(countDanmakuByStatus(sample)).toEqual({ pending: 2, approved: 1, hidden: 1 });

    const approved = applyDanmakuStatus(sample, ["1", "2"], "approved");
    expect(countDanmakuByStatus(approved)).toEqual({ pending: 0, approved: 3, hidden: 1 });

    const hidden = applyDanmakuStatus(sample, new Set(["1"]), "hidden");
    expect(hidden.find((item) => item.id === "1")?.status).toBe("hidden");

    expect(deleteDanmakuByIds(sample, ["1", "4"]).map((item) => item.id)).toEqual(["2", "3"]);
  });
});
