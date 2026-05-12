const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

const DEFAULT_POINT_STATUS = "\u5f85\u6d3e\u5355";
const DEFAULT_POINT_TITLE = "\u65b0\u70b9\u4f4d";

function firstValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function pickPointPayload(input = {}) {
  return input.point && typeof input.point === "object" ? input.point : input;
}

function pointRow(input = {}, fixedId = "") {
  const point = pickPointPayload(input);
  const title = firstValue(point.point_code, point.title, point.code, point.k_code, DEFAULT_POINT_TITLE);
  return {
    id: firstValue(fixedId, point.id, uid("point")),
    title,
    address: firstValue(point.address, point.addr),
    city: firstValue(point.city),
    landlord_name: firstValue(point.landlord_name, point.landlordName),
    landlord_phone: firstValue(point.landlord_phone, point.landlordPhone),
    captain_name: firstValue(point.install_captain_name, point.captain_name, point.captainName, point.leader_name),
    captain_phone: firstValue(point.install_captain_phone, point.captain_phone, point.captainPhone, point.leader_phone),
    scout_name: firstValue(point.wall_team_name, point.scout_name, point.scoutName, point.finder_name),
    scout_phone: firstValue(point.wall_team_phone, point.scout_phone, point.scoutPhone, point.finder_phone),
    k_code: firstValue(point.k_code, point.kCode, title),
    project_name: firstValue(point.project_name, point.projectName, point.project_id, point.projectId),
    status: firstValue(point.status, DEFAULT_POINT_STATUS),
    tags: Array.isArray(point.tags) ? point.tags.join(",") : firstValue(point.tags),
    lng: numberOrNull(point.lng ?? point.longitude),
    lat: numberOrNull(point.lat ?? point.latitude),
    completed_at: firstValue(point.completed_at, point.completedAt) || null,
    updated_at: nowIso(),
    created_at: firstValue(point.created_at, point.createdAt) || nowIso(),
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
      const { data, error } = await supabase.from("wall_points").upsert(pointRow(body), { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (action === "update") {
      if (!["POST", "PUT", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["POST", "PUT", "PATCH"]);
      const id = req.query.id;
      const body = parseBody(req);
      const row = pointRow(body, id);
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
