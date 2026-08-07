import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Form, useLocation } from "react-router";
import type { Route } from "./+types/admin-danmaku";
import { AdminShell } from "../components/admin-shell";
import {
  AdminAlert,
  AdminEmpty,
  AdminToast,
  DeleteConfirmDialog,
  StatusBadge,
} from "../components/admin-ui";
import { PrototypeHiddenFields, PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { adminDanmaku, type AdminDanmaku } from "../data/admin";
import {
  applyDanmakuStatus,
  countDanmakuByStatus,
  deleteDanmakuByIds,
  filterDanmaku,
  formatAdminDateTime,
  formatDanmakuTime,
  parseDanmakuListQuery,
} from "../lib/admin";
import { loadAdminDanmaku } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";
import { withPrototypeParams } from "../lib/prototype";

export function meta() {
  return [{ title: pageTitle("弹幕审核") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const base = loadAdminDanmaku(request);
  const url = new URL(request.url);
  return {
    ...base,
    query: parseDanmakuListQuery(url.search),
    items: adminDanmaku,
  };
}

function DanmakuPreview({ item }: { item: AdminDanmaku }) {
  return (
    <div className="admin-danmaku-preview">
      <div className="admin-danmaku-frame" aria-hidden="true">
        <span>模拟视频帧</span>
        <strong>{item.contextTitle}</strong>
      </div>
      <dl className="admin-detail-list">
        <div>
          <dt>时间点</dt>
          <dd>{formatDanmakuTime(item.timePoint)}</dd>
        </div>
        <div>
          <dt>上下文</dt>
          <dd>{item.contextTitle}</dd>
        </div>
        <div>
          <dt>关联内容</dt>
          <dd>{item.relatedTitle}</dd>
        </div>
        <div>
          <dt>提交者</dt>
          <dd>{item.author}</dd>
        </div>
        <div>
          <dt>提交时间</dt>
          <dd>{formatAdminDateTime(item.submittedAt)}</dd>
        </div>
        <div>
          <dt>内容</dt>
          <dd>{item.content}</dd>
        </div>
      </dl>
    </div>
  );
}

function DanmakuBody({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, adminState, query, items: seed, search } = loaderData;
  const location = useLocation();
  const [items, setItems] = useState<AdminDanmaku[]>(seed);
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (adminState !== "selected") return new Set();
    const pending = seed.filter((item) => item.status === "pending").slice(0, 2).map((item) => item.id);
    return new Set(pending);
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(() => (
    adminState === "delete-confirm"
      ? seed.find((item) => item.status === query.status)?.id ?? seed[0]?.id ?? null
      : null
  ));
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(() => (
    adminState === "action-error" ? "操作失败，请稍后重试" : null
  ));
  const dismissToast = useCallback(() => setToast(null), []);

  const counts = useMemo(() => countDanmakuByStatus(items), [items]);
  const list = useMemo(() => {
    if (scenario === "empty") return [];
    return filterDanmaku(items, query);
  }, [items, query, scenario]);
  const relatedOptions = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => map.set(item.relatedId, item.relatedTitle));
    return [...map.entries()];
  }, [items]);

  const active = list.find((item) => item.id === activeId) ?? list[0] ?? null;

  if (forbidden || scenario === "forbidden") {
    return <PageState state="forbidden" onClearHref="/" />;
  }

  if (scenario === "loading") {
    return (
      <AdminShell title="弹幕审核" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "弹幕审核" }]}>
        <PageSkeleton cards={6} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title="弹幕审核" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "弹幕审核" }]}>
        <PageState state="error" onClearHref={location.pathname} />
      </AdminShell>
    );
  }

  function tabHref(status: "pending" | "approved" | "hidden") {
    const params = new URLSearchParams(search);
    params.set("status", status);
    params.delete("adminState");
    return withPrototypeParams(`/admin/danmaku?${params}`, search);
  }

  function toggleSelect(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelected() {
    setSelected(new Set());
  }

  function runAction(ids: string[], action: "approve" | "hide" | "delete", message: string) {
    if (adminState === "action-error") {
      setToast("操作失败，请稍后重试");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      if (action === "delete") {
        setItems((current) => deleteDanmakuByIds(current, ids));
      } else {
        setItems((current) => applyDanmakuStatus(current, ids, action === "approve" ? "approved" : "hidden"));
      }
      setSelected((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      if (activeId && ids.includes(activeId)) setActiveId(null);
      setBusy(false);
      setDeleteId(null);
      setDrawerOpen(false);
      setToast(message);
    }, 350);
  }

  function handleConfirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setConfirming(true);
    if (adminState === "action-error") {
      setConfirming(false);
      setToast("操作失败，请稍后重试");
      return;
    }
    window.setTimeout(() => {
      setItems((current) => deleteDanmakuByIds(current, [id]));
      setSelected((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      if (activeId === id) setActiveId(null);
      setConfirming(false);
      setDeleteId(null);
      setDrawerOpen(false);
      setToast("已删除弹幕");
    }, 350);
  }

  function openItem(item: AdminDanmaku) {
    setActiveId(item.id);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1279px)").matches) {
      setDrawerOpen(true);
    }
  }

  return (
    <AdminShell title="弹幕审核" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "弹幕审核" }]}>
      <section className="admin-summary-grid admin-danmaku-stats" aria-label="弹幕数量">
        <div className="admin-summary-card static">
          <span className="admin-summary-label">待审核</span>
          <strong className="admin-summary-value">{counts.pending}</strong>
        </div>
        <div className="admin-summary-card static">
          <span className="admin-summary-label">已通过</span>
          <strong className="admin-summary-value">{counts.approved}</strong>
        </div>
        <div className="admin-summary-card static">
          <span className="admin-summary-label">已隐藏</span>
          <strong className="admin-summary-value">{counts.hidden}</strong>
        </div>
      </section>

      <div className="admin-tabs" role="tablist" aria-label="弹幕状态">
        <PrototypeLink className={query.status === "pending" ? "admin-tab active" : "admin-tab"} to={tabHref("pending")} role="tab" aria-selected={query.status === "pending"}>
          待审核
        </PrototypeLink>
        <PrototypeLink className={query.status === "approved" ? "admin-tab active" : "admin-tab"} to={tabHref("approved")} role="tab" aria-selected={query.status === "approved"}>
          已通过
        </PrototypeLink>
        <PrototypeLink className={query.status === "hidden" ? "admin-tab active" : "admin-tab"} to={tabHref("hidden")} role="tab" aria-selected={query.status === "hidden"}>
          已隐藏
        </PrototypeLink>
      </div>

      <div className="admin-toolbar">
        <Form className="admin-filters" method="get">
          <input type="hidden" name="status" value={query.status} />
          <label className="admin-search-field">
            <span className="sr-only">关键词</span>
            <input type="search" name="q" defaultValue={query.q} placeholder="搜索弹幕内容" aria-label="关键词" />
          </label>
          <label>
            <span className="sr-only">关联内容</span>
            <select
              name="related"
              defaultValue={query.related}
              aria-label="关联内容"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="">全部内容</option>
              {relatedOptions.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">提交时间</span>
            <input
              type="date"
              name="submitted"
              defaultValue={query.submitted}
              aria-label="提交时间"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            />
          </label>
          <PrototypeHiddenFields />
          <button className="button secondary" type="submit">筛选</button>
        </Form>
      </div>

      {adminState === "action-error" ? <AdminAlert>最近一次审核操作失败，请重试。</AdminAlert> : null}

      {list.length === 0 ? (
        <AdminEmpty title="暂无弹幕" description="当前状态下没有匹配的弹幕记录。" />
      ) : (
        <div className="admin-danmaku-layout">
          <div className="admin-table-wrap">
            <table className="admin-table admin-danmaku-table">
              <thead>
                <tr>
                  <th className="col-check">
                    <span className="sr-only">选择</span>
                  </th>
                  <th>内容</th>
                  <th className="col-low">关联内容</th>
                  <th className="col-updated">提交时间</th>
                  <th className="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => {
                  const isActive = active?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={isActive ? "is-active" : undefined}
                      onClick={() => openItem(item)}
                    >
                      <td className="col-check" data-label="选择" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          aria-label={`选择 ${item.content}`}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td data-label="内容">
                        <strong>{item.content}</strong>
                        <span className="admin-row-sub">{formatDanmakuTime(item.timePoint)} · {item.author}</span>
                      </td>
                      <td className="col-low" data-label="关联内容">{item.relatedTitle}</td>
                      <td className="col-updated" data-label="提交时间">{formatAdminDateTime(item.submittedAt)}</td>
                      <td className="col-actions" data-label="操作" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-row-actions">
                          {item.status !== "approved" ? (
                            <button
                              className="button secondary"
                              type="button"
                              disabled={busy}
                              onClick={() => runAction([item.id], "approve", "已通过")}
                            >
                              通过
                            </button>
                          ) : null}
                          {item.status !== "hidden" ? (
                            <button
                              className="button secondary"
                              type="button"
                              disabled={busy}
                              onClick={() => runAction([item.id], "hide", "已隐藏")}
                            >
                              隐藏
                            </button>
                          ) : null}
                          <button
                            className="button secondary"
                            type="button"
                            disabled={busy}
                            onClick={() => setDeleteId(item.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <aside className="admin-danmaku-side" aria-label="弹幕预览">
            {active ? (
              <>
                <div className="admin-panel-header">
                  <h2>预览</h2>
                  <StatusBadge tone={active.status === "pending" ? "warning" : active.status === "approved" ? "success" : "neutral"}>
                    {active.status === "pending" ? "待审核" : active.status === "approved" ? "已通过" : "已隐藏"}
                  </StatusBadge>
                </div>
                <DanmakuPreview item={active} />
                <div className="button-row admin-danmaku-side-actions">
                  {active.status !== "approved" ? (
                    <button className="button primary" type="button" disabled={busy} onClick={() => runAction([active.id], "approve", "已通过")}>
                      通过
                    </button>
                  ) : null}
                  {active.status !== "hidden" ? (
                    <button className="button secondary" type="button" disabled={busy} onClick={() => runAction([active.id], "hide", "已隐藏")}>
                      隐藏
                    </button>
                  ) : null}
                  <button className="button secondary" type="button" disabled={busy} onClick={() => setDeleteId(active.id)}>
                    删除
                  </button>
                </div>
              </>
            ) : (
              <AdminEmpty title="选择一条弹幕" description="在列表中点击条目以预览上下文。" />
            )}
          </aside>
        </div>
      )}

      <Dialog.Root open={drawerOpen && Boolean(active)} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop admin-drawer-backdrop" />
          <Dialog.Popup className="admin-drawer">
            <div className="sheet-header">
              <div>
                <Dialog.Title>弹幕预览</Dialog.Title>
                <Dialog.Description>{active?.relatedTitle ?? "审核详情"}</Dialog.Description>
              </div>
              <Dialog.Close className="icon-button" aria-label="关闭预览">
                <X aria-hidden="true" size={18} />
              </Dialog.Close>
            </div>
            {active ? (
              <>
                <DanmakuPreview item={active} />
                <div className="button-row admin-danmaku-side-actions">
                  {active.status !== "approved" ? (
                    <button className="button primary" type="button" disabled={busy} onClick={() => runAction([active.id], "approve", "已通过")}>
                      通过
                    </button>
                  ) : null}
                  {active.status !== "hidden" ? (
                    <button className="button secondary" type="button" disabled={busy} onClick={() => runAction([active.id], "hide", "已隐藏")}>
                      隐藏
                    </button>
                  ) : null}
                  <button className="button secondary" type="button" disabled={busy} onClick={() => setDeleteId(active.id)}>
                    删除
                  </button>
                </div>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {selected.size > 0 ? (
        <div className="bulk-action-bar" role="region" aria-label="批量操作">
          <span>已选择 {selected.size} 项</span>
          <div className="button-row">
            <button className="button secondary" type="button" onClick={clearSelected}>取消</button>
            <button
              className="button primary"
              type="button"
              disabled={busy}
              onClick={() => runAction([...selected], "approve", `已通过 ${selected.size} 条`)}
            >
              批量通过
            </button>
            <button
              className="button secondary"
              type="button"
              disabled={busy}
              onClick={() => runAction([...selected], "hide", `已隐藏 ${selected.size} 条`)}
            >
              批量隐藏
            </button>
          </div>
        </div>
      ) : null}

      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        title="删除弹幕？"
        description="删除后条目将移出列表，不可作为筛选状态查看。"
        onOpenChange={(open) => { if (!open && !confirming) setDeleteId(null); }}
        onConfirm={handleConfirmDelete}
        confirming={confirming}
      />
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={dismissToast} />
    </AdminShell>
  );
}

export default function AdminDanmaku(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.search}:${props.loaderData.adminState}`;
  return <DanmakuBody key={resetKey} {...props} />;
}
