import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/admin-subtitle-form";
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
import { adminSubtitles, findAdminSubtitle, relatedContentOptions } from "../data/admin";
import {
  formatFileSize,
  hasFormErrors,
  validateSubtitleForm,
  type SubtitleFormValues,
} from "../lib/admin";
import { loadAdminForm } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";
import { withPrototypeParams } from "../lib/prototype";

export function meta({ location }: Route.MetaArgs) {
  const mode = location.pathname.endsWith("/new") ? "新建" : "编辑";
  return [{ title: pageTitle(`${mode}字幕`) }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const base = loadAdminForm(request);
  const url = new URL(request.url);
  const mode = url.pathname.endsWith("/new") ? "new" as const : "edit" as const;
  const subtitleId = params.subtitleId ?? "";
  const subtitle = subtitleId ? findAdminSubtitle(subtitleId) ?? null : null;
  return {
    ...base,
    mode,
    subtitleId,
    subtitle,
    options: relatedContentOptions(),
    existing: adminSubtitles,
  };
}

function defaultValues(subtitle: ReturnType<typeof findAdminSubtitle> | null): SubtitleFormValues {
  return {
    relatedKey: subtitle ? `${subtitle.relatedKind}:${subtitle.relatedId}` : "",
    language: subtitle?.language ?? "zh-Hans",
    label: subtitle?.label ?? "",
    isDefault: subtitle?.isDefault ?? false,
    enabled: subtitle?.enabled ?? true,
    fileName: subtitle?.fileName ?? "",
    fileSize: subtitle?.fileSize ?? 0,
    fileStatus: subtitle?.fileName ? "success" : "empty",
  };
}

function SubtitleFormBody({ loaderData }: Route.ComponentProps) {
  const { scenario, forbidden, adminState, mode, subtitle, subtitleId, options, existing } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const focusedRef = useRef(false);
  const [values, setValues] = useState(() => defaultValues(subtitle));
  const [dirty, setDirty] = useState(adminState === "dirty");
  const [submitting, setSubmitting] = useState(adminState === "submitting");
  const [toast, setToast] = useState<string | null>(adminState === "action-error" ? "保存失败，请重试" : null);
  const [errors, setErrors] = useState<Record<string, string | null>>(() => {
    if (adminState !== "validation-error") return {};
    return validateSubtitleForm(
      {
        ...defaultValues(subtitle),
        relatedKey: "episode:strange-new-worlds-2-4",
        isDefault: true,
        fileName: "",
        fileStatus: "empty",
        label: "",
      },
      existing,
      subtitleId || undefined,
    );
  });
  const leaveGuard = useLeaveGuard(dirty && !submitting);

  useEffect(() => {
    if (!hasFormErrors(errors) || !formRef.current || focusedRef.current) return;
    const invalid = formRef.current.querySelector<HTMLElement>("[aria-invalid='true']");
    invalid?.focus();
    focusedRef.current = true;
  }, [errors]);

  if (forbidden || scenario === "forbidden") return <PageState state="forbidden" onClearHref="/" />;
  if (mode === "edit" && !subtitle) return <PageState state="empty" onClearHref="/admin/subtitles" />;

  const title = mode === "new" ? "新建字幕" : "编辑字幕";
  const breadcrumbs = [
    { label: "管理", to: "/admin" },
    { label: "字幕", to: "/admin/subtitles" },
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

  function patch(next: Partial<SubtitleFormValues>) {
    markDirty();
    setValues((current) => ({ ...current, ...next }));
  }

  function simulateSelect() {
    markDirty();
    setValues((current) => ({
      ...current,
      fileStatus: "parsing",
      fileName: "draft-subtitle.vtt",
      fileSize: 42_000,
    }));
    window.setTimeout(() => {
      setValues((current) => ({
        ...current,
        fileStatus: "success",
        fileName: "draft-subtitle.vtt",
        fileSize: 42_180,
      }));
    }, 700);
  }

  function simulateReplace() {
    markDirty();
    setValues((current) => ({
      ...current,
      fileStatus: "parsing",
      fileName: "replaced-subtitle.vtt",
      fileSize: 0,
    }));
    window.setTimeout(() => {
      setValues((current) => ({
        ...current,
        fileStatus: "success",
        fileName: "replaced-subtitle.vtt",
        fileSize: 51_240,
      }));
    }, 700);
  }

  function simulateFormatError() {
    markDirty();
    setValues((current) => ({
      ...current,
      fileStatus: "format-error",
      fileName: "broken.srt",
      fileSize: 1200,
    }));
  }

  function removeFile() {
    markDirty();
    setValues((current) => ({
      ...current,
      fileStatus: "empty",
      fileName: "",
      fileSize: 0,
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateSubtitleForm(values, existing, subtitleId || undefined);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;
    if (adminState === "action-error") {
      setToast("保存失败，请重试");
      return;
    }
    setSubmitting(true);
    setDirty(false);
    window.setTimeout(() => {
      navigate(withPrototypeParams("/admin/subtitles", location.search));
    }, 450);
  }

  const disabled = submitting;
  const fileMessage =
    values.fileStatus === "parsing"
      ? "解析中…"
      : values.fileStatus === "format-error"
        ? "格式错误"
        : values.fileStatus === "success"
          ? "解析成功"
          : "未选择文件";

  return (
    <AdminShell title={title} breadcrumbs={breadcrumbs}>
      {adminState === "action-error" ? <AdminAlert>保存失败，请检查后重试。</AdminAlert> : null}
      <form className="admin-form" ref={formRef} onSubmit={handleSubmit} noValidate>
        <Field label="关联内容" htmlFor="subtitle-related" required error={errors.relatedKey}>
          <FieldSelect
            id="subtitle-related"
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

        <Field label="语言" htmlFor="subtitle-language" required error={errors.language}>
          <FieldSelect
            id="subtitle-language"
            name="language"
            value={values.language}
            disabled={disabled}
            aria-invalid={Boolean(errors.language) || undefined}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => patch({ language: event.target.value })}
          >
            <option value="zh-Hans">简体中文</option>
            <option value="zh-Hant">繁体中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </FieldSelect>
        </Field>

        <Field label="显示标签" htmlFor="subtitle-label" required error={errors.label}>
          <FieldInput
            id="subtitle-label"
            name="label"
            value={values.label}
            disabled={disabled}
            aria-invalid={Boolean(errors.label) || undefined}
            onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ label: event.target.value })}
          />
        </Field>

        <Field label="字幕文件" htmlFor="subtitle-file" required error={errors.file}>
          <div className="admin-file-field" id="subtitle-file">
            <div className="admin-file-meta">
              <strong>{values.fileName || "未选择文件"}</strong>
              <span>
                {values.fileSize > 0 ? formatFileSize(values.fileSize) : "—"} · {fileMessage}
              </span>
            </div>
            <div className="button-row">
              {values.fileStatus === "empty" ? (
                <button className="button secondary" type="button" disabled={disabled} onClick={simulateSelect}>
                  选择
                </button>
              ) : (
                <>
                  <button className="button secondary" type="button" disabled={disabled || values.fileStatus === "parsing"} onClick={simulateReplace}>
                    替换
                  </button>
                  <button className="button secondary" type="button" disabled={disabled || values.fileStatus === "parsing"} onClick={removeFile}>
                    移除
                  </button>
                </>
              )}
              <button className="button secondary" type="button" disabled={disabled} onClick={simulateFormatError}>
                模拟格式错误
              </button>
            </div>
          </div>
        </Field>

        <Field label="设为默认" htmlFor="subtitle-default" error={errors.isDefault}>
          <label className="admin-check-row">
            <input
              id="subtitle-default"
              type="checkbox"
              checked={values.isDefault}
              disabled={disabled}
              aria-invalid={Boolean(errors.isDefault) || undefined}
              onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ isDefault: event.target.checked })}
            />
            <span>设为该内容的默认字幕</span>
          </label>
        </Field>

        <Field label="是否启用" htmlFor="subtitle-enabled">
          <label className="admin-check-row">
            <input
              id="subtitle-enabled"
              type="checkbox"
              checked={values.enabled}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) => patch({ enabled: event.target.checked })}
            />
            <span>启用该字幕</span>
          </label>
        </Field>

        <div className="button-row admin-form-actions">
          <button
            className="button secondary"
            type="button"
            disabled={disabled}
            onClick={() => leaveGuard.requestNavigate(withPrototypeParams("/admin/subtitles", location.search))}
          >
            取消
          </button>
          <button className="button primary" type="submit" disabled={disabled || values.fileStatus === "parsing"}>
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

export default function AdminSubtitleForm(props: Route.ComponentProps) {
  const resetKey = `${props.loaderData.mode}:${props.loaderData.subtitleId}:${props.loaderData.adminState}`;
  return <SubtitleFormBody key={resetKey} {...props} />;
}
