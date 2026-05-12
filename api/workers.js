const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

const ACCESS_TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateAccessToken() {
  let body = "";
  for (let index = 0; index < 12; index += 1) body += ACCESS_TOKEN_CHARS[Math.floor(Math.random() * ACCESS_TOKEN_CHARS.length)];
  return `tk_${body}`;
}

function normalizeCarNo(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeSlug(value, fallback) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  return slug || fallback;
}

function buildWorkerRow(worker = {}) {
  const id = worker.id || uid("worker");
  const slug = normalizeSlug(worker.slug || worker.workerKey || worker.worker_key || worker.code || worker.phone, id);
  const teamType = worker.teamType || worker.team_type || "install";
  return {
    id,
    code: worker.code || worker.workerKey || worker.worker_key || slug,
    worker_key: worker.worker_key || worker.workerKey || worker.code || slug,
    slug,
    access_token: worker.access_token || worker.accessToken || generateAccessToken(),
    name: worker.name || "未命名师傅",
    phone: worker.phone || "",
    car_no: normalizeCarNo(worker.car_no || worker.carNo || ""),
    team_type: teamType,
    team_type_name: worker.team_type_name || worker.teamTypeName || (teamType === "wall" ? "找墙队伍" : "安装队伍"),
    project_id: worker.project_id || worker.projectId || "all",
    project_name: worker.project_name || worker.projectName || "",
    enabled: worker.enabled !== false,
    online: Boolean(worker.online),
    lng: worker.lng == null || worker.lng === "" ? null : Number(worker.lng),
    lat: worker.lat == null || worker.lat === "" ? null : Number(worker.lat),
    speed: Number(worker.speed || 0),
    moving: Boolean(worker.moving),
    stopped_seconds: Number(worker.stoppedSeconds || worker.stopped_seconds || 0),
    last_seen_at: worker.lastSeenAt || worker.last_seen_at || null,
    last_online_at: worker.lastOnlineAt || worker.last_online_at || null,
    last_offline_at: worker.lastOfflineAt || worker.last_offline_at || null,
    last_location_at: worker.lastLocationAt || worker.last_location_at || null,
    updated_at: nowIso(),
    created_at: worker.created_at || nowIso(),
  };
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    if (req.method === "GET") {
      let query = supabase.from("workers").select("*").order("name");
      if (req.query.enabledOnly === "true") query = query.eq("enabled", true);
      const { data, error } = await query;
      if (error) throw error;
      const workers = data || [];
      return sendJson(res, 200, { ok: true, data: workers, workers });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const worker = body.worker || body;
      const { data, error } = await supabase.from("workers").upsert(buildWorkerRow(worker), { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
