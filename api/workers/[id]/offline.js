const { classifyError, methodNotAllowed, nowIso, requireSupabase, sendJson } = require("../../_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const timestamp = nowIso();
    const { data, error } = await supabase
      .from("workers")
      .update({ online: false, last_offline_at: timestamp, updated_at: timestamp })
      .eq("id", req.query.id)
      .select("*")
      .single();
    if (error) throw error;
    return sendJson(res, 200, { ok: true, data });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
