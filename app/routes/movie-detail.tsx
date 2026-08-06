import { Play } from "lucide-react";
import type { Route } from "./+types/movie-detail";
import { FavoriteAction, MediaGrid, TitleCard } from "../components/media";
import { PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { findMovie, movies } from "../data/catalog";
import { getPrototypeState } from "../lib/prototype";
import { pageTitle } from "../lib/meta";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData ? pageTitle(loaderData.item.title) : pageTitle("电影详情") }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const item = findMovie(params.id);
  if (!item) throw new Response("Not Found", { status: 404 });
  return { ...getPrototypeState(request), item };
}

export default function MovieDetail({ loaderData }: Route.ComponentProps) {
  const { item, scenario } = loaderData;
  if (scenario === "loading") return <PageSkeleton cards={6} />;
  if (scenario === "empty" || scenario === "error") return <PageState state={scenario} onClearHref="/movies" />;
  const longCopy = scenario === "long-copy";
  const description = item.description ?? "暂无简介。";
  return (
    <div className="detail-page movie-detail">
      <section className="detail-hero"><TitleCard id={`${item.id}-banner`} title={item.title} originalTitle={item.originalTitle} eyebrow="FEATURE FILM" ratio="banner" backdrop failed={scenario === "image-failed"} /><div className="detail-hero-content page-shell"><div className="detail-poster"><TitleCard id={item.id} title={item.title} originalTitle={item.originalTitle} eyebrow={`${item.year} · ${item.duration} MIN`} failed={scenario === "image-failed"} /></div><div className="detail-copy"><p className="eyebrow">FEATURE FILM · {item.year}</p><h1>{longCopy ? `${item.title}：穿越漫长未知疆域直到所有航线重新汇合的完整档案标题` : item.title}</h1>{item.originalTitle ? <p className="original-title">{item.originalTitle}</p> : null}<div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}<span>{item.duration} 分钟</span></div><p>{longCopy ? `${description} 这段额外说明用于验证极长文本不会挤压能力标签、播放操作或收藏入口。` : description}</p><div className="capability-row"><span>1080p</span><span>中文字幕</span><span>含弹幕</span></div><div className="button-row">{item.playable ? <PrototypeLink className="button primary" to={`/watch/movie/${item.id}`}><Play size={18} />{item.progress > 0 && item.progress < 100 ? "继续观看" : item.progress === 100 ? "重新观看" : "立即播放"}</PrototypeLink> : <button className="button primary" disabled>当前暂无可播放来源</button>}<FavoriteAction title={item.title} label="收藏电影" />{!item.playable ? <PrototypeLink className="button text-button" to="/movies">返回电影列表</PrototypeLink> : null}</div></div></div></section>
      <div className="page-shell detail-body"><section className="recommendations"><div className="section-heading"><h2>相关推荐</h2><PrototypeLink to="/movies">浏览全部电影</PrototypeLink></div><MediaGrid items={movies.filter((movie) => movie.id !== item.id).slice(0, 6)} /></section></div>
    </div>
  );
}
