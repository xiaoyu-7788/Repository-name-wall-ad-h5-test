const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    const workerId = body.worker_id;
    const pointIds = [...new Set(body.point_ids || [])];
    if (!workerId || !pointIds.length) {
      return sendJson(res, 400, { ok: false, error: "INVALID_DISPATCH", detail: "缺少 worker_id 或 point_ids。" });
    }

    const { data: existing, error: existingError } = await supabase
      .from("dispatch_tasks")
      .select("worker_id,point_id")
      .eq("worker_id", workerId)
      .in("point_id", pointIds);
    if (existingError) throw existingError;

    const existingKeys = new Set((existing || []).map((task) => `${task.worker_id}:${task.point_id}`));
    const tasks = pointIds
      .filter((pointId) => !existingKeys.has(`${workerId}:${pointId}`))
      .map((pointId) => ({ id: uid("task"), worker_id: workerId, point_id: pointId, status: "已派发", created_at: nowIso() }));

    if (tasks.length) {
      const { error: insertError } = await supabase.from("dispatch_tasks").insert(tasks);
      if (insertError) throw insertError;
    }

    const { error: updateError } = await supabase
      .from("wall_points")
      .update({ status: "施工中", updated_at: nowIso() })
      .in("id", pointIds)
      .neq("status", "已完成");
    if (updateError) throw updateError;

    return sendJson(res, 200, { ok: true, inserted: tasks.length, skipped: pointIds.length - tasks.length });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
