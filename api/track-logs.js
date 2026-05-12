const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("track_logs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: data || [] });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const row = { id: body.id || uid("track"), ...body, created_at: body.created_at || nowIso() };
      const { data, error } = await supabase.from("track_logs").insert(row).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
