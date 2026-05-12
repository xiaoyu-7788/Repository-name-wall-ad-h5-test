const { classifyError, getSupabaseAdmin, methodNotAllowed, sendJson } = require("./_shared");

function text(value) {
  return String(value || "").trim();
}

function includesText(value, keyword) {
  const source = text(value).toLowerCase();
  const target = text(keyword).toLowerCase();
  return Boolean(source && target && source.includes(target));
}

function isLiSignal(value) {
  const key = text(value);
  return key === "li" || key === "w2" || key.includes("李") || key.includes("工002");
}

function isZhangSignal(value) {
  const key = text(value);
  return key === "zhang" || key === "w1" || key.includes("张") || key.includes("工001");
}

function matchWorker(worker, query) {
  const key = text(query);
  const candidates = [worker.id, worker.code, worker.worker_key, worker.slug].map(text).filter(Boolean);
  const workerName = text(worker.name);
  const workerCarNo = text(worker.car_no || worker.carNo);
  if (candidates.includes(key)) return true;
  if (text(worker.phone) === key) return true;
  if (isLiSignal(key) && (includesText(workerName, "李") || includesText(workerCarNo, "工002"))) return true;
  if (isZhangSignal(key) && (includesText(workerName, "张") || includesText(workerCarNo, "工001"))) return true;
  return false;
}

function fallbackWorker(query) {
  const key = text(query);
  if (isLiSignal(key)) {
    return { id: "w2", code: "li", worker_key: "li", slug: "li", name: "李师傅", source: "payload_fallback" };
  }
  if (isZhangSignal(key)) {
    return { id: "w1", code: "zhang", worker_key: "zhang", slug: "zhang", name: "张师傅", source: "payload_fallback" };
  }
  return key ? { id: key, code: key, worker_key: key, slug: key, name: "", source: "payload_fallback" } : null;
}

async function findWorker(supabase, query) {
  try {
    const result = await supabase.from("workers").select("*").limit(1000);
    if (result.error) throw result.error;
    return (result.data || []).find((worker) => matchWorker(worker, query)) || fallbackWorker(query);
  } catch {
    return fallbackWorker(query);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const setup = getSupabaseAdmin();
  if (!setup.client) {
    return sendJson(res, 500, { ok: false, error: "SERVER_ENV_MISSING", detail: "数据库服务未连接，请检查 Vercel 的 Supabase 环境变量和依赖安装。" });
  }
  const supabase = setup.client;

  try {
    const workerQuery = req.query.workerId || req.query.worker_id || req.query.worker || req.query.code || req.query.workerIdOrSlug || req.query.workerIdOrToken || "";
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
