import React from "react";

import { STATUS } from "../../lib/domain";

const ANOMALY_OPTIONS = [
  "异常筛选",
  "未派单",
  "缺现场照片",
  "缺720 全景",
  "缺水印照片",
  "缺凯立德图片",
  "缺墙租协议图片",
  "缺视频",
];

const TIME_OPTIONS = ["全部时间", "今天", "近7天", "本月"];

export function PointFilters({ projects, workers, tags, filters, setFilters, onBatchTag, onBatchRemoveTag, onImportTemplate }) {
  return (
    <section className="pointToolbar" aria-label="点位管理工具栏">
      <label className="pointToolbarSearch">
        <span>搜索</span>
        <input
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
          placeholder="搜索点位编号 / 地址 / 项目 / 师傅"
        />
      </label>
      <label>
        <span>项目</span>
        <select value={filters.project} onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value, page: 1 }))}>
          {projects.map((project) => <option key={project.id || project.name} value={project.id === "all" ? "all" : project.name}>{project.name}</option>)}
        </select>
      </label>
      <label>
        <span>状态</span>
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
          {["全部状态", ...STATUS].map((item) => <option key={item}>{item}</option>)}
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
          {TIME_OPTIONS.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <div className="pointToolbarActions">
        <button type="button" onClick={onBatchTag}>批量打标签</button>
        <button type="button" onClick={onBatchRemoveTag}>批量移除标签</button>
        <button type="button" onClick={onImportTemplate}>导入模板</button>
      </div>
    </section>
  );
}
