import assert from "node:assert/strict";
import { test } from "node:test";
import type { Episode, Series, WatchProgress } from "../../data/types.ts";
import { pickResumeEpisode, seasonForEpisode } from "./resume.ts";

function ep(
  code: string,
  playable: boolean,
  season: number | null = 1,
  number: number | null = 1,
): Episode {
  return {
    code,
    season,
    number,
    title: { zhHans: code },
    durationSec: 1000,
    playable,
    airDate: "2020-01-01",
    description: "",
    subtitleTracks: ["zh-Hans"],
    hasDanmaku: true,
  };
}

function seriesWith(episodes: Episode[]): Series {
  return {
    slug: "pro",
    code: "PRO",
    kind: "series",
    title: { zhHans: "神童舰队" },
    year: 2021,
    decade: "2020s",
    genres: [],
    summary: "",
    seasons: [{ number: 1, episodes }, { number: 2, episodes: [] }],
    episodeCount: episodes.length,
    playableEpisodeCount: episodes.filter((e) => e.playable).length,
  };
}

test("pickResumeEpisode latest playable progress", () => {
  const series = seriesWith([ep("S01E01", true, 1, 1), ep("S01E02", true, 1, 2)]);
  const progress: WatchProgress[] = [
    {
      slug: "pro",
      episodeCode: "S01E01",
      positionSec: 10,
      durationSec: 1000,
      updatedAt: "2026-08-01",
      completed: false,
    },
    {
      slug: "pro",
      episodeCode: "S01E02",
      positionSec: 20,
      durationSec: 1000,
      updatedAt: "2026-08-10",
      completed: false,
    },
  ];
  assert.equal(pickResumeEpisode(series, progress)?.code, "S01E02");
});

test("pickResumeEpisode falls back when progress is unplayable", () => {
  const series = seriesWith([
    ep("S02E01", false, 2, 1),
    ep("S02E02", false, 2, 2),
    ep("S01E01", true, 1, 1),
  ]);
  const progress: WatchProgress[] = [
    {
      slug: "pro",
      episodeCode: "S02E01",
      positionSec: 10,
      durationSec: 1000,
      updatedAt: "2026-08-10",
      completed: false,
    },
  ];
  assert.equal(pickResumeEpisode(series, progress)?.code, "S01E01");
});

test("pickResumeEpisode returns null when nothing playable", () => {
  const series = seriesWith([ep("S02E01", false, 2, 1), ep("S02E02", false, 2, 2)]);
  assert.equal(pickResumeEpisode(series, []), null);
});

test("seasonForEpisode finds season number", () => {
  const series: Series = {
    slug: "snw",
    code: "SNW",
    kind: "series",
    title: { zhHans: "奇异新世界" },
    year: 2022,
    decade: "2020s",
    genres: [],
    summary: "",
    seasons: [
      { number: 1, episodes: [ep("S01E01", true, 1, 1)] },
      { number: 2, episodes: [ep("S02E04", true, 2, 4)] },
    ],
    episodeCount: 2,
    playableEpisodeCount: 2,
  };
  assert.equal(seasonForEpisode(series, "S02E04"), 2);
  assert.equal(seasonForEpisode(series, "S99E01"), null);
});
