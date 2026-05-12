const { classifyError, ensureDemoData, listState, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  const action = String(req.query.action || "debug-state").toLowerCase();

  try {
    if (action === "debug-state") {
      if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
      const state = await listState(supabase);
      return sendJson(res, 200, { ok: true, data: state });
    }

    if (action === "track-logs") {
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
    }

    if (action === "import-demo" || action === "reset-demo") {
      if (!["POST", "GET"].includes(req.method)) return methodNotAllowed(res, ["POST", "GET"]);
      const counts = await ensureDemoData(supabase);
      const state = await listState(supabase);
      return sendJson(res, 200, { ok: true, data: { counts, ...state } });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
