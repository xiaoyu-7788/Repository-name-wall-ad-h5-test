const { getSafeSupabaseEnv, getSupabaseAdmin, methodNotAllowed, nowIso, parseBody, sendJson, uid } = require("./_shared");

const STATUS_IN_PROGRESS = "施工中";

function describeError(error) {
  return {
    error_name: error?.name || "",
    error_message: error?.message || String(error || ""),
  };
}

function fail(res, status, stage, message, details = "", payload = undefined, extra = {}) {
  return sendJson(res, status, {
    ok: false,
    stage,
    message,
    details,
    ...extra,
    ...(payload ? { payload } : {}),
  });
}

function normalizeIds(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(list.map((item) => String(item || "").trim()).filter(Boolean))];
}

function text(value) {
  return String(value || "").trim();
}

function includesText(value, keyword) {
  const source = text(value).toLowerCase();
  const target = text(keyword).toLowerCase();
  return Boolean(source && target && source.includes(target));
}

function isLiSignal(...values) {
  return values.map(text).some((value) => value === "li" || value === "w2" || value.includes("李") || value.includes("工002"));
}

function isZhangSignal(...values) {
  return values.map(text).some((value) => value === "zhang" || value === "w1" || value.includes("张") || value.includes("工001"));
}

function matchWorker(worker, workerId, workerKey, workerName, workerPhone) {
  const id = text(workerId);
  const key = text(workerKey);
  const name = text(workerName);
  const phone = text(workerPhone);
  const candidates = [worker.id, worker.code, worker.worker_key, worker.slug].map(text).filter(Boolean);
  const workerNameValue = text(worker.name);
  const workerCarNo = text(worker.car_no || worker.carNo);

  if (id && candidates.includes(id)) return true;
  if (key && candidates.includes(key)) return true;
  if (name && (includesText(workerNameValue, name) || includesText(name, workerNameValue))) return true;
  if (phone && text(worker.phone) === phone) return true;
  if (isLiSignal(id, key, name, phone) && (includesText(workerNameValue, "李") || includesText(workerCarNo, "工002"))) return true;
  if (isZhangSignal(id, key, name, phone) && (includesText(workerNameValue, "张") || includesText(workerCarNo, "工001"))) return true;
  return false;
}

function fallbackWorker(workerId, workerKey, workerName, workerPhone) {
  const id = text(workerId);
  const key = text(workerKey);
  const name = text(workerName);
  const phone = text(workerPhone);
  const fallbackId = id || (isLiSignal(key, name, phone) ? "w2" : isZhangSignal(key, name, phone) ? "w1" : "");
  if (!fallbackId) return null;
  return {
    id: fallbackId,
    code: key || fallbackId,
    worker_key: key || fallbackId,
    slug: key || fallbackId,
    name: name || (fallbackId === "w2" ? "李师傅" : fallbackId === "w1" ? "张师傅" : ""),
    phone,
    source: "payload_fallback",
  };
}

async function readWorkers(supabase) {
  const query = supabase.from("workers").select("*");
  if (typeof query.limit === "function") return query.limit(1000);
  return query;
}

async function resolveWorker(supabase, workerId, workerKey, workerName, workerPhone) {
  try {
    const result = await readWorkers(supabase);
    if (result.error) throw result.error;
    const workers = result.data || [];
    const worker = workers.find((item) => matchWorker(item, workerId, workerKey, workerName, workerPhone));
    return {
      worker: worker || fallbackWorker(workerId, workerKey, workerName, workerPhone),
      workers_error: null,
      worker_lookup_source: worker ? "workers_table" : "payload_fallback",
    };
  } catch (error) {
    return {
      worker: fallbackWorker(workerId, workerKey, workerName, workerPhone),
      workers_error: error,
      worker_lookup_source: "payload_fallback_after_workers_error",
    };
  }
}

function isColumnError(error) {
  const message = String(error?.message || "");
  return /assigned_at|created_at|id|schema cache|column/i.test(message);
}

async function deleteExistingTasks(supabase, workerId, pointIds) {
  const result = await supabase
    .from("dispatch_tasks")
    .delete()
    .eq("worker_id", workerId)
    .in("point_id", pointIds);
  if (result.error) throw result.error;
  return result.data || [];
}

async function insertTasks(supabase, tasks) {
  const attempts = [
    {
      label: "with_id_assigned_at_created_at",
      rows: tasks.map((task) => ({ ...task })),
    },
    {
      label: "with_id_minimal",
      rows: tasks.map(({ id, worker_id, point_id, status }) => ({ id, worker_id, point_id, status })),
    },
    {
      label: "minimal",
      rows: tasks.map(({ worker_id, point_id, status }) => ({ worker_id, point_id, status })),
    },
  ];

  let lastError = null;
  for (const attempt of attempts) {
    const result = await supabase.from("dispatch_tasks").insert(attempt.rows).select("*");
    if (!result.error) return { data: result.data || attempt.rows, insert_variant: attempt.label };
    lastError = result.error;
    if (!isColumnError(result.error)) break;
  }
  throw lastError;
}

async function updatePoints(supabase, pointIds) {
  const withUpdatedAt = await supabase
    .from("wall_points")
    .update({ status: STATUS_IN_PROGRESS, updated_at: nowIso() })
    .in("id", pointIds)
    .select("id");
  if (!withUpdatedAt.error) return { data: withUpdatedAt.data || [], update_variant: "with_updated_at" };

  const message = String(withUpdatedAt.error.message || "");
  if (!/updated_at|schema cache|column/i.test(message)) throw withUpdatedAt.error;

  const fallback = await supabase
    .from("wall_points")
    .update({ status: STATUS_IN_PROGRESS })
    .in("id", pointIds)
    .select("id");
  if (fallback.error) throw fallback.error;
  return { data: fallback.data || [], update_variant: "status_only" };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const setup = getSupabaseAdmin();
  if (!setup.client) {
    return fail(res, 500, "server_env", "服务端 Supabase 环境变量缺失。", `缺少：${setup.missing.join(", ")}`, undefined, {
      env: getSafeSupabaseEnv(),
    });
  }
  const supabase = setup.client;

  const body = parseBody(req);
  const workerId = body.worker_id || body.workerId || "";
  const workerKey = body.worker_key || body.worker || body.worker_code || body.code || "";
  const workerName = body.worker_name || body.workerName || "";
  const workerPhone = body.worker_phone || body.workerPhone || body.phone || "";
  const pointIds = normalizeIds(body.point_ids || body.pointIds || body.points);
  const debugPayload = {
    worker_id: workerId,
    worker_key: workerKey,
    worker_name: workerName,
    worker_phone: workerPhone,
    point_ids: pointIds,
  };

  if (!pointIds.length) {
    return fail(res, 400, "validate_payload", "point_ids 不能为空。", "请求需要包含 point_ids 数组。", debugPayload);
  }

  const lookup = await resolveWorker(supabase, workerId, workerKey, workerName, workerPhone);
  const worker = lookup.worker;

  if (!worker) {
    const lookupError = lookup.workers_error;
    return fail(
      res,
      lookupError ? 500 : 404,
      "find_worker",
      lookupError ? "查询 workers 表失败。" : "未找到师傅。",
      lookupError
        ? lookupError.message || String(lookupError)
        : `worker_id=${workerId || "(empty)"}, worker_key=${workerKey || "(empty)"}, worker_name=${workerName || "(empty)"}, worker_phone=${workerPhone || "(empty)"}`,
      debugPayload,
      {
        ...(lookupError ? describeError(lookupError) : {}),
        env: getSafeSupabaseEnv(),
      },
    );
  }

  const workerLookupWarning = lookup.workers_error
    ? {
        stage: "find_worker",
        message: "workers 表查询失败，已使用 payload.worker_id 兜底派单。",
        ...describeError(lookup.workers_error),
        env: getSafeSupabaseEnv(),
      }
    : null;

  try {
    await deleteExistingTasks(supabase, worker.id, pointIds);
  } catch (error) {
    return fail(res, 500, "delete_existing_tasks", "清理重复派单失败。", error.message || String(error), debugPayload, {
      ...describeError(error),
      env: getSafeSupabaseEnv(),
      worker,
    });
  }

  const assignedAt = nowIso();
  const tasks = pointIds.map((pointId) => ({
    id: uid("task"),
    worker_id: worker.id,
    point_id: pointId,
    status: STATUS_IN_PROGRESS,
    assigned_at: assignedAt,
    created_at: assignedAt,
  }));

  let insertResult;
  try {
    insertResult = await insertTasks(supabase, tasks);
  } catch (error) {
    return fail(res, 500, "insert_dispatch_tasks", "写入 dispatch_tasks 失败。", error.message || String(error), debugPayload, {
      ...describeError(error),
      env: getSafeSupabaseEnv(),
      worker,
    });
  }

  let updateResult;
  try {
    updateResult = await updatePoints(supabase, pointIds);
  } catch (error) {
    return fail(res, 500, "update_wall_points", "更新 wall_points 状态失败。", error.message || String(error), debugPayload, {
      ...describeError(error),
      env: getSafeSupabaseEnv(),
      worker,
    });
  }

  return sendJson(res, 200, {
    ok: true,
    worker,
    inserted: insertResult.data.length,
    updated_points: updateResult.data.length,
    point_ids: pointIds,
    insert_variant: insertResult.insert_variant,
    update_variant: updateResult.update_variant,
    worker_lookup_source: lookup.worker_lookup_source,
    ...(workerLookupWarning ? { worker_lookup_warning: workerLookupWarning } : {}),
  });
};
