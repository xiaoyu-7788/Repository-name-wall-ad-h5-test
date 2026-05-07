const { STORAGE_BUCKET, classifyError, methodNotAllowed, nowIso, parseBody, requireSupabase, sendJson, uid } = require("./_shared");

function getPublicUrl(supabase, path) {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const body = parseBody(req);
    const pointId = body.point_id;
    const workerId = body.worker_id;
    const fileName = body.file_name || "upload.jpg";
    const contentType = body.content_type || "application/octet-stream";
    const base64 = String(body.base64 || "").replace(/^data:[^;]+;base64,/, "");

    if (!pointId || !workerId || !base64) {
      return sendJson(res, 400, { ok: false, error: "INVALID_UPLOAD", detail: "缺少 point_id、worker_id 或 base64 文件内容。" });
    }

    const safeName = fileName.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_");
    const path = `${pointId}/${workerId}/${Date.now()}_${Math.random().toString(16).slice(2)}_${safeName}`;
    const buffer = Buffer.from(base64, "base64");

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const publicUrl = getPublicUrl(supabase, path);
    const kind = body.kind || (contentType.startsWith("video/") ? "现场视频" : "现场照片");

    const { error: photoError } = await supabase.from("point_photos").insert({
      id: uid("photo"),
      point_id: pointId,
      worker_id: workerId,
      url: publicUrl,
      file_name: fileName,
      kind,
      created_at: nowIso(),
    });
    if (photoError) throw photoError;

    const { error: pointError } = await supabase
      .from("wall_points")
      .update({ status: "已完成", completed_at: nowIso(), updated_at: nowIso() })
      .eq("id", pointId);
    if (pointError) throw pointError;

    const { error: taskError } = await supabase
      .from("dispatch_tasks")
      .update({ status: "已完成" })
      .eq("point_id", pointId)
      .eq("worker_id", workerId);
    if (taskError) throw taskError;

    return sendJson(res, 200, { ok: true, url: publicUrl, path });
  } catch (error) {
    const issue = classifyError(error);
    return sendJson(res, 500, { ok: false, error: issue.category, detail: issue.detail });
  }
};
