const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function pointRow(point = {}) {
  return {
    ...point,
    id: point.id || uid("point"),
    title: point.title || point.k_code || "新点位",
    status: point.status || "待派单",
    lng: point.lng == null || point.lng === "" ? null : Number(point.lng),
    lat: point.lat == null || point.lat === "" ? null : Number(point.lat),
    updated_at: nowIso(),
    created_at: point.created_at || nowIso(),
  };
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  const action = String(req.query.action || (req.method === "GET" ? "list" : req.method === "POST" ? "create" : "")).toLowerCase();

  try {
    if (action === "list") {
      const { data, error } = await supabase.from("wall_points").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: data || [] });
    }

    if (action === "create") {
      if (!["POST", "PUT", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["POST", "PUT", "PATCH"]);
      const body = parseBody(req);
      const { data, error } = await supabase.from("wall_points").upsert(pointRow(body.point || body), { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (action === "update") {
      if (!["POST", "PUT", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["POST", "PUT", "PATCH"]);
      const id = req.query.id;
      const body = parseBody(req);
      const row = pointRow({ ...(body.point || body), id });
      const { data, error } = await supabase.from("wall_points").upsert(row, { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (action === "delete") {
      if (!["POST", "DELETE"].includes(req.method)) return methodNotAllowed(res, ["POST", "DELETE"]);
      const id = req.query.id || parseBody(req).id;
      const { error } = await supabase.from("wall_points").delete().eq("id", id);
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: { id, deleted: true } });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT", "PATCH", "DELETE"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
