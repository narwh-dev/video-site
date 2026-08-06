import { Bookmark, CircleOff, Film, Play } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";
import type { CatalogItem, Episode, Series } from "../data/catalog";
import { titleCardColor } from "../data/catalog";
import { favoriteLoginHref, getPrototypeParams } from "../lib/prototype";
import { PrototypeLink } from "./prototype-link";

export function TitleCard({
  id,
  title,
  originalTitle,
  eyebrow,
  ratio = "poster",
  failed = false,
  backdrop = false,
}: {
  id: string;
  title: string;
  originalTitle?: string;
  eyebrow: string;
  ratio?: "poster" | "landscape" | "banner";
  failed?: boolean;
  backdrop?: boolean;
}) {
  const background = titleCardColor(id);
  const useInk = background !== "#111111";
  return (
    <div
      className={`title-card ${ratio} ${backdrop ? "backdrop-banner" : ""} ${failed ? "failed" : ""}`}
      style={failed ? undefined : { background, color: useInk ? "#111111" : "#FFFFFF" }}
      role="img"
      aria-label={`${title} 标题卡`}
    >
      {failed ? <Film aria-hidden="true" /> : null}
      <span className="title-card-code">{eyebrow}</span>
      <strong>{title}</strong>
      <span>{failed ? "素材暂不可用" : originalTitle || "星际迷航中国社区影像档案"}</span>
    </div>
  );
}

export function MediaCard({ item, imageFailed = false }: { item: CatalogItem; imageFailed?: boolean }) {
  const [favorite, setFavorite] = useState(false);
  const href = item.kind === "series" ? `/series/${item.id}` : `/movies/${item.id}`;
  const meta = item.kind === "series" ? `${item.year} · ${item.seasonCount} 季` : `${item.year} · ${item.duration} 分钟`;
  const location = useLocation();
  const { persona } = getPrototypeParams(location.search);
  const favoriteHref = favoriteLoginHref(location.pathname, location.search);
  return (
    <article className="media-card">
      <PrototypeLink className="media-card-link" to={href}>
        <TitleCard id={item.id} title={item.title} originalTitle={item.originalTitle} eyebrow={item.kind === "series" ? "SERIES" : "FILM"} failed={imageFailed} />
        <div className="media-card-copy">
          <h3>{item.title}</h3>
          <p>{item.originalTitle || meta}</p>
          <p className="media-meta">{meta}{!item.playable ? " · 暂不可播放" : ""}</p>
        </div>
      </PrototypeLink>
      {persona === "guest" ? <PrototypeLink className="icon-button favorite-button" to={favoriteHref} aria-label={`登录后收藏${item.title}`} title="登录后收藏">
        <Bookmark aria-hidden="true" size={18} />
      </PrototypeLink> : <button className={`icon-button favorite-button ${favorite ? "selected" : ""}`} type="button" aria-pressed={favorite} aria-label={`${favorite ? "取消收藏" : "收藏"}${item.title}`} title={favorite ? "取消收藏" : "收藏"} onClick={() => setFavorite((value) => !value)}>
        <Bookmark aria-hidden="true" size={18} fill={favorite ? "currentColor" : "none"} />
      </button>}
    </article>
  );
}

export function FavoriteAction({ title, label }: { title: string; label: string }) {
  const [favorite, setFavorite] = useState(false);
  const location = useLocation();
  const { persona } = getPrototypeParams(location.search);
  if (persona === "guest") {
    return <PrototypeLink className="button secondary" to={favoriteLoginHref(location.pathname, location.search)}><Bookmark size={18} />登录后{label}</PrototypeLink>;
  }
  return <button className={`button secondary ${favorite ? "selected" : ""}`} type="button" aria-pressed={favorite} onClick={() => setFavorite((value) => !value)}><Bookmark size={18} fill={favorite ? "currentColor" : "none"} />{favorite ? `已收藏${title}` : label}</button>;
}

export function EpisodeRow({ episode, seriesItem, imageFailed = false }: { episode: Episode; seriesItem: Series; imageFailed?: boolean }) {
  const code = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
  const content = (
    <>
      <TitleCard id={episode.id} title={episode.title} eyebrow={code} ratio="landscape" failed={imageFailed} />
      <div className="episode-copy">
        <span className="eyebrow">{code}</span>
        <h3>{episode.title}</h3>
        <p className="episode-synopsis">{episode.synopsis || "本集暂无简介。"}</p>
        <p className="media-meta">{episode.duration} 分钟 · {episode.playable ? "可播放" : "暂无可用来源"}</p>
        {episode.progress > 0 ? <div className="progress" aria-label={`观看进度 ${episode.progress}%`}><span style={{ width: `${episode.progress}%` }} /></div> : null}
      </div>
      <span className="episode-action" aria-hidden="true">{episode.playable ? <Play size={20} /> : <CircleOff size={20} />}</span>
    </>
  );
  return episode.playable ? (
    <PrototypeLink className="episode-row" to={`/watch/episode/${episode.id}`} aria-label={`播放 ${seriesItem.title} ${code} ${episode.title}`}>{content}</PrototypeLink>
  ) : (
    <div className="episode-row unavailable" role="group" tabIndex={0} aria-label={`${episode.title} 暂不可播放`}>{content}</div>
  );
}

export function MediaGrid({ items, imageFailed = false }: { items: CatalogItem[]; imageFailed?: boolean }) {
  return <div className="media-grid">{items.map((item, index) => <MediaCard key={item.id} item={item} imageFailed={imageFailed && index % 3 === 0} />)}</div>;
}
