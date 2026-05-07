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

async function main() {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const health = await request(baseUrl, "/api/health");
    assert(health.mode === "mock-server", "health mode should be mock-server");
    console.log("PASS /api/health 正常");

    const demo = await request(baseUrl, "/api/import-demo", { method: "POST", body: JSON.stringify({}) });
    assert(demo.workers.length >= 2, "demo workers missing");
    console.log("PASS import demo data");

    const workers = await request(baseUrl, "/api/workers");
    assert(workers.some((worker) => worker.id === "w1"), "w1 missing");
    console.log("PASS 查询 workers");

    const points = await request(baseUrl, "/api/wall-points");
    assert(points.length >= 3, "wall points missing");
    console.log("PASS 查询 wall-points");

    const pointId = points[0].id;
    const dispatch = await request(baseUrl, "/api/dispatch", {
      method: "POST",
      body: JSON.stringify({ workerId: "w1", pointIds: [pointId] }),
    });
    assert(dispatch.inserted === 1, "dispatch insert count wrong");
    console.log("PASS 派单给 w1");

    const workerTasks = await request(baseUrl, "/api/worker-tasks/w1");
    assert(workerTasks.points.some((point) => point.id === pointId), "worker task point missing");
    console.log("PASS worker-tasks/w1 能读到任务");

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
