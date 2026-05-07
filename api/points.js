const { classifyError, listState, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    if (req.method === "GET") {
      const state = await listState(supabase);
      return sendJson(res, 200, { ok: true, ...state });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const points = Array.isArray(body.points) ? body.points : Array.isArray(body) ? body : [body.point || body].filter(Boolean);
      if (!points.length) return sendJson(res, 400, { ok: false, error: "INVALID_POINTS", detail: "没有可写入的点位。" });
      const { error } = await supabase.from("wall_points").upsert(points.map((point) => ({ ...point, updated_at: point.updated_at || nowIso() })), { onConflict: "id" });
      if (error) throw error;
      return sendJson(res, 200, { ok: true, count: points.length });
    }

    if (req.method === "PATCH") {
      const body = parseBody(req);
      if (body.project_name_from && body.project_name_to) {
        const { error } = await supabase
          .from("wall_points")
          .update({ project_name: body.project_name_to, updated_at: nowIso() })
          .eq("project_name", body.project_name_from);
        if (error) throw error;
        return sendJson(res, 200, { ok: true });
      }

      if (!body.id && !body.point_id) {
        return sendJson(res, 400, { ok: false, error: "POINT_ID_REQUIRED", detail: "缺少 point_id。" });
      }

      const id = body.id || body.point_id;
      const changes = { ...(body.changes || body) };
      delete changes.id;
      delete changes.point_id;
      delete changes.changes;
      changes.updated_at = changes.updated_at || nowIso();
      if (changes.status === "已完成" && !changes.completed_at) changes.completed_at = nowIso();
      if (changes.status && changes.status !== "已完成") changes.completed_at = null;

      const { error } = await supabase.from("wall_points").update(changes).eq("id", id);
      if (error) throw error;
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "PATCH"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
