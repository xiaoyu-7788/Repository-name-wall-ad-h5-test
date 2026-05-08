const cors = require("cors");
const express = require("express");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const multer = require("multer");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DB_PATH = path.join(DATA_DIR, "db.json");

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const demoWorkers = [
  { id: "w1", code: "zhang", worker_key: "zhang", slug: "zhang", name: "张师傅", phone: "13800000001", car_no: "粤A·工001", created_at: "2026-01-01T00:00:00.000Z" },
  { id: "w2", code: "li", worker_key: "li", slug: "li", name: "李师傅", phone: "13800000002", car_no: "粤A·工002", created_at: "2026-01-01T00:00:00.000Z" },
];

const demoWallPoints = [
  { id: "p1", title: "GZ-BY-001", address: "广东省广州市白云区太和镇主干道路口", landlord_name: "黄先生", landlord_phone: "13531280287", k_code: "K-GZ-BY-001", project_name: "加多宝村镇墙体项目", status: "待施工", lng: 113.38431, lat: 23.30859, created_at: "2026-01-02T00:00:00.000Z" },
  { id: "p2", title: "FS-NH-002", address: "广东省佛山市南海区村口商业街", landlord_name: "陈先生", landlord_phone: "13800138000", k_code: "K-FS-NH-002", project_name: "加多宝村镇墙体项目", status: "待施工", lng: 113.14588, lat: 23.04712, created_at: "2026-01-03T00:00:00.000Z" },
  { id: "p3", title: "QY-YD-003", address: "广东省清远市英德市镇道转角", landlord_name: "林先生", landlord_phone: "13922223333", k_code: "K-QY-YD-003", project_name: "阿康化肥春耕项目", status: "待施工", lng: 113.41521, lat: 24.18677, created_at: "2026-01-04T00:00:00.000Z" },
];

function demoDb() {
  const projects = [...new Set(demoWallPoints.map((point) => point.project_name))].map((name) => ({
    id: name,
    name,
    created_at: "2026-01-01T00:00:00.000Z",
  }));
  return {
    projects,
    workers: demoWorkers,
    wallPoints: demoWallPoints,
    dispatchTasks: [],
    pointMedia: [],
    trackLogs: [],
  };
}

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) writeDb(demoDb());
}

function normalizeDb(db) {
  return {
    projects: Array.isArray(db.projects) ? db.projects : [],
    workers: Array.isArray(db.workers) ? db.workers : [],
    wallPoints: Array.isArray(db.wallPoints) ? db.wallPoints : [],
    dispatchTasks: Array.isArray(db.dispatchTasks) ? db.dispatchTasks : [],
    pointMedia: Array.isArray(db.pointMedia) ? db.pointMedia : [],
    trackLogs: Array.isArray(db.trackLogs) ? db.trackLogs : [],
  };
}

function readDb() {
  ensureDirs();
  try {
    return normalizeDb(JSON.parse(fs.readFileSync(DB_PATH, "utf8")));
  } catch {
    const fresh = demoDb();
    writeDb(fresh);
    return fresh;
  }
}

function writeDb(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, `${JSON.stringify(normalizeDb(db), null, 2)}\n`);
  return normalizeDb(db);
}

function ok(res, data = null, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, error, detail = "") {
  return res.status(status).json({ ok: false, error, detail });
}

function upsert(list, item) {
  const id = item.id || uid("id");
  const next = { ...item, id, updated_at: nowIso() };
  const rest = list.filter((row) => row.id !== id);
  return [next, ...rest];
}

function pointIdOf(task) {
  return task.point_id || task.pointId;
}

function workerIdOf(task) {
  return task.worker_id || task.workerId;
}

function matchWorker(worker, query) {
  const value = String(query || "").trim();
  return [worker.id, worker.code, worker.worker_key, worker.slug, worker.phone].filter(Boolean).includes(value)
    || (value === "li" && (String(worker.name || "").includes("李") || String(worker.car_no || "").includes("工002")))
    || (value === "zhang" && (String(worker.name || "").includes("张") || String(worker.car_no || "").includes("工001")));
}

function buildWorkerTasksPayload(db, workerQuery) {
  const worker = db.workers.find((item) => matchWorker(item, workerQuery)) || { id: workerQuery, name: workerQuery };
  const dispatchTasks = db.dispatchTasks.filter((task) => workerIdOf(task) === worker.id);
  const pointIds = dispatchTasks.map((task) => String(pointIdOf(task)));
  const points = db.wallPoints.filter((point) => pointIds.includes(String(point.id)));
  const taskPoints = dispatchTasks.map((task) => ({
    ...points.find((point) => String(point.id) === String(pointIdOf(task))),
    ...task,
    point_id: pointIdOf(task),
    worker_id: workerIdOf(task),
  }));
  return {
    worker,
    workerId: worker.id,
    count: points.length,
    tasks: dispatchTasks,
    dispatchTasks,
    taskPoints,
    points,
    photos: db.pointMedia,
    pointMedia: db.pointMedia,
  };
}

function createApp() {
  ensureDirs();
  const app = express();
  const upload = multer({ dest: UPLOAD_DIR });

  app.use(cors());
  app.use(express.json({ limit: "20mb" }));
  app.use("/uploads", express.static(UPLOAD_DIR));

  app.get("/api/health", (req, res) => ok(res, { mode: "mock-server", message: "国内 Mock Server 正常", time: nowIso() }));

  app.get("/api/projects", (req, res) => ok(res, readDb().projects));
  app.post("/api/projects", (req, res) => {
    const db = readDb();
    db.projects = upsert(db.projects, { id: req.body.id || req.body.name || uid("project"), ...req.body, created_at: req.body.created_at || nowIso() });
    writeDb(db);
    ok(res, db.projects[0]);
  });
  app.put("/api/projects/:id", (req, res) => {
    const db = readDb();
    db.projects = upsert(db.projects, { ...req.body, id: req.params.id });
    writeDb(db);
    ok(res, db.projects[0]);
  });
  app.delete("/api/projects/:id", (req, res) => {
    const db = readDb();
    db.projects = db.projects.filter((item) => item.id !== req.params.id);
    writeDb(db);
    ok(res, { id: req.params.id });
  });

  app.get("/api/workers", (req, res) => ok(res, readDb().workers));
  app.post("/api/workers", (req, res) => {
    const db = readDb();
    db.workers = upsert(db.workers, { id: req.body.id || uid("worker"), ...req.body, created_at: req.body.created_at || nowIso() });
    writeDb(db);
    ok(res, db.workers[0]);
  });
  app.put("/api/workers/:id", (req, res) => {
    const db = readDb();
    db.workers = upsert(db.workers, { ...req.body, id: req.params.id });
    writeDb(db);
    ok(res, db.workers[0]);
  });

  app.get("/api/wall-points", (req, res) => ok(res, readDb().wallPoints));
  app.get("/api/points", (req, res) => ok(res, readDb().wallPoints));
  app.post("/api/wall-points", (req, res) => {
    const db = readDb();
    db.wallPoints = upsert(db.wallPoints, { id: req.body.id || uid("point"), status: "待施工", created_at: nowIso(), ...req.body });
    writeDb(db);
    ok(res, db.wallPoints[0]);
  });
  app.put("/api/wall-points/:id", (req, res) => {
    const db = readDb();
    db.wallPoints = upsert(db.wallPoints, { ...req.body, id: req.params.id });
    writeDb(db);
    ok(res, db.wallPoints[0]);
  });
  app.delete("/api/wall-points/:id", (req, res) => {
    const db = readDb();
    db.wallPoints = db.wallPoints.filter((item) => item.id !== req.params.id);
    db.dispatchTasks = db.dispatchTasks.filter((item) => pointIdOf(item) !== req.params.id);
    db.pointMedia = db.pointMedia.filter((item) => item.point_id !== req.params.id);
    writeDb(db);
    ok(res, { id: req.params.id });
  });

  app.get("/api/dispatch-tasks", (req, res) => ok(res, readDb().dispatchTasks));
  app.post("/api/dispatch", (req, res) => {
    const workerId = req.body.workerId || req.body.worker_id;
    const pointIds = req.body.pointIds || req.body.point_ids || [];
    if (!workerId) return fail(res, 400, "缺少 workerId");
    if (!Array.isArray(pointIds) || !pointIds.length) return fail(res, 400, "请至少选择一个点位");
    const db = readDb();
    const uniquePointIds = [...new Set(pointIds.map(String))];
    const taskKeys = new Set(uniquePointIds.map((pointId) => `${workerId}:${pointId}`));
    const tasks = uniquePointIds.map((pointId) => ({
      id: uid("task"),
      worker_id: workerId,
      workerId,
      point_id: pointId,
      pointId,
      status: "施工中",
      assigned_at: nowIso(),
      created_at: nowIso(),
    }));
    db.dispatchTasks = [...tasks, ...db.dispatchTasks.filter((task) => !taskKeys.has(`${workerIdOf(task)}:${pointIdOf(task)}`))];
    db.wallPoints = db.wallPoints.map((point) => uniquePointIds.includes(String(point.id)) && point.status !== "已完成"
      ? { ...point, status: "施工中", updated_at: nowIso() }
      : point);
    writeDb(db);
    ok(res, { workerId, count: tasks.length, inserted: tasks.length, tasks, pointIds: uniquePointIds });
  });

  app.get("/api/worker-tasks", (req, res) => {
    const workerId = req.query.workerId || req.query.worker || req.query.worker_id;
    if (!workerId) return fail(res, 400, "缺少 workerId");
    ok(res, buildWorkerTasksPayload(readDb(), workerId));
  });

  app.get("/api/worker-tasks/:workerId", (req, res) => {
    ok(res, buildWorkerTasksPayload(readDb(), req.params.workerId));
  });

  app.get("/api/point-media", (req, res) => ok(res, readDb().pointMedia));
  app.post("/api/point-media/:pointId", upload.array("files"), (req, res) => {
    const db = readDb();
    const host = `${req.protocol}://${req.get("host")}`;
    const files = req.files || [];
    const media = files.map((file) => {
      const ext = path.extname(file.originalname);
      const nextName = `${file.filename}${ext}`;
      const nextPath = path.join(UPLOAD_DIR, nextName);
      fs.renameSync(file.path, nextPath);
      return {
        id: uid("media"),
        point_id: req.params.pointId,
        worker_id: req.body.workerId || req.body.worker_id || "",
        url: `${host}/uploads/${encodeURIComponent(nextName)}`,
        file_name: file.originalname,
        mime_type: file.mimetype,
        kind: req.body.kind || "现场照片",
        created_at: nowIso(),
      };
    });
    db.pointMedia = [...media, ...db.pointMedia];
    writeDb(db);
    ok(res, media);
  });
  app.put("/api/point-media/:id", (req, res) => {
    const db = readDb();
    db.pointMedia = db.pointMedia.map((item) => item.id === req.params.id ? { ...item, ...req.body, updated_at: nowIso() } : item);
    writeDb(db);
    ok(res, db.pointMedia.find((item) => item.id === req.params.id) || null);
  });

  app.post("/api/complete-point/:pointId", (req, res) => {
    const db = readDb();
    const completedAt = nowIso();
    db.wallPoints = db.wallPoints.map((point) => point.id === req.params.pointId
      ? { ...point, status: "已完成", completed_at: completedAt, updated_at: completedAt }
      : point);
    db.dispatchTasks = db.dispatchTasks.map((task) => pointIdOf(task) === req.params.pointId
      ? { ...task, status: "已完成", completed_at: completedAt }
      : task);
    writeDb(db);
    ok(res, { id: req.params.pointId, status: "已完成", completedAt });
  });

  app.post("/api/complete-point", (req, res) => {
    const pointId = req.body.pointId || req.body.point_id;
    if (!pointId) return fail(res, 400, "缺少 pointId");
    const db = readDb();
    const completedAt = nowIso();
    db.wallPoints = db.wallPoints.map((point) => String(point.id) === String(pointId)
      ? { ...point, status: "已完成", photos: req.body.photos || point.photos || [], videos: req.body.videos || point.videos || [], completed_at: completedAt, updated_at: completedAt }
      : point);
    db.dispatchTasks = db.dispatchTasks.map((task) => String(pointIdOf(task)) === String(pointId)
      ? { ...task, status: "已完成", completed_at: completedAt }
      : task);
    writeDb(db);
    ok(res, db.wallPoints.find((point) => String(point.id) === String(pointId)) || { id: pointId, status: "已完成" });
  });

  app.get("/api/debug-state", (req, res) => {
    const db = readDb();
    ok(res, {
      points: db.wallPoints,
      workers: db.workers,
      dispatchTasks: db.dispatchTasks,
    });
  });

  app.get("/api/track-logs", (req, res) => ok(res, readDb().trackLogs));
  app.post("/api/track-logs", (req, res) => {
    const db = readDb();
    const log = { id: req.body.id || uid("track"), ...req.body, created_at: req.body.created_at || nowIso() };
    db.trackLogs = [log, ...db.trackLogs];
    writeDb(db);
    ok(res, log);
  });

  app.post("/api/import-demo", (req, res) => {
    const current = readDb();
    const demo = demoDb();
    writeDb({
      ...current,
      projects: demo.projects,
      workers: demo.workers,
      wallPoints: demo.wallPoints,
    });
    ok(res, readDb());
  });
  app.post("/api/reset-demo", (req, res) => {
    writeDb(demoDb());
    ok(res, readDb());
  });

  return app;
}

function getLanIps() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => item.address);
}

if (require.main === module) {
  const PORT = Number(process.env.PORT || 8787);
  const HOST = "0.0.0.0";
  const app = createApp();

  app.listen(PORT, HOST, () => {
    console.log(`Mock API server running on http://${HOST}:${PORT}`);
    console.log(`Local health: http://localhost:${PORT}/api/health`);
    getLanIps().forEach((ip) => {
      console.log(`LAN health: http://${ip}:${PORT}/api/health`);
    });
  });
}

module.exports = { createApp, demoDb, readDb, writeDb, DB_PATH, UPLOAD_DIR };
