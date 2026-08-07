import type { Scenario } from "./prototype";

export const playerStates = [
  "initial",
  "buffering",
  "resume",
  "source-failed",
  "all-sources-failed",
  "no-subtitles",
  "no-danmaku",
  "ended",
] as const;

export type PlayerState = (typeof playerStates)[number];

export function resolvePlayerState(
  scenario: Scenario | string,
  playerStateParam: string | null | undefined,
  fallback: PlayerState = "initial",
): PlayerState {
  if (scenario !== "default") return fallback;
  if (playerStateParam && playerStates.includes(playerStateParam as PlayerState)) {
    return playerStateParam as PlayerState;
  }
  return fallback;
}

export function parsePlayerStateParam(search: string): PlayerState | null {
  const params = new URLSearchParams(search);
  for (const value of params.getAll("playerState")) {
    if (playerStates.includes(value as PlayerState)) return value as PlayerState;
  }
  return null;
}

export function formatResumeTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function progressToSeconds(progressPercent: number, durationMinutes: number): number {
  const durationSeconds = Math.max(1, durationMinutes * 60);
  const clamped = Math.min(100, Math.max(0, progressPercent));
  if (clamped <= 0 || clamped >= 100) return 0;
  return Math.floor((clamped / 100) * durationSeconds);
}
