const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function normalizeMaterialRules(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function buildProjectRow(project = {}) {
  return {
    id: project.id || project.name || uid("project"),
    name: project.name || project.id || "新项目",
    client: project.client || project.customer || "",
    month: project.month || project.year_month || "",
    color: project.color || "#2563eb",
    hidden: Boolean(project.hidden),
    archived: Boolean(project.archived),
    material_rules: normalizeMaterialRules(project.materialRules || project.material_rules),
    updated_at: nowIso(),
    created_at: project.created_at || nowIso(),
  };
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: data || [] });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const project = body.project || body;
      const row = buildProjectRow(project);
      const { data, error } = await supabase.from("projects").upsert(row, { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
