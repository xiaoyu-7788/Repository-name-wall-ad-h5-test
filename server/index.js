const cors = require("cors");
const express = require("express");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const multer = require("multer");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DB_PATH = path.join(DATA_DIR, "db.json");
const DIST_DIR = path.join(ROOT, "..", "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeCarNo(value) {
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

function materialCompletionForPoint(point, media = [], projects = []) {
  const projectName = point?.project_name || point?.projectName || "未分配项目";
  const project = projects.find((item) => item.name === projectName || item.id === projectName) || {};
  const rules = normalizeMaterialRules(project.materialRules || project.material_rules, projectName);
  const pointMedia = media.filter((item) => String(item.point_id || item.pointId) === String(point?.id));
  const hasKind = (kind) => pointMedia.some((item) => normalizeMediaKind(item.kind || item.media_kind || item.file_name || item.mime_type) === kind);
  const missing = rules.filter((kind) => !hasKind(kind));
  return { rules, missing, complete: missing.length === 0, hasAny: pointMedia.length > 0 };
}

function generateWorkerAccessToken() {
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

function isWorkerOnline(worker = {}, now = Date.now()) {
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

const demoWorkers = [
  { id: "w1", code: "zhang", worker_key: "zhang", workerKey: "zhang", slug: "zhang", accessToken: "tk_ZHANGSAFEAB2", access_token: "tk_ZHANGSAFEAB2", name: "张师傅", phone: "13800000001", car_no: "粤A·工001", carNo: "粤A·工001", teamType: "install", teamTypeName: "安装队伍", projectId: "jiaduobao", project_name: "加多宝村镇墙体项目", enabled: true, online: true, lng: 113.3668, lat: 23.2618, speed: 28, moving: true, stoppedSeconds: 0, status: "行驶中", created_at: "2026-01-01T00:00:00.000Z" },
  { id: "w2", code: "li", worker_key: "li", workerKey: "li", slug: "li", accessToken: "tk_LEESAFEABCD2", access_token: "tk_LEESAFEABCD2", name: "李师傅", phone: "13800000002", car_no: "粤A·工002", carNo: "粤A·工002", teamType: "wall", teamTypeName: "找墙队伍", projectId: "jiaduobao", project_name: "加多宝村镇墙体项目", enabled: true, online: true, lng: 113.2156, lat: 23.1076, speed: 0, moving: false, stoppedSeconds: 300, status: "已停止", created_at: "2026-01-01T00:00:00.000Z" },
];

const demoWallPoints = [
  { id: "p1", title: "GZ-BY-001", address: "广东省广州市白云区太和镇主干道路口", landlord_name: "黄先生", landlord_phone: "13531280287", k_code: "K-GZ-BY-001", project_name: "加多宝村镇墙体项目", status: "待施工", lng: 113.38431, lat: 23.30859, created_at: "2026-01-02T00:00:00.000Z" },
  { id: "p2", title: "FS-NH-002", address: "广东省佛山市南海区村口商业街", landlord_name: "陈先生", landlord_phone: "13800138000", k_code: "K-FS-NH-002", project_name: "加多宝村镇墙体项目", status: "待施工", lng: 113.14588, lat: 23.04712, created_at: "2026-01-03T00:00:00.000Z" },
  { id: "p3", title: "QY-YD-003", address: "广东省清远市英德市镇道转角", landlord_name: "林先生", landlord_phone: "13922223333", k_code: "K-QY-YD-003", project_name: "阿康化肥春耕项目", status: "待施工", lng: 113.41521, lat: 24.18677, created_at: "2026-01-04T00:00:00.000Z" },
];

function demoDb() {
  const projects = [...new Set(demoWallPoints.map((point) => point.project_name))].map((name) => ({
    id: name,
    name,
    materialRules: normalizeMaterialRules([], name),
    material_rules: normalizeMaterialRules([], name),
    created_at: "2026-01-01T00:00:00.000Z",
  }));
  return {
    projects,
    workers: demoWorkers,
    wallPoints: demoWallPoints,
    dispatchTasks: [],
    pointMedia: [],
    trackLogs: [],
    workerLocations: [],
  };
}

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, `${JSON.stringify(normalizeDb(demoDb()), null, 2)}\n`);
    return;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const normalized = normalizeDb(parsed);
    const needsWorkerMigration = normalized.workers.some((worker) => {
      const original = parsed.workers?.find((item) => String(item.id) === String(worker.id));
      return !original?.accessToken || !Object.prototype.hasOwnProperty.call(original || {}, "lastSeenAt");
    });
    if (needsWorkerMigration) fs.writeFileSync(DB_PATH, `${JSON.stringify(normalized, null, 2)}\n`);
  } catch {
    fs.writeFileSync(DB_PATH, `${JSON.stringify(normalizeDb(demoDb()), null, 2)}\n`);
  }
}

function defaultWorkerLocation(index = 0) {
  const defaults = [
    { lng: 113.3668, lat: 23.2618, speed: 28, moving: true, stoppedSeconds: 0 },
    { lng: 113.2156, lat: 23.1076, speed: 0, moving: false, stoppedSeconds: 300 },
    { lng: 113.412, lat: 23.168, speed: 16, moving: true, stoppedSeconds: 0 },
  ];
  const safeIndex = Number.isFinite(index) && index >= 0 ? index : 0;
  return defaults[safeIndex % defaults.length];
}

function teamTypeName(teamType) {
  return teamType === "wall" ? "找墙队伍" : "安装队伍";
}

function slugifyWorker(value, fallback = "worker") {
  const raw = String(value || "").trim().toLowerCase();
  const slug = raw
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  if (slug) return slug;
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

function normalizeWorker(worker, index, db = {}) {
  const latestLog = (Array.isArray(db.trackLogs) ? db.trackLogs : [])
    .find((log) => String(log.worker_id || log.workerId) === String(worker.id));
  const fallback = defaultWorkerLocation(index);
  const lng = Number(worker.lng ?? worker.longitude ?? latestLog?.lng ?? fallback.lng);
  const lat = Number(worker.lat ?? worker.latitude ?? latestLog?.lat ?? fallback.lat);
  const speed = Number(worker.speed ?? latestLog?.speed ?? fallback.speed ?? 0);
  const stoppedSeconds = Number(worker.stoppedSeconds ?? worker.stopped_seconds ?? ((latestLog?.stop_minutes || 0) * 60) ?? fallback.stoppedSeconds ?? 0);
  const moving = worker.moving === undefined
    ? speed > 3
    : worker.moving === true || worker.moving === "true" || worker.moving === 1 || worker.moving === "1";
  const explicitWorkerKey = workerKeyFromDraft(worker);
  const workerKey = explicitWorkerKey || worker.slug || slugifyWorker(worker.name || worker.phone || worker.id, `worker${index + 1}`);
  const slug = worker.slug ? slugifyWorker(worker.slug, `worker${index + 1}`) : slugifyWorker(workerKey || worker.name || worker.id, `worker${index + 1}`);
  const teamType = worker.teamType || worker.team_type || "install";
  const enabled = worker.enabled !== false;
  const lastSeenAt = worker.lastSeenAt || worker.last_seen_at || null;
  const lastOnlineAt = worker.lastOnlineAt || worker.last_online_at || null;
  const lastOfflineAt = worker.lastOfflineAt || worker.last_offline_at || null;
  const lastLocationAt = worker.lastLocationAt || worker.last_location_at || latestLog?.recorded_at || null;
  const online = isWorkerOnline({ ...worker, enabled, lastSeenAt, lastOfflineAt, lastLocationAt });
  const carNo = normalizeCarNo(worker.carNo || worker.car_no || "");
  const accessToken = uniqueWorkerAccessToken(Array.isArray(db.workers) ? db.workers : [], worker.id || "", workerAccessToken(worker));
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
    teamTypeName: worker.teamTypeName || teamTypeName(teamType),
    projectId: worker.projectId || worker.project_id || "all",
    project_id: worker.project_id || worker.projectId || "all",
    enabled,
    online,
    lastSeenAt,
    lastOnlineAt,
    lastOfflineAt,
    lastLocationAt,
    last_seen_at: worker.last_seen_at || lastSeenAt,
    last_online_at: worker.last_online_at || lastOnlineAt,
    last_offline_at: worker.last_offline_at || lastOfflineAt,
    last_location_at: worker.last_location_at || lastLocationAt,
    lng,
    lat,
    speed,
    moving,
    stoppedSeconds,
    status: enabled ? (worker.status || (moving ? "行驶中" : "已停止")) : "已停用",
    updatedAt: worker.updatedAt || worker.updated_at || nowIso(),
  };
}

function normalizeDb(db) {
  const wallPoints = Array.isArray(db.wallPoints) ? db.wallPoints.map((point) => ({
    ...point,
    status: normalizePointStatus(point.status),
  })) : [];
  const dispatchTasks = Array.isArray(db.dispatchTasks) ? db.dispatchTasks.map((task) => ({
    ...task,
    status: normalizePointStatus(task.status, "已派单"),
  })) : [];
  const pointMedia = Array.isArray(db.pointMedia) ? db.pointMedia.map((item) => ({
    ...item,
    kind: normalizeMediaKind(item.kind || item.media_kind || item.file_name || item.url),
  })) : [];
  return {
    projects: Array.isArray(db.projects) ? db.projects.map((project) => ({
      ...project,
      id: project.id || project.name,
      name: project.name || project.id || "未命名项目",
      materialRules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
      material_rules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
    })) : [],
    workers: Array.isArray(db.workers) ? db.workers.map((worker, index) => normalizeWorker(worker, index, db)) : [],
    wallPoints,
    dispatchTasks,
    pointMedia,
    trackLogs: Array.isArray(db.trackLogs) ? db.trackLogs : [],
    workerLocations: Array.isArray(db.workerLocations) ? db.workerLocations : (Array.isArray(db.worker_locations) ? db.worker_locations : []),
  };
}

function readDb() {
  ensureDirs();
  try {
    return normalizeDb(JSON.parse(fs.readFileSync(DB_PATH, "utf8")));
  } catch {
    const fresh = demoDb();
    writeDb(fresh);
    return fresh;
  }
}

function writeDb(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, `${JSON.stringify(normalizeDb(db), null, 2)}\n`);
  return normalizeDb(db);
}

function ok(res, data = null, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, error, detail = "") {
  return res.status(status).json({ ok: false, error, detail });
}

function upsert(list, item) {
  const id = item.id || uid("id");
  const next = { ...item, id, updated_at: nowIso() };
  const rest = list.filter((row) => row.id !== id);
  return [next, ...rest];
}

function nextWorkerId(workers) {
  const used = new Set(workers.map((worker) => String(worker.id)));
  let index = workers.length + 1;
  let candidate = `w${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `w${index}`;
  }
  return candidate;
}

function buildWorkerDraft(input = {}, existing = {}, workers = []) {
  const id = existing.id || input.id || nextWorkerId(workers);
  const explicitWorkerKey = workerKeyFromDraft(input) || workerKeyFromDraft(existing);
  const autoSlug = input.slug
    ? slugifyWorker(input.slug, id)
    : uniqueSlug(input.name || existing.name || input.phone || existing.phone || id, workers, id);
  const workerKey = explicitWorkerKey || autoSlug;
  const accessToken = uniqueWorkerAccessToken(workers, id, workerAccessToken(input) || workerAccessToken(existing));
  return normalizeWorker({
    ...existing,
    ...input,
    id,
    code: input.code || workerKey,
    workerKey,
    worker_key: input.worker_key || workerKey,
    slug: input.slug ? slugifyWorker(input.slug, id) : autoSlug,
    accessToken,
    access_token: input.access_token || accessToken,
    carNo: normalizeCarNo(input.carNo || input.car_no || existing.carNo || existing.car_no || ""),
    car_no: normalizeCarNo(input.car_no || input.carNo || existing.car_no || existing.carNo || ""),
    enabled: input.enabled === undefined ? (existing.enabled !== false) : booleanValue(input.enabled, true),
    online: input.online === undefined ? Boolean(existing.online) : booleanValue(input.online, false),
    lastSeenAt: input.lastSeenAt || input.last_seen_at || existing.lastSeenAt || existing.last_seen_at || null,
    lastOnlineAt: input.lastOnlineAt || input.last_online_at || existing.lastOnlineAt || existing.last_online_at || null,
    lastOfflineAt: input.lastOfflineAt || input.last_offline_at || existing.lastOfflineAt || existing.last_offline_at || null,
    teamType: input.teamType || input.team_type || existing.teamType || "install",
    projectId: input.projectId || input.project_id || existing.projectId || "all",
    updated_at: nowIso(),
    updatedAt: nowIso(),
  }, workers.findIndex((worker) => String(worker.id) === String(id)), { trackLogs: [] });
}

function findWorker(db, query) {
  return findWorkerMatch(db, query)?.worker || null;
}

function findWorkerMatch(db, query) {
  const value = String(query || "").trim();
  if (!value) return null;
  const byToken = db.workers.find((worker) => workerAccessToken(worker) === value);
  if (byToken) return { worker: byToken, legacy: false };
  if (value.startsWith("tk_")) return null;
  const legacy = db.workers.find((worker) => String(worker.id || "") === value)
    || db.workers.find((worker) => String(worker.slug || "") === value)
    || db.workers.find((worker) => String(worker.worker_key || worker.workerKey || "") === value)
    || db.workers.find((worker) => matchWorker(worker, value))
    || null;
  return legacy ? { worker: legacy, legacy: true } : null;
}

function workerDuplicate(workers, draft, currentId = "") {
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

function pointIdOf(task) {
  return task.point_id || task.pointId;
}

function workerIdOf(task) {
  return task.worker_id || task.workerId;
}

function matchWorker(worker, query) {
  const value = String(query || "").trim();
  return [worker.accessToken, worker.access_token, worker.id, worker.code, worker.worker_key, worker.workerKey, worker.slug, worker.phone].filter(Boolean).map(String).includes(value)
    || (value === "li" && (String(worker.name || "").includes("李") || String(worker.car_no || "").includes("工002")))
    || (value === "zhang" && (String(worker.name || "").includes("张") || String(worker.car_no || "").includes("工001")));
}

function booleanValue(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === 1 || value === "1";
}

function buildWorkerTasksPayload(db, workerQuery) {
  const worker = findWorker(db, workerQuery);
  if (!worker) return null;
  if (worker.enabled === false) {
    return {
      worker,
      workerId: worker.id,
      disabled: true,
      count: 0,
      tasks: [],
      dispatchTasks: [],
      taskPoints: [],
      points: [],
      photos: db.pointMedia,
      pointMedia: db.pointMedia,
      message: "该师傅链接已停用，请联系管理员。",
    };
  }
  const dispatchTasks = db.dispatchTasks.filter((task) => String(workerIdOf(task)) === String(worker.id) || matchWorker(worker, workerIdOf(task)));
  const pointIds = dispatchTasks.map((task) => String(pointIdOf(task)));
  const points = db.wallPoints.filter((point) => pointIds.includes(String(point.id)));
  const taskPoints = dispatchTasks.map((task) => {
    const point = points.find((item) => String(item.id) === String(pointIdOf(task))) || {};
    return {
      ...task,
      ...point,
      task_id: task.id,
      point_id: pointIdOf(task),
      worker_id: workerIdOf(task),
      dispatch_status: task.status,
    };
  });
  return {
    worker,
    workerId: worker.id,
    count: points.length,
    tasks: dispatchTasks,
    dispatchTasks,
    taskPoints,
    points,
    photos: db.pointMedia,
    pointMedia: db.pointMedia,
  };
}

function createApp() {
  ensureDirs();
  const app = express();
  const upload = multer({ dest: UPLOAD_DIR });

  app.use(cors());
  app.use(express.json({ limit: "20mb" }));
  app.use("/uploads", express.static(UPLOAD_DIR));

  app.get("/api/health", (req, res) => {
    const host = req.get("host") || "";
    const portPart = host.includes(":") ? `:${host.split(":").pop()}` : "";
    const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
    const requestOrigin = host ? `${protocol}://${host}` : "";
    const publicAppOrigin = String(process.env.PUBLIC_APP_ORIGIN || process.env.VITE_PUBLIC_APP_ORIGIN || "").trim().replace(/\/$/, "");
    const lanIps = getLanIps();
    ok(res, {
      mode: "mock-server",
      message: "国内 Mock Server 正常",
      time: nowIso(),
      requestOrigin,
      publicAppOriginConfigured: Boolean(publicAppOrigin),
      publicAppOrigin: publicAppOrigin ? "已配置" : "",
      lanIps,
      lanAdminUrls: lanIps.map((ip) => `${protocol}://${ip}${portPart}/admin`),
      recommendedAdminUrl: publicAppOrigin ? `${publicAppOrigin}/admin` : (requestOrigin ? `${requestOrigin}/admin` : ""),
      recommendedWorkerUrlPattern: publicAppOrigin ? `${publicAppOrigin}/worker/tk_************` : (requestOrigin ? `${requestOrigin}/worker/tk_************` : ""),
      storageMode: "local-json-and-uploads",
    });
  });

  app.get("/api/projects", (req, res) => ok(res, readDb().projects));
  app.post("/api/projects", (req, res) => {
    const db = readDb();
    const name = req.body.name || req.body.id || "新项目";
    db.projects = upsert(db.projects, {
      id: req.body.id || name || uid("project"),
      ...req.body,
      name,
      materialRules: normalizeMaterialRules(req.body.materialRules || req.body.material_rules, name),
      material_rules: normalizeMaterialRules(req.body.materialRules || req.body.material_rules, name),
      created_at: req.body.created_at || nowIso(),
    });
    writeDb(db);
    ok(res, db.projects[0]);
  });
  app.put("/api/projects/:id", (req, res) => {
    const db = readDb();
    const name = req.body.name || req.params.id;
    db.projects = upsert(db.projects, {
      ...req.body,
      id: req.params.id,
      name,
      materialRules: normalizeMaterialRules(req.body.materialRules || req.body.material_rules, name),
      material_rules: normalizeMaterialRules(req.body.materialRules || req.body.material_rules, name),
    });
    writeDb(db);
    ok(res, db.projects[0]);
  });
  app.delete("/api/projects/:id", (req, res) => {
    const db = readDb();
    db.projects = db.projects.filter((item) => item.id !== req.params.id);
    writeDb(db);
    ok(res, { id: req.params.id });
  });

  app.get("/api/workers", (req, res) => {
    const db = readDb();
    const enabledOnly = booleanValue(req.query.enabledOnly, false) || req.query.includeDisabled === "false";
    const workers = enabledOnly ? db.workers.filter((worker) => worker.enabled !== false) : db.workers;
    ok(res, workers);
  });
  app.get("/api/workers/:workerIdOrSlug", (req, res) => {
    const match = findWorkerMatch(readDb(), req.params.workerIdOrSlug);
    if (!match) return fail(res, 404, "链接无效或已过期，请联系管理员重新发送师傅链接。");
    ok(res, { ...match.worker, __legacyLink: match.legacy });
  });
  app.post("/api/workers", (req, res) => {
    const db = readDb();
    if (!String(req.body.name || "").trim()) return fail(res, 400, "师傅姓名必填");
    if (!String(req.body.phone || "").trim()) return fail(res, 400, "手机号必填");
    const draft = buildWorkerDraft({ ...req.body, created_at: req.body.created_at || nowIso() }, {}, db.workers);
    const duplicate = workerDuplicate(db.workers, draft);
    if (duplicate) return fail(res, 409, "师傅手机号、唯一编码或链接标识已存在");
    db.workers = upsert(db.workers, draft);
    const saved = writeDb(db);
    ok(res, saved.workers.find((worker) => String(worker.id) === String(draft.id)) || draft);
  });
  app.put("/api/workers/:id", (req, res) => {
    const db = readDb();
    const existing = db.workers.find((worker) => String(worker.id) === String(req.params.id));
    if (!existing) return fail(res, 404, "师傅不存在");
    const draft = buildWorkerDraft({ ...req.body, id: req.params.id }, existing, db.workers);
    const duplicate = workerDuplicate(db.workers, draft, req.params.id);
    if (duplicate) return fail(res, 409, "师傅手机号、唯一编码或链接标识已存在");
    db.workers = upsert(db.workers, draft);
    const saved = writeDb(db);
    ok(res, saved.workers.find((worker) => String(worker.id) === String(req.params.id)) || draft);
  });
  app.patch("/api/workers/:id", (req, res) => {
    const db = readDb();
    const existing = db.workers.find((worker) => String(worker.id) === String(req.params.id));
    if (!existing) return fail(res, 404, "师傅不存在");
    const draft = buildWorkerDraft({ ...req.body, id: req.params.id }, existing, db.workers);
    const duplicate = workerDuplicate(db.workers, draft, req.params.id);
    if (duplicate) return fail(res, 409, "师傅手机号、唯一编码或链接标识已存在");
    db.workers = upsert(db.workers, draft);
    const saved = writeDb(db);
    ok(res, saved.workers.find((worker) => String(worker.id) === String(req.params.id)) || draft);
  });
  app.delete("/api/workers/:id", (req, res) => {
    const db = readDb();
    const existing = db.workers.find((worker) => String(worker.id) === String(req.params.id));
    if (!existing) return fail(res, 404, "师傅不存在");
    db.workers = db.workers.filter((worker) => String(worker.id) !== String(req.params.id));
    db.dispatchTasks = db.dispatchTasks.filter((task) => String(workerIdOf(task)) !== String(req.params.id));
    writeDb(db);
    ok(res, { id: req.params.id, deleted: true });
  });
  app.patch("/api/workers/:id/enable", (req, res) => {
    const db = readDb();
    const existing = db.workers.find((worker) => String(worker.id) === String(req.params.id));
    if (!existing) return fail(res, 404, "师傅不存在");
    const enabled = booleanValue(req.body.enabled, true);
    const changedAt = nowIso();
    const draft = buildWorkerDraft({
      ...existing,
      enabled,
      online: false,
      lastOfflineAt: enabled ? (existing.lastOfflineAt || existing.last_offline_at || null) : changedAt,
      last_offline_at: enabled ? (existing.last_offline_at || existing.lastOfflineAt || null) : changedAt,
      status: enabled ? "已停止" : "已停用",
    }, existing, db.workers);
    db.workers = upsert(db.workers, draft);
    const saved = writeDb(db);
    ok(res, saved.workers.find((worker) => String(worker.id) === String(req.params.id)) || draft);
  });
  app.patch("/api/workers/:id/access-token", (req, res) => {
    const db = readDb();
    const existing = db.workers.find((worker) => String(worker.id) === String(req.params.id));
    if (!existing) return fail(res, 404, "师傅不存在");
    const accessToken = uniqueWorkerAccessToken(db.workers, req.params.id);
    const draft = buildWorkerDraft({ ...existing, accessToken, access_token: accessToken }, existing, db.workers);
    db.workers = upsert(db.workers, draft);
    const saved = writeDb(db);
    ok(res, saved.workers.find((worker) => String(worker.id) === String(req.params.id)) || draft);
  });

  app.post("/api/workers/:id/heartbeat", (req, res) => {
    const db = readDb();
    const existing = db.workers.find((worker) => String(worker.id) === String(req.params.id));
    if (!existing) return fail(res, 404, "师傅不存在");
    if (existing.enabled === false) return fail(res, 403, "该师傅链接已停用，请联系管理员。");
    const timestamp = nowIso();
    const wasOnline = isWorkerOnline(existing);
    const next = {
      ...existing,
      online: true,
      lastSeenAt: timestamp,
      last_seen_at: timestamp,
      lastOnlineAt: wasOnline ? (existing.lastOnlineAt || existing.last_online_at || timestamp) : timestamp,
      last_online_at: wasOnline ? (existing.last_online_at || existing.lastOnlineAt || timestamp) : timestamp,
      updatedAt: timestamp,
      updated_at: timestamp,
    };
    const lng = Number(req.body.lng);
    const lat = Number(req.body.lat);
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      next.lng = lng;
      next.lat = lat;
    }
    if (req.body.speed !== undefined) next.speed = Number(req.body.speed || 0);
    if (req.body.moving !== undefined) next.moving = booleanValue(req.body.moving, false);
    if (req.body.stoppedSeconds !== undefined || req.body.stopped_seconds !== undefined) {
      next.stoppedSeconds = Number(req.body.stoppedSeconds || req.body.stopped_seconds || 0);
    }
    if (next.moving !== undefined) next.status = next.moving ? "行驶中" : "已停止";
    db.workers = upsert(db.workers, next);
    const saved = writeDb(db);
    ok(res, saved.workers.find((worker) => String(worker.id) === String(req.params.id)) || next);
  });

  app.post("/api/workers/:id/offline", (req, res) => {
    const db = readDb();
    const existing = db.workers.find((worker) => String(worker.id) === String(req.params.id));
    if (!existing) return fail(res, 404, "师傅不存在");
    const timestamp = nowIso();
    const next = {
      ...existing,
      online: false,
      lastOfflineAt: timestamp,
      last_offline_at: timestamp,
      updatedAt: timestamp,
      updated_at: timestamp,
      status: existing.enabled === false ? "已停用" : "已停止",
    };
    db.workers = upsert(db.workers, next);
    const saved = writeDb(db);
    ok(res, saved.workers.find((worker) => String(worker.id) === String(req.params.id)) || next);
  });

  app.post("/api/worker-location", (req, res) => {
    const workerId = req.body.workerId || req.body.worker_id || req.body.worker;
    const lng = Number(req.body.lng);
    const lat = Number(req.body.lat);
    if (!workerId) return fail(res, 400, "缺少 workerId");
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return fail(res, 400, "定位坐标无效");

    const db = readDb();
    const existing = db.workers.find((worker) => matchWorker(worker, workerId)) || { id: workerId, name: workerId };
    if (existing.enabled === false) return fail(res, 403, "该师傅链接已停用，请联系管理员。");
    const speed = Number(req.body.speed || 0);
    const moving = booleanValue(req.body.moving, speed > 3);
    const stoppedSeconds = Number(req.body.stoppedSeconds || req.body.stopped_seconds || (moving ? 0 : existing.stoppedSeconds || 0));
    const timestamp = req.body.timestamp || nowIso();
    const wasOnline = isWorkerOnline(existing);
    const updatedWorker = {
      ...existing,
      id: existing.id || workerId,
      lng,
      lat,
      accuracy: Number(req.body.accuracy || 0),
      speed,
      heading: req.body.heading == null ? null : Number(req.body.heading),
      moving,
      stoppedSeconds,
      online: true,
      lastSeenAt: timestamp,
      last_seen_at: timestamp,
      lastOnlineAt: wasOnline ? (existing.lastOnlineAt || existing.last_online_at || timestamp) : timestamp,
      last_online_at: wasOnline ? (existing.last_online_at || existing.lastOnlineAt || timestamp) : timestamp,
      lastLocationAt: timestamp,
      last_location_at: timestamp,
      status: moving ? "行驶中" : "已停止",
      updatedAt: timestamp,
      updated_at: nowIso(),
    };
    const location = {
      id: uid("worker_location"),
      worker_id: updatedWorker.id,
      workerId: updatedWorker.id,
      lng,
      lat,
      accuracy: updatedWorker.accuracy,
      speed,
      heading: updatedWorker.heading,
      moving,
      stoppedSeconds,
      timestamp,
      created_at: nowIso(),
    };
    const trackLog = {
      id: uid("track"),
      worker_id: updatedWorker.id,
      worker_name: updatedWorker.name,
      event: req.body.event || (moving ? "实时定位" : "定位停车"),
      speed,
      stop_minutes: Math.round(stoppedSeconds / 60),
      lng,
      lat,
      project_name: req.body.project_name || updatedWorker.project_name || "",
      recorded_at: timestamp,
      created_at: nowIso(),
    };

    db.workers = upsert(db.workers, updatedWorker);
    db.workerLocations = [location, ...(db.workerLocations || [])].slice(0, 500);
    db.trackLogs = [trackLog, ...db.trackLogs].slice(0, 500);
    const saved = writeDb(db);
    ok(res, {
      worker: saved.workers.find((worker) => String(worker.id) === String(updatedWorker.id)) || updatedWorker,
      location,
      trackLog,
    });
  });

  app.get("/api/wall-points", (req, res) => ok(res, readDb().wallPoints));
  app.get("/api/points", (req, res) => ok(res, readDb().wallPoints));
  app.post("/api/wall-points", (req, res) => {
    const db = readDb();
    db.wallPoints = upsert(db.wallPoints, { id: req.body.id || uid("point"), created_at: nowIso(), ...req.body, status: normalizePointStatus(req.body.status) });
    writeDb(db);
    ok(res, db.wallPoints[0]);
  });
  app.put("/api/wall-points/:id", (req, res) => {
    const db = readDb();
    db.wallPoints = upsert(db.wallPoints, { ...req.body, id: req.params.id, status: normalizePointStatus(req.body.status) });
    writeDb(db);
    ok(res, db.wallPoints[0]);
  });
  app.delete("/api/wall-points/:id", (req, res) => {
    const db = readDb();
    db.wallPoints = db.wallPoints.filter((item) => item.id !== req.params.id);
    db.dispatchTasks = db.dispatchTasks.filter((item) => pointIdOf(item) !== req.params.id);
    db.pointMedia = db.pointMedia.filter((item) => item.point_id !== req.params.id);
    writeDb(db);
    ok(res, { id: req.params.id });
  });

  app.get("/api/dispatch-tasks", (req, res) => ok(res, readDb().dispatchTasks));
  app.post("/api/dispatch", (req, res) => {
    const workerId = req.body.workerId || req.body.worker_id;
    const pointIds = req.body.pointIds || req.body.point_ids || [];
    if (!workerId) return fail(res, 400, "缺少 workerId");
    if (!Array.isArray(pointIds) || !pointIds.length) return fail(res, 400, "请至少选择一个点位");
    const db = readDb();
    const worker = findWorker(db, workerId);
    if (!worker) return fail(res, 404, "师傅不存在");
    if (worker.enabled === false) return fail(res, 403, "该师傅链接已停用，请联系管理员。");
    const canonicalWorkerId = worker.id;
    const uniquePointIds = [...new Set(pointIds.map(String))];
    const taskKeys = new Set(uniquePointIds.map((pointId) => `${canonicalWorkerId}:${pointId}`));
    const tasks = uniquePointIds.map((pointId) => ({
      id: uid("task"),
      worker_id: canonicalWorkerId,
      workerId: canonicalWorkerId,
      point_id: pointId,
      pointId,
      status: "已派单",
      assigned_at: nowIso(),
      created_at: nowIso(),
    }));
    db.dispatchTasks = [...tasks, ...db.dispatchTasks.filter((task) => !taskKeys.has(`${workerIdOf(task)}:${pointIdOf(task)}`))];
    db.wallPoints = db.wallPoints.map((point) => uniquePointIds.includes(String(point.id)) && normalizePointStatus(point.status) !== "已完成"
      ? { ...point, status: "已派单", updated_at: nowIso() }
      : point);
    writeDb(db);
    const payload = { workerId: canonicalWorkerId, count: tasks.length, inserted: tasks.length, tasks, pointIds: uniquePointIds };
    ok(res, payload, payload);
  });

  app.get("/api/worker-tasks", (req, res) => {
    const workerId = req.query.workerId || req.query.worker || req.query.worker_id;
    if (!workerId) return fail(res, 400, "缺少 workerId");
    const payload = buildWorkerTasksPayload(readDb(), workerId);
    if (!payload) return fail(res, 404, "链接无效或已过期，请联系管理员重新发送师傅链接。");
    ok(res, payload, payload);
  });

  app.get("/api/worker-tasks/:workerId", (req, res) => {
    const payload = buildWorkerTasksPayload(readDb(), req.params.workerId);
    if (!payload) return fail(res, 404, "链接无效或已过期，请联系管理员重新发送师傅链接。");
    ok(res, payload, payload);
  });

  app.get("/api/point-media", (req, res) => ok(res, readDb().pointMedia));
  app.post("/api/point-media/:pointId", upload.array("files"), (req, res) => {
    const db = readDb();
    const files = req.files || [];
    const media = files.map((file) => {
      const ext = path.extname(file.originalname);
      const nextName = `${file.filename}${ext}`;
      const nextPath = path.join(UPLOAD_DIR, nextName);
      fs.renameSync(file.path, nextPath);
      return {
        id: uid("media"),
        point_id: req.params.pointId,
        worker_id: req.body.workerId || req.body.worker_id || "",
        url: `/uploads/${encodeURIComponent(nextName)}`,
        file_name: file.originalname,
        mime_type: file.mimetype,
        kind: normalizeMediaKind(req.body.kind || file.originalname || file.mimetype),
        created_at: nowIso(),
      };
    });
    db.pointMedia = [...media, ...db.pointMedia];
    db.wallPoints = db.wallPoints.map((point) => {
      if (String(point.id) !== String(req.params.pointId)) return point;
      const completion = materialCompletionForPoint(point, db.pointMedia, db.projects);
      const nextStatus = completion.complete ? "待验收" : "已上传素材";
      return { ...point, status: nextStatus, updated_at: nowIso() };
    });
    writeDb(db);
    ok(res, media);
  });
  app.put("/api/point-media/:id", (req, res) => {
    const db = readDb();
    db.pointMedia = db.pointMedia.map((item) => item.id === req.params.id ? { ...item, ...req.body, updated_at: nowIso() } : item);
    writeDb(db);
    ok(res, db.pointMedia.find((item) => item.id === req.params.id) || null);
  });

  app.post("/api/complete-point/:pointId", (req, res) => {
    const db = readDb();
    const completedAt = nowIso();
    db.wallPoints = db.wallPoints.map((point) => point.id === req.params.pointId
      ? { ...point, status: "已完成", completed_at: completedAt, updated_at: completedAt }
      : point);
    db.dispatchTasks = db.dispatchTasks.map((task) => pointIdOf(task) === req.params.pointId
      ? { ...task, status: "已完成", completed_at: completedAt }
      : task);
    writeDb(db);
    ok(res, { id: req.params.pointId, status: "已完成", completedAt });
  });

  app.post("/api/complete-point", (req, res) => {
    const pointId = req.body.pointId || req.body.point_id;
    if (!pointId) return fail(res, 400, "缺少 pointId");
    const db = readDb();
    const completedAt = nowIso();
    db.wallPoints = db.wallPoints.map((point) => String(point.id) === String(pointId)
      ? { ...point, status: "已完成", photos: req.body.photos || point.photos || [], videos: req.body.videos || point.videos || [], completed_at: completedAt, updated_at: completedAt }
      : point);
    db.dispatchTasks = db.dispatchTasks.map((task) => String(pointIdOf(task)) === String(pointId)
      ? { ...task, status: "已完成", completed_at: completedAt }
      : task);
    writeDb(db);
    ok(res, db.wallPoints.find((point) => String(point.id) === String(pointId)) || { id: pointId, status: "已完成" });
  });

  app.get("/api/debug-state", (req, res) => {
    const db = readDb();
    const payload = {
      points: db.wallPoints,
      workers: db.workers,
      dispatchTasks: db.dispatchTasks,
      workerLocations: db.workerLocations,
    };
    ok(res, payload, payload);
  });

  app.get("/api/track-logs", (req, res) => ok(res, readDb().trackLogs));
  app.post("/api/track-logs", (req, res) => {
    const db = readDb();
    const log = { id: req.body.id || uid("track"), ...req.body, created_at: req.body.created_at || nowIso() };
    db.trackLogs = [log, ...db.trackLogs];
    writeDb(db);
    ok(res, log);
  });

  app.post("/api/import-demo", (req, res) => {
    const current = readDb();
    const demo = demoDb();
    writeDb({
      ...current,
      projects: demo.projects,
      workers: demo.workers,
      wallPoints: demo.wallPoints,
    });
    ok(res, readDb());
  });
  app.post("/api/reset-demo", (req, res) => {
    writeDb(demoDb());
    ok(res, readDb());
  });

  app.use(express.static(DIST_DIR));

  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/")) return next();
    if (!fs.existsSync(DIST_INDEX)) {
      return res.status(503).type("text/plain").send("dist/index.html 不存在，请先运行 npm run build。");
    }
    return res.sendFile(DIST_INDEX);
  });

  return app;
}

function getLanIps() {
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => item.address);
  const privateIps = ips.filter(isPrivateLanIp);
  return (privateIps.length ? privateIps : ips).sort((a, b) => lanIpRank(a) - lanIpRank(b));
}

function isPrivateLanIp(ip) {
  const parts = String(ip).split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  return parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168);
}

function lanIpRank(ip) {
  const parts = String(ip).split(".").map((part) => Number(part));
  if (parts[0] === 192 && parts[1] === 168) return 0;
  if (parts[0] === 10) return 1;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return 2;
  return 9;
}

if (require.main === module) {
  const PORT = Number(process.env.PORT || 8787);
  const HOST = "0.0.0.0";
  const app = createApp();

  app.listen(PORT, HOST, () => {
    console.log(`Mock API server running on http://${HOST}:${PORT}`);
    console.log(`Local health: http://localhost:${PORT}/api/health`);
    getLanIps().forEach((ip) => {
      console.log(`LAN health: http://${ip}:${PORT}/api/health`);
    });
  });
}

module.exports = { createApp, demoDb, readDb, writeDb, DB_PATH, UPLOAD_DIR };
