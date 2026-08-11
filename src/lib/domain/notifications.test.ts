import assert from "node:assert/strict";
import { test } from "node:test";
import type { NotificationItem } from "../../data/types.ts";
import { groupByRead, sortByCreatedDesc, unreadCount } from "./notifications.ts";

const ITEMS: NotificationItem[] = [
  {
    id: "1",
    kind: "system",
    title: "old-read",
    body: "",
    createdAt: "2026-08-01",
    read: true,
    targetPath: "/",
  },
  {
    id: "2",
    kind: "reply",
    title: "new-unread",
    body: "",
    createdAt: "2026-08-11",
    read: false,
    targetPath: "/",
  },
  {
    id: "3",
    kind: "new-episode",
    title: "mid-unread",
    body: "",
    createdAt: "2026-08-05",
    read: false,
    targetPath: "/",
  },
];

test("sortByCreatedDesc", () => {
  const sorted = sortByCreatedDesc(ITEMS);
  assert.deepEqual(
    sorted.map((n) => n.id),
    ["2", "3", "1"],
  );
});

test("groupByRead preserves created desc within groups", () => {
  const groups = groupByRead(ITEMS);
  assert.deepEqual(
    groups.unread.map((n) => n.id),
    ["2", "3"],
  );
  assert.deepEqual(
    groups.read.map((n) => n.id),
    ["1"],
  );
});

test("unreadCount", () => {
  assert.equal(unreadCount(ITEMS), 2);
  assert.equal(unreadCount([]), 0);
});
