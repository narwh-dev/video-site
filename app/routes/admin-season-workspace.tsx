import { useCallback, useState } from "react";
import type { Route } from "./+types/admin-season-workspace";
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
  episodesForSeason,
  findAdminSeason,
  findAdminSeries,
  type AdminEpisode,
} from "../data/admin";
import {
  formatAdminDateTime,
  playableLabel,
  removeAdminItemById,
  visibilityLabel,
} from "../lib/admin";
import { loadAdminList } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";

export function meta({ loaderData }: Route.MetaArgs) {
  const label = loaderData?.season ? `第 ${loaderData.season.number} 季` : "季工作区";
  return [{ title: pageTitle(label) }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const base = loadAdminList(request);
  const seriesId = params.seriesId ?? "";
  const seasonId = params.seasonId ?? "";
  const series = findAdminSeries(seriesId) ?? null;
  const season = findAdminSeason(seriesId, seasonId) ?? null;
  return {
    ...base,
    seriesId,
    seasonId,
    series,
    season,
    episodes: series && season ? episodesForSeason(seriesId, seasonId) : [],
  };
}

function SeasonWorkspaceBody({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, adminState, series, season, episodes: episodeSeed } = loaderData;
  const [episodes, setEpisodes] = useState<AdminEpisode[]>(episodeSeed);
  const [deleteId, setDeleteId] = useState<string | null>(() => (
    adminState === "delete-confirm" ? episodeSeed[0]?.id ?? null : null
  ));
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(() => (
    adminState === "action-error" ? "操作失败，请稍后重试" : null
  ));
  const dismissToast = useCallback(() => setToast(null), []);

  if (forbidden || scenario === "forbidden") return <PageState state="forbidden" onClearHref="/" />;

  if (!series || !season) {
    return (
      <AdminShell title="季不存在" breadcrumbs={[{ label: "目录", to: "/admin/catalog/series" }]}>
        <PageState state="empty" onClearHref="/admin/catalog/series" />
      </AdminShell>
    );
  }

  const crumbs = [
    { label: "目录", to: "/admin/catalog/series" },
    { label: "系列", to: "/admin/catalog/series" },
    { label: series.title, to: `/admin/catalog/series/${series.id}` },
    { label: `第 ${season.number} 季` },
  ];

  if (scenario === "loading") {
    return (
      <AdminShell title={season.title} breadcrumbs={crumbs}>
        <PageSkeleton cards={4} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title={season.title} breadcrumbs={crumbs}>
        <PageState state="error" onClearHref={`/admin/catalog/series/${series.id}/seasons/${season.id}`} />
      </AdminShell>
    );
  }

  const visibleEpisodes = scenario === "empty" ? [] : episodes;
  const deleting = episodes.find((item) => item.id === deleteId);

  function handleConfirmDelete() {
    if (!deleteId) return;
    setConfirming(true);
    window.setTimeout(() => {
      setEpisodes((current) => removeAdminItemById(current, deleteId).items);
      setConfirming(false);
      setDeleteId(null);
      setToast("已删除单集");
    }, 350);
  }

  return (
    <AdminShell
      title={season.title}
      breadcrumbs={crumbs}
      actions={
        <div className="button-row">
          <PrototypeLink className="button secondary" to={`/admin/catalog/series/${series.id}/seasons/${season.id}/edit`}>
            编辑季
          </PrototypeLink>
          <PrototypeLink className="button primary" to={`/admin/catalog/series/${series.id}/seasons/${season.id}/episodes/new`}>
            新建单集
          </PrototypeLink>
        </div>
      }
    >
      <section className="admin-entity-summary">
        <div>
          <p className="eyebrow">SEASON</p>
          <h2>{series.title} · {season.title}</h2>
          <p className="admin-muted">{season.episodeCount} 集 · 更新于 {formatAdminDateTime(season.updatedAt)}</p>
          {season.description ? <p>{season.description}</p> : null}
        </div>
        <StatusBadge tone={season.visibility === "visible" ? "success" : "neutral"}>
          {visibilityLabel(season.visibility)}
        </StatusBadge>
      </section>

      {adminState === "action-error" ? <AdminAlert>最近一次操作失败，可继续管理单集列表。</AdminAlert> : null}

      {visibleEpisodes.length === 0 ? (
        <AdminEmpty title="暂无单集" description="为当前季新建单集，或调整场景参数。" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="num">集号</th>
                <th>标题</th>
                <th className="num">时长</th>
                <th>可播放状态</th>
                <th>展示状态</th>
                <th className="col-updated">更新时间</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleEpisodes.map((item) => (
                <tr key={item.id}>
                  <td className="num" data-label="集号">{item.number}</td>
                  <td data-label="标题"><strong>{item.title}</strong></td>
                  <td className="num" data-label="时长">{item.duration} 分</td>
                  <td data-label="可播放状态">
                    <StatusBadge tone={item.playable ? "success" : "warning"}>
                      {playableLabel(item.playable)}
                    </StatusBadge>
                  </td>
                  <td data-label="展示状态">
                    <StatusBadge tone={item.visibility === "visible" ? "success" : "neutral"}>
                      {visibilityLabel(item.visibility)}
                    </StatusBadge>
                  </td>
                  <td className="col-updated" data-label="更新时间">{formatAdminDateTime(item.updatedAt)}</td>
                  <td className="col-actions" data-label="操作">
                    <div className="admin-row-actions">
                      {item.playable ? (
                        <a className="button secondary admin-primary-action" href={`/watch/episode/${item.id}`} target="_blank" rel="noreferrer">
                          预览
                        </a>
                      ) : (
                        <button className="button secondary admin-primary-action" type="button" disabled title="不可播放单集无法预览">
                          预览
                        </button>
                      )}
                      <RowActionsMenu
                        label={`${item.title} 操作`}
                        items={[
                          {
                            key: "edit",
                            label: "编辑",
                            href: `/admin/catalog/series/${series.id}/seasons/${season.id}/episodes/${item.id}/edit`,
                          },
                          {
                            key: "preview",
                            label: item.playable ? "预览播放页" : "不可播放，无法预览",
                            href: `/watch/episode/${item.id}`,
                            external: true,
                            disabled: !item.playable,
                          },
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
        title="删除单集？"
        description={deleting ? `确认删除「${deleting.title}」？` : "确认删除该单集？"}
        onOpenChange={(open) => { if (!open && !confirming) setDeleteId(null); }}
        onConfirm={handleConfirmDelete}
        confirming={confirming}
      />
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={dismissToast} />
    </AdminShell>
  );
}

export default function AdminSeasonWorkspace(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.seriesId}:${props.loaderData.seasonId}:${props.loaderData.search}:${props.loaderData.adminState}`;
  return <SeasonWorkspaceBody key={resetKey} {...props} />;
}
