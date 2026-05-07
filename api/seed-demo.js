const { ensureDemoData, listState, methodNotAllowed, requireSupabase, sendJson, classifyError } = require("./_shared");

module.exports = async function handler(req, res) {
  if (!["POST", "GET"].includes(req.method)) return methodNotAllowed(res, ["POST", "GET"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const counts = await ensureDemoData(supabase);
    const state = await listState(supabase);
    return sendJson(res, 200, { ok: true, counts, ...state });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
