import { getApiRequestUrl, getDataModeLabel, isWorkerOnlineByHeartbeat, normalizeCarNo } from "../apiClient";

export const STATUS = ["待派单", "已派单", "待施工", "施工中", "已上传素材", "待验收", "已完成", "需复查"];
export const MEDIA_TABS = ["现场照片", "720 全景", "水印照片", "凯立德图片", "墙租协议图片", "视频"];
export const DEFAULT_PROJECT_MATERIAL_RULES = ["现场照片"];
export const PAGE_ITEMS = [
  { key: "dashboard", path: "/admin/dashboard", label: "运营总览", icon: "▦" },
  { key: "map", path: "/admin/map", label: "地图调度", icon: "⌖" },
  { key: "points", path: "/admin/points", label: "点位管理", icon: "⌗" },
  { key: "workers", path: "/admin/workers", label: "师傅管理", icon: "◇" },
  { key: "dispatch", path: "/admin/dispatch", label: "派单中心", icon: "↗" },
  { key: "projects", path: "/admin/projects", label: "项目管理", icon: "◫" },
  { key: "media", path: "/admin/media", label: "素材管理", icon: "▣" },
  { key: "system", path: "/admin/system", label: "系统状态", icon: "◌" },
  { key: "accounts", path: "/admin/accounts", label: "账号管理", icon: "◎" },
];

export const DEFAULT_PROJECT_COLORS = {
  加多宝项目: "#ef4444",
  加多宝村镇墙体项目: "#ef4444",
  阿康化肥项目: "#16a34a",
  阿康化肥春耕项目: "#16a34a",
  能量饮料项目: "#2563eb",
  未分配项目: "#64748b",
};

export function nowIso() {
  return new Date().toISOString();
}

export function cnTime(value = new Date()) {
  if (!value) return "暂无";
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return "暂无";
  return time.toLocaleString("zh-CN", { hour12: false });
}

export function isDateInRange(value, range = "全部时间") {
  if (!value || !range || range === "全部时间") return true;
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return true;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "今天") return time >= todayStart;
  if (range === "近7天") {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 6);
    return time >= start;
  }
  if (range === "本月") return time.getFullYear() === now.getFullYear() && time.getMonth() === now.getMonth();
  return true;
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getWorkerIdFromUrl() {
  const url = new URL(window.location.href);
  const match = window.location.pathname.match(/\/worker\/([^/?#]+)/);
  return decodeURIComponent(match?.[1] || url.searchParams.get("worker") || "w1");
}

export function getRoute() {
  const url = new URL(window.location.href);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "worker") return { page: "worker", workerId: getWorkerIdFromUrl() };
  if (parts[0] === "mobile-map") return { page: "mobile-map" };
  if (parts[0] === "login") return { page: "login" };
  if (parts[0] === "register") return { page: "register" };
  if (parts[0] === "admin") return { page: "admin", adminPage: parts[1] || "dashboard" };
  if (PAGE_ITEMS.some((item) => item.key === parts[0])) return { page: "admin", adminPage: parts[0] };
  return { page: "admin", adminPage: "dashboard" };
}

export function pagePath(pageKey) {
  return PAGE_ITEMS.find((item) => item.key === pageKey)?.path || "/admin/dashboard";
}

export function classifyApiError(error) {
  const message = error?.message || error?.error || String(error || "未知错误");
  const detail = error?.detail || message;
  if (/SUPABASE_CLIENT_DEP_DISABLED/i.test(detail)) {
    return { category: "数据库连接异常", detail: "Supabase SDK 未安装或未被部署平台正确安装，请重新部署并确认依赖安装成功。" };
  }
  if (/SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|SERVER_ENV_MISSING/i.test(detail)) {
    return { category: "数据库连接异常", detail: "数据库环境变量未配置完整，请检查 Vercel 的 Supabase 环境变量。" };
  }
  if (error?.category || error?.detail) {
    return { category: error.category || "接口连接失败", detail: error.detail || message };
  }
  if (/relation|does not exist|schema cache|42P01/i.test(detail) || error?.code === "42P01") {
    return { category: "数据库返回错误", detail };
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return { category: "接口连接失败", detail: "浏览器无法访问 API，请检查公网域名、HTTPS、端口、反向代理和跨域设置。" };
  }
  return { category: "业务处理失败", detail: message };
}

export function normalizeWorkerCode(worker) {
  return worker?.code || worker?.worker_key || worker?.slug || worker?.id || "w1";
}

export function workerKey(worker) {
  return worker?.workerKey || worker?.worker_key || worker?.code || worker?.slug || worker?.id || "";
}

export function workerSlug(worker) {
  return worker?.slug || workerKey(worker) || worker?.id || "";
}

export function isWorkerEnabled(worker) {
  return worker?.enabled !== false;
}

export function isWorkerOnline(worker) {
  return isWorkerOnlineByHeartbeat(worker);
}

export function workerLastSeenText(worker) {
  const value = worker?.lastSeenAt || worker?.last_seen_at;
  if (!value) return "从未上线";
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return "从未上线";
  return time.toLocaleString("zh-CN", { hour12: false });
}

export function workerLastLocationText(worker) {
  const value = worker?.lastLocationAt || worker?.last_location_at || worker?.updatedAt || worker?.updated_at;
  if (!value) return "暂无定位";
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return "暂无定位";
  return time.toLocaleString("zh-CN", { hour12: false });
}

export function taskWorkerId(task) {
  return task?.worker_id || task?.workerId || task?.worker || "";
}

export function taskPointId(task) {
  return task?.point_id || task?.pointId || "";
}

function firstDisplayValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function normalizeDisplayToken(value) {
  return String(value || "").trim().toLowerCase();
}

export function getProjectName(point, projects = []) {
  const direct = firstDisplayValue(point?.project_name, point?.project, point?.projectName);
  if (direct) return direct;
  const projectId = firstDisplayValue(point?.project_id, point?.projectId);
  if (projectId) {
    const matchedProject = projects.find((project) => String(project?.id || "").trim() === projectId || String(project?.name || "").trim() === projectId);
    if (matchedProject?.name) return matchedProject.name;
  }
  return "未登记项目";
}

export function getPointCode(point) {
  return point?.point_code || point?.title || point?.name || point?.code || point?.id || "未命名点位";
}

export function getPointKCode(point) {
  const value = firstDisplayValue(point?.k_code, point?.kCode);
  if (!value) return "未登记";
  const pointCodeTokens = [
    point?.point_code,
    point?.title,
    point?.name,
    point?.id,
  ].map(normalizeDisplayToken).filter(Boolean);
  if (pointCodeTokens.includes(normalizeDisplayToken(value))) return "未登记";
  return value;
}

export function getPointAddress(point) {
  return point?.detail_address || point?.address || point?.addr || "未登记地址";
}

export function getPointUpdatedAt(point) {
  return point?.updated_at || point?.updatedAt || point?.created_at || point?.createdAt || "";
}

export function getPointCreatedAt(point) {
  return point?.created_at || point?.createdAt || "";
}

export function getPointLongitude(point) {
  const value = point?.longitude ?? point?.lng;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function getPointLatitude(point) {
  const value = point?.latitude ?? point?.lat;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function normalizePointStatus(value, fallback = "待派单") {
  const raw = String(value || "").trim();
  if (STATUS.includes(raw)) return raw;
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
  return aliases[raw] || (STATUS.includes(fallback) ? fallback : "待派单");
}

export function getPointStatus(point) {
  return normalizePointStatus(point?.status, "待派单");
}

export function getCity(point) {
  if (point?.city) return point.city;
  const address = point?.address || "";
  const match = address.match(/([\u4e00-\u9fa5]{2,6})市/);
  return match?.[1] || "未知城市";
}

export function getCaptainName(point) {
  return point?.install_captain_name || point?.captain_name || point?.worker_name || point?.captainName || point?.leader_name || "未登记";
}

export function getCaptainPhone(point) {
  return point?.install_captain_phone || point?.captain_phone || point?.worker_phone || point?.captainPhone || point?.leader_phone || "未登记手机号";
}

export function getScoutName(point) {
  return point?.scout_name || point?.wall_team_name || point?.scoutName || point?.finder_name || "未登记";
}

export function getScoutPhone(point) {
  return point?.wall_team_phone || point?.scout_phone || point?.scoutPhone || point?.finder_phone || "未登记手机号";
}

export function getPointDisplayModel(point, options = {}) {
  const { projects = [], tasks = [], workers = [] } = options;
  const code = getPointCode(point);
  const kCode = getPointKCode(point);
  const address = getPointAddress(point);
  const projectName = getProjectName(point, projects);
  const captainName = getCaptainName(point);
  const captainPhone = getCaptainPhone(point);
  const scoutName = getScoutName(point);
  const scoutPhone = getScoutPhone(point);
  const assigned = assignedWorkersForPoint(point, tasks, workers);
  const currentWorkerName = firstDisplayValue(point?.captain_name, point?.worker_name, point?.install_captain_name, assigned[0]?.name) || "未派单";
  return {
    code,
    kCode,
    address,
    projectName,
    captainName,
    captainPhone,
    scoutName,
    scoutPhone,
    currentWorkerName,
  };
}

export function normalizeMediaKind(value, fallback = "现场照片") {
  const raw = String(value || "").trim();
  if (MEDIA_TABS.includes(raw)) return raw;
  const normalized = raw.replace(/\s+/g, "").toLowerCase();
  if (normalized.includes("凯立德") || normalized.includes("kailide")) return "凯立德图片";
  if (normalized.includes("墙租") || normalized.includes("协议")) return "墙租协议图片";
  if (normalized.includes("水印")) return "水印照片";
  if (normalized.includes("720") || normalized.includes("全景")) {
    return normalized.includes("视频") || normalized.includes("video") ? "视频" : "720 全景";
  }
  if (normalized.includes("视频") || normalized.includes("video")) return "视频";
  if (normalized.includes("现场")) return "现场照片";
  return MEDIA_TABS.includes(fallback) ? fallback : "现场照片";
}

export function mediaKind(photo) {
  const kind = normalizeMediaKind(photo?.kind || photo?.media_kind || "");
  if (kind !== "现场照片" || photo?.kind || photo?.media_kind) return kind;
  const raw = `${photo?.file_name || photo?.url || ""}`.toLowerCase();
  const type = `${photo?.content_type || photo?.mime_type || photo?.type || ""}`.toLowerCase();
  if (raw.includes("水印")) return "水印照片";
  if (raw.includes("凯立德") || raw.includes("kailide")) return "凯立德图片";
  if (raw.includes("墙租") || raw.includes("协议")) return "墙租协议图片";
  if (raw.includes("720") || raw.includes("全景")) return type.includes("video") || raw.includes("视频") ? "视频" : "720 全景";
  if (type.includes("video") || /\.(mp4|mov|m4v|webm)$/i.test(raw)) return "视频";
  return "现场照片";
}

export function pointMedia(point, photos = []) {
  const linked = photos.filter((photo) => (photo.point_id || photo.pointId) === point?.id);
  if (linked.length) return linked;
  return [
    ...(Array.isArray(point?.photos) ? point.photos : []),
    ...(Array.isArray(point?.videos) ? point.videos : []),
    ...(Array.isArray(point?.media) ? point.media : []),
  ];
}

export function mediaCounts(point, photos = []) {
  const list = pointMedia(point, photos);
  return {
    total: list.length,
    site: list.filter((photo) => mediaKind(photo) === "现场照片").length,
    pano: list.filter((photo) => mediaKind(photo) === "720 全景").length,
    video: list.filter((photo) => mediaKind(photo) === "视频").length,
    watermark: list.filter((photo) => mediaKind(photo) === "水印照片").length,
    kailide: list.filter((photo) => mediaKind(photo) === "凯立德图片").length,
    agreement: list.filter((photo) => mediaKind(photo) === "墙租协议图片").length,
  };
}

export function projectMaterialRulesForName(name = "") {
  const value = String(name || "");
  if (value.includes("加多宝")) return ["现场照片", "水印照片", "墙租协议图片"];
  if (value.includes("阿康")) return ["现场照片", "720 全景", "凯立德图片"];
  if (value.includes("能量")) return ["现场照片", "视频"];
  return DEFAULT_PROJECT_MATERIAL_RULES;
}

export function normalizeMaterialRules(rules, projectName = "") {
  const source = Array.isArray(rules) && rules.length ? rules : projectMaterialRulesForName(projectName);
  const normalized = source.map((item) => normalizeMediaKind(item)).filter(Boolean);
  return [...new Set(normalized.length ? normalized : DEFAULT_PROJECT_MATERIAL_RULES)];
}

export function pointMaterialRules(point, projects = []) {
  const projectName = getProjectName(point);
  const project = projects.find((item) => item.name === projectName || item.id === projectName) || {};
  return normalizeMaterialRules(project.materialRules || project.material_rules, projectName);
}

export function getPointAnomalies(point, photos = [], tasks = [], projects = []) {
  const counts = mediaCounts(point, photos);
  const assigned = tasks.some((task) => String(taskPointId(task)) === String(point?.id));
  const rules = pointMaterialRules(point, projects);
  const missingByKind = {
    现场照片: counts.site === 0,
    "720 全景": counts.pano === 0,
    水印照片: counts.watermark === 0,
    凯立德图片: counts.kailide === 0,
    墙租协议图片: counts.agreement === 0,
    视频: counts.video === 0,
  };
  const anomalies = [];
  if (!assigned && !["已完成", "需复查"].includes(getPointStatus(point))) anomalies.push("未派单");
  rules.forEach((kind) => {
    if (missingByKind[kind]) anomalies.push(`缺${kind}`);
  });
  return anomalies;
}

export function pointMaterialCompletion(point, photos = [], projects = []) {
  const counts = mediaCounts(point, photos);
  const rules = pointMaterialRules(point, projects);
  const missing = rules.filter((kind) => {
    if (kind === "现场照片") return counts.site === 0;
    if (kind === "720 全景") return counts.pano === 0;
    if (kind === "水印照片") return counts.watermark === 0;
    if (kind === "凯立德图片") return counts.kailide === 0;
    if (kind === "墙租协议图片") return counts.agreement === 0;
    if (kind === "视频") return counts.video === 0;
    return false;
  });
  const requiredCount = rules.length;
  const completedCount = Math.max(0, requiredCount - missing.length);
  const status = counts.total === 0 ? "无素材" : missing.length ? "待补全" : "齐套";
  return {
    rules,
    missing,
    counts,
    requiredCount,
    completedCount,
    complete: missing.length === 0,
    status,
    ratio: requiredCount ? Math.round((completedCount / requiredCount) * 100) : 100,
  };
}

export function isPointReadyForAcceptance(point, photos = [], projects = []) {
  const status = getPointStatus(point);
  const completion = pointMaterialCompletion(point, photos, projects);
  return completion.complete && ["已上传素材", "待验收", "已完成"].includes(status);
}

export function assignedWorkersForPoint(point, tasks = [], workers = []) {
  const workerById = new Map(workers.map((worker) => [String(worker.id), worker]));
  return pointTasks(tasks, point?.id)
    .map((task) => workerById.get(String(taskWorkerId(task))))
    .filter(Boolean);
}

export function dispatchValidationForPoint(point, worker, context = {}) {
  const tasks = context.tasks || [];
  const photos = context.photos || [];
  const projects = context.projects || [];
  const workers = context.workers || [];
  const assigned = assignedWorkersForPoint(point, tasks, workers);
  const anomalies = getPointAnomalies(point, photos, tasks, projects);
  const workerProject = worker?.project_name || worker?.projectName || "";
  const pointProject = getProjectName(point);
  return {
    assigned,
    alreadyAssigned: assigned.length > 0,
    duplicateForWorker: assigned.some((item) => String(item.id) === String(worker?.id)),
    crossProject: Boolean(workerProject && pointProject && workerProject !== pointProject),
    hasRisk: anomalies.length > 0,
    anomalies,
  };
}

export function pointTags(point, photos = []) {
  const counts = mediaCounts(point, photos);
  return [
    getPointStatus(point),
    getProjectName(point),
    getCity(point),
    counts.total ? "有照片" : "无照片",
    counts.pano ? "有720全景" : "无720全景",
    counts.video ? "有视频" : "无视频",
    counts.watermark ? "有水印图" : "无水印图",
    counts.kailide ? "有凯立德图" : "无凯立德图",
    counts.agreement ? "有墙租协议图" : "无墙租协议图",
    `施工队长:${getCaptainName(point)}`,
    `找墙队伍:${getScoutName(point)}`,
  ];
}

export function pointLngLat(point) {
  const lng = getPointLongitude(point);
  const lat = getPointLatitude(point);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

export function pointStatusClass(point) {
  const status = getPointStatus(point);
  if (status === "已完成") return "done";
  if (["已派单", "待施工", "施工中", "已上传素材", "待验收"].includes(status)) return "doing";
  if (status === "需复查") return "bad";
  return "todo";
}

export function pointShortCode(point, index) {
  const title = String(point?.title || "");
  const tail = title.match(/(\d{1,3})$/)?.[1];
  return tail ? tail.slice(-2) : String(index + 1);
}

export function workerLngLat(worker) {
  const lng = Number(worker?.lng ?? worker?.longitude);
  const lat = Number(worker?.lat ?? worker?.latitude);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

export function workerCarNo(worker) {
  return normalizeCarNo(worker?.carNo || worker?.car_no || "") || "未登记车牌";
}

export function getShareOrigin() {
  if (typeof window === "undefined") return "";
  const configured = String(import.meta.env.VITE_PUBLIC_APP_ORIGIN || "").trim().replace(/\/$/, "");
  if (configured) return configured;
  if (window.__WALL_AD_SHARE_ORIGIN__) return String(window.__WALL_AD_SHARE_ORIGIN__).replace(/\/$/, "");
  if (isLocalShareHostname()) {
    return fallbackLanAdminUrl().replace(/\/admin\/?$/, "").replace(/\/$/, "");
  }
  return window.location.origin;
}

export function getWorkerAccessToken(worker) {
  return worker?.accessToken || worker?.access_token || "";
}

export function buildWorkerUrl(worker) {
  return `${getShareOrigin()}/worker/${getWorkerAccessToken(worker)}`;
}

export function maskAccessTokenText(value) {
  return String(value || "").replace(/tk_[A-Z2-9]{12}/g, "安全访问码已识别");
}

export async function copyTextToClipboard(text) {
  const canUseAsyncClipboard = window.isSecureContext || ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (canUseAsyncClipboard && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // HTTP LAN origins can block the Clipboard API; fall through to textarea copy.
    }
  }
  let copied = false;
  const onCopy = (event) => {
    event.clipboardData?.setData("text/plain", text);
    event.preventDefault();
    copied = true;
  };
  document.addEventListener("copy", onCopy);
  try {
    document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.removeEventListener("copy", onCopy);
  }
  if (copied) return true;

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  input.style.top = "0";
  document.body.appendChild(input);
  input.focus();
  input.select();
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(input);
  }
  return copied;
}

export function openWorkerUrl(worker) {
  window.open(buildWorkerUrl(worker), "_blank");
}

export function isLocalShareHostname() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

export function hasConfiguredPublicOrigin() {
  return Boolean(String(import.meta.env.VITE_PUBLIC_APP_ORIGIN || "").trim());
}

export function isUsingFallbackShareOrigin() {
  if (typeof window === "undefined") return false;
  return Boolean(window.__WALL_AD_SHARE_ORIGIN__);
}

export function fallbackLanAdminUrl() {
  if (typeof window === "undefined") return "http://电脑局域网IP:8787/admin";
  if (window.__WALL_AD_LAN_ADMIN_URL__) return window.__WALL_AD_LAN_ADMIN_URL__;
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const port = window.location.port ? `:${window.location.port}` : "";
  return `${protocol}//电脑局域网IP${port}/admin`;
}

export function isWorkerMoving(worker) {
  if (worker?.moving !== undefined) return worker.moving === true || worker.moving === "true" || worker.moving === 1 || worker.moving === "1";
  return Number(worker?.speed || 0) > 3 || worker?.status === "行驶中";
}

export function workerMotionState(worker) {
  if (!isWorkerOnline(worker)) return "offline";
  return isWorkerMoving(worker) ? "moving" : "stopped";
}

export function workerMotionLabel(worker) {
  const state = workerMotionState(worker);
  if (state === "moving") return "行驶中";
  if (state === "stopped") return "停车中";
  return "离线";
}

export function workerSpeedText(worker) {
  if (!isWorkerOnline(worker)) return "离线";
  if (isWorkerMoving(worker)) return `${Math.round(Number(worker?.speed || 0))}km/h`;
  const seconds = Number(worker?.stoppedSeconds || worker?.stopped_seconds || 0);
  return `停${Math.max(1, Math.round(seconds / 60))}分`;
}

export function focusZoom(map) {
  const current = typeof map?.getZoom === "function" ? map.getZoom() : 11;
  return Math.min(Math.max(current, 11), 14);
}

export function amapNavigationUrl(point) {
  const [lng, lat] = pointLngLat(point) || [0, 0];
  const name = encodeURIComponent(point?.title || "墙体点位");
  return `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car&policy=1&src=wall-ad-h5&coordinate=gaode&callnative=1`;
}

export function amapMarkerUrl(point) {
  const [lng, lat] = pointLngLat(point) || [0, 0];
  const name = encodeURIComponent(`${point?.title || "墙体点位"}-${point?.address || ""}`);
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${name}&src=wall-ad-h5&coordinate=gaode&callnative=1`;
}

export function mapPointStyle(point, points, index) {
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

export function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function getMediaUrl(photo) {
  const rawUrl = photo?.url || photo?.public_url || photo?.file_url || "";
  if (!rawUrl) return "";
  return /^(https?:|blob:|data:)/i.test(rawUrl) ? rawUrl : getApiRequestUrl(rawUrl);
}

export function taskCountForWorker(tasks = [], workerId = "") {
  return tasks.filter((task) => String(taskWorkerId(task)) === String(workerId)).length;
}

export function pointTasks(tasks = [], pointId = "") {
  return tasks.filter((task) => String(taskPointId(task)) === String(pointId));
}

export function assignedWorkerIdsForPoint(tasks = [], pointId = "") {
  return pointTasks(tasks, pointId).map(taskWorkerId).filter(Boolean);
}

export function normalizeProjects(projects = [], points = []) {
  const seen = new Set();
  const normalized = projects
    .filter((project) => project.id !== "all" && project.name !== "全部项目")
    .map((project) => ({
      ...project,
      id: project.id || project.name,
      name: project.name || project.id,
      client: project.client || "未填写客户",
      month: project.month || "未设置年月",
      color: project.color || DEFAULT_PROJECT_COLORS[project.name] || "#2563eb",
      materialRules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
      material_rules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name || project.id),
    }))
    .filter((project) => {
      if (seen.has(project.name)) return false;
      seen.add(project.name);
      return true;
    });

  const fromPoints = [...new Set(points.map(getProjectName))]
    .filter((name) => name && !seen.has(name))
    .map((name) => ({
      id: name,
      name,
      client: name.replace("项目", ""),
      month: "2026-05",
      color: DEFAULT_PROJECT_COLORS[name] || "#64748b",
      hidden: false,
      materialRules: normalizeMaterialRules([], name),
      material_rules: normalizeMaterialRules([], name),
    }));

  return [{ id: "all", name: "全部项目", client: "总部调度", month: "全部", color: "#0f172a", hidden: false, materialRules: [], material_rules: [] }, ...normalized, ...fromPoints];
}

export function projectScopedPoints(points = [], activeProject = "all") {
  return activeProject === "all" ? points : points.filter((point) => getProjectName(point) === activeProject);
}

export function calculateDashboard(data, activeProject = "all") {
  const scoped = projectScopedPoints(data.points || [], activeProject);
  const today = new Date().toISOString().slice(0, 10);
  const todayPhotos = (data.photos || []).filter((photo) => String(photo.created_at || photo.createdAt || "").startsWith(today));
  const todayTasks = (data.tasks || []).filter((task) => String(task.created_at || task.assigned_at || "").startsWith(today));
  const todayPoints = (data.points || []).filter((point) => String(point.created_at || point.createdAt || "").startsWith(today));
  const completedToday = scoped.filter((point) => getPointStatus(point) === "已完成" && String(point.completed_at || point.updated_at || "").startsWith(today));
  return {
    totalProjects: normalizeProjects(data.projects || [], data.points || []).filter((project) => project.id !== "all" && !project.hidden).length,
    currentPoints: scoped.length,
    doing: scoped.filter((point) => getPointStatus(point) === "施工中").length,
    done: scoped.filter((point) => getPointStatus(point) === "已完成").length,
    review: scoped.filter((point) => getPointStatus(point) === "需复查").length,
    onlineWorkers: (data.workers || []).filter(isWorkerOnline).length,
    offlineWorkers: (data.workers || []).filter((worker) => isWorkerEnabled(worker) && !isWorkerOnline(worker)).length,
    todayUploads: todayPhotos.length,
    todayPoints: todayPoints.length,
    todayDispatch: todayTasks.length,
    todayCompleted: completedToday.length,
    todayMedia: todayPhotos.length,
    withoutPhoto: scoped.filter((point) => !mediaCounts(point, data.photos || []).total).length,
    withoutPano: scoped.filter((point) => !mediaCounts(point, data.photos || []).pano).length,
    withoutWatermark: scoped.filter((point) => !mediaCounts(point, data.photos || []).watermark).length,
    withoutCaptain: scoped.filter((point) => getCaptainName(point) === "未登记").length,
    anomalyPoints: scoped.filter((point) => getPointAnomalies(point, data.photos || [], data.tasks || [], data.projects || []).length).length,
    materialCompletionRate: scoped.length
      ? Math.round((scoped.filter((point) => !getPointAnomalies(point, data.photos || [], data.tasks || [], data.projects || []).some((item) => item.startsWith("缺"))).length / scoped.length) * 100)
      : 0,
  };
}

export function makeActivityFeed(data) {
  const points = data.points || [];
  const workers = data.workers || [];
  const tasks = data.tasks || [];
  const photos = data.photos || [];
  const pointById = new Map(points.map((point) => [String(point.id), point]));
  const workerById = new Map(workers.map((worker) => [String(worker.id), worker]));
  return [
    ...tasks.map((task) => ({
      type: "派单",
      at: task.assigned_at || task.created_at,
      title: `${workerById.get(String(taskWorkerId(task)))?.name || "师傅"} 收到 ${pointById.get(String(taskPointId(task)))?.title || "点位"}`,
      meta: "派单中心",
    })),
    ...photos.map((photo) => ({
      type: "上传",
      at: photo.created_at,
      title: `${pointById.get(String(photo.point_id || photo.pointId))?.title || "点位"} 上传 ${mediaKind(photo)}`,
      meta: photo.file_name || "现场素材",
    })),
    ...points.map((point) => ({
      type: getPointStatus(point) === "已完成" ? "完成" : "更新",
      at: point.completed_at || point.updated_at || point.created_at,
      title: `${point.title || "点位"} · ${getPointStatus(point)}`,
      meta: getProjectName(point),
    })),
    ...workers.map((worker) => ({
      type: "师傅",
      at: worker.created_at || worker.updated_at,
      title: `${worker.name || "师傅"} 已加入执行队伍`,
      meta: workerCarNo(worker),
    })),
  ]
    .filter((item) => item.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);
}

export function formatDataSource(modeLabel, loading) {
  return loading ? "同步中" : modeLabel || getDataModeLabel();
}
