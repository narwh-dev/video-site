import { useCallback, useState } from "react";
import type { Route } from "./+types/admin-series-workspace";
import { AdminShell } from "../components/admin-shell";
import {
  AdminAlert,
  AdminEmpty,
  AdminToast,
  DeleteConfirmDialog,
  RowActionsMenu,
  StatusBadge,
} from "../components/admin-ui";
import { PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import {
  findAdminSeries,
  seasonsForSeries,
  type AdminSeason,
} from "../data/admin";
import {
  formatAdminDateTime,
  removeAdminItemById,
  visibilityLabel,
} from "../lib/admin";
import { loadAdminList } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: pageTitle(loaderData?.series?.title ? `系列 · ${loaderData.series.title}` : "系列工作区") }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const base = loadAdminList(request);
  const seriesId = params.seriesId ?? "";
  const series = findAdminSeries(seriesId) ?? null;
  return {
    ...base,
    seriesId,
    series,
    seasons: series ? seasonsForSeries(seriesId) : [],
  };
}

function SeriesWorkspaceBody({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, adminState, series, seasons: seasonSeed } = loaderData;
  const [seasons, setSeasons] = useState<AdminSeason[]>(seasonSeed);
  const [deleteId, setDeleteId] = useState<string | null>(() => (
    adminState === "delete-confirm" ? seasonSeed[0]?.id ?? null : null
  ));
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(() => (
    adminState === "action-error" ? "操作失败，请稍后重试" : null
  ));
  const dismissToast = useCallback(() => setToast(null), []);

  if (forbidden || scenario === "forbidden") return <PageState state="forbidden" onClearHref="/" />;

  if (!series) {
    return (
      <AdminShell title="系列不存在" breadcrumbs={[{ label: "目录", to: "/admin/catalog/series" }]}>
        <PageState state="empty" onClearHref="/admin/catalog/series" />
      </AdminShell>
    );
  }

  if (scenario === "loading") {
    return (
      <AdminShell title={series.title} breadcrumbs={[{ label: "目录", to: "/admin/catalog/series" }, { label: series.title }]}>
        <PageSkeleton cards={4} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title={series.title} breadcrumbs={[{ label: "目录", to: "/admin/catalog/series" }, { label: series.title }]}>
        <PageState state="error" onClearHref={`/admin/catalog/series/${series.id}`} />
      </AdminShell>
    );
  }

  const visibleSeasons = scenario === "empty" ? [] : seasons;
  const deleting = seasons.find((item) => item.id === deleteId);

  function handleConfirmDelete() {
    if (!deleteId) return;
    setConfirming(true);
    window.setTimeout(() => {
      setSeasons((current) => removeAdminItemById(current, deleteId).items);
      setConfirming(false);
      setDeleteId(null);
      setToast("已删除季");
    }, 350);
  }

  return (
    <AdminShell
      title={series.title}
      breadcrumbs={[
        { label: "目录", to: "/admin/catalog/series" },
        { label: "系列", to: "/admin/catalog/series" },
        { label: series.title },
      ]}
      actions={
        <div className="button-row">
          <PrototypeLink className="button secondary" to={`/admin/catalog/series/${series.id}/edit`}>编辑系列</PrototypeLink>
          <PrototypeLink className="button primary" to={`/admin/catalog/series/${series.id}/seasons/new`}>新建季</PrototypeLink>
        </div>
      }
    >
      <section className="admin-entity-summary">
        <div>
          <p className="eyebrow">SERIES</p>
          <h2>{series.title}</h2>
          <p className="admin-muted">
            {series.originalTitle ? `${series.originalTitle} · ` : ""}
            {series.year} · {series.seasonCount} 季 · {series.episodeCount} 集
          </p>
          {series.description ? <p>{series.description}</p> : null}
        </div>
        <StatusBadge tone={series.visibility === "visible" ? "success" : "neutral"}>
          {visibilityLabel(series.visibility)}
        </StatusBadge>
      </section>

      {adminState === "action-error" ? <AdminAlert>最近一次操作失败，可继续管理季列表。</AdminAlert> : null}

      {visibleSeasons.length === 0 ? (
        <AdminEmpty title="暂无季" description="为此系列新建一季，以便维护单集。" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="num">季号</th>
                <th>季标题</th>
                <th className="num">单集数</th>
                <th>展示状态</th>
                <th className="col-updated">更新时间</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleSeasons.map((item) => (
                <tr key={item.id}>
                  <td className="num" data-label="季号">{item.number}</td>
                  <td data-label="季标题"><strong>{item.title}</strong></td>
                  <td className="num" data-label="单集数">{item.episodeCount}</td>
                  <td data-label="展示状态">
                    <StatusBadge tone={item.visibility === "visible" ? "success" : "neutral"}>
                      {visibilityLabel(item.visibility)}
                    </StatusBadge>
                  </td>
                  <td className="col-updated" data-label="更新时间">{formatAdminDateTime(item.updatedAt)}</td>
                  <td className="col-actions" data-label="操作">
                    <div className="admin-row-actions">
                      <PrototypeLink className="button secondary admin-primary-action" to={`/admin/catalog/series/${series.id}/seasons/${item.id}`}>
                        管理单集
                      </PrototypeLink>
                      <RowActionsMenu
                        label={`${item.title} 操作`}
                        items={[
                          { key: "manage", label: "管理单集", href: `/admin/catalog/series/${series.id}/seasons/${item.id}` },
                          { key: "edit", label: "编辑", href: `/admin/catalog/series/${series.id}/seasons/${item.id}/edit` },
                          { key: "delete", label: "删除", danger: true, onSelect: () => setDeleteId(item.id) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        title="删除季？"
        description={deleting ? `确认删除「${deleting.title}」及其本地单集列表？` : "确认删除该季？"}
        onOpenChange={(open) => { if (!open && !confirming) setDeleteId(null); }}
        onConfirm={handleConfirmDelete}
        confirming={confirming}
      />
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={dismissToast} />
    </AdminShell>
  );
}

export default function AdminSeriesWorkspace(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.seriesId}:${props.loaderData.search}:${props.loaderData.adminState}`;
  return <SeriesWorkspaceBody key={resetKey} {...props} />;
}
