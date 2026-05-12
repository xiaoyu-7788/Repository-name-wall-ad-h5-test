const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    const pointId = body.pointId || body.point_id || req.query.pointId || req.query.point_id;
    if (!pointId) return sendJson(res, 400, { ok: false, error: "POINT_ID_REQUIRED", detail: "缺少 pointId。" });
    const completedAt = nowIso();
    const { error: pointError } = await supabase
      .from("wall_points")
      .update({ status: "已完成", completed_at: completedAt, updated_at: completedAt })
      .eq("id", pointId);
    if (pointError) throw pointError;
    await supabase.from("dispatch_tasks").update({ status: "已完成", completed_at: completedAt }).eq("point_id", pointId);
    return sendJson(res, 200, { ok: true, data: { id: pointId, status: "已完成" } });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
