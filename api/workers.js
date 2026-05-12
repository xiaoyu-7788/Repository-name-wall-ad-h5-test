const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

const ACCESS_TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function text(value) {
  return String(value || "").trim();
}

function generateAccessToken() {
  let body = "";
  for (let index = 0; index < 12; index += 1) body += ACCESS_TOKEN_CHARS[Math.floor(Math.random() * ACCESS_TOKEN_CHARS.length)];
  return `tk_${body}`;
}

function normalizeCarNo(value) {
  return text(value).toUpperCase();
}

function normalizeSlug(value, fallback) {
  const slug = text(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  return slug || fallback;
}

function matchWorker(worker, query) {
  const key = text(query);
  const candidates = [worker.access_token, worker.id, worker.code, worker.worker_key, worker.slug, worker.phone].map(text).filter(Boolean);
  return candidates.includes(key);
}

async function findWorker(supabase, query) {
  const { data, error } = await supabase.from("workers").select("*").limit(1000);
  if (error) throw error;
  return (data || []).find((worker) => matchWorker(worker, query)) || null;
}

function workerRow(worker = {}, existing = {}) {
  const id = worker.id || existing.id || uid("worker");
  const slug = normalizeSlug(worker.slug || worker.workerKey || worker.worker_key || worker.code || existing.slug || worker.phone, id);
  const teamType = worker.teamType || worker.team_type || existing.team_type || "install";
  return {
    id,
    code: worker.code || worker.workerKey || worker.worker_key || existing.code || slug,
    worker_key: worker.worker_key || worker.workerKey || existing.worker_key || slug,
    slug,
    access_token: worker.access_token || worker.accessToken || existing.access_token || generateAccessToken(),
    name: worker.name || existing.name || "未命名师傅",
    phone: worker.phone || existing.phone || "",
    car_no: normalizeCarNo(worker.car_no || worker.carNo || existing.car_no || ""),
    team_type: teamType,
    team_type_name: worker.team_type_name || worker.teamTypeName || existing.team_type_name || (teamType === "wall" ? "找墙队伍" : "安装队伍"),
    project_id: worker.project_id || worker.projectId || existing.project_id || "all",
    project_name: worker.project_name || worker.projectName || existing.project_name || "",
    enabled: worker.enabled ?? existing.enabled ?? true,
    online: worker.online ?? existing.online ?? false,
    lng: worker.lng == null || worker.lng === "" ? existing.lng ?? null : Number(worker.lng),
    lat: worker.lat == null || worker.lat === "" ? existing.lat ?? null : Number(worker.lat),
    speed: Number(worker.speed ?? existing.speed ?? 0),
    moving: Boolean(worker.moving ?? existing.moving),
    stopped_seconds: Number(worker.stoppedSeconds ?? worker.stopped_seconds ?? existing.stopped_seconds ?? 0),
    last_seen_at: worker.lastSeenAt || worker.last_seen_at || existing.last_seen_at || null,
    last_online_at: worker.lastOnlineAt || worker.last_online_at || existing.last_online_at || null,
    last_offline_at: worker.lastOfflineAt || worker.last_offline_at || existing.last_offline_at || null,
    last_location_at: worker.lastLocationAt || worker.last_location_at || existing.last_location_at || null,
    updated_at: nowIso(),
    created_at: worker.created_at || existing.created_at || nowIso(),
  };
}

async function listWorkers(supabase, req, res) {
  let query = supabase.from("workers").select("*").order("name");
  if (req.query.enabledOnly === "true") query = query.eq("enabled", true);
  const { data, error } = await query;
  if (error) throw error;
  const workers = data || [];
  return sendJson(res, 200, { ok: true, data: workers, workers });
}

async function saveWorker(supabase, req, res) {
  const body = parseBody(req);
  const worker = body.worker || body;
  const id = req.query.id || worker.id;
  const existing = id ? await findWorker(supabase, id) : {};
  const { data, error } = await supabase.from("workers").upsert(workerRow({ ...worker, id }, existing || {}), { onConflict: "id" }).select("*").single();
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data });
}

async function deleteWorker(supabase, req, res) {
  const id = req.query.id || parseBody(req).id;
  const worker = await findWorker(supabase, id);
  const deleteId = worker?.id || id;
  const { error } = await supabase.from("workers").delete().eq("id", deleteId);
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data: { id: deleteId, deleted: true } });
}

async function setEnabled(supabase, req, res) {
  const id = req.query.id;
  const worker = await findWorker(supabase, id);
  if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到该师傅。" });
  const body = parseBody(req);
  const enabled = body.enabled !== false;
  const updates = { enabled, online: false, updated_at: nowIso() };
  if (!enabled) updates.last_offline_at = nowIso();
  const { data, error } = await supabase.from("workers").update(updates).eq("id", worker.id).select("*").single();
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data });
}

async function resetToken(supabase, req, res) {
  const worker = await findWorker(supabase, req.query.id);
  if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到该师傅。" });
  const { data, error } = await supabase.from("workers").update({ access_token: generateAccessToken(), updated_at: nowIso() }).eq("id", worker.id).select("*").single();
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data });
}

async function heartbeat(supabase, req, res) {
  const worker = await findWorker(supabase, req.query.id);
  if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到该师傅。" });
  if (worker.enabled === false) return sendJson(res, 403, { ok: false, error: "WORKER_DISABLED", detail: "该师傅链接已停用，请联系管理员。" });
  const body = parseBody(req);
  const timestamp = nowIso();
  const updates = { online: true, last_seen_at: timestamp, last_online_at: timestamp, updated_at: timestamp };
  if (body.lng != null && body.lat != null) {
    updates.lng = Number(body.lng);
    updates.lat = Number(body.lat);
    updates.last_location_at = timestamp;
  }
  const { data, error } = await supabase.from("workers").update(updates).eq("id", worker.id).select("*").single();
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data });
}

async function offline(supabase, req, res) {
  const worker = await findWorker(supabase, req.query.id);
  if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到该师傅。" });
  const timestamp = nowIso();
  const { data, error } = await supabase.from("workers").update({ online: false, last_offline_at: timestamp, updated_at: timestamp }).eq("id", worker.id).select("*").single();
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data });
}

async function saveLocation(supabase, req, res) {
  const body = parseBody(req);
  const worker = await findWorker(supabase, body.workerId || body.worker_id);
  const lng = Number(body.lng);
  const lat = Number(body.lat);
  if (!worker || !Number.isFinite(lng) || !Number.isFinite(lat)) return sendJson(res, 400, { ok: false, error: "INVALID_LOCATION", detail: "缺少 workerId、lng 或 lat。" });
  if (worker.enabled === false) return sendJson(res, 403, { ok: false, error: "WORKER_DISABLED", detail: "该师傅链接已停用，请联系管理员。" });

  const timestamp = body.timestamp || nowIso();
  const speed = Number(body.speed || 0);
  const moving = body.moving === undefined ? speed > 3 : Boolean(body.moving);
  const stoppedSeconds = Number(body.stoppedSeconds || body.stopped_seconds || 0);
  const { data: updatedWorker, error } = await supabase
    .from("workers")
    .update({
      lng,
      lat,
      accuracy: Number(body.accuracy || 0),
      speed,
      heading: body.heading == null ? null : Number(body.heading),
      moving,
      stopped_seconds: stoppedSeconds,
      online: true,
      last_seen_at: timestamp,
      last_online_at: worker.last_online_at || timestamp,
      last_location_at: timestamp,
      updated_at: nowIso(),
    })
    .eq("id", worker.id)
    .select("*")
    .single();
  if (error) throw error;

  const trackLog = {
    id: uid("track"),
    worker_id: worker.id,
    worker_name: worker.name,
    event: body.event || (moving ? "实时定位" : "定位停车"),
    speed,
    stop_minutes: Math.round(stoppedSeconds / 60),
    lng,
    lat,
    project_name: body.project_name || worker.project_name || "",
    recorded_at: timestamp,
    created_at: nowIso(),
  };
  await supabase.from("track_logs").insert(trackLog);
  return sendJson(res, 200, { ok: true, data: { worker: updatedWorker, location: { id: trackLog.id, ...body, lng, lat } } });
}

async function workerTasks(supabase, req, res) {
  const workerQuery = req.query.workerId || req.query.worker_id || req.query.worker || req.query.code || "";
  if (!workerQuery) return sendJson(res, 400, { ok: false, error: "WORKER_REQUIRED", detail: "缺少 worker 参数。" });
  const worker = await findWorker(supabase, workerQuery);
  if (!worker) return sendJson(res, 200, { ok: true, worker: null, tasks: [], points: [], photos: [] });
  if (worker.enabled === false) return sendJson(res, 403, { ok: false, error: "WORKER_DISABLED", detail: "该师傅链接已停用，请联系管理员。" });

  const { data: tasks, error: taskError } = await supabase.from("dispatch_tasks").select("*").eq("worker_id", worker.id).order("created_at", { ascending: true });
  if (taskError) throw taskError;
  const pointIds = [...new Set((tasks || []).map((task) => task.point_id).filter(Boolean))];
  const { data: points, error: pointError } = pointIds.length ? await supabase.from("wall_points").select("*").in("id", pointIds) : { data: [], error: null };
  if (pointError) throw pointError;
  const { data: photos, error: photoError } = pointIds.length ? await supabase.from("point_photos").select("*").in("point_id", pointIds).order("created_at", { ascending: false }) : { data: [], error: null };
  if (photoError) throw photoError;
  return sendJson(res, 200, { ok: true, source: "proxy", worker, tasks: tasks || [], points: points || [], photos: photos || [] });
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  const action = String(req.query.action || (req.method === "GET" ? "list" : req.method === "POST" ? "create" : "")).toLowerCase();

  try {
    if (action === "list") return listWorkers(supabase, req, res);
    if (action === "detail") {
      const worker = await findWorker(supabase, req.query.id);
      if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到该师傅。" });
      return sendJson(res, 200, { ok: true, data: worker });
    }
    if (action === "create" || action === "update") return saveWorker(supabase, req, res);
    if (action === "delete") return deleteWorker(supabase, req, res);
    if (action === "enable") return setEnabled(supabase, req, res);
    if (action === "access-token") return resetToken(supabase, req, res);
    if (action === "heartbeat") return heartbeat(supabase, req, res);
    if (action === "offline") return offline(supabase, req, res);
    if (action === "location") return saveLocation(supabase, req, res);
    if (action === "tasks") return workerTasks(supabase, req, res);
    return methodNotAllowed(res, ["GET", "POST", "PUT", "PATCH", "DELETE"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
