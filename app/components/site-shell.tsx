import { Dialog } from "@base-ui/react/dialog";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Bookmark, History, Menu, User, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { getPrototypeParams, loginHref, logoutHref, withPrototypeParams } from "../lib/prototype";
import { PrototypeLink } from "./prototype-link";
import { SearchCommand } from "./search-command";

const nav = [["/", "首页"], ["/series", "剧集"], ["/movies", "电影"]] as const;

function PersonaLink() {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona } = getPrototypeParams(location.search);
  if (persona === "guest") return <NavLink className="button primary header-login" to={loginHref(location.pathname, location.search)}>登录</NavLink>;
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger className="avatar-button" aria-label="打开用户菜单" title="用户菜单"><User aria-hidden="true" size={19} /><span>{persona === "admin" ? "管理员" : "用户"}</span></BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={8} align="end">
          <BaseMenu.Popup className="user-menu">
            <BaseMenu.LinkItem render={<PrototypeLink to="/favorites" />}><Bookmark size={17} />我的收藏</BaseMenu.LinkItem>
            <BaseMenu.LinkItem render={<PrototypeLink to="/history" />}><History size={17} />观看历史</BaseMenu.LinkItem>
            <BaseMenu.Separator />
            <BaseMenu.Item onClick={() => navigate(logoutHref(location.pathname, location.search))}><User size={17} />退出登录</BaseMenu.Item>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export function SiteHeader() {
  const location = useLocation();
  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink className="brand" to={withPrototypeParams("/", location.search)} aria-label="Star Trek China 首页"><strong>Star Trek China</strong><span>星际迷航中国</span></NavLink>
        <nav className="desktop-nav" aria-label="主导航">{nav.map(([to, label]) => <NavLink key={to} to={withPrototypeParams(to, location.search)} end={to === "/"}>{label}</NavLink>)}</nav>
        <div className="header-actions">
          <div className="desktop-search"><SearchCommand /></div>
          <div className="mobile-search"><SearchCommand compact /></div>
          <NavLink className="icon-button desktop-only" to={withPrototypeParams("/favorites", location.search)} aria-label="我的收藏" title="我的收藏"><Bookmark aria-hidden="true" size={20} /></NavLink>
          <div className="desktop-only"><PersonaLink /></div>
          <Dialog.Root>
            <Dialog.Trigger className="icon-button mobile-menu-trigger" aria-label="打开导航菜单"><Menu aria-hidden="true" /></Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="dialog-backdrop" />
              <Dialog.Popup className="mobile-sheet">
                <div className="sheet-header"><Dialog.Title>导航</Dialog.Title><Dialog.Close className="icon-button" aria-label="关闭导航菜单"><X aria-hidden="true" /></Dialog.Close></div>
                <Dialog.Description className="sheet-brand">Star Trek China / 星际迷航中国</Dialog.Description>
                <nav className="sheet-nav" aria-label="移动端主导航">
                  {nav.map(([to, label]) => <Dialog.Close key={to} render={<NavLink to={withPrototypeParams(to, location.search)} end={to === "/"} />}>{label}</Dialog.Close>)}
                  <Dialog.Close render={<NavLink to={withPrototypeParams("/favorites", location.search)} />}><Bookmark size={20} />我的收藏</Dialog.Close>
                  <Dialog.Close render={<NavLink to={withPrototypeParams("/history", location.search)} />}><History size={20} />观看历史</Dialog.Close>
                </nav>
                <PersonaLink />
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const location = useLocation();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand"><strong>Star Trek China</strong><span>星际迷航中国社区影像档案</span><p>为社区整理系列、电影与单集浏览入口。</p></div>
        <div><h2>浏览</h2><PrototypeLink to="/series">剧集</PrototypeLink><PrototypeLink to="/movies">电影</PrototypeLink><PrototypeLink to="/search">搜索</PrototypeLink></div>
        <div><h2>账户</h2><PrototypeLink to="/favorites">我的收藏</PrototypeLink><PrototypeLink to="/history">观看历史</PrototypeLink><PrototypeLink to={loginHref(location.pathname, location.search)}>登录</PrototypeLink></div>
        <div><h2>关于</h2><a href="https://startrekchina.org">社区主站</a><p>本站为非商业社区项目，内容权利归相应权利人所有。</p></div>
      </div>
    </footer>
  );
}
