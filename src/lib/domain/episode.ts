export type ParsedEpisodeCode =
  | { kind: "episode"; season: number; episode: number }
  | { kind: "movie" };

const EPISODE_RE = /^S(\d{1,2})E(\d{1,2})$/i;

export function parseEpisodeCode(code: string): ParsedEpisodeCode | null {
  const trimmed = code.trim();
  if (trimmed.toUpperCase() === "MOVIE") {
    return { kind: "movie" };
  }
  const match = EPISODE_RE.exec(trimmed);
  if (!match) {
    return null;
  }
  const seasonRaw = match[1];
  const episodeRaw = match[2];
  if (seasonRaw === undefined || episodeRaw === undefined) {
    return null;
  }
  const season = Number(seasonRaw);
  const episode = Number(episodeRaw);
  if (!Number.isInteger(season) || !Number.isInteger(episode) || season < 1 || episode < 1) {
    return null;
  }
  return { kind: "episode", season, episode };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDurationSec(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (hours >= 1) {
    return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export function formatClock(sec: number): string {
  return formatDurationSec(sec);
}

export function progressPercent(position: number, duration: number): number {
  if (duration <= 0) {
    return 0;
  }
  const raw = (position / duration) * 100;
  if (raw < 0) {
    return 0;
  }
  if (raw > 100) {
    return 100;
  }
  return raw;
}

export function remainingLabel(sec: number): string {
  const minutes = Math.ceil(Math.max(0, sec) / 60);
  return `剩余 ${minutes} 分钟`;
}
