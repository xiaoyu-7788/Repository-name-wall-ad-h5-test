import React from "react";

export function TodoPanel({ items, title = "待办提醒", subtitle = "异常优先" }) {
  return (
    <section className="panel-card todo-panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      <div className="todo-list">
        {items.map((item) => (
          <button key={item.label} type="button" onClick={item.onClick}>
            <span>{item.label}</span>
            <b>{item.value}</b>
          </button>
        ))}
      </div>
    </section>
  );
}
