import { Dialog } from "@base-ui/react/dialog";
import { History as HistoryIcon, Play, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/history";
import { AccountTabs } from "../components/account-tabs";
import { TitleCard } from "../components/media";
import { PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { historyForScenario, PROTOTYPE_NOW, type HistoryItem } from "../data/history";
import { formatWatchedLabel, groupHistoryItems, removeById } from "../lib/account";
import { pageTitle } from "../lib/meta";
import { getPrototypeState, loginHref } from "../lib/prototype";

export function meta() {
  return [{ title: pageTitle("观看历史") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const state = getPrototypeState(request);
  const url = new URL(request.url);
  if (state.persona === "guest") {
    throw redirect(loginHref(url.pathname, url.search));
  }
  return {
    ...state,
    items: historyForScenario(state.scenario),
  };
}

export default function HistoryPage({ loaderData }: Route.ComponentProps) {
  const { scenario, items: seedItems } = loaderData;
  const [items, setItems] = useState<HistoryItem[]>(seedItems);
  const [clearOpen, setClearOpen] = useState(false);

  const groups = useMemo(() => groupHistoryItems(items, PROTOTYPE_NOW), [items]);

  if (scenario === "loading") return <PageSkeleton cards={6} />;
  if (scenario === "error") return <PageState state="error" onClearHref="/history" />;
  if (scenario === "forbidden") return <PageState state="forbidden" onClearHref="/" />;

  const visibleItems = scenario === "empty" ? [] : items;
  const empty = visibleItems.length === 0;
  const visibleGroups = scenario === "empty" ? [] : groups;

  function handleRemove(id: string) {
    setItems((current) => removeById(current, id).items);
  }

  function handleClear() {
    setItems([]);
    setClearOpen(false);
  }

  return (
    <div className="page-shell account-page">
      <AccountTabs />
      <header className="account-heading">
        <div>
          <p className="eyebrow">ACCOUNT / HISTORY</p>
          <h1>观看历史</h1>
          <p>{empty ? "还没有观看记录" : `共 ${visibleItems.length} 条记录`}</p>
        </div>
        {!empty ? (
          <Dialog.Root open={clearOpen} onOpenChange={setClearOpen}>
            <Dialog.Trigger className="button secondary">
              <Trash2 size={18} aria-hidden="true" />
              清空历史
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="dialog-backdrop" />
              <Dialog.Popup className="confirm-dialog">
                <Dialog.Title>确认清空观看历史？</Dialog.Title>
                <Dialog.Description>清空后将无法恢复这些观看记录。</Dialog.Description>
                <div className="button-row">
                  <Dialog.Close className="button secondary">取消</Dialog.Close>
                  <button className="button primary" type="button" onClick={handleClear}>
                    确认清空
                  </button>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        ) : null}
      </header>

      {empty ? (
        <section className="account-empty" aria-live="polite">
          <HistoryIcon aria-hidden="true" size={40} />
          <h2>暂无观看历史</h2>
          <p>开始观看剧集或电影后，记录会出现在这里。</p>
          <div className="button-row">
            <PrototypeLink className="button primary" to="/series">
              浏览剧集
            </PrototypeLink>
            <PrototypeLink className="button secondary" to="/movies">
              浏览电影
            </PrototypeLink>
          </div>
        </section>
      ) : (
        <div className="history-list">
          {visibleGroups.map((group) => (
            <section key={group.key} className="history-group" aria-labelledby={`history-${group.key}`}>
              <h2 id={`history-${group.key}`}>{group.label}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id} className="history-row">
                    <div className="history-thumb">
                      <TitleCard
                        id={item.contentId}
                        title={item.title}
                        eyebrow={item.kind === "episode" ? "EP" : "FILM"}
                        ratio="landscape"
                      />
                    </div>
                    <div className="history-copy">
                      <h3>{item.title}</h3>
                      <p>{item.belonging}</p>
                      <p className="media-meta">{formatWatchedLabel(item.watchedAt, PROTOTYPE_NOW)}</p>
                      <div className="progress" aria-label={`观看进度 ${item.progress}%`}>
                        <span style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }} />
                      </div>
                    </div>
                    <div className="history-actions">
                      {item.playable ? (
                        <PrototypeLink className="button secondary history-continue" to={item.watchHref}>
                          <Play size={16} aria-hidden="true" />
                          继续观看
                        </PrototypeLink>
                      ) : (
                        <button className="button secondary" type="button" disabled>
                          暂不可播放
                        </button>
                      )}
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`删除 ${item.title} 的观看记录`}
                        onClick={() => handleRemove(item.id)}
                      >
                        <X aria-hidden="true" size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
