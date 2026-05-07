const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const STORE_KEY = "wall-ad-h5-demo-state";
const fixtureDir = path.join(__dirname, "..", "fixtures");
const fixturePath = path.join(fixtureDir, "test-wall.jpg");

async function openAdmin(page) {
  await page.goto("/");
  await expect(page.locator(".admin-shell")).toBeVisible();
  await expect(page.locator(".system-title")).toContainText("全国墙体广告执行派单系统");
}

async function resetDemoData(page) {
  await openAdmin(page);
  await page.evaluate((key) => window.localStorage.removeItem(key), STORE_KEY);
  await page.getByRole("button", { name: /重置本地演示数据|写入演示数据/ }).click();
  await expect(page.locator(".list-panel .point-card")).toHaveCount(3);
}

async function dispatchToLi(page) {
  await resetDemoData(page);
  await page.getByLabel("师傅选择").selectOption({ label: "李师傅 / 粤A·工002" });
  await page.getByRole("button", { name: "发送已选点位到师傅移动端" }).click();
  await expect(page.locator(".info")).toContainText(/派单|dispatch_tasks/);
}

test.beforeAll(() => {
  fs.mkdirSync(fixtureDir, { recursive: true });
  const jpgBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EFBABAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z";
  fs.writeFileSync(fixturePath, Buffer.from(jpgBase64, "base64"));
});

test.describe("墙体广告执行 H5 派单系统", () => {
  test("测试 1：后台首页可打开", async ({ page }) => {
    await openAdmin(page);
    await expect(page.getByText("筛选点位列表")).toBeVisible();
    await expect(page.getByText("点位列表")).toBeVisible();
    await expect(page.getByText("师傅选择")).toBeVisible();
    await expect(page.getByRole("button", { name: "发送已选点位到师傅移动端" })).toBeVisible();
  });

  test("测试 2：本地演示数据可用", async ({ page }) => {
    await openAdmin(page);
    const localMode = await page.getByText(/本地演示模式|未配置 Supabase/).count();
    if (localMode > 0) {
      await expect(page.getByText(/本地演示模式|未配置 Supabase/).first()).toBeVisible();
    }
    await page.getByRole("button", { name: /重置本地演示数据|写入演示数据/ }).click();
    await expect(page.locator(".list-panel .point-card")).toHaveCount(3);
  });

  test("测试 3：后台筛选和勾选", async ({ page }) => {
    await resetDemoData(page);
    const pointCards = page.locator(".list-panel .point-card");
    const pointCount = await pointCards.count();

    await page.getByRole("button", { name: "全选" }).click();
    await expect(page.getByText(`已选 ${pointCount}/${pointCount}`)).toBeVisible();

    await page.getByRole("button", { name: "全不选" }).click();
    await expect(page.getByText(`已选 0/${pointCount}`)).toBeVisible();

    await page.getByRole("button", { name: "反选" }).click();
    await expect(page.getByText(`已选 ${pointCount}/${pointCount}`)).toBeVisible();

    await page.getByPlaceholder("搜索点位、地址、房东、K码、项目").fill("GZ-BY-001");
    await expect(pointCards).toHaveCount(1);
    await expect(pointCards.first()).toContainText("GZ-BY-001");
    await expect(page.getByText("FS-NH-002")).toHaveCount(0);
  });

  test("测试 4：后台派单给李师傅", async ({ page }) => {
    await dispatchToLi(page);
    const state = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || "{}"), STORE_KEY);
    expect(state.tasks?.length || 0).toBeGreaterThanOrEqual(1);
    expect(state.tasks?.some((task) => task.worker_id === "w2")).toBeTruthy();
  });

  test("测试 5：李师傅移动端可读取任务", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker?worker=li");
    await expect(page.getByText("李师傅 的任务")).toBeVisible();
    await expect(page.locator(".progress b")).toHaveText(/1 \/ \d+/);
    await expect(page.getByRole("heading", { name: "GZ-BY-001" })).toBeVisible();
    await expect(page.locator(".addr")).toContainText("地址：");
    await expect(page.locator(".addr")).toContainText("K码：");
    await expect(page.locator(".addr")).toContainText("项目：");
    await expect(page.getByRole("link", { name: "高德查看" })).toBeVisible();
    await expect(page.getByRole("link", { name: "高德导航" })).toBeVisible();
    await expect(page.getByText(/上传现场照片/)).toBeVisible();
  });

  test("测试 6：移动端上传照片后自动完成", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker?worker=li");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.getByText(/已上传资料/)).toBeVisible();
    await expect(page.locator(".pill.ok")).toBeVisible();

    await page.goto("/");
    await expect(page.locator(".metrics-grid .metric").nth(1).locator("b")).toHaveText("1");
    await expect(page.getByText(/媒体 1/).first()).toBeVisible();
  });

  test("测试 7：上下点位切换", async ({ page }) => {
    await dispatchToLi(page);
    await page.goto("/worker?worker=li");

    const title = page.locator(".task-card h2");
    await expect(page.locator(".progress b")).toHaveText("1 / 3");
    await expect(title).toHaveText("GZ-BY-001");

    await page.getByRole("button", { name: "下一点位" }).click();
    await expect(page.locator(".progress b")).toHaveText("2 / 3");
    await expect(title).toHaveText("FS-NH-002");

    await page.getByRole("button", { name: "上一点位" }).click();
    await expect(page.locator(".progress b")).toHaveText("1 / 3");
    await expect(title).toHaveText("GZ-BY-001");
  });

  test("测试 8：Supabase 诊断", async ({ page }) => {
    await openAdmin(page);
    await page.getByRole("button", { name: "Supabase诊断" }).click();
    await expect(page.getByText("Supabase 连接诊断")).toBeVisible();
    await page.getByRole("button", { name: "开始诊断" }).click();

    await expect(page.locator(".env-grid").getByText("VITE_SUPABASE_URL", { exact: true })).toBeVisible();
    await expect(page.locator(".env-grid").getByText("VITE_SUPABASE_ANON_KEY", { exact: true })).toBeVisible();
    await expect(page.locator(".env-grid").getByText("URL 格式", { exact: true })).toBeVisible();
    await expect(page.getByText("workers 表读取")).toBeVisible();
    await expect(page.getByText("wall_points 表读取")).toBeVisible();
    await expect(page.getByText("dispatch_tasks 表读取")).toBeVisible();
    await expect(page.getByText("point_photos 表读取")).toBeVisible();
    await expect(page.getByText(/point-media/).first()).toBeVisible();

    const unconfigured = await page.getByText(/Supabase 未配置|未读取|未配置/).count();
    expect(unconfigured).toBeGreaterThan(0);
  });
});
