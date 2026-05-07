import { isSupabaseConfigured, supabaseEnv } from "./supabaseClient";

export const DATA_MODE = supabaseEnv.forceLocalDemo
  ? "local"
  : supabaseEnv.dataMode === "proxy"
    ? "proxy"
    : isSupabaseConfigured
      ? "supabase"
      : "local";

export const isLocalDataMode = DATA_MODE === "local";
export const isProxyDataMode = DATA_MODE === "proxy";
export const isDirectSupabaseMode = DATA_MODE === "supabase";
export const isRemoteDataMode = isProxyDataMode || isDirectSupabaseMode;

export function getDataModeLabel() {
  if (isProxyDataMode) return "Vercel API 代理模式";
  if (isDirectSupabaseMode) return "Supabase 直连备用模式";
  return "本地演示模式";
}

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, error: "INVALID_JSON", detail: text || "接口返回不是 JSON。" };
  }
}

export async function requestApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await parseResponse(response);
  if (!response.ok || body.ok === false) {
    const error = new Error(body.detail || body.error || `API 请求失败：${response.status}`);
    error.category = body.error || body.category || "代理失败";
    error.detail = body.detail || error.message;
    error.status = response.status;
    throw error;
  }
  return body;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.split(",").pop() : value);
    };
    reader.onerror = () => reject(reader.error || new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}

export const proxyApi = {
  diagnose() {
    return requestApi("/api/diagnose");
  },
  loadState() {
    return requestApi("/api/points");
  },
  seedDemo() {
    return requestApi("/api/seed-demo", { method: "POST", body: JSON.stringify({}) });
  },
  addPoints(points) {
    return requestApi("/api/points", { method: "POST", body: JSON.stringify({ points }) });
  },
  updatePoint(id, changes) {
    return requestApi("/api/points", { method: "PATCH", body: JSON.stringify({ id, changes }) });
  },
  renameProject(projectNameFrom, projectNameTo) {
    return requestApi("/api/points", {
      method: "PATCH",
      body: JSON.stringify({ project_name_from: projectNameFrom, project_name_to: projectNameTo }),
    });
  },
  getWorkers() {
    return requestApi("/api/workers");
  },
  dispatch(workerId, pointIds) {
    return requestApi("/api/dispatch", {
      method: "POST",
      body: JSON.stringify({ worker_id: workerId, point_ids: pointIds }),
    });
  },
  workerTasks(worker) {
    return requestApi(`/api/worker-tasks?worker=${encodeURIComponent(worker)}`);
  },
  async upload({ file, point, worker, kind }) {
    const base64 = await fileToBase64(file);
    return requestApi("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        point_id: point.id,
        worker_id: worker.id,
        file_name: file.name,
        content_type: file.type || "application/octet-stream",
        kind,
        base64,
      }),
    });
  },
  updatePhotoKind(id, kind) {
    return requestApi("/api/photos", { method: "PATCH", body: JSON.stringify({ id, kind }) });
  },
};
