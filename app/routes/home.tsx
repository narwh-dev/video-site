import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import type { Route } from "./+types/home";
import { movies, series } from "../data/catalog";
import { MediaCard, TitleCard } from "../components/media";
import { PageSkeleton, PageState } from "../components/states";
import { getPrototypeState } from "../lib/prototype";
import { withPrototypeParams } from "../lib/prototype";
import { SITE_TITLE } from "../lib/meta";

export function meta() {
  return [{ title: SITE_TITLE }, { name: "description", content: "星际迷航中国社区影像档案" }];
}

export function loader({ request }: Route.LoaderArgs) {
  return getPrototypeState(request);
}

function ContentRail({ title, items }: { title: string; items: (typeof series[number] | typeof movies[number])[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<"start" | "middle" | "end">("start");
  const location = useLocation();

  function scroll(direction: -1 | 1) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.86, behavior: "smooth" });
  }

  return (
    <section className="home-section">
      <div className="section-heading"><h2>{title}</h2><div className="rail-actions"><button className="icon-button rail-button" type="button" aria-label={`向前浏览${title}`} disabled={position === "start"} onClick={() => scroll(-1)}><ArrowLeft size={18} /></button><button className="icon-button rail-button" type="button" aria-label={`向后浏览${title}`} disabled={position === "end"} onClick={() => scroll(1)}><ArrowRight size={18} /></button><Link to={withPrototypeParams(items[0]?.kind === "series" ? "/series" : "/movies", location.search)}>查看全部 <ArrowRight size={18} /></Link></div></div>
      <div className="content-rail" ref={rail} onScroll={(event) => { const element = event.currentTarget; const remaining = element.scrollWidth - element.clientWidth - element.scrollLeft; setPosition(element.scrollLeft < 4 ? "start" : remaining < 4 ? "end" : "middle"); }}>{items.map((item) => <MediaCard key={item.id} item={item} />)}</div>
    </section>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { persona, scenario } = loaderData;
  const location = useLocation();
  if (scenario === "loading") return <PageSkeleton />;
  if (scenario === "empty" || scenario === "error") return <PageState state={scenario} />;
  const featured = series[0];
  const longCopy = scenario === "long-copy";
  return (
    <div className="home-page">
      <section className="featured-hero">
        <TitleCard id={featured.id} title={featured.title} originalTitle={featured.originalTitle} eyebrow="FEATURED · 001" ratio="banner" backdrop failed={scenario === "image-failed"} />
        <div className="hero-overlay">
          <p className="eyebrow">社区影像档案 · 本周精选</p>
          <h1>Star Trek China <span>视频站</span></h1>
          <h2>{longCopy ? "奇异新世界：一次关于探索、理解与跨越漫长未知疆域的共同航程" : featured.title}</h2>
          <p>{longCopy ? "我们从社区档案中整理这段跨越多个世界、语言与时代的航程，保留完整的作品脉络与每一次重要相遇。" : featured.description}</p>
          <div className="button-row"><Link className="button primary" to={withPrototypeParams("/watch/episode/strange-new-worlds-1-1", location.search)}><Play size={18} />{persona === "user" ? "继续观看" : "立即播放"}</Link><Link className="button hero-secondary" to={withPrototypeParams("/series/strange-new-worlds", location.search)}>查看详情</Link></div>
        </div>
      </section>
      <div className="home-content">
        {persona === "user" ? <section className="home-section continue-section"><div className="section-heading"><h2>继续观看</h2><Link to={withPrototypeParams("/history", location.search)}>观看历史 <ArrowRight size={18} /></Link></div><div className="continue-card"><TitleCard id="strange-new-worlds-2-4" title="在两颗恒星之间等待黎明的漫长一夜" eyebrow="S02E04" ratio="landscape" /><div><span className="eyebrow">奇异新世界</span><h3>在两颗恒星之间等待黎明的漫长一夜</h3><p>已观看 62% · 剩余约 19 分钟</p><div className="progress"><span style={{ width: "62%" }} /></div></div><Link className="icon-button dark" aria-label="继续播放" title="继续播放" to={withPrototypeParams("/watch/episode/strange-new-worlds-2-4", location.search)}><Play /></Link></div></section> : null}
        <ContentRail title="最近更新" items={[movies[13], series[0], movies[16], series[7], movies[14]]} />
        <ContentRail title="社区精选系列" items={series.slice(0, 7)} />
        <ContentRail title="精选电影" items={movies.slice(6, 13)} />
      </div>
    </div>
  );
}
