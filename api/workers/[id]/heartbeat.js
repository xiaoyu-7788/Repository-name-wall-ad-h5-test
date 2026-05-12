const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("../../_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    const timestamp = nowIso();
    const updates = { online: true, last_seen_at: timestamp, last_online_at: timestamp, updated_at: timestamp };
    if (body.lng != null && body.lat != null) {
      updates.lng = Number(body.lng);
      updates.lat = Number(body.lat);
    }
    const { data, error } = await supabase.from("workers").update(updates).eq("id", req.query.id).select("*").single();
    if (error) throw error;
    return sendJson(res, 200, { ok: true, data });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
