import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterByQuery,
  nextFocusIndexAfterRemoval,
  sortItems,
} from "./favorites-history.ts";

type Item = {
  title: { zhHans: string; en?: string };
  code?: string;
  addedAt: string;
  updatedAt: string;
};

const ITEMS: Item[] = [
  {
    title: { zhHans: "奇异新世界", en: "Strange New Worlds" },
    code: "S02E04",
    addedAt: "2026-08-01",
    updatedAt: "2026-08-10",
  },
  {
    title: { zhHans: "原初系列", en: "The Original Series" },
    code: "S01E03",
    addedAt: "2026-07-01",
    updatedAt: "2026-08-05",
  },
  {
    title: { zhHans: "星际迷航", en: "Star Trek" },
    code: "MOVIE",
    addedAt: "2026-08-08",
    updatedAt: "2026-08-11",
  },
];

const accessors = {
  title: (item: Item) => item.title,
  code: (item: Item) => item.code,
  addedAt: (item: Item) => item.addedAt,
  updatedAt: (item: Item) => item.updatedAt,
};

test("filterByQuery multilingual and code", () => {
  assert.equal(filterByQuery(ITEMS, "奇异", accessors).length, 1);
  assert.equal(filterByQuery(ITEMS, "original", accessors).length, 1);
  assert.equal(filterByQuery(ITEMS, "S02E04", accessors)[0]?.code, "S02E04");
  assert.equal(filterByQuery(ITEMS, "movie", accessors)[0]?.code, "MOVIE");
  assert.equal(filterByQuery(ITEMS, "  ", accessors).length, 3);
});

test("sortItems by dates and title", () => {
  const byUpdated = sortItems(ITEMS, "updatedAt-desc", accessors);
  assert.equal(byUpdated[0]?.code, "MOVIE");
  const byAdded = sortItems(ITEMS, "addedAt-asc", accessors);
  assert.equal(byAdded[0]?.code, "S01E03");
  const byTitle = sortItems(ITEMS, "title", accessors);
  assert.equal(byTitle.length, 3);
});

test("nextFocusIndexAfterRemoval edge cases", () => {
  assert.equal(nextFocusIndexAfterRemoval(0, 0), -1);
  assert.equal(nextFocusIndexAfterRemoval(1, 0), -1);
  assert.equal(nextFocusIndexAfterRemoval(3, 0), 0);
  assert.equal(nextFocusIndexAfterRemoval(3, 1), 1);
  assert.equal(nextFocusIndexAfterRemoval(3, 2), 1);
  assert.equal(nextFocusIndexAfterRemoval(2, 1), 0);
  assert.equal(nextFocusIndexAfterRemoval(3, -1), -1);
  assert.equal(nextFocusIndexAfterRemoval(3, 99), -1);
});
