const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const STORE_KEY = "wall-ad-h5-demo-state";
const fixtureDir = path.join(__dirname, "..", "fixtures");
const fixturePath = path.join(fixtureDir, "test-wall.jpg");

async function openAdmin(page, route = "/admin") {
  await page.goto(route);
  await expect(page.locator(".enterprise-shell")).toBeVisible();
  await expect(page.getByText("全国墙体广告")).toBeVisible();
}

async function resetDemoData(page) {
  await openAdmin(page);
  await page.evaluate((key) => window.localStorage.removeItem(key), STORE_KEY);
  await page.reload();
  await expect(page.getByRole("heading", { name: "运营总览" })).toBeVisible();
  await page.getByRole("button", { name: "写入演示数据" }).click();
  await expect(page.getByText("总点位数")).toBeVisible();
}

async function goPage(page, name, heading) {
  await page.getByRole("button", { name }).click();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
}

async function dispatchToLi(page) {
  await resetDemoData(page);
  await goPage(page, "派单中心 Dispatch Center", "派单中心");
    await page.locator(".dispatch-summary select").selectOption("w2");
    await page.getByRole("button", { name: "全选" }).click();
    await page.getByRole("button", { name: "一键派单" }).click();
    await expect(page.locator(".admin-toast")).toContainText("已成功发送 3 个点位给 李师傅");
}

test.beforeAll(() => {
  fs.mkdirSync(fixtureDir, { recursive: true });
  const jpgBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EFBABAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z";
  fs.writeFileSync(fixturePath, Buffer.from(jpgBase64, "base64"));
});

test.describe("全国墙体广告执行 H5 企业级后台", () => {
  test("后台导航可切换 8 个独立业务页面", async ({ page }) => {
    await openAdmin(page);
    await expect(page.getByRole("heading", { name: "运营总览" })).toBeVisible();
    await expect(page.getByText("总项目数")).toBeVisible();
    await expect(page.getByText("今日优先事项")).toBeVisible();

    await goPage(page, "地图调度 Map Console", "地图调度");
    await expect(page.locator(".map-console-layout")).toBeVisible();
    await expect(page.getByText("点位图层")).toBeVisible();

    await goPage(page, "点位管理 Point Management", "点位管理");
    await expect(page.locator(".points-table")).toBeVisible();

    await goPage(page, "师傅管理 Worker Management", "师傅管理");
    await expect(page.locator(".worker-management-layout")).toBeVisible();

    await goPage(page, "派单中心 Dispatch Center", "派单中心");
    await expect(page.locator(".dispatch-workflow")).toBeVisible();

    await goPage(page, "项目管理 Project Management", "项目管理");
    await expect(page.locator(".projects-page")).toBeVisible();

    await goPage(page, "素材管理 Media Center", "素材管理");
    await expect(page.locator(".media-page")).toBeVisible();

    await goPage(page, "系统状态 System Health", "系统状态");
    await expect(page.getByText("系统健康诊断")).toBeVisible();
  });

  test("点位管理支持表格、搜索、筛选、分页、新增编辑删除入口", async ({ page }) => {
    await resetDemoData(page);
    await goPage(page, "点位管理 Point Management", "点位管理");
    await expect(page.locator(".enterprise-table tbody tr")).toHaveCount(3);
    await expect(page.locator(".enterprise-table")).toContainText("GZ-BY-001");

    await page.getByPlaceholder("搜索编号、地址、K码、房东、队伍").fill("GZ-BY-001");
    await expect(page.locator(".enterprise-table tbody tr")).toHaveCount(1);
    await expect(page.locator(".enterprise-table")).toContainText("GZ-BY-001");
    await expect(page.locator(".enterprise-table")).toContainText("必传素材");
    await expect(page.locator(".enterprise-table")).toContainText("可验收");

    await page.getByRole("button", { name: "新增点位", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("点位编辑 / 上传");
    await page.getByRole("dialog").getByLabel("关闭").click();

    await page.getByRole("button", { name: "批量导入", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("批量新增点位");
    await page.getByLabel("关闭").click();

    await page.getByRole("button", { name: "查看", exact: true }).click();
    await expect(page.locator(".drawer-panel")).toContainText("GZ-BY-001");
    await expect(page.locator(".drawer-panel")).toContainText("验收状态");
    await page.locator(".drawer-panel").getByLabel("关闭").click();
  });

  test("派单中心可筛选、批量勾选、选择师傅并写入任务", async ({ page }) => {
    await dispatchToLi(page);
    await expect(page.locator(".dispatch-summary")).toContainText("派单前校验");
    await expect(page.locator(".dispatch-summary")).toContainText("推荐师傅");
    const state = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || "{}"), STORE_KEY);
    expect(state.tasks?.length || 0).toBe(3);
    expect(state.tasks?.every((task) => task.worker_id === "w2")).toBeTruthy();
    expect(state.tasks?.every((task) => task.status === "已派单")).toBeTruthy();
    expect(state.points?.every((point) => point.status === "已派单")).toBeTruthy();
  });

  test("阶段1统一状态、素材分类和项目素材规则保持兼容", async ({ page }) => {
    await resetDemoData(page);
    const state = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || "{}"), STORE_KEY);
    const statuses = ["待派单", "已派单", "待施工", "施工中", "已上传素材", "待验收", "已完成", "需复查"];
    expect(state.points.every((point) => statuses.includes(point.status))).toBeTruthy();
    expect(state.projects.every((project) => Array.isArray(project.materialRules))).toBeTruthy();

    await goPage(page, "点位管理 Point Management", "点位管理");
    await expect(page.locator("select").filter({ hasText: "待派单" }).first()).toBeVisible();

    await goPage(page, "素材管理 Media Center", "素材管理");
    const mediaOptions = await page.locator(".media-toolbar select").nth(2).locator("option").allTextContents();
    expect(mediaOptions).toEqual(expect.arrayContaining(["现场照片", "720 全景", "水印照片", "凯立德图片", "墙租协议图片", "视频"]));
  });

  test("师傅管理支持分页搜索筛选详情和 token 链接全流程", async ({ page }) => {
    await resetDemoData(page);
    await goPage(page, "师傅管理 Worker Management", "师傅管理");
    await expect(page.locator(".share-link-warning")).toContainText("当前后台通过 localhost 打开");
    await expect(page.locator(".worker-detail-panel")).toContainText("复制链接");

    await page.getByRole("button", { name: "新增师傅", exact: true }).click();
    await page.getByLabel("师傅姓名").fill("黄师傅");
    await page.getByLabel("手机号").fill("13800000005");
    await page.getByLabel("车辆编号").fill("粤a·t003");
    await page.getByLabel("队伍类型").selectOption("install");
    await page.locator(".drawer-panel").getByRole("button", { name: "新增师傅", exact: true }).click();

    await expect(page.locator(".enterprise-table")).toContainText("黄师傅");
    await expect(page.locator(".enterprise-table")).toContainText("粤A·T003");
    const worker = await page.evaluate((key) => {
      const state = JSON.parse(window.localStorage.getItem(key) || "{}");
      return state.workers.find((item) => item.slug === "huang");
    }, STORE_KEY);
    expect(worker?.id).toBeTruthy();
    expect(worker?.accessToken).toMatch(/^tk_[A-Z2-9]{12}$/);

    await page.getByPlaceholder("搜索姓名 / 手机号 / 车牌号").fill("黄师傅");
    await expect(page.locator(".enterprise-table tbody tr")).toHaveCount(1);
    await page.locator(".worker-toolbar select").first().selectOption("链接启用");
    await expect(page.locator(".enterprise-table")).toContainText("链接启用");
    await page.locator(".worker-toolbar select").first().selectOption("全部");

    await page.locator(".worker-table").getByRole("button", { name: "复制链接", exact: true }).click();
    await expect(page.locator(".mini-status.success")).toContainText(`/worker/${worker.accessToken}`);
    await expect(page.locator(".mini-status.success")).not.toContainText("localhost");
    await expect(page.locator(".mini-status.success")).not.toContainText("127.0.0.1");

    await goPage(page, "派单中心 Dispatch Center", "派单中心");
    await page.locator(".dispatch-summary select").selectOption(worker.id);
    await page.getByRole("button", { name: "全选" }).click();
    await page.getByRole("button", { name: "一键派单" }).click();
    await expect(page.locator(".admin-toast")).toContainText("已成功发送 3 个点位给 黄师傅");

    await page.goto(`/worker/${worker.accessToken}`);
    await expect(page.getByRole("heading", { name: "黄师傅的任务" })).toBeVisible();
    await expect(page.getByText("车牌号：粤A·T003")).toBeVisible();
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await expect.poll(async () => page.evaluate((key) => {
      const state = JSON.parse(window.localStorage.getItem(key) || "{}");
      const item = state.workers.find((workerItem) => workerItem.slug === "huang");
      return Boolean(item?.lastSeenAt && item?.lastOnlineAt);
    }, STORE_KEY)).toBe(true);

    await page.goto("/worker/huang");
    await expect(page.getByText("当前使用的是旧链接，请联系管理员更换为新的安全链接。")).toBeVisible();

    await openAdmin(page, "/admin/workers");
    await page.getByPlaceholder("搜索姓名 / 手机号 / 车牌号").fill("黄师傅");
    await page.locator(".worker-table").getByRole("button", { name: "编辑", exact: true }).click();
    await page.getByLabel("车辆编号").fill("粤a·t004");
    await page.getByRole("button", { name: "保存师傅" }).click();
    await expect(page.locator(".enterprise-table")).toContainText("粤A·T004");

    await page.locator(".worker-table .worker-row-actions details summary").click();
    await page.locator(".worker-table .worker-row-actions details").getByRole("button", { name: "重置链接" }).click();
    await expect(page.getByRole("dialog")).toContainText("重置 黄师傅 的链接");
    await page.getByRole("dialog").getByRole("button", { name: "重置链接" }).click();
    const resetToken = await page.evaluate((key) => {
      const state = JSON.parse(window.localStorage.getItem(key) || "{}");
      return state.workers.find((item) => item.slug === "huang")?.accessToken;
    }, STORE_KEY);
    expect(resetToken).toMatch(/^tk_[A-Z2-9]{12}$/);
    expect(resetToken).not.toBe(worker.accessToken);

    await page.goto(`/worker/${worker.accessToken}`);
    await expect(page.locator(".disabled-worker-card")).toContainText("链接无效或已过期，请联系管理员重新发送师傅链接。");
    await page.goto(`/worker/${resetToken}`);
    await expect(page.getByRole("heading", { name: "黄师傅的任务" })).toBeVisible();

    await openAdmin(page, "/admin/workers");
    await page.getByPlaceholder("搜索姓名 / 手机号 / 车牌号").fill("黄师傅");
    await page.locator(".worker-table .worker-row-actions details summary").click();
    await page.locator(".worker-table .worker-row-actions details").getByRole("button", { name: "停用师傅" }).click();
    await expect(page.getByRole("dialog")).toContainText("停用 黄师傅");
    await page.getByRole("dialog").getByRole("button", { name: "停用师傅" }).click();
    await expect(page.locator(".enterprise-table")).toContainText("链接停用");

    await page.goto(`/worker/${resetToken}`);
    await expect(page.locator(".disabled-worker-card")).toContainText("该师傅链接已停用，请联系管理员。");

    await openAdmin(page, "/admin/workers");
    await page.getByPlaceholder("搜索姓名 / 手机号 / 车牌号").fill("黄师傅");
    await page.locator(".worker-table .worker-row-actions details summary").click();
    await page.locator(".worker-table .worker-row-actions details").getByRole("button", { name: "启用师傅" }).click();
    await expect(page.getByRole("dialog")).toContainText("启用 黄师傅");
    await page.getByRole("dialog").getByRole("button", { name: "启用师傅" }).click();
    await expect(page.locator(".enterprise-table")).toContainText("链接启用");

    await page.locator(".worker-detail-panel").getByRole("button", { name: "删除师傅" }).click();
    await expect(page.getByRole("dialog")).toContainText("删除 黄师傅");
    await page.getByRole("dialog").getByRole("button", { name: "删除师傅" }).click();
    await expect(page.getByText("暂无师傅")).toBeVisible();
    await expect(page.locator(".worker-management-layout")).not.toContainText("黄师傅");
  });

  test("地图调度保留点位 marker、小车 marker 与右侧 Tabs", async ({ page }) => {
    await resetDemoData(page);
    await goPage(page, "地图调度 Map Console", "地图调度");
    await expect(page.locator(".amap-shell")).toBeVisible();
    await expect(page.locator(".amap-map-badges")).toContainText("点位");
    await expect(page.locator(".amap-map-badges")).toContainText("小车");
    await expect(page.locator(".map-toolbar").getByRole("button", { name: "调度视图" })).toBeVisible();
    await expect(page.locator(".map-toolbar").getByRole("button", { name: "验收视图" })).toBeVisible();
    await expect(page.locator(".map-toolbar").getByRole("button", { name: "轨迹回放" })).toBeVisible();
    await expect(page.locator(".map-toolbar").getByRole("button", { name: "框选" })).toBeVisible();
    await expect(page.locator(".map-toolbar").getByRole("button", { name: "圈选" })).toBeVisible();
    await expect(page.locator(".map-side-tabs").getByRole("button", { name: "派单", exact: true })).toBeVisible();
    await page.locator(".map-side-tabs").getByRole("button", { name: "点位详情", exact: true }).click();
    await expect(page.locator(".map-side-panel")).toContainText("GZ-BY-001");
    await expect(page.locator(".map-side-panel")).toContainText("素材情况");
    await expect(page.locator(".map-side-panel")).toContainText("异常情况");

    await page.locator(".map-toolbar").getByRole("button", { name: "框选" }).click();
    const box = await page.locator(".map-area-selection-layer").boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box.x + 40, box.y + 40);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 40, box.y + box.height - 40);
    await page.mouse.up();
    await expect(page.locator(".map-side-tabs").getByRole("button", { name: "区域汇总", exact: true })).toHaveClass(/active/);
    await expect(page.locator(".map-side-panel")).toContainText("待派点数");
    await expect(page.locator(".map-side-panel")).toContainText("在线师傅数");

    await page.locator(".map-toolbar").getByRole("button", { name: "轨迹回放" }).click();
    await expect(page.locator(".map-side-panel")).toContainText("轨迹回放基础");
  });

  test("移动端上传图片后自动完成并进入素材管理", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker/w2");
    await expect(page.getByRole("heading", { name: "李师傅的任务" })).toBeVisible();
    await page.getByLabel("上传照片").setInputFiles(fixturePath);
    await expect(page.getByText(/已上传资料/)).toBeVisible();
    await expect(page.locator(".status-badge, .pill").first()).toBeVisible();

    await openAdmin(page, "/admin/media");
    await expect(page.getByRole("heading", { name: "素材管理" })).toBeVisible();
    await expect(page.locator(".media-card")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "批量下载 ZIP" })).toBeVisible();
    const zipPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "批量下载 ZIP" }).click();
    const zipDownload = await zipPromise;
    expect(zipDownload.suggestedFilename()).toContain("wall-media-archive");
    expect(zipDownload.suggestedFilename()).toContain(".zip");
    const state = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || "{}"), STORE_KEY);
    expect(["已上传素材", "待验收", "已完成"]).toContain(state.points.find((point) => point.id === "p1")?.status);
    expect(state.photos?.length || 0).toBeGreaterThanOrEqual(1);
  });

  test("移动端上一点位和下一点位切换正常", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker/w2");
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await expect(page.getByRole("heading", { name: "GZ-BY-001" })).toBeVisible();
    await expect(page.getByLabel("上传素材类别")).toContainText("现场照片");
    await expect(page.getByLabel("上传素材类别")).toContainText("720 全景");
    await expect(page.getByLabel("上传素材类别")).toContainText("水印照片");
    await expect(page.getByLabel("上传素材类别")).toContainText("凯立德图片");
    await expect(page.getByLabel("上传素材类别")).toContainText("墙租协议图片");
    await expect(page.getByLabel("上传素材类别")).toContainText("视频");
    await expect(page.getByText("选择素材分类后上传；图片类素材不限制数量。")).toBeVisible();
    await expect(page.getByLabel("师傅姓名")).toHaveCount(0);
    await expect(page.getByLabel("手机号")).toHaveCount(0);
    await expect(page.getByLabel("车辆编号")).toHaveCount(0);
    await page.getByRole("button", { name: "下一点位" }).click();
    await expect(page.locator(".progress-card b")).toHaveText("2 / 3");
    await expect(page.getByRole("heading", { name: "FS-NH-002" })).toBeVisible();
    await page.getByRole("button", { name: "上一点位" }).click();
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await expect(page.getByText("左滑下一点位，右滑上一点位")).toBeVisible();
    await page.locator(".mobile-point-card").dispatchEvent("touchstart", {
      touches: [{ identifier: 0, target: null, clientX: 260, clientY: 260 }],
    });
    await page.locator(".mobile-point-card").dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, target: null, clientX: 215, clientY: 264 }],
    });
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await page.locator(".mobile-point-card").dispatchEvent("touchstart", {
      touches: [{ identifier: 1, target: null, clientX: 360, clientY: 260 }],
    });
    await page.locator(".mobile-point-card").dispatchEvent("touchend", {
      changedTouches: [{ identifier: 1, target: null, clientX: 120, clientY: 264 }],
    });
    await expect(page.locator(".progress-card b")).toHaveText("2 / 3");
    await expect(page.getByRole("heading", { name: "FS-NH-002" })).toBeVisible();
    await page.locator(".mobile-point-card").dispatchEvent("touchstart", {
      touches: [{ identifier: 2, target: null, clientX: 120, clientY: 260 }],
    });
    await page.locator(".mobile-point-card").dispatchEvent("touchend", {
      changedTouches: [{ identifier: 2, target: null, clientX: 360, clientY: 262 }],
    });
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await expect(page.getByRole("heading", { name: "GZ-BY-001" })).toBeVisible();
  });

  test("系统状态、独立项目管理、Kimi 配置、导出 JSON 可用", async ({ page }) => {
    await resetDemoData(page);
    await goPage(page, "项目管理 Project Management", "项目管理");
    await expect(page.locator(".projects-page")).toContainText("素材必传规则");
    await goPage(page, "系统状态 System Health", "系统状态");
    await expect(page.getByText("API 状态")).toBeVisible();
    await expect(page.getByText("Kimi AI 图片分类配置")).toBeVisible();
    await expect(page.getByText("稳定性自检")).toBeVisible();
    await page.getByRole("button", { name: "开始诊断" }).click();
    await expect(page.locator(".diagnosis-card .diagnosis-pre")).toContainText("mode");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "导出数据 JSON" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("wall-ad-export");
  });

  test("移动端高德点位包页面可打开", async ({ page }) => {
    await resetDemoData(page);
    await page.goto("/mobile-map");
    await expect(page.getByText("筛选点位已发送到移动端")).toBeVisible();
    await expect(page.getByRole("button", { name: "复制点位清单" })).toBeVisible();
    await expect(page.getByText("高德导航").first()).toBeVisible();
  });

  test("前端仍使用接口派单且不包含 Canvas 本地跳转逻辑", async () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "src", "App.jsx"), "utf8");
    const hookSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "src", "hooks", "useH5Data.js"), "utf8");
    const apiSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "src", "apiClient.js"), "utf8");
    const supabaseSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "src", "supabaseClient.js"), "utf8");
    const domainSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "src", "lib", "domain.js"), "utf8");

    expect(appSource).not.toContain("setWorkerPointTasks");
    expect(appSource).not.toContain("setActiveMobileWorkerId");
    expect(appSource).not.toContain('setAppView("mobile")');
    expect(hookSource).toContain("dispatchPointsApi(requestPayload)");
    expect(apiSource).toContain("VITE_API_BASE_URL");
    expect(apiSource).toContain("import.meta.env.PROD");
    expect(apiSource).not.toMatch(/192[.]168[.]/);
    expect(apiSource).not.toMatch(/hostname[}]:8787/);
    expect(apiSource).toContain('requestApi("/api/dispatch"');
    expect(apiSource).toContain("isSupabaseDataMode");
    expect(supabaseSource).toContain("VITE_SUPABASE_URL");
    expect(supabaseSource).toContain("VITE_SUPABASE_ANON_KEY");
    expect(domainSource).toContain("VITE_PUBLIC_APP_ORIGIN");
    expect(domainSource).toContain("buildWorkerUrl");
  });
});
