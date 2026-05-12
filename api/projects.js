const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function normalizeMaterialRules(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  }
}

function projectRow(project = {}, existing = {}) {
  return {
    id: project.id || existing.id || project.name || uid("project"),
    name: project.name || existing.name || project.id || "新项目",
    client: project.client || project.customer || existing.client || "",
    month: project.month || project.year_month || existing.month || "",
    color: project.color || existing.color || "#2563eb",
    hidden: Boolean(project.hidden ?? existing.hidden),
    archived: Boolean(project.archived ?? existing.archived),
    material_rules: normalizeMaterialRules(project.materialRules || project.material_rules || existing.material_rules),
    updated_at: nowIso(),
    created_at: project.created_at || existing.created_at || nowIso(),
  };
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  const action = String(req.query.action || (req.method === "GET" ? "list" : req.method === "POST" ? "create" : "")).toLowerCase();

  try {
    if (action === "list") {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: data || [] });
    }

    if (action === "detail") {
      const id = req.query.id;
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return sendJson(res, 404, { ok: false, error: "PROJECT_NOT_FOUND", detail: "未找到项目。" });
      return sendJson(res, 200, { ok: true, data });
    }

    if (action === "create") {
      if (!["POST", "PUT", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["POST", "PUT", "PATCH"]);
      const body = parseBody(req);
      const row = projectRow(body.project || body);
      const { data, error } = await supabase.from("projects").upsert(row, { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (action === "update") {
      if (!["POST", "PUT", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["POST", "PUT", "PATCH"]);
      const id = req.query.id;
      const body = parseBody(req);
      const row = projectRow({ ...(body.project || body), id });
      const { data, error } = await supabase.from("projects").upsert(row, { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (action === "delete") {
      if (!["POST", "DELETE"].includes(req.method)) return methodNotAllowed(res, ["POST", "DELETE"]);
      const id = req.query.id || parseBody(req).id;
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: { id, deleted: true } });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT", "PATCH", "DELETE"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
