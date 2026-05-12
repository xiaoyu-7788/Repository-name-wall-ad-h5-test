import React from "react";

export function StatusBadge({ children, tone = "neutral", dot = false, className = "" }) {
  return (
    <span className={`status-badge ${tone} ${dot ? "with-dot" : ""} ${className}`}>
      {dot && <i aria-hidden="true" />}
      {children}
    </span>
  );
}

export function StatusPill({ status }) {
  const value = status || "待派单";
  const tone = value === "已完成"
    ? "success"
    : value === "需复查"
      ? "danger"
      : ["已派单", "待施工", "施工中", "已上传素材", "待验收"].includes(value)
        ? "info"
        : "warning";
  return <StatusBadge tone={tone}>{value}</StatusBadge>;
}
