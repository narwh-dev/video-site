import { describe, expect, it } from "vitest";
import { resolvePlayerState } from "../lib/player-state";
import {
  findEpisodeContent,
  findMovieContent,
  readSessionProgress,
  writeSessionProgress,
  clearSessionProgress,
} from "../lib/watch";
import { danmakuForState } from "../data/danmaku";
import { qualityOptions, subtitleOptions } from "../data/media-fixtures";

describe("player-state resolution", () => {
  it("respects global scenario", () => {
    expect(resolvePlayerState("loading", null)).toBe("initial");
  });

  it("falls back to param or default", () => {
    expect(resolvePlayerState("default", "resume")).toBe("resume");
    expect(resolvePlayerState("default", null)).toBe("initial");
  });
});

describe("watch content resolution", () => {
  it("finds episode content", () => {
    const content = findEpisodeContent("strange-new-worlds-2-1");
    expect(content).toBeDefined();
    expect(content?.displayTitle).toContain("S02E01");
  });

  it("finds movie content", () => {
    const content = findMovieContent("motion-picture");
    expect(content).toBeDefined();
    expect(content?.displayTitle).toBe("星际旅行：无限太空");
  });
});

describe("session progress", () => {
  it("exposes session helpers", () => {
    expect(typeof readSessionProgress).toBe("function");
    expect(typeof writeSessionProgress).toBe("function");
    expect(typeof clearSessionProgress).toBe("function");
  });
});

describe("danmaku fixture", () => {
  it("generates danmaku for state", () => {
    const danmaku = danmakuForState(false);
    expect(danmaku).toHaveLength(40);
    expect(danmaku[0].text).toBe("这开场太有档案感了");
  });
});

describe("media fixtures", () => {
  it("provides valid quality and subtitle options", () => {
    expect(qualityOptions).toHaveLength(3);
    expect(subtitleOptions).toHaveLength(3);
  });
});
