const { createClient } = require("@supabase/supabase-js");

const STORAGE_BUCKET = "point-media";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const demoWorkers = [
  { id: "w1", code: "zhang", name: "张师傅", phone: "13800000001", car_no: "粤A·工001", created_at: "2026-01-01T00:00:00.000Z" },
  { id: "w2", code: "li", name: "李师傅", phone: "13800000002", car_no: "粤A·工002", created_at: "2026-01-01T00:00:00.000Z" },
];

const demoPoints = [
  {
    id: "p1",
    title: "GZ-BY-001",
    address: "广州市白云区钟落潭镇广从九路村口墙面",
    landlord_name: "黄先生",
    landlord_phone: "13500000001",
    k_code: "K-GZ-BY-001",
    project_name: "加多宝村镇墙体项目",
    status: "待施工",
    lng: 113.3986,
    lat: 23.3918,
    created_at: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "p2",
    title: "FS-NH-002",
    address: "佛山市南海区里水镇桂和路临街墙体",
    landlord_name: "陈女士",
    landlord_phone: "13500000002",
    k_code: "K-FS-NH-002",
    project_name: "加多宝村镇墙体项目",
    status: "待施工",
    lng: 113.1681,
    lat: 23.1774,
    created_at: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "p3",
    title: "DG-CP-003",
    address: "东莞市常平镇常马路农贸市场外墙",
    landlord_name: "李老板",
    landlord_phone: "13500000003",
    k_code: "K-DG-CP-003",
    project_name: "阿康化肥春耕项目",
    status: "待施工",
    lng: 114.0089,
    lat: 22.9762,
    created_at: "2026-01-04T00:00:00.000Z",
  },
];

function sendJson(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(body);
  }
  res.statusCode = status;
  return res.end(JSON.stringify(body));
}

function methodNotAllowed(res, methods = ["GET"]) {
  res.setHeader("Allow", methods.join(", "));
  return sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED", detail: "Method not allowed." });
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function classifyError(error) {
  const message = String(error?.message || error?.error_description || error || "");
  const lowered = message.toLowerCase();
  const code = String(error?.code || error?.status || error?.statusCode || "");

  if (lowered.includes("fetch failed") || lowered.includes("failed to fetch") || lowered.includes("network") || lowered.includes("econn")) {
    return { category: "网络失败", detail: "Vercel Serverless Function 无法访问 Supabase，请检查 Supabase 项目状态、网络或 URL。" };
  }
  if (code === "401" || code === "403" || lowered.includes("jwt") || lowered.includes("api key") || lowered.includes("invalid")) {
    return { category: "环境变量错误", detail: "SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 不正确，或 key 与项目不匹配。" };
  }
  if (code === "42P01" || lowered.includes("relation") || lowered.includes("schema cache")) {
    return { category: "表不存在", detail: "Supabase 表不存在，请运行 supabase/schema.sql。" };
  }
  if (code === "42501" || lowered.includes("row-level security") || lowered.includes("permission denied") || lowered.includes("rls")) {
    return { category: "RLS权限问题", detail: "数据库权限被拒绝，请检查 RLS policy。" };
  }
  if (lowered.includes("bucket") && (lowered.includes("not found") || code === "404")) {
    return { category: "bucket不存在", detail: `Storage bucket ${STORAGE_BUCKET} 不存在。` };
  }
  if (lowered.includes("storage") || lowered.includes("object")) {
    return { category: "Storage权限问题", detail: "Storage 读取或写入失败，请检查 bucket 和 storage.objects policy。" };
  }
  return { category: "未知错误", detail: message || `错误码：${code || "unknown"}` };
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const env = {
    hasSupabaseUrl: Boolean(url),
    hasServiceRoleKey: Boolean(serviceRoleKey),
  };

  if (!url || !serviceRoleKey) {
    return {
      env,
      client: null,
      missing: [
        !url ? "SUPABASE_URL" : "",
        !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : "",
      ].filter(Boolean),
    };
  }

  return {
    env,
    client: createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    missing: [],
  };
}

function requireSupabase(res) {
  const setup = getSupabaseAdmin();
  if (!setup.client) {
    sendJson(res, 500, {
      ok: false,
      error: "SERVER_ENV_MISSING",
      detail: `服务端环境变量缺失：${setup.missing.join(", ")}`,
      env: setup.env,
    });
    return null;
  }
  return setup.client;
}

async function listState(supabase) {
  const [{ data: workers, error: ew }, { data: points, error: ep }, { data: tasks, error: et }, { data: photos, error: eph }] =
    await Promise.all([
      supabase.from("workers").select("*").order("name"),
      supabase.from("wall_points").select("*").order("created_at", { ascending: false }),
      supabase.from("dispatch_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("point_photos").select("*").order("created_at", { ascending: false }),
    ]);

  if (ew || ep || et || eph) throw ew || ep || et || eph;
  return { workers: workers || [], points: points || [], tasks: tasks || [], photos: photos || [] };
}

async function ensureDemoData(supabase) {
  const pointIds = demoPoints.map((point) => point.id);
  await supabase.from("point_photos").delete().in("point_id", pointIds);
  await supabase.from("dispatch_tasks").delete().in("point_id", pointIds);
  const { error: workersError } = await supabase.from("workers").upsert(demoWorkers, { onConflict: "id" });
  if (workersError) throw workersError;
  const { error: pointsError } = await supabase.from("wall_points").upsert(
    demoPoints.map((point) => ({ ...point, updated_at: nowIso(), completed_at: null })),
    { onConflict: "id" },
  );
  if (pointsError) throw pointsError;
  return { workers: demoWorkers.length, points: demoPoints.length };
}

module.exports = {
  STORAGE_BUCKET,
  demoWorkers,
  demoPoints,
  nowIso,
  uid,
  sendJson,
  methodNotAllowed,
  parseBody,
  classifyError,
  getSupabaseAdmin,
  requireSupabase,
  listState,
  ensureDemoData,
};
