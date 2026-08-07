import { getPrototypeState, type Persona, type Scenario } from "./prototype";
import {
  parseCatalogListQuery,
  resolveFormAdminState,
  resolveListAdminState,
  type AdminState,
  type CatalogListQuery,
} from "./admin";

export type AdminLoaderBase = {
  persona: Persona;
  scenario: Scenario;
  forbidden: boolean;
  search: string;
};

export function loadAdminBase(request: Request): AdminLoaderBase {
  const state = getPrototypeState(request);
  const url = new URL(request.url);
  return {
    ...state,
    forbidden: state.persona !== "admin",
    search: url.search,
  };
}

export function loadAdminList(request: Request): AdminLoaderBase & {
  adminState: AdminState;
  query: CatalogListQuery;
} {
  const base = loadAdminBase(request);
  const url = new URL(request.url);
  return {
    ...base,
    adminState: resolveListAdminState(base.scenario, url.search),
    query: parseCatalogListQuery(url.search),
  };
}

export function loadAdminForm(request: Request): AdminLoaderBase & {
  adminState: AdminState;
} {
  const base = loadAdminBase(request);
  const url = new URL(request.url);
  return {
    ...base,
    adminState: resolveFormAdminState(base.scenario, url.search),
  };
}
