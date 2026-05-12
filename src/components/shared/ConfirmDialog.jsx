import React from "react";

import { Modal } from "./Modal";

export function ConfirmDialog({ open, title, message, confirmText = "确认", cancelText = "取消", tone = "danger", onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <Modal title={title} subtitle={message} onClose={onCancel}>
      <div className="confirm-actions">
        <button type="button" onClick={onCancel}>{cancelText}</button>
        <button type="button" className={tone === "danger" ? "danger-button" : "blue-button"} onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  );
}
