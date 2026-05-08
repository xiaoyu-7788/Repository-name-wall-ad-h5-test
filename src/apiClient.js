import { supabaseEnv } from "./supabaseClient";

const LOCAL_STORE_KEY = "wall-ad-h5-demo-state";
const LOCAL_STORE_EVENT = "wall-ad-h5-demo-updated";
const LOCAL_SCHEMA_VERSION = 3;

function getBrowserHostname() {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname || "localhost";
}

function isLocalHostName(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function inferDefaultMode() {
  const host = getBrowserHostname();
  return isLocalHostName(host) ? "local" : "mock-server";
}

export function getApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");

  if (typeof window === "undefined") return "http://localhost:8787";
  const protocol = window.location.protocol || "http:";
  const hostname = window.location.hostname || "localhost";

  if (isLocalHostName(hostname)) return "http://localhost:8787";
  return `${protocol}//${hostname}:8787`;
}

const configuredMode = String(import.meta.env.VITE_DATA_MODE || "").toLowerCase();
const shouldUseMockOnLan = !supabaseEnv.forceLocalDemo && !isLocalHostName(getBrowserHostname()) && configuredMode !== "production-api";
const rawMode = supabaseEnv.forceLocalDemo ? "local" : (shouldUseMockOnLan ? "mock-server" : (configuredMode || inferDefaultMode()));
export const DATA_MODE = ["local", "mock-server", "production-api"].includes(rawMode) ? rawMode : inferDefaultMode();
export const API_BASE_URL = getApiBaseUrl();

export const isLocalDataMode = DATA_MODE === "local";
export const isMockServerMode = DATA_MODE === "mock-server";
export const isProductionApiMode = DATA_MODE === "production-api";
export const isProxyDataMode = isMockServerMode || isProductionApiMode;
export const isRemoteDataMode = isProxyDataMode;
export const isDirectSupabaseMode = false;

export const apiEnv = {
  ...supabaseEnv,
  dataMode: DATA_MODE,
  apiBaseUrl: API_BASE_URL,
  hasApiBaseUrl: Boolean(API_BASE_URL),
};

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getDataModeLabel(mode = DATA_MODE) {
  if (mode === "mock-server") return "国内 Mock Server 模式";
  if (mode === "production-api") return "国内生产 API 模式";
  return "本地演示模式";
}

const demoProjects = [
  { id: "all", name: "全部项目", client: "总部调度", month: "长期", color: "#0f172a", hidden: false },
  { id: "jiaduobao", name: "加多宝项目", client: "加多宝", month: "2026-05", color: "#ef4444", hidden: false },
  { id: "akang", name: "阿康化肥项目", client: "阿康化肥", month: "2026-05", color: "#22c55e", hidden: false },
  { id: "energy", name: "能量饮料项目", client: "能量饮料", month: "2026-06", color: "#2563eb", hidden: false },
];

const demoWorkers = [
  { id: "w1", code: "zhang", worker_key: "zhang", slug: "zhang", name: "张师傅", phone: "13800000001", car_no: "粤A·工001", project_name: "加多宝项目", status: "行驶中", speed: 42 },
  { id: "w2", code: "li", worker_key: "li", slug: "li", name: "李师傅", phone: "13800000002", car_no: "粤A·工002", project_name: "加多宝项目", status: "已停止", speed: 0 },
];

const demoPoints = [
  {
    id: "p1",
    title: "GZ-BY-001",
    address: "广东省广州市白云区太和镇主干道路口",
    city: "广州",
    landlord_name: "黄先生",
    landlord_phone: "13531280287",
    captain_name: "周队长",
    captain_phone: "13600001111",
    scout_name: "阿强找墙队",
    scout_phone: "13700002222",
    k_code: "K-GZ-BY-001",
    project_name: "加多宝项目",
    status: "待施工",
    lng: 113.38431,
    lat: 23.30859,
    created_at: nowIso(),
  },
  {
    id: "p2",
    title: "FS-NH-002",
    address: "广东省佛山市南海区村口商业街",
    city: "佛山",
    landlord_name: "陈先生",
    landlord_phone: "13800138000",
    captain_name: "刘队长",
    captain_phone: "13600003333",
    scout_name: "南海找墙队",
    scout_phone: "13700004444",
    k_code: "K-FS-NH-002",
    project_name: "加多宝项目",
    status: "待施工",
    lng: 113.14588,
    lat: 23.04712,
    created_at: nowIso(),
  },
  {
    id: "p3",
    title: "QY-YD-003",
    address: "广东省清远市英德市镇道转角墙面",
    city: "清远",
    landlord_name: "林先生",
    landlord_phone: "13922223333",
    captain_name: "吴队长",
    captain_phone: "13600005555",
    scout_name: "英德找墙队",
    scout_phone: "13700006666",
    k_code: "K-QY-YD-003",
    project_name: "阿康化肥项目",
    status: "待施工",
    lng: 113.41521,
    lat: 24.18677,
    created_at: nowIso(),
  },
];

function normalizeState(payload = {}) {
  const data = payload.data || payload;
  const points = data.points || data.wallPoints || [];
  const tasks = data.tasks || data.dispatchTasks || [];
  const photos = data.photos || data.pointMedia || [];
  const projects = data.projects?.length
    ? data.projects.map((project) => ({
        id: project.id || project.name,
        name: project.name || project.project_name || project.id,
        client: project.client || project.customer || "未填写客户",
        month: project.month || project.year_month || "未设置年月",
        color: project.color || "#2563eb",
        hidden: Boolean(project.hidden),
        ...project,
      }))
    : demoProjects;

  return {
    version: LOCAL_SCHEMA_VERSION,
    projects,
    workers: data.workers || [],
    points,
    wallPoints: points,
    tasks,
    dispatchTasks: tasks,
    photos,
    pointMedia: photos,
    trackLogs: data.trackLogs || [],
  };
}

function createDemoState(overrides = {}) {
  const points = Array.isArray(overrides.points) && overrides.points.length
    ? overrides.points
    : Array.isArray(overrides.wallPoints) && overrides.wallPoints.length
      ? overrides.wallPoints
      : demoPoints;
  const tasks = Array.isArray(overrides.tasks)
    ? overrides.tasks
    : Array.isArray(overrides.dispatchTasks)
      ? overrides.dispatchTasks
      : [];
  const photos = Array.isArray(overrides.photos)
    ? overrides.photos
    : Array.isArray(overrides.pointMedia)
      ? overrides.pointMedia
      : [];
  return normalizeState({
    version: LOCAL_SCHEMA_VERSION,
    projects: Array.isArray(overrides.projects) && overrides.projects.length ? overrides.projects : demoProjects,
    workers: Array.isArray(overrides.workers) && overrides.workers.length ? overrides.workers : demoWorkers,
    points,
    tasks,
    dispatchTasks: tasks,
    photos,
    pointMedia: photos,
    trackLogs: Array.isArray(overrides.trackLogs) ? overrides.trackLogs : [],
  });
}

function readLocalState() {
  if (typeof window === "undefined") return createDemoState();
  try {
    const raw = window.localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) {
      const initial = createDemoState();
      window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (parsed.version !== LOCAL_SCHEMA_VERSION) {
      const next = createDemoState();
      window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(next));
      return next;
    }
    return createDemoState(parsed);
  } catch {
    return createDemoState();
  }
}

function writeLocalState(state) {
  if (typeof window === "undefined") return createDemoState(state);
  const next = createDemoState(state);
  window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(LOCAL_STORE_EVENT));
  return next;
}

export { LOCAL_STORE_KEY, LOCAL_STORE_EVENT };

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, error: "INVALID_JSON", detail: text || "接口返回不是 JSON" };
  }
}

async function requestApi(path, options = {}) {
  if (!API_BASE_URL) {
    const error = new Error("未配置 VITE_API_BASE_URL");
    error.category = "接口连接失败";
    error.detail = "请配置 VITE_API_BASE_URL，或切换 VITE_DATA_MODE=local。";
    throw error;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: options.body instanceof FormData
      ? { ...(options.headers || {}) }
      : { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await parseResponse(response);
  if (!response.ok || body.ok === false) {
    const error = new Error(body.error || body.message || body.detail || `接口请求失败：HTTP ${response.status}`);
    error.category = "接口连接失败";
    error.detail = body.detail || body.error || error.message;
    error.status = response.status;
    error.data = body;
    throw error;
  }
  return body.data !== undefined ? body.data : body;
}

async function remoteState() {
  const [projects, workers, points, trackLogs] = await Promise.all([
    requestApi("/api/projects"),
    requestApi("/api/workers"),
    requestApi("/api/wall-points"),
    requestApi("/api/track-logs"),
  ]);
  const media = await requestApi("/api/point-media").catch(() => []);
  const tasks = await requestApi("/api/dispatch-tasks").catch(() => []);
  return normalizeState({ projects, workers, wallPoints: points, dispatchTasks: tasks, pointMedia: media, trackLogs });
}

export async function healthCheck() {
  if (isLocalDataMode) return { mode: DATA_MODE, label: getDataModeLabel(), ok: true };
  return requestApi("/api/health");
}

export async function getProjects() {
  if (isLocalDataMode) return readLocalState().projects;
  return requestApi("/api/projects");
}

export async function saveProject(project) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const next = {
      id: project.id || project.name || uid("project"),
      name: project.name || project.id || "新项目",
      client: project.client || "未填写客户",
      month: project.month || "未设置年月",
      color: project.color || "#2563eb",
      hidden: Boolean(project.hidden),
      created_at: project.created_at || nowIso(),
      ...project,
      updated_at: nowIso(),
    };
    writeLocalState({ ...state, projects: [next, ...state.projects.filter((item) => item.id !== next.id)] });
    return next;
  }
  if (project.id) return requestApi(`/api/projects/${encodeURIComponent(project.id)}`, { method: "PUT", body: JSON.stringify(project) });
  return requestApi("/api/projects", { method: "POST", body: JSON.stringify(project) });
}

export async function deleteProject(projectId) {
  if (isLocalDataMode) {
    const state = readLocalState();
    writeLocalState({ ...state, projects: state.projects.filter((item) => item.id !== projectId) });
    return { id: projectId };
  }
  return requestApi(`/api/projects/${encodeURIComponent(projectId)}`, { method: "DELETE" });
}

export async function getWorkers() {
  if (isLocalDataMode) return readLocalState().workers;
  return requestApi("/api/workers");
}

export async function saveWorker(worker) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const next = { id: worker.id || uid("worker"), ...worker, updated_at: nowIso() };
    writeLocalState({ ...state, workers: [next, ...state.workers.filter((item) => item.id !== next.id)] });
    return next;
  }
  if (worker.id) return requestApi(`/api/workers/${encodeURIComponent(worker.id)}`, { method: "PUT", body: JSON.stringify(worker) });
  return requestApi("/api/workers", { method: "POST", body: JSON.stringify(worker) });
}

export async function getWallPoints() {
  if (isLocalDataMode) return readLocalState().points;
  return requestApi("/api/points");
}

export async function getPoints() {
  return getWallPoints();
}

export async function saveWallPoint(point) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const next = {
      id: point.id || uid("point"),
      title: point.title || point.k_code || "新点位",
      status: point.status || "待施工",
      created_at: point.created_at || nowIso(),
      ...point,
      updated_at: nowIso(),
    };
    writeLocalState({ ...state, points: [next, ...state.points.filter((item) => item.id !== next.id)] });
    return next;
  }
  if (point.id) return requestApi(`/api/wall-points/${encodeURIComponent(point.id)}`, { method: "PUT", body: JSON.stringify(point) });
  return requestApi("/api/wall-points", { method: "POST", body: JSON.stringify(point) });
}

export async function deleteWallPoint(pointId) {
  if (isLocalDataMode) {
    const state = readLocalState();
    writeLocalState({
      ...state,
      points: state.points.filter((item) => item.id !== pointId),
      tasks: state.tasks.filter((item) => (item.point_id || item.pointId) !== pointId),
      photos: state.photos.filter((item) => item.point_id !== pointId),
    });
    return { id: pointId };
  }
  return requestApi(`/api/wall-points/${encodeURIComponent(pointId)}`, { method: "DELETE" });
}

export async function dispatchPoints(workerIdOrPayload, pointIds = []) {
  const payload = typeof workerIdOrPayload === "object"
    ? { ...workerIdOrPayload }
    : { workerId: workerIdOrPayload, worker_id: workerIdOrPayload, pointIds, point_ids: pointIds };
  payload.pointIds = payload.pointIds || payload.point_ids || pointIds;
  payload.point_ids = payload.point_ids || payload.pointIds;
  payload.workerId = payload.workerId || payload.worker_id || payload.worker;
  payload.worker_id = payload.worker_id || payload.workerId;

  if (isLocalDataMode) {
    const state = readLocalState();
    const selected = [...new Set((payload.pointIds || []).map(String))];
    const workerId = payload.workerId;
    const tasks = selected.map((pointId) => ({
      id: uid("task"),
      worker_id: workerId,
      workerId,
      point_id: pointId,
      pointId,
      status: "施工中",
      assigned_at: nowIso(),
      created_at: nowIso(),
    }));
    const taskKeys = new Set(tasks.map((task) => `${task.worker_id}:${task.point_id}`));
    const next = writeLocalState({
      ...state,
      tasks: [...tasks, ...state.tasks.filter((task) => !taskKeys.has(`${task.worker_id || task.workerId}:${task.point_id || task.pointId}`))],
      points: state.points.map((point) => selected.includes(String(point.id)) && point.status !== "已完成" ? { ...point, status: "施工中", updated_at: nowIso() } : point),
    });
    return { ok: true, workerId, inserted: tasks.length, updated_points: selected.length, points: next.points, point_ids: selected };
  }
  return requestApi("/api/dispatch", { method: "POST", body: JSON.stringify(payload) });
}

export async function getWorkerTasks(workerId) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const worker = state.workers.find((item) => [item.id, item.code, item.worker_key, item.slug].includes(workerId)) || state.workers[0];
    const tasks = state.tasks.filter((task) => (task.worker_id || task.workerId) === worker?.id);
    const pointIds = tasks.map((task) => task.point_id || task.pointId);
    return { worker, tasks, points: state.points.filter((point) => pointIds.includes(point.id)), photos: state.photos, trackLogs: state.trackLogs };
  }
  return requestApi(`/api/worker-tasks?workerId=${encodeURIComponent(workerId)}`);
}

export async function uploadPointMedia(pointId, files, meta = {}) {
  const list = Array.isArray(files) ? files : [files].filter(Boolean);
  if (isLocalDataMode) {
    const state = readLocalState();
    const media = list.map((file) => ({
      id: uid("media"),
      point_id: pointId,
      worker_id: meta.workerId || meta.worker_id || "",
      url: URL.createObjectURL(file),
      file_name: file.name,
      kind: meta.kind || "现场照片",
      content_type: file.type,
      created_at: nowIso(),
    }));
    writeLocalState({ ...state, photos: [...media, ...state.photos] });
    return media;
  }
  const form = new FormData();
  list.forEach((file) => form.append("files", file));
  Object.entries(meta).forEach(([key, value]) => {
    if (value != null) form.append(key, value);
  });
  return requestApi(`/api/point-media/${encodeURIComponent(pointId)}`, { method: "POST", body: form });
}

export async function completePoint(pointId, payload = {}) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const completedAt = nowIso();
    writeLocalState({
      ...state,
      points: state.points.map((point) => point.id === pointId ? { ...point, status: "已完成", completed_at: completedAt, updated_at: completedAt } : point),
      tasks: state.tasks.map((task) => (task.point_id || task.pointId) === pointId ? { ...task, status: "已完成", completed_at: completedAt } : task),
    });
    return { id: pointId, status: "已完成" };
  }
  return requestApi("/api/complete-point", { method: "POST", body: JSON.stringify({ ...payload, pointId, point_id: pointId }) });
}

export async function getTrackLogs() {
  if (isLocalDataMode) return readLocalState().trackLogs;
  return requestApi("/api/track-logs");
}

export async function saveTrackLog(log) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const next = { id: log.id || uid("track"), ...log, created_at: nowIso() };
    writeLocalState({ ...state, trackLogs: [next, ...state.trackLogs] });
    return next;
  }
  return requestApi("/api/track-logs", { method: "POST", body: JSON.stringify(log) });
}

export async function importDemoData() {
  if (isLocalDataMode) return writeLocalState(createDemoState());
  return normalizeState(await requestApi("/api/import-demo", { method: "POST", body: JSON.stringify({}) }));
}

export async function resetDemoData() {
  if (isLocalDataMode) return writeLocalState(createDemoState());
  return normalizeState(await requestApi("/api/reset-demo", { method: "POST", body: JSON.stringify({}) }));
}

export const proxyApi = {
  async diagnose() {
    return healthCheck();
  },
  async loadState() {
    if (isLocalDataMode) return readLocalState();
    return remoteState();
  },
  async seedDemo() {
    return importDemoData();
  },
  async addPoints(points) {
    const saved = [];
    for (const point of points) saved.push(await saveWallPoint(point));
    return { count: saved.length, points: saved };
  },
  updatePoint(id, changes) {
    return saveWallPoint({ id, ...changes });
  },
  async renameProject(projectNameFrom, projectNameTo) {
    const points = await getWallPoints();
    const changed = points.filter((point) => (point.project_name || "未分配项目") === projectNameFrom);
    for (const point of changed) await saveWallPoint({ ...point, project_name: projectNameTo });
    await saveProject({ id: projectNameTo, name: projectNameTo });
    return { count: changed.length };
  },
  getWorkers,
  dispatch(payloadOrWorkerId, pointIds = []) {
    return dispatchPoints(payloadOrWorkerId, pointIds);
  },
  async workerTasks(worker) {
    const state = await getWorkerTasks(worker);
    return { ...normalizeState(state), worker: state.worker || state.data?.worker || null };
  },
  async upload({ file, point, worker, kind }) {
    const media = await uploadPointMedia(point.id, [file], { workerId: worker.id, kind });
    await completePoint(point.id, { workerId: worker.id, mediaIds: media.map((item) => item.id) });
    return media[0] || {};
  },
  async updatePhotoKind(id, kind) {
    if (isLocalDataMode) {
      const state = readLocalState();
      writeLocalState({ ...state, photos: state.photos.map((photo) => photo.id === id ? { ...photo, kind } : photo) });
      return { id, kind };
    }
    return requestApi(`/api/point-media/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ kind }) });
  },
  saveTrackLog,
};
