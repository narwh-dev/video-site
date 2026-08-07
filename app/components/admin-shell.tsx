import { Dialog } from "@base-ui/react/dialog";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import {
  Clapperboard,
  FileText,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  MessageSquareText,
  Subtitles,
  User,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { logoutHref, withPrototypeParams } from "../lib/prototype";
import { PrototypeLink } from "./prototype-link";

export type AdminCrumb = { label: string; to?: string };

const navItems = [
  { to: "/admin", label: "仪表盘", icon: LayoutDashboard, end: true },
  { to: "/admin/catalog/series", label: "目录", icon: Library, match: "/admin/catalog" },
  { to: "/admin/sources", label: "来源", icon: Clapperboard },
  { to: "/admin/subtitles", label: "字幕", icon: Subtitles },
  { to: "/admin/danmaku", label: "弹幕审核", icon: MessageSquareText },
  { to: "/admin/audit", label: "审计日志", icon: FileText },
] as const;

function isNavActive(pathname: string, item: (typeof navItems)[number]) {
  if ("end" in item && item.end) return pathname === item.to;
  if ("match" in item && item.match) return pathname.startsWith(item.match);
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function AdminNavLinks({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const location = useLocation();
  return (
    <nav className={compact ? "admin-nav admin-nav-compact" : "admin-nav"} aria-label="管理端导航">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(location.pathname, item);
        return (
          <NavLink
            key={item.to}
            className={active ? "admin-nav-link active" : "admin-nav-link"}
            to={withPrototypeParams(item.to, location.search)}
            aria-current={active ? "page" : undefined}
            aria-label={compact ? item.label : undefined}
            title={item.label}
            onClick={onNavigate}
          >
            <Icon size={20} aria-hidden="true" />
            <span className="admin-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function AdminMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger className="avatar-button admin-user-trigger" aria-label="打开管理员菜单" title="管理员菜单">
        <User aria-hidden="true" size={18} />
        <span>管理员</span>
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={8} align="end">
          <BaseMenu.Popup className="user-menu">
            <BaseMenu.LinkItem render={<PrototypeLink to="/" />}>
              返回公开站点
            </BaseMenu.LinkItem>
            <BaseMenu.Separator />
            <BaseMenu.Item onClick={() => navigate(logoutHref("/", location.search))}>
              <LogOut size={17} aria-hidden="true" />
              退出
            </BaseMenu.Item>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export function AdminShell({
  title,
  breadcrumbs = [],
  children,
  actions,
}: {
  title: string;
  breadcrumbs?: AdminCrumb[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const location = useLocation();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar admin-sidebar-full" aria-label="管理侧栏">
        <div className="admin-brand">
          <strong>管理后台</strong>
          <span>Star Trek China</span>
        </div>
        <AdminNavLinks />
      </aside>
      <aside className="admin-sidebar admin-sidebar-compact" aria-label="管理侧栏">
        <div className="admin-brand compact" aria-hidden="true">
          <Library size={20} />
        </div>
        <AdminNavLinks compact />
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <Dialog.Root>
              <Dialog.Trigger className="icon-button admin-mobile-menu" aria-label="打开管理导航">
                <Menu aria-hidden="true" />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className="dialog-backdrop" />
                <Dialog.Popup className="mobile-sheet admin-sheet">
                  <div className="sheet-header">
                    <Dialog.Title>管理导航</Dialog.Title>
                    <Dialog.Close className="icon-button" aria-label="关闭管理导航">
                      <X aria-hidden="true" />
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sheet-brand">Star Trek China 管理后台</Dialog.Description>
                  <AdminNavLinks />
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
            <div className="admin-topbar-copy">
              {breadcrumbs.length ? (
                <nav className="admin-breadcrumb" aria-label="面包屑">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={`${crumb.label}-${index}`} className="admin-breadcrumb-item">
                      {index > 0 ? <span className="admin-breadcrumb-sep" aria-hidden="true">/</span> : null}
                      {crumb.to ? (
                        <PrototypeLink to={crumb.to}>{crumb.label}</PrototypeLink>
                      ) : (
                        <span aria-current="page">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              ) : null}
              <h1>{title}</h1>
            </div>
          </div>
          <div className="admin-topbar-end">
            {actions}
            <AdminMenu />
          </div>
        </header>
        <div className="admin-workspace" key={location.pathname + location.search}>
          {children}
        </div>
      </div>
    </div>
  );
}
