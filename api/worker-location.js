const { classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function text(value) {
  return String(value || "").trim();
}

function matchWorker(worker, query) {
  const key = text(query);
  const candidates = [worker.access_token, worker.id, worker.code, worker.worker_key, worker.slug, worker.phone].map(text).filter(Boolean);
  return candidates.includes(key);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    const workerId = body.workerId || body.worker_id;
    const lng = Number(body.lng);
    const lat = Number(body.lat);
    if (!workerId || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      return sendJson(res, 400, { ok: false, error: "INVALID_LOCATION", detail: "缺少 workerId、lng 或 lat。" });
    }

    const workersResult = await supabase.from("workers").select("*").limit(1000);
    if (workersResult.error) throw workersResult.error;
    const worker = (workersResult.data || []).find((item) => matchWorker(item, workerId));
    if (!worker) return sendJson(res, 404, { ok: false, error: "WORKER_NOT_FOUND", detail: "未找到该师傅。" });
    if (worker.enabled === false) return sendJson(res, 403, { ok: false, error: "WORKER_DISABLED", detail: "该师傅链接已停用，请联系管理员。" });

    const timestamp = body.timestamp || nowIso();
    const speed = Number(body.speed || 0);
    const moving = body.moving === undefined ? speed > 3 : Boolean(body.moving);
    const stoppedSeconds = Number(body.stoppedSeconds || body.stopped_seconds || 0);

    const { data: updatedWorker, error: workerError } = await supabase
      .from("workers")
      .update({
        lng,
        lat,
        accuracy: Number(body.accuracy || 0),
        speed,
        heading: body.heading == null ? null : Number(body.heading),
        moving,
        stopped_seconds: stoppedSeconds,
        online: true,
        last_seen_at: timestamp,
        last_online_at: worker.last_online_at || timestamp,
        last_location_at: timestamp,
        updated_at: nowIso(),
      })
      .eq("id", worker.id)
      .select("*")
      .single();
    if (workerError) throw workerError;

    const trackLog = {
      id: uid("track"),
      worker_id: worker.id,
      worker_name: worker.name,
      event: body.event || (moving ? "实时定位" : "定位停车"),
      speed,
      stop_minutes: Math.round(stoppedSeconds / 60),
      lng,
      lat,
      project_name: body.project_name || worker.project_name || "",
      recorded_at: timestamp,
      created_at: nowIso(),
    };
    await supabase.from("track_logs").insert(trackLog);

    return sendJson(res, 200, { ok: true, data: { worker: updatedWorker, location: { id: trackLog.id, ...body, lng, lat } } });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
