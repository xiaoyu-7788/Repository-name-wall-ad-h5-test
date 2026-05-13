import React, { useMemo, useState } from "react";

import { PointDetailDrawer } from "../components/points/PointDetailDrawer";
import { PointFilters } from "../components/points/PointFilters";
import { PointsTable } from "../components/points/PointsTable";
import {
  assignedWorkersForPoint,
  getPointAnomalies,
  getPointCode,
  getPointDisplayModel,
  getPointKCode,
  getPointStatus,
  getProjectName,
  isDateInRange,
  normalizeProjects,
  pointTags,
  safeJson,
  taskPointId,
  taskWorkerId,
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
    status: "全部状态",
    anomaly: "异常筛选",
    workerId: "all",
    tag: "全部标签",
    timeRange: timeRange || "近7天",
    search: "",
    page: 1,
    pageSize: 10,
  });
  const [sort, setSort] = useState({ key: "updated", dir: "desc" });
  const [detailPoint, setDetailPoint] = useState(null);
  const [bulkHint, setBulkHint] = useState("");
  const projects = normalizeProjects(data.projects, data.points);
  const tags = useMemo(() => [...new Set(data.points.flatMap((point) => pointTags(point, data.photos)))].slice(0, 60), [data.points, data.photos]);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, project: activeProject, page: 1 }));
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
      const mapped = getPointDisplayModel(point, { projects: data.projects, tasks: data.tasks, workers: data.workers });
      const projectName = mapped.projectName;
      const projectOk = filters.project === "all" || projectName === filters.project;
      const statusOk = filters.status === "全部状态" || getPointStatus(point) === filters.status;
      const anomalies = getPointAnomalies(point, data.photos, data.tasks, data.projects);
      const anomalyOk = filters.anomaly === "异常筛选" || anomalies.includes(filters.anomaly);
      const pointTasks = data.tasks.filter((task) => String(taskPointId(task)) === String(point.id));
      const workerOk = filters.workerId === "all"
        || pointTasks.some((task) => String(taskWorkerId(task)) === String(filters.workerId))
        || data.workers.some((worker) => String(worker.id) === String(filters.workerId) && mapped.currentWorkerName === worker.name);
      const tagOk = filters.tag === "全部标签" || pointTags(point, data.photos).includes(filters.tag);
      const timeOk = isDateInRange(point.updated_at || point.completed_at || point.created_at, filters.timeRange);
      const assignedWorkers = assignedWorkersForPoint(point, data.tasks, data.workers).map((worker) => worker.name).join(" ");
      const taskWorkers = pointTasks.map((task) => String(taskWorkerId(task))).join(" ");
      const haystack = [
        getPointCode(point),
        projectName,
        mapped.address,
        getPointKCode(point),
        mapped.currentWorkerName,
        mapped.captainName,
        mapped.scoutName,
        point?.landlord_name,
        point?.landlord_phone,
        assignedWorkers,
        taskWorkers,
        anomalies.join(" "),
      ].join(" ").toLowerCase();
      return projectOk && statusOk && anomalyOk && workerOk && tagOk && timeOk && (!keyword || haystack.includes(keyword));
    });

    const sorted = [...base].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const value = (point) => {
        if (sort.key === "project") return getProjectName(point, data.projects);
        if (sort.key === "status") return getPointStatus(point);
        if (sort.key === "updated") return new Date(point.updated_at || point.created_at || 0).getTime();
        return getPointCode(point);
      };
      return String(value(a)).localeCompare(String(value(b)), "zh-CN", { numeric: true }) * dir;
    });
    return sorted;
  }, [data.points, data.photos, data.tasks, data.workers, data.projects, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const pagePoints = filtered.slice((page - 1) * filters.pageSize, page * filters.pageSize);
  const selectedCount = selectedIds.length;

  function exportData(items = filtered) {
    const blob = new Blob([safeJson({ points: items, exportedAt: new Date().toISOString() })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wall-points-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadImportTemplate() {
    const csv = "点位编号,地址,K码,房东,房东手机号,施工队长,施工队长手机号,找墙队伍,找墙队伍手机号,项目,经度,纬度\n";
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wall-points-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateProject(value) {
    setActiveProject(value);
    setFilters((current) => ({ ...current, project: value, page: 1 }));
  }

  function showBatchHint(action) {
    const suffix = selectedCount ? `已选 ${selectedCount} 个点位` : "请先点击表格行选择点位";
    setBulkHint(`${action}：${suffix}`);
  }

  return (
    <div className="points-page">
      <PointFilters
        projects={projects}
        workers={data.workers}
        tags={tags}
        filters={filters}
        setFilters={(updater) => {
          setFilters((current) => {
            const next = typeof updater === "function" ? updater(current) : updater;
            if (next.project !== current.project) setActiveProject(next.project);
            return next;
          });
        }}
        onBatchTag={() => showBatchHint("批量打标签")}
        onBatchRemoveTag={() => showBatchHint("批量移除标签")}
        onImportTemplate={downloadImportTemplate}
      />

      <section className="pointBatchBar" aria-live="polite">
        <div>
          <b>{selectedCount ? `已选 ${selectedCount} 个点位` : "点击任意点位行即可多选"}</b>
          {bulkHint && <span>{bulkHint}</span>}
        </div>
        {selectedCount > 0 && (
          <div className="pointBatchActions">
            <button type="button" onClick={() => showBatchHint("批量打标签")}>批量打标签</button>
            <button type="button" onClick={() => showBatchHint("批量移除标签")}>批量移除标签</button>
            <button type="button" onClick={() => onDispatchPoint(null)}>批量派单</button>
            <button type="button" onClick={() => exportData(filtered.filter((point) => selectedIds.includes(point.id)))}>导出所选</button>
          </div>
        )}
      </section>

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

      <footer className="table-pagination pointsPagination">
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
        projects={data.projects}
        onClose={() => setDetailPoint(null)}
        onEdit={onEditPoint}
        onSite={onOpenSite}
      />
    </div>
  );
}
