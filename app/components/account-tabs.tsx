import { useLocation, NavLink } from "react-router";
import { withPrototypeParams } from "../lib/prototype";

const tabs = [
  { to: "/favorites", label: "我的收藏" },
  { to: "/history", label: "观看历史" },
] as const;

export function AccountTabs() {
  const location = useLocation();
  return (
    <nav className="account-tabs" aria-label="账户内容">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={withPrototypeParams(tab.to, location.search)}
          className={({ isActive }) => (isActive ? "account-tab active" : "account-tab")}
          end
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
