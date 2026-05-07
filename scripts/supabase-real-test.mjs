import { createClient } from "@supabase/supabase-js";
import { chromium, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const bucket = "point-media";
const requiredEnv = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const runId = `test_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const workerId = `${runId}_worker`;
const workerCode = `${runId}_code`;
const pointId = `${runId}_point`;
const taskTitle = `${runId}_GZ-BY-REAL`;
const diagnosticPath = `diagnostics/${runId}.txt`;
const fixtureDir = path.join(rootDir, "tests", "fixtures");
const fixturePath = path.join(fixtureDir, "test-wall-real.jpg");

const steps = [];
let supabase;
let serverProcess;
let browser;
let uploadedStoragePaths = [diagnosticPath];

function record(name, ok, detail = "") {
  steps.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function classifyError(error) {
  const message = String(error?.message || error || "");
  const lowered = message.toLowerCase();
  if (lowered.includes("fetch failed") || lowered.includes("failed to fetch") || lowered.includes("network")) {
    return "网络失败：当前机器无法访问 Supabase REST/Storage endpoint，请检查网络、代理、TLS、Supabase URL 是否可访问。";
  }
  if (lowered.includes("jwt") || lowered.includes("api key") || lowered.includes("401") || lowered.includes("403")) {
    return "环境变量错误或权限失败：请检查 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 是否匹配，以及 RLS 测试策略。";
  }
  if (lowered.includes("relation") || lowered.includes("schema cache")) {
    return "表不存在：请在 Supabase SQL Editor 运行 supabase/schema.sql。";
  }
  if (lowered.includes("bucket")) {
    return "Storage bucket 不存在或不可访问：请检查 point-media bucket 和 storage.objects policy。";
  }
  return message;
}

function fail(message) {
  throw new Error(message);
}

function parseEnvFile() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) {
    return { exists: false, values: {}, missing: requiredEnv };
  }

  const values = {};
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }

  return {
    exists: true,
    values,
    missing: requiredEnv.filter((key) => !values[key]),
  };
}

function validateUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function request(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      res.on("end", () => resolve(res.statusCode || 0));
    });
    req.on("error", reject);
    req.setTimeout(1_000, () => {
      req.destroy(new Error("timeout"));
    });
  });
}

async function waitForUrl(url, timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const status = await request(url);
      if (status >= 200 && status < 500) return;
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  fail(`Vite dev server did not become ready at ${url}`);
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function readTable(table) {
  const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
}

async function setupFixture() {
  fs.mkdirSync(fixtureDir, { recursive: true });
  const jpgBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EFBABAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z";
  fs.writeFileSync(fixturePath, Buffer.from(jpgBase64, "base64"));
}

async function cleanup() {
  try {
    if (browser) await browser.close();
  } catch {
    // ignore cleanup failures
  }
  try {
    if (serverProcess && !serverProcess.killed) serverProcess.kill();
  } catch {
    // ignore cleanup failures
  }
  if (!supabase) return;
  try {
    const { data: files } = await supabase.storage.from(bucket).list(`${pointId}/${workerId}`, { limit: 100 });
    if (files?.length) {
      uploadedStoragePaths.push(...files.map((file) => `${pointId}/${workerId}/${file.name}`));
    }
  } catch {
    // ignore storage list failures during cleanup
  }
  try {
    if (uploadedStoragePaths.length) {
      await supabase.storage.from(bucket).remove([...new Set(uploadedStoragePaths)]);
    }
    await supabase.from("point_photos").delete().eq("point_id", pointId);
    await supabase.from("dispatch_tasks").delete().eq("point_id", pointId);
    await supabase.from("wall_points").delete().eq("id", pointId);
    await supabase.from("workers").delete().eq("id", workerId);
  } catch (error) {
    console.error(`WARN cleanup incomplete: ${error.message}`);
  }
}

async function run() {
  const env = parseEnvFile();
  record(".env 文件存在", env.exists, env.exists ? "detected" : "missing");
  if (!env.exists) fail(".env 不存在，无法执行真实 Supabase 联调。");

  for (const key of requiredEnv) {
    record(`${key} 存在`, !env.missing.includes(key), env.missing.includes(key) ? "missing" : "present");
  }
  if (env.missing.length) fail(`缺少环境变量：${env.missing.join(", ")}`);

  record("VITE_SUPABASE_URL 格式", validateUrl(env.values.VITE_SUPABASE_URL), "value hidden");
  if (!validateUrl(env.values.VITE_SUPABASE_URL)) fail("VITE_SUPABASE_URL 格式错误。");

  supabase = createClient(env.values.VITE_SUPABASE_URL, env.values.VITE_SUPABASE_ANON_KEY);

  for (const table of ["workers", "wall_points", "dispatch_tasks", "point_photos"]) {
    await readTable(table);
    record(`${table} 可读取`, true);
  }

  const { error: workerError } = await supabase.from("workers").insert({
    id: workerId,
    code: workerCode,
    name: "测试师傅",
    phone: "13000000000",
    car_no: "TEST-CAR",
    created_at: new Date().toISOString(),
  });
  if (workerError) throw workerError;
  record("workers 可写入", true, "test_ worker inserted");

  const { error: pointError } = await supabase.from("wall_points").insert({
    id: pointId,
    title: taskTitle,
    address: "广东省广州市天河区测试路1号",
    landlord_name: "测试房东",
    landlord_phone: "13000000001",
    k_code: `${runId}_K`,
    project_name: "test_真实联调项目",
    status: "待施工",
    lng: 113.3301,
    lat: 23.1301,
    created_at: new Date().toISOString(),
  });
  if (pointError) throw pointError;
  record("wall_points 可写入", true, "test_ point inserted");

  const { error: uploadError } = await supabase.storage.from(bucket).upload(
    diagnosticPath,
    new Blob(["supabase real integration diagnostic"], { type: "text/plain" }),
    { cacheControl: "60", upsert: true },
  );
  if (uploadError) throw uploadError;
  record("point-media bucket 可上传", true, "diagnostic object uploaded");

  await setupFixture();
  const port = await getFreePort();
  const baseURL = `http://127.0.0.1:${port}`;
  const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
  serverProcess = spawn(npmBin, ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: rootDir,
    env: process.env,
    stdio: "ignore",
    shell: false,
  });
  await waitForUrl(baseURL);
  record("Vite 测试服务启动", true, `port ${port}`);

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ baseURL });
  await page.goto("/");
  await expect(page.locator(".admin-shell")).toBeVisible();
  await page.getByPlaceholder("搜索点位、地址、房东、K码、项目").fill(taskTitle);
  await expect(page.locator(".list-panel .point-card")).toHaveCount(1);
  await page.getByLabel("师傅选择").selectOption(workerId);
  await page.getByRole("button", { name: "发送已选点位到师傅移动端" }).click();
  await expect(page.locator(".info")).toContainText(/dispatch_tasks|派单/);
  record("后台派单完成", true, "dispatch button clicked");

  const { data: tasks, error: taskError } = await supabase
    .from("dispatch_tasks")
    .select("id")
    .eq("worker_id", workerId)
    .eq("point_id", pointId);
  if (taskError) throw taskError;
  if (!tasks?.length) fail("dispatch_tasks 没有测试派单记录。");
  record("dispatch_tasks 有记录", true, `${tasks.length} record(s)`);

  await page.goto(`/worker?worker=${encodeURIComponent(workerCode)}`);
  await expect(page.getByText("测试师傅 的任务")).toBeVisible();
  await expect(page.locator(".task-card h2")).toHaveText(taskTitle);
  record("测试师傅移动端可读取任务", true);

  await page.locator('input[type="file"]').setInputFiles(fixturePath);
  await expect(page.getByText(/已上传资料/)).toBeVisible();
  await expect(page.locator(".pill.ok")).toBeVisible();
  record("移动端上传测试图片", true);

  const { data: photos, error: photoError } = await supabase
    .from("point_photos")
    .select("id,url,file_name,kind")
    .eq("point_id", pointId)
    .eq("worker_id", workerId);
  if (photoError) throw photoError;
  if (!photos?.length) fail("point_photos 没有测试上传记录。");
  record("point_photos 有记录", true, `${photos.length} record(s)`);

  const { data: point, error: statusError } = await supabase
    .from("wall_points")
    .select("status")
    .eq("id", pointId)
    .single();
  if (statusError) throw statusError;
  if (point.status !== "已完成") fail(`wall_points.status 未变成 已完成，当前状态：${point.status}`);
  record("wall_points.status 已完成", true);

  const { data: uploadedFiles, error: listError } = await supabase.storage.from(bucket).list(`${pointId}/${workerId}`, { limit: 100 });
  if (listError) throw listError;
  if (!uploadedFiles?.length) fail("point-media 没有找到移动端上传文件。");
  uploadedStoragePaths.push(...uploadedFiles.map((file) => `${pointId}/${workerId}/${file.name}`));
  record("point-media 有移动端上传文件", true, `${uploadedFiles.length} object(s)`);
}

try {
  await run();
  await cleanup();
  record("test_ 测试数据清理", true);
  console.log(`SUMMARY ${steps.filter((step) => step.ok).length}/${steps.length} checks passed`);
} catch (error) {
  record("真实 Supabase 联调", false, classifyError(error));
  await cleanup();
  process.exitCode = 1;
}
