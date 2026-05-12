const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson } = require("../_shared");

function text(value) {
  return String(value || "").trim();
}

function matchWorker(worker, query) {
  const key = text(query);
  const candidates = [worker.access_token, worker.id, worker.code, worker.worker_key, worker.slug, worker.phone].map(text).filter(Boolean);
  return candidates.includes(key);
}

async function findWorker(supabase, query) {
  const { data, error } = await supabase.from("workers").select("*").limit(1000);
  if (error) throw error;
  return (data || []).find((worker) => matchWorker(worker, query)) || null;
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const id = req.query.id;

    if (req.method === "GET") {
      const worker = await findWorker(supabase, id);
      if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到该师傅。" });
      return sendJson(res, 200, { ok: true, data: worker });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const body = parseBody(req);
      const changes = {
        ...body,
        car_no: body.car_no || body.carNo,
        team_type: body.team_type || body.teamType,
        project_id: body.project_id || body.projectId,
        updated_at: nowIso(),
      };
      delete changes.carNo;
      delete changes.teamType;
      delete changes.projectId;
      const { data, error } = await supabase.from("workers").update(changes).eq("id", id).select("*").single();
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase.from("workers").delete().eq("id", id);
      if (error) throw error;
      return sendJson(res, 200, { ok: true, data: { id, deleted: true } });
    }

    return methodNotAllowed(res, ["GET", "PUT", "PATCH", "DELETE"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
