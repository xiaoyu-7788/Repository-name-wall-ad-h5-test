import React, { useMemo, useState } from "react";

import { AmapView } from "../components/map/AmapView";
import { MapSidebar } from "../components/map/MapSidebar";
import { MapToolbar } from "../components/map/MapToolbar";
import {
  getCaptainName,
  getCaptainPhone,
  getPointAnomalies,
  getPointStatus,
  getProjectName,
  getScoutName,
  getScoutPhone,
  isWorkerEnabled,
  isWorkerOnline,
  normalizeProjects,
  pointTags,
  taskPointId,
  taskWorkerId,
} from "../lib/domain";

export function MapConsolePage({
  data,
  activeProject,
  setActiveProject,
  selectedIds,
  setSelectedIds,
  selectedPointId,
  setSelectedPointId,
  dispatchWorkerId,
  setDispatchWorkerId,
  onDispatchSelected,
  onOpenSite,
  onEditPoint,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [anomalyFilter, setAnomalyFilter] = useState("全部异常");
  const [viewMode, setViewMode] = useState("dispatch");
  const [selectionMode, setSelectionMode] = useState("browse");
  const [mapMode, setMapMode] = useState("standard");
  const [showPoints, setShowPoints] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [currentProjectOnly, setCurrentProjectOnly] = useState(true);
  const [sideTab, setSideTab] = useState("点位筛选");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [areaSelection, setAreaSelection] = useState(null);
  const projects = normalizeProjects(data.projects, data.points);

  const filteredPoints = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return data.points.filter((point) => {
      const projectOk = !currentProjectOnly || activeProject === "all" || getProjectName(point) === activeProject;
      const status = getPointStatus(point);
      const statusOk = statusFilter === "全部" || status === statusFilter;
      const anomalies = getPointAnomalies(point, data.photos, data.tasks, data.projects);
      const assignedWorkers = data.tasks
        .filter((task) => String(taskPointId(task)) === String(point.id))
        .map((task) => data.workers.find((worker) => String(worker.id) === String(taskWorkerId(task)))?.name)
        .filter(Boolean);
      const anomalyOk = anomalyFilter === "全部异常" || anomalies.includes(anomalyFilter);
      const acceptanceOk = viewMode !== "acceptance" || ["已上传素材", "待验收", "已完成", "需复查"].includes(status) || anomalies.some((item) => item.startsWith("缺"));
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
        ...pointTags(point, data.photos),
        ...assignedWorkers,
        ...anomalies,
      ].join(" ").toLowerCase();
      return projectOk && statusOk && anomalyOk && acceptanceOk && (!keyword || haystack.includes(keyword));
    });
  }, [activeProject, currentProjectOnly, data.points, data.photos, data.tasks, data.projects, search, statusFilter, anomalyFilter, viewMode]);

  const activeWorkers = data.workers.filter(isWorkerEnabled);
  const selectedPoint = data.points.find((point) => point.id === selectedPointId) || filteredPoints[0] || null;
  const selectedWorker = data.workers.find((worker) => worker.id === selectedWorkerId) || null;
  const areaPoints = useMemo(() => {
    const ids = new Set((areaSelection?.pointIds || []).map(String));
    return filteredPoints.filter((point) => ids.has(String(point.id)));
  }, [areaSelection, filteredPoints]);
  const areaSummary = useMemo(() => {
    const unassigned = areaPoints.filter((point) => !data.tasks.some((task) => String(taskPointId(task)) === String(point.id))).length;
    const abnormal = areaPoints.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).length).length;
    return {
      label: areaSelection?.label || "未选择区域",
      type: areaSelection?.type || "",
      pointCount: areaPoints.length,
      unassigned,
      abnormal,
      onlineWorkers: activeWorkers.filter(isWorkerOnline).length,
    };
  }, [areaPoints, areaSelection, activeWorkers, data.tasks, data.photos, data.projects]);

  React.useEffect(() => {
    if (viewMode === "track") setSideTab("轨迹回放");
    if (viewMode === "acceptance" && sideTab === "派单") setSideTab("点位筛选");
  }, [viewMode, sideTab]);

  React.useEffect(() => {
    if (selectionMode === "rectangle" || selectionMode === "circle") {
      setSideTab("区域汇总");
    }
  }, [selectionMode]);

  async function dispatchFromMap() {
    await onDispatchSelected(filteredPoints);
    setSideTab("派单");
  }

  function togglePointSelection(point) {
    setSelectedIds((current) => current.includes(point.id) ? current.filter((id) => id !== point.id) : [...current, point.id]);
  }

  function handleAreaSelect(selection) {
    setAreaSelection({ ...selection, createdAt: new Date().toISOString() });
    setSelectedIds(selection.pointIds);
    setSideTab("区域汇总");
  }

  const mapSummaryCards = [
    { label: "当前筛选点位", value: filteredPoints.length, hint: "按项目/状态/异常联动" },
    { label: "已选点位", value: selectedIds.length, hint: "可直接批量派单" },
    { label: "在线师傅", value: activeWorkers.filter(isWorkerOnline).length, hint: "含可接单队伍" },
    { label: "区域异常", value: areaSummary.abnormal, hint: "拖拽选区后更新" },
  ];

  return (
    <div className="map-console-page enterprise-page">
      <header className="enterprise-page-header">
        <div className="enterprise-page-title">
          <span>管理后台 / Map Console</span>
          <div className="enterprise-page-heading">地图调度</div>
        </div>
        <div className="enterprise-page-actions">
          <button type="button" className="blue-button" onClick={() => setSideTab("点位筛选")}>点位筛选</button>
          <button type="button" onClick={() => setSideTab("派单")}>批量派单</button>
        </div>
      </header>

      <section className="enterprise-kpi-grid">
        {mapSummaryCards.map((item) => (
          <article key={item.label} className="enterprise-kpi-card">
            <span>{item.label}</span>
            <b>{item.value}</b>
            <small>{item.hint}</small>
          </article>
        ))}
      </section>

      <section className="enterprise-card">
        <MapToolbar
          projects={projects}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          search={search}
          setSearch={setSearch}
          anomalyFilter={anomalyFilter}
          setAnomalyFilter={setAnomalyFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          mapMode={mapMode}
          setMapMode={setMapMode}
          showPoints={showPoints}
          setShowPoints={setShowPoints}
          showWorkers={showWorkers}
          setShowWorkers={setShowWorkers}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          onlineOnly={onlineOnly}
          setOnlineOnly={setOnlineOnly}
          currentProjectOnly={currentProjectOnly}
          setCurrentProjectOnly={setCurrentProjectOnly}
        />
      </section>

      <section className="enterprise-three-column enterprise-map-layout map-console-layout">
        <section className="enterprise-card">
          <div className="enterprise-card-header">
            <div>
              <span>地图</span>
              <h3>调度画布</h3>
            </div>
          </div>
          <AmapView
            points={filteredPoints}
            workers={activeWorkers}
            photos={data.photos}
            selectedPoint={selectedPoint}
            selectedWorker={selectedWorker}
            selectedIds={selectedIds}
            mapMode={mapMode}
            viewMode={viewMode}
            selectionMode={selectionMode}
            showPoints={showPoints}
            showWorkers={showWorkers}
            showLabels={showLabels}
            onlineOnly={onlineOnly}
            onSelectPoint={(point) => {
              setSelectedPointId(point.id);
              setSideTab("点位详情");
            }}
            onSelectWorker={(worker) => {
              setSelectedWorkerId(worker.id);
              setSideTab("师傅详情");
            }}
            onTogglePointSelection={togglePointSelection}
            onAreaSelect={handleAreaSelect}
          />
        </section>

        <section className="enterprise-card">
          <div className="enterprise-card-header">
            <div>
              <span>队列与汇总</span>
              <h3>左侧点位池</h3>
            </div>
          </div>
          <MapSidebar
            tab={sideTab}
            setTab={setSideTab}
            points={filteredPoints}
            workers={activeWorkers}
            selectedPoint={selectedPoint}
            selectedWorker={selectedWorker}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            photos={data.photos}
            tasks={data.tasks}
            projects={data.projects}
            trackLogs={data.trackLogs}
            areaSelection={areaSelection}
            areaPoints={areaPoints}
            areaSummary={areaSummary}
            dispatchWorkerId={dispatchWorkerId}
            setDispatchWorkerId={setDispatchWorkerId}
            onDispatch={dispatchFromMap}
            onOpenSite={onOpenSite}
            onEditPoint={onEditPoint}
            onSelectPoint={(point) => {
              setSelectedPointId(point.id);
              setSideTab("点位详情");
            }}
          />
        </section>
      </section>
    </div>
  );
}
