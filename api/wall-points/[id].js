const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("../_shared");

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const id = req.query.id;

    if (req.method === "PUT" || req.method === "PATCH") {
      const changes = { ...parseBody(req), updated_at: nowIso() };
      delete changes.id;
      const { data, error } = await supabase.from("wall_points").update(changes).eq("id", id).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase.from("wall_points").delete().eq("id", id);
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: { id, deleted: true } });
    }

    return methodNotAllowed(res, ["PUT", "PATCH", "DELETE"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
