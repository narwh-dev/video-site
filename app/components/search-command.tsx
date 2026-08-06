import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { TitleCard } from "./media";
import { searchCatalog } from "../data/catalog";
import { withPrototypeParams } from "../lib/prototype";

function resultHref(result: ReturnType<typeof searchCatalog>[number]) {
  if (result.kind === "episode") return `/watch/episode/${result.id}`;
  return result.kind === "series" ? `/series/${result.id}` : `/movies/${result.id}`;
}

const kindOrder = { series: 0, movie: 1, episode: 2 } as const;

export function SearchCommand({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const composing = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const results = useMemo(() => searchCatalog(query).slice(0, 8), [query]);
  const orderedResults = useMemo(() => [...results].sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]), [results]);
  const groups = useMemo(() => [
    { kind: "series", label: "系列", items: orderedResults.filter((result) => result.kind === "series") },
    { kind: "movie", label: "电影", items: orderedResults.filter((result) => result.kind === "movie") },
    { kind: "episode", label: "单集", items: orderedResults.filter((result) => result.kind === "episode") },
  ].filter((group) => group.items.length > 0), [orderedResults]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    navigate(withPrototypeParams(href, location.search));
  }

  function submitSearch() {
    if (composing.current || !query.trim()) return;
    go(`/search?q=${encodeURIComponent(query.trim())}&type=all`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={compact ? "icon-button" : "search-trigger"} aria-label="打开全局搜索">
        <Search aria-hidden="true" size={20} />{compact ? null : <><span>搜索片名、单集</span><kbd>⌘ K</kbd></>}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="search-dialog">
          <Dialog.Title className="sr-only">全局搜索</Dialog.Title>
          <Dialog.Description className="sr-only">搜索系列、电影和单集</Dialog.Description>
          <div className="command-input-wrap">
            <Search aria-hidden="true" />
            <input
              autoFocus
              value={query}
              placeholder="搜索系列、电影或具体单集"
              aria-label="搜索关键词"
              aria-controls="search-suggestions"
              aria-activedescendant={orderedResults[active] ? `suggestion-${active}` : undefined}
              onChange={(event) => { setQuery(event.target.value); setActive(0); }}
              onCompositionStart={() => { composing.current = true; }}
              onCompositionEnd={() => { composing.current = false; }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && orderedResults.length > 0) { event.preventDefault(); setActive((value) => Math.min(value + 1, orderedResults.length - 1)); }
                if (event.key === "ArrowUp" && orderedResults.length > 0) { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  const result = orderedResults[active];
                  if (result) go(resultHref(result));
                  else submitSearch();
                }
              }}
            />
            <Dialog.Close className="icon-button" aria-label="关闭搜索"><X aria-hidden="true" /></Dialog.Close>
          </div>
          <div className="command-results" id="search-suggestions" role="listbox">
            {!query ? <p className="command-hint">输入关键词开始检索社区影像档案。</p> : null}
            {query && results.length === 0 ? <div className="command-empty"><p>未找到匹配内容</p><button type="button" onClick={submitSearch}>查看全部结果 <ArrowRight size={18} /></button></div> : null}
            {groups.map((group) => <div className="command-group" role="group" aria-labelledby={`command-group-${group.kind}`} key={group.kind}>
              <p className="command-group-label" id={`command-group-${group.kind}`}>{group.label}</p>
              {group.items.map((result) => {
                const index = orderedResults.indexOf(result);
                const episode = result.kind === "episode";
                const subtitle = episode ? `${result.seriesTitle} · S${String(result.season).padStart(2, "0")}E${String(result.number).padStart(2, "0")}` : result.originalTitle || "暂无原名";
                const meta = episode ? `${result.seriesYear} · 单集` : `${result.year} · ${result.kind === "series" ? "系列" : "电影"}`;
                return <button
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={active === index}
                  className={`command-result ${active === index ? "active" : ""}`}
                  key={`${result.kind}-${result.id}`}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(resultHref(result))}
                >
                  <div className="command-result-art"><TitleCard id={result.id} title={result.title} eyebrow={episode ? `S${result.season}E${result.number}` : result.kind.toUpperCase()} ratio="landscape" /></div>
                  <span className="command-result-copy"><strong>{result.title}</strong><span>{subtitle}</span><span>{meta}</span></span>
                  <ArrowRight aria-hidden="true" size={18} />
                </button>;
              })}
            </div>)}
          </div>
          <div className="command-footer"><span>↑↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
