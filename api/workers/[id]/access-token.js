const { classifyError, methodNotAllowed, nowIso, requireSupabase, sendJson } = require("../../_shared");

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function token() {
  let body = "";
  for (let index = 0; index < 12; index += 1) body += CHARS[Math.floor(Math.random() * CHARS.length)];
  return `tk_${body}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") return methodNotAllowed(res, ["PATCH"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const accessToken = token();
    const { data, error } = await supabase
      .from("workers")
      .update({ access_token: accessToken, updated_at: nowIso() })
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
