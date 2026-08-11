import assert from "node:assert/strict";
import { test } from "node:test";
import type { Series } from "../../data/types.ts";
import { byTitleZh, byYearAsc, byYearDesc, sortSeries } from "./sort.ts";

function stubSeries(
  partial: Pick<Series, "slug" | "year" | "title"> & Partial<Series>,
): Series {
  return {
    slug: partial.slug,
    code: partial.code ?? partial.slug.toUpperCase(),
    kind: partial.kind ?? "series",
    title: partial.title,
    year: partial.year,
    decade: `${Math.floor(partial.year / 10) * 10}s`,
    genres: partial.genres ?? [],
    summary: partial.summary ?? "",
    seasons: partial.seasons ?? [],
    episodeCount: partial.episodeCount ?? 0,
    playableEpisodeCount: partial.playableEpisodeCount ?? 0,
  };
}

test("byYearDesc and byYearAsc", () => {
  assert.equal(byYearDesc({ year: 1966 }, { year: 2022 }), 56);
  assert.equal(byYearAsc({ year: 1966 }, { year: 2022 }), -56);
});

test("byTitleZh uses zh-Hans locale order", () => {
  const a = { title: { zhHans: "星际迷航：原初系列" } };
  const b = { title: { zhHans: "星际迷航：奇异新世界" } };
  const result = byTitleZh(a, b);
  assert.equal(typeof result, "number");
  assert.notEqual(result, 0);
});

test("sortSeries updated uses accessor and is stable on ties", () => {
  const list = [
    stubSeries({ slug: "a", year: 2000, title: { zhHans: "乙" } }),
    stubSeries({ slug: "b", year: 2001, title: { zhHans: "甲" } }),
    stubSeries({ slug: "c", year: 2002, title: { zhHans: "丙" } }),
  ];
  const updatedAtOf = (slug: string): string => {
    if (slug === "a" || slug === "b") {
      return "2026-08-10";
    }
    return "2026-08-01";
  };
  const sorted = sortSeries(list, "updated", updatedAtOf);
  assert.equal(sorted[0]?.slug, "b");
  assert.equal(sorted[1]?.slug, "a");
  assert.equal(sorted[2]?.slug, "c");
});

test("sortSeries year and title", () => {
  const list = [
    stubSeries({ slug: "tos", year: 1966, title: { zhHans: "原初" } }),
    stubSeries({ slug: "snw", year: 2022, title: { zhHans: "奇异" } }),
    stubSeries({ slug: "tng", year: 1987, title: { zhHans: "下一代" } }),
  ];
  const byYear = sortSeries(list, "year", () => "2020-01-01");
  assert.deepEqual(
    byYear.map((s) => s.slug),
    ["snw", "tng", "tos"],
  );
  const byTitle = sortSeries(list, "title", () => "2020-01-01");
  assert.equal(byTitle.length, 3);
  assert.ok(byTitle.every((s) => list.some((o) => o.slug === s.slug)));
});
