import React, { useState } from "react";

import { loginUser } from "../apiClient";
import { classifyApiError } from "../lib/domain";

export function LoginPage({ onLogin, message: initialMessage = "" }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(initialMessage);
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
        <p className="auth-switch">没有账号？请联系超级管理员创建团队成员账号。</p>
      </form>
    </main>
  );
}
