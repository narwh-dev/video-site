import { Search } from "lucide-react";
import { PrototypeLink } from "../components/prototype-link";
import type { Route } from "./+types/not-found";
import { pageTitle } from "../lib/meta";

export const meta: Route.MetaFunction = () => [{ title: pageTitle("404 · 档案未找到") }];

export default function NotFound() {
  return <section className="state-page"><p className="eyebrow">404 / NOT FOUND</p><h1>没有找到这份档案</h1><p>地址可能已变更，也可能尚未收入社区目录。</p><div className="button-row"><PrototypeLink className="button secondary" to="/search"><Search size={18} />搜索内容</PrototypeLink><PrototypeLink className="button primary" to="/">返回首页</PrototypeLink></div></section>;
}
