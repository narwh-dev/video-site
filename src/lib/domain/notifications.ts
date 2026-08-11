import type { NotificationItem } from "../../data/types.ts";
import { byUpdatedDesc } from "./sort.ts";

export function sortByCreatedDesc(
  items: readonly NotificationItem[],
): NotificationItem[] {
  return items.slice().sort((a, b) =>
    byUpdatedDesc({ updatedAt: a.createdAt }, { updatedAt: b.createdAt }),
  );
}

export function groupByRead(items: readonly NotificationItem[]): {
  unread: NotificationItem[];
  read: NotificationItem[];
} {
  const sorted = sortByCreatedDesc(items);
  return {
    unread: sorted.filter((n) => !n.read),
    read: sorted.filter((n) => n.read),
  };
}

export function unreadCount(items: readonly NotificationItem[]): number {
  return items.reduce((count, item) => (item.read ? count : count + 1), 0);
}
