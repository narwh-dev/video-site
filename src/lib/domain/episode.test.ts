import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatClock,
  formatDurationSec,
  parseEpisodeCode,
  progressPercent,
  remainingLabel,
} from "./episode.ts";

test("parseEpisodeCode valid episode", () => {
  assert.deepEqual(parseEpisodeCode("S02E04"), {
    kind: "episode",
    season: 2,
    episode: 4,
  });
  assert.deepEqual(parseEpisodeCode("s1e3"), {
    kind: "episode",
    season: 1,
    episode: 3,
  });
});

test("parseEpisodeCode movie marker", () => {
  assert.deepEqual(parseEpisodeCode("MOVIE"), { kind: "movie" });
  assert.deepEqual(parseEpisodeCode("movie"), { kind: "movie" });
});

test("parseEpisodeCode invalid", () => {
  assert.equal(parseEpisodeCode(""), null);
  assert.equal(parseEpisodeCode("E01"), null);
  assert.equal(parseEpisodeCode("S00E01"), null);
  assert.equal(parseEpisodeCode("S01E00"), null);
  assert.equal(parseEpisodeCode("season1"), null);
});

test("formatDurationSec edge cases", () => {
  assert.equal(formatDurationSec(59), "00:59");
  assert.equal(formatDurationSec(61), "01:01");
  assert.equal(formatDurationSec(3725), "1:02:05");
  assert.equal(formatDurationSec(0), "00:00");
  assert.equal(formatDurationSec(3600), "1:00:00");
});

test("formatClock delegates to duration format", () => {
  assert.equal(formatClock(61), "01:01");
});

test("progressPercent clamps 0..100", () => {
  assert.equal(progressPercent(0, 100), 0);
  assert.equal(progressPercent(50, 100), 50);
  assert.equal(progressPercent(100, 100), 100);
  assert.equal(progressPercent(150, 100), 100);
  assert.equal(progressPercent(-10, 100), 0);
  assert.equal(progressPercent(10, 0), 0);
});

test("remainingLabel ceilings minutes", () => {
  assert.equal(remainingLabel(1), "剩余 1 分钟");
  assert.equal(remainingLabel(60), "剩余 1 分钟");
  assert.equal(remainingLabel(61), "剩余 2 分钟");
  assert.equal(remainingLabel(0), "剩余 0 分钟");
});
