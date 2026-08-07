import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useEffect, useId, useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Form, useNavigate } from "react-router";
import { PrototypeHiddenFields, PrototypeLink } from "./prototype-link";

export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  return <span className={`admin-badge tone-${tone}`}>{children}</span>;
}

export function AdminToast({
  message,
  open,
  onDismiss,
  durationMs = 3200,
}: {
  message: string;
  open: boolean;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs, onDismiss]);
  if (!open) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{message}</span>
    </div>
  );
}

export function AdminAlert({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "info";
  children: React.ReactNode;
}) {
  return <div className={`admin-alert tone-${tone}`} role="alert">{children}</div>;
}

export function DeleteConfirmDialog({
  open,
  title,
  description,
  onOpenChange,
  onConfirm,
  confirming = false,
}: {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirming?: boolean;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="dialog-backdrop" />
        <AlertDialog.Popup className="confirm-dialog">
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
          <div className="button-row">
            <AlertDialog.Close className="button secondary" disabled={confirming}>
              取消
            </AlertDialog.Close>
            <button className="button primary" type="button" disabled={confirming} onClick={onConfirm}>
              {confirming ? <Loader2 className="auth-spinner" size={16} aria-hidden="true" /> : null}
              {confirming ? "删除中…" : "确认删除"}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function UnsavedLeaveDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => { if (!next) onStay(); }}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="dialog-backdrop" />
        <AlertDialog.Popup className="confirm-dialog">
          <AlertDialog.Title>放弃未保存的更改？</AlertDialog.Title>
          <AlertDialog.Description>当前表单有未保存内容，离开后将丢失这些更改。</AlertDialog.Description>
          <div className="button-row">
            <button className="button secondary" type="button" onClick={onStay}>继续编辑</button>
            <button className="button primary" type="button" onClick={onLeave}>放弃并离开</button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function RowActionsMenu({
  label = "行操作",
  items,
}: {
  label?: string;
  items: Array<{
    key: string;
    label: string;
    onSelect?: () => void;
    href?: string;
    external?: boolean;
    disabled?: boolean;
    danger?: boolean;
  }>;
}) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger className="icon-button admin-row-menu" aria-label={label} title={label}>
        <MoreHorizontal size={18} aria-hidden="true" />
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={6} align="end">
          <BaseMenu.Popup className="user-menu">
            {items.map((item) => {
              if (item.href && item.external) {
                return (
                  <BaseMenu.Item
                    key={item.key}
                    disabled={item.disabled}
                    render={<a href={item.href} target="_blank" rel="noreferrer" />}
                  >
                    {item.label}
                  </BaseMenu.Item>
                );
              }
              if (item.href) {
                if (item.disabled) {
                  return (
                    <BaseMenu.Item key={item.key} disabled>
                      {item.label}
                    </BaseMenu.Item>
                  );
                }
                return (
                  <BaseMenu.LinkItem
                    key={item.key}
                    render={<PrototypeLink to={item.href} />}
                  >
                    {item.label}
                  </BaseMenu.LinkItem>
                );
              }
              return (
                <BaseMenu.Item
                  key={item.key}
                  disabled={item.disabled}
                  className={item.danger ? "admin-menu-danger" : undefined}
                  onClick={item.onSelect}
                >
                  {item.label}
                </BaseMenu.Item>
              );
            })}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export function CatalogTabs({ active }: { active: "series" | "movies" }) {
  return (
    <div className="admin-tabs" role="tablist" aria-label="目录类型">
      <PrototypeLink
        className={active === "series" ? "admin-tab active" : "admin-tab"}
        to="/admin/catalog/series"
        role="tab"
        aria-selected={active === "series"}
      >
        系列
      </PrototypeLink>
      <PrototypeLink
        className={active === "movies" ? "admin-tab active" : "admin-tab"}
        to="/admin/catalog/movies"
        role="tab"
        aria-selected={active === "movies"}
      >
        电影
      </PrototypeLink>
    </div>
  );
}

export function CatalogToolbar({
  query,
  newHref,
  newLabel,
  yearSortLabel = "年份",
}: {
  query: { q: string; visibility: string; sort: string };
  newHref: string;
  newLabel: string;
  yearSortLabel?: string;
}) {
  return (
    <div className="admin-toolbar">
      <Form className="admin-filters" method="get">
        <label className="admin-search-field">
          <span className="sr-only">搜索</span>
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder="搜索标题"
            aria-label="搜索标题"
          />
        </label>
        <label>
          <span className="sr-only">展示状态</span>
          <select
            name="visibility"
            defaultValue={query.visibility}
            aria-label="展示状态"
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            <option value="all">全部状态</option>
            <option value="visible">展示</option>
            <option value="hidden">隐藏</option>
          </select>
        </label>
        <label>
          <span className="sr-only">排序</span>
          <select
            name="sort"
            defaultValue={query.sort}
            aria-label="排序"
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            <option value="updated">更新时间</option>
            <option value="title">标题</option>
            <option value="year">{yearSortLabel}</option>
          </select>
        </label>
        <PrototypeHiddenFields />
        <button className="button secondary" type="submit">筛选</button>
      </Form>
      <PrototypeLink className="button primary" to={newHref}>
        {newLabel}
      </PrototypeLink>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
}) {
  const reactId = useId();
  const errorId = `${reactId}-error`;
  return (
    <div className="admin-field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? <span className="admin-required">*</span> : null}
      </label>
      {children}
      {error ? <p className="field-error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

export function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="admin-input" {...props} />;
}

export function FieldTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="admin-textarea" rows={4} {...props} />;
}

export function FieldSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="admin-select" {...props} />;
}

export function ImageField({
  label,
  hasImage,
  onChange,
  disabled,
}: {
  label: string;
  hasImage: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="admin-image-field">
      <div className="admin-image-preview" aria-hidden="true">
        {hasImage ? <span className="admin-image-filled">{label}</span> : <span>未选择</span>}
      </div>
      <div className="button-row">
        {!hasImage ? (
          <button className="button secondary" type="button" disabled={disabled} onClick={() => onChange(true)}>
            选择
          </button>
        ) : (
          <>
            <button className="button secondary" type="button" disabled={disabled} onClick={() => onChange(true)}>
              替换
            </button>
            <button className="button secondary" type="button" disabled={disabled} onClick={() => onChange(false)}>
              移除
            </button>
          </>
        )}
        <button className="button secondary" type="button" disabled={!hasImage || disabled}>
          预览
        </button>
      </div>
    </div>
  );
}

export function useLeaveGuard(enabled: boolean) {
  const navigate = useNavigate();
  const [pendingTo, setPendingTo] = useState<string | null>(null);
  const open = pendingTo != null;

  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);

  function requestNavigate(to: string) {
    if (!enabled) {
      navigate(to);
      return;
    }
    setPendingTo(to);
  }

  function stay() {
    setPendingTo(null);
  }

  function leave() {
    if (!pendingTo) return;
    const target = pendingTo;
    setPendingTo(null);
    navigate(target);
  }

  return { open, requestNavigate, stay, leave };
}

export function SummaryCard({
  label,
  value,
  to,
}: {
  label: string;
  value: number;
  to: string;
}) {
  return (
    <PrototypeLink className="admin-summary-card" to={to}>
      <span className="admin-summary-label">{label}</span>
      <strong className="admin-summary-value">{value}</strong>
    </PrototypeLink>
  );
}

export function AdminEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="admin-empty">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
