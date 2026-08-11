import assert from "node:assert/strict";
import { test } from "node:test";
import type { Series } from "../../data/types.ts";
import { applyCatalogQuery, decadeOfYear } from "./catalog.ts";

function stubSeries(
  partial: Pick<Series, "slug" | "year" | "kind" | "title"> & Partial<Series>,
): Series {
  const decade = `${Math.floor(partial.year / 10) * 10}s` as Series["decade"];
  return {
    slug: partial.slug,
    code: partial.code ?? partial.slug.toUpperCase(),
    kind: partial.kind,
    title: partial.title,
    year: partial.year,
    decade: partial.decade ?? decade,
    genres: [],
    summary: "",
    seasons: [],
    episodeCount: 0,
    playableEpisodeCount: 0,
  };
}

const SAMPLE: Series[] = [
  stubSeries({
    slug: "tos",
    year: 1966,
    kind: "series",
    title: { zhHans: "星际迷航：原初系列", en: "The Original Series" },
  }),
  stubSeries({
    slug: "st09",
    year: 2009,
    kind: "movie",
    title: { zhHans: "星际迷航", en: "Star Trek" },
  }),
  stubSeries({
    slug: "snw",
    year: 2022,
    kind: "series",
    title: { zhHans: "星际迷航：奇异新世界", zhHant: "星際迷航：奇異新世界", en: "Strange New Worlds" },
  }),
];

test("decadeOfYear boundary 1966 → 1960s", () => {
  assert.equal(decadeOfYear(1966), "1960s");
  assert.equal(decadeOfYear(1970), "1970s");
  assert.equal(decadeOfYear(2009), "2000s");
  assert.equal(decadeOfYear(2022), "2020s");
});

test("applyCatalogQuery filters type and decade", () => {
  const result = applyCatalogQuery(
    SAMPLE,
    { q: "", type: "series", decade: "1960s", sort: "year" },
    () => "2026-01-01",
  );
  assert.equal(result.length, 1);
  assert.equal(result[0]?.slug, "tos");
});

test("applyCatalogQuery invalid decade excluded", () => {
  const result = applyCatalogQuery(
    SAMPLE,
    { q: "", type: "all", decade: "1950s", sort: "title" },
    () => "2026-01-01",
  );
  assert.equal(result.length, 0);
});

test("applyCatalogQuery multilingual search", () => {
  const byZh = applyCatalogQuery(
    SAMPLE,
    { q: "奇异", type: "all", decade: "all", sort: "year" },
    () => "2026-01-01",
  );
  assert.equal(byZh.length, 1);
  assert.equal(byZh[0]?.slug, "snw");

  const byEn = applyCatalogQuery(
    SAMPLE,
    { q: "original", type: "all", decade: "all", sort: "year" },
    () => "2026-01-01",
  );
  assert.equal(byEn.length, 1);
  assert.equal(byEn[0]?.slug, "tos");
});

test("applyCatalogQuery sort year descending", () => {
  const result = applyCatalogQuery(
    SAMPLE,
    { q: "", type: "all", decade: "all", sort: "year" },
    () => "2026-01-01",
  );
  assert.deepEqual(
    result.map((s) => s.slug),
    ["snw", "st09", "tos"],
  );
});
