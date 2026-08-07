import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/admin-source-form";
import { AdminShell } from "../components/admin-shell";
import {
  AdminAlert,
  AdminToast,
  Field,
  FieldInput,
  FieldSelect,
  UnsavedLeaveDialog,
  useLeaveGuard,
} from "../components/admin-ui";
import { PageSkeleton, PageState } from "../components/states";
import { findAdminSource, relatedContentOptions } from "../data/admin";
import {
  hasFormErrors,
  sourceProviderLabels,
  validateSourceForm,
  type SourceFormValues,
  type SourceProvider,
  type SourceQuality,
} from "../lib/admin";
import { loadAdminForm } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";
import { withPrototypeParams } from "../lib/prototype";

export function meta({ location }: Route.MetaArgs) {
  const mode = location.pathname.endsWith("/new") ? "新建" : "编辑";
  return [{ title: pageTitle(`${mode}来源`) }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const base = loadAdminForm(request);
  const url = new URL(request.url);
  const mode = url.pathname.endsWith("/new") ? "new" as const : "edit" as const;
  const sourceId = params.sourceId ?? "";
  const source = sourceId ? findAdminSource(sourceId) ?? null : null;
  return {
    ...base,
    mode,
    sourceId,
    source,
    options: relatedContentOptions(),
  };
}

function defaultValues(source: ReturnType<typeof findAdminSource> | null): SourceFormValues {
  return {
    relatedKey: source ? `${source.relatedKind}:${source.relatedId}` : "",
    provider: source?.provider ?? "public_url",
    label: source?.label ?? "",
    quality: source?.quality ?? "1080p",
    enabled: source?.enabled ?? true,
    url: source?.url ?? "",
    objectPath: source?.objectPath ?? "",
    resourceUrl: source?.resourceUrl ?? "",
  };
}

function SourceFormBody({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, adminState, mode, source, options } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const focusedRef = useRef(false);
  const [values, setValues] = useState(() => defaultValues(source));
  const [dirty, setDirty] = useState(adminState === "dirty");
  const [submitting, setSubmitting] = useState(adminState === "submitting");
  const [toast, setToast] = useState<string | null>(adminState === "action-error" ? "保存失败，请重试" : null);
  const [errors, setErrors] = useState<Record<string, string | null>>(() => (
    adminState === "validation-error"
      ? validateSourceForm({ ...defaultValues(source), relatedKey: "", label: "", url: "http://bad.example.com" })
      : {}
  ));
  const leaveGuard = useLeaveGuard(dirty && !submitting);

  useEffect(() => {
    if (!hasFormErrors(errors) || !formRef.current || focusedRef.current) return;
    const invalid = formRef.current.querySelector<HTMLElement>("[aria-invalid='true']");
    invalid?.focus();
    focusedRef.current = true;
  }, [errors]);

  if (forbidden || scenario === "forbidden") return <PageState state="forbidden" onClearHref="/" />;
  if (mode === "edit" && !source) return <PageState state="empty" onClearHref="/admin/sources" />;

  const title = mode === "new" ? "新建来源" : "编辑来源";
  const breadcrumbs = [
    { label: "管理", to: "/admin" },
    { label: "来源", to: "/admin/sources" },
    { label: title },
  ];

  if (scenario === "loading") {
    return (
      <AdminShell title={title} breadcrumbs={breadcrumbs}>
        <PageSkeleton cards={3} />
      </AdminShell>
    );
  }

  if (scenario === "error") {
    return (
      <AdminShell title={title} breadcrumbs={breadcrumbs}>
        <PageState state="error" onClearHref={location.pathname} />
      </AdminShell>
    );
  }

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  function patch(next: Partial<SourceFormValues>) {
    markDirty();
    setValues((current) => ({ ...current, ...next }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateSourceForm(values);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;
    if (adminState === "action-error") {
      setToast("保存失败，请重试");
      return;
    }
    setSubmitting(true);
    setDirty(false);
    window.setTimeout(() => {
      navigate(withPrototypeParams("/admin/sources", location.search));
    }, 450);
  }

  const disabled = submitting;

  return (
    <AdminShell title={title} breadcrumbs={breadcrumbs}>
      {adminState === "action-error" ? <AdminAlert>保存失败，请检查后重试。</AdminAlert> : null}
      <form className="admin-form" ref={formRef} onSubmit={handleSubmit} noValidate>
        <Field label="关联内容" htmlFor="source-related" required error={errors.relatedKey}>
          <FieldSelect
            id="source-related"
            name="relatedKey"
            value={values.relatedKey}
            disabled={disabled}
            aria-invalid={Boolean(errors.relatedKey) || undefined}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => patch({ relatedKey: event.target.value })}
          >
            <option value="">选择单集或电影</option>
            {options.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </FieldSelect>
        </Field>

        <Field label="来源类型" htmlFor="source-provider" required>
          <FieldSelect
            id="source-provider"
            name="provider"
            value={values.provider}
            disabled={disabled}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              patch({ provider: event.target.value as SourceProvider });
            }}
          >
            {(Object.keys(sourceProviderLabels) as SourceProvider[]).map((key) => (
              <option key={key} value={key}>{sourceProviderLabels[key]}</option>
            ))}
          </FieldSelect>
        </Field>

        <Field label="显示标签" htmlFor="source-label" required error={errors.label}>
          <FieldInput
            id="source-label"
            name="label"
            value={values.label}
            disabled={disabled}
            aria-invalid={Boolean(errors.label) || undefined}
            onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ label: event.target.value })}
          />
        </Field>

        <Field label="清晰度" htmlFor="source-quality" required>
          <FieldSelect
            id="source-quality"
            name="quality"
            value={values.quality}
            disabled={disabled}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              patch({ quality: event.target.value as SourceQuality });
            }}
          >
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="auto">自动</option>
          </FieldSelect>
        </Field>

        {values.provider === "public_url" ? (
          <Field label="URL" htmlFor="source-url" required error={errors.url}>
            <FieldInput
              id="source-url"
              name="url"
              value={values.url}
              disabled={disabled}
              placeholder="https://"
              aria-invalid={Boolean(errors.url) || undefined}
              onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ url: event.target.value })}
            />
          </Field>
        ) : null}

        {values.provider === "r2" ? (
          <Field label="对象路径" htmlFor="source-object-path" required error={errors.objectPath}>
            <FieldInput
              id="source-object-path"
              name="objectPath"
              value={values.objectPath}
              disabled={disabled}
              placeholder="bucket/path/to/object"
              aria-invalid={Boolean(errors.objectPath) || undefined}
              onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ objectPath: event.target.value })}
            />
          </Field>
        ) : null}

        {values.provider === "rustfs" || values.provider === "openlist" ? (
          <Field label="资源地址" htmlFor="source-resource-url" required error={errors.resourceUrl}>
            <FieldInput
              id="source-resource-url"
              name="resourceUrl"
              value={values.resourceUrl}
              disabled={disabled}
              aria-invalid={Boolean(errors.resourceUrl) || undefined}
              onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ resourceUrl: event.target.value })}
            />
          </Field>
        ) : null}

        <Field label="是否启用" htmlFor="source-enabled">
          <label className="admin-check-row">
            <input
              id="source-enabled"
              type="checkbox"
              checked={values.enabled}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ enabled: event.target.checked })}
            />
            <span>启用该来源</span>
          </label>
        </Field>

        <div className="button-row admin-form-actions">
          <button className="button secondary" type="button" disabled={disabled} onClick={() => leaveGuard.requestNavigate(withPrototypeParams("/admin/sources", location.search))}>
            取消
          </button>
          <button className="button primary" type="submit" disabled={disabled}>
            {submitting ? <Loader2 className="auth-spinner" size={16} aria-hidden="true" /> : null}
            {submitting ? "保存中…" : "保存"}
          </button>
        </div>
      </form>
      <UnsavedLeaveDialog open={leaveGuard.open} onStay={leaveGuard.stay} onLeave={leaveGuard.leave} />
      <AdminToast message={toast ?? ""} open={Boolean(toast)} onDismiss={() => setToast(null)} />
    </AdminShell>
  );
}

export default function AdminSourceForm(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.mode}:${props.loaderData.sourceId}:${props.loaderData.adminState}`;
  return <SourceFormBody key={resetKey} {...props} />;
}
