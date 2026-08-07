import { useCallback, useMemo, useState } from "react";
import { Form, useLocation } from "react-router";
import type { Route } from "./+types/admin-sources";
import { AdminShell } from "../components/admin-shell";
import {
  AdminAlert,
  AdminEmpty,
  AdminToast,
  DeleteConfirmDialog,
  RowActionsMenu,
  StatusBadge,
} from "../components/admin-ui";
import { PrototypeHiddenFields, PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { adminSources, type AdminSource } from "../data/admin";
import {
  enabledLabel,
  filterSources,
  formatAdminDateTime,
  parseSourceListQuery,
  removeAdminItemById,
  resolveListAdminState,
  sourceProviderLabels,
} from "../lib/admin";
import { loadAdminBase } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";

export function meta() {
  return [{ title: pageTitle("来源") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const base = loadAdminBase(request);
  const url = new URL(request.url);
  return {
    ...base,
    adminState: resolveListAdminState(base.scenario, url.search),
    query: parseSourceListQuery(url.search),
    sources: adminSources,
  };
}

function SourcesBody({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, adminState, query, sources: seed } = loaderData;
  const location = useLocation();
  const [items, setItems] = useState<AdminSource[]>(seed);
  const [deleteId, setDeleteId] = useState<string | null>(() => (
    adminState === "delete-confirm" ? seed[0]?.id ?? null : null
  ));
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(() => (
    adminState === "action-error" ? "操作失败，请稍后重试" : null
  ));
  const dismissToast = useCallback(() => setToast(null), []);

  const visible = useMemo(() => {
    const filtered = filterSources(items, query);
    return [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [items, query]);

  if (forbidden || scenario === "forbidden") {
    return <PageState state="forbidden" onClearHref="/" />;
  }

  if (scenario === "loading") {
    return (
      <AdminShell title="来源" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "来源" }]}>
        <PageSkeleton cards={6} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title="来源" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "来源" }]}>
        <PageState state="error" onClearHref={location.pathname} />
      </AdminShell>
    );
  }

  const list = scenario === "empty" ? [] : visible;
  const deleting = items.find((item) => item.id === deleteId);

  function handleConfirmDelete() {
    if (!deleteId) return;
    setConfirming(true);
    window.setTimeout(() => {
      setItems((current) => removeAdminItemById(current, deleteId).items);
      setConfirming(false);
      setDeleteId(null);
      setToast("已删除来源");
    }, 350);
  }

  return (
    <AdminShell title="来源" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "来源" }]}>
      <div className="admin-toolbar">
        <Form className="admin-filters" method="get">
          <label>
            <span className="sr-only">内容类型</span>
            <select
              name="contentType"
              defaultValue={query.contentType}
              aria-label="内容类型"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="all">全部内容</option>
              <option value="episode">单集</option>
              <option value="movie">电影</option>
            </select>
          </label>
          <label>
            <span className="sr-only">来源类型</span>
            <select
              name="provider"
              defaultValue={query.provider}
              aria-label="来源类型"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="all">全部类型</option>
              <option value="public_url">公开链接</option>
              <option value="r2">R2 对象</option>
              <option value="rustfs">RustFS</option>
              <option value="openlist">OpenList</option>
            </select>
          </label>
          <label>
            <span className="sr-only">质量</span>
            <select
              name="quality"
              defaultValue={query.quality}
              aria-label="质量"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="all">全部质量</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="auto">自动</option>
            </select>
          </label>
          <label>
            <span className="sr-only">状态</span>
            <select
              name="status"
              defaultValue={query.status}
              aria-label="状态"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="all">全部状态</option>
              <option value="enabled">启用</option>
              <option value="disabled">停用</option>
            </select>
          </label>
          <PrototypeHiddenFields />
          <button className="button secondary" type="submit">筛选</button>
        </Form>
        <PrototypeLink className="button primary" to="/admin/sources/new">
          新建来源
        </PrototypeLink>
      </div>

      {adminState === "action-error" ? <AdminAlert>最近一次操作失败，可继续管理列表或重试删除。</AdminAlert> : null}

      {list.length === 0 ? (
        <AdminEmpty title="暂无来源" description="调整筛选条件，或新建一条播放来源。" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>关联内容</th>
                <th className="col-low">来源类型</th>
                <th className="col-low">质量标签</th>
                <th>状态</th>
                <th className="col-time">更新时间</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td data-label="关联内容">
                    <strong>{item.relatedTitle}</strong>
                    <span className="admin-row-sub">{item.label}</span>
                  </td>
                  <td className="col-low" data-label="来源类型">{sourceProviderLabels[item.provider]}</td>
                  <td className="col-low" data-label="质量标签">{item.quality}</td>
                  <td data-label="状态">
                    <StatusBadge tone={item.enabled ? "success" : "neutral"}>
                      {enabledLabel(item.enabled)}
                    </StatusBadge>
                  </td>
                  <td className="col-time" data-label="更新时间">{formatAdminDateTime(item.updatedAt)}</td>
                  <td className="col-actions" data-label="操作">
                    <div className="admin-row-actions">
                      <PrototypeLink
                        className="button secondary admin-primary-action"
                        to={`/admin/sources/${item.id}/edit`}
                      >
                        编辑
                      </PrototypeLink>
                      <RowActionsMenu
                        label={`${item.relatedTitle} 来源操作`}
                        items={[
                          { key: "edit", label: "编辑", href: `/admin/sources/${item.id}/edit` },
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
        title="删除来源？"
        description={deleting ? `确认删除「${deleting.relatedTitle} / ${deleting.label}」？此操作仅在本地列表中移除。` : "确认删除该来源？"}
        onOpenChange={(open) => { if (!open && !confirming) setDeleteId(null); }}
        onConfirm={handleConfirmDelete}
        confirming={confirming}
      />
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={dismissToast} />
    </AdminShell>
  );
}

export default function AdminSources(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.search}:${props.loaderData.adminState}`;
  return <SourcesBody key={resetKey} {...props} />;
}
