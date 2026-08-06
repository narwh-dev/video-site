export const personas = ["guest", "user", "admin"] as const;
export const scenarios = ["default", "loading", "empty", "error", "long-copy", "image-failed"] as const;

export type Persona = (typeof personas)[number];
export type Scenario = (typeof scenarios)[number];

type PrototypeParamOptions = {
  preservePersona?: boolean;
  preserveScenario?: boolean;
};

function validParam<T extends string>(value: string | null, values: readonly T[]): T | null {
  return values.includes(value as T) ? value as T : null;
}

function firstValidParam<T extends string>(params: URLSearchParams, key: string, values: readonly T[]): T | null {
  for (const value of params.getAll(key)) {
    const valid = validParam(value, values);
    if (valid) return valid;
  }
  return null;
}

export function getPrototypeState(request: Request) {
  const url = new URL(request.url);
  return getPrototypeParams(url.search);
}

export function getPrototypeParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    persona: firstValidParam(params, "persona", personas) ?? "guest",
    scenario: firstValidParam(params, "scenario", scenarios) ?? "default",
  };
}

export function preservePrototypeParams(from: URLSearchParams, to: URLSearchParams) {
  const targetPersona = firstValidParam(to, "persona", personas);
  const targetScenario = firstValidParam(to, "scenario", scenarios);
  const persona = targetPersona ?? firstValidParam(from, "persona", personas);
  const scenario = targetScenario ?? firstValidParam(from, "scenario", scenarios);
  to.delete("persona");
  to.delete("scenario");
  if (persona) to.set("persona", persona);
  if (scenario) to.set("scenario", scenario);
  return to;
}

export function withPrototypeParams(href: string, currentSearch: string, options: PrototypeParamOptions = {}) {
  const { preservePersona = true, preserveScenario = true } = options;
  const current = new URLSearchParams(currentSearch);
  const target = new URL(href, "https://prototype.local");
  preservePrototypeParams(current, target.searchParams);
  if (!preservePersona) target.searchParams.delete("persona");
  if (!preserveScenario) target.searchParams.delete("scenario");
  return `${target.pathname}${target.search}${target.hash}`;
}

export function prototypeOnlyHref(pathname: string, currentSearch: string, options?: PrototypeParamOptions) {
  return withPrototypeParams(pathname, currentSearch, options);
}

export function loginHref(pathname: string, currentSearch: string, intent?: string) {
  const returnTo = withPrototypeParams(`${pathname}${currentSearch}`, currentSearch);
  const params = new URLSearchParams({ returnTo });
  if (intent) params.set("intent", intent);
  return withPrototypeParams(`/login?${params}`, currentSearch);
}

export function favoriteLoginHref(pathname: string, currentSearch: string) {
  return loginHref(pathname, currentSearch, "favorite");
}

export function logoutHref(pathname: string, currentSearch: string) {
  const target = new URL(`${pathname}${currentSearch}`, "https://prototype.local");
  target.searchParams.set("persona", "guest");
  return withPrototypeParams(`${target.pathname}${target.search}`, currentSearch, { preserveScenario: true });
}
