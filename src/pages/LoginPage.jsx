import React, { useState } from "react";

import { loginUser } from "../apiClient";
import { classifyApiError } from "../lib/domain";

const DEV_PREVIEW_TOKEN = "dev-preview-token";
const DEV_PREVIEW_USER = {
  id: "dev-preview-admin",
  username: "测试管理员",
  name: "测试管理员",
  phone: "13291116876",
  role: "admin",
  status: "active",
};
const enableDevLogin = import.meta.env.DEV || String(import.meta.env.VITE_ENABLE_DEV_LOGIN || "").toLowerCase() === "true";

export function LoginPage({ onLogin }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const user = await loginUser({ login, password });
      onLogin?.(user);
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(issue.detail || issue.category);
    } finally {
      setBusy(false);
    }
  }

  function handleDevPreviewLogin() {
    window.localStorage.setItem("admin_token", DEV_PREVIEW_TOKEN);
    window.localStorage.setItem("admin_user", JSON.stringify(DEV_PREVIEW_USER));
    onLogin?.(DEV_PREVIEW_USER);
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="brand-mark">墙</span>
          <div>
            <h1>登录后台</h1>
            <p>全国墙体广告执行坐标系统</p>
          </div>
        </div>
        <label>
          <span>用户名 / 手机号</span>
          <input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" required />
        </label>
        <label>
          <span>密码</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
        </label>
        {message && <div className="auth-message error">{message}</div>}
        <button className="blue-button" type="submit" disabled={busy}>{busy ? "登录中..." : "登录"}</button>
        {enableDevLogin && (
          <button className="dev-login-button" type="button" onClick={handleDevPreviewLogin}>
            临时进入测试后台
          </button>
        )}
        <p className="auth-switch">没有账号？<a href="/register">去注册</a></p>
      </form>
    </main>
  );
}
