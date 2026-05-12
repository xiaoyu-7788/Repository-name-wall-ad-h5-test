import React from "react";

export function Drawer({ title, subtitle, children, onClose, open = true, width = "520px" }) {
  if (!open) return null;
  return (
    <div className="drawer-layer">
      <button className="drawer-scrim" aria-label="关闭抽屉" onClick={onClose} />
      <aside className="drawer-panel" style={{ "--drawer-width": width }}>
        <header className="drawer-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭">×</button>
        </header>
        {children}
      </aside>
    </div>
  );
}
