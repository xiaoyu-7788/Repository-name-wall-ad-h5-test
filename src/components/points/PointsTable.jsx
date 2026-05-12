import React from "react";

import {
  cnTime,
  getCaptainName,
  getPointAnomalies,
  getPointStatus,
  getProjectName,
  getScoutName,
  assignedWorkersForPoint,
  pointMaterialCompletion,
  isPointReadyForAcceptance,
} from "../../lib/domain";
import { EmptyState } from "../shared/EmptyState";
import { StatusPill } from "../shared/StatusBadge";

export function PointsTable({
  points,
  photos,
  selectedIds,
  setSelectedIds,
  sort,
  setSort,
  onView,
  onEdit,
  onSite,
  onDispatch,
  onMedia,
  onAcceptance,
  onDelete,
  tasks = [],
  projects = [],
  workers = [],
}) {
  function toggleAll(checked) {
    setSelectedIds(checked ? points.map((point) => point.id) : []);
  }

  function toggleSort(key) {
    setSort((current) => ({
      key,
      dir: current.key === key && current.dir === "asc" ? "desc" : "asc",
    }));
  }

  if (!points.length) return <EmptyState title="暂无点位" description="当前筛选没有点位，可新增或导入点位。" />;

  return (
    <div className="enterprise-table-wrap points-table">
      <table className="enterprise-table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={points.every((point) => selectedIds.includes(point.id))} onChange={(event) => toggleAll(event.target.checked)} /></th>
            <th><button type="button" onClick={() => toggleSort("title")}>点位编号</button></th>
            <th><button type="button" onClick={() => toggleSort("project")}>项目</button></th>
            <th>地址</th>
            <th>K码</th>
            <th><button type="button" onClick={() => toggleSort("status")}>状态</button></th>
            <th>房东</th>
            <th>当前师傅</th>
            <th>必传素材完成</th>
            <th>缺什么素材</th>
            <th>可验收</th>
            <th>施工队长</th>
            <th>找墙队伍</th>
            <th><button type="button" onClick={() => toggleSort("updated")}>最近更新时间</button></th>
            <th>异常状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => {
            const anomalies = getPointAnomalies(point, photos, tasks, projects);
            const assigned = assignedWorkersForPoint(point, tasks, workers);
            const completion = pointMaterialCompletion(point, photos, projects);
            const ready = isPointReadyForAcceptance(point, photos, projects);
            return (
              <tr key={point.id}>
                <td><input type="checkbox" checked={selectedIds.includes(point.id)} onChange={() => setSelectedIds((current) => current.includes(point.id) ? current.filter((id) => id !== point.id) : [...current, point.id])} /></td>
                <td><b>{point.title || point.id}</b></td>
                <td>{getProjectName(point)}</td>
                <td className="wide-cell">{point.address || "未登记"}</td>
                <td>{point.k_code || "未登记"}</td>
                <td><StatusPill status={getPointStatus(point)} /></td>
                <td>{point.landlord_name || "未登记"}</td>
                <td>{assigned.length ? assigned.map((worker) => worker.name).join("、") : "未派单"}</td>
                <td>
                  <div className="material-completion-cell">
                    <b>{completion.status}</b>
                    <span>{completion.completedCount}/{completion.requiredCount} · {completion.ratio}%</span>
                  </div>
                </td>
                <td>
                  <div className="anomaly-chip-list material-missing-list">
                    {completion.missing.length ? completion.missing.map((item) => <span key={item}>缺{item}</span>) : <span className="ok">已齐套</span>}
                  </div>
                </td>
                <td><span className={`status-badge ${ready ? "success" : "warning"}`}>{ready ? "可验收" : "待补齐"}</span></td>
                <td>{getCaptainName(point)}</td>
                <td>{getScoutName(point)}</td>
                <td>{cnTime(point.updated_at || point.created_at)}</td>
                <td>
                  <div className="anomaly-chip-list">
                    {anomalies.length ? anomalies.slice(0, 3).map((item) => <span key={item}>{item}</span>) : <span className="ok">正常</span>}
                    {anomalies.length > 3 && <span>+{anomalies.length - 3}</span>}
                  </div>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => onView(point)}>查看</button>
                    <button type="button" onClick={() => onEdit(point)}>编辑</button>
                    <button type="button" onClick={() => onSite(point)}>现场查看</button>
                    <button type="button" onClick={() => onDispatch(point)}>派单</button>
                    <button type="button" onClick={() => onMedia(point)}>素材</button>
                    <button type="button" onClick={() => onAcceptance(point)}>验收</button>
                    <button type="button" className="danger-text" onClick={() => onDelete(point)}>删除</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="table-sort-hint">排序：{sort.key} / {sort.dir === "asc" ? "升序" : "降序"}</div>
    </div>
  );
}
