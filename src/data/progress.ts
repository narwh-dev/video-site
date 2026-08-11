import { TODAY } from "./content.ts";
import type { WatchProgress } from "./types.ts";

function daysBefore(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const year = y ?? 2026;
  const month = m ?? 1;
  const day = d ?? 1;
  const totalDays = day - days;
  if (totalDays >= 1) {
    return `${year}-${String(month).padStart(2, "0")}-${String(totalDays).padStart(2, "0")}`;
  }
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrev = prevMonth === 2 ? 28 : [4, 6, 9, 11].includes(prevMonth) ? 30 : 31;
  const resolved = daysInPrev + totalDays;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(resolved).padStart(2, "0")}`;
}

export const PROGRESS: WatchProgress[] = [
  {
    slug: "snw",
    episodeCode: "S02E04",
    positionSec: 1334,
    durationSec: 3180,
    updatedAt: TODAY,
    completed: false,
  },
  {
    slug: "tos",
    episodeCode: "S01E03",
    positionSec: 3000,
    durationSec: 3000,
    updatedAt: daysBefore(TODAY, 5),
    completed: true,
  },
  {
    slug: "ds9",
    episodeCode: "S03E02",
    positionSec: 324,
    durationSec: 2700,
    updatedAt: daysBefore(TODAY, 1),
    completed: false,
  },
  {
    slug: "st09",
    episodeCode: "MOVIE",
    positionSec: 5947,
    durationSec: 7620,
    updatedAt: TODAY,
    completed: false,
  },
  {
    slug: "tng",
    episodeCode: "S04E05",
    positionSec: 135,
    durationSec: 2700,
    updatedAt: daysBefore(TODAY, 3),
    completed: false,
  },
  {
    slug: "ld",
    episodeCode: "S01E02",
    positionSec: 990,
    durationSec: 1500,
    updatedAt: daysBefore(TODAY, 2),
    completed: false,
  },
];
