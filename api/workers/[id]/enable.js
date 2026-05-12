const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("../../_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") return methodNotAllowed(res, ["PATCH"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    const enabled = body.enabled !== false;
    const updates = { enabled, online: false, updated_at: nowIso() };
    if (!enabled) updates.last_offline_at = nowIso();
    const { data, error } = await supabase.from("workers").update(updates).eq("id", req.query.id).select("*").single();
    if (error) throw error;
    return sendJson(res, 200, { ok: true, data });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
