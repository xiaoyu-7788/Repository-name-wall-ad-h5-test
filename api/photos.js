const { classifyError, methodNotAllowed, parseBody, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") return methodNotAllowed(res, ["PATCH"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    if (!body.id || !body.kind) {
      return sendJson(res, 400, { ok: false, error: "INVALID_PHOTO_UPDATE", detail: "缺少照片 id 或 kind。" });
    }
    const { error } = await supabase.from("point_photos").update({ kind: body.kind }).eq("id", body.id);
    if (error) throw error;
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
