import { TODAY } from "./content.ts";
import type { NotificationItem } from "./types.ts";

function daysBefore(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const year = y ?? 2026;
  const month = m ?? 1;
  const day = d ?? 1;
  let remaining = days;
  let cy = year;
  let cm = month;
  let cd = day;
  while (remaining > 0) {
    if (cd > remaining) {
      cd -= remaining;
      remaining = 0;
    } else {
      remaining -= cd;
      cm -= 1;
      if (cm < 1) {
        cm = 12;
        cy -= 1;
      }
      cd = cm === 2 ? 28 : [4, 6, 9, 11].includes(cm) ? 30 : 31;
    }
  }
  return `${cy}-${String(cm).padStart(2, "0")}-${String(cd).padStart(2, "0")}`;
}

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-001",
    kind: "new-episode",
    title: "新剧集上线",
    body: "《星际迷航：奇异新世界》S02E05 已可播放。",
    createdAt: daysBefore(TODAY, 0),
    read: false,
    targetPath: "/watch/snw/S02E05",
  },
  {
    id: "n-002",
    kind: "reply",
    title: "收到回复",
    body: "王珊 回复了你在《星际迷航》电影下的评论。",
    createdAt: daysBefore(TODAY, 1),
    read: false,
    targetPath: "/watch/st09/MOVIE",
  },
  {
    id: "n-003",
    kind: "danmaku-approved",
    title: "弹幕已通过",
    body: "你在 SNW S02E04 发送的弹幕已通过审核（演示）。",
    createdAt: daysBefore(TODAY, 2),
    read: false,
    targetPath: "/watch/snw/S02E04",
  },
  {
    id: "n-004",
    kind: "system",
    title: "档案公告",
    body: "星际档案演示站本周将维护模拟数据层，不影响浏览。",
    createdAt: daysBefore(TODAY, 4),
    read: true,
    targetPath: "/home",
  },
  {
    id: "n-005",
    kind: "new-episode",
    title: "关注更新",
    body: "《星际迷航：发现号》S05E03 已加入档案。",
    createdAt: daysBefore(TODAY, 6),
    read: true,
    targetPath: "/series/dis",
  },
  {
    id: "n-006",
    kind: "reply",
    title: "评论互动",
    body: "陈观星 点赞了你的评论。",
    createdAt: daysBefore(TODAY, 8),
    read: true,
    targetPath: "/watch/tos/S01E03",
  },
  {
    id: "n-007",
    kind: "system",
    title: "欢迎加入",
    body: "欢迎来到星际档案。可在设置中调整字幕与播放偏好。",
    createdAt: daysBefore(TODAY, 14),
    read: true,
    targetPath: "/settings/preferences",
  },
];
