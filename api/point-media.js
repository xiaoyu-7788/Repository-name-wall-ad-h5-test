const { classifyError, methodNotAllowed, requireSupabase, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("point_photos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: data || [] });
    }

    return methodNotAllowed(res, ["GET"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
