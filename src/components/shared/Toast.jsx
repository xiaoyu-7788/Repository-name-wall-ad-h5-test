import React from "react";

export function Toast({ message }) {
  return <div className={`admin-toast ${message ? "show" : ""}`}>{message}</div>;
}
