import React from "react";

import { getWorkerTeamTypeName } from "../../apiClient";
import { isWorkerEnabled, isWorkerOnline, taskCountForWorker, taskPointId, workerCarNo, workerLastLocationText, workerLastSeenText } from "../../lib/domain";
import { EmptyState } from "../shared/EmptyState";
import { StatusBadge } from "../shared/StatusBadge";

export function WorkerDetailPanel({ worker, tasks = [], points = [], onCopy, onOpen, onEdit, onReset, onToggleEnabled, onDelete }) {
  if (!worker) {
    return (
      <section className="enterprise-card worker-detail-card">
        <div className="enterprise-card-header">
          <div>
            <span>师傅详情</span>
            <h3>请选择一位师傅</h3>
          </div>
        </div>
        <EmptyState title="请选择师傅详情" description="在列表中点击某一行后，这里会显示师傅详情、任务概览和快捷操作。" />
      </section>
    );
  }

  const enabled = isWorkerEnabled(worker);
  const online = isWorkerOnline(worker);
  const workerTasks = tasks.filter((task) => String(task.worker_id || task.workerId) === String(worker.id));
  const pointNames = workerTasks
    .map((task) => points.find((point) => String(point.id) === String(taskPointId(task)))?.title || points.find((point) => String(point.id) === String(taskPointId(task)))?.point_code)
    .filter(Boolean)
    .slice(0, 6);

  return (
    <section className="enterprise-card worker-detail-card">
      <div className="enterprise-card-header">
        <div>
          <span>师傅详情</span>
          <h3>{worker.name}</h3>
        </div>
        <StatusBadge tone={online ? "success" : "neutral"} dot>{online ? "在线" : "离线"}</StatusBadge>
      </div>

      <div className="worker-detail-grid">
        <div><span>手机</span><b>{worker.phone || "未登记"}</b></div>
        <div><span>车牌</span><b>{workerCarNo(worker)}</b></div>
        <div><span>队伍</span><b>{getWorkerTeamTypeName(worker)}</b></div>
        <div><span>链接</span><b>{enabled ? "启用" : "停用"}</b></div>
        <div><span>任务数</span><b>{taskCountForWorker(tasks, worker.id)}</b></div>
        <div><span>最近在线</span><b>{workerLastSeenText(worker)}</b></div>
        <div><span>最近定位</span><b>{workerLastLocationText(worker)}</b></div>
        <div><span>当前状态</span><b>{worker.moving ? "行驶中" : "停留中"}</b></div>
      </div>

      <div className="worker-detail-strip">
        <b>已关联点位</b>
        <div>{pointNames.length ? pointNames.map((name) => <span key={name}>{name}</span>) : <small>暂无任务</small>}</div>
      </div>

      <div className="row-actions enterprise-row-actions worker-detail-actions">
        <button type="button" onClick={() => onCopy?.(worker)}>复制链接</button>
        <button type="button" onClick={() => onOpen?.(worker)}>打开师傅页</button>
        <button type="button" onClick={() => onEdit?.(worker)}>编辑</button>
        <button type="button" onClick={() => onReset?.(worker)}>重置链接</button>
        <button type="button" onClick={() => onToggleEnabled?.(worker)}>{enabled ? "停用" : "启用"}</button>
        <button type="button" className="danger-text" onClick={() => onDelete?.(worker)}>删除师傅</button>
      </div>
    </section>
  );
}
