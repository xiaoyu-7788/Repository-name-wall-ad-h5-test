import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { isLocalDataMode } from "./apiClient";
import { supabaseEnv } from "./supabaseClient";
import { useH5Data } from "./hooks/useH5Data";
import { AdminLayout } from "./components/layout/AdminLayout";
import {
  BatchImportModal,
  DiagnosisModal,
  MobileMapPack,
  PointEditorModal,
  SiteViewerModal,
  WorkerPage,
} from "./components/shared/legacyModals";
import { DashboardPage } from "./pages/DashboardPage";
import { DispatchPage } from "./pages/DispatchPage";
import { MapConsolePage } from "./pages/MapConsolePage";
import { MediaPage } from "./pages/MediaPage";
import { PointsPage } from "./pages/PointsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SystemHealthPage } from "./pages/SystemHealthPage";
import { WorkersPage } from "./pages/WorkersPage";
import {
  getRoute,
  hasConfiguredPublicOrigin,
  isWorkerEnabled,
  isLocalShareHostname,
  normalizeProjects,
  pagePath,
  safeJson,
  uid,
} from "./lib/domain";
import "./styles.css";

function AdminWorkspace({ data, initialPage = "dashboard" }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [activeProject, setActiveProject] = useState("all");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState("");
  const [dispatchWorkerId, setDispatchWorkerId] = useState("");
  const [timeRange, setTimeRange] = useState("近7天");
  const [globalSearch, setGlobalSearch] = useState("");
  const [createWorkerSignal, setCreateWorkerSignal] = useState(0);
  const [mediaPointFilter, setMediaPointFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [sitePoint, setSitePoint] = useState(null);
  const [editPoint, setEditPoint] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [localNotice, setLocalNotice] = useState("");
  const projects = useMemo(() => normalizeProjects(data.projects, data.points), [data.projects, data.points]);
  const activeWorkers = useMemo(() => data.workers.filter(isWorkerEnabled), [data.workers]);

  useEffect(() => {
    let cancelled = false;
    async function resolveShareOrigin() {
      if (!isLocalShareHostname() || hasConfiguredPublicOrigin()) return;
      try {
        const health = await data.healthCheck();
        const lanAdminUrl = health?.lanAdminUrls?.[0] || "";
        if (!lanAdminUrl || cancelled) return;
        const url = new URL(lanAdminUrl);
        window.__WALL_AD_SHARE_ORIGIN__ = url.origin;
        window.__WALL_AD_LAN_ADMIN_URL__ = lanAdminUrl;
      } catch {
        // If the API is unavailable, link generation still falls back to a LAN-IP template instead of localhost.
      }
    }
    resolveShareOrigin();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPointId && data.points[0]) setSelectedPointId(data.points[0].id);
    if (selectedPointId && !data.points.some((point) => point.id === selectedPointId)) setSelectedPointId(data.points[0]?.id || "");
  }, [data.points, selectedPointId]);

  useEffect(() => {
    if ((!dispatchWorkerId || !activeWorkers.some((worker) => worker.id === dispatchWorkerId)) && activeWorkers[0]) {
      setDispatchWorkerId(activeWorkers[0].id);
    }
  }, [activeWorkers, dispatchWorkerId]);

  useEffect(() => {
    const timer = window.setInterval(() => data.refreshWorkers(), 10000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialPage !== activePage) setActivePage(initialPage);
  }, [initialPage]);

  function navigate(page) {
    setActivePage(page);
    const path = pagePath(page);
    if (window.location.pathname !== path) window.history.pushState({ page }, "", path);
  }

  function exportJson() {
    const blob = new Blob([safeJson({ projects, workers: data.workers, points: data.points, tasks: data.tasks, photos: data.photos, exportedAt: new Date().toISOString() })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wall-ad-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function runDiagnosis() {
    const result = await data.diagnose();
    setDiagnosis(result);
    setModal("diagnosis");
    return result;
  }

  async function dispatchSelected(filteredPoints = data.points) {
    const worker = activeWorkers.find((item) => item.id === dispatchWorkerId) || activeWorkers[0];
    const points = filteredPoints.filter((point) => selectedIds.includes(point.id));
    if (!worker) {
      setLocalNotice("请选择师傅");
      return;
    }
    if (!points.length) {
      setLocalNotice("请至少选择一个点位");
      return;
    }
    setLocalNotice("");
    await data.dispatchToWorker(worker, points.map((point) => point.id));
    setSelectedIds([]);
  }

  function dispatchPoint(point) {
    if (point) setSelectedIds([point.id]);
    navigate("dispatch");
  }

  function handleQuickAction(action) {
    if (action === "new-point") {
      const defaultProject = activeProject === "all" ? projects.find((item) => item.id !== "all")?.name || "加多宝项目" : activeProject;
      setEditPoint({ id: uid("point"), title: "", status: "待派单", project_name: defaultProject });
      navigate("points");
      return;
    }
    if (action === "batch-import") {
      setModal("batch");
      navigate("points");
      return;
    }
    if (action === "quick-dispatch") {
      navigate("dispatch");
      return;
    }
    if (action === "new-worker") {
      setCreateWorkerSignal((value) => value + 1);
      navigate("workers");
      return;
    }
    if (action === "download-media") {
      navigate("media");
      setMediaPointFilter("");
      setLocalNotice("已进入素材管理，可按当前筛选结果批量下载或导出清单。");
    }
  }

  function pageContent() {
    const common = {
      data,
      activeProject,
      setActiveProject,
      selectedIds,
      setSelectedIds,
      selectedPointId,
      setSelectedPointId,
      dispatchWorkerId,
      setDispatchWorkerId,
    };
    if (activePage === "map") {
      return (
        <MapConsolePage
          {...common}
          onDispatchSelected={dispatchSelected}
          onOpenSite={setSitePoint}
          onEditPoint={setEditPoint}
        />
      );
    }
    if (activePage === "points") {
      return (
        <PointsPage
          {...common}
          timeRange={timeRange}
          globalSearch={globalSearch}
          onNewPoint={setEditPoint}
          onBatchImport={() => setModal("batch")}
          onEditPoint={setEditPoint}
          onOpenSite={setSitePoint}
          onDeletePoint={(point) => {
            if (window.confirm(`确认删除点位 ${point.title || point.id} 吗？`)) data.removePoint(point.id);
          }}
          onDispatchPoint={dispatchPoint}
          onMapSelected={() => navigate("map")}
          onOpenMedia={(point) => {
            setMediaPointFilter(point.id);
            navigate("media");
          }}
          onOpenAcceptance={(point) => {
            setMediaPointFilter(point.id);
            navigate("media");
            setLocalNotice(`${point.title || "点位"} 已进入素材验收视图，请核对齐套状态和异常项。`);
          }}
        />
      );
    }
    if (activePage === "workers") {
      return <WorkersPage data={data} projects={projects} dispatchWorkerId={dispatchWorkerId} setDispatchWorkerId={setDispatchWorkerId} onNotice={setLocalNotice} createWorkerSignal={createWorkerSignal} globalSearch={globalSearch} />;
    }
    if (activePage === "dispatch") {
      return <DispatchPage {...common} onDispatch={dispatchSelected} />;
    }
    if (activePage === "projects") {
      return <ProjectsPage data={data} projects={projects} activeProject={activeProject} setActiveProject={setActiveProject} onNavigate={navigate} />;
    }
    if (activePage === "media") {
      return <MediaPage data={data} activeProject={activeProject} timeRange={timeRange} globalSearch={globalSearch} focusPointId={mediaPointFilter} onOpenSite={setSitePoint} />;
    }
    if (activePage === "system") {
      return <SystemHealthPage data={data} onRunDiagnosis={data.diagnose} />;
    }
    return <DashboardPage data={data} activeProject={activeProject} onNavigate={navigate} setActiveProject={setActiveProject} />;
  }

  return (
    <AdminLayout
      activePage={activePage}
      activeProject={activeProject}
      setActiveProject={setActiveProject}
      projects={projects}
      data={{ ...data, message: localNotice || data.message }}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      onNavigate={navigate}
      onRefresh={data.loadAll}
      onSearchFocus={undefined}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      globalSearch={globalSearch}
      setGlobalSearch={(value) => {
        setGlobalSearch(value);
        if (value.trim() && ["dashboard", "system"].includes(activePage)) navigate("points");
      }}
      onQuickAction={handleQuickAction}
    >
      {isLocalDataMode && (
        <section className="warn">
          当前是本地演示模式。电脑后台和同浏览器移动端可直接联动；跨设备真实测试请使用 mock-server 或 production-api。
        </section>
      )}
      {data.dispatchDebug && (
        <section className="info">
          <strong>{localNotice || data.message}</strong>
          <details className="debug-panel" open={Boolean(data.dispatchDebug.stage || data.dispatchDebug.details)}>
            <summary>派单调试信息</summary>
            <pre>{safeJson(data.dispatchDebug)}</pre>
          </details>
        </section>
      )}
      {pageContent()}
      <div className="floating-admin-actions">
        <button type="button" onClick={data.seedDemoData}>写入演示数据</button>
        <button type="button" onClick={() => setModal("batch")}>批量新增点位</button>
        <button type="button" onClick={exportJson}>导出数据 JSON</button>
        <button type="button" onClick={runDiagnosis}>接口诊断</button>
      </div>
      {modal === "batch" && (
        <BatchImportModal
          projects={projects.filter((project) => project.id !== "all")}
          onClose={() => setModal(null)}
          onImport={async (items) => {
            await data.addPoints(items);
            setModal(null);
          }}
        />
      )}
      {modal === "diagnosis" && (
        <DiagnosisModal result={diagnosis} onRun={runDiagnosis} onClose={() => setModal(null)} />
      )}
      {editPoint && (
        <PointEditorModal
          point={editPoint}
          projects={projects.filter((project) => project.id !== "all")}
          workers={activeWorkers}
          photos={data.photos}
          onClose={() => setEditPoint(null)}
          onSave={async (point) => {
            await data.updatePoint(point);
            setEditPoint(null);
          }}
          onUpload={async (file, point, worker, kind) => {
            await data.uploadPhoto({ file, point, worker, kind });
            await data.loadAll();
          }}
        />
      )}
      {sitePoint && (
        <SiteViewerModal
          point={sitePoint}
          photos={data.photos}
          onClose={() => setSitePoint(null)}
          onEdit={() => {
            setEditPoint(sitePoint);
            setSitePoint(null);
          }}
        />
      )}
    </AdminLayout>
  );
}

function App() {
  const route = getRoute();
  const data = useH5Data();

  useEffect(() => {
    if (route.page === "worker") {
      if (supabaseEnv.forceLocalDemo) data.loadWorkerTasks(route.workerId);
      return undefined;
    }
    data.loadAll();
    return undefined;
  }, [route.page, route.workerId]);

  if (route.page === "worker") return <WorkerPage data={data} workerId={route.workerId} />;
  if (route.page === "mobile-map") return <MobileMapPack data={data} />;
  return <AdminWorkspace data={data} initialPage={route.adminPage || "dashboard"} />;
}

createRoot(document.getElementById("root")).render(<App />);
