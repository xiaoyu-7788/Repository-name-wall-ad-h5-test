const { classifyError, methodNotAllowed, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const workerQuery = req.query.worker || req.query.worker_id || req.query.code || "";
    if (!workerQuery) return sendJson(res, 400, { ok: false, error: "WORKER_REQUIRED", detail: "缺少 worker 参数。" });

    const { data: workers, error: workerError } = await supabase
      .from("workers")
      .select("*")
      .or(`code.eq.${workerQuery},id.eq.${workerQuery}`)
      .limit(1);
    if (workerError) throw workerError;
    const worker = workers?.[0] || null;
    if (!worker) return sendJson(res, 200, { ok: true, worker: null, tasks: [], points: [], photos: [] });

    const { data: tasks, error: taskError } = await supabase
      .from("dispatch_tasks")
      .select("*")
      .eq("worker_id", worker.id)
      .order("created_at", { ascending: true });
    if (taskError) throw taskError;

    const pointIds = [...new Set((tasks || []).map((task) => task.point_id).filter(Boolean))];
    let points = [];
    let photos = [];
    if (pointIds.length) {
      const { data: pointData, error: pointError } = await supabase.from("wall_points").select("*").in("id", pointIds);
      if (pointError) throw pointError;
      points = pointData || [];
      const { data: photoData, error: photoError } = await supabase.from("point_photos").select("*").in("point_id", pointIds).order("created_at", { ascending: false });
      if (photoError) throw photoError;
      photos = photoData || [];
    }

    return sendJson(res, 200, { ok: true, worker, tasks: tasks || [], points, photos });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
