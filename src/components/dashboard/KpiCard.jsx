import React from "react";

export function KpiCard({ label, value, hint, tone = "blue" }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <span>{label}</span>
      <b>{value}</b>
      <small>{hint}</small>
    </article>
  );
}
