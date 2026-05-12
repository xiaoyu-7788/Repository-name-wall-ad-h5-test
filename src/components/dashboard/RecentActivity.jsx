import React from "react";

import { cnTime } from "../../lib/domain";

export function RecentActivity({ items }) {
  return (
    <section className="panel-card activity-panel">
      <div className="panel-head">
        <h2>最近动态</h2>
        <span>{items.length} 条</span>
      </div>
      <div className="activity-list">
        {items.map((item, index) => (
          <article key={`${item.type}-${item.at}-${index}`}>
            <i>{item.type}</i>
            <div>
              <b>{item.title}</b>
              <span>{item.meta} · {cnTime(item.at)}</span>
            </div>
          </article>
        ))}
        {!items.length && <div className="empty compact">暂无运行动态。</div>}
      </div>
    </section>
  );
}
