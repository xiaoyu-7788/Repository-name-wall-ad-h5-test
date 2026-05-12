const { getSafeSupabaseEnv, sendJson } = require("./_shared");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED", detail: "Method not allowed." });
  }

  return sendJson(res, 200, {
    ok: true,
    data: {
      ok: true,
      mode: "vercel-api",
      label: "Vercel Serverless API",
      storageMode: "supabase",
      ...getSafeSupabaseEnv(),
    },
  });
};
