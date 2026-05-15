import React from "react";

export function Modal({ title, subtitle, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop enterprise-modal-overlay" role="dialog" aria-modal="true">
      <section className={`modal-card enterprise-modal ${wide ? "wide" : ""}`}>
        <header className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭">×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
