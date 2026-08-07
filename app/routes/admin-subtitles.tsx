import { useCallback, useMemo, useState } from "react";
import { Form, useLocation } from "react-router";
import type { Route } from "./+types/admin-subtitles";
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
import { adminSubtitles, type AdminSubtitle } from "../data/admin";
import {
  defaultLabel,
  enabledLabel,
  filterSubtitles,
  formatAdminDateTime,
  parseSubtitleListQuery,
  removeAdminItemById,
  resolveListAdminState,
} from "../lib/admin";
import { loadAdminBase } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";

export function meta() {
  return [{ title: pageTitle("字幕") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const base = loadAdminBase(request);
  const url = new URL(request.url);
  return {
    ...base,
    adminState: resolveListAdminState(base.scenario, url.search),
    query: parseSubtitleListQuery(url.search),
    subtitles: adminSubtitles,
  };
}

function SubtitlesBody({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, adminState, query, subtitles: seed } = loaderData;
  const location = useLocation();
  const [items, setItems] = useState<AdminSubtitle[]>(seed);
  const [deleteId, setDeleteId] = useState<string | null>(() => (
    adminState === "delete-confirm" ? seed[0]?.id ?? null : null
  ));
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(() => (
    adminState === "action-error" ? "操作失败，请稍后重试" : null
  ));
  const dismissToast = useCallback(() => setToast(null), []);

  const visible = useMemo(() => {
    const filtered = filterSubtitles(items, query);
    return [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [items, query]);

  if (forbidden || scenario === "forbidden") {
    return <PageState state="forbidden" onClearHref="/" />;
  }

  if (scenario === "loading") {
    return (
      <AdminShell title="字幕" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "字幕" }]}>
        <PageSkeleton cards={6} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title="字幕" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "字幕" }]}>
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
      setToast("已删除字幕");
    }, 350);
  }

  return (
    <AdminShell title="字幕" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "字幕" }]}>
      <div className="admin-toolbar">
        <Form className="admin-filters" method="get">
          <label className="admin-search-field">
            <span className="sr-only">搜索</span>
            <input type="search" name="q" defaultValue={query.q} placeholder="搜索内容或标签" aria-label="搜索字幕" />
          </label>
          <label>
            <span className="sr-only">语言</span>
            <select
              name="language"
              defaultValue={query.language}
              aria-label="语言"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="">全部语言</option>
              <option value="zh-Hans">简体中文</option>
              <option value="zh-Hant">繁体中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
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
              <option value="default">默认</option>
            </select>
          </label>
          <PrototypeHiddenFields />
          <button className="button secondary" type="submit">筛选</button>
        </Form>
        <PrototypeLink className="button primary" to="/admin/subtitles/new">新建字幕</PrototypeLink>
      </div>

      {adminState === "action-error" ? <AdminAlert>最近一次操作失败，可继续管理列表或重试删除。</AdminAlert> : null}

      {list.length === 0 ? (
        <AdminEmpty title="暂无字幕" description="调整筛选条件，或新建一条字幕记录。" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>关联内容</th>
                <th className="col-low">语言</th>
                <th className="col-low">显示标签</th>
                <th>默认状态</th>
                <th>启用状态</th>
                <th className="col-time">更新时间</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td data-label="关联内容"><strong>{item.relatedTitle}</strong></td>
                  <td className="col-low" data-label="语言">{item.language}</td>
                  <td className="col-low" data-label="显示标签">{item.label}</td>
                  <td data-label="默认状态">
                    <StatusBadge tone={item.isDefault ? "success" : "neutral"}>
                      {defaultLabel(item.isDefault)}
                    </StatusBadge>
                  </td>
                  <td data-label="启用状态">
                    <StatusBadge tone={item.enabled ? "success" : "neutral"}>
                      {enabledLabel(item.enabled)}
                    </StatusBadge>
                  </td>
                  <td className="col-time" data-label="更新时间">{formatAdminDateTime(item.updatedAt)}</td>
                  <td className="col-actions" data-label="操作">
                    <div className="admin-row-actions">
                      <PrototypeLink
                        className="button secondary admin-primary-action"
                        to={`/admin/subtitles/${item.id}/edit`}
                      >
                        编辑
                      </PrototypeLink>
                      <RowActionsMenu
                        label={`${item.relatedTitle} 字幕操作`}
                        items={[
                          { key: "edit", label: "编辑", href: `/admin/subtitles/${item.id}/edit` },
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
        title="删除字幕？"
        description={deleting ? `确认删除「${deleting.relatedTitle} / ${deleting.label}」？此操作仅在本地列表中移除。` : "确认删除该字幕？"}
        onOpenChange={(open) => { if (!open && !confirming) setDeleteId(null); }}
        onConfirm={handleConfirmDelete}
        confirming={confirming}
      />
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={dismissToast} />
    </AdminShell>
  );
}

export default function AdminSubtitles(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.search}:${props.loaderData.adminState}`;
  return <SubtitlesBody key={resetKey} {...props} />;
}
