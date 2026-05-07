const { getSafeSupabaseEnv, getSupabaseAdmin, methodNotAllowed, sendJson } = require("./_shared");

async function inspectTable(supabase, table) {
  try {
    const result = await supabase.from(table).select("*").limit(3);
    if (result.error) throw result.error;
    const rows = result.data || [];
    const fields = [...new Set(rows.flatMap((row) => Object.keys(row || {})))].sort();
    return {
      table,
      ok: true,
      sample_count: rows.length,
      fields,
    };
  } catch (error) {
    return {
      table,
      ok: false,
      sample_count: 0,
      fields: [],
      error_name: error?.name || "",
      error_message: error?.message || String(error || ""),
    };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const setup = getSupabaseAdmin();
  const env = getSafeSupabaseEnv();
  if (!setup.client) {
    return sendJson(res, 200, {
      ok: false,
      env,
      tables: [],
      message: `服务端环境变量缺失：${setup.missing.join(", ")}`,
    });
  }

  const tables = await Promise.all([
    inspectTable(setup.client, "workers"),
    inspectTable(setup.client, "dispatch_tasks"),
    inspectTable(setup.client, "wall_points"),
  ]);

  return sendJson(res, 200, {
    ok: tables.every((item) => item.ok),
    env,
    tables,
  });
};
