import React, { useState } from "react";

import { getWorkerTeamTypeName } from "../../apiClient";
import {
  buildWorkerUrl,
  getPointStatus,
  isWorkerEnabled,
  isWorkerMoving,
  isWorkerOnline,
  taskCountForWorker,
  taskPointId,
  workerCarNo,
  workerLastLocationText,
  workerLastSeenText,
} from "../../lib/domain";
import { StatusBadge, StatusPill } from "../shared/StatusBadge";

export function WorkerDetailPanel({ worker, tasks, points, onCopy, onOpen, onEdit, onReset, onToggleEnabled, onDelete }) {
  const [tab, setTab] = useState("基本信息");
  if (!worker) {
    return <aside className="worker-detail-panel empty">选择一位师傅查看详情。</aside>;
  }
  const workerTasks = tasks.filter((task) => (task.worker_id || task.workerId) === worker.id);
  const taskPoints = workerTasks.map((task) => points.find((point) => point.id === taskPointId(task))).filter(Boolean);

  return (
    <aside className="worker-detail-panel">
      <div className="worker-detail-head">
        <div>
          <h2>{worker.name}</h2>
          <p>{worker.phone || "未登记手机号"} · {workerCarNo(worker)}</p>
        </div>
        <StatusBadge tone={isWorkerOnline(worker) ? "success" : "neutral"} dot>{isWorkerOnline(worker) ? "在线" : "离线"}</StatusBadge>
      </div>
      <div className="worker-primary-actions">
        <button className="blue-button" type="button" onClick={() => onCopy(worker)}>复制链接</button>
        <button type="button" onClick={() => onOpen(worker)}>打开师傅端</button>
        <button type="button" onClick={() => onEdit(worker)}>编辑</button>
      </div>
      <div className="worker-secondary-actions">
        <button type="button" onClick={() => onReset(worker)}>重置链接</button>
        <button type="button" className={isWorkerEnabled(worker) ? "disable-worker-button" : "enable-worker-button"} onClick={() => onToggleEnabled(worker)}>{isWorkerEnabled(worker) ? "停用师傅" : "启用师傅"}</button>
        <button type="button" className="delete-worker-button" onClick={() => onDelete(worker)}>删除师傅</button>
      </div>
      <div className="detail-tabs">
        {["基本信息", "任务", "定位"].map((item) => <button key={item} type="button" className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
      </div>
      {tab === "基本信息" && (
        <div className="detail-grid single">
          <div><span>姓名</span><b>{worker.name}</b></div>
          <div><span>手机号</span><b>{worker.phone || "未登记"}</b></div>
          <div><span>车牌号</span><b>{workerCarNo(worker)}</b></div>
          <div><span>队伍类型</span><b>{getWorkerTeamTypeName(worker)}</b></div>
          <div><span>在线/离线</span><b>{isWorkerOnline(worker) ? "在线" : "离线"}</b></div>
          <div><span>链接启用/停用</span><b>{isWorkerEnabled(worker) ? "链接启用" : "链接停用"}</b></div>
          <div><span>最后在线</span><b>{workerLastSeenText(worker)}</b></div>
          <div><span>当前任务数</span><b>{taskCountForWorker(tasks, worker.id)}</b></div>
          <div><span>当前定位</span><b>{worker.lng || "-"}, {worker.lat || "-"}</b></div>
          <div><span>最近定位</span><b>{workerLastLocationText(worker)}</b></div>
          <div><span>后台复制链接</span><b>{buildWorkerUrl(worker)}</b></div>
        </div>
      )}
      {tab === "任务" && (
        <div className="worker-task-list">
          <div className="worker-snapshot compact">
            <div><span>已派单</span><b>{taskPoints.length}</b></div>
            <div><span>施工中</span><b>{taskPoints.filter((point) => getPointStatus(point) === "施工中").length}</b></div>
            <div><span>已完成</span><b>{taskPoints.filter((point) => getPointStatus(point) === "已完成").length}</b></div>
          </div>
          {taskPoints.slice(0, 12).map((point) => (
            <article key={point.id}>
              <b>{point.title}</b>
              <span>{point.address}</span>
              <StatusPill status={getPointStatus(point)} />
            </article>
          ))}
          {!taskPoints.length && <div className="empty compact">暂无派单任务。</div>}
        </div>
      )}
      {tab === "定位" && (
        <div className="detail-grid single">
          <div><span>最近坐标</span><b>{worker.lng || "-"}, {worker.lat || "-"}</b></div>
          <div><span>移动状态</span><b>{isWorkerMoving(worker) ? "移动中" : "停止"}</b></div>
          <div><span>速度</span><b>{Math.round(Number(worker.speed || 0))} km/h</b></div>
          <div><span>最近上报时间</span><b>{workerLastLocationText(worker)}</b></div>
          <div><span>轨迹记录</span><b>已预留轨迹播放入口</b></div>
        </div>
      )}
    </aside>
  );
}
