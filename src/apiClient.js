import { supabaseEnv } from "./supabaseClient";

const LOCAL_STORE_KEY = "wall-ad-h5-demo-state";
const LOCAL_STORE_EVENT = "wall-ad-h5-demo-updated";
const LOCAL_SCHEMA_VERSION = 4;

function getBrowserHostname() {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname || "localhost";
}

function isLocalHostName(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function inferDefaultMode() {
  if (import.meta.env.PROD) return "mock-server";
  const host = getBrowserHostname();
  return isLocalHostName(host) ? "local" : "mock-server";
}

function isUnsafeProductionApiBase(value) {
  if (!value) return false;
  try {
    const { hostname } = new URL(value);
    if (isLocalHostName(hostname)) return true;
    const parts = hostname.split(".").map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
    return parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168);
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  const normalizedConfigured = configured.replace(/\/$/, "");
  if (import.meta.env.PROD) {
    return isUnsafeProductionApiBase(normalizedConfigured) ? "" : normalizedConfigured;
  }
  return normalizedConfigured || "http://localhost:8787";
}

export function getApiRequestUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

const configuredMode = String(import.meta.env.VITE_DATA_MODE || "").toLowerCase();
const rawMode = supabaseEnv.forceLocalDemo ? "local" : (configuredMode || inferDefaultMode());
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

export function normalizeCarNo(value) {
  return String(value || "").trim().toUpperCase();
}

const ACCESS_TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const WORKER_ONLINE_TTL_MS = 45 * 1000;
const POINT_STATUS_FLOW = ["待派单", "已派单", "待施工", "施工中", "已上传素材", "待验收", "已完成", "需复查"];
const MEDIA_KINDS = ["现场照片", "720 全景", "水印照片", "凯立德图片", "墙租协议图片", "视频"];
const DEFAULT_PROJECT_MATERIAL_RULES = ["现场照片"];

function normalizePointStatus(value, fallback = "待派单") {
  const raw = String(value || "").trim();
  if (POINT_STATUS_FLOW.includes(raw)) return raw;
  const aliases = {
    未派单: "待派单",
    待派: "待派单",
    已分配: "已派单",
    已派发: "已派单",
    待执行: "待施工",
    执行中: "施工中",
    进行中: "施工中",
    已上传: "已上传素材",
    素材已上传: "已上传素材",
    待审核: "待验收",
    待确认: "待验收",
    完成: "已完成",
    已完工: "已完成",
    复查: "需复查",
    异常: "需复查",
  };
  return aliases[raw] || (POINT_STATUS_FLOW.includes(fallback) ? fallback : "待派单");
}

function normalizeMediaKind(value, fallback = "现场照片") {
  const raw = String(value || "").trim();
  if (MEDIA_KINDS.includes(raw)) return raw;
  const normalized = raw.replace(/\s+/g, "").toLowerCase();
  if (normalized.includes("凯立德") || normalized.includes("kailide")) return "凯立德图片";
  if (normalized.includes("墙租") || normalized.includes("协议")) return "墙租协议图片";
  if (normalized.includes("水印")) return "水印照片";
  if (normalized.includes("720") || normalized.includes("全景")) {
    return normalized.includes("视频") || normalized.includes("video") ? "视频" : "720 全景";
  }
  if (normalized.includes("视频") || normalized.includes("video")) return "视频";
  if (normalized.includes("现场")) return "现场照片";
  return MEDIA_KINDS.includes(fallback) ? fallback : "现场照片";
}

function projectMaterialRulesForName(name = "") {
  const value = String(name || "");
  if (value.includes("加多宝")) return ["现场照片", "水印照片", "墙租协议图片"];
  if (value.includes("阿康")) return ["现场照片", "720 全景", "凯立德图片"];
  if (value.includes("能量")) return ["现场照片", "视频"];
  return DEFAULT_PROJECT_MATERIAL_RULES;
}

function normalizeMaterialRules(rules, projectName = "") {
  const source = Array.isArray(rules) && rules.length ? rules : projectMaterialRulesForName(projectName);
  const normalized = source.map((item) => normalizeMediaKind(item)).filter(Boolean);
  return [...new Set(normalized.length ? normalized : DEFAULT_PROJECT_MATERIAL_RULES)];
}

function materialCompletionForPoint(point, photos = [], projects = []) {
  const projectName = point?.project_name || point?.projectName || "未分配项目";
  const project = projects.find((item) => item.name === projectName || item.id === projectName) || {};
  const rules = normalizeMaterialRules(project.materialRules || project.material_rules, projectName);
  const pointPhotos = photos.filter((photo) => String(photo.point_id || photo.pointId) === String(point?.id));
  const hasKind = (kind) => pointPhotos.some((photo) => normalizeMediaKind(photo.kind || photo.media_kind || photo.file_name || photo.mime_type) === kind);
  const missing = rules.filter((kind) => !hasKind(kind));
  return { rules, missing, complete: missing.length === 0, hasAny: pointPhotos.length > 0 };
}

export function generateWorkerAccessToken() {
  let body = "";
  for (let index = 0; index < 12; index += 1) {
    body += ACCESS_TOKEN_CHARS[Math.floor(Math.random() * ACCESS_TOKEN_CHARS.length)];
  }
  return `tk_${body}`;
}

function workerAccessToken(worker = {}) {
  return String(worker.accessToken || worker.access_token || "").trim();
}

function parseTimeMs(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function isWorkerOnlineByHeartbeat(worker = {}, now = Date.now()) {
  if (!worker || worker.enabled === false) return false;
  const lastSeen = Math.max(
    parseTimeMs(worker.lastSeenAt || worker.last_seen_at),
    parseTimeMs(worker.lastLocationAt || worker.last_location_at),
  );
  if (!lastSeen) return false;
  const lastOffline = parseTimeMs(worker.lastOfflineAt || worker.last_offline_at);
  if (lastOffline && lastSeen <= lastOffline) return false;
  return now - lastSeen <= WORKER_ONLINE_TTL_MS;
}

function uniqueWorkerAccessToken(workers = [], currentId = "", preferred = "") {
  const used = new Set(
    workers
      .filter((worker) => String(worker.id) !== String(currentId))
      .map((worker) => workerAccessToken(worker))
      .filter(Boolean),
  );
  if (preferred && !used.has(preferred)) return preferred;
  let token = generateWorkerAccessToken();
  while (used.has(token)) token = generateWorkerAccessToken();
  return token;
}

const CHINESE_SURNAME_SLUGS = {
  张: "zhang",
  李: "li",
  黄: "huang",
  王: "wang",
  赵: "zhao",
  刘: "liu",
  陈: "chen",
  杨: "yang",
  周: "zhou",
  吴: "wu",
  徐: "xu",
  孙: "sun",
  马: "ma",
  朱: "zhu",
  胡: "hu",
  林: "lin",
  郭: "guo",
  何: "he",
  高: "gao",
  罗: "luo",
};

function slugifyWorker(value, fallback = "worker") {
  const raw = String(value || "").trim().toLowerCase();
  const ascii = raw
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  if (ascii) return ascii;
  const surname = String(value || "").trim().charAt(0);
  return CHINESE_SURNAME_SLUGS[surname] || fallback;
}

function uniqueSlug(base, workers = [], currentId = "") {
  const normalized = slugifyWorker(base, "worker");
  const used = new Set(
    workers
      .filter((worker) => String(worker.id) !== String(currentId))
      .map((worker) => String(worker.slug || "").toLowerCase())
      .filter(Boolean),
  );
  if (!used.has(normalized)) return normalized;
  let index = 2;
  while (used.has(`${normalized}${index}`)) index += 1;
  return `${normalized}${index}`;
}

function workerKeyFromDraft(worker = {}) {
  return String(worker.workerKey || worker.worker_key || worker.code || "").trim();
}

export function getDataModeLabel(mode = DATA_MODE) {
  if (mode === "mock-server") return "国内 Mock Server 模式";
  if (mode === "production-api") return "国内生产 API 模式";
  return "本地演示模式";
}

const demoProjects = [
  { id: "all", name: "全部项目", client: "总部调度", month: "长期", color: "#0f172a", hidden: false, materialRules: [] },
  { id: "jiaduobao", name: "加多宝项目", client: "加多宝", month: "2026-05", color: "#ef4444", hidden: false, materialRules: ["现场照片", "水印照片", "墙租协议图片"] },
  { id: "akang", name: "阿康化肥项目", client: "阿康化肥", month: "2026-05", color: "#22c55e", hidden: false, materialRules: ["现场照片", "720 全景", "凯立德图片"] },
  { id: "energy", name: "能量饮料项目", client: "能量饮料", month: "2026-06", color: "#2563eb", hidden: false, materialRules: ["现场照片", "视频"] },
];

const demoWorkers = [
  { id: "w1", code: "zhang", worker_key: "zhang", workerKey: "zhang", slug: "zhang", accessToken: "tk_ZHANGSAFEAB2", access_token: "tk_ZHANGSAFEAB2", name: "张师傅", phone: "13800000001", car_no: "粤A·工001", carNo: "粤A·工001", teamType: "install", teamTypeName: "安装队伍", projectId: "jiaduobao", project_name: "加多宝项目", enabled: true, online: true, status: "行驶中", lng: 113.3668, lat: 23.2618, speed: 28, moving: true, stoppedSeconds: 0 },
  { id: "w2", code: "li", worker_key: "li", workerKey: "li", slug: "li", accessToken: "tk_LEESAFEABCD2", access_token: "tk_LEESAFEABCD2", name: "李师傅", phone: "13800000002", car_no: "粤A·工002", carNo: "粤A·工002", teamType: "wall", teamTypeName: "找墙队伍", projectId: "jiaduobao", project_name: "加多宝项目", enabled: true, online: true, status: "已停止", lng: 113.2156, lat: 23.1076, speed: 0, moving: false, stoppedSeconds: 300 },
];

export function getWorkerTeamTypeName(worker = {}) {
  const type = worker.teamType || worker.team_type;
  if (type === "wall") return "找墙队伍";
  return "安装队伍";
}

function normalizeWorker(worker = {}, index = 0, workers = []) {
  const currentId = worker.id || "";
  const explicitWorkerKey = workerKeyFromDraft(worker);
  const slugBase = worker.slug || explicitWorkerKey || worker.name || worker.phone || currentId || `worker${index + 1}`;
  const slug = worker.slug ? slugifyWorker(worker.slug, `worker${index + 1}`) : uniqueSlug(slugBase, workers, currentId);
  const workerKey = explicitWorkerKey || slug;
  const teamType = worker.teamType || worker.team_type || "install";
  const carNo = normalizeCarNo(worker.carNo || worker.car_no || "");
  const accessToken = uniqueWorkerAccessToken(workers, currentId, workerAccessToken(worker));
  const speed = Number(worker.speed || 0);
  const moving = worker.moving === undefined
    ? speed > 3
    : worker.moving === true || worker.moving === "true" || worker.moving === 1 || worker.moving === "1";
  const enabled = worker.enabled !== false;
  const lastSeenAt = worker.lastSeenAt || worker.last_seen_at || null;
  const lastOnlineAt = worker.lastOnlineAt || worker.last_online_at || null;
  const lastOfflineAt = worker.lastOfflineAt || worker.last_offline_at || null;
  const lastLocationAt = worker.lastLocationAt || worker.last_location_at || null;
  return {
    ...worker,
    id: worker.id || `w${Date.now()}_${index}`,
    code: worker.code || workerKey,
    workerKey,
    worker_key: worker.worker_key || workerKey,
    slug,
    accessToken,
    access_token: worker.access_token || accessToken,
    name: worker.name || "未命名师傅",
    phone: worker.phone || "",
    carNo,
    car_no: worker.car_no || carNo,
    teamType,
    teamTypeName: worker.teamTypeName || getWorkerTeamTypeName({ teamType }),
    projectId: worker.projectId || worker.project_id || "all",
    project_id: worker.project_id || worker.projectId || "all",
    enabled,
    online: isWorkerOnlineByHeartbeat({ ...worker, enabled, lastSeenAt, lastOfflineAt, lastLocationAt }),
    lastSeenAt,
    lastOnlineAt,
    lastOfflineAt,
    lastLocationAt,
    last_seen_at: worker.last_seen_at || lastSeenAt,
    last_online_at: worker.last_online_at || lastOnlineAt,
    last_offline_at: worker.last_offline_at || lastOfflineAt,
    last_location_at: worker.last_location_at || lastLocationAt,
    lng: Number(worker.lng ?? worker.longitude ?? 113.2644),
    lat: Number(worker.lat ?? worker.latitude ?? 23.1291),
    speed,
    moving,
    stoppedSeconds: Number(worker.stoppedSeconds || worker.stopped_seconds || 0),
    status: enabled ? (worker.status || (moving ? "行驶中" : "已停止")) : "已停用",
    updatedAt: worker.updatedAt || worker.updated_at || nowIso(),
  };
}

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
  const points = (data.points || data.wallPoints || []).map((point) => ({
    ...point,
    status: normalizePointStatus(point.status),
  }));
  const tasks = (data.tasks || data.dispatchTasks || []).map((task) => ({
    ...task,
    status: normalizePointStatus(task.status, "已派单"),
  }));
  const photos = (data.photos || data.pointMedia || []).map((photo) => ({
    ...photo,
    kind: normalizeMediaKind(photo.kind || photo.media_kind || photo.file_name || photo.url),
  }));
  const projects = data.projects?.length
    ? data.projects.map((project) => ({
        ...project,
        id: project.id || project.name,
        name: project.name || project.project_name || project.id,
        client: project.client || project.customer || "未填写客户",
        month: project.month || project.year_month || "未设置年月",
        color: project.color || "#2563eb",
        hidden: Boolean(project.hidden),
        materialRules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
        material_rules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
      }))
    : demoProjects;

  return {
    version: LOCAL_SCHEMA_VERSION,
    projects,
    workers: (data.workers || []).map((worker, index, workers) => normalizeWorker(worker, index, workers)),
    points,
    wallPoints: points,
    tasks,
    dispatchTasks: tasks,
    photos,
    pointMedia: photos,
    trackLogs: data.trackLogs || [],
    workerLocations: data.workerLocations || data.worker_locations || [],
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
  const response = await fetch(getApiRequestUrl(path), {
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
    requestApi("/api/workers?includeDisabled=true"),
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
      ...project,
      id: project.id || project.name || uid("project"),
      name: project.name || project.id || "新项目",
      client: project.client || "未填写客户",
      month: project.month || "未设置年月",
      color: project.color || "#2563eb",
      hidden: Boolean(project.hidden),
      materialRules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
      material_rules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
      created_at: project.created_at || nowIso(),
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

function workersPath(options = {}) {
  const params = new URLSearchParams();
  if (options.includeDisabled) params.set("includeDisabled", "true");
  if (options.enabledOnly) params.set("enabledOnly", "true");
  const query = params.toString();
  return `/api/workers${query ? `?${query}` : ""}`;
}

function workerConflict(workers, draft, currentId = "") {
  const phone = String(draft.phone || "").trim();
  const slug = String(draft.slug || "").trim();
  const workerKey = workerKeyFromDraft(draft);
  const accessToken = workerAccessToken(draft);
  return workers.find((worker) => String(worker.id) !== String(currentId) && (
    (phone && String(worker.phone || "") === phone)
    || (slug && String(worker.slug || "") === slug)
    || (accessToken && workerAccessToken(worker) === accessToken)
    || (workerKey && [worker.workerKey, worker.worker_key, worker.code].filter(Boolean).map(String).includes(workerKey))
  ));
}

export async function getWorkers(options = {}) {
  if (isLocalDataMode) {
    const workers = readLocalState().workers;
    return options.enabledOnly ? workers.filter((worker) => worker.enabled !== false) : workers;
  }
  return requestApi(workersPath(options));
}

function matchesWorkerIdentifier(worker, workerId) {
  const query = String(workerId || "").trim();
  if (!query) return false;
  return [worker?.accessToken, worker?.access_token, worker?.id, worker?.code, worker?.worker_key, worker?.workerKey, worker?.slug, worker?.phone]
    .filter(Boolean)
    .map(String)
    .includes(query);
}

function findWorkerByIdentifier(workers, workerId) {
  const query = String(workerId || "").trim();
  if (!query) return null;
  const byToken = workers.find((worker) => workerAccessToken(worker) === query);
  if (byToken) return byToken;
  if (query.startsWith("tk_")) return null;
  const legacy = workers.find((worker) => String(worker.id || "") === query)
    || workers.find((worker) => String(worker.slug || "") === query)
    || workers.find((worker) => String(worker.worker_key || worker.workerKey || "") === query)
    || workers.find((worker) => matchesWorkerIdentifier(worker, query))
    || null;
  return legacy ? { ...legacy, __legacyLink: true } : null;
}

export async function getWorker(workerId) {
  if (isLocalDataMode) {
    return findWorkerByIdentifier(readLocalState().workers, workerId);
  }
  return requestApi(`/api/workers/${encodeURIComponent(workerId)}`);
}

export async function saveWorker(worker) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const currentId = worker.id || "";
    const conflict = workerConflict(state.workers, worker, currentId);
    if (conflict) throw new Error("手机号、链接标识或唯一编码已存在");
    const workerId = currentId || uid("worker");
    const slug = worker.slug ? slugifyWorker(worker.slug, workerId) : uniqueSlug(worker.name || worker.phone || workerId, state.workers, workerId);
    const workerKey = workerKeyFromDraft(worker) || slug;
    const accessToken = uniqueWorkerAccessToken(state.workers, workerId, workerAccessToken(worker));
    const next = normalizeWorker({
      id: workerId,
      ...worker,
      slug,
      accessToken,
      access_token: worker.access_token || accessToken,
      workerKey,
      worker_key: worker.worker_key || workerKey,
      code: worker.code || workerKey,
      carNo: normalizeCarNo(worker.carNo || worker.car_no || ""),
      car_no: normalizeCarNo(worker.car_no || worker.carNo || ""),
      updated_at: nowIso(),
      updatedAt: nowIso(),
    }, 0, state.workers);
    writeLocalState({ ...state, workers: [next, ...state.workers.filter((item) => item.id !== next.id)] });
    return next;
  }
  if (worker.id) return requestApi(`/api/workers/${encodeURIComponent(worker.id)}`, { method: "PUT", body: JSON.stringify(worker) });
  return requestApi("/api/workers", { method: "POST", body: JSON.stringify(worker) });
}

export async function deleteWorker(workerId) {
  if (isLocalDataMode) {
    const state = readLocalState();
    writeLocalState({
      ...state,
      workers: state.workers.filter((worker) => String(worker.id) !== String(workerId)),
      tasks: state.tasks.filter((task) => String(task.worker_id || task.workerId) !== String(workerId)),
    });
    return { id: workerId, deleted: true };
  }
  return requestApi(`/api/workers/${encodeURIComponent(workerId)}`, { method: "DELETE" });
}

export async function setWorkerEnabled(workerId, enabled) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const changedAt = nowIso();
    writeLocalState({
      ...state,
      workers: state.workers.map((worker) => String(worker.id) === String(workerId)
        ? normalizeWorker({
            ...worker,
            enabled,
            online: false,
            lastOfflineAt: enabled ? worker.lastOfflineAt : changedAt,
            last_offline_at: enabled ? worker.last_offline_at : changedAt,
            status: enabled ? "已停止" : "已停用",
            updated_at: changedAt,
            updatedAt: changedAt,
          })
        : worker),
    });
    return { id: workerId, enabled };
  }
  return requestApi(`/api/workers/${encodeURIComponent(workerId)}/enable`, { method: "PATCH", body: JSON.stringify({ enabled }) });
}

export async function resetWorkerAccessToken(workerId) {
  if (isLocalDataMode) {
    const state = readLocalState();
    let updated = null;
    const workers = state.workers.map((worker) => {
      if (String(worker.id) !== String(workerId)) return worker;
      const accessToken = uniqueWorkerAccessToken(state.workers, worker.id);
      updated = normalizeWorker({ ...worker, accessToken, access_token: accessToken, updated_at: nowIso(), updatedAt: nowIso() }, 0, state.workers);
      return updated;
    });
    writeLocalState({ ...state, workers });
    return updated || { id: workerId };
  }
  return requestApi(`/api/workers/${encodeURIComponent(workerId)}/access-token`, { method: "PATCH" });
}

export async function sendWorkerHeartbeat(workerId, payload = {}) {
  const timestamp = nowIso();
  if (isLocalDataMode) {
    const state = readLocalState();
    let updated = null;
    const workers = state.workers.map((worker) => {
      if (!matchesWorkerIdentifier(worker, workerId)) return worker;
      if (worker.enabled === false) throw new Error("该师傅链接已停用，请联系管理员。");
      const wasOnline = isWorkerOnlineByHeartbeat(worker);
      const next = {
        ...worker,
        online: true,
        lastSeenAt: timestamp,
        last_seen_at: timestamp,
        lastOnlineAt: wasOnline ? (worker.lastOnlineAt || worker.last_online_at || timestamp) : timestamp,
        last_online_at: wasOnline ? (worker.last_online_at || worker.lastOnlineAt || timestamp) : timestamp,
        updatedAt: timestamp,
        updated_at: timestamp,
      };
      const lng = Number(payload.lng);
      const lat = Number(payload.lat);
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        next.lng = lng;
        next.lat = lat;
      }
      if (payload.speed !== undefined) next.speed = Number(payload.speed || 0);
      if (payload.moving !== undefined) next.moving = payload.moving === true || payload.moving === "true" || payload.moving === 1 || payload.moving === "1";
      if (payload.stoppedSeconds !== undefined || payload.stopped_seconds !== undefined) next.stoppedSeconds = Number(payload.stoppedSeconds || payload.stopped_seconds || 0);
      if (next.moving !== undefined) next.status = next.moving ? "行驶中" : "已停止";
      updated = normalizeWorker(next, 0, state.workers);
      return updated;
    });
    if (!updated) throw new Error("链接无效或已过期，请联系管理员重新发送师傅链接。");
    writeLocalState({ ...state, workers });
    return updated;
  }
  return requestApi(`/api/workers/${encodeURIComponent(workerId)}/heartbeat`, { method: "POST", body: JSON.stringify({ online: true, source: "worker-page", ...payload }) });
}

export async function markWorkerOffline(workerId) {
  const timestamp = nowIso();
  if (isLocalDataMode) {
    const state = readLocalState();
    let updated = null;
    const workers = state.workers.map((worker) => {
      if (!matchesWorkerIdentifier(worker, workerId)) return worker;
      updated = normalizeWorker({
        ...worker,
        online: false,
        lastOfflineAt: timestamp,
        last_offline_at: timestamp,
        updatedAt: timestamp,
        updated_at: timestamp,
        status: worker.enabled === false ? "已停用" : "已停止",
      }, 0, state.workers);
      return updated;
    });
    if (!updated) return { id: workerId, offline: true };
    writeLocalState({ ...state, workers });
    return updated;
  }
  return requestApi(`/api/workers/${encodeURIComponent(workerId)}/offline`, { method: "POST", body: JSON.stringify({ source: "worker-page" }) });
}

function normalizeLocationPayload(payload = {}) {
  const lng = Number(payload.lng);
  const lat = Number(payload.lat);
  const speed = Number(payload.speed || 0);
  const moving = payload.moving === undefined
    ? speed > 3
    : payload.moving === true || payload.moving === "true" || payload.moving === 1 || payload.moving === "1";
  return {
    ...payload,
    workerId: payload.workerId || payload.worker_id,
    worker_id: payload.worker_id || payload.workerId,
    lng,
    lat,
    accuracy: Number(payload.accuracy || 0),
    speed,
    heading: payload.heading == null ? null : Number(payload.heading),
    moving,
    stoppedSeconds: Number(payload.stoppedSeconds || payload.stopped_seconds || 0),
    timestamp: payload.timestamp || nowIso(),
  };
}

export async function saveWorkerLocation(payload) {
  const location = normalizeLocationPayload(payload);
  if (!Number.isFinite(location.lng) || !Number.isFinite(location.lat)) {
    throw new Error("定位坐标无效");
  }

  if (isLocalDataMode) {
    const state = readLocalState();
    const workerId = location.workerId;
    const workers = state.workers.map((worker) => {
      if (!matchesWorkerIdentifier(worker, workerId)) return worker;
      const wasOnline = isWorkerOnlineByHeartbeat(worker);
      return {
        ...worker,
        lng: location.lng,
        lat: location.lat,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
        moving: location.moving,
        stoppedSeconds: location.stoppedSeconds,
        online: true,
        lastSeenAt: location.timestamp,
        last_seen_at: location.timestamp,
        lastOnlineAt: wasOnline ? (worker.lastOnlineAt || worker.last_online_at || location.timestamp) : location.timestamp,
        last_online_at: wasOnline ? (worker.last_online_at || worker.lastOnlineAt || location.timestamp) : location.timestamp,
        lastLocationAt: location.timestamp,
        last_location_at: location.timestamp,
        status: location.moving ? "行驶中" : "已停止",
        updatedAt: location.timestamp,
        updated_at: nowIso(),
      };
    });
    const locationRecord = { id: uid("worker_location"), ...location, created_at: nowIso() };
    const trackLog = {
      id: uid("track"),
      worker_id: location.worker_id,
      worker_name: state.workers.find((worker) => matchesWorkerIdentifier(worker, workerId))?.name || workerId,
      event: location.event || (location.moving ? "实时定位" : "定位停车"),
      speed: location.speed,
      stop_minutes: Math.round(location.stoppedSeconds / 60),
      lng: location.lng,
      lat: location.lat,
      project_name: location.project_name || "",
      recorded_at: location.timestamp,
      created_at: nowIso(),
    };
    const next = writeLocalState({
      ...state,
      workers,
      workerLocations: [locationRecord, ...(state.workerLocations || [])].slice(0, 500),
      trackLogs: [trackLog, ...state.trackLogs].slice(0, 500),
    });
    return { worker: next.workers.find((worker) => matchesWorkerIdentifier(worker, workerId)) || null, location: locationRecord };
  }

  return requestApi("/api/worker-location", { method: "POST", body: JSON.stringify(location) });
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
      status: normalizePointStatus(point.status),
      created_at: point.created_at || nowIso(),
      ...point,
      status: normalizePointStatus(point.status),
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
    const worker = findWorkerByIdentifier(state.workers, payload.workerId);
    if (!worker) throw new Error("链接无效或已过期，请联系管理员重新发送师傅链接。");
    if (worker.enabled === false) throw new Error("该师傅链接已停用，请联系管理员。");
    const workerId = worker.id;
    const tasks = selected.map((pointId) => ({
      id: uid("task"),
      worker_id: workerId,
      workerId,
      point_id: pointId,
      pointId,
      status: "已派单",
      assigned_at: nowIso(),
      created_at: nowIso(),
    }));
    const taskKeys = new Set(tasks.map((task) => `${task.worker_id}:${task.point_id}`));
    const next = writeLocalState({
      ...state,
      tasks: [...tasks, ...state.tasks.filter((task) => !taskKeys.has(`${task.worker_id || task.workerId}:${task.point_id || task.pointId}`))],
      points: state.points.map((point) => selected.includes(String(point.id)) && normalizePointStatus(point.status) !== "已完成" ? { ...point, status: "已派单", updated_at: nowIso() } : point),
    });
    return { ok: true, workerId, inserted: tasks.length, updated_points: selected.length, points: next.points, point_ids: selected };
  }
  return requestApi("/api/dispatch", { method: "POST", body: JSON.stringify(payload) });
}

function normalizeWorkerTasksPayload(payload = {}, workerId = "") {
  const data = payload.data || payload || {};
  const tasks = Array.isArray(data.tasks) ? data.tasks : (Array.isArray(data.dispatchTasks) ? data.dispatchTasks : []);
  const photos = Array.isArray(data.photos) ? data.photos : (Array.isArray(data.pointMedia) ? data.pointMedia : []);
  const rawTaskPoints = Array.isArray(data.taskPoints) ? data.taskPoints : [];
  const rawPoints = Array.isArray(data.points) ? data.points : (Array.isArray(data.wallPoints) ? data.wallPoints : []);
  const pointsById = new Map(rawPoints.map((point) => [String(point.id), point]));
  const taskPoints = rawTaskPoints.length
    ? rawTaskPoints
    : (tasks.length
      ? tasks.map((task) => {
          const pointId = task.point_id || task.pointId;
          const point = pointsById.get(String(pointId)) || {};
          return {
            ...task,
            ...point,
            task_id: task.id,
            point_id: pointId,
            pointId,
            worker_id: task.worker_id || task.workerId || data.worker?.id || workerId,
            workerId: task.workerId || task.worker_id || data.worker?.id || workerId,
            dispatch_status: task.status,
          };
        }).filter((point) => point.id || point.point_id || point.pointId)
      : rawPoints);
  const count = Number.isFinite(Number(data.count)) ? Number(data.count) : taskPoints.length;

  return {
    ...data,
    worker: data.worker || null,
    workerId: data.workerId || data.worker?.id || workerId,
    count,
    tasks,
    dispatchTasks: Array.isArray(data.dispatchTasks) ? data.dispatchTasks : tasks,
    points: taskPoints,
    taskPoints,
    photos,
    pointMedia: photos,
    trackLogs: Array.isArray(data.trackLogs) ? data.trackLogs : [],
  };
}

export async function getWorkerTasks(workerId) {
  if (isLocalDataMode) {
    const state = readLocalState();
    const worker = findWorkerByIdentifier(state.workers, workerId);
    if (!worker) throw new Error("链接无效或已过期，请联系管理员重新发送师傅链接。");
    if (worker.enabled === false) throw new Error("该师傅链接已停用，请联系管理员。");
    const tasks = state.tasks.filter((task) => (task.worker_id || task.workerId) === worker?.id);
    const pointIds = tasks.map((task) => String(task.point_id || task.pointId));
    const points = state.points.filter((point) => pointIds.includes(String(point.id)));
    return normalizeWorkerTasksPayload({ worker, workerId: worker?.id || workerId, count: points.length, tasks, points, photos: state.photos, trackLogs: state.trackLogs }, workerId);
  }
  return normalizeWorkerTasksPayload(await requestApi(`/api/worker-tasks?workerId=${encodeURIComponent(workerId)}`), workerId);
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
      kind: normalizeMediaKind(meta.kind || file.name || file.type),
      content_type: file.type,
      created_at: nowIso(),
    }));
    const photos = [...media, ...state.photos];
    const points = state.points.map((point) => {
      if (String(point.id) !== String(pointId)) return point;
      const completion = materialCompletionForPoint(point, photos, state.projects);
      const nextStatus = completion.complete ? "待验收" : "已上传素材";
      return { ...point, status: nextStatus, updated_at: nowIso() };
    });
    writeLocalState({ ...state, photos, points });
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
  saveWorker,
  deleteWorker,
  setWorkerEnabled,
  resetWorkerAccessToken,
  sendWorkerHeartbeat,
  markWorkerOffline,
  saveWorkerLocation,
  dispatch(payloadOrWorkerId, pointIds = []) {
    return dispatchPoints(payloadOrWorkerId, pointIds);
  },
  async workerTasks(worker) {
    const state = await getWorkerTasks(worker);
    return { ...normalizeState(state), worker: state.worker || state.data?.worker || null };
  },
  async upload({ file, point, worker, kind }) {
    const media = await uploadPointMedia(point.id, [file], { workerId: worker.id, kind });
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
