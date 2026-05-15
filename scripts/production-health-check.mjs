const DEFAULT_BASE_URL = "https://wall.hc12345.com";

await loadEnvFile(".env.production");

const baseUrl = String(process.env.PRODUCTION_BASE_URL || process.argv[2] || DEFAULT_BASE_URL).replace(/\/$/, "");
let sessionCookie = "";

async function loadEnvFile(filePath) {
  try {
    const fs = await import("node:fs/promises");
    const raw = await fs.readFile(filePath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    });
  } catch {
    // The server can still provide credentials through real environment variables.
  }
}

async function login() {
  const loginName = process.env.ADMIN_USERNAME || process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  if (!loginName || !password) {
    throw new Error("ADMIN_USERNAME/ADMIN_PHONE and ADMIN_PASSWORD are required for production health check");
  }
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: loginName, password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ok === false) {
    throw new Error(`login failed: ${body.error || body.detail || response.status}`);
  }
  sessionCookie = response.headers.get("set-cookie")?.split(";")[0] || "";
  if (!sessionCookie) throw new Error("login did not return session cookie");
}

async function check(label, path, validate) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { redirect: "manual", headers: sessionCookie ? { Cookie: sessionCookie } : {} });
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  const ok = validate(response, text, contentType);
  console.log(`${ok ? "PASS" : "FAIL"} ${label} - ${url} (${response.status})`);
  if (!ok) {
    throw new Error(`${label} failed: ${response.status} ${text.slice(0, 180)}`);
  }
}

async function main() {
  await check("HTTPS domain", "/", (response, text) => response.status === 200 && text.includes("<!doctype html"));
  await check("Admin SPA route", "/admin", (response, text) => response.status === 200 && text.includes("<!doctype html"));
  await check("Worker SPA route", "/worker/tk_HEALTHCHECK12", (response, text) => response.status === 200 && text.includes("<!doctype html"));
  await login();
  await check("API health", "/api/health", (response, text, contentType) => {
    if (response.status !== 200 || !contentType.includes("application/json")) return false;
    const body = JSON.parse(text);
    return body.ok === true
      && body.data?.publicAppOriginConfigured === true
      && body.data?.recommendedAdminUrl === `${baseUrl}/admin`
      && body.data?.recommendedWorkerUrlPattern === `${baseUrl}/worker/tk_************`;
  });
  await check("API debug-state", "/api/debug-state", (response, text, contentType) => {
    if (response.status !== 200 || !contentType.includes("application/json")) return false;
    const body = JSON.parse(text);
    return body.ok === true && Array.isArray(body.data?.points) && Array.isArray(body.data?.workers);
  });
}

main().catch((error) => {
  console.error(`FAIL production health check: ${error.message}`);
  process.exit(1);
});
