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
} from "../../lib/domain";
import { EmptyState } from "../shared/EmptyState";
import { StatusPill } from "../shared/StatusBadge";

function MaterialCell({ completion }) {
  const missingText = completion.missing.length ? `缺${completion.missing.slice(0, 2).join("、")}` : "缺失项已补齐";
  return (
    <div className="materialCell">
      <strong>{completion.completedCount}/{completion.requiredCount} · {completion.ratio}%</strong>
      <span>{missingText}</span>
    </div>
  );
}

function WorkerCell({ point, assigned }) {
  const currentWorker = point?.captain_name || point?.worker_name || point?.install_captain_name || assigned[0]?.name || "未派单";
  const captainName = point?.install_captain_name || point?.captain_name || "未登记";
  const scoutName = point?.scout_name || point?.wall_team_name || "未登记";
  return (
    <div className="workerCell">
      <strong>{currentWorker}</strong>
      <span>施工队长：{captainName}</span>
      <span>找墙队伍：{scoutName}</span>
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
    setSelectedIds((current) => {
      if (!checked) {
        return current.filter((id) => !points.some((point) => point.id === id));
      }
      const merged = new Set([...current, ...points.map((point) => point.id)]);
      return [...merged];
    });
  }

  function togglePoint(pointId) {
    setSelectedIds((current) => current.includes(pointId) ? current.filter((id) => id !== pointId) : [...current, pointId]);
  }

  function toggleSort(key) {
    setSort((current) => ({
      key,
      dir: current.key === key && current.dir === "asc" ? "desc" : "asc",
    }));
  }

  if (!points.length) {
    return <EmptyState title="暂无点位" description="当前筛选结果为空，可继续调整条件或新增点位。" />;
  }

  const allChecked = points.length > 0 && points.every((point) => selectedIds.includes(point.id));

  return (
    <section className="pointTableWrap">
      <div className="enterprise-table-wrap points-table">
        <table className="enterprise-table pointTable">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input type="checkbox" checked={allChecked} onChange={(event) => toggleAll(event.target.checked)} aria-label="全选点位" />
              </th>
              <th><button type="button" onClick={() => toggleSort("title")}>点位编号</button></th>
              <th><button type="button" onClick={() => toggleSort("project")}>项目 / 标签</button></th>
              <th>地址</th>
              <th>师傅 / 队伍</th>
              <th><button type="button" onClick={() => toggleSort("status")}>状态</button></th>
              <th>素材情况</th>
              <th><button type="button" onClick={() => toggleSort("updated")}>最近更新</button></th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => {
              const selected = selectedIds.includes(point.id);
              const assigned = assignedWorkersForPoint(point, tasks, workers);
              const anomalies = getPointAnomalies(point, photos, tasks, projects);
              const completion = pointMaterialCompletion(point, photos, projects);
              const projectName = point?.project_name || point?.project || point?.project_id || getProjectName(point) || "未登记项目";
              const tags = anomalies.length ? anomalies.slice(0, 2).join(" / ") : getPointStatus(point);

              return (
                <tr
                  key={point.id}
                  className={selected ? "selected-row" : ""}
                  onClick={() => togglePoint(point.id)}
                >
                  <td className="checkbox-col" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => togglePoint(point.id)}
                      aria-label={`选择点位 ${getPointCode(point)}`}
                    />
                  </td>
                  <td>
                    <div className="projectCell">
                      <strong>{getPointCode(point)}</strong>
                      <span>{point.k_code || point.id || "未登记"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="projectCell">
                      <strong>{projectName}</strong>
                      <span>{tags || "未登记标签"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="addressCell">
                      <strong>{getPointAddress(point)}</strong>
                      <span>{point.k_code || "K码未登记"}</span>
                    </div>
                  </td>
                  <td><WorkerCell point={point} assigned={assigned} /></td>
                  <td>
                    <div className="statusCell">
                      <StatusPill status={getPointStatus(point)} />
                    </div>
                  </td>
                  <td><MaterialCell completion={completion} /></td>
                  <td>
                    <div className="updateCell">
                      <strong>{cnTime(getPointUpdatedAt(point))}</strong>
                      <span>{anomalies.length ? anomalies.join(" / ") : "无异常"}</span>
                    </div>
                  </td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <div className="rowActions">
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
      </div>
      <div className="table-sort-hint">当前结果已按 {sort.key} {sort.dir === "asc" ? "升序" : "降序"} 排列</div>
    </section>
  );
}
