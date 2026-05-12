import { useState } from "react";
import {
  API_BASE_URL,
  DATA_MODE,
  deleteWallPoint,
  dispatchPoints as dispatchPointsApi,
  getDataModeLabel,
  getWorkers,
  healthCheck,
  isLocalDataMode,
  isProxyDataMode,
  isSupabaseDataMode,
  proxyApi,
  deleteWorker,
  resetWorkerAccessToken,
  saveProject,
  saveWorker,
  saveWorkerLocation,
  setWorkerEnabled,
} from "../apiClient";
import { classifyApiError, normalizeWorkerCode, nowIso } from "../lib/domain";

export function useH5Data() {
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [points, setPoints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [trackLogs, setTrackLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dispatchDebug, setDispatchDebug] = useState(null);
  const [dataSource, setDataSource] = useState(getDataModeLabel());

  function applyState(state, sourceLabel = getDataModeLabel()) {
    setProjects(state.projects || []);
    setWorkers(state.workers || []);
    setPoints(state.points || state.wallPoints || []);
    setTasks(state.tasks || state.dispatchTasks || []);
    setPhotos(state.photos || state.pointMedia || []);
    setTrackLogs(state.trackLogs || []);
    setDataSource(sourceLabel);
  }

  async function loadAll() {
    setLoading(true);
    try {
      const state = await proxyApi.loadState();
      applyState(state, isLocalDataMode ? "本地演示数据" : isSupabaseDataMode ? "Supabase 正式数据" : "国内接口数据");
      if (!message) {
        setMessage(isLocalDataMode
          ? "当前未连接正式数据库，系统正在使用演示数据。"
          : isSupabaseDataMode
            ? "已连接 Supabase 正式数据库。"
            : `已连接 ${API_BASE_URL || "同源 /api"}`);
      }
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`${issue.category}：${issue.detail}`);
      if (isSupabaseDataMode) {
        const fallback = await proxyApi.loadDemoState();
        applyState(fallback, "本地演示数据");
        setMessage(`${issue.category}：${issue.detail}。当前已临时切换为演示数据，避免页面不可用。`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function refreshWorkers() {
    try {
      const latestWorkers = await getWorkers({ includeDisabled: true });
      setWorkers(Array.isArray(latestWorkers) ? latestWorkers : []);
      return latestWorkers;
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`刷新工人定位失败：${issue.category}，${issue.detail}`);
      return workers;
    }
  }

  async function loadWorkerTasks(workerId) {
    setLoading(true);
    try {
      const state = await proxyApi.workerTasks(workerId);
      applyState({
        projects,
        workers: state.worker ? [state.worker] : state.workers || workers,
        points: state.points || [],
        tasks: state.tasks || [],
        photos: state.photos || [],
        trackLogs: state.trackLogs || trackLogs,
      }, isProxyDataMode || isSupabaseDataMode ? "真实派单任务" : "本地演示任务");
      setMessage(`已读取 ${state.points?.length || 0} 个派单点位。`);
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`无法连接派单服务器，请确认公网域名或本地 API 服务可访问。${issue.category}：${issue.detail}`);
      if (isLocalDataMode) await loadAll();
    } finally {
      setLoading(false);
    }
  }

  async function seedDemoData() {
    setLoading(true);
    try {
      const state = await proxyApi.seedDemo();
      applyState(state, isLocalDataMode ? "本地演示数据" : isSupabaseDataMode ? "Supabase 演示数据" : "国内接口演示数据");
      setMessage("已写入演示数据，可直接筛选点位并派单给师傅移动端。");
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`写入演示数据失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function addPoints(newPoints) {
    if (!newPoints.length) return;
    setLoading(true);
    try {
      await proxyApi.addPoints(newPoints);
      setMessage(`已新增 ${newPoints.length} 个点位。`);
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`新增点位失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function updatePoint(point) {
    setLoading(true);
    try {
      await proxyApi.updatePoint(point.id, point);
      setMessage(`已保存点位 ${point.title || point.id}。`);
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`保存点位失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function removePoint(pointId) {
    setLoading(true);
    try {
      await deleteWallPoint(pointId);
      setMessage("点位已删除。");
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`删除点位失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function dispatchToWorker(worker, pointIds) {
    const requestPayload = {
      workerId: worker.id,
      worker_id: worker.id,
      worker_key: normalizeWorkerCode(worker),
      worker_name: worker.name,
      worker_phone: worker.phone,
      pointIds,
      point_ids: pointIds,
    };
    setDispatchDebug({ path: "/api/dispatch", request: requestPayload });
    setLoading(true);
    try {
      const result = await dispatchPointsApi(requestPayload);
      setDispatchDebug({ path: "/api/dispatch", request: requestPayload, response: result, status: 200 });
      setMessage(`已成功发送 ${pointIds.length} 个点位给 ${worker.name}`);
      await loadAll();
      return result;
    } catch (error) {
      const issue = classifyApiError(error);
      setDispatchDebug({
        path: "/api/dispatch",
        request: requestPayload,
        status: error.status,
        response: error.data,
        stage: error.data?.stage,
        message: error.message,
        details: issue.detail,
      });
      setMessage(`派单失败：${issue.category}，${issue.detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto({ file, point, worker, kind }) {
    const result = await proxyApi.upload({ file, point, worker, kind });
    await loadAll();
    setMessage(`${point.title} 已上传资料，已刷新素材齐套、点位状态、异常项、总览和地图调度数据。`);
    return result;
  }

  async function saveProjectDraft(project) {
    setLoading(true);
    try {
      await saveProject(project);
      setMessage(`项目 ${project.name} 已保存。`);
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`保存项目失败：${issue.category}，${issue.detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveWorkerDraft(worker) {
    setLoading(true);
    try {
      const saved = await saveWorker(worker);
      setMessage(`师傅 ${saved.name || worker.name} 已保存。`);
      await loadAll();
      return saved;
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`保存师傅失败：${issue.category}，${issue.detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function disableWorker(workerId) {
    setLoading(true);
    try {
      await setWorkerEnabled(workerId, false);
      setMessage("师傅链接已停用，并已标记为离线。");
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`停用师傅失败：${issue.category}，${issue.detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function removeWorkerDraft(workerId) {
    setLoading(true);
    try {
      await deleteWorker(workerId);
      setMessage("师傅已删除，对应派单任务已清理。");
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`删除师傅失败：${issue.category}，${issue.detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function resetWorkerToken(workerId) {
    setLoading(true);
    try {
      await resetWorkerAccessToken(workerId);
      setMessage("师傅安全链接已重置，旧链接已失效。");
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`重置链接失败：${issue.category}，${issue.detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function enableWorker(workerId) {
    setLoading(true);
    try {
      await setWorkerEnabled(workerId, true);
      setMessage("师傅链接已启用；等待师傅打开链接并发送心跳后才会显示在线。");
      await loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`恢复师傅失败：${issue.category}，${issue.detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function saveTrack(log) {
    await saveWorkerLocation({
      workerId: log.worker_id || log.workerId,
      worker_id: log.worker_id || log.workerId,
      lng: log.lng,
      lat: log.lat,
      speed: log.speed,
      moving: Number(log.speed || 0) > 3,
      stoppedSeconds: Number(log.stop_minutes || 0) * 60,
      event: log.event,
      project_name: log.project_name,
      timestamp: log.recorded_at || nowIso(),
    });
    await loadAll();
  }

  async function diagnose() {
    try {
      const result = await proxyApi.diagnose();
      setMessage(`接口诊断完成：${result.message || result.label || "当前模式可用"}`);
      return result;
    } catch (error) {
      const issue = classifyApiError(error);
      setMessage(`接口诊断失败：${issue.category}，${issue.detail}`);
      return { ok: false, error: issue };
    }
  }

  return {
    projects,
    workers,
    points,
    tasks,
    photos,
    trackLogs,
    loading,
    message,
    dispatchDebug,
    dataSource,
    dataMode: DATA_MODE,
    loadAll,
    refreshWorkers,
    healthCheck,
    loadWorkerTasks,
    seedDemoData,
    addPoints,
    updatePoint,
    removePoint,
    dispatchToWorker,
    uploadPhoto,
    saveProjectDraft,
    saveWorkerDraft,
    disableWorker,
    enableWorker,
    removeWorkerDraft,
    resetWorkerToken,
    saveTrack,
    diagnose,
  };
}
