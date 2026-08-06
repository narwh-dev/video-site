import { Search as SearchIcon, X } from "lucide-react";
import { Form, Link, useLocation } from "react-router";
import type { Route } from "./+types/search";
import { TitleCard } from "../components/media";
import { PrototypeHiddenFields, PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { searchCatalog } from "../data/catalog";
import { getPrototypeState } from "../lib/prototype";
import { withPrototypeParams } from "../lib/prototype";
import { pageTitle } from "../lib/meta";

const PAGE_SIZE = 10;
const types = [["all", "全部"], ["series", "系列"], ["movie", "电影"], ["episode", "单集"]] as const;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: pageTitle(loaderData?.q ? `搜索“${loaderData.q}”` : "搜索影像档案") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const type = types.some(([value]) => value === url.searchParams.get("type")) ? url.searchParams.get("type")! : "all";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const results = searchCatalog(q).filter((item) => type === "all" || item.kind === type);
  return { ...getPrototypeState(request), q, type, page, total: results.length, results: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), pageCount: Math.max(1, Math.ceil(results.length / PAGE_SIZE)) };
}

export default function SearchPage({ loaderData }: Route.ComponentProps) {
  const { q, type, page, total, results, pageCount, scenario } = loaderData;
  const location = useLocation();
  if (scenario === "loading") return <PageSkeleton cards={5} />;
  if (scenario === "error") return <PageState state="error" onClearHref="/search" />;
  const visibleResults = scenario === "empty" ? [] : results;
  return (
    <div className="page-shell search-page">
      <header className="page-heading"><p className="eyebrow">SEARCH / ARCHIVE</p><h1>搜索影像档案</h1></header>
      <Form className="search-page-form" method="get"><SearchIcon aria-hidden="true" /><input name="q" defaultValue={q} autoFocus={!q} placeholder="输入作品、单集或主题" aria-label="搜索关键词" />{q ? <PrototypeLink className="icon-button" to="/search" aria-label="清空搜索"><X /></PrototypeLink> : null}<input type="hidden" name="type" value={type} /><PrototypeHiddenFields /><button className="button primary" type="submit">搜索</button></Form>
      <nav className="search-tabs" aria-label="结果类型">{types.map(([value, label]) => { const params = new URLSearchParams(location.search); params.set("type", value); params.set("page", "1"); return <Link key={value} aria-current={value === type ? "page" : undefined} to={withPrototypeParams(`?${params}`, location.search)}>{label}</Link>; })}</nav>
      {!q ? <section className="recent-searches"><h2>最近搜索</h2><div><PrototypeLink to="?q=奇异新世界&type=all">奇异新世界</PrototypeLink><PrototypeLink to="?q=探索&type=all">探索</PrototypeLink><PrototypeLink to="?q=第一类接触&type=all">第一类接触</PrototypeLink></div></section> : null}
      {q ? <div className="result-summary"><strong>{scenario === "empty" ? 0 : total}</strong> 项结果 · {types.find(([value]) => value === type)?.[1]}</div> : null}
      {q && visibleResults.length ? <div className="search-results">{visibleResults.map((result, index) => { const episode = result.kind === "episode"; const href = episode ? `/watch/episode/${result.id}` : result.kind === "series" ? `/series/${result.id}` : `/movies/${result.id}`; return <PrototypeLink className="search-result" key={`${result.kind}-${result.id}`} to={href}><div className={episode ? "result-landscape" : "result-poster"}><TitleCard id={result.id} title={result.title} eyebrow={result.kind.toUpperCase()} ratio={episode ? "landscape" : "poster"} failed={scenario === "image-failed" && index === 0} /></div><div><span className="eyebrow">{episode ? "单集" : result.kind === "series" ? "系列" : "电影"}</span><h2>{result.title}</h2><p className="original-title">{episode ? `${result.seriesTitle} · S${result.season}E${result.number}` : result.originalTitle || result.year}</p><p>{scenario === "long-copy" ? "这是一段用于验证统一纵向搜索结果在中英文混排、超长标题和多行摘要下仍保持稳定的信息说明。" : episode ? result.synopsis || "暂无简介。" : result.description || "暂无简介。"}</p></div></PrototypeLink>; })}</div> : null}
      {q && !visibleResults.length ? <section className="search-empty"><SearchIcon aria-hidden="true" /><h2>未找到“{q}”</h2><p>请尝试更短的关键词，或返回目录浏览。</p><div className="button-row"><PrototypeLink className="button secondary" to="/search">清空搜索</PrototypeLink><PrototypeLink className="button primary" to="/series">浏览剧集</PrototypeLink></div></section> : null}
       {visibleResults.length && pageCount > 1 ? <nav className="pagination" aria-label="搜索结果分页"><Link aria-disabled={page === 1} tabIndex={page === 1 ? -1 : 0} to={withPrototypeParams(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${Math.max(1, page - 1)}`, location.search)}>上一页</Link><span>第 {page} / {pageCount} 页</span><Link aria-disabled={page === pageCount} tabIndex={page === pageCount ? -1 : 0} to={withPrototypeParams(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${Math.min(pageCount, page + 1)}`, location.search)}>下一页</Link></nav> : null}
    </div>
  );
}
