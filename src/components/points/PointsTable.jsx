import React from "react";

import {
  cnTime,
  getCaptainName,
  getPointAddress,
  getPointAnomalies,
  getPointCode,
  getPointStatus,
  getPointUpdatedAt,
  getProjectName,
  getScoutName,
  assignedWorkersForPoint,
  pointMaterialCompletion,
  isPointReadyForAcceptance,
} from "../../lib/domain";
import { EmptyState } from "../shared/EmptyState";
import { StatusPill } from "../shared/StatusBadge";

function AcceptanceBadge({ ready }) {
  return <span className={`status-badge ${ready ? "success" : "warning"}`}>{ready ? "可验收" : "待补齐"}</span>;
}

function MaterialCell({ completion }) {
  return (
    <div className="points-final-material">
      <strong>{completion.completedCount}/{completion.requiredCount}</strong>
      <span>{completion.status}</span>
      <em>{completion.ratio}%</em>
    </div>
  );
}

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

  if (!points.length) {
    return <EmptyState title="暂无点位" description="当前筛选结果为空，可继续调整筛选条件或新增点位。" />;
  }

  return (
    <section className="points-final-table-panel">
      <div className="points-final-table-meta">
        <div>
          <h3>Point Management</h3>
          <p>点位列表已直接连接真实数据库，所有查看、编辑和派单动作都保留现有业务链路。</p>
        </div>
        <div className="points-final-table-order">
          <span>排序</span>
          <b>{sort.key} / {sort.dir === "asc" ? "升序" : "降序"}</b>
        </div>
      </div>

      <div className="enterprise-table-wrap points-table points-final-table-wrap">
        <table className="enterprise-table points-final-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input type="checkbox" checked={points.length > 0 && points.every((point) => selectedIds.includes(point.id))} onChange={(event) => toggleAll(event.target.checked)} />
              </th>
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
              <th>操作按钮</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => {
              const anomalies = getPointAnomalies(point, photos, tasks, projects);
              const assigned = assignedWorkersForPoint(point, tasks, workers);
              const completion = pointMaterialCompletion(point, photos, projects);
              const ready = isPointReadyForAcceptance(point, photos, projects);
              const selected = selectedIds.includes(point.id);

              return (
                <tr key={point.id} className={selected ? "selected-row" : ""}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setSelectedIds((current) => current.includes(point.id) ? current.filter((id) => id !== point.id) : [...current, point.id])}
                    />
                  </td>
                  <td>
                    <div className="points-final-code">
                      <strong>{getPointCode(point)}</strong>
                      <span>{point.id}</span>
                    </div>
                  </td>
                  <td><b>{getProjectName(point)}</b></td>
                  <td className="wide-cell">
                    <div className="points-final-address">
                      <strong>{getPointAddress(point)}</strong>
                    </div>
                  </td>
                  <td>{point.k_code || "-"}</td>
                  <td><StatusPill status={getPointStatus(point)} /></td>
                  <td>
                    <div className="points-final-person">
                      <strong>{point.landlord_name || "-"}</strong>
                      <span>{point.landlord_phone || "未登记手机号"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="points-final-person">
                      <strong>{assigned.length ? assigned.map((worker) => worker.name).join("、") : "未派单"}</strong>
                      <span>{assigned.length ? `${assigned.length} 位师傅` : "等待派单"}</span>
                    </div>
                  </td>
                  <td><MaterialCell completion={completion} /></td>
                  <td>
                    <div className="anomaly-chip-list material-missing-list">
                      {completion.missing.length ? completion.missing.map((item) => <span key={item}>缺{item}</span>) : <span className="ok">已齐套</span>}
                    </div>
                  </td>
                  <td><AcceptanceBadge ready={ready} /></td>
                  <td>
                    <div className="points-final-person">
                      <strong>{getCaptainName(point)}</strong>
                      <span>{point.captain_phone || point.install_captain_phone || "未登记手机号"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="points-final-person">
                      <strong>{getScoutName(point)}</strong>
                      <span>{point.scout_phone || point.wall_team_phone || "未登记手机号"}</span>
                    </div>
                  </td>
                  <td>{cnTime(getPointUpdatedAt(point))}</td>
                  <td>
                    <div className="anomaly-chip-list">
                      {anomalies.length ? anomalies.slice(0, 3).map((item) => <span key={item}>{item}</span>) : <span className="ok">正常</span>}
                      {anomalies.length > 3 && <span>+{anomalies.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="row-actions points-final-actions">
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
        <div className="table-sort-hint">当前结果已按 {sort.key} {sort.dir === "asc" ? "升序" : "降序"} 排列</div>
      </div>
    </section>
  );
}
