import React, { useEffect, useState } from "react";

import { getUsers, updateUserRole, updateUserStatus } from "../apiClient";
import { classifyApiError, cnTime } from "../lib/domain";

const ROLE_OPTIONS = [
  ["super_admin", "超级管理员"],
  ["admin", "管理员"],
  ["dispatcher", "调度员"],
  ["viewer", "只读查看"],
];

const STATUS_OPTIONS = [
  ["all", "全部"],
  ["pending", "待审核"],
  ["active", "已启用"],
  ["disabled", "已停用"],
];

export function AccountsPage({ currentUser }) {
  const [status, setStatus] = useState("pending");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const canManage = ["super_admin", "admin"].includes(currentUser?.role);

  async function loadUsers(nextStatus = status) {
    try {
      setUsers(await getUsers(nextStatus));
      setMessage("");
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`${issue.category}：${issue.detail}`);
    }
  }

  useEffect(() => {
    if (canManage) loadUsers(status);
  }, [canManage, status]);

  async function changeStatus(user, nextStatus) {
    await updateUserStatus(user.id, nextStatus);
    await loadUsers();
  }

  async function changeRole(user, nextRole) {
    await updateUserRole(user.id, nextRole);
    await loadUsers();
  }

  if (!canManage) {
    return (
      <section className="accounts-page">
        <div className="empty-state">当前账号无权访问账号管理。</div>
      </section>
    );
  }

  return (
    <section className="accounts-page">
      <div className="page-toolbar">
        <div>
          <h2>账号审核</h2>
          <p>新注册账号默认 pending，需要审核通过后才能进入后台。</p>
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {message && <section className="warn">{message}</section>}
      <div className="pointTableWrap account-table">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>账号</th>
              <th>联系方式</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <b>{user.username}</b>
                  <small>{user.id}</small>
                </td>
                <td>
                  <b>{user.phone}</b>
                  <small>{user.email || "未填写邮箱"}</small>
                </td>
                <td>
                  <select value={user.role} onChange={(event) => changeRole(user, event.target.value)}>
                    {ROLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </td>
                <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                <td>{cnTime(user.createdAt)}</td>
                <td>
                  <div className="row-actions">
                    {user.status !== "active" && <button type="button" onClick={() => changeStatus(user, "active")}>审核通过</button>}
                    {user.status !== "disabled" && <button type="button" onClick={() => changeStatus(user, "disabled")}>停用</button>}
                    {user.status !== "pending" && <button type="button" onClick={() => changeStatus(user, "pending")}>退回待审</button>}
                  </div>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan="6"><div className="empty-state">暂无账号</div></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
