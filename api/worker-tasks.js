const { classifyError, methodNotAllowed, requireSupabase, sendJson } = require("./_shared");

function text(value) {
  return String(value || "").trim();
}

function includesText(value, keyword) {
  return text(value).toLowerCase().includes(text(keyword).toLowerCase());
}

function matchWorker(worker, query) {
  const key = text(query);
  const candidates = [worker.id, worker.code, worker.worker_key, worker.slug].map(text).filter(Boolean);
  if (candidates.includes(key)) return true;
  if (text(worker.phone) === key) return true;
  if (key === "li" && (includesText(worker.name, "李") || includesText(worker.car_no || worker.carNo, "工002"))) return true;
  if (key === "zhang" && (includesText(worker.name, "张") || includesText(worker.car_no || worker.carNo, "工001"))) return true;
  return false;
}

async function findWorker(supabase, query) {
  const ordered = await supabase.from("workers").select("*").order("created_at", { ascending: true });
  if (!ordered.error) return (ordered.data || []).find((worker) => matchWorker(worker, query)) || null;

  const message = String(ordered.error.message || "");
  if (!/created_at|schema cache|column/i.test(message)) throw ordered.error;
  const fallback = await supabase.from("workers").select("*");
  if (fallback.error) throw fallback.error;
  return (fallback.data || []).find((worker) => matchWorker(worker, query)) || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const workerQuery = req.query.worker || req.query.worker_id || req.query.code || "";
    if (!workerQuery) return sendJson(res, 400, { ok: false, error: "WORKER_REQUIRED", detail: "缺少 worker 参数。" });

    const worker = await findWorker(supabase, workerQuery);
    if (!worker) return sendJson(res, 200, { ok: true, worker: null, tasks: [], points: [], photos: [] });

    const { data: tasks, error: taskError } = await supabase
      .from("dispatch_tasks")
      .select("*")
      .eq("worker_id", worker.id)
      .order("created_at", { ascending: true });
    if (taskError) throw taskError;

    const pointIds = [...new Set((tasks || []).map((task) => task.point_id).filter(Boolean))];
    if (!pointIds.length) return sendJson(res, 200, { ok: true, worker, tasks: tasks || [], points: [], photos: [] });

    const { data: pointData, error: pointError } = await supabase.from("wall_points").select("*").in("id", pointIds);
    if (pointError) throw pointError;

    const { data: photoData, error: photoError } = await supabase
      .from("point_photos")
      .select("*")
      .in("point_id", pointIds)
      .order("created_at", { ascending: false });
    if (photoError) throw photoError;

    const pointOrder = new Map(pointIds.map((id, index) => [id, index]));
    const points = (pointData || []).sort((a, b) => (pointOrder.get(a.id) || 0) - (pointOrder.get(b.id) || 0));

    return sendJson(res, 200, { ok: true, source: "proxy", worker, tasks: tasks || [], points, photos: photoData || [] });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
