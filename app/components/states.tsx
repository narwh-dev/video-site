import { AlertTriangle, Inbox, RotateCcw } from "lucide-react";
import { PrototypeLink } from "./prototype-link";

export function PageState({ state, onClearHref = "/" }: { state: "empty" | "error"; onClearHref?: string }) {
  const isError = state === "error";
  return (
    <section className="state-page" aria-live="polite">
      {isError ? <AlertTriangle aria-hidden="true" /> : <Inbox aria-hidden="true" />}
      <h1>{isError ? "页面内容载入失败" : "这里暂时没有内容"}</h1>
      <p>{isError ? "其他页面仍可正常浏览，请稍后重试。" : "调整筛选条件，或返回目录继续浏览。"}</p>
      <PrototypeLink className="button secondary" to={onClearHref} preserveScenario={false}><RotateCcw size={18} aria-hidden="true" />{isError ? "重试" : "返回浏览"}</PrototypeLink>
    </section>
  );
}

export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="page-shell" aria-busy="true" aria-label="内容加载中">
      <div className="skeleton heading" />
      <div className="media-grid skeleton-grid">
        {Array.from({ length: cards }, (_, index) => <div className="skeleton poster" key={index} />)}
      </div>
    </div>
  );
}
