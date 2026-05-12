const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function normalizeIds(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(list.map((item) => String(item || "").trim()).filter(Boolean))];
}

async function findWorker(supabase, payload = {}) {
  const workerId = payload.worker_id || payload.workerId || payload.worker || payload.code || "";
  const { data, error } = await supabase.from("workers").select("*").limit(1000);
  if (error) throw error;
  return (data || []).find((worker) => [worker.id, worker.code, worker.worker_key, worker.slug, worker.access_token, worker.phone].filter(Boolean).map(String).includes(String(workerId))) || null;
}

async function createDispatch(supabase, req, res) {
  const body = parseBody(req);
  const worker = await findWorker(supabase, body);
  const pointIds = normalizeIds(body.point_ids || body.pointIds || body.points);
  if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到师傅。" });
  if (worker.enabled === false) return sendJson(res, 403, { ok: false, error: "WORKER_DISABLED", detail: "该师傅链接已停用。" });
  if (!pointIds.length) return sendJson(res, 400, { ok: false, error: "POINT_IDS_REQUIRED", detail: "point_ids 不能为空。" });

  await supabase.from("dispatch_tasks").delete().eq("worker_id", worker.id).in("point_id", pointIds);
  const assignedAt = nowIso();
  const tasks = pointIds.map((pointId) => ({
    id: uid("task"),
    worker_id: worker.id,
    point_id: pointId,
    status: "已派单",
    assigned_at: assignedAt,
    created_at: assignedAt,
  }));
  const { data, error } = await supabase.from("dispatch_tasks").insert(tasks).select("*");
  if (error) throw error;
  const pointUpdate = await supabase.from("wall_points").update({ status: "已派单", updated_at: nowIso() }).in("id", pointIds).select("id");
  if (pointUpdate.error) throw pointUpdate.error;
  return sendJson(res, 200, { ok: true, data: { workerId: worker.id, inserted: (data || tasks).length, updated_points: pointUpdate.data?.length || pointIds.length, point_ids: pointIds } });
}

async function listTasks(supabase, res) {
  const { data, error } = await supabase.from("dispatch_tasks").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data: data || [] });
}

async function completePoint(supabase, req, res) {
  const body = parseBody(req);
  const pointId = req.query.pointId || req.query.point_id || body.pointId || body.point_id;
  if (!pointId) return sendJson(res, 400, { ok: false, error: "POINT_ID_REQUIRED", detail: "缺少 pointId。" });
  const completedAt = nowIso();
  const { error: pointError } = await supabase.from("wall_points").update({ status: "已完成", completed_at: completedAt, updated_at: completedAt }).eq("id", pointId);
  if (pointError) throw pointError;
  await supabase.from("dispatch_tasks").update({ status: "已完成", completed_at: completedAt }).eq("point_id", pointId);
  return sendJson(res, 200, { ok: true, data: { id: pointId, status: "已完成" } });
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  const action = String(req.query.action || (req.method === "GET" ? "tasks" : "create")).toLowerCase();

  try {
    if (action === "tasks") return listTasks(supabase, res);
    if (action === "create") {
      if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
      return createDispatch(supabase, req, res);
    }
    if (action === "complete") {
      if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
      return completePoint(supabase, req, res);
    }
    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
