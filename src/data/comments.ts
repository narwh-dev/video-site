import { TODAY } from "./content.ts";
import type { CommentItem, CommentKey } from "./types.ts";

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

const AVATARS = {
  member: "/assets/avatars/u-member.svg",
  a: "/assets/avatars/u-a.svg",
  b: "/assets/avatars/u-b.svg",
  c: "/assets/avatars/u-c.svg",
} as const;

export const COMMENTS: Record<CommentKey, CommentItem[]> = {
  "snw:S02E04": [
    {
      id: "c-snw-1",
      author: { name: "林舟", avatar: AVATARS.member },
      createdAt: daysBefore(TODAY, 1),
      content: "派克舰长这一集的决策真的很克制，节奏也比前几集更紧。",
      likes: 12,
      likedByMe: true,
      replies: [
        {
          id: "c-snw-1-r1",
          author: { name: "王珊", avatar: AVATARS.a },
          createdAt: daysBefore(TODAY, 1),
          content: "同感，尤其是舰桥那段对白。",
          likes: 3,
          likedByMe: false,
        },
        {
          id: "c-snw-1-r2",
          author: { name: "陈观星", avatar: AVATARS.b },
          createdAt: daysBefore(TODAY, 0),
          content: "史波克的反应也写得很细。",
          likes: 1,
          likedByMe: false,
        },
      ],
    },
    {
      id: "c-snw-2",
      author: { name: "王珊", avatar: AVATARS.a },
      createdAt: daysBefore(TODAY, 2),
      content: "字幕时间轴偶尔会跳半秒，不过不影响观感（演示反馈）。",
      likes: 4,
      likedByMe: false,
      replies: [],
    },
    {
      id: "c-snw-3",
      author: { name: "陈观星", avatar: AVATARS.b },
      createdAt: daysBefore(TODAY, 3),
      content: "原声配乐在曲速跃迁时特别有存在感。",
      likes: 7,
      likedByMe: false,
      replies: [],
    },
    {
      id: "c-snw-4",
      author: { name: "赵拾光", avatar: AVATARS.c },
      createdAt: daysBefore(TODAY, 4),
      content: "希望下一集能多给大副一些戏份。",
      likes: 2,
      likedByMe: false,
      replies: [],
    },
  ],
  "st09:MOVIE": [
    {
      id: "c-st09-1",
      author: { name: "林舟", avatar: AVATARS.member },
      createdAt: daysBefore(TODAY, 2),
      content: "开尔文时间线的开场仍然震撼，每次重看都有新细节。",
      likes: 18,
      likedByMe: false,
      replies: [
        {
          id: "c-st09-1-r1",
          author: { name: "王珊", avatar: AVATARS.a },
          createdAt: daysBefore(TODAY, 1),
          content: "同意，尤其是柯克与史波克第一次对峙。",
          likes: 5,
          likedByMe: true,
        },
      ],
    },
    {
      id: "c-st09-2",
      author: { name: "赵拾光", avatar: AVATARS.c },
      createdAt: daysBefore(TODAY, 5),
      content: "IMAX 构图在档案里也能感受到气势。",
      likes: 6,
      likedByMe: false,
      replies: [],
    },
    {
      id: "c-st09-3",
      author: { name: "陈观星", avatar: AVATARS.b },
      createdAt: daysBefore(TODAY, 6),
      content: "弹幕密度适中，比院线重映那次清爽多了。",
      likes: 3,
      likedByMe: false,
      replies: [],
    },
  ],
  "tos:S01E03": [
    {
      id: "c-tos-1",
      author: { name: "王珊", avatar: AVATARS.a },
      createdAt: daysBefore(TODAY, 7),
      content: "经典一集。黑白胶片感的修复版字幕很干净。",
      likes: 9,
      likedByMe: false,
      replies: [],
    },
    {
      id: "c-tos-2",
      author: { name: "林舟", avatar: AVATARS.member },
      createdAt: daysBefore(TODAY, 8),
      content: "已看完，进度同步正常（演示）。",
      likes: 1,
      likedByMe: false,
      replies: [],
    },
  ],
};
