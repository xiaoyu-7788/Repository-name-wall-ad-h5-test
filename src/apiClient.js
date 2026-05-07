import { supabaseEnv } from "./supabaseClient";

const LOCAL_STORE_KEY = "wall-ad-h5-demo-state";
const LOCAL_STORE_EVENT = "wall-ad-h5-demo-updated";

const rawMode = supabaseEnv.forceLocalDemo ? "local" : String(import.meta.env.VITE_DATA_MODE || "local").toLowerCase();
export const DATA_MODE = ["local", "mock-server", "production-api"].includes(rawMode) ? rawMode : "local";
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");

export const isLocalDataMode = DATA_MODE === "local";
export const isMockServerMode = DATA_MODE === "mock-server";
export const isProductionApiMode = DATA_MODE === "production-api";
export const isProxyDataMode = isMockServerMode || isProductionApiMode;
export const isDirectSupabaseMode = false;
export const isRemoteDataMode = isProxyDataMode;

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

const demoWorkers = [
  { id: "w1", code: "zhang", worker_key: "zhang", slug: "zhang", name: "张师傅", phone: "13800000001", car_no: "粤A·工001" },
  { id: "w2", code: "li", worker_key: "li", slug: "li", name: "李师傅", phone: "13800000002", car_no: "粤A·工002" },
];

const demoPoints = [
  { id: "p1", title: "GZ-BY-001", address: "广东省广州市白云区太和镇主干道路口", landlord_name: "黄先生", landlord_phone: "13531280287", k_code: "K-GZ-BY-001", project_name: "加多宝村镇墙体项目", status: "待施工", lng: 113.38431, lat: 23.30859, created_at: nowIso() },
  { id: "p2", title: "FS-NH-002", address: "广东省佛山市南海区村口商业街", landlord_name: "陈先生", landlord_phone: "13800138000", k_code: "K-FS-NH-002", project_name: "加多宝村镇墙体项目", status: "待施工", lng: 113.14588, lat: 23.04712, created_at: nowIso() },
  { id: "p3", title: "QY-YD-003", address: "广东省清远市英德市镇道转角", landlord_name: "林先生", landlord_phone: "13922223333", k_code: "K-QY-YD-003", project_name: "阿康化肥春耕项目", status: "待施工", lng: 113.41521, lat: 24.18677, created_at: nowIso() },
];

function createDemoState(overrides = {}) {
  const points = Array.isArray(overrides.points) ? overrides.points : Array.isArray(overrides.wallPoints) ? overrides.wallPoints : demoPoints;
  const workers = Array.isArray(overrides.workers) ? overrides.workers : demoWorkers;
  const projects = Array.isArray(overrides.projects) && overrides.projects.length
    ? overrides.projects
    : [...new Set(points.map((point) => point.project_name || "未分配项目"))].map((name) => ({ id: name, name, created_at: nowIso() }));
  return {
    projects,
    workers,
    points,
    wallPoints: points,
    tasks: Array.isArray(overrides.tasks) ? overrides.tasks : Array.isArray(overrides.dispatchTasks) ? overrides.dispatchTasks : [],
    dispatchTasks: Array.isArray(overrides.dispatchTasks) ? overrides.dispatchTasks : Array.isArray(overrides.tasks) ? overrides.tasks : [],
    photos: Array.isArray(overrides.photos) ? overrides.photos : Array.isArray(overrides.pointMedia) ? overrides.pointMedia : [],
    pointMedia: Array.isArray(overrides.pointMedia) ? overrides.pointMedia : Array.isArray(overrides.photos) ? overrides.photos : [],
    trackLogs: Array.isArray(overrides.trackLogs) ? overrides.trackLogs : [],
  };
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
    return createDemoState(JSON.parse(raw));
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

function normalizeState(payload = {}) {
  const data = payload.data || payload;
  const points = data.points || data.wallPoints || [];
  const tasks = data.tasks || data.dispatchTasks || [];
  const photos = data.photos || data.pointMedia || [];
  return {
    projects: data.projects || [],
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

function getDataModeLabel(mode = DATA_MODE) {
  if (mode === "mock-server") return "国内 Mock Server 模式";
  if (mode === "production-api") return "国内生产 API 模式";
  return "本地演示模式";
}

export { getDataModeLabel };

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, error: "INVALID_JSON", detail: text || "接口返回不是 JSON。" };
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
    const next = { id: project.id || project.name || uid("project"), created_at: nowIso(), ...project, updated_at: nowIso() };
    return writeLocalState({ ...state, projects: [next, ...state.projects.filter((item) => item.id !== next.id)] }).projects[0];
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
  return requestApi("/api/wall-points");
}

export async function saveWallPoint(point) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const next = { id: point.id || uid("point"), status: "待施工", created_at: nowIso(), ...point, updated_at: nowIso() };
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
      tasks: state.tasks.filter((item) => item.point_id !== pointId),
      photos: state.photos.filter((item) => item.point_id !== pointId),
    });
    return { id: pointId };
  }
  return requestApi(`/api/wall-points/${encodeURIComponent(pointId)}`, { method: "DELETE" });
}

export async function dispatchPoints(workerIdOrPayload, pointIds = []) {
  const payload = typeof workerIdOrPayload === "object"
    ? workerIdOrPayload
    : { workerId: workerIdOrPayload, pointIds };
  if (typeof workerIdOrPayload !== "object") payload.workerId = workerIdOrPayload;
  payload.pointIds = payload.pointIds || payload.point_ids || pointIds;
  payload.workerId = payload.workerId || payload.worker_id;

  if (isLocalDataMode) {
    const state = readLocalState();
    const selected = [...new Set(payload.pointIds || [])];
    const tasks = selected.map((pointId) => ({
      id: uid("task"),
      worker_id: payload.workerId,
      workerId: payload.workerId,
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
      points: state.points.map((point) => selected.includes(point.id) && point.status !== "已完成" ? { ...point, status: "施工中", updated_at: nowIso() } : point),
    });
    return { workerId: payload.workerId, inserted: tasks.length, points: next.points };
  }
  return requestApi("/api/dispatch", { method: "POST", body: JSON.stringify(payload) });
}

export async function getWorkerTasks(workerId) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const worker = state.workers.find((item) => item.id === workerId || item.code === workerId || item.worker_key === workerId || item.slug === workerId) || state.workers[0];
    const tasks = state.tasks.filter((task) => (task.worker_id || task.workerId) === worker?.id);
    const pointIds = tasks.map((task) => task.point_id || task.pointId);
    return { worker, tasks, points: state.points.filter((point) => pointIds.includes(point.id)), photos: state.photos };
  }
  return requestApi(`/api/worker-tasks/${encodeURIComponent(workerId)}`);
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
      kind: meta.kind || "",
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
  return requestApi(`/api/complete-point/${encodeURIComponent(pointId)}`, { method: "POST", body: JSON.stringify(payload) });
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
