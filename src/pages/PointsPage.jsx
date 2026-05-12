import React, { useMemo, useState } from "react";

import { PointDetailDrawer } from "../components/points/PointDetailDrawer";
import { PointFilters } from "../components/points/PointFilters";
import { PointsTable } from "../components/points/PointsTable";
import {
  getCaptainName,
  getCaptainPhone,
  getPointAnomalies,
  getPointStatus,
  getProjectName,
  getScoutName,
  getScoutPhone,
  isDateInRange,
  normalizeProjects,
  pointTags,
  safeJson,
  taskPointId,
  taskWorkerId,
  uid,
} from "../lib/domain";

export function PointsPage({
  data,
  activeProject,
  setActiveProject,
  selectedIds,
  setSelectedIds,
  onNewPoint,
  onBatchImport,
  onEditPoint,
  onOpenSite,
  onDeletePoint,
  onDispatchPoint,
  onMapSelected,
  onOpenMedia,
  onOpenAcceptance,
  timeRange = "近7天",
  globalSearch = "",
}) {
  const [filters, setFilters] = useState({
    project: activeProject,
    status: "全部",
    anomaly: "全部异常",
    workerId: "all",
    tag: "全部标签",
    timeRange,
    search: "",
    page: 1,
    pageSize: 10,
  });
  const [sort, setSort] = useState({ key: "updated", dir: "desc" });
  const [detailPoint, setDetailPoint] = useState(null);
  const projects = normalizeProjects(data.projects, data.points);
  const tags = useMemo(() => [...new Set(data.points.flatMap((point) => pointTags(point, data.photos)))].slice(0, 60), [data.points, data.photos]);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, project: activeProject }));
  }, [activeProject]);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, timeRange, page: 1 }));
  }, [timeRange]);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, search: globalSearch, page: 1 }));
  }, [globalSearch]);

  const filtered = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    const base = data.points.filter((point) => {
      const projectOk = filters.project === "all" || getProjectName(point) === filters.project;
      const statusOk = filters.status === "全部" || getPointStatus(point) === filters.status;
      const anomalies = getPointAnomalies(point, data.photos, data.tasks, data.projects);
      const anomalyOk = filters.anomaly === "全部异常" || anomalies.includes(filters.anomaly);
      const pointTasks = data.tasks.filter((task) => String(taskPointId(task)) === String(point.id));
      const workerOk = filters.workerId === "all" || pointTasks.some((task) => String(taskWorkerId(task)) === String(filters.workerId));
      const tagOk = filters.tag === "全部标签" || pointTags(point, data.photos).includes(filters.tag);
      const timeOk = isDateInRange(point.updated_at || point.completed_at || point.created_at, filters.timeRange);
      const assignedWorkers = pointTasks
        .map((task) => data.workers.find((worker) => String(worker.id) === String(taskWorkerId(task)))?.name)
        .filter(Boolean)
        .join(" ");
      const haystack = [
        point.title,
        point.address,
        point.landlord_name,
        point.landlord_phone,
        getCaptainName(point),
        getCaptainPhone(point),
        getScoutName(point),
        getScoutPhone(point),
        point.k_code,
        getProjectName(point),
        assignedWorkers,
        anomalies.join(" "),
      ].join(" ").toLowerCase();
      return projectOk && statusOk && anomalyOk && workerOk && tagOk && timeOk && (!keyword || haystack.includes(keyword));
    });
    const sorted = [...base].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const value = (point) => {
        if (sort.key === "project") return getProjectName(point);
        if (sort.key === "status") return getPointStatus(point);
        if (sort.key === "updated") return new Date(point.updated_at || point.created_at || 0).getTime();
        return point.title || "";
      };
      return String(value(a)).localeCompare(String(value(b)), "zh-CN", { numeric: true }) * dir;
    });
    return sorted;
  }, [data.points, data.photos, data.tasks, data.workers, data.projects, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const pagePoints = filtered.slice((page - 1) * filters.pageSize, page * filters.pageSize);
  const bulkCounts = selectedIds.length ? selectedIds.length : 0;

  function exportData(items = filtered) {
    const blob = new Blob([safeJson({ points: items, exportedAt: new Date().toISOString() })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wall-points-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateProjectFilter(valueOrUpdater) {
    setFilters((current) => {
      const next = typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater;
      setActiveProject(next.project);
      return next;
    });
  }

  return (
    <div className="points-page">
      <PointFilters
        projects={projects}
        workers={data.workers}
        filters={filters}
        setFilters={updateProjectFilter}
        tags={tags}
        onNew={() => onNewPoint({ id: uid("point"), title: "", status: "待派单", project_name: activeProject === "all" ? projects.find((item) => item.id !== "all")?.name || "加多宝项目" : activeProject })}
        onBatch={onBatchImport}
        onExport={exportData}
      />
      {bulkCounts > 0 && (
        <section className="bulk-bar">
          <b>已选择 {bulkCounts} 个点位</b>
          <div>
            <button type="button" onClick={() => onDispatchPoint(null)}>批量派单</button>
            <button type="button" onClick={() => exportData(filtered.filter((point) => selectedIds.includes(point.id)))}>批量导出</button>
            <button type="button" onClick={() => setDetailPoint(filtered.find((point) => selectedIds.includes(point.id)) || null)}>批量查看</button>
            <button type="button" onClick={onMapSelected}>批量跳到地图</button>
            <button type="button" onClick={() => setSelectedIds([])}>清空选择</button>
          </div>
        </section>
      )}
      <PointsTable
        points={pagePoints}
        photos={data.photos}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        sort={sort}
        setSort={setSort}
        onView={setDetailPoint}
        onEdit={onEditPoint}
        onSite={onOpenSite}
        onDispatch={onDispatchPoint}
        onMedia={onOpenMedia}
        onAcceptance={onOpenAcceptance}
        onDelete={onDeletePoint}
        tasks={data.tasks}
        projects={data.projects}
        workers={data.workers}
      />
      <footer className="table-pagination">
        <span>共 {filtered.length} 条，当前第 {page}/{totalPages} 页</span>
        <select value={filters.pageSize} onChange={(event) => setFilters((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))}>
          {[10, 20, 50].map((size) => <option key={size} value={size}>每页 {size} 条</option>)}
        </select>
        <button type="button" disabled={page <= 1} onClick={() => setFilters((current) => ({ ...current, page: page - 1 }))}>上一页</button>
        <button type="button" disabled={page >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: page + 1 }))}>下一页</button>
      </footer>
      <PointDetailDrawer
        point={detailPoint}
        photos={data.photos}
        tasks={data.tasks}
        workers={data.workers}
        onClose={() => setDetailPoint(null)}
        onEdit={onEditPoint}
        onSite={onOpenSite}
      />
    </div>
  );
}
