import { Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, redirect, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/series-detail";
import { EpisodeRow, FavoriteAction, MediaGrid, TitleCard } from "../components/media";
import { PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { defaultSeason, findSeries, series } from "../data/catalog";
import { getPrototypeState } from "../lib/prototype";
import { withPrototypeParams } from "../lib/prototype";
import { pageTitle } from "../lib/meta";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData ? pageTitle(`${loaderData.item.title} · 第 ${loaderData.season} 季`) : pageTitle("系列详情") }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const item = findSeries(params.id);
  if (!item) throw new Response("Not Found", { status: 404 });
  const state = getPrototypeState(request);
  if (!params.number) {
    const url = new URL(request.url);
    return redirect(`/series/${item.id}/season/${defaultSeason(item, state.persona)}${url.search}`);
  }
  const season = Math.min(item.seasonCount, Math.max(1, Number(params.number) || 1));
  return { ...state, item, season };
}

export default function SeriesDetail({ loaderData }: Route.ComponentProps) {
  const { item, season, persona, scenario } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();
  const seasonTitle = useRef<HTMLHeadingElement>(null);
  const previousSeason = useRef(season);
  useEffect(() => {
    if (previousSeason.current !== season) seasonTitle.current?.focus();
    previousSeason.current = season;
  }, [season]);
  if (scenario === "loading") return <PageSkeleton cards={8} />;
  if (scenario === "empty" || scenario === "error") return <PageState state={scenario} onClearHref="/series" />;
  const episodes = item.episodes.filter((episode) => episode.season === season);
  const current = persona === "user" ? item.episodes.find((episode) => episode.progress > 0 && episode.progress < 100) : item.episodes.find((episode) => episode.playable);
  const longCopy = scenario === "long-copy";
  const description = item.description ?? "暂无简介。";
  return (
    <div className="detail-page">
      <section className="detail-hero">
        <TitleCard id={`${item.id}-banner`} title={item.title} originalTitle={item.originalTitle} eyebrow="SERIES ARCHIVE" ratio="banner" backdrop failed={scenario === "image-failed"} />
        <div className="detail-hero-content page-shell"><div className="detail-poster"><TitleCard id={item.id} title={item.title} originalTitle={item.originalTitle} eyebrow={`${item.seasonCount} SEASONS`} failed={scenario === "image-failed"} /></div><div className="detail-copy"><p className="eyebrow">SERIES · {item.year}</p><h1>{longCopy ? `${item.title}：一份跨越漫长未知疆域与多个时代的完整航行档案` : item.title}</h1>{item.originalTitle ? <p className="original-title">{item.originalTitle}</p> : null}<div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}<span>{item.seasonCount} 季</span></div><p>{longCopy ? `${description} 这份扩展说明用于检验中英文长文本在详情头部、按钮与移动布局中的稳定表现，同时保留所有重要操作。` : description}</p><div className="button-row">{current?.playable ? <PrototypeLink className="button primary" to={`/watch/episode/${current.id}`}><Play size={18} />{current.progress ? `继续观看 S${String(current.season).padStart(2, "0")}E${String(current.number).padStart(2, "0")}` : `播放 S${String(current.season).padStart(2, "0")}E${String(current.number).padStart(2, "0")}`}</PrototypeLink> : <button className="button primary" disabled>当前暂无可播放内容</button>}<FavoriteAction title={item.title} label="收藏系列" /></div></div></div>
      </section>
      <div className="page-shell detail-body">
        <section aria-labelledby="season-title">
          <div className="season-heading"><div><p className="eyebrow">SEASON NAVIGATION</p><h2 id="season-title" ref={seasonTitle} tabIndex={-1}>第 {season} 季</h2></div>
            {item.seasonCount <= 8 ? <div className="season-tabs" role="navigation" aria-label="选择季">{Array.from({ length: item.seasonCount }, (_, i) => i + 1).map((number) => <Link key={number} aria-current={number === season ? "page" : undefined} to={withPrototypeParams(`/series/${item.id}/season/${number}`, location.search)}>第 {number} 季</Link>)}</div> : null}
            <label className={item.seasonCount <= 8 ? "season-select mobile-season-select" : "season-select"}>选择季<select value={season} onChange={(event) => navigate(withPrototypeParams(`/series/${item.id}/season/${event.target.value}`, location.search))}>{Array.from({ length: item.seasonCount }, (_, i) => i + 1).map((number) => <option value={number} key={number}>第 {number} 季</option>)}</select></label>
          </div>
          <p className="season-summary">本季记录舰员在新航路上的 {episodes.length} 次关键任务，以及每次决定留下的影响。</p>
          <div className="episode-list">{episodes.map((episode, index) => <EpisodeRow key={episode.id} episode={episode} seriesItem={item} imageFailed={scenario === "image-failed" && index === 1} />)}</div>
        </section>
        <section className="recommendations"><div className="section-heading"><h2>相关推荐</h2><PrototypeLink to="/series">浏览全部系列</PrototypeLink></div><MediaGrid items={series.filter((show) => show.id !== item.id).slice(0, 6)} /></section>
      </div>
    </div>
  );
}
