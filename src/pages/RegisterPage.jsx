import React, { useState } from "react";

import { registerUser } from "../apiClient";
import { classifyApiError } from "../lib/domain";

export function RegisterPage() {
  const [form, setForm] = useState({ username: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const result = await registerUser(form);
      setSuccess(true);
      setMessage(result.message || "注册成功，请等待管理员审核通过后使用。");
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
            <h1>注册账号</h1>
            <p>注册后需要管理员审核通过</p>
          </div>
        </div>
        <label>
          <span>用户名</span>
          <input value={form.username} onChange={(event) => update("username", event.target.value)} autoComplete="username" required />
        </label>
        <label>
          <span>手机号</span>
          <input value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" required />
        </label>
        <label>
          <span>邮箱，可选</span>
          <input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" autoComplete="email" />
        </label>
        <label>
          <span>密码</span>
          <input value={form.password} onChange={(event) => update("password", event.target.value)} type="password" autoComplete="new-password" required />
        </label>
        <label>
          <span>确认密码</span>
          <input value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} type="password" autoComplete="new-password" required />
        </label>
        {message && <div className={`auth-message ${success ? "success" : "error"}`}>{message}</div>}
        <button className="blue-button" type="submit" disabled={busy}>{busy ? "提交中..." : "注册"}</button>
        <p className="auth-switch">已有账号？<a href="/login">去登录</a></p>
      </form>
    </main>
  );
}
