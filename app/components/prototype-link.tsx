import type { ComponentProps } from "react";
import { Link, useLocation } from "react-router";
import { withPrototypeParams } from "../lib/prototype";

type PrototypeLinkProps = Omit<ComponentProps<typeof Link>, "to"> & {
  to: string;
  preserveScenario?: boolean;
};

export function PrototypeLink({ to, preserveScenario = true, ...props }: PrototypeLinkProps) {
  const location = useLocation();
  return <Link {...props} to={withPrototypeParams(to, location.search, { preserveScenario })} />;
}

export function PrototypeHiddenFields() {
  const location = useLocation();
  const normalized = new URL(withPrototypeParams("/", location.search), "https://prototype.local").searchParams;
  return <>{normalized.get("persona") ? <input type="hidden" name="persona" value={normalized.get("persona")!} /> : null}{normalized.get("scenario") ? <input type="hidden" name="scenario" value={normalized.get("scenario")!} /> : null}</>;
}
