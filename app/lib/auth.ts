import type { Scenario } from "./prototype";

export const authStates = [
  "default",
  "invalid-email",
  "submitting",
  "sent",
  "send-error",
  "cooldown",
] as const;

export type AuthState = (typeof authStates)[number];
export type LoginIntent = "favorite" | "danmaku";

export function parseAuthStateParam(search: string): AuthState | null {
  const params = new URLSearchParams(search);
  for (const value of params.getAll("authState")) {
    if (authStates.includes(value as AuthState)) return value as AuthState;
  }
  return null;
}

export function resolveAuthState(
  scenario: Scenario | string,
  authStateParam: string | null | undefined,
  fallback: AuthState = "default",
): AuthState {
  if (scenario !== "default") return fallback;
  if (authStateParam && authStates.includes(authStateParam as AuthState)) {
    return authStateParam as AuthState;
  }
  return fallback;
}

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseLoginIntent(value: string | null | undefined): LoginIntent | null {
  if (value === "favorite" || value === "danmaku") return value;
  return null;
}

export function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value) return null;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  if (decoded.includes("://")) return null;
  return decoded;
}

export function buildLoggedInHref(
  returnTo: string | null | undefined,
  intent: LoginIntent | null | undefined,
): string {
  const safe = sanitizeReturnTo(returnTo) ?? "/";
  const target = new URL(safe, "https://prototype.local");
  target.searchParams.set("persona", "user");
  if (intent === "favorite") target.searchParams.set("notice", "favorited");
  if (intent === "danmaku") target.searchParams.set("focus", "danmaku");
  return `${target.pathname}${target.search}${target.hash}`;
}

export function parseLoginQuery(search: string) {
  const params = new URLSearchParams(search);
  return {
    returnTo: sanitizeReturnTo(params.get("returnTo")),
    intent: parseLoginIntent(params.get("intent")),
    authState: parseAuthStateParam(search),
  };
}

export function nextAuthStateAfterSubmit(email: string): AuthState {
  return isValidEmail(email) ? "submitting" : "invalid-email";
}
