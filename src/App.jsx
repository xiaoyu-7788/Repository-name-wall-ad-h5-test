import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase, isSupabaseConfigured, supabaseEnv } from "./supabaseClient";
import { dispatchPoints as dispatchPointsApi, getDataModeLabel, isLocalDataMode, isProxyDataMode, proxyApi } from "./apiClient";
import "./styles.css";

const STATUS = ["待施工", "施工中", "已完成", "需复查"];
const STORAGE_BUCKET = "point-media";
const LOCAL_STORE_KEY = "wall-ad-h5-demo-state";
const LOCAL_STORE_EVENT = "wall-ad-h5-demo-updated";

const ADMIN_TABS = [
  { id: "console", label: "高德地图执行台" },
  { id: "projects", label: "项目管理" },
  { id: "batch", label: "批量新增点位" },
  { id: "edit", label: "点位编辑" },
  { id: "site", label: "现场查看中心" },
  { id: "library", label: "项目照片库" },
  { id: "pano", label: "720全景" },
  { id: "video", label: "全景视频" },
  { id: "watermark", label: "水印图片" },
  { id: "track", label: "工人定位轨迹" },
  { id: "kimi", label: "Kimi图片分类" },
  { id: "diagnostics", label: "Supabase诊断" },
];

const TABLE_NAMES = ["workers", "wall_points", "dispatch_tasks", "point_photos"];

function nowIso() {
  return new Date().toISOString();
}

function cnTime() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getRoute() {
  const url = new URL(window.location.href);
  const path = url.pathname;
  const workerCode = url.searchParams.get("worker") || "";
  if (path.startsWith("/worker")) return { page: "worker", workerCode };
  return { page: "admin", workerCode };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function uniqueValues(values) {
  return [...new Set(values.map(normalizeText).filter(Boolean))];
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function amapNavigationUrl(point) {
  const lng = Number(point.lng || 0);
  const lat = Number(point.lat || 0);
  const name = encodeURIComponent(point.title || "墙体点位");
  return `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car&policy=1&src=wall-ad-h5&coordinate=gaode&callnative=1`;
}

function amapMarkerUrl(point) {
  const lng = Number(point.lng || 0);
  const lat = Number(point.lat || 0);
  const name = encodeURIComponent(`${point.title || "墙体点位"}-${point.address || ""}`);
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${name}&src=wall-ad-h5&coordinate=gaode&callnative=1`;
}

function getProjectName(point) {
  return point.project_name || "未分配项目";
}

function getMediaKind(fileOrPhoto) {
  const name = `${fileOrPhoto?.name || fileOrPhoto?.file_name || fileOrPhoto?.url || ""}`.toLowerCase();
  const type = `${fileOrPhoto?.type || fileOrPhoto?.kind || ""}`.toLowerCase();
  const isVideo = type.startsWith("video/") || type.includes("video") || /\.(mp4|mov|m4v|avi|webm)$/i.test(name);
  if (name.includes("720") || name.includes("全景") || name.includes("panorama")) {
    return isVideo ? "全景视频" : "720全景";
  }
  if (name.includes("水印") || name.includes("watermark") || name.includes("定位") || name.includes("地址")) {
    return "水印图片";
  }
  return isVideo ? "现场视频" : "现场照片";
}

function mediaMatchesKind(photo, kind) {
  return getMediaKind(photo) === kind || photo.kind === kind;
}

function classifySupabaseError(error) {
  if (error?.category || error?.detail) {
    return { category: error.category || "代理失败", detail: error.detail || error.message || "Vercel API 代理请求失败。" };
  }
  const message = `${error?.message || error?.error_description || error || ""}`;
  const lowered = message.toLowerCase();
  const code = String(error?.code || error?.statusCode || error?.status || "");

  if (!message && !code) {
    return { category: "未知错误", detail: "没有收到 Supabase 错误详情" };
  }
  if (lowered.includes("failed to fetch") || lowered.includes("networkerror") || lowered.includes("load failed")) {
    return { category: "网络失败", detail: "浏览器无法访问 Supabase，请检查网络、项目 URL、代理或跨域拦截。" };
  }
  if (lowered.includes("bucket") && (lowered.includes("not found") || code === "404")) {
    return { category: "Storage bucket 不存在", detail: `请在 Supabase Storage 创建 ${STORAGE_BUCKET} bucket，并按测试策略放开访问。` };
  }
  if (code === "401" || code === "403" || lowered.includes("invalid api key") || lowered.includes("jwt") || lowered.includes("anon key")) {
    return { category: "环境变量错误", detail: "Supabase URL 或 anon key 不匹配，请检查 .env / 部署环境变量。" };
  }
  if (code === "42P01" || lowered.includes("relation") && lowered.includes("does not exist") || lowered.includes("schema cache")) {
    return { category: "表不存在", detail: "数据库表结构缺失，请运行 supabase/schema.sql。" };
  }
  if (code === "42501" || lowered.includes("row-level security") || lowered.includes("rls") || lowered.includes("permission denied") || lowered.includes("not authorized")) {
    return { category: "RLS权限问题", detail: "匿名 key 被 RLS 或 Storage policy 拒绝，请检查测试策略。" };
  }
  if (lowered.includes("storage") || lowered.includes("object")) {
    return { category: "Storage 权限问题", detail: "Storage bucket 存在但读写失败，请检查 bucket 和 storage.objects policy。" };
  }
  return { category: "未知错误", detail: message || `错误码：${code}` };
}

function makeStep(name, ok, category, detail, raw = "") {
  return { name, ok, category, detail, raw };
}

async function readResult(name, promiseFactory) {
  try {
    const result = await promiseFactory();
    if (result?.error) throw result.error;
    return makeStep(name, true, "通过", "读写正常");
  } catch (err) {
    const issue = classifySupabaseError(err);
    return makeStep(name, false, issue.category, issue.detail, err?.message || String(err));
  }
}

async function runSupabaseDiagnostics() {
  const startedAt = cnTime();
  const directSteps = [
    makeStep("读取 VITE_SUPABASE_URL", supabaseEnv.hasUrl, supabaseEnv.hasUrl ? "通过" : "未配置 .env", supabaseEnv.hasUrl ? "前端已读取公开 URL" : "未读取到 VITE_SUPABASE_URL"),
    makeStep("读取 VITE_SUPABASE_ANON_KEY", supabaseEnv.hasAnonKey, supabaseEnv.hasAnonKey ? "通过" : "未配置 .env", supabaseEnv.hasAnonKey ? "前端已读取公开 anon key" : "未读取到 VITE_SUPABASE_ANON_KEY"),
    makeStep("Supabase URL 格式", supabaseEnv.urlValidation.ok, supabaseEnv.urlValidation.ok ? "通过" : "URL 格式错误", supabaseEnv.urlValidation.reason),
  ];

  if (supabase && supabaseEnv.urlValidation.ok) {
    directSteps.push(await readResult("浏览器访问 Supabase workers", () => supabase.from("workers").select("id", { count: "exact", head: true })));
  } else {
    directSteps.push(makeStep("浏览器访问 Supabase", false, "未配置 .env", "前端直连未启用，跳过浏览器访问检测。"));
  }

  let proxySteps = [];
  try {
    const proxy = await proxyApi.diagnose();
    proxySteps = (proxy.checks || []).map((step) => makeStep(`Vercel API 代理 - ${step.name}`, step.ok, step.category, step.detail));
  } catch (err) {
    const issue = classifySupabaseError(err);
    proxySteps = [makeStep("Vercel API 代理 - /api/diagnose", false, issue.category, issue.detail)];
  }

  const directOk = directSteps.every((step) => step.ok);
  const proxyOk = proxySteps.length > 0 && proxySteps.every((step) => step.ok);
  let summary = "";
  if (!directOk && proxyOk) {
    summary = "浏览器无法直连 Supabase，但 Vercel 代理连接成功，系统可正常使用。";
  } else if (proxyOk) {
    summary = "Vercel API 代理连接成功，系统将优先使用代理模式。";
  } else if (directOk) {
    summary = "前端直连 Supabase 可用；代理不可用时可作为备用模式。";
  } else {
    summary = "前端直连和 Vercel API 代理均未通过，请优先检查 Vercel 服务端环境变量和网络。";
  }

  return {
    ok: proxyOk || directOk,
    directOk,
    proxyOk,
    summary,
    startedAt,
    finishedAt: cnTime(),
    directSteps,
    proxySteps,
    steps: [...directSteps, ...proxySteps],
  };
}

async function geocodeAddress(address) {
  if (!supabaseEnv.hasAmapKey) {
    throw new Error("未读取到 VITE_AMAP_KEY，无法调用高德地理编码。");
  }
  const url = new URL("https://restapi.amap.com/v3/geocode/geo");
  url.searchParams.set("key", supabaseEnv.amapKey);
  url.searchParams.set("address", address);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`高德地理编码网络失败：HTTP ${response.status}`);
  const body = await response.json();
  if (body.status !== "1" || !body.geocodes?.length) {
    throw new Error(body.info || "高德没有返回匹配地址");
  }
  const [lng, lat] = body.geocodes[0].location.split(",").map(Number);
  return { lng, lat, formattedAddress: body.geocodes[0].formatted_address || address };
}

const demoWorkers = [
  { id: "w1", code: "zhang", name: "张师傅", phone: "13800000001", car_no: "粤A·工001" },
  { id: "w2", code: "li", name: "李师傅", phone: "13800000002", car_no: "粤A·工002" },
];

const demoPoints = [
  {
    id: "p1",
    title: "GZ-BY-001",
    address: "广东省广州市白云区太和镇主干道路口",
    landlord_name: "黄先生",
    landlord_phone: "13531280287",
    k_code: "K-GZ-BY-001",
    project_name: "加多宝村镇墙体项目",
    status: "待施工",
    lng: 113.38431,
    lat: 23.30859,
    created_at: nowIso(),
  },
  {
    id: "p2",
    title: "FS-NH-002",
    address: "广东省佛山市南海区村口商业街",
    landlord_name: "陈先生",
    landlord_phone: "13800138000",
    k_code: "K-FS-NH-002",
    project_name: "加多宝村镇墙体项目",
    status: "待施工",
    lng: 113.14588,
    lat: 23.04712,
    created_at: nowIso(),
  },
  {
    id: "p3",
    title: "QY-YD-003",
    address: "广东省清远市英德市镇道转角",
    landlord_name: "林先生",
    landlord_phone: "13922223333",
    k_code: "K-QY-YD-003",
    project_name: "阿康化肥春耕项目",
    status: "待施工",
    lng: 113.41521,
    lat: 24.18677,
    created_at: nowIso(),
  },
];

function createDemoState(overrides = {}) {
  return {
    workers: Array.isArray(overrides.workers) && overrides.workers.length ? overrides.workers : demoWorkers.map((w) => ({ ...w })),
    points: Array.isArray(overrides.points) && overrides.points.length ? overrides.points : demoPoints.map((p) => ({ ...p })),
    tasks: Array.isArray(overrides.tasks) ? overrides.tasks : [],
    photos: Array.isArray(overrides.photos) ? overrides.photos : [],
  };
}

function readLocalDemoState() {
  if (typeof window === "undefined") return createDemoState();
  try {
    const raw = window.localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) {
      const initial = createDemoState();
      window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(initial));
      return initial;
    }
    return createDemoState(JSON.parse(raw));
  } catch (err) {
    console.error("读取本地演示数据失败", err);
    return createDemoState();
  }
}

function writeLocalDemoState(nextState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(createDemoState(nextState)));
  window.dispatchEvent(new Event(LOCAL_STORE_EVENT));
}

function serializePointForDb(point) {
  return {
    id: point.id,
    title: point.title || point.k_code || uid("point"),
    address: point.address || "",
    landlord_name: point.landlord_name || "",
    landlord_phone: point.landlord_phone || "",
    k_code: point.k_code || "",
    project_name: point.project_name || "未分配项目",
    status: point.status || "待施工",
    lng: point.lng === "" || point.lng == null ? null : Number(point.lng),
    lat: point.lat === "" || point.lat == null ? null : Number(point.lat),
    created_at: point.created_at || nowIso(),
    updated_at: point.updated_at || null,
    completed_at: point.completed_at || null,
  };
}

function normalizePointInput(row, index = 0) {
  const get = (...keys) => {
    for (const key of keys) {
      if (row[key] != null && row[key] !== "") return row[key];
    }
    return "";
  };
  const title = normalizeText(get("title", "点位", "点位编号", "编号", "广告位", "墙体编号")) || `NEW-${Date.now()}-${index + 1}`;
  const projectName = normalizeText(get("project_name", "项目", "项目名称", "project")) || "批量导入项目";
  return {
    id: normalizeText(get("id", "ID")) || uid("point"),
    title,
    address: normalizeText(get("address", "地址", "详细地址")),
    landlord_name: normalizeText(get("landlord_name", "房东", "房东姓名", "联系人")),
    landlord_phone: normalizeText(get("landlord_phone", "房东电话", "电话", "手机号")),
    k_code: normalizeText(get("k_code", "K码", "k码", "K Code")) || title,
    project_name: projectName,
    status: STATUS.includes(normalizeText(get("status", "状态"))) ? normalizeText(get("status", "状态")) : "待施工",
    lng: Number(get("lng", "经度")) || null,
    lat: Number(get("lat", "纬度")) || null,
    created_at: nowIso(),
  };
}

function parseBatchText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const first = lines[0].split(/\t|,/).map((item) => item.trim());
  const hasHeader = first.some((item) => /点位|地址|项目|title|address|project/i.test(item));
  const headers = hasHeader ? first : ["title", "address", "landlord_name", "landlord_phone", "k_code", "project_name", "lng", "lat"];
  const rows = (hasHeader ? lines.slice(1) : lines).map((line) => {
    const cells = line.split(/\t|,/).map((item) => item.trim());
    return headers.reduce((acc, key, index) => ({ ...acc, [key]: cells[index] || "" }), {});
  });
  return rows.map(normalizePointInput);
}

async function parsePointFile(file) {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows.map(normalizePointInput);
}

function useH5Data() {
  const initialState = useMemo(() => readLocalDemoState(), []);
  const [workers, setWorkers] = useState(initialState.workers);
  const [points, setPoints] = useState(initialState.points);
  const [tasks, setTasks] = useState(initialState.tasks);
  const [photos, setPhotos] = useState(initialState.photos);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dispatchDebug, setDispatchDebug] = useState(null);
  const [dataSource, setDataSource] = useState(isLocalDataMode ? "本地演示任务" : getDataModeLabel());

  function applyLocalState(updater) {
    const current = readLocalDemoState();
    const next = createDemoState(typeof updater === "function" ? updater(current) : updater);
    setWorkers(next.workers);
    setPoints(next.points);
    setTasks(next.tasks);
    setPhotos(next.photos);
    writeLocalDemoState(next);
    return next;
  }

  useEffect(() => {
    if (!isLocalDataMode) return undefined;
    const syncFromLocal = (event) => {
      if (event.type === "storage" && event.key && event.key !== LOCAL_STORE_KEY) return;
      const next = readLocalDemoState();
      setWorkers(next.workers);
      setPoints(next.points);
      setTasks(next.tasks);
      setPhotos(next.photos);
    };
    window.addEventListener("storage", syncFromLocal);
    window.addEventListener(LOCAL_STORE_EVENT, syncFromLocal);
    return () => {
      window.removeEventListener("storage", syncFromLocal);
      window.removeEventListener(LOCAL_STORE_EVENT, syncFromLocal);
    };
  }, []);

  async function loadAll() {
    if (isLocalDataMode) {
      const next = readLocalDemoState();
      setWorkers(next.workers);
      setPoints(next.points);
      setTasks(next.tasks);
      setPhotos(next.photos);
      setDataSource("本地演示任务");
      setMessage(`当前未配置 Supabase，正在使用本地演示数据（${cnTime()}）。`);
      return;
    }
    setLoading(true);
    try {
      if (isProxyDataMode) {
        const state = await proxyApi.loadState();
        setWorkers(state.workers || []);
        setPoints(state.points || []);
        setTasks(state.tasks || []);
        setPhotos(state.photos || []);
        setDataSource("Vercel API 代理数据");
        setMessage(`已通过 Vercel API 代理读取 Supabase 数据（${cnTime()}）。`);
        return;
      }
      const [{ data: w, error: ew }, { data: p, error: ep }, { data: t, error: et }, { data: ph, error: eph }] =
        await Promise.all([
          supabase.from("workers").select("*").order("name"),
          supabase.from("wall_points").select("*").order("created_at", { ascending: false }),
          supabase.from("dispatch_tasks").select("*").order("created_at", { ascending: false }),
          supabase.from("point_photos").select("*").order("created_at", { ascending: false }),
        ]);
      if (ew || ep || et || eph) throw ew || ep || et || eph;
      setWorkers(w || []);
      setPoints(p || []);
      setTasks(t || []);
      setPhotos(ph || []);
      setDataSource("Supabase 直连数据");
      setMessage(`已连接 Supabase 数据库（${cnTime()}）。`);
    } catch (err) {
      const issue = classifySupabaseError(err);
      console.error(err);
      setMessage(`读取 Supabase 失败：${issue.category}。${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkerTasks(workerCode) {
    if (!isProxyDataMode) {
      await loadAll();
      return;
    }
    setLoading(true);
    try {
      const state = await proxyApi.workerTasks(workerCode);
      setWorkers(state.worker ? [state.worker] : []);
      setPoints(state.points || []);
      setTasks(state.tasks || []);
      setPhotos(state.photos || []);
      setDataSource("真实派单任务");
      setMessage(`已通过 /api/worker-tasks 读取 ${state.points?.length || 0} 个真实派单任务。`);
    } catch (err) {
      const issue = classifySupabaseError(err);
      const next = readLocalDemoState();
      setWorkers(next.workers);
      setPoints(next.points);
      setTasks(next.tasks);
      setPhotos(next.photos);
      setDataSource("本地演示任务");
      setMessage(`读取真实派单任务失败，已回退本地演示：${issue.category}。${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function seedDemoData() {
    if (isLocalDataMode) {
      applyLocalState(createDemoState());
      setMessage("已重置本地演示数据。你可以直接在后台派单，再打开师傅移动端测试。");
      return;
    }
    setLoading(true);
    try {
      if (isProxyDataMode) {
        const state = await proxyApi.seedDemo();
        setWorkers(state.workers || []);
        setPoints(state.points || []);
        setTasks(state.tasks || []);
        setPhotos(state.photos || []);
        setMessage("已通过 Vercel API 代理写入演示师傅和点位。");
        return;
      }
      await supabase.from("workers").upsert(demoWorkers, { onConflict: "id" });
      await supabase.from("wall_points").upsert(demoPoints.map(serializePointForDb), { onConflict: "id" });
      await loadAll();
      setMessage("已写入演示师傅和点位。");
    } catch (err) {
      const issue = classifySupabaseError(err);
      setMessage(`写入演示数据失败：${issue.category}。${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function addPoints(newPoints) {
    const payload = newPoints.map(serializePointForDb);
    if (!payload.length) return;
    if (isLocalDataMode) {
      applyLocalState((current) => ({ ...current, points: [...payload, ...current.points] }));
      setMessage(`本地演示：已新增 ${payload.length} 个点位。`);
      return;
    }
    setLoading(true);
    try {
      if (isProxyDataMode) {
        await proxyApi.addPoints(payload);
        await loadAll();
        setMessage(`已通过 Vercel API 代理写入 ${payload.length} 个点位。`);
        return;
      }
      const { error } = await supabase.from("wall_points").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      await loadAll();
      setMessage(`已写入 Supabase：${payload.length} 个点位。`);
    } catch (err) {
      const issue = classifySupabaseError(err);
      setMessage(`批量新增失败：${issue.category}。${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function updatePoint(pointId, changes) {
    const payload = serializePointForDb({ id: pointId, ...changes });
    delete payload.created_at;
    payload.updated_at = nowIso();
    if (payload.status !== "已完成") payload.completed_at = null;
    if (isLocalDataMode) {
      applyLocalState((current) => ({
        ...current,
        points: current.points.map((point) => (point.id === pointId ? { ...point, ...payload } : point)),
      }));
      setMessage("本地演示：点位已更新。");
      return;
    }
    setLoading(true);
    try {
      if (isProxyDataMode) {
        await proxyApi.updatePoint(pointId, payload);
        await loadAll();
        setMessage("点位已通过 Vercel API 代理更新。");
        return;
      }
      const { error } = await supabase.from("wall_points").update(payload).eq("id", pointId);
      if (error) throw error;
      await loadAll();
      setMessage("点位已更新。");
    } catch (err) {
      const issue = classifySupabaseError(err);
      setMessage(`更新点位失败：${issue.category}。${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function renameProject(oldName, nextName) {
    const cleanName = normalizeText(nextName);
    if (!oldName || !cleanName) return;
    if (isLocalDataMode) {
      applyLocalState((current) => ({
        ...current,
        points: current.points.map((point) => (getProjectName(point) === oldName ? { ...point, project_name: cleanName, updated_at: nowIso() } : point)),
      }));
      setMessage(`本地演示：项目已改名为 ${cleanName}。`);
      return;
    }
    setLoading(true);
    try {
      if (isProxyDataMode) {
        await proxyApi.renameProject(oldName, cleanName);
        await loadAll();
        setMessage(`项目已通过 Vercel API 代理改名为 ${cleanName}。`);
        return;
      }
      const { error } = await supabase.from("wall_points").update({ project_name: cleanName, updated_at: nowIso() }).eq("project_name", oldName);
      if (error) throw error;
      await loadAll();
      setMessage(`项目已改名为 ${cleanName}。`);
    } catch (err) {
      const issue = classifySupabaseError(err);
      setMessage(`项目改名失败：${issue.category}。${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function dispatchPoints(workerId, pointIds) {
    const selectedIds = [...new Set(pointIds)];
    const worker = workers.find((item) => item.id === workerId || item.code === workerId) || {};

    if (isProxyDataMode) {
      const requestPayload = {
        worker_id: worker.id || workerId,
        worker_key: worker.code || worker.worker_key || worker.slug || workerId,
        worker_name: worker.name || "",
        worker_phone: worker.phone || "",
        point_ids: selectedIds,
      };
      setLoading(true);
      setDispatchDebug(null);
      try {
        const result = await dispatchPointsApi(requestPayload);
        await loadAll();
        setDispatchDebug({
          url: "/api/dispatch",
          payload: requestPayload,
          status: 200,
          response: result,
          stage: result.stage || "",
          message: result.ok ? "派单成功" : "",
          details: result.details || "",
        });
        setMessage(`已成功发送 ${result.inserted || selectedIds.length} 个点位给 ${result.worker?.name || worker.name || "指定师傅"}。`);
        return;
      } catch (err) {
        const issue = classifySupabaseError(err);
        setDispatchDebug({
          url: "/api/dispatch",
          payload: requestPayload,
          stage: err.stage || err.data?.stage || "",
          message: err.message || err.data?.message || issue.category,
          details: err.details || err.data?.details || issue.detail,
          status: err.status || "",
          response: err.data || null,
        });
        setMessage(`派单失败：${err.stage || err.data?.stage ? `${err.stage || err.data?.stage}，` : ""}${err.message || issue.category}。${err.details || err.data?.details || issue.detail}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    const existingTaskKeys = new Set(tasks.map((task) => `${task.worker_id}:${task.point_id}`));
    const payload = selectedIds
      .filter((pointId) => !existingTaskKeys.has(`${workerId}:${pointId}`))
      .map((pointId) => ({
        id: uid("task"),
        worker_id: workerId,
        point_id: pointId,
        status: "施工中",
        created_at: nowIso(),
      }));

    if (!payload.length) {
      setMessage("选中的点位已经派发给该师傅，无需重复派单。");
      return;
    }

    if (isLocalDataMode) {
      applyLocalState((current) => {
        const currentKeys = new Set(current.tasks.map((task) => `${task.worker_id}:${task.point_id}`));
        const newTasks = payload.filter((task) => !currentKeys.has(`${task.worker_id}:${task.point_id}`));
        const dispatchedPointIds = new Set(newTasks.map((task) => task.point_id));
        return {
          ...current,
          tasks: [...newTasks, ...current.tasks],
          points: current.points.map((point) =>
            dispatchedPointIds.has(point.id) && point.status !== "已完成"
              ? { ...point, status: "施工中", updated_at: nowIso() }
              : point
          ),
        };
      });
      setMessage("本地演示：已派单。打开对应师傅移动端链接即可看到任务。");
      return;
    }

    setLoading(true);
    setDispatchDebug(null);
    try {
      const { error } = await supabase.from("dispatch_tasks").insert(payload);
      if (error) throw error;
      const { error: updateError } = await supabase
        .from("wall_points")
        .update({ status: "施工中", updated_at: nowIso() })
        .in("id", payload.map((task) => task.point_id))
        .neq("status", "已完成");
      if (updateError) throw updateError;
      await loadAll();
      setMessage("已写入 dispatch_tasks，并派单到指定师傅移动端。");
    } catch (err) {
      const issue = classifySupabaseError(err);
      const payload = {
        worker_id: worker.id || workerId,
        worker_key: worker.code || worker.worker_key || worker.slug || workerId,
        worker_name: worker.name || "",
        worker_phone: worker.phone || "",
        point_ids: selectedIds,
      };
      setDispatchDebug({
        url: "/api/dispatch",
        payload,
        stage: err.stage || "",
        message: err.message || issue.category,
        details: err.details || issue.detail,
        status: err.status || "",
      });
      setMessage(`派单失败：${err.stage ? `${err.stage}，` : ""}${issue.category}。${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function updatePointStatus(pointId, nextStatus) {
    const changes = { status: nextStatus, updated_at: nowIso(), completed_at: nextStatus === "已完成" ? nowIso() : null };
    if (isLocalDataMode) {
      applyLocalState((current) => ({
        ...current,
        points: current.points.map((p) => (p.id === pointId ? { ...p, ...changes } : p)),
      }));
      return;
    }
    if (isProxyDataMode) {
      try {
        await proxyApi.updatePoint(pointId, changes);
      } catch (error) {
        const issue = classifySupabaseError(error);
        setMessage(`更新状态失败：${issue.category}。${issue.detail}`);
      }
      await loadAll();
      return;
    }
    const { error } = await supabase.from("wall_points").update(changes).eq("id", pointId);
    if (error) {
      const issue = classifySupabaseError(error);
      setMessage(`更新状态失败：${issue.category}。${issue.detail}`);
    }
    await loadAll();
  }

  async function updatePhotoKind(photoId, nextKind) {
    if (isLocalDataMode) {
      applyLocalState((current) => ({
        ...current,
        photos: current.photos.map((photo) => (photo.id === photoId ? { ...photo, kind: nextKind } : photo)),
      }));
      setMessage(`本地演示：图片已分类为 ${nextKind}。`);
      return;
    }
    if (isProxyDataMode) {
      try {
        await proxyApi.updatePhotoKind(photoId, nextKind);
        await loadAll();
        setMessage(`图片已通过 Vercel API 代理分类为 ${nextKind}。`);
      } catch (error) {
        const issue = classifySupabaseError(error);
        setMessage(`图片分类写入失败：${issue.category}。${issue.detail}`);
      }
      return;
    }
    const { error } = await supabase.from("point_photos").update({ kind: nextKind }).eq("id", photoId);
    if (error) {
      const issue = classifySupabaseError(error);
      setMessage(`图片分类写入失败：${issue.category}。${issue.detail}`);
      return;
    }
    await loadAll();
    setMessage(`图片已分类为 ${nextKind}。`);
  }

  async function uploadPhoto({ file, point, worker }) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${point.id}/${worker.id}/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const kind = getMediaKind(file);

    let publicUrl = "";
    if (isProxyDataMode) {
      const result = await proxyApi.upload({ file, point, worker, kind });
      return result.url || result.publicUrl || "";
    }
    if (isSupabaseConfigured) {
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      publicUrl = data.publicUrl;

      const { error: insertError } = await supabase.from("point_photos").insert({
        id: uid("photo"),
        point_id: point.id,
        worker_id: worker.id,
        url: publicUrl,
        file_name: file.name,
        kind,
        created_at: nowIso(),
      });
      if (insertError) throw insertError;
      await updatePointStatus(point.id, "已完成");
      return publicUrl;
    }

    publicUrl = URL.createObjectURL(file);
    applyLocalState((current) => ({
      ...current,
      photos: [
        { id: uid("photo"), point_id: point.id, worker_id: worker.id, url: publicUrl, file_name: file.name, kind, created_at: nowIso() },
        ...current.photos,
      ],
      points: current.points.map((p) => (p.id === point.id ? { ...p, status: "已完成", completed_at: nowIso(), updated_at: nowIso() } : p)),
    }));
    return publicUrl;
  }

  return {
    workers,
    points,
    tasks,
    photos,
    loading,
    message,
    dispatchDebug,
    dataSource,
    setMessage,
    loadAll,
    loadWorkerTasks,
    seedDemoData,
    addPoints,
    updatePoint,
    renameProject,
    dispatchPoints,
    updatePointStatus,
    updatePhotoKind,
    uploadPhoto,
  };
}

function StatusPill({ status }) {
  const cls = status === "已完成" ? "ok" : status === "施工中" ? "doing" : status === "需复查" ? "bad" : "todo";
  return <span className={`pill ${cls}`}>{status || "待施工"}</span>;
}

function MiniMetric({ label, value }) {
  return (
    <div className="metric">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function MediaThumb({ photo }) {
  const kind = getMediaKind(photo);
  const isVideo = kind.includes("视频") || photo.kind?.includes("视频");
  return (
    <div className="media-thumb">
      <div className="media-preview">
        {isVideo ? <video src={photo.url} controls /> : <img src={photo.url} alt={photo.file_name || "现场图片"} />}
      </div>
      <div className="media-caption">
        <b>{photo.file_name || "未命名文件"}</b>
        <span>{photo.kind || kind}</span>
      </div>
    </div>
  );
}

function DiagnosticPanel({ compact = false }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  async function run() {
    setRunning(true);
    try {
      setResult(await runSupabaseDiagnostics());
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className={compact ? "diag-card compact" : "diag-card"}>
      <div className="section-head">
        <div>
          <h2>Supabase 连接诊断</h2>
          <p>{result ? `最近检测：${result.finishedAt}` : "检测前端直连和 Vercel API 代理连接状态。"}</p>
        </div>
        <button className="primary" onClick={run} disabled={running}>{running ? "检测中..." : "开始诊断"}</button>
      </div>

      <div className="env-grid">
        <div><span>VITE_SUPABASE_URL</span><b>{supabaseEnv.hasUrl ? "已读取" : "未读取"}</b><small>{supabaseEnv.maskedUrl || supabaseEnv.urlValidation.reason}</small></div>
        <div><span>VITE_SUPABASE_ANON_KEY</span><b>{supabaseEnv.hasAnonKey ? "已读取" : "未读取"}</b><small>{supabaseEnv.maskedAnonKey || "请填写 anon key"}</small></div>
        <div><span>URL 格式</span><b>{supabaseEnv.urlValidation.ok ? "正确" : "异常"}</b><small>{supabaseEnv.urlValidation.reason}</small></div>
        <div><span>VITE_DATA_MODE</span><b>{supabaseEnv.dataMode || "未配置"}</b><small>{getDataModeLabel()}</small></div>
        <div><span>Storage bucket</span><b>{STORAGE_BUCKET}</b><small>代理诊断会检测 bucket 是否存在</small></div>
      </div>

      {isLocalDataMode && <div className="warn">当前是本地演示模式；部署真实测试建议在 Vercel 设置 VITE_DATA_MODE=proxy。</div>}
      {result?.summary && <div className={result.proxyOk ? "info" : "warn"}>{result.summary}</div>}

      {result && (
        <div className="diag-steps">
          <h3>前端直连 Supabase</h3>
          {result.directSteps.map((step) => (
            <div key={step.name} className={`diag-step ${step.ok ? "pass" : "fail"}`}>
              <b>{step.ok ? "通过" : step.category}</b>
              <span>{step.name}</span>
              <small>{step.detail}</small>
            </div>
          ))}
          <h3>Vercel API 代理</h3>
          {result.proxySteps.map((step) => (
            <div key={step.name} className={`diag-step ${step.ok ? "pass" : "fail"}`}>
              <b>{step.ok ? "通过" : step.category}</b>
              <span>{step.name}</span>
              <small>{step.detail}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminPage({ data }) {
  const { workers, points, tasks, photos, loading, message, dispatchDebug, loadAll, seedDemoData, dispatchPoints, addPoints, updatePoint, renameProject, updatePhotoKind, setMessage } = data;
  const [activeTab, setActiveTab] = useState("console");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("全部");
  const [projectFilter, setProjectFilter] = useState("全部项目");
  const [tagFilter, setTagFilter] = useState("全部标签");
  const [selectedIds, setSelectedIds] = useState([]);
  const [workerId, setWorkerId] = useState(workers[0]?.id || "w1");
  const [selectedPointId, setSelectedPointId] = useState("");
  const [expandedList, setExpandedList] = useState(false);
  const [batchText, setBatchText] = useState("");

  useEffect(() => {
    if (!workerId && workers[0]) setWorkerId(workers[0].id);
  }, [workers, workerId]);

  const projects = useMemo(() => uniqueValues(points.map(getProjectName)), [points]);
  const mediaByPoint = useMemo(() => {
    return photos.reduce((acc, photo) => {
      acc[photo.point_id] = acc[photo.point_id] || [];
      acc[photo.point_id].push(photo);
      return acc;
    }, {});
  }, [photos]);
  const taskPointIds = useMemo(() => new Set(tasks.map((task) => task.point_id)), [tasks]);

  const tags = useMemo(() => {
    const computed = new Set(["全部标签", "有照片", "无照片", "有坐标", "无坐标", "已派单"]);
    STATUS.forEach((item) => computed.add(item));
    projects.forEach((item) => computed.add(item));
    return [...computed];
  }, [projects]);

  const filtered = useMemo(() => {
    const keyword = query.trim();
    return points.filter((point) => {
      const projectName = getProjectName(point);
      const mediaCount = mediaByPoint[point.id]?.length || 0;
      const hasCoord = point.lng != null && point.lat != null;
      const haystack = [point.title, point.address, point.landlord_name, point.landlord_phone, point.k_code, point.project_name].join(" ");
      const qOk = !keyword || haystack.includes(keyword);
      const statusOk = status === "全部" || point.status === status;
      const projectOk = projectFilter === "全部项目" || projectName === projectFilter;
      const tagOk =
        tagFilter === "全部标签" ||
        point.status === tagFilter ||
        projectName === tagFilter ||
        (tagFilter === "有照片" && mediaCount > 0) ||
        (tagFilter === "无照片" && mediaCount === 0) ||
        (tagFilter === "有坐标" && hasCoord) ||
        (tagFilter === "无坐标" && !hasCoord) ||
        (tagFilter === "已派单" && taskPointIds.has(point.id));
      return qOk && statusOk && projectOk && tagOk;
    });
  }, [points, query, status, projectFilter, tagFilter, mediaByPoint, taskPointIds]);

  const selectedPoint = useMemo(() => {
    return points.find((point) => point.id === selectedPointId) || filtered[0] || points[0] || null;
  }, [points, selectedPointId, filtered]);

  useEffect(() => {
    setSelectedIds(filtered.map((point) => point.id));
    if (filtered[0] && !filtered.some((point) => point.id === selectedPointId)) {
      setSelectedPointId(filtered[0].id);
    }
  }, [query, status, projectFilter, tagFilter, points.length]);

  function toggle(id) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    setSelectedPointId(id);
  }

  async function handleDispatchSelectedPoints() {
    await dispatchPoints(workerId, selectedIds);
  }

  async function handleBatchTextImport() {
    const rows = parseBatchText(batchText);
    if (!rows.length) {
      setMessage("没有识别到可导入点位。");
      return;
    }
    await addPoints(rows);
    setBatchText("");
  }

  async function handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parsePointFile(file);
      await addPoints(rows);
    } catch (err) {
      setMessage(`Excel 解析失败：${err.message}`);
    } finally {
      event.target.value = "";
    }
  }

  async function handleGeocode(point) {
    if (!point?.address) {
      setMessage("当前点位没有地址，无法自动匹配经纬度。");
      return;
    }
    try {
      const result = await geocodeAddress(point.address);
      await updatePoint(point.id, { ...point, lng: result.lng, lat: result.lat, address: result.formattedAddress });
      setMessage(`已匹配经纬度：${result.lng}, ${result.lat}`);
    } catch (err) {
      setMessage(`地址自动匹配失败：${err.message}`);
    }
  }

  async function handleKimiClassify(photo) {
    let nextKind = getMediaKind(photo);
    if (supabaseEnv.hasKimiClassifyEndpoint) {
      try {
        const response = await fetch(supabaseEnv.kimiClassifyEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: photo.url, fileName: photo.file_name, currentKind: photo.kind }),
        });
        if (response.ok) {
          const body = await response.json();
          nextKind = body.kind || body.category || nextKind;
        }
      } catch (err) {
        setMessage(`Kimi 分类接口调用失败，已使用本地规则：${err.message}`);
      }
    }
    await updatePhotoKind(photo.id, nextKind);
  }

  const joinedTasks = tasks.map((task) => ({
    ...task,
    point: points.find((point) => point.id === task.point_id),
    worker: workers.find((worker) => worker.id === task.worker_id),
  })).filter((task) => task.point);

  return (
    <main className="admin-shell">
      <aside className="side-nav">
        <div className="brand-block">
          <b>墙体广告执行台</b>
          <span>{getDataModeLabel()}</span>
        </div>
        <nav>
          {ADMIN_TABS.map((tab) => (
            <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="topbar">
          <div>
            <strong className="system-title">全国墙体广告执行派单系统</strong>
            <h1>{ADMIN_TABS.find((tab) => tab.id === activeTab)?.label || "后台"}</h1>
            <p>{isProxyDataMode ? "当前优先通过本站 /api/* 代理访问 Supabase。" : isSupabaseConfigured ? `Supabase URL：${supabaseEnv.maskedUrl}` : "当前数据保存在本机浏览器。"}</p>
          </div>
          <div className="top-actions">
            <button onClick={loadAll} disabled={loading}>刷新数据</button>
            <button onClick={seedDemoData} disabled={loading}>{isLocalDataMode ? "重置本地演示数据" : "写入演示数据"}</button>
          </div>
        </header>

        {message && <section className="info">{message}</section>}
        {dispatchDebug && (
          <details className="info">
            <summary>派单调试信息</summary>
            <pre>{JSON.stringify(dispatchDebug, null, 2)}</pre>
          </details>
        )}

        <section className="metrics-grid">
          <MiniMetric label="全部点位" value={formatCount(points.length)} />
          <MiniMetric label="已完成" value={formatCount(points.filter((point) => point.status === "已完成").length)} />
          <MiniMetric label="派单记录" value={formatCount(tasks.length)} />
          <MiniMetric label="照片/视频" value={formatCount(photos.length)} />
          <MiniMetric label="项目" value={formatCount(projects.length)} />
        </section>

        {activeTab === "console" && (
          <ConsolePanel
            workers={workers}
            photos={photos}
            filtered={filtered}
            selectedIds={selectedIds}
            selectedPoint={selectedPoint}
            query={query}
            status={status}
            projectFilter={projectFilter}
            tagFilter={tagFilter}
            projects={projects}
            tags={tags}
            workerId={workerId}
            expandedList={expandedList}
            setQuery={setQuery}
            setStatus={setStatus}
            setProjectFilter={setProjectFilter}
            setTagFilter={setTagFilter}
            setWorkerId={setWorkerId}
            setExpandedList={setExpandedList}
            setSelectedIds={setSelectedIds}
            setSelectedPointId={setSelectedPointId}
            toggle={toggle}
            handleDispatch={handleDispatchSelectedPoints}
            handleGeocode={handleGeocode}
            loading={loading}
          />
        )}

        {activeTab === "projects" && (
          <ProjectPanel projects={projects} points={points} tasks={tasks} photos={photos} setProjectFilter={setProjectFilter} setActiveTab={setActiveTab} renameProject={renameProject} />
        )}

        {activeTab === "batch" && (
          <BatchPanel batchText={batchText} setBatchText={setBatchText} handleBatchTextImport={handleBatchTextImport} handleFileImport={handleFileImport} loading={loading} />
        )}

        {activeTab === "edit" && (
          <PointEditPanel points={points} selectedPoint={selectedPoint} setSelectedPointId={setSelectedPointId} updatePoint={updatePoint} handleGeocode={handleGeocode} />
        )}

        {activeTab === "site" && (
          <SiteCenterPanel tasks={joinedTasks} photos={photos} points={points} workers={workers} />
        )}

        {activeTab === "library" && (
          <PhotoLibraryPanel projects={projects} points={points} photos={photos} />
        )}

        {activeTab === "pano" && (
          <MediaKindPanel title="720全景" kind="720全景" photos={photos} points={points} />
        )}

        {activeTab === "video" && (
          <MediaKindPanel title="全景视频" kind="全景视频" photos={photos} points={points} />
        )}

        {activeTab === "watermark" && (
          <MediaKindPanel title="水印图片" kind="水印图片" photos={photos} points={points} />
        )}

        {activeTab === "track" && (
          <TrackPanel tasks={joinedTasks} workers={workers} />
        )}

        {activeTab === "kimi" && (
          <KimiPanel photos={photos} points={points} handleKimiClassify={handleKimiClassify} />
        )}

        {activeTab === "diagnostics" && <DiagnosticPanel />}
      </section>
    </main>
  );
}

function ConsolePanel(props) {
  const {
    workers,
    photos,
    filtered,
    selectedIds,
    selectedPoint,
    query,
    status,
    projectFilter,
    tagFilter,
    projects,
    tags,
    workerId,
    expandedList,
    setQuery,
    setStatus,
    setProjectFilter,
    setTagFilter,
    setWorkerId,
    setExpandedList,
    setSelectedIds,
    setSelectedPointId,
    toggle,
    handleDispatch,
    handleGeocode,
    loading,
  } = props;

  return (
    <div className="workspace-grid">
      <section className="tool-panel map-panel">
        <div className="section-head">
          <div>
            <h2>高德地图执行台</h2>
            <p>已选 {selectedIds.length}/{filtered.length} 个点位</p>
          </div>
          <button onClick={() => setExpandedList((value) => !value)}>{expandedList ? "收起列表" : "放大筛选列表"}</button>
        </div>

        <div className="filter-grid">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索点位、地址、房东、K码、项目" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>全部</option>
            {STATUS.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
            <option>全部项目</option>
            {projects.map((project) => <option key={project}>{project}</option>)}
          </select>
          <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
            {tags.map((tag) => <option key={tag}>{tag}</option>)}
          </select>
        </div>

        <div className="map-board">
          {filtered.map((point, index) => (
            <button
              key={point.id}
              className={`map-pin ${selectedIds.includes(point.id) ? "selected" : ""} ${point.status === "已完成" ? "done" : ""}`}
              style={mapPointStyle(point, filtered, index)}
              onClick={() => setSelectedPointId(point.id)}
              title={`${point.title} ${point.address || ""}`}
            >
              {index + 1}
            </button>
          ))}
          <div className="map-watermark">AMap Console</div>
        </div>

        <div className="dispatch-strip">
          <label className="dispatch-worker">
            <span>师傅选择</span>
            <select value={workerId} onChange={(event) => setWorkerId(event.target.value)} aria-label="师傅选择">
              {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} / {worker.car_no}</option>)}
            </select>
          </label>
          <button onClick={() => setSelectedIds(filtered.map((point) => point.id))}>全选</button>
          <button onClick={() => setSelectedIds([])}>全不选</button>
          <button onClick={() => setSelectedIds(filtered.map((point) => point.id).filter((id) => !selectedIds.includes(id)))}>反选</button>
          <button className="primary" onClick={handleDispatch} disabled={!selectedIds.length || loading}>发送已选点位到师傅移动端</button>
          {workers.find((worker) => worker.id === workerId) && (
            <a className="open-worker-link" href={`/worker?worker=${workers.find((worker) => worker.id === workerId)?.code || workerId}`} target="_blank" rel="noreferrer">
              打开该师傅移动端
            </a>
          )}
        </div>
      </section>

      <section className={`tool-panel list-panel ${expandedList ? "expanded" : ""}`}>
        <div className="section-head">
          <div>
            <h2>筛选点位列表</h2>
            <p>标签筛选：{tagFilter}</p>
          </div>
          {selectedPoint && <button onClick={() => handleGeocode(selectedPoint)}>地址匹配经纬度</button>}
        </div>
        <div className="point-list">
          {filtered.map((point) => {
            const count = photos.filter((photo) => photo.point_id === point.id).length;
            return (
              <article key={point.id} className={`point-card ${selectedIds.includes(point.id) ? "selected" : ""}`}>
                <button className="check" onClick={() => toggle(point.id)}>{selectedIds.includes(point.id) ? "✓" : ""}</button>
                <button className="point-summary" onClick={() => setSelectedPointId(point.id)}>
                  <span className="row">
                    <b>{point.title}</b>
                    <StatusPill status={point.status} />
                  </span>
                  <small>{point.address || "未填写地址"}</small>
                  <span className="meta-line">{getProjectName(point)} · {point.k_code || "无K码"} · 媒体 {count}</span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="tool-panel detail-panel">
        <div className="section-head">
          <div>
            <h2>{selectedPoint?.title || "未选择点位"}</h2>
            <p>{selectedPoint?.address || "从列表或地图选择一个点位"}</p>
          </div>
          {selectedPoint && <StatusPill status={selectedPoint.status} />}
        </div>
        {selectedPoint && (
          <div className="detail-grid">
            <div><span>项目</span><b>{getProjectName(selectedPoint)}</b></div>
            <div><span>K码</span><b>{selectedPoint.k_code || "未登记"}</b></div>
            <div><span>房东</span><b>{selectedPoint.landlord_name || "未登记"}</b></div>
            <div><span>电话</span><b>{selectedPoint.landlord_phone || "未登记"}</b></div>
            <div><span>经纬度</span><b>{selectedPoint.lng && selectedPoint.lat ? `${selectedPoint.lng}, ${selectedPoint.lat}` : "未匹配"}</b></div>
            <div><span>媒体</span><b>{photos.filter((photo) => photo.point_id === selectedPoint.id).length} 个</b></div>
          </div>
        )}
        {selectedPoint && (
          <div className="link-row">
            <a href={amapMarkerUrl(selectedPoint)} target="_blank" rel="noreferrer">高德查看</a>
            <a href={amapNavigationUrl(selectedPoint)} target="_blank" rel="noreferrer">高德导航</a>
          </div>
        )}
      </section>
    </div>
  );
}

function mapPointStyle(point, points, index) {
  const withCoord = points.filter((item) => item.lng != null && item.lat != null);
  if (!withCoord.length || point.lng == null || point.lat == null) {
    return { left: `${16 + (index * 17) % 68}%`, top: `${18 + (index * 23) % 64}%` };
  }
  const lngs = withCoord.map((item) => Number(item.lng));
  const lats = withCoord.map((item) => Number(item.lat));
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const left = maxLng === minLng ? 50 : 8 + ((Number(point.lng) - minLng) / (maxLng - minLng)) * 84;
  const top = maxLat === minLat ? 50 : 88 - ((Number(point.lat) - minLat) / (maxLat - minLat)) * 76;
  return { left: `${left}%`, top: `${top}%` };
}

function ProjectPanel({ projects, points, tasks, photos, setProjectFilter, setActiveTab, renameProject }) {
  const [renameTarget, setRenameTarget] = useState(projects[0] || "");
  const [nextName, setNextName] = useState("");

  useEffect(() => {
    if (!renameTarget && projects[0]) setRenameTarget(projects[0]);
  }, [projects, renameTarget]);

  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>项目管理</h2>
          <p>按 project_name 管理项目，兼容当前 Supabase 表结构。</p>
        </div>
      </div>
      <div className="project-grid">
        {projects.map((project) => {
          const projectPoints = points.filter((point) => getProjectName(point) === project);
          const pointIds = new Set(projectPoints.map((point) => point.id));
          return (
            <article key={project} className="project-row">
              <b>{project}</b>
              <span>{projectPoints.length} 点位</span>
              <span>{projectPoints.filter((point) => point.status === "已完成").length} 完成</span>
              <span>{tasks.filter((task) => pointIds.has(task.point_id)).length} 派单</span>
              <span>{photos.filter((photo) => pointIds.has(photo.point_id)).length} 媒体</span>
              <button onClick={() => { setProjectFilter(project); setActiveTab("console"); }}>进入执行台</button>
            </article>
          );
        })}
      </div>
      <div className="rename-box">
        <select value={renameTarget} onChange={(event) => setRenameTarget(event.target.value)}>
          {projects.map((project) => <option key={project}>{project}</option>)}
        </select>
        <input value={nextName} onChange={(event) => setNextName(event.target.value)} placeholder="新的项目名称" />
        <button className="primary" onClick={() => renameProject(renameTarget, nextName)}>批量改名</button>
      </div>
    </section>
  );
}

function BatchPanel({ batchText, setBatchText, handleBatchTextImport, handleFileImport, loading }) {
  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>批量新增点位</h2>
          <p>支持表头：点位、地址、房东、房东电话、K码、项目、经度、纬度。</p>
        </div>
        <label className="file-button">
          导入 Excel
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} />
        </label>
      </div>
      <textarea
        className="batch-textarea"
        value={batchText}
        onChange={(event) => setBatchText(event.target.value)}
        placeholder={"点位,地址,房东,房东电话,K码,项目,经度,纬度\nGZ-001,广州市白云区...,黄先生,135...,K-GZ-001,加多宝项目,113.3,23.1"}
      />
      <div className="action-row">
        <button className="primary" onClick={handleBatchTextImport} disabled={loading}>解析并写入点位</button>
      </div>
    </section>
  );
}

function PointEditPanel({ points, selectedPoint, setSelectedPointId, updatePoint, handleGeocode }) {
  const [draft, setDraft] = useState(selectedPoint || {});

  useEffect(() => {
    setDraft(selectedPoint || {});
  }, [selectedPoint?.id]);

  if (!selectedPoint) return <section className="empty">暂无点位可编辑。</section>;

  function change(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>点位编辑</h2>
          <p>编辑后会更新 wall_points，状态完成时间由上传自动维护。</p>
        </div>
        <select value={selectedPoint.id} onChange={(event) => setSelectedPointId(event.target.value)}>
          {points.map((point) => <option key={point.id} value={point.id}>{point.title}</option>)}
        </select>
      </div>
      <div className="edit-grid">
        <Field label="点位编号"><input value={draft.title || ""} onChange={(event) => change("title", event.target.value)} /></Field>
        <Field label="K码"><input value={draft.k_code || ""} onChange={(event) => change("k_code", event.target.value)} /></Field>
        <Field label="项目"><input value={draft.project_name || ""} onChange={(event) => change("project_name", event.target.value)} /></Field>
        <Field label="状态"><select value={draft.status || "待施工"} onChange={(event) => change("status", event.target.value)}>{STATUS.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="地址"><input value={draft.address || ""} onChange={(event) => change("address", event.target.value)} /></Field>
        <Field label="房东"><input value={draft.landlord_name || ""} onChange={(event) => change("landlord_name", event.target.value)} /></Field>
        <Field label="房东电话"><input value={draft.landlord_phone || ""} onChange={(event) => change("landlord_phone", event.target.value)} /></Field>
        <Field label="经度"><input value={draft.lng || ""} onChange={(event) => change("lng", event.target.value)} /></Field>
        <Field label="纬度"><input value={draft.lat || ""} onChange={(event) => change("lat", event.target.value)} /></Field>
      </div>
      <div className="action-row">
        <button onClick={() => handleGeocode(draft)}>地址自动匹配经纬度</button>
        <button className="primary" onClick={() => updatePoint(selectedPoint.id, draft)}>保存点位</button>
      </div>
    </section>
  );
}

function SiteCenterPanel({ tasks, photos, points, workers }) {
  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>现场查看中心</h2>
          <p>{tasks.length} 条派单，{photos.length} 个现场媒体。</p>
        </div>
      </div>
      <div className="site-grid">
        {tasks.map((task) => {
          const pointPhotos = photos.filter((photo) => photo.point_id === task.point_id);
          return (
            <article key={task.id} className="site-card">
              <div className="row">
                <b>{task.point?.title}</b>
                <StatusPill status={task.point?.status} />
              </div>
              <small>{task.worker?.name || "未知师傅"} · {task.point?.address}</small>
              <div className="thumb-row">
                {pointPhotos.slice(0, 4).map((photo) => <MediaThumb key={photo.id} photo={photo} />)}
                {!pointPhotos.length && <span className="muted-box">暂无上传</span>}
              </div>
            </article>
          );
        })}
        {!tasks.length && <section className="empty">暂无派单记录。</section>}
      </div>
      <div className="worker-link-row">
        {workers.map((worker) => (
          <a key={worker.id} href={`/worker?worker=${worker.code}`} target="_blank" rel="noreferrer">打开 {worker.name} 移动端</a>
        ))}
      </div>
    </section>
  );
}

function PhotoLibraryPanel({ projects, points, photos }) {
  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>项目照片库</h2>
          <p>按项目归档所有 point_photos。</p>
        </div>
      </div>
      <div className="library-stack">
        {projects.map((project) => {
          const pointIds = new Set(points.filter((point) => getProjectName(point) === project).map((point) => point.id));
          const media = photos.filter((photo) => pointIds.has(photo.point_id));
          return (
            <article key={project} className="library-section">
              <div className="section-head flat">
                <h3>{project}</h3>
                <span>{media.length} 个文件</span>
              </div>
              <div className="media-grid">
                {media.map((photo) => <MediaThumb key={photo.id} photo={photo} />)}
                {!media.length && <span className="muted-box">暂无图片/视频</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MediaKindPanel({ title, kind, photos, points }) {
  const media = photos.filter((photo) => mediaMatchesKind(photo, kind));
  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          <p>从 point_photos.kind 和文件名规则中筛选。</p>
        </div>
      </div>
      <div className="media-grid">
        {media.map((photo) => {
          const point = points.find((item) => item.id === photo.point_id);
          return (
            <div key={photo.id} className="media-with-point">
              <MediaThumb photo={photo} />
              <small>{point?.title || "未知点位"} · {point?.address || ""}</small>
            </div>
          );
        })}
        {!media.length && <section className="empty">暂无{title}。</section>}
      </div>
    </section>
  );
}

function TrackPanel({ tasks, workers }) {
  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>工人定位轨迹</h2>
          <p>当前用派单点位坐标生成轨迹；后续可接实时定位表。</p>
        </div>
      </div>
      <div className="track-grid">
        {workers.map((worker) => {
          const route = tasks.filter((task) => task.worker_id === worker.id && task.point?.lng && task.point?.lat);
          return (
            <article key={worker.id} className="track-card">
              <div className="row">
                <b>{worker.name}</b>
                <span>{route.length} 个坐标点</span>
              </div>
              <div className="track-line">
                {route.map((task, index) => (
                  <div key={task.id} className="track-node">
                    <b>{index + 1}</b>
                    <span>{task.point.title}</span>
                    <small>{task.point.lng}, {task.point.lat}</small>
                  </div>
                ))}
                {!route.length && <span className="muted-box">暂无可绘制轨迹</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function KimiPanel({ photos, points, handleKimiClassify }) {
  return (
    <section className="tool-panel">
      <div className="section-head">
        <div>
          <h2>Kimi图片分类</h2>
          <p>{supabaseEnv.hasKimiClassifyEndpoint ? "已读取后端分类接口。" : "未配置后端 Kimi 接口，使用本地规则分类。"}</p>
        </div>
      </div>
      <div className="kimi-grid">
        {photos.map((photo) => {
          const point = points.find((item) => item.id === photo.point_id);
          return (
            <article key={photo.id} className="kimi-card">
              <MediaThumb photo={photo} />
              <div>
                <b>{point?.title || "未知点位"}</b>
                <small>{photo.kind || getMediaKind(photo)}</small>
              </div>
              <button onClick={() => handleKimiClassify(photo)}>重新分类</button>
            </article>
          );
        })}
        {!photos.length && <section className="empty">暂无可分类图片。</section>}
      </div>
    </section>
  );
}

function WorkerPage({ data, workerCode }) {
  const { workers, points, tasks, photos, uploadPhoto, loadAll, loadWorkerTasks, message, dataSource } = data;
  const worker = workers.find((w) => w.code === workerCode) || workers[0] || demoWorkers[0];
  const myTaskIds = tasks.filter((t) => t.worker_id === worker.id).map((t) => t.point_id);
  const assigned = points.filter((p) => myTaskIds.includes(p.id));
  const visiblePoints = assigned.length ? assigned : [];

  const [index, setIndex] = useState(0);
  const point = visiblePoints[Math.min(index, Math.max(visiblePoints.length - 1, 0))] || null;
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState("");

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !point) return;
    setBusy(true);
    try {
      for (const file of files) {
        await uploadPhoto({ file, point, worker });
      }
      setLocalMessage(`${point.title} 已上传资料，Storage / point_photos 写入后自动更新为已完成。`);
      if (isProxyDataMode) {
        await loadWorkerTasks(workerCode);
      } else {
        await loadAll();
      }
    } catch (err) {
      const issue = classifySupabaseError(err);
      setLocalMessage(`上传失败：${issue.category}。${issue.detail}`);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <main className="page worker">
      <header className="mobile-hero">
        <div className="tag">师傅移动端 H5</div>
        <h1>{worker.name} 的任务</h1>
        <p>{worker.car_no} / {worker.phone}</p>
        <small>数据来源：{dataSource || (isLocalDataMode ? "本地演示任务" : "真实派单任务")}</small>
      </header>

      {isLocalDataMode && <section className="warn">当前是本地演示模式。跨设备测试请配置 Vercel API 代理或 Supabase 直连。</section>}
      {(message || localMessage) && <section className="info">{localMessage || message}</section>}

      <section className="progress">
        <span>任务进度</span>
        <b>{visiblePoints.length ? `${Math.min(index + 1, visiblePoints.length)} / ${visiblePoints.length}` : "0 / 0"}</b>
      </section>

      {point ? (
        <section className="task-card">
          <div className="row">
            <div>
              <small>点位 {index + 1}</small>
              <h2>{point.title}</h2>
            </div>
            <StatusPill status={point.status} />
          </div>

          <div className="addr">
            <b>地址：</b>{point.address}<br />
            <b>K码：</b>{point.k_code}<br />
            <b>项目：</b>{point.project_name || "未分配"}<br />
            <b>坐标：</b>{point.lng && point.lat ? `${point.lng}, ${point.lat}` : "未匹配"}
          </div>

          <div className="step">
            <h3>现场导航</h3>
            <div className="two">
              <div><b>房东</b><br />{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</div>
              <div><b>状态</b><br />{point.status}</div>
            </div>
            <div className="two buttons">
              <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
              <a className="blue" href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
            </div>
          </div>

          <div className="step">
            <h3>上传照片/视频</h3>
            <label className={`upload ${busy ? "disabled" : ""}`}>
              {busy ? "上传中..." : "上传现场照片 / 水印图片 / 720全景 / 全景视频"}
              <input disabled={busy} type="file" accept="image/*,video/*" multiple onChange={handleUpload} />
            </label>
            <p className="hint">上传成功后写入 Storage 和 point_photos，并自动把点位更新为“已完成”。</p>
            <div className="media-count">已上传：{photos.filter((ph) => ph.point_id === point.id).length} 个文件</div>
          </div>
        </section>
      ) : (
        <section className="empty">暂无派单点位。请让后台先筛选点位并发送给当前师傅。</section>
      )}

      <div className="bottom-nav">
        <button disabled={index <= 0} onClick={() => setIndex(i => Math.max(0, i - 1))}>上一点位</button>
        <button disabled={index >= visiblePoints.length - 1} onClick={() => setIndex(i => Math.min(visiblePoints.length - 1, i + 1))}>下一点位</button>
      </div>
    </main>
  );
}

function App() {
  const route = getRoute();
  const data = useH5Data();

  useEffect(() => {
    if (route.page === "worker" && isProxyDataMode) {
      data.loadWorkerTasks(route.workerCode);
    } else {
      data.loadAll();
    }
  }, [route.page, route.workerCode]);

  if (route.page === "worker") return <WorkerPage data={data} workerCode={route.workerCode} />;
  return <AdminPage data={data} />;
}

createRoot(document.getElementById("root")).render(<App />);
