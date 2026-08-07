import { describe, expect, it } from "vitest";
import {
  formatWatchedLabel,
  groupHistoryItems,
  insertAt,
  removeById,
  toggleSelection,
} from "./account";

describe("toggleSelection", () => {
  it("adds and removes ids", () => {
    const once = toggleSelection(new Set(), "a");
    expect([...once]).toEqual(["a"]);
    const twice = toggleSelection(once, "a");
    expect([...twice]).toEqual([]);
  });
});

describe("removeById + insertAt", () => {
  it("round-trips item position", () => {
    const items = [{ id: "1" }, { id: "2" }, { id: "3" }];
    const removed = removeById(items, "2");
    expect(removed.items.map((item) => item.id)).toEqual(["1", "3"]);
    expect(removed.index).toBe(1);
    expect(removed.removed?.id).toBe("2");
    const restored = insertAt(removed.items, removed.removed!, removed.index);
    expect(restored.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });
});

describe("groupHistoryItems", () => {
  it("buckets today, yesterday, and earlier", () => {
    const now = new Date("2026-08-07T18:30:00+08:00");
    const groups = groupHistoryItems(
      [
        { id: "t", watchedAt: "2026-08-07T14:20:00+08:00" },
        { id: "y", watchedAt: "2026-08-06T22:40:00+08:00" },
        { id: "e", watchedAt: "2026-08-01T20:10:00+08:00" },
      ],
      now,
    );
    expect(groups.map((group) => group.key)).toEqual(["today", "yesterday", "earlier"]);
    expect(groups[0].label).toBe("今天");
    expect(groups[1].items[0].id).toBe("y");
    expect(groups[2].items[0].id).toBe("e");
  });
});

describe("formatWatchedLabel", () => {
  it("formats relative day labels", () => {
    const now = new Date("2026-08-07T18:30:00+08:00");
    expect(formatWatchedLabel("2026-08-07T14:20:00+08:00", now)).toMatch(/^今天 \d{2}:\d{2}$/);
    expect(formatWatchedLabel("2026-08-06T22:40:00+08:00", now)).toMatch(/^昨天 \d{2}:\d{2}$/);
    expect(formatWatchedLabel("2026-08-01T20:10:00+08:00", now)).toMatch(/^\d+月\d+日 \d{2}:\d{2}$/);
  });
});
