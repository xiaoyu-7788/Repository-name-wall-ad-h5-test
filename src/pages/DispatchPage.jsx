import React, { useMemo, useState } from "react";

import { DispatchBasket } from "../components/dispatch/DispatchBasket";
import { DispatchPointPool } from "../components/dispatch/DispatchPointPool";
import { DispatchSummary } from "../components/dispatch/DispatchSummary";
import {
  STATUS,
  dispatchValidationForPoint,
  getPointStatus,
  getProjectName,
  isWorkerEnabled,
  isWorkerOnline,
  mediaCounts,
  normalizeProjects,
  pointTags,
  workerLngLat,
  pointLngLat,
  taskPointId,
  taskWorkerId,
} from "../lib/domain";

export function DispatchPage({ data, activeProject, selectedIds, setSelectedIds, dispatchWorkerId, setDispatchWorkerId, onDispatch }) {
  const [filters, setFilters] = useState({ project: activeProject, status: "全部", tag: "全部标签", search: "", media: "全部", assigned: "全部" });
  const projects = normalizeProjects(data.projects, data.points);
  const tags = useMemo(() => [...new Set(data.points.flatMap((point) => pointTags(point, data.photos)))].slice(0, 50), [data.points, data.photos]);
  const activeWorkers = data.workers.filter(isWorkerEnabled);

  function distanceScore(worker) {
    const workerPos = workerLngLat(worker);
    const pointPositions = selectedPoints.map(pointLngLat).filter(Boolean);
    if (!workerPos || !pointPositions.length) return 0;
    const avgDistance = pointPositions.reduce((sum, pos) => sum + Math.hypot(Number(workerPos[0]) - Number(pos[0]), Number(workerPos[1]) - Number(pos[1])), 0) / pointPositions.length;
    return Math.max(0, 20 - avgDistance * 80);
  }

  React.useEffect(() => {
    setFilters((current) => ({ ...current, project: activeProject }));
  }, [activeProject]);

  const filteredPoints = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return data.points.filter((point) => {
      const counts = mediaCounts(point, data.photos);
      const assigned = data.tasks.some((task) => String(taskPointId(task)) === String(point.id));
      const projectOk = filters.project === "all" || getProjectName(point) === filters.project;
      const statusOk = filters.status === "全部" || getPointStatus(point) === filters.status;
      const tagOk = filters.tag === "全部标签" || pointTags(point, data.photos).includes(filters.tag);
      const mediaOk = filters.media === "全部"
        || (filters.media === "有照片" && counts.total > 0)
        || (filters.media === "无照片" && counts.total === 0)
        || (filters.media === "有全景" && counts.pano > 0)
        || (filters.media === "无全景" && counts.pano === 0)
        || (filters.media === "有水印" && counts.watermark > 0)
        || (filters.media === "无水印" && counts.watermark === 0);
      const assignOk = filters.assigned === "全部"
        || (filters.assigned === "未分配" && !assigned)
        || (filters.assigned === "已分配" && assigned);
      const haystack = `${point.title || ""} ${point.address || ""} ${point.k_code || ""} ${getProjectName(point)}`.toLowerCase();
      return projectOk && statusOk && tagOk && mediaOk && assignOk && (!keyword || haystack.includes(keyword));
    });
  }, [data.points, data.photos, data.tasks, filters]);

  const selectedPoints = filteredPoints.filter((point) => selectedIds.includes(point.id));
  const targetWorker = activeWorkers.find((worker) => worker.id === dispatchWorkerId) || activeWorkers[0] || null;

  const recommendedWorkers = useMemo(() => {
    const selectedProject = getProjectName(selectedPoints[0]);
    return [...activeWorkers]
      .map((worker) => {
        const taskCount = data.tasks.filter((task) => String(taskWorkerId(task)) === String(worker.id)).length;
        const sameProject = selectedProject && (worker.project_name || worker.projectName) === selectedProject;
        const online = isWorkerOnline(worker);
        const hasLocation = Boolean(workerLngLat(worker));
        const score = (online ? 40 : 0) + (sameProject ? 30 : 0) + (hasLocation ? 10 : 0) + distanceScore(worker) - taskCount * 4 + (worker.enabled !== false ? 10 : -100);
        return { worker, score, taskCount, online, sameProject, hasLocation };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [activeWorkers, data.tasks, selectedPoints]);

  const dispatchChecks = useMemo(() => {
    if (!targetWorker) return [];
    const workerTaskCount = data.tasks.filter((task) => String(taskWorkerId(task)) === String(targetWorker.id)).length;
    const pointChecks = selectedPoints.map((point) => ({ point, ...dispatchValidationForPoint(point, targetWorker, data) }));
    const crossProjectCount = pointChecks.filter((item) => item.crossProject).length;
    const duplicateCount = pointChecks.filter((item) => item.alreadyAssigned && !item.duplicateForWorker).length;
    const riskCount = pointChecks.filter((item) => item.hasRisk).length;
    return [
      { label: "师傅链接启用", ok: targetWorker.enabled !== false, value: targetWorker.enabled === false ? "已停用" : "启用" },
      { label: "师傅在线状态", ok: isWorkerOnline(targetWorker), value: isWorkerOnline(targetWorker) ? "在线" : "离线" },
      { label: "当前任务量", ok: workerTaskCount <= 20, value: `${workerTaskCount} 个` },
      { label: "是否跨区域", ok: crossProjectCount === 0, value: crossProjectCount ? `${crossProjectCount} 个跨项目` : "同项目/未设置" },
      { label: "重复派单风险", ok: duplicateCount === 0, value: duplicateCount ? `${duplicateCount} 个已派给其他师傅` : "无" },
      { label: "异常风险", ok: riskCount === 0, value: riskCount ? `${riskCount} 个有异常` : "无" },
    ];
  }, [targetWorker, selectedPoints, data]);

  const history = [...data.tasks]
    .sort((a, b) => new Date(b.assigned_at || b.created_at || 0).getTime() - new Date(a.assigned_at || a.created_at || 0).getTime())
    .slice(0, 8);

  async function dispatchSelected() {
    await onDispatch(filteredPoints);
  }

  return (
    <div className="dispatch-page">
      <section className="dispatch-filters table-toolbar">
        <div className="toolbar-filters">
          <select value={filters.project} onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}>
            {projects.map((project) => <option key={project.id || project.name} value={project.id === "all" ? "all" : project.name}>{project.name}</option>)}
          </select>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {["全部", ...STATUS].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={filters.tag} onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}>
            <option>全部标签</option>
            {tags.map((tag) => <option key={tag}>{tag}</option>)}
          </select>
          <select value={filters.media} onChange={(event) => setFilters((current) => ({ ...current, media: event.target.value }))}>
            {["全部", "有照片", "无照片", "有全景", "无全景", "有水印", "无水印"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={filters.assigned} onChange={(event) => setFilters((current) => ({ ...current, assigned: event.target.value }))}>
            {["全部", "未分配", "已分配"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="地址搜索 / 编号 / K码" />
        </div>
      </section>
      <section className="dispatch-workflow">
        <DispatchPointPool points={filteredPoints} photos={data.photos} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
        <DispatchBasket points={filteredPoints} selectedIds={selectedIds} setSelectedIds={setSelectedIds} photos={data.photos} tasks={data.tasks} projects={data.projects} />
        <DispatchSummary
          workers={activeWorkers}
          tasks={data.tasks}
          photos={data.photos}
          projects={data.projects}
          points={filteredPoints}
          selectedIds={selectedIds}
          workerId={dispatchWorkerId}
          setWorkerId={setDispatchWorkerId}
          onDispatch={dispatchSelected}
          recommendedWorkers={recommendedWorkers}
          checks={dispatchChecks}
        />
      </section>
      <section className="panel-card dispatch-history">
        <div className="panel-head">
          <h2>派单历史记录</h2>
          <span>最近 {history.length} 条</span>
        </div>
        <div className="record-list">
          {history.map((task) => {
            const worker = data.workers.find((item) => item.id === taskWorkerId(task));
            const point = data.points.find((item) => item.id === taskPointId(task));
            return <article key={task.id}><b>{worker?.name || "师傅"} → {point?.title || "点位"}</b><span>{task.status || "施工中"} · {task.assigned_at || task.created_at}</span></article>;
          })}
          {!history.length && <small>暂无派单历史。</small>}
        </div>
      </section>
    </div>
  );
}
