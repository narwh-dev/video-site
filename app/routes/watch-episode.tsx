import { ArrowLeft, Bookmark, ListVideo, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/watch-episode";
import { DanmakuSettings } from "../components/danmaku-settings";
import { MediaGrid } from "../components/media";
import { PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import {
  danmakuLayerStyle,
  defaultDanmakuSettings,
  type DanmakuSettingsState,
} from "../lib/danmaku-settings";
import { danmakuForState } from "../data/danmaku";
import { MEDIA_BASE, defaultQualityUrl, qualityOptions, subtitleOptions } from "../data/media-fixtures";
import { formatResumeTime, resolvePlayerState } from "../lib/player-state";
import { pageTitle } from "../lib/meta";
import { favoriteLoginHref, getPrototypeState, loginHref } from "../lib/prototype";
import {
  clearSessionProgress,
  episodeCode,
  findEpisodeContent,
  getAdjacentLabels,
  readSessionProgress,
  relatedForEpisode,
  writeSessionProgress,
} from "../lib/watch";


export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData ? pageTitle(loaderData.content.displayTitle) : pageTitle("播放") }];
}

export function loader({ request, params }: Route.LoaderArgs) {
  const content = findEpisodeContent(params.id);
  if (!content) throw new Response("Not Found", { status: 404 });
  const state = getPrototypeState(request);
  const playerState = resolvePlayerState(state.scenario, new URL(request.url).searchParams.get("playerState"));
  return { ...state, content, playerState };
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function WatchEpisodePage({ loaderData }: Route.ComponentProps) {
  const { content, persona, scenario, playerState } = loaderData;
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [qualityId, setQualityId] = useState<"auto" | "1080p" | "720p">("auto");
  const [subtitleId, setSubtitleId] = useState<"off" | "zh" | "en">(
    playerState === "no-subtitles" ? "off" : "zh",
  );
  const [muted, setMuted] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [resumeToast, setResumeToast] = useState<string | null>(null);
  const [fromStart, setFromStart] = useState(false);
  const [ended, setEnded] = useState(playerState === "ended");
  const [countdown, setCountdown] = useState(10);
  const [countdownActive, setCountdownActive] = useState(playerState === "ended");
  const [danmakuText, setDanmakuText] = useState("");
  const [danmakuStatus, setDanmakuStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [danmakuEnabled, setDanmakuEnabled] = useState(playerState !== "no-danmaku");
  const [danmakuSettings, setDanmakuSettings] = useState<DanmakuSettingsState>(defaultDanmakuSettings);
  const composingRef = useRef(false);
  const adjacent = getAdjacentLabels(content);
  const related = useMemo(() => relatedForEpisode(content), [content]);
  const publicDanmaku = useMemo(
    () => danmakuForState(playerState === "no-danmaku"),
    [playerState],
  );
  const resumeSeconds = Math.min(100, Math.max(0, content.progress)) * content.duration * 0.6;
  const qualityUrl = qualityOptions.find((item) => item.id === qualityId)?.url ?? defaultQualityUrl();
  const activeSubtitle = subtitleOptions.find((item) => item.id === subtitleId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setDanmakuEnabled(false);
  }, []);

  useEffect(() => {
    if (scenario !== "default") return;
    if (playerState === "ended") {
      setEnded(true);
      setCountdownActive(true);
      setCountdown(10);
    }
  }, [playerState, scenario]);

  useEffect(() => {
    if (!countdownActive || !content.next) return;
    if (countdown <= 0) {
      navigate(`/watch/episode/${content.next.id}${location.search}`);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, countdownActive, content.next, location.search, navigate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      setCurrentTime(video.currentTime);
      writeSessionProgress(content.id, video.currentTime);
    };
    const onMeta = () => setDuration(video.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setEnded(true);
      setPlaying(false);
      if (content.next) {
        setCountdownActive(true);
        setCountdown(10);
      }
      clearSessionProgress(content.id);
    };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [content.id, content.next, persona]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const keep = currentTime;
    video.src = qualityUrl;
    video.load();
    const restore = () => {
      if (keep > 0 && Number.isFinite(keep)) video.currentTime = keep;
      if (playing) void video.play().catch(() => undefined);
    };
    video.addEventListener("loadedmetadata", restore, { once: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional quality swap keep-time
  }, [qualityUrl]);

  function seekToResume() {
    const video = videoRef.current;
    if (!video) return;
    const session = readSessionProgress(content.id);
    const target = fromStart
      ? 0
      : session ?? (persona === "user" && resumeSeconds > 0 ? resumeSeconds : 0);
    if (target > 0) {
      video.currentTime = target;
      setResumeToast(`已从 ${formatResumeTime(target)} 继续播放`);
      window.setTimeout(() => setResumeToast(null), 3200);
    }
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (playerState === "resume" || (persona === "user" && resumeSeconds > 0 && currentTime < 1)) {
        seekToResume();
      }
      void video.play().catch(() => undefined);
      setEnded(false);
      setCountdownActive(false);
    } else {
      video.pause();
    }
  }

  function changeQuality(next: "auto" | "1080p" | "720p") {
    setQualityId(next);
  }

  function submitDanmaku() {
    if (persona === "guest") {
      navigate(loginHref(location.pathname, location.search, "danmaku"));
      return;
    }
    const text = danmakuText.trim();
    if (!text || composingRef.current || danmakuStatus === "submitting") return;
    if (text.length > 80) return;
    setDanmakuStatus("submitting");
    window.setTimeout(() => {
      if (text.includes("失败")) {
        setDanmakuStatus("error");
        return;
      }
      setLocalPreview(text);
      setDanmakuText("");
      setDanmakuStatus("success");
      window.setTimeout(() => setDanmakuStatus("idle"), 2400);
    }, 450);
  }

  if (scenario === "loading") return <PageSkeleton cards={4} />;
  if (scenario === "error") return <PageState state="error" onClearHref={`/series/${content.series.id}`} />;

  const showSourceFailed = playerState === "source-failed" || playerState === "all-sources-failed";
  const showInitialOverlay = playerState === "initial" && !playing && currentTime < 0.2;
  const showBuffering = playerState === "buffering";
  const noSubtitles = playerState === "no-subtitles";
  const visibleDanmaku = danmakuEnabled ? publicDanmaku.filter((item) => Math.abs(item.time - currentTime) < 0.45) : [];

  return (
    <div className="watch-page">
      <header className="watch-topbar">
        <button className="icon-button dark" type="button" aria-label="返回上一页" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div className="watch-topbar-title">
          <p className="eyebrow">EPISODE · {content.code}</p>
          <h1>{content.displayTitle}</h1>
        </div>
        {persona === "guest" ? (
          <PrototypeLink className="button secondary watch-favorite" to={favoriteLoginHref(location.pathname, location.search)}>
            <Bookmark size={18} aria-hidden="true" />登录后收藏
          </PrototypeLink>
        ) : (
          <button
            className={`button secondary watch-favorite ${favorite ? "selected" : ""}`}
            type="button"
            aria-pressed={favorite}
            onClick={() => setFavorite((value) => !value)}
          >
            <Bookmark size={18} aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
            {favorite ? "已收藏系列" : "收藏系列"}
          </button>
        )}
      </header>

      <div className="watch-shell">
        <section className="watch-main" aria-label="播放器工作区">
          <div className={`watch-player-frame ${showSourceFailed ? "failed" : ""}`}>
            {showSourceFailed ? (
              <div className="watch-error-layer" role="alert">
                <h2>{playerState === "all-sources-failed" ? "暂时无法播放" : "当前清晰度加载失败"}</h2>
                <p>{playerState === "all-sources-failed" ? "请返回详情页稍后重试。" : "可切换其他清晰度后重试。"}</p>
                <div className="button-row">
                  {playerState === "source-failed" ? (
                    <button className="button primary" type="button" onClick={() => changeQuality("720p")}>切换 720p</button>
                  ) : (
                    <PrototypeLink className="button primary" to={`/series/${content.series.id}`}>返回详情页</PrototypeLink>
                  )}
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="watch-video"
                  playsInline
                  preload="metadata"
                  poster=""
                  controls={false}
                  muted={muted}
                  aria-label={`${content.displayTitle} 视频播放器`}
                >
                  {activeSubtitle?.url && !noSubtitles ? (
                    <track kind="captions" srcLang={subtitleId === "en" ? "en" : "zh"} label={activeSubtitle.label} src={activeSubtitle.url} default />
                  ) : null}
                </video>
                {showInitialOverlay ? (
                  <button className="watch-play-overlay" type="button" onClick={togglePlay} aria-label="开始播放">
                    <Play size={36} aria-hidden="true" />
                  </button>
                ) : null}
                {showBuffering ? <div className="watch-spinner" aria-live="polite" aria-label="正在缓冲" /> : null}
                {danmakuEnabled ? (
                  <div className="watch-danmaku-layer" aria-hidden="true" style={danmakuLayerStyle(danmakuSettings)}>
                    {visibleDanmaku.map((item, index) => (
                      <span key={`${item.text}-${index}`} className="watch-danmaku-item" style={{ color: item.color, top: `${12 + (index % 5) * 18}%` }}>
                        {item.text}
                      </span>
                    ))}
                    {localPreview ? <span className="watch-danmaku-item local" style={{ top: "72%" }}>{localPreview}</span> : null}
                  </div>
                ) : null}
                {(ended || countdownActive) && content.next ? (
                  <div className="watch-ended-layer" role="dialog" aria-label="下一集提示">
                    <p>下一集将在 {countdown} 秒后开始</p>
                    <div className="button-row">
                      <button className="button primary" type="button" onClick={() => navigate(`/watch/episode/${content.next!.id}${location.search}`)}>立即播放下一集</button>
                      <button className="button secondary" type="button" onClick={() => setCountdownActive(false)}>取消</button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="watch-controls" role="group" aria-label="播放控制">
            <button className="icon-button dark" type="button" aria-label={playing ? "暂停" : "播放"} onClick={togglePlay}>
              {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            </button>
            <label className="watch-progress">
              <span className="sr-only">播放进度</span>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                aria-valuetext={`${formatClock(currentTime)} / ${formatClock(duration)}`}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setCurrentTime(next);
                  if (videoRef.current) videoRef.current.currentTime = next;
                  writeSessionProgress(content.id, next);
                }}
              />
              <span>{formatClock(currentTime)} / {formatClock(duration)}</span>
            </label>
            <button className="icon-button dark" type="button" aria-label={muted ? "取消静音" : "静音"} onClick={() => {
              setMuted((value) => !value);
              if (videoRef.current) videoRef.current.muted = !muted;
            }}>
              {muted ? "静音" : "音量"}
            </button>
            <label className="watch-select">
              <span className="sr-only">清晰度</span>
              <select value={qualityId} aria-label="清晰度" onChange={(event) => changeQuality(event.target.value as "auto" | "1080p" | "720p")}>
                {qualityOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="watch-select">
              <span className="sr-only">字幕</span>
              <select
                value={noSubtitles ? "off" : subtitleId}
                aria-label="字幕"
                disabled={noSubtitles}
                onChange={(event) => setSubtitleId(event.target.value as "off" | "zh" | "en")}
              >
                {noSubtitles ? <option value="off">暂无字幕</option> : subtitleOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <button
              className={`icon-button dark ${danmakuEnabled ? "selected" : ""}`}
              type="button"
              aria-pressed={danmakuEnabled}
              aria-label={danmakuEnabled ? "关闭弹幕" : "打开弹幕"}
              onClick={() => setDanmakuEnabled((value) => !value)}
            >
              弹幕
            </button>
            <DanmakuSettings
              enabled={danmakuEnabled}
              onEnabledChange={setDanmakuEnabled}
              settings={danmakuSettings}
              onChange={setDanmakuSettings}
            />
            <button
              className="icon-button dark"
              type="button"
              aria-label="全屏"
              onClick={() => {
                const frame = videoRef.current?.parentElement;
                if (!frame) return;
                if (document.fullscreenElement) void document.exitFullscreen();
                else void frame.requestFullscreen?.();
              }}
            >
              全屏
            </button>
            <button
              className="icon-button dark"
              type="button"
              aria-label="画中画"
              onClick={() => {
                const video = videoRef.current as HTMLVideoElement & { requestPictureInPicture?: () => Promise<PictureInPictureWindow> };
                if (video?.requestPictureInPicture) void video.requestPictureInPicture();
              }}
            >
              画中画
            </button>
            <label className="watch-select">
              <span className="sr-only">倍速</span>
              <select
                defaultValue="1"
                aria-label="倍速"
                onChange={(event) => {
                  if (videoRef.current) videoRef.current.playbackRate = Number(event.target.value);
                }}
              >
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </label>
          </div>

          <div className="danmaku-composer">
            {persona === "guest" ? (
              <PrototypeLink className="button secondary" to={loginHref(location.pathname, location.search, "danmaku")}>
                登录后发送弹幕
              </PrototypeLink>
            ) : (
              <>
                <label className="sr-only" htmlFor="danmaku-input">弹幕输入</label>
                <input
                  id="danmaku-input"
                  maxLength={80}
                  value={danmakuText}
                  disabled={danmakuStatus === "submitting"}
                  placeholder="发送弹幕，最多 80 字"
                  onChange={(event) => setDanmakuText(event.target.value)}
                  onCompositionStart={() => { composingRef.current = true; }}
                  onCompositionEnd={() => { composingRef.current = false; }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !composingRef.current) {
                      event.preventDefault();
                      submitDanmaku();
                    }
                  }}
                />
                <button className="button primary" type="button" disabled={danmakuStatus === "submitting"} onClick={submitDanmaku}>
                  {danmakuStatus === "submitting" ? "提交中…" : "发送"}
                </button>
              </>
            )}
            <p className="danmaku-live" aria-live="polite">
              {danmakuStatus === "success" ? "已提交，审核通过后公开" : null}
              {danmakuStatus === "error" ? "发送失败，请重试" : null}
              {playerState === "no-danmaku" ? "当前内容暂无公共弹幕" : null}
            </p>
          </div>

          {resumeToast ? <p className="watch-toast" role="status">{resumeToast}</p> : null}
          {persona === "user" && resumeSeconds > 0 ? (
            <div className="button-row watch-resume-actions">
              <button className="button secondary" type="button" onClick={() => { setFromStart(false); seekToResume(); void videoRef.current?.play(); }}>从进度继续</button>
              <button className="button secondary" type="button" onClick={() => {
                setFromStart(true);
                clearSessionProgress(content.id);
                if (videoRef.current) videoRef.current.currentTime = 0;
                setCurrentTime(0);
              }}>从头播放</button>
            </div>
          ) : null}

          <section className="watch-meta">
            <p className="eyebrow">{content.series.title}</p>
            <h2>{content.title}</h2>
            <p className="media-meta">{content.code} · {content.duration} 分钟 · {content.playable ? "可播放" : "暂不可播放"}</p>
            <p>{scenario === "long-copy" ? `${content.synopsis} 这段扩展说明用于验证播放页元数据区在长文本场景下的换行与间距表现。` : content.synopsis}</p>
            <div className="button-row">
              {content.previous ? (
                <PrototypeLink className="button secondary" to={`/watch/episode/${content.previous.id}`}>
                  <SkipBack size={16} aria-hidden="true" />{adjacent.previousLabel}
                </PrototypeLink>
              ) : (
                <button className="button secondary" type="button" disabled>{adjacent.previousLabel}</button>
              )}
              {content.next ? (
                <PrototypeLink className="button secondary" to={`/watch/episode/${content.next.id}`}>
                  {adjacent.nextLabel}<SkipForward size={16} aria-hidden="true" />
                </PrototypeLink>
              ) : (
                <button className="button secondary" type="button" disabled>{adjacent.nextLabel}</button>
              )}
              <button className="button secondary episode-drawer-trigger" type="button" onClick={() => document.getElementById("episode-panel")?.scrollIntoView({ behavior: "smooth" })}>
                <ListVideo size={16} aria-hidden="true" />选集
              </button>
            </div>
          </section>
        </section>

        <aside id="episode-panel" className="episode-panel" aria-label="本季选集">
          <div className="episode-panel-head">
            <h2>第 {content.episode.season} 季</h2>
            <p>{content.seasonEpisodes.length} 集</p>
          </div>
          <div className="episode-panel-list">
            {content.seasonEpisodes.map((episode) => {
              const code = episodeCode(episode);
              const current = episode.id === content.id;
              const body = (
                <>
                  <span className="eyebrow">{code}</span>
                  <strong>{episode.title}</strong>
                  <span>{episode.duration} 分钟{episode.progress > 0 ? ` · ${episode.progress}%` : ""}</span>
                </>
              );
              return episode.playable ? (
                <PrototypeLink
                  key={episode.id}
                  className={`episode-panel-item ${current ? "current" : ""}`}
                  to={`/watch/episode/${episode.id}`}
                  aria-current={current ? "page" : undefined}
                >
                  {body}
                </PrototypeLink>
              ) : (
                <div key={episode.id} className="episode-panel-item unavailable" aria-disabled="true">{body}</div>
              );
            })}
          </div>
        </aside>
      </div>

      <section className="page-shell watch-recommendations">
        <div className="section-heading">
          <h2>相关推荐</h2>
          <PrototypeLink to="/series">浏览全部系列</PrototypeLink>
        </div>
        <MediaGrid items={related} />
      </section>
      <p className="sr-only">媒体样例路径 {MEDIA_BASE}</p>
    </div>
  );
}
