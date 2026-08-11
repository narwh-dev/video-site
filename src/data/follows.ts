import { TODAY } from "./content.ts";

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

export type FollowRecord = {
  slug: string;
  followedAt: string;
};

export type RecentUpdate = {
  slug: string;
  episodeCode: string;
  updatedAt: string;
};

export const FOLLOWS: FollowRecord[] = [
  { slug: "dis", followedAt: daysBefore(TODAY, 40) },
  { slug: "snw", followedAt: daysBefore(TODAY, 18) },
  { slug: "tng", followedAt: daysBefore(TODAY, 90) },
];

export const RECENT_UPDATES: RecentUpdate[] = [
  { slug: "snw", episodeCode: "S02E05", updatedAt: daysBefore(TODAY, 1) },
  { slug: "dis", episodeCode: "S05E03", updatedAt: daysBefore(TODAY, 3) },
  { slug: "snw", episodeCode: "S02E04", updatedAt: daysBefore(TODAY, 5) },
  { slug: "tng", episodeCode: "S07E02", updatedAt: daysBefore(TODAY, 7) },
  { slug: "dis", episodeCode: "S05E02", updatedAt: daysBefore(TODAY, 9) },
];
