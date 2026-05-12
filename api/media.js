const { STORAGE_BUCKET, classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function getPublicUrl(supabase, path) {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

async function listMedia(supabase, res) {
  const { data, error } = await supabase.from("point_photos").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data: data || [] });
}

async function updateKind(supabase, req, res) {
  const body = parseBody(req);
  const id = req.query.id || body.id;
  const changes = {};
  if (body.kind) changes.kind = body.kind;
  if (body.media_kind) changes.media_kind = body.media_kind;
  const { data, error } = await supabase.from("point_photos").update(changes).eq("id", id).select("*").single();
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data });
}

async function uploadBase64(supabase, req, res) {
  const body = parseBody(req);
  const pointId = req.query.pointId || body.point_id || body.pointId;
  const workerId = body.worker_id || body.workerId;
  const fileName = body.file_name || "upload.jpg";
  const contentType = body.content_type || "application/octet-stream";
  const base64 = String(body.base64 || "").replace(/^data:[^;]+;base64,/, "");
  if (!pointId || !workerId || !base64) return sendJson(res, 400, { ok: false, error: "INVALID_UPLOAD", detail: "缺少 point_id、worker_id 或 base64 文件内容。" });

  const safeName = fileName.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_");
  const storagePath = `${pointId}/${workerId}/${Date.now()}_${Math.random().toString(16).slice(2)}_${safeName}`;
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, Buffer.from(base64, "base64"), { contentType, cacheControl: "3600", upsert: false });
  if (uploadError) throw uploadError;
  const publicUrl = getPublicUrl(supabase, storagePath);
  const record = {
    id: uid("media"),
    point_id: pointId,
    worker_id: workerId,
    url: publicUrl,
    file_name: fileName,
    kind: body.kind || (contentType.startsWith("video/") ? "视频" : "现场照片"),
    content_type: contentType,
    storage_path: storagePath,
    created_at: nowIso(),
  };
  const { data, error } = await supabase.from("point_photos").insert(record).select("*").single();
  if (error) throw error;
  return sendJson(res, 200, { ok: true, data, url: publicUrl, path: storagePath });
}

module.exports = async function handler(req, res) {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  const action = String(req.query.action || (req.method === "GET" ? "list" : "")).toLowerCase();

  try {
    if (action === "list") return listMedia(supabase, res);
    if (action === "update") {
      if (!["POST", "PUT", "PATCH"].includes(req.method)) return methodNotAllowed(res, ["POST", "PUT", "PATCH"]);
      return updateKind(supabase, req, res);
    }
    if (action === "upload") {
      if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
      return uploadBase64(supabase, req, res);
    }
    return methodNotAllowed(res, ["GET", "POST", "PUT", "PATCH"]);
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
