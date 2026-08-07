import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { Form, useLocation } from "react-router";
import type { Route } from "./+types/admin-audit";
import { AdminShell } from "../components/admin-shell";
import { AdminEmpty, StatusBadge } from "../components/admin-ui";
import { PrototypeHiddenFields } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { adminAuditLogs, type AdminAudit } from "../data/admin";
import {
  filterAuditLogs,
  formatAdminDateTime,
  parseAuditListQuery,
} from "../lib/admin";
import { loadAdminBase } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";

export function meta() {
  return [{ title: pageTitle("审计日志") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const base = loadAdminBase(request);
  const url = new URL(request.url);
  return {
    ...base,
    query: parseAuditListQuery(url.search),
    logs: adminAuditLogs,
  };
}

const actionTypeLabels: Record<string, string> = {
  "catalog.update": "更新目录",
  "catalog.create": "新建目录",
  "catalog.delete": "删除目录",
  "catalog.hide": "隐藏目录",
  "source.create": "新建来源",
  "source.update": "更新来源",
  "source.disable": "禁用来源",
  "subtitle.upload": "上传字幕",
  "subtitle.update": "更新字幕",
  "danmaku.approve": "通过弹幕",
  "danmaku.hide": "隐藏弹幕",
  "danmaku.bulk_approve": "批量通过弹幕",
};

export default function AdminAudit({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, query, logs } = loaderData;
  const location = useLocation();
  const [active, setActive] = useState<AdminAudit | null>(null);

  const list = useMemo(() => {
    if (scenario === "empty") return [];
    return filterAuditLogs(logs, query);
  }, [logs, query, scenario]);

  const actionTypes = useMemo(() => {
    const set = new Set(logs.map((item) => item.actionType));
    return [...set];
  }, [logs]);

  if (forbidden || scenario === "forbidden") {
    return <PageState state="forbidden" onClearHref="/" />;
  }

  if (scenario === "loading") {
    return (
      <AdminShell title="审计日志" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "审计日志" }]}>
        <PageSkeleton cards={6} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title="审计日志" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "审计日志" }]}>
        <PageState state="error" onClearHref={location.pathname} />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="审计日志" breadcrumbs={[{ label: "管理", to: "/admin" }, { label: "审计日志" }]}>
      <div className="admin-toolbar">
        <Form className="admin-filters" method="get">
          <label>
            <span className="sr-only">日期</span>
            <input
              type="date"
              name="date"
              defaultValue={query.date}
              aria-label="日期"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            />
          </label>
          <label>
            <span className="sr-only">操作类型</span>
            <select
              name="actionType"
              defaultValue={query.actionType}
              aria-label="操作类型"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="">全部操作</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>{actionTypeLabels[type] ?? type}</option>
              ))}
            </select>
          </label>
          <label className="admin-search-field">
            <span className="sr-only">关键词</span>
            <input type="search" name="q" defaultValue={query.q} placeholder="搜索操作或对象" aria-label="关键词" />
          </label>
          <PrototypeHiddenFields />
          <button className="button secondary" type="submit">筛选</button>
        </Form>
      </div>

      {list.length === 0 ? (
        <AdminEmpty title="暂无审计记录" description="调整日期、操作类型或关键词后再试。" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>时间</th>
                <th className="col-low">操作人</th>
                <th>操作</th>
                <th className="col-low">对象</th>
                <th>结果</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr
                  key={item.id}
                  className="admin-row-clickable"
                  tabIndex={0}
                  onClick={() => setActive(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActive(item);
                    }
                  }}
                >
                  <td data-label="时间">{formatAdminDateTime(item.at)}</td>
                  <td className="col-low" data-label="操作人">{item.actor}</td>
                  <td data-label="操作"><strong>{item.action}</strong></td>
                  <td className="col-low" data-label="对象">{item.target}</td>
                  <td data-label="结果">
                    <StatusBadge tone={item.result === "success" ? "success" : "danger"}>
                      {item.result === "success" ? "成功" : "失败"}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog.Root open={Boolean(active)} onOpenChange={(open) => { if (!open) setActive(null); }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop admin-drawer-backdrop" />
          <Dialog.Popup className="admin-drawer">
            <div className="sheet-header">
              <div>
                <Dialog.Title>审计详情</Dialog.Title>
                <Dialog.Description>{active?.action ?? "结构化字段"}</Dialog.Description>
              </div>
              <Dialog.Close className="icon-button" aria-label="关闭详情">
                <X aria-hidden="true" size={18} />
              </Dialog.Close>
            </div>
            {active ? (
              <dl className="admin-detail-list">
                <div>
                  <dt>时间</dt>
                  <dd>{formatAdminDateTime(active.at)}</dd>
                </div>
                <div>
                  <dt>操作人</dt>
                  <dd>{active.actor}</dd>
                </div>
                <div>
                  <dt>操作</dt>
                  <dd>{active.action}</dd>
                </div>
                <div>
                  <dt>操作类型</dt>
                  <dd>{actionTypeLabels[active.actionType] ?? active.actionType}</dd>
                </div>
                <div>
                  <dt>对象</dt>
                  <dd>{active.target}</dd>
                </div>
                <div>
                  <dt>结果</dt>
                  <dd>{active.result === "success" ? "成功" : "失败"}</dd>
                </div>
                {Object.entries(active.details).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </AdminShell>
  );
}
