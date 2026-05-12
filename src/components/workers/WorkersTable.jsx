import React from "react";

import {
  buildWorkerUrl,
  isWorkerEnabled,
  isWorkerOnline,
  taskCountForWorker,
  workerCarNo,
  workerLastLocationText,
  workerLastSeenText,
} from "../../lib/domain";
import { getWorkerTeamTypeName } from "../../apiClient";
import { EmptyState } from "../shared/EmptyState";
import { StatusBadge } from "../shared/StatusBadge";

export function WorkersTable({
  workers,
  tasks,
  selectedWorkerId,
  setSelectedWorkerId,
  onCopy,
  onOpen,
  onEdit,
  onReset,
  onToggleEnabled,
  onDelete,
}) {
  if (!workers.length) return <EmptyState title="暂无师傅" description="可新增师傅，或调整搜索筛选条件。" />;

  return (
    <div className="enterprise-table-wrap worker-table">
      <table className="enterprise-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>车牌号</th>
            <th>队伍类型</th>
            <th>在线状态</th>
            <th>链接状态</th>
            <th>当前任务数</th>
            <th>最近在线时间</th>
            <th>最近定位时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => {
            const enabled = isWorkerEnabled(worker);
            const online = isWorkerOnline(worker);
            return (
              <tr key={worker.id} className={selectedWorkerId === worker.id ? "selected-row" : ""} onClick={() => setSelectedWorkerId(worker.id)}>
                <td><b>{worker.name}</b></td>
                <td>{worker.phone || "未登记"}</td>
                <td>{workerCarNo(worker)}</td>
                <td>{getWorkerTeamTypeName(worker)}</td>
                <td><StatusBadge tone={online ? "success" : "neutral"} dot>{online ? "在线" : "离线"}</StatusBadge></td>
                <td><StatusBadge tone={enabled ? "info" : "danger"}>{enabled ? "链接启用" : "链接停用"}</StatusBadge></td>
                <td>{taskCountForWorker(tasks, worker.id)}</td>
                <td>{workerLastSeenText(worker)}</td>
                <td>{workerLastLocationText(worker)}</td>
                <td>
                  <div className="row-actions worker-row-actions">
                    <button type="button" onClick={(event) => { event.stopPropagation(); onCopy(worker); }}>复制链接</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(worker); }}>打开师傅端</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(worker); }}>编辑</button>
                    <details onClick={(event) => event.stopPropagation()}>
                      <summary>更多</summary>
                      <button type="button" onClick={() => onReset(worker)}>重置链接</button>
                      <button type="button" onClick={() => onToggleEnabled(worker)}>{enabled ? "停用师傅" : "启用师傅"}</button>
                      <button type="button" className="danger-text" onClick={() => onDelete(worker)}>删除师傅</button>
                      <small>{buildWorkerUrl(worker)}</small>
                    </details>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
