import React from "react";

export function EmptyState({ title = "暂无数据", description = "调整筛选条件或新增数据后会在这里显示。", action }) {
  return (
    <div className="empty-state">
      <span>∅</span>
      <b>{title}</b>
      <p>{description}</p>
      {action}
    </div>
  );
}
