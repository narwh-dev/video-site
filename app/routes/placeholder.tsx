import { ArrowLeft, Construction } from "lucide-react";
import { useLocation } from "react-router";
import { PrototypeLink } from "../components/prototype-link";
import type { Route } from "./+types/placeholder";
import { pageTitle } from "../lib/meta";

const previewTitles = { login: "登录功能预览", favorites: "收藏功能预览", history: "观看历史功能预览", watch: "播放功能预览" } as const;

export function meta({ location }: Route.MetaArgs) {
  const key = Object.keys(previewTitles).find((item) => location.pathname.includes(item)) as keyof typeof previewTitles | undefined;
  return [{ title: pageTitle(key ? previewTitles[key] : "功能预览") }];
}

export default function Placeholder() {
  const location = useLocation();
  const labels: Record<string, string> = { login: "登录", favorites: "我的收藏", history: "观看历史", watch: "播放体验" };
  const key = Object.keys(labels).find((item) => location.pathname.includes(item)) ?? "watch";
  return <section className="state-page placeholder-page"><Construction aria-hidden="true" /><p className="eyebrow">NEXT PROTOTYPE BATCH</p><h1>{labels[key]}将在后续批次完成</h1><p>当前 P1 聚焦浏览路径。此临时入口保留了完整导航关系，不会形成死链。</p><div className="button-row"><button className="button secondary" type="button" onClick={() => history.back()}><ArrowLeft size={18} />返回上一页</button><PrototypeLink className="button primary" to="/">返回首页</PrototypeLink></div></section>;
}
