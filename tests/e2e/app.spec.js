const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const STORE_KEY = "wall-ad-h5-demo-state";
const fixtureDir = path.join(__dirname, "..", "fixtures");
const fixturePath = path.join(fixtureDir, "test-wall.jpg");

async function openAdmin(page) {
  await page.goto("/admin");
  await expect(page.locator(".admin-shell")).toBeVisible();
  await expect(page.locator(".system-title")).toContainText("全国墙体广告执行坐标系统");
}

async function resetDemoData(page) {
  await page.goto("/admin");
  await page.evaluate((key) => window.localStorage.removeItem(key), STORE_KEY);
  await page.reload();
  await expect(page.locator(".hero-shell")).toBeVisible();
  await page.getByRole("button", { name: "写入演示数据" }).click();
  await expect(page.locator(".list-panel .point-card")).toHaveCount(3);
}

async function dispatchToLi(page) {
  await resetDemoData(page);
  await page.getByLabel("师傅选择").selectOption("w2");
  await page.locator(".dispatch-box").getByRole("button", { name: "全选" }).click();
  await page.locator(".dispatch-box").getByRole("button", { name: "发送已选点位到师傅移动端" }).click();
  await expect(page.locator(".info")).toContainText("已成功发送 3 个点位给 李师傅");
}

test.beforeAll(() => {
  fs.mkdirSync(fixtureDir, { recursive: true });
  const jpgBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EFBABAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z";
  fs.writeFileSync(fixturePath, Buffer.from(jpgBase64, "base64"));
});

test.describe("全国墙体广告执行 H5 国内接口版高级 UI", () => {
  test("后台首页恢复高级调度中心结构", async ({ page }) => {
    await openAdmin(page);
    await expect(page.locator(".hero-shell")).toContainText("项目切换、共用墙面、工人小车定位和后台轨迹记录");
    await expect(page.getByRole("link", { name: "张师傅移动端" })).toBeVisible();
    await expect(page.getByRole("link", { name: "李师傅移动端" })).toBeVisible();
    await expect(page.getByText("项目管理")).toBeVisible();
    await expect(page.getByText("Kimi AI 图片分类配置")).toBeVisible();
    await expect(page.getByText("稳定性自检")).toBeVisible();
    await expect(page.getByText("高德地图执行台")).toBeVisible();
    await expect(page.getByText("项目照片库")).toBeVisible();
  });

  test("本地演示数据可写入并显示 3 个点位", async ({ page }) => {
    await resetDemoData(page);
    await expect(page.locator(".list-panel .point-card").first()).toContainText("GZ-BY-001");
    await expect(page.locator(".list-panel .point-card").nth(1)).toContainText("FS-NH-002");
    await expect(page.locator(".list-panel .point-card").nth(2)).toContainText("QY-YD-003");
  });

  test("后台筛选、全选、全不选、反选可用", async ({ page }) => {
    await resetDemoData(page);
    const pointCards = page.locator(".list-panel .point-card");
    const count = await pointCards.count();

    await page.locator(".dispatch-box").getByRole("button", { name: "全选" }).click();
    await expect(page.getByText(`已选 ${count}/${count}`)).toBeVisible();

    await page.locator(".dispatch-box").getByRole("button", { name: "全不选" }).click();
    await expect(page.getByText(`已选 0/${count}`)).toBeVisible();

    await page.locator(".dispatch-box").getByRole("button", { name: "反选" }).click();
    await expect(page.getByText(`已选 ${count}/${count}`)).toBeVisible();

    await page.getByPlaceholder("搜索地址、手机号、工人、标签").fill("GZ-BY-001");
    await expect(pointCards).toHaveCount(1);
    await expect(pointCards.first()).toContainText("GZ-BY-001");
  });

  test("后台派单给李师傅后本地任务写入成功", async ({ page }) => {
    await dispatchToLi(page);
    const state = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || "{}"), STORE_KEY);
    expect(state.tasks?.length || 0).toBe(3);
    expect(state.tasks?.every((task) => task.worker_id === "w2")).toBeTruthy();
    expect(state.points?.every((point) => point.status === "施工中")).toBeTruthy();
  });

  test("李师傅移动端恢复高级卡片式任务页", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker/w2");
    await expect(page.locator(".worker-hero")).toContainText("师傅移动端派单页");
    await expect(page.getByText("李师傅 的任务")).toBeVisible();
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await expect(page.getByRole("heading", { name: "GZ-BY-001" })).toBeVisible();
    await expect(page.getByText("第一步：查看点位并导航")).toBeVisible();
    await expect(page.getByText("第二步：上传照片/视频")).toBeVisible();
    await expect(page.getByRole("link", { name: "高德查看" })).toBeVisible();
    await expect(page.getByRole("link", { name: "高德导航" })).toBeVisible();
  });

  test("移动端上传图片后自动完成并进入后台照片库", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker/w2");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.getByText(/已上传资料/)).toBeVisible();
    await expect(page.locator(".pill.ok")).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByText("项目照片库")).toBeVisible();
    await expect(page.getByText(/照片 1/).first()).toBeVisible();
    const state = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || "{}"), STORE_KEY);
    expect(state.points.find((point) => point.id === "p1")?.status).toBe("已完成");
    expect(state.photos?.length || 0).toBeGreaterThanOrEqual(1);
  });

  test("移动端上一点位和下一点位切换正常", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker/w2");
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await expect(page.getByRole("heading", { name: "GZ-BY-001" })).toBeVisible();

    await page.getByRole("button", { name: "下一点位" }).click();
    await expect(page.locator(".progress-card b")).toHaveText("2 / 3");
    await expect(page.getByRole("heading", { name: "FS-NH-002" })).toBeVisible();

    await page.getByRole("button", { name: "上一点位" }).click();
    await expect(page.locator(".progress-card b")).toHaveText("1 / 3");
    await expect(page.getByRole("heading", { name: "GZ-BY-001" })).toBeVisible();
  });

  test("放大列表、点位编辑、现场查看中心可打开", async ({ page }) => {
    await resetDemoData(page);
    await page.getByRole("button", { name: "放大列表" }).click();
    await expect(page.getByRole("dialog")).toContainText("放大筛选列表");
    await page.getByLabel("关闭").click();

    await page.getByRole("button", { name: "编辑/上传" }).first().click();
    await expect(page.getByRole("dialog")).toContainText("点位编辑 / 上传");
    await page.getByLabel("关闭").click();

    await page.getByRole("button", { name: "现场查看" }).first().click();
    await expect(page.getByRole("dialog")).toContainText("现场查看中心");
  });

  test("移动端高德点位包页面可打开", async ({ page }) => {
    await resetDemoData(page);
    await page.goto("/mobile-map");
    await expect(page.getByText("筛选点位已发送到移动端")).toBeVisible();
    await expect(page.getByRole("button", { name: "复制点位清单" })).toBeVisible();
    await expect(page.getByText("高德导航").first()).toBeVisible();
  });

  test("前端不包含 Canvas 本地跳转派单逻辑", async () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "src", "App.jsx"), "utf8");
    const apiSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "src", "apiClient.js"), "utf8");

    expect(appSource).not.toContain("setWorkerPointTasks");
    expect(appSource).not.toContain("setActiveMobileWorkerId");
    expect(appSource).not.toContain('setAppView("mobile")');
    expect(appSource).toContain("dispatchPointsApi(requestPayload)");
    expect(apiSource).toContain("VITE_API_BASE_URL");
    expect(apiSource).toContain('requestApi("/api/dispatch"');
  });
});
