import React from "react";

import { PAGE_ITEMS } from "../../lib/domain";

export function Sidebar({ activePage, collapsed, onToggle, onNavigate, dataSource, dataMode, currentUser }) {
  const canManageAccounts = ["super_admin", "admin"].includes(currentUser?.role);
  const visibleItems = PAGE_ITEMS.filter((item) => item.key !== "accounts" || canManageAccounts);
  return (
    <aside className={`enterprise-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-mark">墙</span>
        {!collapsed && (
          <div>
            <b>全国墙体广告</b>
          </div>
        )}
      </div>
      <button className="sidebar-collapse" type="button" onClick={onToggle} aria-label={collapsed ? "展开导航" : "折叠导航"}>
        {collapsed ? "›" : "‹"}
      </button>
      <nav className="sidebar-nav" aria-label="后台一级导航">
        {visibleItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activePage === item.key ? "active" : ""}
            onClick={() => onNavigate(item.key)}
            title={item.label}
          >
            <span>{item.icon}</span>
            {!collapsed && <b>{item.label}</b>}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span>{dataMode}</span>
      </div>
    </aside>
  );
}
