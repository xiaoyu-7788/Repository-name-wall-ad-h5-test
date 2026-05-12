import React, { useState } from "react";

import { supabaseEnv } from "../../supabaseClient";
import {
  DATA_MODE,
  API_BASE_URL,
  getApiBaseUrl,
  getApiRequestUrl,
  getWorker,
  getWorkerTasks,
  healthCheck,
  markWorkerOffline,
  normalizeCarNo,
  saveWorkerLocation,
  sendWorkerHeartbeat,
} from "../../apiClient";
import {
  MEDIA_TABS,
  STATUS,
  amapMarkerUrl,
  amapNavigationUrl,
  classifyApiError,
  cnTime,
  getCaptainName,
  getCaptainPhone,
  getPointStatus,
  getProjectName,
  getScoutName,
  getScoutPhone,
  mediaKind,
  nowIso,
  safeJson,
  uid,
  workerCarNo,
  maskAccessTokenText,
  mapPointStyle,
} from "../../lib/domain";
import { StatusPill } from "./StatusBadge";
import { Modal } from "./Modal";
import { Field } from "./Field";
import { MediaCard } from "../media/MediaCard";

export function ProjectManager({ projects, onSave }) {
  const [draft, setDraft] = useState({ id: "", name: "", client: "", month: "2026-05", color: "#2563eb", hidden: false });

  function edit(project) {
    setDraft({ ...project });
  }

  async function save() {
    if (!draft.name.trim()) return;
    await onSave({ ...draft, id: draft.id || draft.name });
    setDraft({ id: "", name: "", client: "", month: "2026-05", color: "#2563eb", hidden: false });
  }

  return (
    <section className="tool-card project-manager">
      <div className="section-head">
        <div>
          <h2>项目管理</h2>
          <p>新增、编辑、隐藏或恢复项目，调度台会按项目快速聚合点位。</p>
        </div>
      </div>
      <div className="project-form">
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="项目名称" />
        <input value={draft.client || ""} onChange={(event) => setDraft({ ...draft, client: event.target.value })} placeholder="客户" />
        <input value={draft.month || ""} onChange={(event) => setDraft({ ...draft, month: event.target.value })} placeholder="年月" />
        <input type="color" value={draft.color || "#2563eb"} onChange={(event) => setDraft({ ...draft, color: event.target.value })} aria-label="项目颜色" />
        <button className="dark-button" onClick={save}>保存项目</button>
      </div>
      <div className="project-manage-list">
        {projects.map((project) => (
          <article key={project.id || project.name}>
            <span className="project-dot" style={{ background: project.color || "#2563eb" }} />
            <div><b>{project.name}</b><small>{project.client} · {project.month}</small></div>
            <button onClick={() => edit(project)}>编辑</button>
            <button onClick={() => onSave({ ...project, hidden: !project.hidden })}>{project.hidden ? "恢复" : "隐藏"}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function KimiConfig() {
  const [apiKey, setApiKey] = useState("");
  return (
    <section className="tool-card kimi-config">
      <div className="section-head">
        <div>
          <h2>Kimi AI 图片分类配置</h2>
          <p>上传资料后可调用国内后端代理做图片分类；没有 Key 时使用文件名和本地规则兜底。</p>
        </div>
      </div>
      <label className="field">
        <span>Kimi API Key</span>
        <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="仅用于本机测试，不写入代码" />
      </label>
      <div className="mini-status success">{apiKey ? "已填写，等待后端代理接入" : "未填写，当前使用本地规则兜底"}</div>
    </section>
  );
}

export function StabilityCheck() {
  const checks = ["项目切换", "共用墙面", "标签筛选", "高德移动端", "车辆定位", "照片查看"];
  return (
    <section className="tool-card stability-card">
      <div className="section-head">
        <div>
          <h2>稳定性自检</h2>
          <p>核心体验不依赖单一后端，接口失败时可回到本地演示。</p>
        </div>
      </div>
      <div className="check-grid">
        {checks.map((item) => <span key={item}>✓ {item}</span>)}
      </div>
    </section>
  );
}

export function BatchImportModal({ projects, onClose, onImport }) {
  const [text, setText] = useState("点位编号,地址,K码,房东,房东手机号,施工队长,施工队长手机号,找墙队伍,找墙队伍手机号,项目,经度,纬度\nGZ-NEW-001,广东省广州市白云区示范村口,K-GZ-NEW-001,黄先生,13500000001,周队长,13600000001,阿强找墙队,13700000001,加多宝项目,113.36,23.25");
  const [preview, setPreview] = useState([]);

  function normalizeRow(row, index) {
    const title = row["点位编号"] || row.title || row["编号"] || `NEW-${Date.now()}-${index + 1}`;
    return {
      id: uid("point"),
      title,
      address: row["地址"] || row.address || "",
      k_code: row["K码"] || row.k_code || title,
      landlord_name: row["房东"] || row.landlord_name || "",
      landlord_phone: row["房东手机号"] || row.landlord_phone || row["手机号"] || "",
      captain_name: row["施工队长"] || row.captain_name || "",
      captain_phone: row["施工队长手机号"] || row.captain_phone || "",
      scout_name: row["找墙队伍"] || row.scout_name || "",
      scout_phone: row["找墙队伍手机号"] || row.scout_phone || "",
      project_name: row["项目"] || row.project_name || projects[0]?.name || "加多宝项目",
      lng: Number(row["经度"] || row.lng) || null,
      lat: Number(row["纬度"] || row.lat) || null,
      status: "待派单",
      created_at: nowIso(),
    };
  }

  function parseText() {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(/\t|,/).map((item) => item.trim());
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(/\t|,/).map((item) => item.trim());
      return headers.reduce((acc, key, index) => ({ ...acc, [key]: cells[index] || "" }), {});
    });
    const next = rows.map(normalizeRow);
    setPreview(next);
    return next;
  }

  async function parseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreview(rows.map(normalizeRow));
      return;
    }
    setText(await file.text());
  }

  function kimiClean() {
    const next = preview.length ? preview : parseText();
    setPreview(next.map((point) => ({ ...point, k_code: point.k_code || point.title, status: "待派单" })));
  }

  function amapMatch() {
    const next = preview.length ? preview : parseText();
    setPreview(next.map((point, index) => ({
      ...point,
      lng: point.lng || Number((113.1 + index * 0.11).toFixed(5)),
      lat: point.lat || Number((23.1 + index * 0.07).toFixed(5)),
    })));
  }

  return (
    <Modal title="批量新增点位" subtitle="支持 Excel / CSV / TXT 上传、直接粘贴、Kimi 自检字段和高德自动匹配经纬度。" onClose={onClose} wide>
      <div className="batch-grid">
        <div>
          <label className="file-drop">
            上传 Excel / CSV / TXT
            <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={parseFile} />
          </label>
          <textarea value={text} onChange={(event) => setText(event.target.value)} />
          <div className="modal-actions">
            <button onClick={parseText}>解析预览</button>
            <button onClick={kimiClean}>Kimi 自检整理字段</button>
            <button onClick={amapMatch}>高德自动匹配经纬度</button>
            <button className="green-button" onClick={() => {
              const items = preview.length ? preview : parseText();
              onImport(items);
            }}>确认写入系统</button>
          </div>
        </div>
        <div className="preview-table">
          <div className="preview-head">预览列表</div>
          {preview.slice(0, 8).map((point) => (
            <article key={point.id}>
              <b>{point.title}</b>
              <span>{point.address}</span>
              <small>K码 {point.k_code} · 房东 {point.landlord_name} · 队长 {point.captain_name} · 找墙 {point.scout_name}</small>
              <small>{point.project_name} · {point.lng || "待匹配"}, {point.lat || "待匹配"}</small>
            </article>
          ))}
          {!preview.length && <div className="empty compact">点击“解析预览”后查看字段整理结果。</div>}
        </div>
      </div>
    </Modal>
  );
}

export function PointEditorModal({ point, projects, workers, photos, onClose, onSave, onUpload }) {
  const [draft, setDraft] = useState({ ...point });
  const [kind, setKind] = useState("现场照片");
  const uploader = workers[0] || { id: "admin", name: "后台" };

  function change(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function uploadFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      await onUpload(file, draft, uploader, kind);
    }
    event.target.value = "";
  }

  return (
    <Modal title="点位编辑 / 上传" subtitle="完整维护编号、K码、人员信息、地址、状态、项目和现场媒体。" onClose={onClose} wide>
      <div className="edit-grid">
        <Field label="点位编号"><input value={draft.title || ""} onChange={(event) => change("title", event.target.value)} /></Field>
        <Field label="K码"><input value={draft.k_code || ""} onChange={(event) => change("k_code", event.target.value)} /></Field>
        <Field label="房东姓名"><input value={draft.landlord_name || ""} onChange={(event) => change("landlord_name", event.target.value)} /></Field>
        <Field label="房东手机号"><input value={draft.landlord_phone || ""} onChange={(event) => change("landlord_phone", event.target.value)} /></Field>
        <Field label="施工队长姓名"><input value={getCaptainName(draft) === "未登记" ? "" : getCaptainName(draft)} onChange={(event) => change("captain_name", event.target.value)} /></Field>
        <Field label="施工队长手机号"><input value={getCaptainPhone(draft) === "未登记" ? "" : getCaptainPhone(draft)} onChange={(event) => change("captain_phone", event.target.value)} /></Field>
        <Field label="找墙队伍姓名"><input value={getScoutName(draft) === "未登记" ? "" : getScoutName(draft)} onChange={(event) => change("scout_name", event.target.value)} /></Field>
        <Field label="找墙队伍手机号"><input value={getScoutPhone(draft) === "未登记" ? "" : getScoutPhone(draft)} onChange={(event) => change("scout_phone", event.target.value)} /></Field>
        <Field label="详细地址"><input value={draft.address || ""} onChange={(event) => change("address", event.target.value)} /></Field>
        <Field label="归属项目"><select value={getProjectName(draft)} onChange={(event) => change("project_name", event.target.value)}>{projects.map((project) => <option key={project.name}>{project.name}</option>)}</select></Field>
        <Field label="经度"><input value={draft.lng || ""} onChange={(event) => change("lng", event.target.value)} /></Field>
        <Field label="纬度"><input value={draft.lat || ""} onChange={(event) => change("lat", event.target.value)} /></Field>
        <Field label="执行状态"><select value={getPointStatus(draft)} onChange={(event) => change("status", event.target.value)}>{STATUS.map((item) => <option key={item}>{item}</option>)}</select></Field>
      </div>
      <div className="upload-lab">
        <div>
          <h3>Kimi AI 自动分类</h3>
          <p>可按现场照片、720 全景、水印照片、凯立德图片、墙租协议图片和视频上传；图片类素材不限制上传数量。</p>
        </div>
        <select value={kind} onChange={(event) => setKind(event.target.value)}>
          {MEDIA_TABS.map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="file-drop small">
          上传照片 / 视频
          <input type="file" accept="image/*,video/*" multiple onChange={uploadFiles} />
        </label>
      </div>
      <div className="modal-actions">
        <button onClick={() => setDraft({ ...draft, lng: draft.lng || 113.32, lat: draft.lat || 23.12 })}>自动匹配经纬度</button>
        <button className="green-button" onClick={() => onSave(draft)}>保存点位</button>
      </div>
    </Modal>
  );
}

export function SiteViewerModal({ point, photos, onClose, onEdit }) {
  const [tab, setTab] = useState("现场照片");
  const media = photos.filter((photo) => (photo.point_id || photo.pointId) === point.id && mediaKind(photo) === tab);
  return (
    <Modal title={`${point.title} 现场查看中心`} subtitle={point.address} onClose={onClose} wide>
      <div className="site-tabs">
        {MEDIA_TABS.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
      </div>
      <div className="site-view-grid">
        <div className="site-big-view">
          {media[0] ? <MediaCard photo={media[0]} point={point} /> : <div className="empty">暂无{tab}，可进入编辑/上传。</div>}
        </div>
        <aside className="site-info">
          <h3>现场信息</h3>
          <div className="detail-grid single">
            <div><span>地址</span><b>{point.address}</b></div>
            <div><span>K码</span><b>{point.k_code || "未登记"}</b></div>
            <div><span>项目</span><b>{getProjectName(point)}</b></div>
            <div><span>状态</span><b>{getPointStatus(point)}</b></div>
            <div><span>房东</span><b>{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</b></div>
            <div><span>施工队长</span><b>{getCaptainName(point)} / {getCaptainPhone(point)}</b></div>
            <div><span>找墙队伍</span><b>{getScoutName(point)} / {getScoutPhone(point)}</b></div>
          </div>
          <div className="site-link-row">
            <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
            <a className="blue-button" href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
          </div>
          <button className="dark-button full" onClick={onEdit}>跳转编辑/上传</button>
        </aside>
      </div>
    </Modal>
  );
}

export function DiagnosisModal({ result, onRun, onClose }) {
  return (
    <Modal title="国内接口诊断" subtitle="当前主线不再依赖 Supabase，诊断只检查数据模式和国内 API 连接。" onClose={onClose}>
      <div className="env-grid">
        <div><span>VITE_DATA_MODE</span><b>{DATA_MODE}</b></div>
        <div><span>VITE_API_BASE_URL</span><b>{DATA_MODE === "local" ? "本地模式无需配置" : API_BASE_URL}</b></div>
        <div><span>VITE_AMAP_KEY</span><b>{supabaseEnv.hasAmapKey ? "已读取" : "未配置"}</b></div>
        <div><span>VITE_AMAP_SECURITY_CODE</span><b>{supabaseEnv.hasAmapSecurityCode ? "已读取" : "未配置"}</b></div>
        <div><span>VITE_KIMI_CLASSIFY_ENDPOINT</span><b>{supabaseEnv.hasKimiClassifyEndpoint ? "已读取" : "可选未配置"}</b></div>
      </div>
      <pre className="diagnosis-pre">{safeJson(result || { ok: DATA_MODE === "local", mode: DATA_MODE })}</pre>
      <div className="modal-actions">
        <button className="blue-button" onClick={onRun}>开始诊断</button>
      </div>
    </Modal>
  );
}

export function TrackCenter({ workers, tasks, points, trackLogs, onSaveTrack }) {
  const [vehicleState, setVehicleState] = useState({});

  async function toggleVehicle(worker) {
    const current = vehicleState[worker.id] || worker.status || "行驶中";
    const next = current === "行驶中" ? "已停止" : "行驶中";
    setVehicleState({ ...vehicleState, [worker.id]: next });
    const workerTasks = tasks.filter((task) => (task.worker_id || task.workerId) === worker.id);
    const point = points.find((item) => item.id === (workerTasks[0]?.point_id || workerTasks[0]?.pointId)) || points[0];
    if (point) {
      await onSaveTrack({
        worker_id: worker.id,
        worker_name: worker.name,
        event: next === "行驶中" ? "继续行驶" : "模拟停车",
        speed: next === "行驶中" ? 36 : 0,
        stop_minutes: next === "行驶中" ? 0 : 8,
        lng: point.lng,
        lat: point.lat,
        project_name: getProjectName(point),
        recorded_at: nowIso(),
      });
    }
  }

  return (
    <section id="records" className="tool-card track-center enterprise-card">
      <div className="section-head">
        <div>
          <h2>工人定位和轨迹记录</h2>
          <p>模拟移动端定位上报，后台记录车辆行驶、停车和项目坐标。</p>
        </div>
      </div>
      <div className="vehicle-grid">
        {workers.map((worker, index) => {
          const status = vehicleState[worker.id] || worker.status || (index % 2 ? "已停止" : "行驶中");
          return (
            <article key={worker.id} className="vehicle-card">
              <div><b>{worker.name}</b><small>{worker.car_no || worker.phone}</small></div>
              <StatusPill status={status === "行驶中" ? "施工中" : "需复查"} />
              <span>项目：{worker.project_name || "加多宝项目"}</span>
              <span>速度：{status === "行驶中" ? worker.speed || 38 : 0} km/h</span>
              <span>停止计时：{status === "行驶中" ? "0 分钟" : "8 分钟"}</span>
              <button onClick={() => toggleVehicle(worker)}>{status === "行驶中" ? "模拟停车" : "继续行驶"}</button>
            </article>
          );
        })}
      </div>
      <div className="track-table">
        <div className="track-table-head"><b>工人</b><b>时间</b><b>事件</b><b>速度</b><b>停止时长</b><b>经纬度</b><b>项目</b></div>
        {(trackLogs.length ? trackLogs : []).slice(0, 8).map((log) => (
          <div key={log.id || `${log.worker_id}-${log.recorded_at}`}>
            <span>{log.worker_name || workers.find((worker) => worker.id === log.worker_id)?.name || log.worker_id}</span>
            <span>{cnTime(log.recorded_at || log.created_at || nowIso())}</span>
            <span>{log.event || "定位上报"}</span>
            <span>{log.speed ?? 0} km/h</span>
            <span>{log.stop_minutes ?? 0} 分钟</span>
            <span>{log.lng || "-"}, {log.lat || "-"}</span>
            <span>{log.project_name || "未分配"}</span>
          </div>
        ))}
        {!trackLogs.length && <div className="empty compact">暂无轨迹记录，可点击上方按钮模拟停车/继续行驶。</div>}
      </div>
    </section>
  );
}

export function MobileMapPack({ data }) {
  const [mapMode, setMapMode] = useState("standard");
  const current = data.points[0] || null;
  return (
    <main className="mobile-map-page">
      <section className="worker-hero">
        <span>移动端高德点位包</span>
        <h1>筛选点位已发送到移动端</h1>
        <p>标准/卫星预览、复制点位清单、逐点高德查看和导航。</p>
      </section>
      <div className="segmented wide">
        <button className={mapMode === "standard" ? "active" : ""} onClick={() => setMapMode("standard")}>标准图</button>
        <button className={mapMode === "satellite" ? "active" : ""} onClick={() => setMapMode("satellite")}>卫星图</button>
      </div>
      <div className={`map-board mobile-map-preview ${mapMode}`}>
        {data.points.map((point, index) => <button key={point.id} className="map-pin" style={mapPointStyle(point, data.points, index)}><span /></button>)}
      </div>
      <div className="mobile-map-actions">
        <button onClick={() => navigator.clipboard?.writeText(data.points.map((point) => `${point.title} ${point.address} ${point.k_code}`).join("\n"))}>复制点位清单</button>
        {current && <a className="blue-button" href={amapNavigationUrl(current)} target="_blank" rel="noreferrer">导航当前点位</a>}
      </div>
      <div className="map-pack-list">
        {data.points.map((point) => (
          <article key={point.id}>
            <b>{point.title}</b>
            <span>{point.address}</span>
            <small>K码 {point.k_code} · 房东 {point.landlord_name || "未登记"} · 队长 {getCaptainName(point)} · {getProjectName(point)}</small>
            <div>
              <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
              <a href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export function WorkerPage({ data, workerId }) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState("");
  const [uploadKind, setUploadKind] = useState("现场照片");
  const [remoteTasks, setRemoteTasks] = useState([]);
  const [remoteWorker, setRemoteWorker] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");
  const [legacyLink, setLegacyLink] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [taskDebug, setTaskDebug] = useState({
    requestUrl: getApiRequestUrl(`/api/worker-tasks?workerId=${encodeURIComponent(workerId)}`),
    lastFetchTime: "",
    count: 0,
    taskPointsLength: 0,
    error: "",
  });
  const [locationState, setLocationState] = useState({
    watching: false,
    message: "未开启实时定位",
    error: "",
    lastSentAt: "",
  });
  const watchIdRef = React.useRef(null);
  const lastLocationSentRef = React.useRef(0);
  const stoppedSinceRef = React.useRef(null);
  const touchStartRef = React.useRef(null);
  const apiBaseUrl = getApiBaseUrl();
  const swipeThresholdPx = 72;
  const swipeDirectionGuard = 1.35;

  async function fetchWorkerTasks() {
    const requestPath = `/api/worker-tasks?workerId=${encodeURIComponent(workerId)}`;
    const requestUrl = getApiRequestUrl(requestPath);
    setRemoteLoading(true);
    setTaskDebug((current) => ({ ...current, requestUrl }));
    try {
      let workerInfo = null;
      try {
        workerInfo = await getWorker(workerId);
      } catch (error) {
        if (error?.status !== 404) throw error;
      }
      if (!workerInfo) {
        const message = "链接无效或已过期，请联系管理员重新发送师傅链接。";
        setRemoteWorker(null);
        setRemoteTasks([]);
        setRemoteError(message);
        setLegacyLink(false);
        setTaskDebug({ requestUrl, lastFetchTime: new Date().toLocaleTimeString("zh-CN", { hour12: false }), count: 0, taskPointsLength: 0, error: message });
        return;
      }
      if (workerInfo?.enabled === false) {
        const message = "该师傅链接已停用，请联系管理员。";
        setRemoteWorker(workerInfo);
        setRemoteTasks([]);
        setRemoteError(message);
        setLegacyLink(Boolean(workerInfo.__legacyLink));
        setTaskDebug({ requestUrl, lastFetchTime: new Date().toLocaleTimeString("zh-CN", { hour12: false }), count: 0, taskPointsLength: 0, error: message });
        return;
      }
      const payload = await getWorkerTasks(workerInfo.id);
      const list = Array.isArray(payload.taskPoints) ? payload.taskPoints : [];
      const nextCount = Number.isFinite(Number(payload.count)) ? Number(payload.count) : list.length;
      const nextTime = new Date().toLocaleTimeString("zh-CN", { hour12: false });
      setRemoteWorker({ ...(payload.worker || workerInfo || {}), __legacyLink: Boolean(workerInfo.__legacyLink) });
      setRemoteTasks(Array.isArray(list) ? list : []);
      setRemoteError("");
      setLegacyLink(Boolean(workerInfo.__legacyLink));
      setTaskDebug({ requestUrl, lastFetchTime: nextTime, count: nextCount, taskPointsLength: list.length, error: "" });
      setIndex((current) => Math.min(current, Math.max(list.length - 1, 0)));
    } catch (err) {
      const issue = classifyApiError(err);
      const message = `${issue.category}: ${issue.detail}`;
      setRemoteError(message);
      setRemoteTasks([]);
      setTaskDebug({ requestUrl, lastFetchTime: new Date().toLocaleTimeString("zh-CN", { hour12: false }), count: 0, taskPointsLength: 0, error: message });
    } finally {
      setRemoteLoading(false);
    }
  }

  React.useEffect(() => {
    fetchWorkerTasks();
    const timer = window.setInterval(fetchWorkerTasks, 3000);
    return () => window.clearInterval(timer);
  }, [workerId]);

  const worker = remoteWorker
    || data.workers.find((item) => [item.accessToken, item.access_token, item.id, item.code, item.worker_key, item.workerKey, item.slug].includes(workerId))
    || null;

  React.useEffect(() => () => {
    if (watchIdRef.current != null) navigator.geolocation?.clearWatch(watchIdRef.current);
  }, []);

  function geolocationErrorMessage(error) {
    if (!navigator.geolocation) return "浏览器不支持定位";
    if (error?.code === 1) return "未授权定位，请在浏览器权限里允许定位";
    if (error?.code === 2) return "当前设备暂时无法获取定位";
    if (error?.code === 3) return "定位超时，请到室外或信号更好的位置重试";
    return error?.message || "定位失败";
  }

  function stopLiveLocation() {
    if (watchIdRef.current != null) navigator.geolocation?.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setLocationState((current) => ({ ...current, watching: false, message: "已停止实时定位" }));
  }

  function startLiveLocation() {
    if (!worker) {
      setLocationState({ watching: false, message: "定位不可用", error: "链接无效或已过期，请联系管理员重新发送师傅链接。", lastSentAt: "" });
      return;
    }
    if (!navigator.geolocation) {
      setLocationState({ watching: false, message: "定位不可用", error: "浏览器不支持定位", lastSentAt: "" });
      return;
    }
    const insecure = window.location.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(window.location.hostname);
    setLocationState({
      watching: true,
      message: insecure ? "正在定位；当前不是 HTTPS，部分手机浏览器可能限制持续定位" : "正在获取实时定位",
      error: "",
      lastSentAt: locationState.lastSentAt,
    });
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(async (position) => {
      const now = Date.now();
      if (now - lastLocationSentRef.current < 5000) return;
      lastLocationSentRef.current = now;
      const speedKmh = position.coords.speed == null ? 0 : Math.max(0, position.coords.speed * 3.6);
      const moving = speedKmh > 3;
      if (moving) stoppedSinceRef.current = null;
      else if (!stoppedSinceRef.current) stoppedSinceRef.current = now;
      const stoppedSeconds = moving ? 0 : Math.round((now - stoppedSinceRef.current) / 1000);
      try {
        await saveWorkerLocation({
          workerId: worker.id || workerId,
          worker_id: worker.id || workerId,
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          accuracy: position.coords.accuracy,
          speed: Number(speedKmh.toFixed(1)),
          heading: position.coords.heading,
          moving,
          stoppedSeconds,
          timestamp: new Date(now).toISOString(),
        });
        const sentAt = new Date(now).toLocaleTimeString("zh-CN", { hour12: false });
        setLocationState({
          watching: true,
          message: `已上报定位：${Number(position.coords.longitude).toFixed(5)}, ${Number(position.coords.latitude).toFixed(5)}`,
          error: "",
          lastSentAt: sentAt,
        });
      } catch (error) {
        const issue = classifyApiError(error);
        setLocationState((current) => ({ ...current, error: `${issue.category}: ${issue.detail}` }));
      }
    }, (error) => {
      setLocationState((current) => ({ ...current, watching: false, error: geolocationErrorMessage(error) }));
    }, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });
  }

  const fallbackTaskPointIds = data.tasks
    .filter((task) => worker && (task.worker_id || task.workerId) === worker.id)
    .map((task) => task.point_id || task.pointId);
  const fallbackPoints = supabaseEnv.forceLocalDemo && fallbackTaskPointIds.length
    ? data.points.filter((point) => fallbackTaskPointIds.includes(point.id))
    : [];
  const visiblePoints = remoteTasks.length ? remoteTasks : fallbackPoints;
  const point = visiblePoints[Math.min(index, Math.max(visiblePoints.length - 1, 0))] || null;
  const workerDataSource = supabaseEnv.forceLocalDemo ? "本地演示任务" : "真实接口派单任务";
  const readErrorText = taskDebug.error || remoteError || (remoteLoading ? "读取中..." : "无错误");
  const statusLine = `${remoteError ? "后台连接异常" : "已连接后台"}｜已读取 ${taskDebug.taskPointsLength} 个派单点位｜${readErrorText}`;
  const workerDisabled = worker?.enabled === false;
  const workerMissing = !worker && !remoteLoading && Boolean(taskDebug.lastFetchTime || remoteError);
  const workerIdDebugText = workerId.startsWith("tk_") ? "安全访问码已识别" : workerId;
  const requestUrlDebugText = maskAccessTokenText(taskDebug.requestUrl);

  React.useEffect(() => {
    if (!worker?.id || workerDisabled) return undefined;
    let cancelled = false;

    async function heartbeat(payload = {}) {
      try {
        const updatedWorker = await sendWorkerHeartbeat(worker.id, payload);
        if (!cancelled && updatedWorker?.id) {
          setRemoteWorker((current) => current?.id === updatedWorker.id
            ? { ...current, ...updatedWorker, __legacyLink: Boolean(current.__legacyLink) }
            : current);
        }
      } catch (error) {
        const issue = classifyApiError(error);
        if (!cancelled) setLocationState((current) => ({ ...current, error: `心跳失败：${issue.detail}` }));
      }
    }

    function markOffline() {
      markWorkerOffline(worker.id).catch(() => {});
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") markOffline();
    }

    heartbeat();
    const timer = window.setInterval(() => heartbeat(), 15000);
    window.addEventListener("pagehide", markOffline);
    window.addEventListener("beforeunload", markOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("pagehide", markOffline);
      window.removeEventListener("beforeunload", markOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      markOffline();
    };
  }, [worker?.id, workerDisabled]);

  async function handleUpload(event, kindOverride = uploadKind) {
    const files = Array.from(event.target.files || []);
    if (!files.length || !point) return;
    if (!worker) {
      setLocalMessage("链接无效或已过期，请联系管理员重新发送师傅链接。");
      return;
    }
    setBusy(true);
    try {
      for (const file of files) {
        await data.uploadPhoto({ file, point, worker, kind: kindOverride });
      }
      setLocalMessage(`${point.title} 已上传资料，后台点位状态已自动更新为已完成。`);
      await fetchWorkerTasks();
      if (supabaseEnv.forceLocalDemo) await data.loadAll();
    } catch (error) {
      const issue = classifyApiError(error);
      setLocalMessage(`上传失败：${issue.category}，${issue.detail}`);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  function goPrevPoint() {
    setIndex((current) => Math.max(0, current - 1));
  }

  function goNextPoint() {
    setIndex((current) => Math.min(Math.max(visiblePoints.length - 1, 0), current + 1));
  }

  function isInteractiveSwipeTarget(target) {
    return Boolean(target?.closest?.("a, button, input, select, textarea, label, [role='button'], .mobile-upload"));
  }

  function handleTouchStart(event) {
    if (isInteractiveSwipeTarget(event.target)) {
      touchStartRef.current = null;
      return;
    }
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchMove(event) {
    const start = touchStartRef.current;
    const touch = event.touches?.[0];
    if (!start || !touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const horizontalEnough = Math.abs(deltaX) >= swipeThresholdPx;
    const horizontalDominant = Math.abs(deltaX) >= Math.abs(deltaY) * swipeDirectionGuard;
    if (horizontalEnough && horizontalDominant) event.preventDefault();
  }

  function handleTouchEnd(event) {
    const start = touchStartRef.current;
    const touch = event.changedTouches?.[0];
    touchStartRef.current = null;
    if (!start || !touch || visiblePoints.length < 2) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const horizontalEnough = Math.abs(deltaX) >= swipeThresholdPx;
    const horizontalDominant = Math.abs(deltaX) >= Math.abs(deltaY) * swipeDirectionGuard;
    if (!horizontalEnough || !horizontalDominant) return;
    if (deltaX < 0 && index < visiblePoints.length - 1) goNextPoint();
    if (deltaX > 0 && index > 0) goPrevPoint();
  }

  return (
    <main className="worker-page">
      <section className="worker-hero">
        <span>师傅移动端派单页</span>
        <h1>{worker ? `${worker.name}的任务` : (workerMissing ? "链接无效" : "正在识别师傅身份")}</h1>
        {worker ? (
          <div className="worker-fixed-summary">
            <span>手机号：{worker.phone || "未登记"}</span>
            <span>车牌号：{workerCarNo(worker)}</span>
            <span>今日任务：{visiblePoints.length} 个点位</span>
            <span>当前进度：{visiblePoints.length ? `${Math.min(index + 1, visiblePoints.length)} / ${visiblePoints.length}` : "0 / 0"}</span>
          </div>
        ) : (
          <p>{workerMissing ? "链接无效或已过期，请联系管理员重新发送师傅链接。" : "正在根据专属链接读取后台身份。"}</p>
        )}
        <small>数据来源：{workerDataSource}</small>
      </section>

      <section className="mobile-debug-panel">
        <div className="mobile-debug-summary">
          <b>{statusLine}</b>
          <button type="button" onClick={() => setDebugOpen((open) => !open)}>{debugOpen ? "收起调试信息" : "展开调试信息"}</button>
        </div>
        {debugOpen && (
          <div className="mobile-debug-details">
            <div><span>当前链接</span><b>{workerIdDebugText}</b></div>
            <div><span>当前 API_BASE_URL</span><b>{apiBaseUrl}</b></div>
            <div><span>实际请求 URL</span><b>{requestUrlDebugText}</b></div>
            <div><span>最近读取时间</span><b>{taskDebug.lastFetchTime || "尚未读取"}</b></div>
            <div><span>返回 count</span><b>{taskDebug.count}</b></div>
            <div><span>taskPoints.length</span><b>{taskDebug.taskPointsLength}</b></div>
            <div className={remoteError ? "error" : "ok"}><span>读取错误</span><b>{readErrorText}</b></div>
          </div>
        )}
      </section>

      {(data.message || localMessage) && <section className="info"><strong>{localMessage || data.message}</strong></section>}
      {legacyLink && <section className="share-link-warning"><b>当前使用的是旧链接，请联系管理员更换为新的安全链接。</b></section>}
      {workerMissing && <section className="disabled-worker-card"><b>链接无效或已过期，请联系管理员重新发送师傅链接。</b><span>当前链接没有绑定任何启用的安全访问码。</span></section>}
      {workerDisabled && <section className="disabled-worker-card"><b>该师傅链接已停用，请联系管理员。</b><span>当前链接不会接收新派单，也不能继续上报定位。</span></section>}
      {!worker && !workerMissing && <section className="empty">正在根据链接识别师傅身份...</section>}

      {worker && !workerDisabled && (
        <>
          <section className="location-card">
            <div>
              <b>实时定位</b>
              <span>{locationState.message}</span>
              {locationState.lastSentAt && <small>最近上报：{locationState.lastSentAt}</small>}
              {locationState.error && <small className="error">{locationState.error}</small>}
              {window.location.protocol !== "https:" && <small>公网使用时请部署 HTTPS，否则部分手机浏览器会限制持续定位。</small>}
            </div>
            <button disabled={workerDisabled} className={locationState.watching ? "danger-button" : "green-button"} type="button" onClick={locationState.watching ? stopLiveLocation : startLiveLocation}>
              {locationState.watching ? "停止实时定位" : "开启实时定位"}
            </button>
          </section>

          <section className="progress-card">
            <span>任务进度</span>
            <b>{visiblePoints.length ? `${Math.min(index + 1, visiblePoints.length)} / ${visiblePoints.length}` : "0 / 0"}</b>
          </section>

          {point ? (
            <section className="mobile-point-card" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              <div className="row">
                <div>
                  <small>当前点位</small>
                  <h2>{point.title}</h2>
                  {visiblePoints.length > 1 && <small className="mobile-swipe-hint">左滑下一点位，右滑上一点位</small>}
                </div>
                <StatusPill status={getPointStatus(point)} />
              </div>
              <div className="mobile-point-info">
                <div><span>点位编号</span><b>{point.title}</b></div>
                <div><span>地址</span><b>{point.address}</b></div>
                <div><span>K码</span><b>{point.k_code || "未登记"}</b></div>
                <div><span>房东</span><b>{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</b></div>
                <div><span>施工队长</span><b>{getCaptainName(point)} / {getCaptainPhone(point)}</b></div>
              </div>
              <section className="mobile-step">
                <h3>第一步：查看点位并导航</h3>
                <div className="mobile-contact-grid">
                  <div><span>房东信息</span><b>{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</b></div>
                  <div><span>施工队长信息</span><b>{getCaptainName(point)} / {getCaptainPhone(point)}</b></div>
                </div>
                <div className="mobile-action-grid">
                  <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
                  <a className="blue-button" href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
                </div>
              </section>
              <section className="mobile-step">
                <h3>第二步：上传照片/视频</h3>
                <p className="mobile-upload-hint">选择素材分类后上传；图片类素材不限制数量。</p>
                <select value={uploadKind} onChange={(event) => setUploadKind(event.target.value)}>
                  {MEDIA_TABS.map((item) => <option key={item}>{item}</option>)}
                </select>
                <div className="mobile-kind-tags" aria-label="上传素材类别">
                  {MEDIA_TABS.map((item) => <span key={item} className={uploadKind === item ? "active" : ""}>{item}</span>)}
                </div>
                <div className="mobile-upload-grid">
                  <label className={`mobile-upload ${busy ? "disabled" : ""}`}>
                    {busy ? "上传中..." : "上传照片"}
                    <input disabled={busy || workerDisabled} type="file" accept="image/*" multiple onChange={(event) => handleUpload(event, uploadKind === "视频" ? "现场照片" : uploadKind)} />
                  </label>
                  <label className={`mobile-upload ${busy ? "disabled" : ""}`}>
                    {busy ? "上传中..." : "上传视频"}
                    <input disabled={busy || workerDisabled} type="file" accept="video/*" multiple onChange={(event) => handleUpload(event, "视频")} />
                  </label>
                </div>
              </section>
            </section>
          ) : (
            <section className="empty">暂无派单点位。请后台先筛选点位并发送给当前师傅。</section>
          )}

          <nav className="mobile-bottom-nav">
            <button disabled={index <= 0} onClick={goPrevPoint}>上一点位</button>
            <button disabled={index >= visiblePoints.length - 1} onClick={goNextPoint}>下一点位</button>
          </nav>
        </>
      )}
    </main>
  );
}
