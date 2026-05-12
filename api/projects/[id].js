const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("../_shared");

function normalizeMaterialRules(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function buildProjectChanges(project = {}) {
  const changes = {
    ...project,
    updated_at: nowIso(),
  };
  delete changes.id;
  delete changes.project;
  delete changes.materialRules;
  const materialRules = normalizeMaterialRules(project.materialRules || project.material_rules);
  if (materialRules) changes.material_rules = materialRules;
  if (project.customer && !project.client) changes.client = project.customer;
  if (project.year_month && !project.month) changes.month = project.year_month;
  return changes;
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const id = req.query.id;

    if (req.method === "GET") {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return sendJson(res, 404, { ok: false, error: "PROJECT_NOT_FOUND", detail: "未找到项目。" });
      return sendJson(res, 200, { ok: true, data });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const body = parseBody(req);
      const project = body.project || body;
      const { data, error } = await supabase
        .from("projects")
        .update(buildProjectChanges(project))
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: { id, deleted: true } });
    }

    return methodNotAllowed(res, ["GET", "PUT", "PATCH", "DELETE"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
