import assert from "node:assert/strict";
import { test } from "node:test";
import { includesCode, matchesMultilingual, normalizeText } from "./text.ts";

test("normalizeText trims and case-folds", () => {
  assert.equal(normalizeText("  Hello World  "), "hello world");
  assert.equal(normalizeText("星际迷航"), "星际迷航");
});

test("matchesMultilingual zhHans", () => {
  const title = { zhHans: "星际迷航：奇异新世界", zhHant: "星際迷航：奇異新世界", en: "Strange New Worlds" };
  assert.equal(matchesMultilingual(title, "奇异"), true);
  assert.equal(matchesMultilingual(title, "  奇异  "), true);
});

test("matchesMultilingual zhHant and en case-insensitive", () => {
  const title = { zhHans: "星际迷航：奇异新世界", zhHant: "星際迷航：奇異新世界", en: "Strange New Worlds" };
  assert.equal(matchesMultilingual(title, "奇異"), true);
  assert.equal(matchesMultilingual(title, "strange"), true);
  assert.equal(matchesMultilingual(title, "NEW WORLDS"), true);
  assert.equal(matchesMultilingual(title, "klingon"), false);
});

test("matchesMultilingual empty query matches all", () => {
  assert.equal(matchesMultilingual({ zhHans: "测试" }, "   "), true);
});

test("includesCode uppercase compare", () => {
  assert.equal(includesCode("s02e04", "S02E04"), true);
  assert.equal(includesCode("S02", "S02E04"), true);
  assert.equal(includesCode("movie", "MOVIE"), true);
  assert.equal(includesCode("S99", "S02E04"), false);
});
