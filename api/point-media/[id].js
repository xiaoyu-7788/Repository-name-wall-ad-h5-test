const { classifyError, methodNotAllowed, parseBody, requireSupabase, sendJson } = require("../_shared");

module.exports = async function handler(req, res) {
  if (!["PUT", "PATCH", "POST"].includes(req.method)) return methodNotAllowed(res, ["PUT", "PATCH", "POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    const changes = {};
    if (body.kind) changes.kind = body.kind;
    if (body.media_kind) changes.media_kind = body.media_kind;
    const { data, error } = await supabase.from("point_photos").update(changes).eq("id", req.query.id).select("*").single();
    if (error) throw error;
    return sendJson(res, 200, { ok: true, data });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
