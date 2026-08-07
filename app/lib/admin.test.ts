import { describe, expect, it } from "vitest";
import {
  filterAndSortCatalogItems,
  parseAdminStateParam,
  parseCatalogListQuery,
  removeAdminItemById,
  resolveFormAdminState,
  resolveListAdminState,
  validateEpisodeForm,
  validateMovieForm,
  validateSeasonForm,
  validateSeriesForm,
} from "./admin";
import { adminMovies, adminSeries, pendingDanmaku, recentActions } from "../data/admin";

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
  });
});
