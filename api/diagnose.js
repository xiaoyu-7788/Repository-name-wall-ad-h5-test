const { STORAGE_BUCKET, classifyError, getSupabaseAdmin, sendJson } = require("./_shared");

async function runCheck(name, fn) {
  try {
    await fn();
    return { name, ok: true, category: "通过", detail: "检查通过" };
  } catch (error) {
    const issue = classifyError(error);
    return { name, ok: false, category: issue.category, detail: issue.detail };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const setup = getSupabaseAdmin();
  const checks = [
    { name: "SUPABASE_URL", ok: setup.env.hasSupabaseUrl, category: setup.env.hasSupabaseUrl ? "通过" : "未配置", detail: setup.env.hasSupabaseUrl ? "服务端已读取" : "服务端未读取到 SUPABASE_URL" },
    { name: "SUPABASE_SERVICE_ROLE_KEY", ok: setup.env.hasServiceRoleKey, category: setup.env.hasServiceRoleKey ? "通过" : "未配置", detail: setup.env.hasServiceRoleKey ? "服务端已读取" : "服务端未读取到 SUPABASE_SERVICE_ROLE_KEY" },
  ];

  if (!setup.client) {
    return sendJson(res, 200, { ok: false, mode: "proxy", checks });
  }

  for (const table of ["workers", "wall_points", "dispatch_tasks", "point_photos"]) {
    checks.push(await runCheck(`${table} 表读取`, () => setup.client.from(table).select("id", { count: "exact", head: true })));
  }

  checks.push(await runCheck(`${STORAGE_BUCKET} bucket 存在`, () => setup.client.storage.getBucket(STORAGE_BUCKET)));

  return sendJson(res, 200, {
    ok: checks.every((check) => check.ok),
    mode: "proxy",
    checks,
  });
};
