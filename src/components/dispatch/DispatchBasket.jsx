import React from "react";

import { getPointAnomalies, pointMaterialCompletion } from "../../lib/domain";

export function DispatchBasket({ points, selectedIds, setSelectedIds, photos = [], tasks = [], projects = [] }) {
  const selected = points.filter((point) => selectedIds.includes(point.id));
  return (
    <section className="dispatch-column dispatch-basket">
      <div className="panel-head">
        <h2>待派单篮子</h2>
        <span>{selected.length} 个</span>
      </div>
      <div className="basket-list">
        {selected.map((point) => (
          <article key={point.id}>
            <div>
              <b>{point.title}</b>
              <small>{point.address}</small>
              <small>{pointMaterialCompletion(point, photos, projects).status} · {getPointAnomalies(point, photos, tasks, projects).slice(0, 2).join("、") || "暂无异常"}</small>
            </div>
            <button type="button" onClick={() => setSelectedIds((current) => current.filter((id) => id !== point.id))}>移除</button>
          </article>
        ))}
        {!selected.length && <div className="empty compact">从左侧点位池勾选点位。</div>}
      </div>
      <div className="dispatch-actions">
        <button type="button" onClick={() => setSelectedIds(points.map((point) => point.id))}>全选</button>
        <button type="button" onClick={() => setSelectedIds([])}>清空</button>
        <button type="button" onClick={() => setSelectedIds(points.filter((point) => !selectedIds.includes(point.id)).map((point) => point.id))}>反选</button>
      </div>
    </section>
  );
}
