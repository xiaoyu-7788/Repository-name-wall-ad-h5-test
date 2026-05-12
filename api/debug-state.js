const { classifyError, listState, methodNotAllowed, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const state = await listState(supabase);
    return sendJson(res, 200, { ok: true, data: state });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
