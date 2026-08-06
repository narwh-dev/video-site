import { Dialog } from "@base-ui/react/dialog";
import { Filter, X } from "lucide-react";
import { Form, Link, useLocation } from "react-router";
import type { Route } from "./+types/catalog";
import { MediaGrid } from "../components/media";
import { PrototypeHiddenFields } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { movies, series, type CatalogItem } from "../data/catalog";
import { getPrototypeState } from "../lib/prototype";
import { prototypeOnlyHref, withPrototypeParams } from "../lib/prototype";
import { pageTitle } from "../lib/meta";

const PAGE_SIZE = 12;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: pageTitle(loaderData?.kind === "movie" ? "电影档案" : "剧集档案") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isSeries = url.pathname === "/series";
  const source: CatalogItem[] = isSeries ? series : movies;
  const year = url.searchParams.get("year") ?? "all";
  const tag = url.searchParams.get("tag") ?? "all";
  const sort = url.searchParams.get("sort") ?? "updated";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const filtered = source.filter((item) => (year === "all" || String(Math.floor(item.year / 10) * 10) === year) && (tag === "all" || item.tags.includes(tag)));
  const sorted = [...filtered].sort((a, b) => sort === "year" ? b.year - a.year : sort === "title" ? a.title.localeCompare(b.title, "zh-CN") : source.indexOf(a) - source.indexOf(b));
  return {
    ...getPrototypeState(request),
    kind: isSeries ? "series" as const : "movie" as const,
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: sorted.length,
    page,
    pageCount: Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)),
    filters: { year, tag, sort },
  };
}

function pageHref(search: string, page: number) {
  const params = new URLSearchParams(search);
  params.set("page", String(page));
  return withPrototypeParams(`?${params}`, search);
}

function FilterFields({ filters, immediate = false }: { filters: { year: string; tag: string; sort: string }; immediate?: boolean }) {
  const submitOnChange = immediate ? (event: React.ChangeEvent<HTMLSelectElement>) => event.currentTarget.form?.requestSubmit() : undefined;
  return (
    <>
      <label>年份<select name="year" defaultValue={filters.year} onChange={submitOnChange}><option value="all">全部年代</option><option value="2020">2020 年代</option><option value="2010">2010 年代</option><option value="1990">1990 年代</option><option value="1980">1980 年代</option><option value="1960">1960 年代</option></select></label>
      <label>标签<select name="tag" defaultValue={filters.tag} onChange={submitOnChange}><option value="all">全部标签</option><option value="探索">探索</option><option value="剧情">剧情</option><option value="动画">动画</option><option value="经典">经典</option><option value="冒险">冒险</option></select></label>
      <label>排序<select name="sort" defaultValue={filters.sort} onChange={submitOnChange}><option value="updated">最近更新</option><option value="year">首播年份</option><option value="title">标题</option></select></label>
      <input type="hidden" name="page" value="1" />
    </>
  );
}

export default function Catalog({ loaderData }: Route.ComponentProps) {
  const { kind, items, total, page, pageCount, filters, scenario } = loaderData;
  const location = useLocation();
  const title = kind === "series" ? "剧集档案" : "电影档案";
  if (scenario === "loading") return <PageSkeleton cards={12} />;
  if (scenario === "error") return <PageState state="error" onClearHref={location.pathname} />;
  const effectiveItems = scenario === "empty" ? [] : items;
  const activeFilters = [["year", filters.year, filters.year === "all" ? "" : `${filters.year} 年代`], ["tag", filters.tag, filters.tag === "all" ? "" : filters.tag]] as const;
  return (
    <div className="page-shell catalog-page">
      <header className="page-heading"><p className="eyebrow">CATALOG / {kind === "series" ? "SERIES" : "FILMS"}</p><h1>{title}</h1><p>按年代与主题整理的社区内容目录，共 <strong>{scenario === "empty" ? 0 : total}</strong> 项结果。</p></header>
      <Form className="filter-bar desktop-filter-bar" method="get">
        <Filter aria-hidden="true" size={20} /><span className="filter-label">筛选</span>
        <FilterFields filters={filters} immediate />
        <PrototypeHiddenFields />
      </Form>
      <Dialog.Root>
        <Dialog.Trigger className="button secondary mobile-filter-trigger"><Filter size={18} />筛选与排序</Dialog.Trigger>
        <Dialog.Portal><Dialog.Backdrop className="dialog-backdrop" /><Dialog.Popup className="filter-sheet"><div className="sheet-header"><div><Dialog.Title>筛选内容</Dialog.Title><Dialog.Description>选择年份、标签与排序方式</Dialog.Description></div><Dialog.Close className="icon-button" aria-label="关闭筛选"><X /></Dialog.Close></div><Form className="mobile-filter-form" method="get"><FilterFields filters={filters} /><PrototypeHiddenFields /><button className="button primary" type="submit">应用筛选</button></Form></Dialog.Popup></Dialog.Portal>
      </Dialog.Root>
      {activeFilters.some(([, , label]) => label) ? <div className="active-filters"><span>已生效</span>{activeFilters.filter(([, , label]) => label).map(([key, , label]) => { const params = new URLSearchParams(location.search); params.delete(key); params.set("page", "1"); return <Link key={key} to={withPrototypeParams(`?${params}`, location.search)}>{label}<X size={14} /></Link>; })}<Link className="clear-link" to={prototypeOnlyHref(location.pathname, location.search)}>全部清除</Link></div> : null}
      {effectiveItems.length ? <MediaGrid items={effectiveItems} imageFailed={scenario === "image-failed"} /> : <PageState state="empty" onClearHref={location.pathname} />}
      {effectiveItems.length && pageCount > 1 ? <nav className="pagination" aria-label="分页"><Link aria-disabled={page === 1} tabIndex={page === 1 ? -1 : 0} to={pageHref(location.search, Math.max(1, page - 1))}>上一页</Link>{Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => <Link key={number} aria-current={number === page ? "page" : undefined} to={pageHref(location.search, number)}>{number}</Link>)}<Link aria-disabled={page === pageCount} tabIndex={page === pageCount ? -1 : 0} to={pageHref(location.search, Math.min(pageCount, page + 1))}>下一页</Link></nav> : null}
    </div>
  );
}
