import React from "react";

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
  const heroStats = [
    { label: "今日新增点位", value: stats.todayPoints, hint: "较昨日实时同步" },
    { label: "今日已派单", value: stats.todayDispatch, hint: "待出发与在途合并" },
    { label: "施工中", value: stats.doing, hint: `${stats.onlineWorkers} 位师傅在线` },
    { label: "今日已完成", value: stats.todayCompleted, hint: `${stats.done} 个点位已完工` },
    { label: "异常待处理", value: stats.anomalyPoints, hint: "需要优先跟进" },
  ];
  const overviewCards = [
    { label: "总项目数", value: stats.totalProjects, hint: "含隐藏项目", tone: "dark" },
    { label: "总点位数", value: stats.currentPoints, hint: activeProject === "all" ? "全部项目" : activeProject },
    { label: "施工中点位", value: stats.doing, hint: "已派单待完成", tone: "orange" },
    { label: "已完成点位", value: stats.done, hint: "上传后自动完工", tone: "green" },
    { label: "在线师傅", value: stats.onlineWorkers, hint: "45 秒心跳内", tone: "green" },
    { label: "今日上传素材", value: stats.todayUploads, hint: "照片 / 视频 / 水印" },
    { label: "异常点位数", value: stats.anomalyPoints, hint: "按统一异常规则", tone: "red" },
    { label: "素材齐套率", value: `${stats.materialCompletionRate}%`, hint: "按项目必传规则", tone: "slate" },
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
    { label: "缺720全景", value: scopedPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).includes("缺720全景")).length },
    { label: "缺水印照片", value: scopedPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).includes("缺水印照片")).length },
    { label: "缺墙租协议", value: scopedPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).includes("缺墙租协议图片")).length },
  ];
  const activityItems = activity.slice(0, 8);

  return (
    <div className="dashboard-page enterprise-page">
      <header className="enterprise-page-header">
        <div className="enterprise-page-title">
          <span>管理后台 / Overview</span>
          <div className="enterprise-page-heading">运营总览</div>
        </div>
        <div className="enterprise-page-actions">
          <button type="button" className="blue-button" onClick={() => onNavigate("points")}>查看点位</button>
          <button type="button" onClick={() => onNavigate("dispatch")}>进入派单中心</button>
        </div>
      </header>

      <section className="enterprise-hero-grid">
        {heroStats.map((item) => (
          <article key={item.label} className="enterprise-hero-card">
            <span>{item.label}</span>
            <b>{item.value}</b>
            <small>{item.hint}</small>
          </article>
        ))}
      </section>

      <section className="enterprise-kpi-grid">
        {overviewCards.map((item) => (
          <article key={item.label} className={`enterprise-kpi-card ${item.tone || ""}`}>
            <span>{item.label}</span>
            <b>{item.value}</b>
            <small>{item.hint}</small>
          </article>
        ))}
      </section>

      <section className="enterprise-two-column">
        <section className="enterprise-card">
          <div className="enterprise-card-header">
            <div>
              <span>今日优先事项</span>
              <h3>优先处理</h3>
            </div>
          </div>
          <div className="enterprise-list-grid">
            {[
              { label: "已完成但缺720全景", value: missingPanoDone.length, onClick: () => onNavigate("media") },
              { label: "施工中超过24小时未更新", value: staleDoing.length, onClick: () => onNavigate("points") },
              { label: "未派单且临近截止", value: unassigned.length, onClick: () => onNavigate("points") },
              { label: "师傅离线但仍有任务", value: offlineLoadedWorkers.length, onClick: () => onNavigate("workers") },
              { label: "项目素材规则未齐套", value: stats.anomalyPoints, onClick: () => onNavigate("media") },
            ].map((item) => (
              <button key={item.label} type="button" className="enterprise-list-row" onClick={item.onClick}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="enterprise-card">
          <div className="enterprise-card-header">
            <div>
              <span>经营运行</span>
              <h3>最近动态与趋势</h3>
            </div>
          </div>
          <div className="enterprise-kpi-grid compact">
            <article className="enterprise-kpi-card"><span>今日新增点位</span><b>{stats.todayPoints}</b></article>
            <article className="enterprise-kpi-card"><span>今日派单数</span><b>{stats.todayDispatch}</b></article>
            <article className="enterprise-kpi-card"><span>今日完成数</span><b>{stats.todayCompleted}</b></article>
            <article className="enterprise-kpi-card"><span>今日上传素材</span><b>{stats.todayMedia}</b></article>
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
      </section>

      <section className="enterprise-three-column">
        <section className="enterprise-card">
          <div className="enterprise-card-header">
            <div>
              <span>项目进度</span>
              <h3>推进概览</h3>
            </div>
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

        <section className="enterprise-card">
          <div className="enterprise-card-header">
            <div>
              <span>师傅概览</span>
              <h3>在线与负载</h3>
            </div>
          </div>
          <div className="enterprise-list-grid">
            {onlineWorkers.slice(0, 5).map((worker) => (
              <article key={worker.id} className="enterprise-list-row">
                <div>
                  <b>{worker.name}</b>
                  <small>{workerLastSeenText(worker)}</small>
                </div>
              </article>
            ))}
            {!onlineWorkers.length && <div className="enterprise-empty">当前没有在线师傅。</div>}
          </div>
          <div className="worker-snapshot">
            <div><span>离线师傅数量</span><b>{stats.offlineWorkers}</b></div>
            <div><span>最近上线师傅</span><b>{recentOnline?.name || "暂无"}</b></div>
            <div><span>当前任务最多</span><b>{mostLoadedWorker ? `${mostLoadedWorker.name} · ${taskCountForWorker(data.tasks, mostLoadedWorker.id)} 个` : "暂无"}</b></div>
          </div>
        </section>

        <section className="enterprise-card">
          <div className="enterprise-card-header">
            <div>
              <span>异常提示</span>
              <h3>素材与派单风险</h3>
            </div>
          </div>
          <div className="risk-list">
            {materialRisks.map((item) => (
              <button key={item.label} type="button" onClick={() => onNavigate("media")}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </button>
            ))}
          </div>
          <div className="enterprise-list-grid">
            {[
              { label: "待施工", value: scopedPoints.filter((point) => getPointStatus(point) === "待施工").length, onClick: () => onNavigate("points") },
              { label: "施工中", value: stats.doing, onClick: () => onNavigate("map") },
              { label: "需复查", value: stats.review, onClick: () => onNavigate("points") },
              { label: "无照片", value: stats.withoutPhoto, onClick: () => onNavigate("points") },
              { label: "无全景", value: stats.withoutPano, onClick: () => onNavigate("media") },
              { label: "无水印", value: stats.withoutWatermark, onClick: () => onNavigate("media") },
            ].map((item) => (
              <button key={item.label} type="button" className="enterprise-list-row" onClick={item.onClick}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </button>
            ))}
          </div>
          <div className="activity-list enterprise-activity-list">
            {activityItems.map((item, index) => (
              <article key={`${item.type}-${item.at}-${index}`}>
                <i>{item.type}</i>
                <div>
                  <b>{item.title}</b>
                  <span>{item.meta} · {new Date(item.at).toLocaleString("zh-CN")}</span>
                </div>
              </article>
            ))}
            {!activityItems.length && <div className="enterprise-empty">暂无运行动态。</div>}
          </div>
        </section>
      </section>
    </div>
  );
}
