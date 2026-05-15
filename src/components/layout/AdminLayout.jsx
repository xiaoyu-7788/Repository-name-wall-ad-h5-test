import React from "react";

import { getDataModeLabel } from "../../apiClient";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toast } from "../shared/Toast";

export function AdminLayout({
  activePage,
  activeProject,
  setActiveProject,
  projects,
  data,
  collapsed,
  setCollapsed,
  onNavigate,
  onRefresh,
  onSearchFocus,
  timeRange,
  setTimeRange,
  globalSearch,
  setGlobalSearch,
  onQuickAction,
  currentUser,
  onLogout,
  children,
}) {
  return (
    <main className={`enterprise-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        activePage={activePage}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        onNavigate={onNavigate}
        dataSource={data.dataSource}
        dataMode={getDataModeLabel()}
        currentUser={currentUser}
      />
      <section className="enterprise-main">
        <Header
          activePage={activePage}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          projects={projects}
          data={data}
          onRefresh={onRefresh}
          onSearchFocus={onSearchFocus}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onQuickAction={onQuickAction}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        {data.loading && <section className="loading-strip"><span /></section>}
        <div className="page-fade" key={activePage}>{children}</div>
      </section>
      <Toast message={data.message} />
    </main>
  );
}
