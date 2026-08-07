import type { Route } from "./+types/admin-dashboard";
import { AdminShell } from "../components/admin-shell";
import { AdminEmpty, AdminToast, StatusBadge, SummaryCard } from "../components/admin-ui";
import { PageSkeleton, PageState } from "../components/states";
import { PrototypeLink } from "../components/prototype-link";
import {
  dashboardSummary,
  pendingDanmaku,
  recentActions,
} from "../data/admin";
import { formatAdminDateTime } from "../lib/admin";
import { loadAdminBase } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";
import { useCallback, useState } from "react";

export function meta() {
  return [{ title: pageTitle("管理仪表盘") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const base = loadAdminBase(request);
  const summary = dashboardSummary();
  return {
    ...base,
    summary,
    pending: pendingDanmaku,
    actions: recentActions,
  };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, summary, pending, actions } = loaderData;
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  if (forbidden || scenario === "forbidden") {
    return <PageState state="forbidden" onClearHref="/" />;
  }

  if (scenario === "loading") {
    return (
      <AdminShell title="仪表盘">
        <PageSkeleton cards={4} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title="仪表盘">
        <PageState state="error" onClearHref="/admin" />
      </AdminShell>
    );
  }

  const empty = scenario === "empty";
  const counts = empty
    ? { seriesCount: 0, movieCount: 0, sourceCount: 0, pendingDanmakuCount: 0 }
    : summary;
  const pendingItems = empty ? [] : pending;
  const actionItems = empty ? [] : actions;

  return (
    <AdminShell title="仪表盘" breadcrumbs={[{ label: "管理" }]}>
      <section className="admin-summary-grid" aria-label="摘要指标">
        <SummaryCard label="系列" value={counts.seriesCount} to="/admin/catalog/series" />
        <SummaryCard label="电影" value={counts.movieCount} to="/admin/catalog/movies" />
        <SummaryCard label="来源" value={counts.sourceCount} to="/admin/sources" />
        <SummaryCard label="待审核弹幕" value={counts.pendingDanmakuCount} to="/admin/danmaku" />
      </section>

      {empty ? (
        <AdminEmpty title="暂无管理数据" description="目录、来源与待审核内容均为空时显示此状态。" />
      ) : (
        <div className="admin-dashboard-panels">
          <section className="admin-panel">
            <div className="admin-panel-header">
              <h2>待审核弹幕</h2>
              <PrototypeLink className="button secondary" to="/admin/danmaku">查看全部</PrototypeLink>
            </div>
            <ul className="admin-simple-list">
              {pendingItems.map((item) => (
                <li key={item.id}>
                  <div className="admin-simple-copy">
                    <strong>{item.content}</strong>
                    <span>{item.relatedTitle}</span>
                    <span className="admin-muted">{formatAdminDateTime(item.submittedAt)}</span>
                  </div>
                  <PrototypeLink className="button secondary" to="/admin/danmaku">审核</PrototypeLink>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <h2>最近操作</h2>
            </div>
            <ul className="admin-simple-list">
              {actionItems.map((item) => (
                <li key={item.id}>
                  <div className="admin-simple-copy">
                    <strong>{item.action}</strong>
                    <span>{item.target}</span>
                    <span className="admin-muted">{item.actor} · {formatAdminDateTime(item.at)}</span>
                  </div>
                  <StatusBadge tone={item.result === "success" ? "success" : "danger"}>
                    {item.result === "success" ? "成功" : "失败"}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={dismissToast} />
    </AdminShell>
  );
}
