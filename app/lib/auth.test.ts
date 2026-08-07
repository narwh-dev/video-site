import { describe, expect, it } from "vitest";
import {
  buildLoggedInHref,
  isValidEmail,
  nextAuthStateAfterSubmit,
  resolveAuthState,
  sanitizeReturnTo,
} from "./auth";

describe("resolveAuthState", () => {
  it("prioritizes non-default scenario over authState", () => {
    expect(resolveAuthState("error", "sent")).toBe("default");
    expect(resolveAuthState("loading", "invalid-email", "sent")).toBe("sent");
  });

  it("uses authState only when scenario is default", () => {
    expect(resolveAuthState("default", "cooldown")).toBe("cooldown");
    expect(resolveAuthState("default", "not-a-state")).toBe("default");
    expect(resolveAuthState("default", null)).toBe("default");
  });
});

describe("isValidEmail", () => {
  it("accepts simple valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("  a.b+tag@mail.co  ")).toBe(true);
  });

  it("rejects empty, oversized, or malformed values", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("plain")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail(`${"a".repeat(250)}@x.com`)).toBe(false);
  });
});

describe("sanitizeReturnTo", () => {
  it("keeps same-origin relative paths", () => {
    expect(sanitizeReturnTo("/favorites?persona=user")).toBe("/favorites?persona=user");
    expect(sanitizeReturnTo("%2Fhistory")).toBe("/history");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(sanitizeReturnTo("//evil.example")).toBeNull();
    expect(sanitizeReturnTo("https://evil.example")).toBeNull();
    expect(sanitizeReturnTo("/path?next=https://evil.example")).toBeNull();
    expect(sanitizeReturnTo("not-a-path")).toBeNull();
  });
});

describe("buildLoggedInHref", () => {
  it("forces persona=user and maps intent params", () => {
    expect(buildLoggedInHref("/favorites", null)).toBe("/favorites?persona=user");
    expect(buildLoggedInHref("/series/a", "favorite")).toBe("/series/a?persona=user&notice=favorited");
    expect(buildLoggedInHref("/watch/episode/1", "danmaku")).toBe("/watch/episode/1?persona=user&focus=danmaku");
  });

  it("falls back to home for unsafe returnTo", () => {
    expect(buildLoggedInHref("//evil", "favorite")).toBe("/?persona=user&notice=favorited");
  });
});

describe("nextAuthStateAfterSubmit", () => {
  it("routes valid and invalid emails", () => {
    expect(nextAuthStateAfterSubmit("ok@example.com")).toBe("submitting");
    expect(nextAuthStateAfterSubmit("bad")).toBe("invalid-email");
  });
});
