import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/admin-catalog-form";
import { AdminShell, type AdminCrumb } from "../components/admin-shell";
import {
  AdminAlert,
  AdminToast,
  Field,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  ImageField,
  UnsavedLeaveDialog,
  useLeaveGuard,
} from "../components/admin-ui";
import { PageSkeleton, PageState } from "../components/states";
import {
  findAdminEpisode,
  findAdminMovie,
  findAdminSeason,
  findAdminSeries,
} from "../data/admin";
import {
  hasFormErrors,
  validateEpisodeForm,
  validateMovieForm,
  validateSeasonForm,
  validateSeriesForm,
  type AdminState,
  type EpisodeFormValues,
  type MovieFormValues,
  type SeasonFormValues,
  type SeriesFormValues,
} from "../lib/admin";
import { loadAdminForm } from "../lib/admin-access";
import { pageTitle } from "../lib/meta";
import { withPrototypeParams } from "../lib/prototype";

type FormKind = "series" | "season" | "episode" | "movie";

function detectForm(pathname: string): { kind: FormKind; mode: "new" | "edit" } {
  if (pathname.includes("/episodes/") && pathname.endsWith("/edit")) return { kind: "episode", mode: "edit" };
  if (pathname.endsWith("/episodes/new")) return { kind: "episode", mode: "new" };
  if (pathname.includes("/seasons/") && pathname.endsWith("/edit")) return { kind: "season", mode: "edit" };
  if (pathname.endsWith("/seasons/new")) return { kind: "season", mode: "new" };
  if (pathname.includes("/movies/") && (pathname.endsWith("/new") || pathname.endsWith("/edit"))) {
    return { kind: "movie", mode: pathname.endsWith("/new") ? "new" : "edit" };
  }
  return { kind: "series", mode: pathname.endsWith("/new") ? "new" : "edit" };
}

export function meta({ location }: Route.MetaArgs) {
  const { kind, mode } = detectForm(location.pathname);
  const labels: Record<FormKind, string> = {
    series: "系列",
    season: "季",
    episode: "单集",
    movie: "电影",
  };
  return [{ title: pageTitle(`${mode === "new" ? "新建" : "编辑"}${labels[kind]}`) }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const base = loadAdminForm(request);
  const url = new URL(request.url);
  const detected = detectForm(url.pathname);
  const seriesId = params.seriesId ?? "";
  const seasonId = params.seasonId ?? "";
  const episodeId = params.episodeId ?? "";
  const movieId = params.movieId ?? "";
  const series = seriesId ? findAdminSeries(seriesId) ?? null : null;
  const season = seriesId && seasonId ? findAdminSeason(seriesId, seasonId) ?? null : null;
  const episode = seriesId && seasonId && episodeId
    ? findAdminEpisode(seriesId, seasonId, episodeId) ?? null
    : null;
  const movie = movieId ? findAdminMovie(movieId) ?? null : null;
  return {
    ...base,
    ...detected,
    seriesId,
    seasonId,
    episodeId,
    movieId,
    series,
    season,
    episode,
    movie,
  };
}

function defaultSeriesValues(series: ReturnType<typeof findAdminSeries> | null): SeriesFormValues {
  return {
    title: series?.title ?? "",
    originalTitle: series?.originalTitle ?? "",
    year: series ? String(series.year) : "",
    description: series?.description ?? "",
    tags: series?.tags.join("、") ?? "",
    visibility: series?.visibility ?? "visible",
    hasPoster: series?.hasPoster ?? false,
    hasBanner: series?.hasBanner ?? false,
  };
}

function defaultSeasonValues(season: ReturnType<typeof findAdminSeason> | null): SeasonFormValues {
  return {
    number: season ? String(season.number) : "",
    title: season?.title ?? "",
    description: season?.description ?? "",
    visibility: season?.visibility ?? "visible",
    hasPoster: season?.hasPoster ?? false,
  };
}

function defaultEpisodeValues(episode: ReturnType<typeof findAdminEpisode> | null): EpisodeFormValues {
  return {
    number: episode ? String(episode.number) : "",
    title: episode?.title ?? "",
    originalTitle: episode?.originalTitle ?? "",
    description: episode?.description ?? "",
    duration: episode ? String(episode.duration) : "",
    airDate: episode?.airDate ?? "",
    visibility: episode?.visibility ?? "visible",
    hasThumbnail: episode?.hasThumbnail ?? false,
  };
}

function defaultMovieValues(movie: ReturnType<typeof findAdminMovie> | null): MovieFormValues {
  return {
    title: movie?.title ?? "",
    originalTitle: movie?.originalTitle ?? "",
    year: movie ? String(movie.year) : "",
    duration: movie ? String(movie.duration) : "",
    description: movie?.description ?? "",
    tags: movie?.tags.join("、") ?? "",
    visibility: movie?.visibility ?? "visible",
    hasPoster: movie?.hasPoster ?? false,
    hasBanner: movie?.hasBanner ?? false,
  };
}

function visibilitySelect(
  id: string,
  value: "visible" | "hidden",
  disabled: boolean,
  onChange: (value: "visible" | "hidden") => void,
) {
  return (
    <FieldSelect
      id={id}
      name="visibility"
      value={value}
      disabled={disabled}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value as "visible" | "hidden");
      }}
    >
      <option value="visible">展示</option>
      <option value="hidden">隐藏</option>
    </FieldSelect>
  );
}

function initialFormErrors(
  adminState: AdminState,
  kind: FormKind,
  series: ReturnType<typeof findAdminSeries> | null,
  season: ReturnType<typeof findAdminSeason> | null,
  episode: ReturnType<typeof findAdminEpisode> | null,
  movie: ReturnType<typeof findAdminMovie> | null,
): Record<string, string | null> {
  if (adminState !== "validation-error") return {};
  if (kind === "series") return validateSeriesForm({ ...defaultSeriesValues(series), title: "", year: "" });
  if (kind === "season") return validateSeasonForm({ ...defaultSeasonValues(season), number: "", title: "" });
  if (kind === "episode") {
    return validateEpisodeForm({ ...defaultEpisodeValues(episode), number: "", title: "", duration: "" });
  }
  return validateMovieForm({ ...defaultMovieValues(movie), title: "", year: "", duration: "" });
}

function CatalogFormBody({ loaderData }: Route.ComponentProps) {
  const {
    scenario,
    forbidden,
    adminState,
    kind,
    mode,
    series,
    season,
    episode,
    movie,
    seriesId,
    seasonId,
  } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const focusedRef = useRef(false);

  const [seriesValues, setSeriesValues] = useState(() => defaultSeriesValues(series));
  const [seasonValues, setSeasonValues] = useState(() => defaultSeasonValues(season));
  const [episodeValues, setEpisodeValues] = useState(() => defaultEpisodeValues(episode));
  const [movieValues, setMovieValues] = useState(() => defaultMovieValues(movie));
  const [dirty, setDirty] = useState(adminState === "dirty");
  const [submitting, setSubmitting] = useState(adminState === "submitting");
  const [toast, setToast] = useState<string | null>(adminState === "action-error" ? "保存失败，请重试" : null);
  const [errors, setErrors] = useState<Record<string, string | null>>(() => (
    initialFormErrors(adminState, kind, series, season, episode, movie)
  ));

  useEffect(() => {
    if (!hasFormErrors(errors) || !formRef.current || focusedRef.current) return;
    const invalid = formRef.current.querySelector<HTMLElement>("[aria-invalid='true']");
    invalid?.focus();
    focusedRef.current = true;
  }, [errors]);

  const cancelTo = useMemo(() => {
    if (kind === "movie") return "/admin/catalog/movies";
    if (kind === "series") return mode === "edit" && series ? `/admin/catalog/series/${series.id}` : "/admin/catalog/series";
    if (kind === "season") return seriesId ? `/admin/catalog/series/${seriesId}` : "/admin/catalog/series";
    if (kind === "episode") {
      return seriesId && seasonId
        ? `/admin/catalog/series/${seriesId}/seasons/${seasonId}`
        : "/admin/catalog/series";
    }
    return "/admin/catalog/series";
  }, [kind, mode, series, seriesId, seasonId]);

  const leaveGuard = useLeaveGuard(dirty && !submitting);

  if (forbidden || scenario === "forbidden") return <PageState state="forbidden" onClearHref="/" />;

  if (mode === "edit") {
    if (kind === "series" && !series) return <PageState state="empty" onClearHref="/admin/catalog/series" />;
    if (kind === "season" && (!series || !season)) return <PageState state="empty" onClearHref="/admin/catalog/series" />;
    if (kind === "episode" && (!series || !season || !episode)) {
      return <PageState state="empty" onClearHref="/admin/catalog/series" />;
    }
    if (kind === "movie" && !movie) return <PageState state="empty" onClearHref="/admin/catalog/movies" />;
  }

  const labels: Record<FormKind, string> = {
    series: "系列",
    season: "季",
    episode: "单集",
    movie: "电影",
  };
  const title = `${mode === "new" ? "新建" : "编辑"}${labels[kind]}`;

  const breadcrumbs: AdminCrumb[] = [
    { label: "目录", to: kind === "movie" ? "/admin/catalog/movies" : "/admin/catalog/series" },
  ];
  if (kind === "series") {
    breadcrumbs.push({ label: mode === "new" ? "新建系列" : series?.title ?? "编辑系列" });
  } else if (kind === "season" && series) {
    breadcrumbs.push({ label: series.title, to: `/admin/catalog/series/${series.id}` });
    breadcrumbs.push({ label: mode === "new" ? "新建季" : season?.title ?? "编辑季" });
  } else if (kind === "episode" && series && season) {
    breadcrumbs.push({ label: series.title, to: `/admin/catalog/series/${series.id}` });
    breadcrumbs.push({ label: season.title, to: `/admin/catalog/series/${series.id}/seasons/${season.id}` });
    breadcrumbs.push({ label: mode === "new" ? "新建单集" : episode?.title ?? "编辑单集" });
  } else if (kind === "movie") {
    breadcrumbs.push({ label: mode === "new" ? "新建电影" : movie?.title ?? "编辑电影" });
  }

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

  function handleCancel() {
    leaveGuard.requestNavigate(withPrototypeParams(cancelTo, location.search));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    let nextErrors: Record<string, string | null> = {};
    if (kind === "series") nextErrors = validateSeriesForm(seriesValues);
    if (kind === "season") nextErrors = validateSeasonForm(seasonValues);
    if (kind === "episode") nextErrors = validateEpisodeForm(episodeValues);
    if (kind === "movie") nextErrors = validateMovieForm(movieValues);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;
    if (adminState === "action-error") {
      setToast("保存失败，请重试");
      return;
    }
    setSubmitting(true);
    setDirty(false);
    window.setTimeout(() => {
      navigate(withPrototypeParams(cancelTo, location.search));
    }, 450);
  }

  const disabled = submitting;

  return (
    <AdminShell title={title} breadcrumbs={breadcrumbs}>
      {adminState === "action-error" ? <AdminAlert>保存失败，请检查后重试。</AdminAlert> : null}
      <form className="admin-form" ref={formRef} onSubmit={handleSubmit} noValidate>
        {kind === "series" ? (
          <>
            <Field label="中文标题" htmlFor="series-title" required error={errors.title}>
              <FieldInput
                id="series-title"
                name="title"
                value={seriesValues.title}
                disabled={disabled}
                aria-invalid={Boolean(errors.title) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setSeriesValues((current) => ({ ...current, title: event.target.value }));
                }}
              />
            </Field>
            <Field label="原名" htmlFor="series-original">
              <FieldInput
                id="series-original"
                name="originalTitle"
                value={seriesValues.originalTitle}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setSeriesValues((current) => ({ ...current, originalTitle: event.target.value }));
                }}
              />
            </Field>
            <Field label="首播年份" htmlFor="series-year" required error={errors.year}>
              <FieldInput
                id="series-year"
                name="year"
                inputMode="numeric"
                value={seriesValues.year}
                disabled={disabled}
                aria-invalid={Boolean(errors.year) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setSeriesValues((current) => ({ ...current, year: event.target.value }));
                }}
              />
            </Field>
            <Field label="简介" htmlFor="series-description">
              <FieldTextarea
                id="series-description"
                name="description"
                value={seriesValues.description}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  markDirty();
                  setSeriesValues((current) => ({ ...current, description: event.target.value }));
                }}
              />
            </Field>
            <Field label="类型标签" htmlFor="series-tags">
              <FieldInput
                id="series-tags"
                name="tags"
                value={seriesValues.tags}
                disabled={disabled}
                placeholder="用顿号分隔，如 探索、剧情"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setSeriesValues((current) => ({ ...current, tags: event.target.value }));
                }}
              />
            </Field>
            <Field label="海报" htmlFor="series-poster">
              <ImageField
                label="海报"
                hasImage={seriesValues.hasPoster}
                disabled={disabled}
                onChange={(hasPoster) => {
                  markDirty();
                  setSeriesValues((current) => ({ ...current, hasPoster }));
                }}
              />
            </Field>
            <Field label="横幅" htmlFor="series-banner">
              <ImageField
                label="横幅"
                hasImage={seriesValues.hasBanner}
                disabled={disabled}
                onChange={(hasBanner) => {
                  markDirty();
                  setSeriesValues((current) => ({ ...current, hasBanner }));
                }}
              />
            </Field>
            <Field label="展示状态" htmlFor="series-visibility" required>
              {visibilitySelect("series-visibility", seriesValues.visibility, disabled, (visibility) => {
                markDirty();
                setSeriesValues((current) => ({ ...current, visibility }));
              })}
            </Field>
          </>
        ) : null}

        {kind === "season" ? (
          <>
            <Field label="季号" htmlFor="season-number" required error={errors.number}>
              <FieldInput
                id="season-number"
                name="number"
                inputMode="numeric"
                value={seasonValues.number}
                disabled={disabled}
                aria-invalid={Boolean(errors.number) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setSeasonValues((current) => ({ ...current, number: event.target.value }));
                }}
              />
            </Field>
            <Field label="季标题" htmlFor="season-title" required error={errors.title}>
              <FieldInput
                id="season-title"
                name="title"
                value={seasonValues.title}
                disabled={disabled}
                aria-invalid={Boolean(errors.title) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setSeasonValues((current) => ({ ...current, title: event.target.value }));
                }}
              />
            </Field>
            <Field label="简介" htmlFor="season-description">
              <FieldTextarea
                id="season-description"
                name="description"
                value={seasonValues.description}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  markDirty();
                  setSeasonValues((current) => ({ ...current, description: event.target.value }));
                }}
              />
            </Field>
            <Field label="海报" htmlFor="season-poster">
              <ImageField
                label="海报"
                hasImage={seasonValues.hasPoster}
                disabled={disabled}
                onChange={(hasPoster) => {
                  markDirty();
                  setSeasonValues((current) => ({ ...current, hasPoster }));
                }}
              />
            </Field>
            <Field label="展示状态" htmlFor="season-visibility" required>
              {visibilitySelect("season-visibility", seasonValues.visibility, disabled, (visibility) => {
                markDirty();
                setSeasonValues((current) => ({ ...current, visibility }));
              })}
            </Field>
          </>
        ) : null}

        {kind === "episode" ? (
          <>
            <Field label="集号" htmlFor="episode-number" required error={errors.number}>
              <FieldInput
                id="episode-number"
                name="number"
                inputMode="numeric"
                value={episodeValues.number}
                disabled={disabled}
                aria-invalid={Boolean(errors.number) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setEpisodeValues((current) => ({ ...current, number: event.target.value }));
                }}
              />
            </Field>
            <Field label="标题" htmlFor="episode-title" required error={errors.title}>
              <FieldInput
                id="episode-title"
                name="title"
                value={episodeValues.title}
                disabled={disabled}
                aria-invalid={Boolean(errors.title) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setEpisodeValues((current) => ({ ...current, title: event.target.value }));
                }}
              />
            </Field>
            <Field label="原名" htmlFor="episode-original">
              <FieldInput
                id="episode-original"
                name="originalTitle"
                value={episodeValues.originalTitle}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setEpisodeValues((current) => ({ ...current, originalTitle: event.target.value }));
                }}
              />
            </Field>
            <Field label="简介" htmlFor="episode-description">
              <FieldTextarea
                id="episode-description"
                name="description"
                value={episodeValues.description}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  markDirty();
                  setEpisodeValues((current) => ({ ...current, description: event.target.value }));
                }}
              />
            </Field>
            <Field label="时长（分钟）" htmlFor="episode-duration" required error={errors.duration}>
              <FieldInput
                id="episode-duration"
                name="duration"
                inputMode="numeric"
                value={episodeValues.duration}
                disabled={disabled}
                aria-invalid={Boolean(errors.duration) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setEpisodeValues((current) => ({ ...current, duration: event.target.value }));
                }}
              />
            </Field>
            <Field label="首播日期" htmlFor="episode-air-date">
              <FieldInput
                id="episode-air-date"
                name="airDate"
                type="date"
                value={episodeValues.airDate}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setEpisodeValues((current) => ({ ...current, airDate: event.target.value }));
                }}
              />
            </Field>
            <Field label="缩略图" htmlFor="episode-thumb">
              <ImageField
                label="缩略图"
                hasImage={episodeValues.hasThumbnail}
                disabled={disabled}
                onChange={(hasThumbnail) => {
                  markDirty();
                  setEpisodeValues((current) => ({ ...current, hasThumbnail }));
                }}
              />
            </Field>
            <Field label="展示状态" htmlFor="episode-visibility" required>
              {visibilitySelect("episode-visibility", episodeValues.visibility, disabled, (visibility) => {
                markDirty();
                setEpisodeValues((current) => ({ ...current, visibility }));
              })}
            </Field>
          </>
        ) : null}

        {kind === "movie" ? (
          <>
            <Field label="中文标题" htmlFor="movie-title" required error={errors.title}>
              <FieldInput
                id="movie-title"
                name="title"
                value={movieValues.title}
                disabled={disabled}
                aria-invalid={Boolean(errors.title) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, title: event.target.value }));
                }}
              />
            </Field>
            <Field label="原名" htmlFor="movie-original">
              <FieldInput
                id="movie-original"
                name="originalTitle"
                value={movieValues.originalTitle}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, originalTitle: event.target.value }));
                }}
              />
            </Field>
            <Field label="年份" htmlFor="movie-year" required error={errors.year}>
              <FieldInput
                id="movie-year"
                name="year"
                inputMode="numeric"
                value={movieValues.year}
                disabled={disabled}
                aria-invalid={Boolean(errors.year) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, year: event.target.value }));
                }}
              />
            </Field>
            <Field label="时长（分钟）" htmlFor="movie-duration" required error={errors.duration}>
              <FieldInput
                id="movie-duration"
                name="duration"
                inputMode="numeric"
                value={movieValues.duration}
                disabled={disabled}
                aria-invalid={Boolean(errors.duration) || undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, duration: event.target.value }));
                }}
              />
            </Field>
            <Field label="简介" htmlFor="movie-description">
              <FieldTextarea
                id="movie-description"
                name="description"
                value={movieValues.description}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, description: event.target.value }));
                }}
              />
            </Field>
            <Field label="类型标签" htmlFor="movie-tags">
              <FieldInput
                id="movie-tags"
                name="tags"
                value={movieValues.tags}
                disabled={disabled}
                placeholder="用顿号分隔"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, tags: event.target.value }));
                }}
              />
            </Field>
            <Field label="海报" htmlFor="movie-poster">
              <ImageField
                label="海报"
                hasImage={movieValues.hasPoster}
                disabled={disabled}
                onChange={(hasPoster) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, hasPoster }));
                }}
              />
            </Field>
            <Field label="横幅" htmlFor="movie-banner">
              <ImageField
                label="横幅"
                hasImage={movieValues.hasBanner}
                disabled={disabled}
                onChange={(hasBanner) => {
                  markDirty();
                  setMovieValues((current) => ({ ...current, hasBanner }));
                }}
              />
            </Field>
            <Field label="展示状态" htmlFor="movie-visibility" required>
              {visibilitySelect("movie-visibility", movieValues.visibility, disabled, (visibility) => {
                markDirty();
                setMovieValues((current) => ({ ...current, visibility }));
              })}
            </Field>
          </>
        ) : null}

        <div className="admin-form-actions button-row">
          <button className="button secondary" type="button" disabled={submitting} onClick={handleCancel}>
            取消
          </button>
          <button className="button primary" type="submit" disabled={submitting}>
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

export default function AdminCatalogForm(props: Route.ComponentProps) {
  const resetKey = [
    props.loaderData.kind,
    props.loaderData.mode,
    props.loaderData.seriesId,
    props.loaderData.seasonId,
    props.loaderData.episodeId,
    props.loaderData.movieId,
    props.loaderData.search,
    props.loaderData.adminState,
  ].join(":");
  return <CatalogFormBody key={resetKey} {...props} />;
}
