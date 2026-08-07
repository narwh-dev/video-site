import { Dialog } from "@base-ui/react/dialog";
import { Bookmark, Film, Tv, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/favorites";
import { AccountTabs } from "../components/account-tabs";
import { TitleCard } from "../components/media";
import { PrototypeLink } from "../components/prototype-link";
import { PageSkeleton, PageState } from "../components/states";
import { UndoToast } from "../components/undo-toast";
import { favoritesForScenario, type FavoriteItem } from "../data/favorites";
import {
  clearSelection,
  formatFavoritedLabel,
  insertAt,
  removeById,
  removeByIds,
  selectAllIds,
  toggleSelection,
} from "../lib/account";
import { pageTitle } from "../lib/meta";
import { getPrototypeState, loginHref } from "../lib/prototype";

export function meta() {
  return [{ title: pageTitle("我的收藏") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const state = getPrototypeState(request);
  const url = new URL(request.url);
  if (state.persona === "guest") {
    throw redirect(loginHref(url.pathname, url.search));
  }
  return {
    ...state,
    items: favoritesForScenario(state.scenario),
  };
}

export default function Favorites({ loaderData }: Route.ComponentProps) {
  const { scenario, items: seedItems } = loaderData;
  const [items, setItems] = useState<FavoriteItem[]>(seedItems);
  const [managing, setManaging] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => clearSelection());
  const [toast, setToast] = useState<{ message: string; removed: FavoriteItem; index: number } | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const allIds = useMemo(() => items.map((item) => item.id), [items]);
  const allSelected = items.length > 0 && selected.size === items.length;

  const dismissToast = useCallback(() => setToast(null), []);

  if (scenario === "loading") return <PageSkeleton cards={8} />;
  if (scenario === "error") return <PageState state="error" onClearHref="/favorites" />;
  if (scenario === "forbidden") return <PageState state="forbidden" onClearHref="/" />;

  const visibleItems = scenario === "empty" ? [] : items;
  const empty = visibleItems.length === 0;

  function exitManage() {
    setManaging(false);
    setSelected(clearSelection());
    setBulkOpen(false);
  }

  function handleToggleManage() {
    if (managing) exitManage();
    else setManaging(true);
  }

  function handleSingleRemove(id: string) {
    const result = removeById(items, id);
    if (!result.removed) return;
    setItems(result.items);
    setSelected((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setToast({ message: "已取消收藏", removed: result.removed, index: result.index });
  }

  function handleUndo() {
    if (!toast) return;
    setItems((current) => insertAt(current, toast.removed, toast.index));
    setToast(null);
  }

  function handleBulkRemove() {
    setItems((current) => removeByIds(current, selected));
    setSelected(clearSelection());
    setBulkOpen(false);
    setManaging(false);
    setToast(null);
  }

  return (
    <div className="page-shell account-page">
      <AccountTabs />
      <header className="account-heading">
        <div>
          <p className="eyebrow">ACCOUNT / FAVORITES</p>
          <h1>我的收藏</h1>
          <p>{empty ? "还没有收藏内容" : `共 ${visibleItems.length} 项收藏`}</p>
        </div>
        {!empty ? (
          <button className="button secondary" type="button" onClick={handleToggleManage}>
            {managing ? "完成" : "管理"}
          </button>
        ) : null}
      </header>

      {empty ? (
        <section className="account-empty" aria-live="polite">
          <Bookmark aria-hidden="true" size={40} />
          <h2>还没有收藏</h2>
          <p>浏览剧集或电影，把想看的内容加入收藏。</p>
          <div className="button-row">
            <PrototypeLink className="button primary" to="/series">
              <Tv size={18} aria-hidden="true" />
              浏览剧集
            </PrototypeLink>
            <PrototypeLink className="button secondary" to="/movies">
              <Film size={18} aria-hidden="true" />
              浏览电影
            </PrototypeLink>
          </div>
        </section>
      ) : (
        <>
          {managing ? (
            <div className="manage-toolbar">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? clearSelection() : selectAllIds(allIds))}
                />
                <span>{allSelected ? "取消全选" : "全选"}</span>
              </label>
              <span className="manage-count">已选 {selected.size} 项</span>
            </div>
          ) : null}

          <div className="favorites-grid">
            {visibleItems.map((item) => {
              const checked = selected.has(item.id);
              return (
                <article key={item.id} className={`favorite-card${managing ? " managing" : ""}${checked ? " selected" : ""}`}>
                  {managing ? (
                    <label className="select-checkbox">
                      <input
                        type="checkbox"
                        checked={checked}
                        aria-label={`选择 ${item.title}`}
                        onChange={() => setSelected((current) => toggleSelection(current, item.id))}
                      />
                    </label>
                  ) : null}
                  <PrototypeLink className="favorite-card-link" to={item.href} tabIndex={managing ? -1 : undefined}>
                    <TitleCard
                      id={item.id}
                      title={item.title}
                      originalTitle={item.originalTitle}
                      eyebrow={item.kind === "series" ? "SERIES" : "FILM"}
                    />
                    <div className="favorite-card-copy">
                      <h2>{item.title}</h2>
                      <p>{item.meta}</p>
                      <p className="media-meta">{formatFavoritedLabel(item.favoritedAt)}</p>
                    </div>
                  </PrototypeLink>
                  {!managing ? (
                    <button
                      className="icon-button favorite-remove"
                      type="button"
                      aria-label={`取消收藏 ${item.title}`}
                      onClick={() => handleSingleRemove(item.id)}
                    >
                      <X aria-hidden="true" size={18} />
                    </button>
                  ) : null}
                  {!managing && item.playHref ? (
                    <PrototypeLink className="favorite-card-play" to={item.playHref}>
                      播放
                    </PrototypeLink>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      )}

      {managing && selected.size > 0 ? (
        <div className="bulk-action-bar" role="region" aria-label="批量操作">
          <span>已选择 {selected.size} 项</span>
          <div className="button-row">
            <button className="button secondary" type="button" onClick={exitManage}>
              取消
            </button>
            <Dialog.Root open={bulkOpen} onOpenChange={setBulkOpen}>
              <Dialog.Trigger className="button primary">取消收藏</Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className="dialog-backdrop" />
                <Dialog.Popup className="confirm-dialog">
                  <Dialog.Title>确认取消收藏？</Dialog.Title>
                  <Dialog.Description>
                    将取消选中的 {selected.size} 项收藏。此操作可在列表中重新添加，但不会自动撤销。
                  </Dialog.Description>
                  <div className="button-row">
                    <Dialog.Close className="button secondary">返回</Dialog.Close>
                    <button className="button primary" type="button" onClick={handleBulkRemove}>
                      确认取消
                    </button>
                  </div>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      ) : null}

      <UndoToast
        open={toast != null}
        message={toast?.message ?? ""}
        onUndo={handleUndo}
        onDismiss={dismissToast}
      />
    </div>
  );
}
