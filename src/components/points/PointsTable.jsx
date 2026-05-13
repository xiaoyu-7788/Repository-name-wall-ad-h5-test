import React from "react";

import {
  cnTime,
  getPointAnomalies,
  getPointDisplayModel,
  getPointStatus,
  getPointUpdatedAt,
  pointMaterialCompletion,
  pointTags,
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
      if (!checked) return current.filter((id) => !points.some((point) => point.id === id));
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

  function runMenuAction(event, callback) {
    event.stopPropagation();
    callback();
    const details = event.currentTarget.closest("details");
    if (details) details.open = false;
  }

  if (!points.length) {
    return <EmptyState title="暂无点位" description="当前筛选结果为空，可继续调整条件或新增点位。" />;
  }

  const allChecked = points.length > 0 && points.every((point) => selectedIds.includes(point.id));

  return (
    <section className="pointTableWrap">
      <div className="enterprise-table-wrap">
        <table className="enterprise-table pointTable">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input type="checkbox" checked={allChecked} onChange={(event) => toggleAll(event.target.checked)} aria-label="全选点位" />
              </th>
              <th><button type="button" onClick={() => toggleSort("title")}>点位编号</button></th>
              <th><button type="button" onClick={() => toggleSort("project")}>项目 / 标签</button></th>
              <th>地址 / K码</th>
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
              const mapped = getPointDisplayModel(point, { projects, tasks, workers });
              const anomalies = getPointAnomalies(point, photos, tasks, projects);
              const completion = pointMaterialCompletion(point, photos, projects);
              const tags = pointTags(point, photos).filter((tag) => tag !== mapped.projectName).slice(0, 2);

              return (
                <tr key={point.id} className={selected ? "selected-row" : ""} onClick={() => togglePoint(point.id)}>
                  <td className="checkbox-col" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => togglePoint(point.id)}
                      aria-label={`选择点位 ${mapped.code}`}
                    />
                  </td>
                  <td>
                    <div className="pointCodeCell">
                      <strong>{mapped.code}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="projectCell">
                      <strong>{mapped.projectName}</strong>
                      <span>{tags.length ? tags.join(" / ") : "未登记标签"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="addressCell">
                      <strong>{mapped.address}</strong>
                      <span>K码：{mapped.kCode}</span>
                    </div>
                  </td>
                  <td>
                    <div className="workerCell">
                      <strong>{mapped.currentWorkerName}</strong>
                      <span>施工队长：{mapped.captainName}</span>
                      <span>找墙队伍：{mapped.scoutName}</span>
                    </div>
                  </td>
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
                    <div className="rowActions pointRowActions">
                      <button className="primaryActionButton" type="button" onClick={() => onView(point)}>查看</button>
                      <button className="secondaryActionButton" type="button" onClick={() => onEdit(point)}>编辑</button>
                      <details className="pointActionMenu">
                        <summary className="tertiaryActionButton">更多</summary>
                        <div className="pointActionList">
                          <button type="button" onClick={(event) => runMenuAction(event, () => onSite(point))}>现场查看</button>
                          <button type="button" onClick={(event) => runMenuAction(event, () => onDispatch(point))}>派单</button>
                          <button type="button" onClick={(event) => runMenuAction(event, () => onMedia(point))}>素材</button>
                          <button type="button" onClick={(event) => runMenuAction(event, () => onAcceptance(point))}>验收</button>
                          <button type="button" className="danger-text" onClick={(event) => runMenuAction(event, () => onDelete(point))}>删除</button>
                        </div>
                      </details>
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
