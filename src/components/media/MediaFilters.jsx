import React from "react";

import { MEDIA_TABS } from "../../lib/domain";

export function MediaFilters({ projects, workers, filters, setFilters, points, onExport, onDownload, onManifest }) {
  return (
    <section className="table-toolbar media-toolbar">
      <div className="toolbar-actions">
        <button type="button" onClick={onDownload}>批量下载 ZIP</button>
        <button type="button" onClick={onManifest}>导出归档清单</button>
        <button type="button" onClick={onExport}>导出清单</button>
      </div>
      <div className="toolbar-filters">
        <select value={filters.project} onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}>
          {projects.map((project) => <option key={project.id || project.name} value={project.id === "all" ? "all" : project.name}>{project.name}</option>)}
        </select>
        <select value={filters.pointId} onChange={(event) => setFilters((current) => ({ ...current, pointId: event.target.value }))}>
          <option value="all">全部点位</option>
          {points.map((point) => <option key={point.id} value={point.id}>{point.title}</option>)}
        </select>
        <select value={filters.kind} onChange={(event) => setFilters((current) => ({ ...current, kind: event.target.value }))}>
          {["全部素材", ...MEDIA_TABS].map((item) => <option key={item}>{item}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
        <select value={filters.timeRange} onChange={(event) => setFilters((current) => ({ ...current, timeRange: event.target.value }))}>
          {["全部时间", "今天", "近7天", "本月"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={filters.workerId} onChange={(event) => setFilters((current) => ({ ...current, workerId: event.target.value }))}>
          <option value="all">全部师傅</option>
          {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
          {["全部状态", "齐套", "待补全", "无素材", "已分类", "待分类"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <input value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="搜索点位 / 地址 / 师傅 / 文件" />
      </div>
    </section>
  );
}
