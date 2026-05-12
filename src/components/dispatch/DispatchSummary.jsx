import React from "react";

import { getProjectName, isWorkerOnline, taskCountForWorker, workerCarNo } from "../../lib/domain";

export function DispatchSummary({ workers, tasks, points, selectedIds, workerId, setWorkerId, onDispatch, recommendedWorkers = [], checks = [] }) {
  const selected = points.filter((point) => selectedIds.includes(point.id));
  const worker = workers.find((item) => item.id === workerId) || workers[0] || null;
  const projects = [...new Set(selected.map(getProjectName))];
  const blocked = checks.some((item) => item.label === "师傅链接启用" && !item.ok);

  return (
    <section className="dispatch-column dispatch-summary">
      <div className="panel-head">
        <h2>师傅与摘要</h2>
        <span>确认后发送</span>
      </div>
      <label className="field">
        <span>目标师傅</span>
        <select value={workerId} onChange={(event) => setWorkerId(event.target.value)}>
          {workers.map((item) => <option key={item.id} value={item.id}>{item.name} / {workerCarNo(item)}</option>)}
        </select>
      </label>
      {worker && (
        <div className="dispatch-worker-card">
          <b>{worker.name}</b>
          <span>{worker.phone || "未登记"} · {workerCarNo(worker)}</span>
          <small>当前已派任务 {taskCountForWorker(tasks, worker.id)} 个 · {isWorkerOnline(worker) ? "在线" : "离线"}</small>
        </div>
      )}
      <section className="dispatch-recommend-panel">
        <b>推荐师傅</b>
        <div>
          {recommendedWorkers.map((item) => (
            <button key={item.worker.id} type="button" className={worker?.id === item.worker.id ? "active" : ""} onClick={() => setWorkerId(item.worker.id)}>
              {item.worker.name} · {item.online ? "在线" : "离线"} · 任务 {item.taskCount}
            </button>
          ))}
        </div>
      </section>
      <section className="dispatch-check-panel">
        <b>派单前校验</b>
        <div>
          {checks.map((item) => (
            <span key={item.label} className={item.ok ? "ok" : "warn"}>{item.label}：{item.value}</span>
          ))}
        </div>
      </section>
      <div className="summary-grid">
        <div><span>派给谁</span><b>{worker?.name || "未选择"}</b></div>
        <div><span>共多少点位</span><b>{selected.length}</b></div>
        <div><span>所属项目</span><b>{projects.length ? projects.join(" / ") : "暂无"}</b></div>
        <div><span>是否重复派单</span><b>自动覆盖同师傅同点位</b></div>
      </div>
      <button className="blue-button full" type="button" disabled={!worker || !selected.length || blocked} onClick={onDispatch}>一键派单</button>
    </section>
  );
}
