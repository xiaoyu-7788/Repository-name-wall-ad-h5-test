const { classifyError, methodNotAllowed, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const { data, error } = await supabase.from("workers").select("*").order("name");
    if (error) throw error;
    return sendJson(res, 200, { ok: true, workers: data || [] });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
