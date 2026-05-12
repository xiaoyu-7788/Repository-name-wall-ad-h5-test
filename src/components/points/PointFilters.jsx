import React from "react";

import { STATUS } from "../../lib/domain";

const ANOMALY_OPTIONS = [
  "全部异常",
  "未派单",
  "缺现场照片",
  "缺720 全景",
  "缺水印照片",
  "缺凯立德图片",
  "缺墙租协议图片",
];

export function PointFilters({ projects, workers, filters, setFilters, tags, onNew, onBatch, onExport }) {
  return (
    <section className="points-final-toolbar">
      <div className="points-final-toolbar-top">
        <div className="points-final-toolbar-title">
          <h3>点位筛选</h3>
          <p>按项目、状态、异常、师傅、标签和关键词快速缩小工作范围。</p>
        </div>
        <div className="points-final-toolbar-actions">
          <button className="blue-button" type="button" onClick={onNew}>新增点位</button>
          <button type="button" onClick={onBatch}>批量导入</button>
          <button type="button" onClick={onExport}>导出当前结果</button>
        </div>
      </div>

      <div className="points-final-filter-grid">
        <label>
          <span>项目</span>
          <select value={filters.project} onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value, page: 1 }))}>
            {projects.map((project) => <option key={project.id || project.name} value={project.id === "all" ? "all" : project.name}>{project.name}</option>)}
          </select>
        </label>
        <label>
          <span>状态</span>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
            {["全部", ...STATUS].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>异常</span>
          <select value={filters.anomaly} onChange={(event) => setFilters((current) => ({ ...current, anomaly: event.target.value, page: 1 }))}>
            {ANOMALY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>师傅</span>
          <select value={filters.workerId} onChange={(event) => setFilters((current) => ({ ...current, workerId: event.target.value, page: 1 }))}>
            <option value="all">全部师傅</option>
            {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
          </select>
        </label>
        <label>
          <span>标签</span>
          <select value={filters.tag} onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value, page: 1 }))}>
            <option>全部标签</option>
            {tags.map((tag) => <option key={tag}>{tag}</option>)}
          </select>
        </label>
        <label>
          <span>时间</span>
          <select value={filters.timeRange} onChange={(event) => setFilters((current) => ({ ...current, timeRange: event.target.value, page: 1 }))}>
            {["全部时间", "今天", "近7天", "本月"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="points-final-search">
          <span>搜索</span>
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))} placeholder="搜索编号、地址、K码、房东、队伍" />
        </label>
      </div>
    </section>
  );
}
