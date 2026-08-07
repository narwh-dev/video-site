import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router";
import type { Route } from "./+types/admin-catalog-list";
import { AdminShell } from "../components/admin-shell";
import {
  AdminAlert,
  AdminEmpty,
  AdminToast,
  CatalogTabs,
  CatalogToolbar,
  DeleteConfirmDialog,
  RowActionsMenu,
  StatusBadge,
} from "../components/admin-ui";
import { PageSkeleton, PageState } from "../components/states";
import { adminMovies, adminSeries, type AdminMovie, type AdminSeries } from "../data/admin";
import {
  filterAndSortCatalogItems,
  formatAdminDateTime,
  playableLabel,
  removeAdminItemById,
  visibilityLabel,
} from "../lib/admin";
import { loadAdminList } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";

export function meta({ location }: Route.MetaArgs) {
  const isMovies = location.pathname.includes("/movies");
  return [{ title: pageTitle(isMovies ? "电影目录" : "系列目录") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const kind = url.pathname.includes("/movies") ? "movies" as const : "series" as const;
  const base = loadAdminList(request);
  return {
    ...base,
    kind,
    series: adminSeries,
    movies: adminMovies,
  };
}

function CatalogListBody({ loaderData }: Route.ComponentProps) {
  const { kind, scenario, forbidden, adminState, query, series: seriesSeed, movies: moviesSeed } = loaderData;
  const location = useLocation();
  const [seriesItems, setSeriesItems] = useState<AdminSeries[]>(seriesSeed);
  const [movieItems, setMovieItems] = useState<AdminMovie[]>(moviesSeed);
  const [deleteId, setDeleteId] = useState<string | null>(() => {
    if (adminState !== "delete-confirm") return null;
    return (kind === "series" ? seriesSeed[0]?.id : moviesSeed[0]?.id) ?? null;
  });
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(() => (
    adminState === "action-error" ? "操作失败，请稍后重试" : null
  ));
  const dismissToast = useCallback(() => setToast(null), []);

  const items = useMemo(() => {
    if (kind === "series") return filterAndSortCatalogItems(seriesItems, query);
    return filterAndSortCatalogItems(movieItems, query);
  }, [kind, seriesItems, movieItems, query]);

  if (forbidden || scenario === "forbidden") {
    return <PageState state="forbidden" onClearHref="/" />;
  }

  const title = kind === "series" ? "系列" : "电影";

  if (scenario === "loading") {
    return (
      <AdminShell title={title} breadcrumbs={[{ label: "目录" }]}>
        <PageSkeleton cards={6} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title={title} breadcrumbs={[{ label: "目录" }]}>
        <PageState state="error" onClearHref={location.pathname} />
      </AdminShell>
    );
  }

  const visibleItems = scenario === "empty" ? [] : items;
  const deleting = kind === "series"
    ? seriesItems.find((item) => item.id === deleteId)
    : movieItems.find((item) => item.id === deleteId);

  function handleConfirmDelete() {
    if (!deleteId) return;
    setConfirming(true);
    window.setTimeout(() => {
      if (kind === "series") {
        setSeriesItems((current) => removeAdminItemById(current, deleteId).items);
      } else {
        setMovieItems((current) => removeAdminItemById(current, deleteId).items);
      }
      setConfirming(false);
      setDeleteId(null);
      setToast("已删除");
    }, 350);
  }

  return (
    <AdminShell title={title} breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "目录" }]}>
      <CatalogTabs active={kind === "series" ? "series" : "movies"} />
      <CatalogToolbar
        query={query}
        newHref={kind === "series" ? "/admin/catalog/series/new" : "/admin/catalog/movies/new"}
        newLabel={kind === "series" ? "新建系列" : "新建电影"}
        yearSortLabel={kind === "series" ? "首播年份" : "年份"}
      />
      {adminState === "action-error" ? <AdminAlert>最近一次操作失败，可继续管理列表或重试删除。</AdminAlert> : null}

      {visibleItems.length === 0 ? (
        <AdminEmpty title={`暂无${title}`} description="调整搜索或筛选条件，或新建一条目录记录。" />
      ) : kind === "series" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>标题</th>
                <th className="col-year num">首播年份</th>
                <th className="num">季数</th>
                <th className="num">单集数</th>
                <th>展示状态</th>
                <th className="col-updated">更新时间</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {(visibleItems as AdminSeries[]).map((item) => (
                <tr key={item.id}>
                  <td data-label="标题"><strong>{item.title}</strong></td>
                  <td className="col-year num" data-label="首播年份">{item.year}</td>
                  <td className="num" data-label="季数">{item.seasonCount}</td>
                  <td className="num" data-label="单集数">{item.episodeCount}</td>
                  <td data-label="展示状态">
                    <StatusBadge tone={item.visibility === "visible" ? "success" : "neutral"}>
                      {visibilityLabel(item.visibility)}
                    </StatusBadge>
                  </td>
                  <td className="col-updated" data-label="更新时间">{formatAdminDateTime(item.updatedAt)}</td>
                  <td className="col-actions" data-label="操作">
                    <div className="admin-row-actions">
                      <a className="button secondary admin-primary-action" href={`/series/${item.id}`} target="_blank" rel="noreferrer">预览</a>
                      <RowActionsMenu
                        label={`${item.title} 操作`}
                        items={[
                          { key: "manage", label: "管理季与单集", href: `/admin/catalog/series/${item.id}` },
                          { key: "edit", label: "编辑", href: `/admin/catalog/series/${item.id}/edit` },
                          { key: "preview", label: "预览公开页", href: `/series/${item.id}`, external: true },
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
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>标题</th>
                <th className="col-year num">年份</th>
                <th className="num">时长</th>
                <th>可播放状态</th>
                <th>展示状态</th>
                <th className="col-updated">更新时间</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {(visibleItems as AdminMovie[]).map((item) => (
                <tr key={item.id}>
                  <td data-label="标题"><strong>{item.title}</strong></td>
                  <td className="col-year num" data-label="年份">{item.year}</td>
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
                      <a className="button secondary admin-primary-action" href={`/movies/${item.id}`} target="_blank" rel="noreferrer">预览</a>
                      <RowActionsMenu
                        label={`${item.title} 操作`}
                        items={[
                          { key: "edit", label: "编辑", href: `/admin/catalog/movies/${item.id}/edit` },
                          { key: "preview", label: "预览公开页", href: `/movies/${item.id}`, external: true },
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
        title={`删除${title}？`}
        description={deleting ? `确认删除「${deleting.title}」？此操作仅在本地列表中移除。` : "确认删除该条目？"}
        onOpenChange={(open) => { if (!open && !confirming) setDeleteId(null); }}
        onConfirm={handleConfirmDelete}
        confirming={confirming}
      />
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={dismissToast} />
    </AdminShell>
  );
}

export default function AdminCatalogList(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.kind}:${props.loaderData.search}:${props.loaderData.adminState}`;
  return <CatalogListBody key={resetKey} {...props} />;
}
