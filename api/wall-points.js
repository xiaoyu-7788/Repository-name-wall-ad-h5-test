const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("wall_points").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: data || [] });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const point = body.point || body;
      const row = {
        ...point,
        id: point.id || `point_${Date.now()}`,
        title: point.title || point.k_code || "新点位",
        status: point.status || "待派单",
        updated_at: nowIso(),
        created_at: point.created_at || nowIso(),
      };
      const { data, error } = await supabase.from("wall_points").upsert(row, { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
