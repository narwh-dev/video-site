import type { Route } from "./+types/admin-stub";
import { AdminShell } from "../components/admin-shell";
import { AdminEmpty } from "../components/admin-ui";
import { PageSkeleton, PageState } from "../components/states";
import { loadAdminBase } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";

const titles: Record<string, string> = {
  "/admin/sources": "来源",
  "/admin/subtitles": "字幕",
  "/admin/danmaku": "弹幕审核",
  "/admin/audit": "审计日志",
};

export function meta({ location }: Route.MetaArgs) {
  return [{ title: pageTitle(titles[location.pathname] ?? "管理") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const base = loadAdminBase(request);
  const url = new URL(request.url);
  return {
    ...base,
    title: titles[url.pathname] ?? "管理",
    pathname: url.pathname,
  };
}

export default function AdminStub({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, title, pathname } = loaderData;

  if (forbidden || scenario === "forbidden") {
    return <PageState state="forbidden" onClearHref="/" />;
  }

  if (scenario === "loading") {
    return (
      <AdminShell title={title} breadcrumbs={[{ label: "管理", to: "/admin" }, { label: title }]}>
        <PageSkeleton cards={4} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title={title} breadcrumbs={[{ label: "管理", to: "/admin" }, { label: title }]}>
        <PageState state="error" onClearHref={pathname} />
      </AdminShell>
    );
  }

  return (
    <AdminShell title={title} breadcrumbs={[{ label: "管理", to: "/admin" }, { label: title }]}>
      <AdminEmpty
        title={`${title}将在 P4b 完成`}
        description="当前批次已接通管理壳层导航与权限门禁，完整列表与操作将在下一阶段实现。"
      />
    </AdminShell>
  );
}
