import React from "react";

import { STATUS } from "../../lib/domain";

export function MapToolbar({
  projects,
  activeProject,
  setActiveProject,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  anomalyFilter,
  setAnomalyFilter,
  viewMode,
  setViewMode,
  selectionMode,
  setSelectionMode,
  mapMode,
  setMapMode,
  showPoints,
  setShowPoints,
  showWorkers,
  setShowWorkers,
  showLabels,
  setShowLabels,
  onlineOnly,
  setOnlineOnly,
  currentProjectOnly,
  setCurrentProjectOnly,
}) {
  return (
    <section className="map-toolbar">
      <select value={activeProject} onChange={(event) => setActiveProject(event.target.value)}>
        {projects.map((project) => <option key={project.id || project.name} value={project.id === "all" ? "all" : project.name}>{project.name}</option>)}
      </select>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索点位、地址、K码、师傅" />
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
        {["全部", ...STATUS].map((item) => <option key={item}>{item}</option>)}
      </select>
      <select value={anomalyFilter} onChange={(event) => setAnomalyFilter(event.target.value)}>
        {["全部异常", "未派单", "缺现场照片", "缺720 全景", "缺水印照片", "缺凯立德图片", "缺墙租协议图片"].map((item) => <option key={item}>{item}</option>)}
      </select>
      <div className="segmented wide">
        <button type="button" className={viewMode === "dispatch" ? "active" : ""} onClick={() => setViewMode("dispatch")}>调度视图</button>
        <button type="button" className={viewMode === "acceptance" ? "active" : ""} onClick={() => setViewMode("acceptance")}>验收视图</button>
        <button type="button" className={viewMode === "track" ? "active" : ""} onClick={() => setViewMode("track")}>轨迹回放</button>
      </div>
      <div className="segmented wide">
        <button type="button" className={selectionMode === "browse" ? "active" : ""} onClick={() => setSelectionMode("browse")}>浏览</button>
        <button type="button" className={selectionMode === "pick" ? "active" : ""} onClick={() => setSelectionMode("pick")}>点选</button>
        <button type="button" className={selectionMode === "rectangle" ? "active" : ""} onClick={() => setSelectionMode("rectangle")}>框选</button>
        <button type="button" className={selectionMode === "circle" ? "active" : ""} onClick={() => setSelectionMode("circle")}>圈选</button>
      </div>
      <div className="segmented">
        <button type="button" className={mapMode === "standard" ? "active" : ""} onClick={() => setMapMode("standard")}>标准图</button>
        <button type="button" className={mapMode === "satellite" ? "active" : ""} onClick={() => setMapMode("satellite")}>卫星图</button>
      </div>
      <label><input type="checkbox" checked={showPoints} onChange={(event) => setShowPoints(event.target.checked)} /> 点位图层</label>
      <label><input type="checkbox" checked={showWorkers} onChange={(event) => setShowWorkers(event.target.checked)} /> 小车图层</label>
      <label><input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} /> 标签</label>
      <label><input type="checkbox" checked={onlineOnly} onChange={(event) => setOnlineOnly(event.target.checked)} /> 仅在线师傅</label>
      <label><input type="checkbox" checked={currentProjectOnly} onChange={(event) => setCurrentProjectOnly(event.target.checked)} /> 当前项目点位</label>
    </section>
  );
}
