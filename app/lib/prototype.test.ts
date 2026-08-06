import { describe, expect, it } from "vitest";
import { favoriteLoginHref, loginHref, logoutHref, prototypeOnlyHref, withPrototypeParams } from "./prototype";

describe("prototype navigation parameters", () => {
  it("preserves only valid prototype values without duplicates", () => {
    const href = withPrototypeParams("/series?persona=admin&persona=guest", "?persona=user&scenario=long-copy");
    expect(href).toBe("/series?persona=admin&scenario=long-copy");
    expect(withPrototypeParams("/movies", "?persona=invalid&scenario=unknown")).toBe("/movies");
    expect(withPrototypeParams("/search?persona=invalid&persona=guest", "?persona=user")).toBe("/search?persona=guest");
  });

  it("clears business state and scenario while retaining persona", () => {
    expect(prototypeOnlyHref("/series", "?year=2020&page=2&persona=user&scenario=empty", { preserveScenario: false }))
      .toBe("/series?persona=user");
  });

  it("encodes a complete favorite return path exactly once", () => {
    const href = favoriteLoginHref("/series/strange-new-worlds/season/2", "?persona=guest&scenario=default&tag=%E6%8E%A2%E7%B4%A2");
    const url = new URL(href, "https://prototype.local");
    const returnTo = new URL(url.searchParams.get("returnTo")!, "https://prototype.local");
    expect(returnTo.pathname).toBe("/series/strange-new-worlds/season/2");
    expect(Object.fromEntries(returnTo.searchParams)).toEqual({ tag: "探索", persona: "guest", scenario: "default" });
    expect(url.searchParams.get("intent")).toBe("favorite");
    expect(url.searchParams.getAll("persona")).toEqual(["guest"]);
  });

  it("keeps business query parameters in the general login return path", () => {
    const href = loginHref("/search", "?q=%E6%8E%A2%E7%B4%A2&type=series&persona=guest&scenario=default");
    const url = new URL(href, "https://prototype.local");
    const returnTo = new URL(url.searchParams.get("returnTo")!, "https://prototype.local");
    expect(Object.fromEntries(returnTo.searchParams)).toEqual({ q: "探索", type: "series", persona: "guest", scenario: "default" });
    expect(url.searchParams.getAll("persona")).toEqual(["guest"]);
  });

  it("switches to guest on the same path without duplicating context", () => {
    expect(logoutHref("/search", "?q=%E6%8E%A2%E7%B4%A2&type=series&persona=admin&scenario=image-failed"))
      .toBe("/search?q=%E6%8E%A2%E7%B4%A2&type=series&persona=guest&scenario=image-failed");
  });
});
