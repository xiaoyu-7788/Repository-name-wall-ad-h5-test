const { createApp } = require("./index");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(`${path} failed: ${body.error || response.status}`);
  }
  return body.data;
}

async function requestForm(baseUrl, path, form) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(`${path} failed: ${body.error || response.status}`);
  }
  return body.data;
}

async function main() {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const health = await request(baseUrl, "/api/health");
    assert(health.mode === "mock-server", "health mode should be mock-server");
    assert(health.publicAppOriginConfigured === false, "public app origin should be absent in test env");
    assert(Array.isArray(health.lanAdminUrls), "health should expose lan admin urls");
    console.log("PASS /api/health 正常");

    const demo = await request(baseUrl, "/api/import-demo", { method: "POST", body: JSON.stringify({}) });
    assert(demo.workers.length >= 2, "demo workers missing");
    assert(Array.isArray(demo.projects[0].materialRules), "project materialRules missing");
    console.log("PASS import demo data");

    const workers = await request(baseUrl, "/api/workers");
    assert(workers.some((worker) => worker.id === "w1"), "w1 missing");
    console.log("PASS 查询 workers");

    const createdWorker = await request(baseUrl, "/api/workers", {
      method: "POST",
      body: JSON.stringify({
        name: "阶段三师傅",
        phone: "13800009991",
        carNo: "粤b·t009",
        teamType: "install",
      }),
    });
    assert(createdWorker.id, "created worker id missing");
    assert(createdWorker.carNo === "粤B·T009" || createdWorker.car_no === "粤B·T009", "worker car number should uppercase");
    assert(/^tk_[A-Z2-9]{12}$/.test(createdWorker.accessToken), "created worker token should be complex");
    console.log("PASS 新增师傅生成复杂 token 且车牌大写");

    const editedWorker = await request(baseUrl, `/api/workers/${encodeURIComponent(createdWorker.id)}`, {
      method: "PUT",
      body: JSON.stringify({ ...createdWorker, carNo: "粤c·t010", phone: "13800009992" }),
    });
    assert(editedWorker.carNo === "粤C·T010" || editedWorker.car_no === "粤C·T010", "edited worker car number should uppercase");
    console.log("PASS 编辑师傅保留车牌大写");

    const oldToken = editedWorker.accessToken;
    const resetWorker = await request(baseUrl, `/api/workers/${encodeURIComponent(createdWorker.id)}/access-token`, { method: "PATCH" });
    assert(resetWorker.accessToken !== oldToken, "reset token should change");
    const oldTokenResponse = await fetch(`${baseUrl}/api/workers/${encodeURIComponent(oldToken)}`);
    assert(oldTokenResponse.status === 404, "old token should be invalid after reset");
    console.log("PASS 重置链接后旧 token 失效");

    const locatedWorker = await request(baseUrl, "/api/worker-location", {
      method: "POST",
      body: JSON.stringify({ workerId: resetWorker.accessToken, lng: 113.51, lat: 23.21, speed: 12 }),
    });
    assert(locatedWorker.worker.online === true, "worker should become online after location report");
    assert(locatedWorker.worker.lastLocationAt || locatedWorker.worker.last_location_at, "worker lastLocationAt missing");
    console.log("PASS 定位上报可更新在线状态和最近定位");

    const disabledWorker = await request(baseUrl, `/api/workers/${encodeURIComponent(createdWorker.id)}/enable`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: false }),
    });
    assert(disabledWorker.enabled === false, "worker should be disabled");
    const disabledTasksResponse = await fetch(`${baseUrl}/api/worker-tasks?workerId=${encodeURIComponent(resetWorker.accessToken)}`);
    const disabledTasksBody = await disabledTasksResponse.json();
    assert(disabledTasksBody.data?.disabled === true, "disabled token should not return active tasks");
    const disabledLocationResponse = await fetch(`${baseUrl}/api/worker-location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId: resetWorker.accessToken, lng: 113.52, lat: 23.22 }),
    });
    assert(disabledLocationResponse.status === 403, "disabled token should reject location report");
    console.log("PASS 停用师傅后 token 链接和定位上报失效");

    const enabledWorker = await request(baseUrl, `/api/workers/${encodeURIComponent(createdWorker.id)}/enable`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: true }),
    });
    assert(enabledWorker.enabled === true && enabledWorker.online === false, "enabled worker should wait heartbeat to become online");
    await request(baseUrl, `/api/workers/${encodeURIComponent(createdWorker.id)}`, { method: "DELETE" });
    const deletedWorkerResponse = await fetch(`${baseUrl}/api/workers/${encodeURIComponent(resetWorker.accessToken)}`);
    assert(deletedWorkerResponse.status === 404, "deleted worker token should be invalid");
    console.log("PASS 启用/删除师傅链路正常");

    const points = await request(baseUrl, "/api/wall-points");
    assert(points.length >= 3, "wall points missing");
    assert(points.every((point) => ["待派单", "已派单", "待施工", "施工中", "已上传素材", "待验收", "已完成", "需复查"].includes(point.status)), "point status should be normalized");
    console.log("PASS 查询 wall-points");

    const pointId = points[0].id;
    const dispatch = await request(baseUrl, "/api/dispatch", {
      method: "POST",
      body: JSON.stringify({ workerId: "w1", pointIds: [pointId] }),
    });
    assert(dispatch.inserted === 1, "dispatch insert count wrong");
    assert(dispatch.tasks[0].status === "已派单", "dispatch task status should be 已派单");
    console.log("PASS 派单给 w1");

    const workerTasks = await request(baseUrl, "/api/worker-tasks/w1");
    assert(workerTasks.points.some((point) => point.id === pointId), "worker task point missing");
    console.log("PASS worker-tasks/w1 能读到任务");

    const dispatchedPoints = await request(baseUrl, "/api/wall-points");
    const dispatchedPoint = dispatchedPoints.find((point) => point.id === pointId);
    assert(dispatchedPoint.status === "已派单", "dispatch should move point to 已派单");
    console.log("PASS 派单后点位进入统一状态：已派单");

    const form = new FormData();
    form.append("files", new Blob(["stage1"], { type: "image/jpeg" }), "watermark-stage1.jpg");
    form.append("workerId", "w1");
    form.append("kind", "水印图片");
    const uploaded = await requestForm(baseUrl, `/api/point-media/${encodeURIComponent(pointId)}`, form);
    assert(uploaded[0].kind === "水印照片", "legacy media kind should normalize to 水印照片");
    console.log("PASS point-media 兼容旧素材分类并归一为水印照片");

    const location = await request(baseUrl, "/api/worker-location", {
      method: "POST",
      body: JSON.stringify({ workerId: "w1", lng: 113.39, lat: 23.3, speed: 8 }),
    });
    assert(location.worker.id === "w1", "worker-location should return worker");
    console.log("PASS worker-location 定位上报仍可用");

    const debugState = await request(baseUrl, "/api/debug-state");
    assert(Array.isArray(debugState.points), "debug-state points missing");
    assert(Array.isArray(debugState.dispatchTasks), "debug-state dispatchTasks missing");
    console.log("PASS debug-state 仍返回关键数据");

    const completed = await request(baseUrl, `/api/complete-point/${encodeURIComponent(pointId)}`, {
      method: "POST",
      body: JSON.stringify({ workerId: "w1" }),
    });
    assert(completed.status === "已完成", "complete-point status wrong");
    console.log("PASS complete-point 能把点位改成已完成");

    const nextPoints = await request(baseUrl, "/api/wall-points");
    const completedPoint = nextPoints.find((point) => point.id === pointId);
    assert(completedPoint.status === "已完成", "wall point not completed");
    console.log("PASS 查询 wall-points 状态确实已完成");

    await request(baseUrl, "/api/reset-demo", { method: "POST", body: JSON.stringify({}) });
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
