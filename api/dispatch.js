const { methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function fail(res, status, stage, message, details = "", payload = undefined) {
  return sendJson(res, status, {
    ok: false,
    stage,
    message,
    details,
    ...(payload ? { payload } : {}),
  });
}

function normalizeIds(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(list.map((item) => String(item || "").trim()).filter(Boolean))];
}

function text(value) {
  return String(value || "").trim();
}

function includesText(value, keyword) {
  return text(value).toLowerCase().includes(text(keyword).toLowerCase());
}

function matchWorker(worker, workerId, workerKey, workerName, workerPhone) {
  const id = text(workerId);
  const key = text(workerKey);
  const name = text(workerName);
  const phone = text(workerPhone);
  const candidates = [worker.id, worker.code, worker.worker_key, worker.slug].map(text).filter(Boolean);
  if (id && candidates.includes(id)) return true;
  if (key && candidates.includes(key)) return true;
  if (name && includesText(worker.name, name)) return true;
  if (phone && text(worker.phone) === phone) return true;
  if (key === "li" && (includesText(worker.name, "李") || includesText(worker.car_no || worker.carNo, "工002"))) return true;
  if (key === "zhang" && (includesText(worker.name, "张") || includesText(worker.car_no || worker.carNo, "工001"))) return true;
  return false;
}

async function findWorker(supabase, workerId, workerKey, workerName, workerPhone) {
  const ordered = await supabase.from("workers").select("*").order("created_at", { ascending: true });
  if (!ordered.error) {
    return (ordered.data || []).find((worker) => matchWorker(worker, workerId, workerKey, workerName, workerPhone)) || null;
  }

  const message = String(ordered.error.message || "");
  if (!/created_at|schema cache|column/i.test(message)) throw ordered.error;
  const fallback = await supabase.from("workers").select("*");
  if (fallback.error) throw fallback.error;
  return (fallback.data || []).find((worker) => matchWorker(worker, workerId, workerKey, workerName, workerPhone)) || null;
}

async function insertTasks(supabase, tasks) {
  const withAssignedAt = tasks.map((task) => ({ ...task, assigned_at: task.assigned_at || nowIso() }));
  const first = await supabase.from("dispatch_tasks").insert(withAssignedAt).select("id,point_id");
  if (!first.error) return { data: first.data || [], assignedAtSupported: true };

  const message = String(first.error.message || "");
  if (!/assigned_at|schema cache|column/i.test(message)) throw first.error;

  const fallbackTasks = tasks.map(({ assigned_at, ...task }) => task);
  const fallback = await supabase.from("dispatch_tasks").insert(fallbackTasks).select("id,point_id");
  if (fallback.error) throw fallback.error;
  return { data: fallback.data || [], assignedAtSupported: false };
}

async function updatePoints(supabase, pointIds) {
  const withUpdatedAt = await supabase
    .from("wall_points")
    .update({ status: "施工中", updated_at: nowIso() })
    .in("id", pointIds)
    .select("id");
  if (!withUpdatedAt.error) return withUpdatedAt.data || [];

  const message = String(withUpdatedAt.error.message || "");
  if (!/updated_at|schema cache|column/i.test(message)) throw withUpdatedAt.error;

  const fallback = await supabase
    .from("wall_points")
    .update({ status: "施工中" })
    .in("id", pointIds)
    .select("id");
  if (fallback.error) throw fallback.error;
  return fallback.data || [];
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  const body = parseBody(req);
  const workerId = body.worker_id || body.workerId || "";
  const workerKey = body.worker_key || body.worker || body.worker_code || body.code || "";
  const workerName = body.worker_name || body.workerName || "";
  const workerPhone = body.worker_phone || body.workerPhone || body.phone || "";
  const pointIds = normalizeIds(body.point_ids || body.pointIds || body.points);
  const debugPayload = {
    worker_id: workerId,
    worker_key: workerKey,
    worker_name: workerName,
    worker_phone: workerPhone,
    point_ids: pointIds,
  };

  if (!pointIds.length) {
    return fail(res, 400, "validate_payload", "point_ids 不能为空。", "请求需要包含 point_ids 数组。", debugPayload);
  }

  let worker;
  try {
    worker = await findWorker(supabase, workerId, workerKey, workerName, workerPhone);
  } catch (error) {
    return fail(res, 500, "find_worker", "查询 workers 表失败。", error.message || String(error), debugPayload);
  }

  if (!worker) {
    return fail(res, 404, "find_worker", "未找到师傅。", `worker_id=${workerId || "(empty)"}, worker_key=${workerKey || "(empty)"}, worker_name=${workerName || "(empty)"}, worker_phone=${workerPhone || "(empty)"}`, debugPayload);
  }

  let existing = [];
  try {
    const result = await supabase
      .from("dispatch_tasks")
      .select("id,point_id")
      .eq("worker_id", worker.id)
      .in("point_id", pointIds);
    if (result.error) throw result.error;
    existing = result.data || [];
  } catch (error) {
    return fail(res, 500, "read_existing_tasks", "读取已有派单失败。", error.message || String(error), debugPayload);
  }

  try {
    if (existing.length) {
      const deleteResult = await supabase.from("dispatch_tasks").delete().in("id", existing.map((task) => task.id));
      if (deleteResult.error) throw deleteResult.error;
    }
  } catch (error) {
    return fail(res, 500, "delete_existing_tasks", "清理重复派单失败。", error.message || String(error), debugPayload);
  }

  const assignedAt = nowIso();
  const tasks = pointIds.map((pointId) => ({
    id: uid("task"),
    worker_id: worker.id,
    point_id: pointId,
    status: "施工中",
    assigned_at: assignedAt,
    created_at: assignedAt,
  }));

  let insertedTasks = [];
  let assignedAtSupported = true;
  try {
    const result = await insertTasks(supabase, tasks);
    insertedTasks = result.data;
    assignedAtSupported = result.assignedAtSupported;
  } catch (error) {
    return fail(res, 500, "insert_dispatch_tasks", "写入 dispatch_tasks 失败。", error.message || String(error), debugPayload);
  }

  let updatedPoints = [];
  try {
    updatedPoints = await updatePoints(supabase, pointIds);
  } catch (error) {
    return fail(res, 500, "update_wall_points", "更新 wall_points 状态失败。", error.message || String(error), debugPayload);
  }

  return sendJson(res, 200, {
    ok: true,
    worker,
    inserted: insertedTasks.length,
    updated_points: updatedPoints.length,
    point_ids: pointIds,
    assigned_at_supported: assignedAtSupported,
  });
};
