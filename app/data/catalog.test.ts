import { describe, expect, it } from "vitest";
import { defaultSeason, movies, searchCatalog, series, titleCardColor } from "./catalog";

describe("prototype catalog", () => {
  it("provides the required deterministic content baseline", () => {
    expect(series).toHaveLength(14);
    expect(movies).toHaveLength(18);
    expect(series.find((item) => item.id === "strange-new-worlds")?.episodes).toHaveLength(24);
    expect(series.some((item) => item.seasonCount > 8)).toBe(true);
  });

  it("selects the recent season for a user and first playable season for a guest", () => {
    const item = series.find((show) => show.id === "strange-new-worlds")!;
    expect(defaultSeason(item, "user")).toBe(2);
    expect(defaultSeason(item, "guest")).toBe(1);
  });

  it("searches catalog and episode titles without randomness", () => {
    expect(searchCatalog("奇异").some((item) => item.kind === "series")).toBe(true);
    expect(searchCatalog("航行日志").some((item) => item.kind === "episode")).toBe(true);
  });

  it("assigns title card colors by stable content order", () => {
    expect(titleCardColor(series[0].id)).toBe("#111111");
    expect(titleCardColor(series[1].id)).toBe("#3B82F6");
    expect(titleCardColor(`${series[1].id}-banner`)).toBe(titleCardColor(series[1].id));
    expect(titleCardColor(movies[0].id)).toBe("#FB923C");
    expect(titleCardColor(series[0].episodes[0].id)).toBe("#111111");
    expect(titleCardColor(series[0].episodes[1].id)).toBe("#3B82F6");
  });
});
