import React from "react";

import { getPointStatus, getProjectName, mediaCounts } from "../../lib/domain";
import { StatusPill } from "../shared/StatusBadge";

export function DispatchPointPool({ points, photos, selectedIds, setSelectedIds }) {
  function toggle(pointId) {
    setSelectedIds((current) => current.includes(pointId) ? current.filter((id) => id !== pointId) : [...current, pointId]);
  }

  return (
    <section className="dispatch-column point-pool">
      <div className="panel-head">
        <h2>点位池</h2>
        <span>{points.length} 个</span>
      </div>
      <div className="dispatch-list">
        {points.map((point) => {
          const counts = mediaCounts(point, photos);
          return (
            <article key={point.id} className={selectedIds.includes(point.id) ? "active" : ""}>
              <label>
                <input type="checkbox" checked={selectedIds.includes(point.id)} onChange={() => toggle(point.id)} />
                <span>
                  <b>{point.title}</b>
                  <small>{point.address}</small>
                  <em>{getProjectName(point)} · 照片 {counts.total}</em>
                </span>
              </label>
              <StatusPill status={getPointStatus(point)} />
            </article>
          );
        })}
        {!points.length && <div className="empty compact">当前筛选没有可派点位。</div>}
      </div>
    </section>
  );
}
