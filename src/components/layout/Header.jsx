import React from "react";

import { PAGE_ITEMS, calculateDashboard, normalizeProjects } from "../../lib/domain";

export function Header({
  activePage,
  activeProject,
  setActiveProject,
  projects,
  data,
  onRefresh,
  onSearchFocus,
  timeRange = "近7天",
  setTimeRange,
  globalSearch = "",
  setGlobalSearch,
  onQuickAction,
  currentUser,
  onLogout,
}) {
  const page = PAGE_ITEMS.find((item) => item.key === activePage) || PAGE_ITEMS[0];
  const projectList = normalizeProjects(projects, data.points);
  const stats = calculateDashboard(data, activeProject);
  const isPointsPage = activePage === "points";

  return (
    <header className="enterprise-header">
      <div className="header-title">
        <span>后台 / {page.label}</span>
        <h1>{page.label}</h1>
      </div>
      {isPointsPage ? (
        <div className="header-actions">
          <div className="pointsHeaderActions">
            <button type="button" onClick={() => window.alert("标签管理入口已保留，后续可接入现有标签逻辑。")}>标签管理</button>
            <button type="button" onClick={() => onQuickAction?.("batch-import")}>批量导入</button>
            <button className="blue-button" type="button" onClick={() => onQuickAction?.("new-point")}>新增点位</button>
          </div>
          <div className="user-menu">
            <button className="avatar-button" type="button" aria-label="当前用户">{currentUser?.username?.slice(0, 1) || "管"}</button>
            <div>
              <b>{currentUser?.username || "管理员"}</b>
              <span>{currentUser?.role || "admin"}</span>
            </div>
            <button className="logout-button" type="button" onClick={onLogout}>退出</button>
          </div>
        </div>
      ) : (
        <div className="header-actions">
          <label className="header-project">
            <span>当前项目</span>
            <select value={activeProject} onChange={(event) => setActiveProject(event.target.value)}>
              {projectList.map((project) => (
                <option key={project.id || project.name} value={project.id === "all" ? "all" : project.name}>{project.name}</option>
              ))}
            </select>
          </label>
          <label className="header-project time-range-select">
            <span>时间范围</span>
            <select value={timeRange} onChange={(event) => setTimeRange?.(event.target.value)}>
              {["今天", "近7天", "本月"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="header-search">
            <span>全局搜索</span>
            <input
              value={globalSearch}
              onFocus={onSearchFocus}
              onChange={(event) => setGlobalSearch?.(event.target.value)}
              placeholder="点位编号 / 地址 / 师傅 / 项目"
            />
          </label>
          <div className="quick-action-strip" aria-label="高频快捷动作">
            <button type="button" aria-label="快捷新增点位" onClick={() => onQuickAction?.("new-point")}>新增点位</button>
            <button type="button" aria-label="快捷批量导入" onClick={() => onQuickAction?.("batch-import")}>批量导入</button>
            <button type="button" aria-label="快捷快速派单" onClick={() => onQuickAction?.("quick-dispatch")}>快速派单</button>
            <button type="button" aria-label="快捷新增师傅" onClick={() => onQuickAction?.("new-worker")}>新增师傅</button>
            <button type="button" aria-label="快捷批量下载素材" onClick={() => onQuickAction?.("download-media")}>批量下载素材</button>
          </div>
          <button className="icon-button soft" type="button" onClick={onRefresh} aria-label="刷新">↻</button>
          <div className="header-status">
            <span>在线师傅 <b>{stats.onlineWorkers}</b></span>
            <span>施工中 <b>{stats.doing}</b></span>
          </div>
          <div className="user-menu">
            <button className="avatar-button" type="button" aria-label="当前用户">{currentUser?.username?.slice(0, 1) || "管"}</button>
            <div>
              <b>{currentUser?.username || "管理员"}</b>
              <span>{currentUser?.role || "admin"}</span>
            </div>
            <button className="logout-button" type="button" onClick={onLogout}>退出</button>
          </div>
        </div>
      )}
    </header>
  );
}
