import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  API_BASE_URL,
  DATA_MODE,
  deleteWallPoint,
  dispatchPoints as dispatchPointsApi,
  getDataModeLabel,
  isLocalDataMode,
  isProxyDataMode,
  proxyApi,
  saveProject,
} from "./apiClient";
import { supabaseEnv } from "./supabaseClient";
import "./styles.css";

const STATUS = ["待施工", "施工中", "已完成", "需复查"];
const MEDIA_TABS = ["现场照片", "720全景", "全景视频", "水印图片"];
const DEFAULT_PROJECT_COLORS = {
  加多宝项目: "#ef4444",
  阿康化肥项目: "#16a34a",
  能量饮料项目: "#2563eb",
  未分配项目: "#64748b",
};

function nowIso() {
  return new Date().toISOString();
}

function cnTime(value = new Date()) {
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getRoute() {
  const url = new URL(window.location.href);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "worker") return { page: "worker", workerId: parts[1] || url.searchParams.get("worker") || "w1" };
  if (parts[0] === "mobile-map") return { page: "mobile-map" };
  return { page: "admin" };
}

function classifyApiError(error) {
  const message = error?.message || error?.error || String(error || "未知错误");
  if (error?.category || error?.detail) {
    return { category: error.category || "接口连接失败", detail: error.detail || message };
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return { category: "接口连接失败", detail: "浏览器无法访问 VITE_API_BASE_URL，请检查局域网 IP、端口、跨域和防火墙。" };
  }
  return { category: "业务处理失败", detail: message };
}

function normalizeWorkerCode(worker) {
  return worker?.code || worker?.worker_key || worker?.slug || worker?.id || "w1";
}

function getProjectName(point) {
  return point?.project_name || point?.projectName || "未分配项目";
}

function getPointStatus(point) {
  return STATUS.includes(point?.status) ? point.status : "待施工";
}

function getCity(point) {
  if (point?.city) return point.city;
  const address = point?.address || "";
  const match = address.match(/([\u4e00-\u9fa5]{2,6})市/);
  return match?.[1] || "未知城市";
}

function getCaptainName(point) {
  return point?.captain_name || point?.captainName || point?.leader_name || "未登记";
}

function getCaptainPhone(point) {
  return point?.captain_phone || point?.captainPhone || point?.leader_phone || "未登记";
}

function getScoutName(point) {
  return point?.scout_name || point?.scoutName || point?.finder_name || "未登记";
}

function getScoutPhone(point) {
  return point?.scout_phone || point?.scoutPhone || point?.finder_phone || "未登记";
}

function mediaKind(photo) {
  const raw = `${photo?.kind || photo?.file_name || photo?.url || ""}`.toLowerCase();
  const type = `${photo?.content_type || photo?.type || ""}`.toLowerCase();
  if (raw.includes("水印")) return "水印图片";
  if (raw.includes("720") || raw.includes("全景")) return type.includes("video") || raw.includes("视频") ? "全景视频" : "720全景";
  if (type.includes("video") || /\.(mp4|mov|m4v|webm)$/i.test(raw)) return "全景视频";
  return "现场照片";
}

function mediaCounts(point, photos) {
  const list = photos.filter((photo) => photo.point_id === point.id || photo.pointId === point.id);
  return {
    total: list.length,
    site: list.filter((photo) => mediaKind(photo) === "现场照片").length,
    pano: list.filter((photo) => mediaKind(photo) === "720全景").length,
    video: list.filter((photo) => mediaKind(photo) === "全景视频").length,
    watermark: list.filter((photo) => mediaKind(photo) === "水印图片").length,
  };
}

function pointTags(point, photos) {
  const counts = mediaCounts(point, photos);
  return [
    getPointStatus(point),
    getProjectName(point),
    getCity(point),
    counts.total ? "有照片" : "无照片",
    counts.pano ? "有720全景" : "无720全景",
    counts.video ? "有视频" : "无视频",
    counts.watermark ? "有水印图" : "无水印图",
    `施工队长:${getCaptainName(point)}`,
    `找墙队伍:${getScoutName(point)}`,
  ];
}

function amapNavigationUrl(point) {
  const lng = Number(point?.lng || 0);
  const lat = Number(point?.lat || 0);
  const name = encodeURIComponent(point?.title || "墙体点位");
  return `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car&policy=1&src=wall-ad-h5&coordinate=gaode&callnative=1`;
}

function amapMarkerUrl(point) {
  const lng = Number(point?.lng || 0);
  const lat = Number(point?.lat || 0);
  const name = encodeURIComponent(`${point?.title || "墙体点位"}-${point?.address || ""}`);
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${name}&src=wall-ad-h5&coordinate=gaode&callnative=1`;
}

function mapPointStyle(point, points, index) {
  const withCoord = points.filter((item) => item.lng != null && item.lat != null);
  if (!withCoord.length || point.lng == null || point.lat == null) {
    return { left: `${18 + (index * 17) % 62}%`, top: `${20 + (index * 19) % 58}%` };
  }
  const lngs = withCoord.map((item) => Number(item.lng));
  const lats = withCoord.map((item) => Number(item.lat));
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const left = maxLng === minLng ? 50 : 10 + ((Number(point.lng) - minLng) / (maxLng - minLng)) * 80;
  const top = maxLat === minLat ? 50 : 84 - ((Number(point.lat) - minLat) / (maxLat - minLat)) * 70;
  return { left: `${left}%`, top: `${top}%` };
}

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function useH5Data() {
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [points, setPoints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [trackLogs, setTrackLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dispatchDebug, setDispatchDebug] = useState(null);
  const [dataSource, setDataSource] = useState(getDataModeLabel());

  function applyState(state, sourceLabel = getDataModeLabel()) {
    setProjects(state.projects || []);
    setWorkers(state.workers || []);
    setPoints(state.points || state.wallPoints || []);
    setTasks(state.tasks || state.dispatchTasks || []);
    setPhotos(state.photos || state.pointMedia || []);
    setTrackLogs(state.trackLogs || []);
    setDataSource(sourceLabel);
  }

  async function loadAll() {
    setLoading(true);
    try {
      const state = await proxyApi.loadState();
      applyState(state, isLocalDataMode ? "本地演示数据" : "国内接口数据");
      if (!message) {
        setMessage(isLocalDataMode ? "当前使用本地演示模式，无后端也能完成派单和上传演示。" : `已连接 ${API_BASE_URL}`);
      }
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`${issue.category}：${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkerTasks(workerId) {
    setLoading(true);
    try {
      const state = await proxyApi.workerTasks(workerId);
      applyState({
        projects,
        workers: state.worker ? [state.worker] : state.workers || workers,
        points: state.points || [],
        tasks: state.tasks || [],
        photos: state.photos || [],
        trackLogs: state.trackLogs || trackLogs,
      }, isProxyDataMode ? "真实派单任务" : "本地演示任务");
      setMessage(`已读取 ${state.points?.length || 0} 个派单点位。`);
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`读取师傅任务失败：${issue.category}，${issue.detail}`);
      await loadAll();
    } finally {
      setLoading(false);
    }
  }

  async function seedDemoData() {
    setLoading(true);
    try {
      const state = await proxyApi.seedDemo();
      applyState(state, isLocalDataMode ? "本地演示数据" : "国内接口演示数据");
      setMessage("已写入演示数据，可直接筛选点位并派单给师傅移动端。");
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`写入演示数据失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function addPoints(newPoints) {
    if (!newPoints.length) return;
    setLoading(true);
    try {
      await proxyApi.addPoints(newPoints);
      setMessage(`已新增 ${newPoints.length} 个点位。`);
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`新增点位失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function updatePoint(point) {
    setLoading(true);
    try {
      await proxyApi.updatePoint(point.id, point);
      setMessage(`已保存点位 ${point.title || point.id}。`);
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`保存点位失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function removePoint(pointId) {
    setLoading(true);
    try {
      await deleteWallPoint(pointId);
      setMessage("点位已删除。");
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`删除点位失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function dispatchToWorker(worker, pointIds) {
    const requestPayload = {
      workerId: worker.id,
      worker_id: worker.id,
      worker_key: normalizeWorkerCode(worker),
      worker_name: worker.name,
      worker_phone: worker.phone,
      pointIds,
      point_ids: pointIds,
    };
    setDispatchDebug({ path: "/api/dispatch", request: requestPayload });
    setLoading(true);
    try {
      const result = await dispatchPointsApi(requestPayload);
      setDispatchDebug({ path: "/api/dispatch", request: requestPayload, response: result, status: 200 });
      setMessage(`已成功发送 ${pointIds.length} 个点位给 ${worker.name}`);
      await loadAll();
      return result;
    } catch (error) {
      const issue = classifyApiError(error);
      setDispatchDebug({
        path: "/api/dispatch",
        request: requestPayload,
        status: error.status,
        response: error.data,
        stage: error.data?.stage,
        message: error.message,
        details: issue.detail,
      });
      setMessage(`派单失败：${issue.category}，${issue.detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto({ file, point, worker, kind }) {
    const result = await proxyApi.upload({ file, point, worker, kind });
    setMessage(`${point.title} 已上传资料，点位状态自动更新为已完成。`);
    return result;
  }

  async function saveProjectDraft(project) {
    setLoading(true);
    try {
      await saveProject(project);
      setMessage(`项目 ${project.name} 已保存。`);
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`保存项目失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveTrack(log) {
    await proxyApi.saveTrackLog(log);
    await loadAll();
  }

  async function diagnose() {
    try {
      const result = await proxyApi.diagnose();
      setMessage(`接口诊断完成：${result.message || result.label || "当前模式可用"}`);
      return result;
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`接口诊断失败：${issue.category}，${issue.detail}`);
      return { ok: false, error: issue };
    }
  }

  return {
    projects,
    workers,
    points,
    tasks,
    photos,
    trackLogs,
    loading,
    message,
    dispatchDebug,
    dataSource,
    loadAll,
    loadWorkerTasks,
    seedDemoData,
    addPoints,
    updatePoint,
    removePoint,
    dispatchToWorker,
    uploadPhoto,
    saveProjectDraft,
    saveTrack,
    diagnose,
  };
}

function StatusPill({ status }) {
  const value = status || "待施工";
  const className = value === "已完成" ? "ok" : value === "施工中" ? "doing" : value === "需复查" ? "bad" : "todo";
  return <span className={`pill ${className}`}>{value}</span>;
}

function Modal({ title, subtitle, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className={`modal-card ${wide ? "wide" : ""}`}>
        <header className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭">×</button>
        </header>
        {children}
      </section>
    </div>
  );
}

function AdminPage({ data }) {
  const [activeProject, setActiveProject] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [activeTags, setActiveTags] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState("");
  const [dispatchWorkerId, setDispatchWorkerId] = useState("");
  const [mapMode, setMapMode] = useState("standard");
  const [modal, setModal] = useState(null);
  const [sitePoint, setSitePoint] = useState(null);
  const [editPoint, setEditPoint] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [localNotice, setLocalNotice] = useState("");

  const projects = useMemo(() => {
    const seen = new Set();
    const normalized = data.projects
      .filter((project) => project.id !== "all" && project.name !== "全部项目")
      .map((project) => ({
        ...project,
        id: project.id || project.name,
        name: project.name || project.id,
        client: project.client || "未填写客户",
        month: project.month || "未设置年月",
        color: project.color || DEFAULT_PROJECT_COLORS[project.name] || "#2563eb",
      }))
      .filter((project) => {
        if (seen.has(project.name)) return false;
        seen.add(project.name);
        return true;
      });
    const fromPoints = [...new Set(data.points.map(getProjectName))]
      .filter((name) => name && !seen.has(name))
      .map((name) => ({ id: name, name, client: name.replace("项目", ""), month: "2026-05", color: DEFAULT_PROJECT_COLORS[name] || "#64748b" }));
    return [{ id: "all", name: "全部项目", client: "总部调度", month: "全部", color: "#0f172a" }, ...normalized, ...fromPoints];
  }, [data.projects, data.points]);

  useEffect(() => {
    if (!selectedPointId && data.points[0]) setSelectedPointId(data.points[0].id);
    if (selectedPointId && !data.points.some((point) => point.id === selectedPointId)) setSelectedPointId(data.points[0]?.id || "");
  }, [data.points, selectedPointId]);

  useEffect(() => {
    if (!dispatchWorkerId && data.workers[0]) setDispatchWorkerId(data.workers[0].id);
  }, [data.workers, dispatchWorkerId]);

  const filteredPoints = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return data.points.filter((point) => {
      const projectOk = activeProject === "all" || getProjectName(point) === activeProject;
      const statusOk = statusFilter === "全部" || getPointStatus(point) === statusFilter;
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
        getCity(point),
        ...pointTags(point, data.photos),
      ].join(" ").toLowerCase();
      const searchOk = !keyword || haystack.includes(keyword);
      const tagsOk = !activeTags.length || activeTags.every((tag) => pointTags(point, data.photos).includes(tag));
      return projectOk && statusOk && searchOk && tagsOk;
    });
  }, [activeProject, search, statusFilter, activeTags, data.points, data.photos]);

  const selectedPoint = data.points.find((point) => point.id === selectedPointId) || filteredPoints[0] || data.points[0] || null;
  const dispatchWorker = data.workers.find((worker) => worker.id === dispatchWorkerId) || data.workers[0] || null;
  const allTags = useMemo(() => [...new Set(data.points.flatMap((point) => pointTags(point, data.photos)))].slice(0, 32), [data.points, data.photos]);
  const currentPoints = activeProject === "all" ? data.points : data.points.filter((point) => getProjectName(point) === activeProject);
  const selectedDispatchPoints = filteredPoints.filter((point) => selectedIds.includes(point.id));
  const stats = {
    total: currentPoints.length,
    doing: currentPoints.filter((point) => getPointStatus(point) === "施工中").length,
    done: currentPoints.filter((point) => getPointStatus(point) === "已完成").length,
    online: data.workers.filter((worker) => worker.status !== "离线").length || data.workers.length,
  };

  function toggleSelect(pointId) {
    setSelectedIds((current) => current.includes(pointId) ? current.filter((id) => id !== pointId) : [...current, pointId]);
  }

  async function sendSelected() {
    if (!dispatchWorker) {
      setLocalNotice("请选择师傅");
      return;
    }
    if (!selectedDispatchPoints.length) {
      setLocalNotice("请至少选择一个点位");
      return;
    }
    setLocalNotice("");
    await data.dispatchToWorker(dispatchWorker, selectedDispatchPoints.map((point) => point.id));
    setSelectedIds([]);
  }

  async function runDiagnosis() {
    const result = await data.diagnose();
    setDiagnosis(result);
    setModal("diagnosis");
  }

  function exportJson() {
    const blob = new Blob([safeJson({ projects, workers: data.workers, points: data.points, tasks: data.tasks, photos: data.photos, exportedAt: nowIso() })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wall-ad-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-shell">
      <section className="hero-shell">
        <div className="hero-copy">
          <span className="system-title">全国墙体广告执行坐标系统</span>
          <h1>全国墙体广告执行坐标系统</h1>
          <p>项目切换、共用墙面、工人小车定位和后台轨迹记录，一屏完成点位筛选、派单、照片回传和状态闭环。</p>
          <div className="hero-meta">
            <span>数据模式：{getDataModeLabel(DATA_MODE)}</span>
            <span>{isLocalDataMode ? "localStorage 演示" : API_BASE_URL}</span>
            <span>{data.loading ? "同步中" : "已就绪"}</span>
          </div>
        </div>
        <div className="hero-actions">
          <a className="ghost-light" href="/worker/w1" target="_blank" rel="noreferrer">张师傅移动端</a>
          <a className="ghost-light" href="/worker/w2" target="_blank" rel="noreferrer">李师傅移动端</a>
          <button className="ghost-light" onClick={() => setModal("batch")}>批量新增点位</button>
          <button className="ghost-light" onClick={() => setEditPoint({ id: uid("point"), title: "", status: "待施工", project_name: activeProject === "all" ? "加多宝项目" : activeProject })}>新增点位</button>
          <button className="ghost-light" onClick={exportJson}>导出数据 JSON</button>
        </div>
      </section>

      <section className="project-switch" aria-label="项目切换">
        {projects.map((project) => {
          const count = project.id === "all" ? data.points.length : data.points.filter((point) => getProjectName(point) === project.name).length;
          const active = activeProject === project.id || activeProject === project.name;
          return (
            <button key={project.id} className={`project-card ${active ? "active" : ""}`} onClick={() => setActiveProject(project.id === "all" ? "all" : project.name)}>
              <span className="project-dot" style={{ background: project.color }} />
              <b>{project.name}</b>
              <small>{project.client} · {project.month}</small>
              <strong>{count} 个点位</strong>
            </button>
          );
        })}
      </section>

      <section className="admin-top-grid">
        <ProjectManager projects={projects.filter((project) => project.id !== "all")} onSave={data.saveProjectDraft} />
        <KimiConfig />
        <StabilityCheck />
      </section>

      <section className="metrics-grid">
        <article className="metric"><span>当前项目点位</span><b>{stats.total}</b><small>{activeProject === "all" ? "全部项目" : activeProject}</small></article>
        <article className="metric"><span>施工中</span><b>{stats.doing}</b><small>已派单待回传</small></article>
        <article className="metric"><span>已完成</span><b>{stats.done}</b><small>照片/视频已回传</small></article>
        <article className="metric"><span>在线小车</span><b>{stats.online}</b><small>定位轨迹可追踪</small></article>
      </section>

      {(localNotice || data.message || data.dispatchDebug) && (
        <section className="info">
          <strong>{localNotice || data.message}</strong>
          {data.dispatchDebug && (
            <details className="debug-panel" open={Boolean(data.dispatchDebug.stage || data.dispatchDebug.details)}>
              <summary>派单调试信息</summary>
              <pre>{safeJson(data.dispatchDebug)}</pre>
            </details>
          )}
        </section>
      )}

      {isLocalDataMode && (
        <section className="warn">
          当前是本地演示模式。电脑后台和同浏览器移动端可直接联动；跨设备真实测试请使用 mock-server 或 production-api。
        </section>
      )}

      <section className="workspace-grid">
        <div className="workspace-left">
          <MapExecutionDesk
            points={filteredPoints}
            allPoints={data.points}
            workers={data.workers}
            selectedPoint={selectedPoint}
            mapMode={mapMode}
            setMapMode={setMapMode}
            onOpenSite={(point) => { setSitePoint(point); setSelectedPointId(point.id); }}
            onEdit={(point) => setEditPoint(point)}
          />
          <TrackCenter workers={data.workers} tasks={data.tasks} points={data.points} trackLogs={data.trackLogs} onSaveTrack={data.saveTrack} />
        </div>
        <div className="workspace-right">
          <DispatchPanel
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            tags={allTags}
            activeTags={activeTags}
            setActiveTags={setActiveTags}
            filteredPoints={filteredPoints}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            toggleSelect={toggleSelect}
            workers={data.workers}
            dispatchWorkerId={dispatchWorkerId}
            setDispatchWorkerId={setDispatchWorkerId}
            sendSelected={sendSelected}
            selectedPoint={selectedPoint}
            setSelectedPointId={setSelectedPointId}
            photos={data.photos}
            onOpenExpanded={() => setModal("expanded")}
            onOpenSite={(point) => setSitePoint(point)}
            onEdit={(point) => setEditPoint(point)}
            onDelete={data.removePoint}
            loading={data.loading}
          />
          <SelectedPointDetails selectedPoint={selectedPoint} photos={data.photos} onOpenSite={() => selectedPoint && setSitePoint(selectedPoint)} onEdit={() => selectedPoint && setEditPoint(selectedPoint)} onDelete={() => selectedPoint && data.removePoint(selectedPoint.id)} />
          <div className="compact-actions">
            <button onClick={data.seedDemoData}>写入演示数据</button>
            <button onClick={runDiagnosis}>接口诊断</button>
            {dispatchWorker && <a className="open-worker-link" href={`/worker/${dispatchWorker.id}`} target="_blank" rel="noreferrer">打开该师傅移动端</a>}
          </div>
        </div>
      </section>

      <PhotoLibrary points={currentPoints} allPoints={data.points} photos={data.photos} activeProject={activeProject} />

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
      {modal === "expanded" && (
        <ExpandedListModal
          points={filteredPoints}
          photos={data.photos}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          toggleSelect={toggleSelect}
          workers={data.workers}
          dispatchWorkerId={dispatchWorkerId}
          setDispatchWorkerId={setDispatchWorkerId}
          sendSelected={sendSelected}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "diagnosis" && (
        <DiagnosisModal result={diagnosis} onRun={runDiagnosis} onClose={() => setModal(null)} />
      )}
      {editPoint && (
        <PointEditorModal
          point={editPoint}
          projects={projects.filter((project) => project.id !== "all")}
          workers={data.workers}
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
    </main>
  );
}

function ProjectManager({ projects, onSave }) {
  const [draft, setDraft] = useState({ id: "", name: "", client: "", month: "2026-05", color: "#2563eb", hidden: false });

  function edit(project) {
    setDraft({ ...project });
  }

  async function save() {
    if (!draft.name.trim()) return;
    await onSave({ ...draft, id: draft.id || draft.name });
    setDraft({ id: "", name: "", client: "", month: "2026-05", color: "#2563eb", hidden: false });
  }

  return (
    <section className="tool-card project-manager">
      <div className="section-head">
        <div>
          <h2>项目管理</h2>
          <p>新增、编辑、隐藏或恢复项目，调度台会按项目快速聚合点位。</p>
        </div>
      </div>
      <div className="project-form">
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="项目名称" />
        <input value={draft.client || ""} onChange={(event) => setDraft({ ...draft, client: event.target.value })} placeholder="客户" />
        <input value={draft.month || ""} onChange={(event) => setDraft({ ...draft, month: event.target.value })} placeholder="年月" />
        <input type="color" value={draft.color || "#2563eb"} onChange={(event) => setDraft({ ...draft, color: event.target.value })} aria-label="项目颜色" />
        <button className="dark-button" onClick={save}>保存项目</button>
      </div>
      <div className="project-manage-list">
        {projects.map((project) => (
          <article key={project.id || project.name}>
            <span className="project-dot" style={{ background: project.color || "#2563eb" }} />
            <div><b>{project.name}</b><small>{project.client} · {project.month}</small></div>
            <button onClick={() => edit(project)}>编辑</button>
            <button onClick={() => onSave({ ...project, hidden: !project.hidden })}>{project.hidden ? "恢复" : "隐藏"}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function KimiConfig() {
  const [apiKey, setApiKey] = useState("");
  return (
    <section className="tool-card kimi-config">
      <div className="section-head">
        <div>
          <h2>Kimi AI 图片分类配置</h2>
          <p>上传资料后可调用国内后端代理做图片分类；没有 Key 时使用文件名和本地规则兜底。</p>
        </div>
      </div>
      <label className="field">
        <span>Kimi API Key</span>
        <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="仅用于本机测试，不写入代码" />
      </label>
      <div className="mini-status success">{apiKey ? "已填写，等待后端代理接入" : "未填写，当前使用本地规则兜底"}</div>
    </section>
  );
}

function StabilityCheck() {
  const checks = ["项目切换", "共用墙面", "标签筛选", "高德移动端", "车辆定位", "照片查看"];
  return (
    <section className="tool-card stability-card">
      <div className="section-head">
        <div>
          <h2>稳定性自检</h2>
          <p>核心体验不依赖单一后端，接口失败时可回到本地演示。</p>
        </div>
      </div>
      <div className="check-grid">
        {checks.map((item) => <span key={item}>✓ {item}</span>)}
      </div>
    </section>
  );
}

function MapExecutionDesk({ points, allPoints, workers, selectedPoint, mapMode, setMapMode, onOpenSite, onEdit }) {
  return (
    <section className="tool-card map-panel">
      <div className="section-head">
        <div>
          <h2>高德地图执行台</h2>
          <p>优先加载高德地图；当前展示备用智能地图，支持点位点击查看、双击编辑上传。</p>
        </div>
        <div className="segmented">
          <button className={mapMode === "standard" ? "active" : ""} onClick={() => setMapMode("standard")}>标准图</button>
          <button className={mapMode === "satellite" ? "active" : ""} onClick={() => setMapMode("satellite")}>卫星图</button>
        </div>
      </div>
      <div className={`map-board ${mapMode}`}>
        <div className="road road-a" />
        <div className="road road-b" />
        <div className="road road-c" />
        <div className="building b1" />
        <div className="building b2" />
        <div className="building b3" />
        <div className="map-label">备用地图 · 墙体执行坐标</div>
        {points.map((point, index) => (
          <button
            key={point.id}
            className={`map-pin ${selectedPoint?.id === point.id ? "selected" : ""} ${getPointStatus(point) === "已完成" ? "done" : ""}`}
            style={mapPointStyle(point, allPoints, index)}
            title={`${point.title} ${point.address}`}
            onClick={() => onOpenSite(point)}
            onDoubleClick={(event) => {
              event.preventDefault();
              onEdit(point);
            }}
          >
            <span />
          </button>
        ))}
        {workers.map((worker, index) => (
          <div key={worker.id} className={`vehicle-marker ${worker.status === "已停止" ? "stopped" : ""}`} style={{ left: `${18 + index * 26}%`, top: `${72 - index * 18}%` }}>
            <b>{worker.car_no || worker.name}</b>
            <small>{worker.status || "行驶中"}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function DispatchPanel(props) {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    tags,
    activeTags,
    setActiveTags,
    filteredPoints,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    workers,
    dispatchWorkerId,
    setDispatchWorkerId,
    sendSelected,
    setSelectedPointId,
    photos,
    onOpenExpanded,
    onOpenSite,
    onEdit,
    loading,
  } = props;

  function toggleTag(tag) {
    setActiveTags(activeTags.includes(tag) ? activeTags.filter((item) => item !== tag) : [...activeTags, tag]);
  }

  return (
    <section className="tool-card list-panel">
      <div className="section-head">
        <div>
          <h2>筛选点位列表</h2>
          <p>搜索地址、手机号、工人和标签，把筛选结果直接发送到指定师傅移动端。</p>
        </div>
        <button onClick={onOpenExpanded}>放大列表</button>
      </div>
      <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索地址、手机号、工人、标签" />
      <div className="status-tabs">
        {["全部", ...STATUS].map((item) => <button key={item} className={statusFilter === item ? "active" : ""} onClick={() => setStatusFilter(item)}>{item}</button>)}
      </div>
      <div className="tag-filter">
        <div className="tag-head"><b>标签筛选定位</b><button onClick={() => setActiveTags([])}>清空</button></div>
        <div className="tag-cloud">
          {tags.map((tag) => <button key={tag} className={activeTags.includes(tag) ? "active" : ""} onClick={() => toggleTag(tag)}>{tag}</button>)}
        </div>
      </div>
      <div className="dispatch-box">
        <div className="dispatch-title">
          <b>发送到指定师傅移动端</b>
          <span>已选 {selectedIds.length}/{filteredPoints.length}</span>
        </div>
        <label className="field">
          <span>师傅选择</span>
          <select aria-label="师傅选择" value={dispatchWorkerId} onChange={(event) => setDispatchWorkerId(event.target.value)}>
            {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} / {worker.car_no || worker.phone}</option>)}
          </select>
        </label>
        <div className="dispatch-actions">
          <button onClick={() => setSelectedIds(filteredPoints.map((point) => point.id))}>全选</button>
          <button onClick={() => setSelectedIds([])}>全不选</button>
          <button onClick={() => setSelectedIds(filteredPoints.filter((point) => !selectedIds.includes(point.id)).map((point) => point.id))}>反选</button>
        </div>
        <button className="blue-button full" disabled={loading} onClick={sendSelected}>发送已选点位到师傅移动端</button>
      </div>
      <div className="point-list">
        {filteredPoints.map((point) => {
          const counts = mediaCounts(point, photos);
          return (
            <article key={point.id} className={`point-card ${selectedIds.includes(point.id) ? "checked" : ""}`}>
              <button className="check-button" onClick={() => toggleSelect(point.id)} aria-label={`选择 ${point.title}`}>{selectedIds.includes(point.id) ? "✓" : ""}</button>
              <button className="point-main" onClick={() => setSelectedPointId(point.id)}>
                <span className="row"><b>{point.title}</b><StatusPill status={getPointStatus(point)} /></span>
                <small>{point.address}</small>
                <span className="meta-line">项目：{getProjectName(point)} · K码：{point.k_code || "未登记"}</span>
                <span className="meta-line">房东：{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</span>
                <span className="meta-line">施工队长：{getCaptainName(point)} / {getCaptainPhone(point)}</span>
                <span className="meta-line">找墙队伍：{getScoutName(point)} / {getScoutPhone(point)}</span>
                <span className="media-badges">
                  <i>照片 {counts.site}</i><i>720 {counts.pano}</i><i>视频 {counts.video}</i><i>水印 {counts.watermark}</i>
                </span>
              </button>
              <div className="point-card-actions">
                <button onClick={() => onOpenSite(point)}>现场查看</button>
                <button onClick={() => onEdit(point)}>编辑/上传</button>
              </div>
            </article>
          );
        })}
        {!filteredPoints.length && <div className="empty">当前筛选没有点位。</div>}
      </div>
    </section>
  );
}

function SelectedPointDetails({ selectedPoint, photos, onOpenSite, onEdit, onDelete }) {
  if (!selectedPoint) return <section className="tool-card detail-card empty">请选择一个点位查看详情。</section>;
  const counts = mediaCounts(selectedPoint, photos);
  return (
    <section className="tool-card detail-card">
      <div className="section-head">
        <div>
          <h2>当前选中点位详情</h2>
          <p>{selectedPoint.title}</p>
        </div>
        <StatusPill status={getPointStatus(selectedPoint)} />
      </div>
      <div className="detail-grid">
        <div><span>项目标签</span><b>{getProjectName(selectedPoint)}</b></div>
        <div><span>K码</span><b>{selectedPoint.k_code || "未登记"}</b></div>
        <div><span>地址</span><b>{selectedPoint.address}</b></div>
        <div><span>房东</span><b>{selectedPoint.landlord_name || "未登记"} / {selectedPoint.landlord_phone || "未登记"}</b></div>
        <div><span>施工队长</span><b>{getCaptainName(selectedPoint)} / {getCaptainPhone(selectedPoint)}</b></div>
        <div><span>找墙队伍</span><b>{getScoutName(selectedPoint)} / {getScoutPhone(selectedPoint)}</b></div>
        <div><span>经纬度</span><b>{selectedPoint.lng && selectedPoint.lat ? `${selectedPoint.lng}, ${selectedPoint.lat}` : "未匹配"}</b></div>
        <div><span>媒体</span><b>照片 {counts.site} · 720 {counts.pano} · 视频 {counts.video} · 水印 {counts.watermark}</b></div>
      </div>
      <div className="detail-actions">
        <button onClick={onOpenSite}>现场查看</button>
        <button onClick={onEdit}>编辑/上传</button>
        <button className="danger-button" onClick={onDelete}>删除点位</button>
      </div>
    </section>
  );
}

function PhotoLibrary({ points, allPoints, photos, activeProject }) {
  const [kind, setKind] = useState("全部照片");
  const [search, setSearch] = useState("");
  const pointIds = new Set(points.map((point) => point.id));
  const projectPhotos = photos.filter((photo) => pointIds.has(photo.point_id || photo.pointId));
  const visible = projectPhotos.filter((photo) => {
    const point = allPoints.find((item) => item.id === (photo.point_id || photo.pointId));
    const kindOk = kind === "全部照片" || mediaKind(photo) === kind;
    const haystack = `${photo.file_name || ""} ${photo.kind || ""} ${point?.title || ""} ${point?.address || ""}`.toLowerCase();
    return kindOk && (!search || haystack.includes(search.toLowerCase()));
  });

  function exportList() {
    const blob = new Blob([safeJson(visible)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `photo-list-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="tool-card photo-library">
      <div className="section-head">
        <div>
          <h2>项目照片库</h2>
          <p>{activeProject === "all" ? "全部项目" : activeProject} 的现场照片、720全景、全景视频和水印图片统一汇总。</p>
        </div>
        <div className="library-actions">
          <button onClick={exportList}>导出照片清单</button>
          <button onClick={exportList}>批量下载当前筛选</button>
        </div>
      </div>
      <div className="library-toolbar">
        {["全部照片", ...MEDIA_TABS].map((item) => <button key={item} className={kind === item ? "active" : ""} onClick={() => setKind(item)}>{item}</button>)}
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索照片、点位或地址" />
      </div>
      <div className="photo-grid">
        {visible.map((photo) => {
          const point = allPoints.find((item) => item.id === (photo.point_id || photo.pointId));
          return <MediaCard key={photo.id} photo={photo} point={point} />;
        })}
        {!visible.length && <div className="empty">暂无照片/视频。师傅上传后会自动进入照片库。</div>}
      </div>
    </section>
  );
}

function MediaCard({ photo, point }) {
  const kind = mediaKind(photo);
  const url = photo.url || photo.public_url || photo.file_url || "";
  const isVideo = kind === "全景视频" || /\.(mp4|mov|m4v|webm)$/i.test(url);
  return (
    <article className="media-card">
      <span className="corner-badge">{kind}</span>
      <div className="media-preview">
        {url ? (
          isVideo ? <video src={url} controls /> : <img src={url} alt={photo.file_name || kind} />
        ) : (
          <div className="media-placeholder">{kind}</div>
        )}
      </div>
      <div className="media-caption">
        <b>{point?.title || "未知点位"}</b>
        <span>{photo.file_name || "现场资料"} · {cnTime(photo.created_at || nowIso())}</span>
      </div>
    </article>
  );
}

function TrackCenter({ workers, tasks, points, trackLogs, onSaveTrack }) {
  const [vehicleState, setVehicleState] = useState({});

  async function toggleVehicle(worker) {
    const current = vehicleState[worker.id] || worker.status || "行驶中";
    const next = current === "行驶中" ? "已停止" : "行驶中";
    setVehicleState({ ...vehicleState, [worker.id]: next });
    const workerTasks = tasks.filter((task) => (task.worker_id || task.workerId) === worker.id);
    const point = points.find((item) => item.id === (workerTasks[0]?.point_id || workerTasks[0]?.pointId)) || points[0];
    if (point) {
      await onSaveTrack({
        worker_id: worker.id,
        worker_name: worker.name,
        event: next === "行驶中" ? "继续行驶" : "模拟停车",
        speed: next === "行驶中" ? 36 : 0,
        stop_minutes: next === "行驶中" ? 0 : 8,
        lng: point.lng,
        lat: point.lat,
        project_name: getProjectName(point),
        recorded_at: nowIso(),
      });
    }
  }

  return (
    <section className="tool-card track-center">
      <div className="section-head">
        <div>
          <h2>工人定位和轨迹记录</h2>
          <p>模拟移动端定位上报，后台记录车辆行驶、停车和项目坐标。</p>
        </div>
      </div>
      <div className="vehicle-grid">
        {workers.map((worker, index) => {
          const status = vehicleState[worker.id] || worker.status || (index % 2 ? "已停止" : "行驶中");
          return (
            <article key={worker.id} className="vehicle-card">
              <div><b>{worker.name}</b><small>{worker.car_no || worker.phone}</small></div>
              <StatusPill status={status === "行驶中" ? "施工中" : "需复查"} />
              <span>项目：{worker.project_name || "加多宝项目"}</span>
              <span>速度：{status === "行驶中" ? worker.speed || 38 : 0} km/h</span>
              <span>停止计时：{status === "行驶中" ? "0 分钟" : "8 分钟"}</span>
              <button onClick={() => toggleVehicle(worker)}>{status === "行驶中" ? "模拟停车" : "继续行驶"}</button>
            </article>
          );
        })}
      </div>
      <div className="track-table">
        <div className="track-table-head"><b>工人</b><b>时间</b><b>事件</b><b>速度</b><b>停止时长</b><b>经纬度</b><b>项目</b></div>
        {(trackLogs.length ? trackLogs : []).slice(0, 8).map((log) => (
          <div key={log.id || `${log.worker_id}-${log.recorded_at}`}>
            <span>{log.worker_name || workers.find((worker) => worker.id === log.worker_id)?.name || log.worker_id}</span>
            <span>{cnTime(log.recorded_at || log.created_at || nowIso())}</span>
            <span>{log.event || "定位上报"}</span>
            <span>{log.speed ?? 0} km/h</span>
            <span>{log.stop_minutes ?? 0} 分钟</span>
            <span>{log.lng || "-"}, {log.lat || "-"}</span>
            <span>{log.project_name || "未分配"}</span>
          </div>
        ))}
        {!trackLogs.length && <div className="empty compact">暂无轨迹记录，可点击上方按钮模拟停车/继续行驶。</div>}
      </div>
    </section>
  );
}

function BatchImportModal({ projects, onClose, onImport }) {
  const [text, setText] = useState("点位编号,地址,K码,房东,房东手机号,施工队长,施工队长手机号,找墙队伍,找墙队伍手机号,项目,经度,纬度\nGZ-NEW-001,广东省广州市白云区示范村口,K-GZ-NEW-001,黄先生,13500000001,周队长,13600000001,阿强找墙队,13700000001,加多宝项目,113.36,23.25");
  const [preview, setPreview] = useState([]);

  function normalizeRow(row, index) {
    const title = row["点位编号"] || row.title || row["编号"] || `NEW-${Date.now()}-${index + 1}`;
    return {
      id: uid("point"),
      title,
      address: row["地址"] || row.address || "",
      k_code: row["K码"] || row.k_code || title,
      landlord_name: row["房东"] || row.landlord_name || "",
      landlord_phone: row["房东手机号"] || row.landlord_phone || row["手机号"] || "",
      captain_name: row["施工队长"] || row.captain_name || "",
      captain_phone: row["施工队长手机号"] || row.captain_phone || "",
      scout_name: row["找墙队伍"] || row.scout_name || "",
      scout_phone: row["找墙队伍手机号"] || row.scout_phone || "",
      project_name: row["项目"] || row.project_name || projects[0]?.name || "加多宝项目",
      lng: Number(row["经度"] || row.lng) || null,
      lat: Number(row["纬度"] || row.lat) || null,
      status: "待施工",
      created_at: nowIso(),
    };
  }

  function parseText() {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(/\t|,/).map((item) => item.trim());
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(/\t|,/).map((item) => item.trim());
      return headers.reduce((acc, key, index) => ({ ...acc, [key]: cells[index] || "" }), {});
    });
    const next = rows.map(normalizeRow);
    setPreview(next);
    return next;
  }

  async function parseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreview(rows.map(normalizeRow));
      return;
    }
    setText(await file.text());
  }

  function kimiClean() {
    const next = preview.length ? preview : parseText();
    setPreview(next.map((point) => ({ ...point, k_code: point.k_code || point.title, status: "待施工" })));
  }

  function amapMatch() {
    const next = preview.length ? preview : parseText();
    setPreview(next.map((point, index) => ({
      ...point,
      lng: point.lng || Number((113.1 + index * 0.11).toFixed(5)),
      lat: point.lat || Number((23.1 + index * 0.07).toFixed(5)),
    })));
  }

  return (
    <Modal title="批量新增点位" subtitle="支持 Excel / CSV / TXT 上传、直接粘贴、Kimi 自检字段和高德自动匹配经纬度。" onClose={onClose} wide>
      <div className="batch-grid">
        <div>
          <label className="file-drop">
            上传 Excel / CSV / TXT
            <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={parseFile} />
          </label>
          <textarea value={text} onChange={(event) => setText(event.target.value)} />
          <div className="modal-actions">
            <button onClick={parseText}>解析预览</button>
            <button onClick={kimiClean}>Kimi 自检整理字段</button>
            <button onClick={amapMatch}>高德自动匹配经纬度</button>
            <button className="green-button" onClick={() => {
              const items = preview.length ? preview : parseText();
              onImport(items);
            }}>确认写入系统</button>
          </div>
        </div>
        <div className="preview-table">
          <div className="preview-head">预览列表</div>
          {preview.slice(0, 8).map((point) => (
            <article key={point.id}>
              <b>{point.title}</b>
              <span>{point.address}</span>
              <small>K码 {point.k_code} · 房东 {point.landlord_name} · 队长 {point.captain_name} · 找墙 {point.scout_name}</small>
              <small>{point.project_name} · {point.lng || "待匹配"}, {point.lat || "待匹配"}</small>
            </article>
          ))}
          {!preview.length && <div className="empty compact">点击“解析预览”后查看字段整理结果。</div>}
        </div>
      </div>
    </Modal>
  );
}

function PointEditorModal({ point, projects, workers, photos, onClose, onSave, onUpload }) {
  const [draft, setDraft] = useState({ ...point });
  const [kind, setKind] = useState("现场照片");
  const uploader = workers[0] || { id: "admin", name: "后台" };

  function change(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function uploadFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    let watermarkCount = photos.filter((photo) => (photo.point_id || photo.pointId) === draft.id && mediaKind(photo) === "水印图片").length;
    for (const file of files) {
      const nextKind = kind === "水印图片" && watermarkCount >= 2 ? "现场照片" : kind;
      await onUpload(file, draft, uploader, nextKind);
      if (nextKind === "水印图片") watermarkCount += 1;
    }
    event.target.value = "";
  }

  return (
    <Modal title="点位编辑 / 上传" subtitle="完整维护编号、K码、人员信息、地址、状态、项目和现场媒体。" onClose={onClose} wide>
      <div className="edit-grid">
        <Field label="点位编号"><input value={draft.title || ""} onChange={(event) => change("title", event.target.value)} /></Field>
        <Field label="K码"><input value={draft.k_code || ""} onChange={(event) => change("k_code", event.target.value)} /></Field>
        <Field label="房东姓名"><input value={draft.landlord_name || ""} onChange={(event) => change("landlord_name", event.target.value)} /></Field>
        <Field label="房东手机号"><input value={draft.landlord_phone || ""} onChange={(event) => change("landlord_phone", event.target.value)} /></Field>
        <Field label="施工队长姓名"><input value={getCaptainName(draft)} onChange={(event) => change("captain_name", event.target.value)} /></Field>
        <Field label="施工队长手机号"><input value={getCaptainPhone(draft) === "未登记" ? "" : getCaptainPhone(draft)} onChange={(event) => change("captain_phone", event.target.value)} /></Field>
        <Field label="找墙队伍姓名"><input value={getScoutName(draft) === "未登记" ? "" : getScoutName(draft)} onChange={(event) => change("scout_name", event.target.value)} /></Field>
        <Field label="找墙队伍手机号"><input value={getScoutPhone(draft) === "未登记" ? "" : getScoutPhone(draft)} onChange={(event) => change("scout_phone", event.target.value)} /></Field>
        <Field label="详细地址"><input value={draft.address || ""} onChange={(event) => change("address", event.target.value)} /></Field>
        <Field label="归属项目多选"><select value={getProjectName(draft)} onChange={(event) => change("project_name", event.target.value)}>{projects.map((project) => <option key={project.name}>{project.name}</option>)}</select></Field>
        <Field label="经度"><input value={draft.lng || ""} onChange={(event) => change("lng", event.target.value)} /></Field>
        <Field label="纬度"><input value={draft.lat || ""} onChange={(event) => change("lat", event.target.value)} /></Field>
        <Field label="执行状态"><select value={getPointStatus(draft)} onChange={(event) => change("status", event.target.value)}>{STATUS.map((item) => <option key={item}>{item}</option>)}</select></Field>
      </div>
      <div className="upload-lab">
        <div>
          <h3>Kimi AI 自动分类</h3>
          <p>可按现场照片、720全景照片、水印图片、全景视频上传；水印最多保留 2 张，超出自动转为现场照片。</p>
        </div>
        <select value={kind} onChange={(event) => setKind(event.target.value)}>
          {MEDIA_TABS.map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="file-drop small">
          上传照片 / 全景视频
          <input type="file" accept="image/*,video/*" multiple onChange={uploadFiles} />
        </label>
      </div>
      <div className="modal-actions">
        <button onClick={() => setDraft({ ...draft, lng: draft.lng || 113.32, lat: draft.lat || 23.12 })}>自动匹配经纬度</button>
        <button className="green-button" onClick={() => onSave(draft)}>保存点位</button>
      </div>
    </Modal>
  );
}

function SiteViewerModal({ point, photos, onClose, onEdit }) {
  const [tab, setTab] = useState("现场照片");
  const media = photos.filter((photo) => (photo.point_id || photo.pointId) === point.id && mediaKind(photo) === tab);
  return (
    <Modal title={`${point.title} 现场查看中心`} subtitle={point.address} onClose={onClose} wide>
      <div className="site-tabs">
        {MEDIA_TABS.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
      </div>
      <div className="site-view-grid">
        <div className="site-big-view">
          {media[0] ? <MediaCard photo={media[0]} point={point} /> : <div className="empty">暂无{tab}，可进入编辑/上传。</div>}
        </div>
        <aside className="site-info">
          <h3>现场信息</h3>
          <div className="detail-grid single">
            <div><span>地址</span><b>{point.address}</b></div>
            <div><span>K码</span><b>{point.k_code || "未登记"}</b></div>
            <div><span>项目</span><b>{getProjectName(point)}</b></div>
            <div><span>状态</span><b>{getPointStatus(point)}</b></div>
            <div><span>房东</span><b>{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</b></div>
            <div><span>施工队长</span><b>{getCaptainName(point)} / {getCaptainPhone(point)}</b></div>
            <div><span>找墙队伍</span><b>{getScoutName(point)} / {getScoutPhone(point)}</b></div>
          </div>
          <button className="dark-button full" onClick={onEdit}>跳转编辑/上传</button>
        </aside>
      </div>
    </Modal>
  );
}

function ExpandedListModal({ points, photos, selectedIds, setSelectedIds, toggleSelect, workers, dispatchWorkerId, setDispatchWorkerId, sendSelected, onClose }) {
  return (
    <Modal title="放大筛选列表" subtitle={`当前筛选结果 ${points.length} 个点位，可批量勾选并派单。`} onClose={onClose} wide>
      <div className="expanded-toolbar">
        <span>已选 {selectedIds.length}/{points.length}</span>
        <button onClick={() => setSelectedIds(points.map((point) => point.id))}>全选</button>
        <button onClick={() => setSelectedIds([])}>全不选</button>
        <button onClick={() => setSelectedIds(points.filter((point) => !selectedIds.includes(point.id)).map((point) => point.id))}>反选</button>
        <select aria-label="放大列表师傅选择" value={dispatchWorkerId} onChange={(event) => setDispatchWorkerId(event.target.value)}>
          {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} / {worker.car_no || worker.phone}</option>)}
        </select>
        <button className="blue-button" onClick={sendSelected}>发送已选点位到师傅移动端</button>
      </div>
      <div className="expanded-list">
        {points.map((point) => {
          const counts = mediaCounts(point, photos);
          return (
            <article key={point.id}>
              <button className="check-button" onClick={() => toggleSelect(point.id)}>{selectedIds.includes(point.id) ? "✓" : ""}</button>
              <b>{point.title}</b>
              <span>{point.address}</span>
              <small>{getProjectName(point)} · {getPointStatus(point)} · K码 {point.k_code} · 照片 {counts.total}</small>
            </article>
          );
        })}
      </div>
    </Modal>
  );
}

function DiagnosisModal({ result, onRun, onClose }) {
  return (
    <Modal title="国内接口诊断" subtitle="当前主线不再依赖 Supabase，诊断只检查数据模式和国内 API 连接。" onClose={onClose}>
      <div className="env-grid">
        <div><span>VITE_DATA_MODE</span><b>{DATA_MODE}</b></div>
        <div><span>VITE_API_BASE_URL</span><b>{isLocalDataMode ? "本地模式无需配置" : API_BASE_URL}</b></div>
        <div><span>VITE_AMAP_KEY</span><b>{supabaseEnv.hasAmapKey ? "已读取" : "未配置"}</b></div>
        <div><span>VITE_KIMI_CLASSIFY_ENDPOINT</span><b>{supabaseEnv.hasKimiClassifyEndpoint ? "已读取" : "可选未配置"}</b></div>
      </div>
      <pre className="diagnosis-pre">{safeJson(result || { ok: isLocalDataMode, mode: DATA_MODE, label: getDataModeLabel() })}</pre>
      <div className="modal-actions">
        <button className="blue-button" onClick={onRun}>开始诊断</button>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function WorkerPage({ data, workerId }) {
  const [index, setIndex] = useState(0);
  const [identity, setIdentity] = useState({ name: "", phone: "" });
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState("");
  const [uploadKind, setUploadKind] = useState("现场照片");

  const worker = data.workers.find((item) => [item.id, item.code, item.worker_key, item.slug].includes(workerId))
    || data.workers[0]
    || { id: workerId || "w1", code: workerId || "w1", name: workerId === "w2" || workerId === "li" ? "李师傅" : "张师傅", phone: "", car_no: "" };

  useEffect(() => {
    setIdentity({ name: worker.name || "", phone: worker.phone || "" });
  }, [worker.id]);

  const taskPointIds = data.tasks
    .filter((task) => (task.worker_id || task.workerId) === worker.id)
    .map((task) => task.point_id || task.pointId);
  const visiblePoints = taskPointIds.length ? data.points.filter((point) => taskPointIds.includes(point.id)) : (isProxyDataMode ? data.points : []);
  const point = visiblePoints[Math.min(index, Math.max(visiblePoints.length - 1, 0))] || null;

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length || !point) return;
    setBusy(true);
    try {
      for (const file of files) {
        await data.uploadPhoto({ file, point, worker, kind: uploadKind });
      }
      setLocalMessage(`${point.title} 已上传资料，后台点位状态已自动更新为已完成。`);
      if (isProxyDataMode) await data.loadWorkerTasks(workerId);
      else await data.loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setLocalMessage(`上传失败：${issue.category}，${issue.detail}`);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <main className="worker-page">
      <section className="worker-hero">
        <span>师傅移动端派单页</span>
        <h1>{worker.name} 的任务</h1>
        <p>一页一个点位，滑动执行。后台发送的点位会按卡片显示，上传成功后自动回写完成状态。</p>
        <small>数据来源：{data.dataSource || (isLocalDataMode ? "本地演示任务" : "真实派单任务")}</small>
      </section>

      {(data.message || localMessage) && <section className="info"><strong>{localMessage || data.message}</strong></section>}

      <section className="identity-card">
        <div className="section-head">
          <div>
            <h2>队伍身份确认</h2>
            <p>确认后锁定，避免现场误切换队伍。</p>
          </div>
          <button className="green-button" disabled={locked} onClick={() => setLocked(true)}>{locked ? "已确认" : "确认队伍身份"}</button>
        </div>
        <div className="identity-grid">
          <Field label="队伍信息格式"><input disabled={locked} value={identity.name} onChange={(event) => setIdentity({ ...identity, name: event.target.value })} /></Field>
          <Field label="手机号"><input disabled={locked} value={identity.phone} onChange={(event) => setIdentity({ ...identity, phone: event.target.value })} /></Field>
        </div>
      </section>

      <section className="progress-card">
        <span>任务进度</span>
        <b>{visiblePoints.length ? `${Math.min(index + 1, visiblePoints.length)} / ${visiblePoints.length}` : "0 / 0"}</b>
      </section>

      {point ? (
        <section className="mobile-point-card">
          <div className="row">
            <div>
              <small>当前点位</small>
              <h2>{point.title}</h2>
            </div>
            <StatusPill status={getPointStatus(point)} />
          </div>
          <div className="mobile-point-info">
            <div><span>地址</span><b>{point.address}</b></div>
            <div><span>K码</span><b>{point.k_code || "未登记"}</b></div>
            <div><span>项目</span><b>{getProjectName(point)}</b></div>
          </div>
          <section className="mobile-step">
            <h3>第一步：查看点位并导航</h3>
            <div className="mobile-contact-grid">
              <div><span>房东信息</span><b>{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</b></div>
              <div><span>施工队长信息</span><b>{getCaptainName(point)} / {getCaptainPhone(point)}</b></div>
            </div>
            <div className="mobile-action-grid">
              <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
              <a className="blue-button" href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
            </div>
          </section>
          <section className="mobile-step">
            <h3>第二步：上传照片/视频</h3>
            <select value={uploadKind} onChange={(event) => setUploadKind(event.target.value)}>
              {MEDIA_TABS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <label className={`mobile-upload ${busy ? "disabled" : ""}`}>
              {busy ? "上传中..." : "上传水印 / 现场 / 全景照片 / 全景视频"}
              <input disabled={busy} type="file" accept="image/*,video/*" multiple onChange={handleUpload} />
            </label>
          </section>
        </section>
      ) : (
        <section className="empty">暂无派单点位。请后台先筛选点位并发送给当前师傅。</section>
      )}

      <nav className="mobile-bottom-nav">
        <button disabled={index <= 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>上一点位</button>
        <button disabled={index >= visiblePoints.length - 1} onClick={() => setIndex((current) => Math.min(visiblePoints.length - 1, current + 1))}>下一点位</button>
      </nav>
    </main>
  );
}

function MobileMapPack({ data }) {
  const [mapMode, setMapMode] = useState("standard");
  const current = data.points[0] || null;
  return (
    <main className="mobile-map-page">
      <section className="worker-hero">
        <span>移动端高德点位包</span>
        <h1>筛选点位已发送到移动端</h1>
        <p>标准/卫星预览、复制点位清单、逐点高德查看和导航。</p>
      </section>
      <div className="segmented wide">
        <button className={mapMode === "standard" ? "active" : ""} onClick={() => setMapMode("standard")}>标准图</button>
        <button className={mapMode === "satellite" ? "active" : ""} onClick={() => setMapMode("satellite")}>卫星图</button>
      </div>
      <div className={`map-board mobile-map-preview ${mapMode}`}>
        {data.points.map((point, index) => <button key={point.id} className="map-pin" style={mapPointStyle(point, data.points, index)}><span /></button>)}
      </div>
      <div className="mobile-map-actions">
        <button onClick={() => navigator.clipboard?.writeText(data.points.map((point) => `${point.title} ${point.address} ${point.k_code}`).join("\n"))}>复制点位清单</button>
        {current && <a className="blue-button" href={amapNavigationUrl(current)} target="_blank" rel="noreferrer">导航当前点位</a>}
      </div>
      <div className="map-pack-list">
        {data.points.map((point) => (
          <article key={point.id}>
            <b>{point.title}</b>
            <span>{point.address}</span>
            <small>K码 {point.k_code} · 房东 {point.landlord_name || "未登记"} · 队长 {getCaptainName(point)} · {getProjectName(point)}</small>
            <div>
              <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
              <a href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function App() {
  const route = getRoute();
  const data = useH5Data();

  useEffect(() => {
    if (route.page === "worker") {
      data.loadWorkerTasks(route.workerId);
    } else {
      data.loadAll();
    }
  }, [route.page, route.workerId]);

  if (route.page === "worker") return <WorkerPage data={data} workerId={route.workerId} />;
  if (route.page === "mobile-map") return <MobileMapPack data={data} />;
  return <AdminPage data={data} />;
}

createRoot(document.getElementById("root")).render(<App />);
