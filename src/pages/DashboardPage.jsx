import React from "react";

import { KpiCard } from "../components/dashboard/KpiCard";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { TodoPanel } from "../components/dashboard/TodoPanel";
import {
  calculateDashboard,
  getPointAnomalies,
  getPointStatus,
  isWorkerOnline,
  makeActivityFeed,
  mediaCounts,
  normalizeProjects,
  projectScopedPoints,
  taskCountForWorker,
  taskPointId,
  workerLastSeenText,
} from "../lib/domain";

export function DashboardPage({ data, activeProject, onNavigate, setActiveProject }) {
  const stats = calculateDashboard(data, activeProject);
  const projects = normalizeProjects(data.projects, data.points).filter((project) => project.id !== "all");
  const scopedPoints = projectScopedPoints(data.points, activeProject);
  const onlineWorkers = data.workers.filter(isWorkerOnline);
  const mostLoadedWorker = [...data.workers].sort((a, b) => taskCountForWorker(data.tasks, b.id) - taskCountForWorker(data.tasks, a.id))[0];
  const recentOnline = [...data.workers]
    .filter((worker) => worker.lastSeenAt || worker.last_seen_at)
    .sort((a, b) => new Date(b.lastSeenAt || b.last_seen_at).getTime() - new Date(a.lastSeenAt || a.last_seen_at).getTime())[0];
  const activity = makeActivityFeed(data);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const missingPanoDone = scopedPoints.filter((point) => getPointStatus(point) === "已完成" && mediaCounts(point, data.photos).pano === 0);
  const staleDoing = scopedPoints.filter((point) => {
    const updated = new Date(point.updated_at || point.created_at || 0).getTime();
    return getPointStatus(point) === "施工中" && (!updated || updated < oneDayAgo);
  });
  const unassigned = scopedPoints.filter((point) => !data.tasks.some((task) => String(taskPointId(task)) === String(point.id)));
  const offlineLoadedWorkers = data.workers.filter((worker) => !isWorkerOnline(worker) && taskCountForWorker(data.tasks, worker.id) > 0);
  const priorityItems = [
    { label: "已完成但缺 720 全景", value: missingPanoDone.length, onClick: () => onNavigate("media") },
    { label: "施工中超过 24 小时未更新", value: staleDoing.length, onClick: () => onNavigate("points") },
    { label: "未派单且临近截止", value: unassigned.length, onClick: () => onNavigate("points") },
    { label: "师傅离线但仍有任务", value: offlineLoadedWorkers.length, onClick: () => onNavigate("workers") },
  ];
  const trendDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const key = day.toISOString().slice(0, 10);
    return {
      key,
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      done: scopedPoints.filter((point) => getPointStatus(point) === "已完成" && String(point.completed_at || point.updated_at || "").startsWith(key)).length,
      uploads: data.photos.filter((photo) => String(photo.created_at || photo.createdAt || "").startsWith(key)).length,
    };
  });
  const maxTrend = Math.max(1, ...trendDays.flatMap((day) => [day.done, day.uploads]));
  const materialRisks = [
    { label: "缺现场照片", value: scopedPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).includes("缺现场照片")).length },
    { label: "缺 720 全景", value: scopedPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).includes("缺720 全景")).length },
    { label: "缺水印照片", value: scopedPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).includes("缺水印照片")).length },
    { label: "缺墙租协议", value: scopedPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).includes("缺墙租协议图片")).length },
  ];
  const anomalyPriority = [
    ...priorityItems,
    { label: "项目素材规则未齐套", value: stats.anomalyPoints, onClick: () => onNavigate("media") },
  ].sort((a, b) => b.value - a.value);

  const todoItems = [
    { label: "待施工", value: scopedPoints.filter((point) => getPointStatus(point) === "待施工").length, onClick: () => onNavigate("points") },
    { label: "施工中", value: stats.doing, onClick: () => onNavigate("map") },
    { label: "需复查", value: stats.review, onClick: () => onNavigate("points") },
    { label: "无照片", value: stats.withoutPhoto, onClick: () => onNavigate("points") },
    { label: "无全景", value: stats.withoutPano, onClick: () => onNavigate("media") },
    { label: "无水印", value: stats.withoutWatermark, onClick: () => onNavigate("media") },
    { label: "未登记施工队长", value: stats.withoutCaptain, onClick: () => onNavigate("points") },
  ];

  return (
    <div className="dashboard-page">
      <section className="kpi-grid">
        <KpiCard label="总项目数" value={stats.totalProjects} hint="含隐藏项目管理入口" tone="dark" />
        <KpiCard label="总点位数" value={stats.currentPoints} hint={activeProject === "all" ? "全部项目" : activeProject} />
        <KpiCard label="施工中点位" value={stats.doing} hint="已派单待完成" tone="orange" />
        <KpiCard label="已完成点位" value={stats.done} hint="上传后自动完成" tone="green" />
        <KpiCard label="在线师傅" value={stats.onlineWorkers} hint="45 秒心跳内" tone="green" />
        <KpiCard label="今日上传素材数" value={stats.todayUploads} hint="照片 / 视频 / 水印" />
        <KpiCard label="异常点位数" value={stats.anomalyPoints} hint="按统一异常规则" tone="red" />
        <KpiCard label="素材齐套率" value={`${stats.materialCompletionRate}%`} hint="按项目必传规则" tone="slate" />
      </section>

      <section className="dashboard-grid">
        <TodoPanel items={priorityItems} title="今日优先事项" subtitle="点击进入处理页" />

        <section className="panel-card operations-panel">
          <div className="panel-head">
            <h2>经营运行概览</h2>
            <span>Today</span>
          </div>
          <div className="ops-grid">
            <div><span>今日新增点位</span><b>{stats.todayPoints}</b></div>
            <div><span>今日派单数</span><b>{stats.todayDispatch}</b></div>
            <div><span>今日完成数</span><b>{stats.todayCompleted}</b></div>
            <div><span>今日上传照片/视频</span><b>{stats.todayMedia}</b></div>
          </div>
        </section>

        <section className="panel-card trend-panel">
          <div className="panel-head">
            <h2>近 7 天趋势</h2>
            <span>完成 / 上传</span>
          </div>
          <div className="trend-chart">
            {trendDays.map((day) => (
              <article key={day.key}>
                <div>
                  <i className="done" style={{ height: `${Math.max(6, (day.done / maxTrend) * 90)}%` }} />
                  <i className="upload" style={{ height: `${Math.max(6, (day.uploads / maxTrend) * 90)}%` }} />
                </div>
                <span>{day.label}</span>
              </article>
            ))}
          </div>
          <div className="trend-legend"><span>完成点位</span><span>上传素材</span></div>
        </section>

        <section className="panel-card project-overview-panel">
          <div className="panel-head">
            <h2>项目推进总览</h2>
            <span>{activeProject === "all" ? "全部项目" : activeProject}</span>
          </div>
          <div className="project-overview-list">
            {projects.map((project) => {
              const points = data.points.filter((point) => point.project_name === project.name || point.projectName === project.name);
              const done = points.filter((point) => getPointStatus(point) === "已完成").length;
              const rate = points.length ? Math.round((done / points.length) * 100) : 0;
              return (
                <button key={project.id || project.name} type="button" onClick={() => { setActiveProject(project.name); onNavigate("points"); }}>
                  <span className="project-dot" style={{ background: project.color || "#2563eb" }} />
                  <b>{project.name}</b>
                  <small>{points.length} 个点位</small>
                  <i><em style={{ width: `${rate}%` }} /></i>
                  <strong>{rate}%</strong>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel-card worker-overview-panel">
          <div className="panel-head">
            <h2>师傅状态概览</h2>
            <span>{onlineWorkers.length} 在线</span>
          </div>
          <div className="online-worker-list">
            {onlineWorkers.slice(0, 5).map((worker) => (
              <article key={worker.id}>
                <b>{worker.name}</b>
                <span>{workerLastSeenText(worker)}</span>
              </article>
            ))}
            {!onlineWorkers.length && <div className="empty compact">当前没有在线师傅。</div>}
          </div>
          <div className="worker-snapshot">
            <div><span>离线师傅数量</span><b>{stats.offlineWorkers}</b></div>
            <div><span>最近上线师傅</span><b>{recentOnline?.name || "暂无"}</b></div>
            <div><span>当前任务最多</span><b>{mostLoadedWorker ? `${mostLoadedWorker.name} · ${taskCountForWorker(data.tasks, mostLoadedWorker.id)} 个` : "暂无"}</b></div>
          </div>
        </section>

        <section className="panel-card material-risk-panel">
          <div className="panel-head">
            <h2>素材风险摘要</h2>
            <span>按必传规则</span>
          </div>
          <div className="risk-list">
            {materialRisks.map((item) => (
              <button key={item.label} type="button" onClick={() => onNavigate("media")}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </button>
            ))}
          </div>
        </section>

        <TodoPanel items={anomalyPriority} title="异常优先级" subtitle="按数量排序" />
        <TodoPanel items={todoItems} title="工作入口" subtitle="常用筛选" />
        <RecentActivity items={activity} />
      </section>
    </div>
  );
}
