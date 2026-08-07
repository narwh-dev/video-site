import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import type { Route } from "./+types/root";
import { SiteFooter, SiteHeader } from "./components/site-shell";
import { PrototypeLink } from "./components/prototype-link";
import { SITE_TITLE } from "./lib/meta";
import "./styles.css";

export const links: Route.LinksFunction = () => [];
export const meta: Route.MetaFunction = () => [{ title: SITE_TITLE }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const isWatch = location.pathname.startsWith("/watch/");
  const isAuth = location.pathname === "/login";
  const isAdmin = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const hideChrome = isWatch || isAuth || isAdmin;
  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      {hideChrome ? null : <SiteHeader />}
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      {hideChrome ? null : <SiteFooter />}
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const status = isRouteErrorResponse(error) ? error.status : 500;
  return (
    <div className="state-page">
      <p className="eyebrow">{status}</p>
      <h1>页面暂时无法显示</h1>
      <p>请返回安全入口后重试。</p>
      <PrototypeLink className="button primary" to="/">返回首页</PrototypeLink>
    </div>
  );
}
