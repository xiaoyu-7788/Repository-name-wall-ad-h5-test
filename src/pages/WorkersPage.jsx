import React, { useMemo, useState } from "react";

import { getWorkerTeamTypeName } from "../apiClient";
import { WorkerDetailPanel } from "../components/workers/WorkerDetailPanel";
import { WorkerFormDrawer } from "../components/workers/WorkerFormDrawer";
import { WorkersTable } from "../components/workers/WorkersTable";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import {
  buildWorkerUrl,
  copyTextToClipboard,
  fallbackLanAdminUrl,
  hasConfiguredPublicOrigin,
  isLocalShareHostname,
  isUsingFallbackShareOrigin,
  isWorkerEnabled,
  isWorkerOnline,
  openWorkerUrl,
  taskCountForWorker,
  workerCarNo,
  workerLastSeenText,
} from "../lib/domain";

export function WorkersPage({ data, projects, dispatchWorkerId, setDispatchWorkerId, onNotice, createWorkerSignal = 0, globalSearch = "" }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("全部");
  const [sort, setSort] = useState("最近上线");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedWorkerId, setSelectedWorkerId] = useState(dispatchWorkerId || data.workers[0]?.id || "");
  const [editingWorker, setEditingWorker] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [copyText, setCopyText] = useState("");

  React.useEffect(() => {
    if (globalSearch) {
      setSearch(globalSearch);
      setPage(1);
    }
  }, [globalSearch]);

  React.useEffect(() => {
    if (createWorkerSignal) setEditingWorker({});
  }, [createWorkerSignal]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const list = data.workers.filter((worker) => {
      const haystack = `${worker.name || ""} ${worker.phone || ""} ${workerCarNo(worker)} ${getWorkerTeamTypeName(worker)}`.toLowerCase();
      const searchOk = !keyword || haystack.includes(keyword);
      const filterOk = filter === "全部"
        || (filter === "在线" && isWorkerOnline(worker))
        || (filter === "离线" && !isWorkerOnline(worker))
        || (filter === "链接启用" && isWorkerEnabled(worker))
        || (filter === "链接停用" && !isWorkerEnabled(worker))
        || (filter === "安装队伍" && getWorkerTeamTypeName(worker) === "安装队伍")
        || (filter === "找墙队伍" && getWorkerTeamTypeName(worker) === "找墙队伍");
      return searchOk && filterOk;
    });
    return [...list].sort((a, b) => {
      if (sort === "任务数") return taskCountForWorker(data.tasks, b.id) - taskCountForWorker(data.tasks, a.id);
      if (sort === "姓名") return String(a.name || "").localeCompare(String(b.name || ""), "zh-CN");
      return new Date(b.lastSeenAt || b.last_seen_at || 0).getTime() - new Date(a.lastSeenAt || a.last_seen_at || 0).getTime();
    });
  }, [data.workers, data.tasks, filter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageWorkers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedWorker = data.workers.find((worker) => worker.id === selectedWorkerId) || pageWorkers[0] || null;
  const onlineCount = data.workers.filter(isWorkerOnline).length;
  const installCount = data.workers.filter((worker) => getWorkerTeamTypeName(worker) === "安装队伍").length;
  const wallCount = data.workers.filter((worker) => getWorkerTeamTypeName(worker) === "找墙队伍").length;
  const activeTaskCount = data.workers.reduce((sum, worker) => sum + taskCountForWorker(data.tasks, worker.id), 0);

  React.useEffect(() => {
    if (selectedWorker && dispatchWorkerId !== selectedWorker.id) setDispatchWorkerId(selectedWorker.id);
  }, [selectedWorker?.id]);

  async function copyWorkerLink(worker) {
    const url = buildWorkerUrl(worker);
    const copied = await copyTextToClipboard(url);
    setCopyText(copied ? `已复制：${url}` : url);
    onNotice?.(copied ? `已复制 ${worker.name} 的师傅端链接。` : `浏览器未开放剪贴板权限，请手动复制：${url}`);
  }

  function requestToggle(worker) {
    setConfirmAction({
      title: isWorkerEnabled(worker) ? `停用 ${worker.name}` : `启用 ${worker.name}`,
      message: isWorkerEnabled(worker) ? "停用后该链接不可访问，也不会进入派单候选。" : "启用后需师傅重新打开链接并发送心跳才会显示在线。",
      confirmText: isWorkerEnabled(worker) ? "停用师傅" : "启用师傅",
      onConfirm: async () => {
        if (isWorkerEnabled(worker)) await data.disableWorker(worker.id);
        else await data.enableWorker(worker.id);
        setConfirmAction(null);
      },
    });
  }

  function requestDelete(worker) {
    setConfirmAction({
      title: `删除 ${worker.name}`,
      message: "删除后会清理该师傅对应派单任务，此操作不可恢复。",
      confirmText: "删除师傅",
      onConfirm: async () => {
        await data.removeWorkerDraft(worker.id);
        setConfirmAction(null);
      },
    });
  }

  function requestReset(worker) {
    setConfirmAction({
      title: `重置 ${worker.name} 的链接`,
      message: "重置后旧链接立即失效，需要重新复制新链接给师傅。",
      confirmText: "重置链接",
      onConfirm: async () => {
        await data.resetWorkerToken(worker.id);
        setConfirmAction(null);
      },
    });
  }

  return (
    <div className="workers-page enterprise-page">
      <header className="enterprise-page-header">
        <div className="enterprise-page-title">
          <div className="enterprise-page-heading">师傅管理</div>
        </div>
        <div className="enterprise-page-actions">
          <button type="button" className="blue-button" onClick={() => setEditingWorker({})}>新增师傅</button>
        </div>
      </header>

      {isLocalShareHostname() && (
        <div className="share-link-warning" role="alert">
          {hasConfiguredPublicOrigin()
            ? "当前后台通过 localhost 打开，但已配置公网域名。"
            : isUsingFallbackShareOrigin()
              ? `当前后台通过 localhost 打开，系统已自动改用局域网地址生成师傅链接：${fallbackLanAdminUrl()}。`
              : `当前后台通过 localhost 打开，复制链接可能打不开。请改用局域网地址打开后台，例如：${fallbackLanAdminUrl()}，或在生产环境配置 VITE_PUBLIC_APP_ORIGIN。`}
        </div>
      )}

      <section className="enterprise-kpi-grid">
        <article className="enterprise-kpi-card"><span>师傅总数</span><b>{data.workers.length}</b><small>安装 + 找墙</small></article>
        <article className="enterprise-kpi-card"><span>在线师傅</span><b>{onlineCount}</b><small>当前可联络</small></article>
        <article className="enterprise-kpi-card"><span>安装队伍</span><b>{installCount}</b><small>执行施工</small></article>
        <article className="enterprise-kpi-card"><span>找墙队伍</span><b>{wallCount}</b><small>回传墙源</small></article>
        <article className="enterprise-kpi-card"><span>在手任务</span><b>{activeTaskCount}</b><small>全队当前负载</small></article>
      </section>

      <section className="enterprise-card">
        <div className="enterprise-card-header">
          <div>
            <span>筛选与列表</span>
            <h3>师傅列表</h3>
          </div>
        </div>
        <div className="enterprise-toolbar worker-toolbar">
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="搜索姓名 / 手机号 / 车牌号" />
          <select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }}>
            {["全部", "在线", "离线", "链接启用", "链接停用", "安装队伍", "找墙队伍"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {["最近上线", "任务数", "姓名"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <WorkersTable
          workers={pageWorkers}
          tasks={data.tasks}
          selectedWorkerId={selectedWorker?.id}
          setSelectedWorkerId={setSelectedWorkerId}
          onCopy={copyWorkerLink}
          onOpen={openWorkerUrl}
          onEdit={setEditingWorker}
          onReset={requestReset}
          onToggleEnabled={requestToggle}
          onDelete={requestDelete}
        />
        <footer className="table-pagination">
          <span>共 {filtered.length} 人，当前第 {currentPage}/{totalPages} 页</span>
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
            {[10, 20, 50].map((size) => <option key={size} value={size}>每页 {size} 条</option>)}
          </select>
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>上一页</button>
          <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>下一页</button>
        </footer>
        {copyText && <div className="mini-status success">{copyText}</div>}
      </section>

      <section className="enterprise-two-column worker-management-layout">
        <div className="worker-detail-panel">
          <WorkerDetailPanel
            worker={selectedWorker}
            tasks={data.tasks}
            points={data.points}
            onCopy={copyWorkerLink}
            onOpen={openWorkerUrl}
            onEdit={setEditingWorker}
            onReset={requestReset}
            onToggleEnabled={requestToggle}
            onDelete={requestDelete}
          />
        </div>
      </section>

      {editingWorker && (
        <WorkerFormDrawer
          worker={editingWorker}
          projects={projects}
          onClose={() => setEditingWorker(null)}
          onSave={async (draft) => {
            const saved = await data.saveWorkerDraft(draft);
            setSelectedWorkerId(saved?.id || draft.id || selectedWorkerId);
            setEditingWorker(null);
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
      />
    </div>
  );
}
