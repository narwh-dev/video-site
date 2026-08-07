import { redirect } from "react-router";
import type { Route } from "./+types/admin-catalog-index";
import { preservePrototypeParams } from "../lib/prototype";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const target = new URL("/admin/catalog/series", url.origin);
  preservePrototypeParams(url.searchParams, target.searchParams);
  for (const [key, value] of url.searchParams.entries()) {
    if (key === "persona" || key === "scenario") continue;
    if (!target.searchParams.has(key)) target.searchParams.append(key, value);
  }
  throw redirect(`${target.pathname}${target.search}`);
}

export default function AdminCatalogIndex() {
  return null;
}
