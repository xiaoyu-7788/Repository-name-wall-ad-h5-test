process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || "root_admin";
process.env.ADMIN_PHONE = process.env.ADMIN_PHONE || "13900000000";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPass123!";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-session-secret-with-enough-length";

const fs = require("node:fs");
const { createApp, DB_PATH } = require("./index");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeClient(baseUrl) {
  let cookie = "";
  return {
    get cookie() {
      return cookie;
    },
    async request(path, options = {}) {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
          ...(options.headers || {}),
        },
      });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) cookie = setCookie.split(";")[0];
      const body = await response.json();
      if (!response.ok || body.ok === false) {
        throw new Error(`${path} failed: ${body.error || body.detail || response.status}`);
      }
      return body.data;
    },
    async requestForm(path, form) {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: cookie ? { Cookie: cookie } : {},
        body: form,
      });
      const body = await response.json();
      if (!response.ok || body.ok === false) {
        throw new Error(`${path} failed: ${body.error || body.detail || response.status}`);
      }
      return body.data;
    },
  };
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
  const originalDb = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH, "utf8") : null;
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const admin = makeClient(baseUrl);

  try {
    const unauthHealth = await fetch(`${baseUrl}/api/health`);
    assert(unauthHealth.status === 401, "unauthenticated backend API should return 401");
    console.log("PASS 未登录访问后台 API 返回 401");

    const registered = await admin.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: "pending_user",
        phone: "13900000001",
        email: "pending@example.com",
        password: "UserPass123!",
        confirmPassword: "UserPass123!",
      }),
    });
    assert(registered.user.status === "pending", "registered user should be pending");
    console.log("PASS 注册账号默认 pending");

    const pendingLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: "pending_user", password: "UserPass123!" }),
    });
    const pendingBody = await pendingLogin.json();
    assert(pendingLogin.status === 403 && String(pendingBody.error || pendingBody.detail).includes("账号正在审核中"), "pending user should not login");
    console.log("PASS pending 用户不能登录后台");

    const adminUser = await admin.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
    });
    assert(adminUser.role === "super_admin" && adminUser.status === "active", "super admin login failed");
    const me = await admin.request("/api/auth/me");
    assert(me.username === process.env.ADMIN_USERNAME, "auth me should return current admin");
    console.log("PASS 初始 super_admin 可登录并读取当前用户");

    const users = await admin.request("/api/users?status=pending");
    const pending = users.find((user) => user.username === "pending_user");
    assert(pending, "pending registered user missing");
    await admin.request(`/api/users/${encodeURIComponent(pending.id)}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: "dispatcher" }),
    });
    const activated = await admin.request(`/api/users/${encodeURIComponent(pending.id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    });
    assert(activated.status === "active" && activated.role === "dispatcher", "admin should activate registered user");
    const dispatcher = makeClient(baseUrl);
    const dispatcherUser = await dispatcher.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login: "13900000001", password: "UserPass123!" }),
    });
    assert(dispatcherUser.role === "dispatcher", "activated user should login");
    const dispatcherUsersResponse = await fetch(`${baseUrl}/api/users`, { headers: { Cookie: dispatcher.cookie } });
    assert(dispatcherUsersResponse.status === 403, "dispatcher should not manage users");
    console.log("PASS dispatcher 不能管理账号");
    await admin.request(`/api/users/${encodeURIComponent(pending.id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "disabled" }),
    });
    const disabledLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: "pending_user", password: "UserPass123!" }),
    });
    const disabledBody = await disabledLogin.json();
    assert(disabledLogin.status === 403 && String(disabledBody.error || disabledBody.detail).includes("账号已被停用"), "disabled user should not login");
    console.log("PASS super_admin 可审核账号，active 可登录，disabled 不可登录");

    await admin.request("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
    const afterLogout = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: admin.cookie } });
    assert(afterLogout.status === 401, "logout should clear session");
    await admin.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
    });
    console.log("PASS 退出登录后必须重新登录");

    const health = await admin.request("/api/health");
    assert(health.mode === "mock-server", "health mode should be mock-server");
    assert(Array.isArray(health.lanAdminUrls), "health should expose lan admin urls");
    console.log("PASS /api/health 正常");

    const demo = await admin.request("/api/import-demo", { method: "POST", body: JSON.stringify({}) });
    assert(demo.workers.length >= 2, "demo workers missing");
    assert(Array.isArray(demo.projects[0].materialRules), "project materialRules missing");
    console.log("PASS import demo data");

    const workers = await admin.request("/api/workers");
    assert(workers.some((worker) => worker.id === "w1"), "w1 missing");
    console.log("PASS 查询 workers");

    const createdWorker = await admin.request("/api/workers", {
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

    const editedWorker = await admin.request(`/api/workers/${encodeURIComponent(createdWorker.id)}`, {
      method: "PUT",
      body: JSON.stringify({ ...createdWorker, carNo: "粤c·t010", phone: "13800009992" }),
    });
    assert(editedWorker.carNo === "粤C·T010" || editedWorker.car_no === "粤C·T010", "edited worker car number should uppercase");
    console.log("PASS 编辑师傅保留车牌大写");

    const oldToken = editedWorker.accessToken;
    const resetWorker = await admin.request(`/api/workers/${encodeURIComponent(createdWorker.id)}/access-token`, { method: "PATCH" });
    assert(resetWorker.accessToken !== oldToken, "reset token should change");
    const oldTokenResponse = await fetch(`${baseUrl}/api/workers/${encodeURIComponent(oldToken)}`);
    assert(oldTokenResponse.status === 404, "old token should be invalid after reset");
    console.log("PASS 重置链接后旧 token 失效");

    const locatedWorker = await request(baseUrl, "/api/worker-location", {
      method: "POST",
      body: JSON.stringify({ workerId: resetWorker.accessToken, workerToken: resetWorker.accessToken, lng: 113.51, lat: 23.21, speed: 12 }),
    });
    assert(locatedWorker.worker.online === true, "worker should become online after location report");
    assert(locatedWorker.worker.lastLocationAt || locatedWorker.worker.last_location_at, "worker lastLocationAt missing");
    console.log("PASS 定位上报可更新在线状态和最近定位");

    const disabledWorker = await admin.request(`/api/workers/${encodeURIComponent(createdWorker.id)}/enable`, {
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

    const enabledWorker = await admin.request(`/api/workers/${encodeURIComponent(createdWorker.id)}/enable`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: true }),
    });
    assert(enabledWorker.enabled === true && enabledWorker.online === false, "enabled worker should wait heartbeat to become online");
    await admin.request(`/api/workers/${encodeURIComponent(createdWorker.id)}`, { method: "DELETE" });
    const deletedWorkerResponse = await fetch(`${baseUrl}/api/workers/${encodeURIComponent(resetWorker.accessToken)}`);
    assert(deletedWorkerResponse.status === 404, "deleted worker token should be invalid");
    console.log("PASS 启用/删除师傅链路正常");

    const points = await admin.request("/api/wall-points");
    assert(points.length >= 3, "wall points missing");
    assert(points.every((point) => ["待派单", "已派单", "待施工", "施工中", "已上传素材", "待验收", "已完成", "需复查"].includes(point.status)), "point status should be normalized");
    console.log("PASS 查询 wall-points");

    const pointId = points[0].id;
    const dispatch = await admin.request("/api/dispatch", {
      method: "POST",
      body: JSON.stringify({ workerId: "w1", pointIds: [pointId] }),
    });
    assert(dispatch.inserted === 1, "dispatch insert count wrong");
    assert(dispatch.tasks[0].status === "已派单", "dispatch task status should be 已派单");
    console.log("PASS 派单给 w1");

    const workerTasks = await admin.request("/api/worker-tasks/w1");
    assert(workerTasks.points.some((point) => point.id === pointId), "worker task point missing");
    console.log("PASS worker-tasks/w1 能读到任务");

    const dispatchedPoints = await admin.request("/api/wall-points");
    const dispatchedPoint = dispatchedPoints.find((point) => point.id === pointId);
    assert(dispatchedPoint.status === "已派单", "dispatch should move point to 已派单");
    console.log("PASS 派单后点位进入统一状态：已派单");

    const form = new FormData();
    form.append("files", new Blob(["stage1"], { type: "image/jpeg" }), "watermark-stage1.jpg");
    form.append("workerId", "w1");
    form.append("workerToken", "tk_ZHANGSAFEAB2");
    form.append("kind", "水印图片");
    const uploaded = await requestForm(baseUrl, `/api/point-media/${encodeURIComponent(pointId)}`, form);
    assert(uploaded[0].kind === "水印照片", "legacy media kind should normalize to 水印照片");
    console.log("PASS point-media 兼容旧素材分类并归一为水印照片");

    const location = await request(baseUrl, "/api/worker-location", {
      method: "POST",
      body: JSON.stringify({ workerId: "tk_ZHANGSAFEAB2", workerToken: "tk_ZHANGSAFEAB2", lng: 113.39, lat: 23.3, speed: 8 }),
    });
    assert(location.worker.id === "w1", "worker-location should return worker");
    console.log("PASS worker-location 定位上报仍可用");

    const debugState = await admin.request("/api/debug-state");
    assert(Array.isArray(debugState.points), "debug-state points missing");
    assert(Array.isArray(debugState.dispatchTasks), "debug-state dispatchTasks missing");
    console.log("PASS debug-state 仍返回关键数据");

    const completed = await admin.request(`/api/complete-point/${encodeURIComponent(pointId)}`, {
      method: "POST",
      body: JSON.stringify({ workerId: "w1" }),
    });
    assert(completed.status === "已完成", "complete-point status wrong");
    console.log("PASS complete-point 能把点位改成已完成");

    const nextPoints = await admin.request("/api/wall-points");
    const completedPoint = nextPoints.find((point) => point.id === pointId);
    assert(completedPoint.status === "已完成", "wall point not completed");
    console.log("PASS 查询 wall-points 状态确实已完成");

    await admin.request("/api/reset-demo", { method: "POST", body: JSON.stringify({}) });
  } finally {
    server.close();
    if (originalDb == null) {
      if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    } else {
      fs.writeFileSync(DB_PATH, originalDb);
    }
  }
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
