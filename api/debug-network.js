const { getSafeSupabaseEnv, methodNotAllowed, sendJson } = require("./_shared");

function makeResult(name, ok, detail = "", extra = {}) {
  return { name, ok, detail, ...extra };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const env = getSafeSupabaseEnv();
  const tests = [
    makeResult("SUPABASE_URL", env.has_SUPABASE_URL, env.has_SUPABASE_URL ? "exists" : "missing"),
    makeResult(
      "SUPABASE_SERVICE_ROLE_KEY",
      env.has_SUPABASE_SERVICE_ROLE_KEY,
      env.has_SUPABASE_SERVICE_ROLE_KEY ? "exists" : "missing",
    ),
  ];

  let supabaseOrigin = "";
  try {
    supabaseOrigin = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "";
    tests.push(makeResult("SUPABASE_URL_FORMAT", Boolean(supabaseOrigin), supabaseOrigin ? "valid" : "missing"));
  } catch (error) {
    tests.push(makeResult("SUPABASE_URL_FORMAT", false, "invalid", {
      error_name: error?.name || "",
      error_message: error?.message || String(error || ""),
    }));
  }

  if (supabaseOrigin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const response = await fetchWithTimeout(`${supabaseOrigin}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      tests.push(makeResult("SUPABASE_REST_REACHABLE", response.status < 500, "fetch completed", {
        status: response.status,
        status_text: response.statusText,
      }));
    } catch (error) {
      tests.push(makeResult("SUPABASE_REST_REACHABLE", false, "fetch failed", {
        error_name: error?.name || "",
        error_message: error?.message || String(error || ""),
      }));
    }
  } else {
    tests.push(makeResult("SUPABASE_REST_REACHABLE", false, "skipped: missing server env"));
  }

  return sendJson(res, 200, {
    ok: tests.every((test) => test.ok),
    env,
    tests,
  });
};
