import React from "react";

import {
  amapMarkerUrl,
  amapNavigationUrl,
  getCaptainName,
  getCaptainPhone,
  getPointAnomalies,
  getPointStatus,
  getProjectName,
  getScoutName,
  getScoutPhone,
  isWorkerOnline,
  mediaCounts,
  taskPointId,
  taskCountForWorker,
  taskWorkerId,
  workerCarNo,
  workerLastLocationText,
  workerLastSeenText,
  workerMotionLabel,
} from "../../lib/domain";
import { StatusBadge } from "../shared/StatusBadge";

export function MapSidebar({
  tab,
  setTab,
  points,
  workers,
  selectedPoint,
  selectedWorker,
  selectedIds,
  setSelectedIds,
  photos,
  tasks = [],
  projects = [],
  trackLogs = [],
  areaSelection,
  areaPoints = [],
  areaSummary,
  dispatchWorkerId,
  setDispatchWorkerId,
  onDispatch,
  onOpenSite,
  onEditPoint,
  onSelectPoint,
}) {
  const tabs = ["点位筛选", "区域汇总", "派单", "点位详情", "师傅详情", "轨迹回放"];
  const selectedPoints = points.filter((point) => selectedIds.includes(point.id));
  const workerById = new Map(workers.map((worker) => [String(worker.id), worker]));
  const today = new Date().toISOString().slice(0, 10);
  const selectedWorkerTrackLogs = selectedWorker
    ? trackLogs
      .filter((log) => String(log.worker_id || log.workerId) === String(selectedWorker.id))
      .filter((log) => String(log.recorded_at || log.timestamp || log.created_at || "").startsWith(today))
      .sort((a, b) => new Date(b.recorded_at || b.timestamp || b.created_at || 0).getTime() - new Date(a.recorded_at || a.timestamp || a.created_at || 0).getTime())
    : [];

  function assignedWorkersForPoint(point) {
    return tasks
      .filter((task) => String(taskPointId(task)) === String(point?.id))
      .map((task) => workerById.get(String(taskWorkerId(task)))?.name || taskWorkerId(task))
      .filter(Boolean);
  }

  return (
    <aside className="enterprise-sidebar-panel map-side-panel">
      <div className="map-side-tabs">
        {tabs.map((item) => <button key={item} type="button" className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
      </div>
      <div className="map-side-content">
        {tab === "点位筛选" && (
          <div className="map-filter-list">
            <div className="dispatch-title">
              <b>当前筛选点位</b>
              <span>{points.length} 个</span>
            </div>
            <button type="button" onClick={() => setSelectedIds(points.map((point) => point.id))}>全选当前筛选</button>
            {points.slice(0, 80).map((point) => (
              <article key={point.id} className={selectedPoint?.id === point.id ? "active" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(point.id)}
                    onChange={() => setSelectedIds((current) => current.includes(point.id) ? current.filter((id) => id !== point.id) : [...current, point.id])}
                  />
                  <span>
                    <b>{point.title}</b>
                    <small>{point.address}</small>
                  </span>
                </label>
                <button type="button" onClick={() => onSelectPoint?.(point)}>定位</button>
                <StatusBadge tone="info">{getPointStatus(point)}</StatusBadge>
              </article>
            ))}
          </div>
        )}
        {tab === "区域汇总" && (
          <div className="map-area-summary">
            <div className="dispatch-title">
              <b>{areaSummary?.label || "区域汇总"}</b>
              <span>{areaSelection ? "已生成" : "框选/圈选后生成"}</span>
            </div>
            <div className="summary-grid">
              <div><span>点位数</span><b>{areaSummary?.pointCount || 0}</b></div>
              <div><span>待派点数</span><b>{areaSummary?.unassigned || 0}</b></div>
              <div><span>异常数</span><b>{areaSummary?.abnormal || 0}</b></div>
              <div><span>在线师傅数</span><b>{areaSummary?.onlineWorkers || 0}</b></div>
            </div>
            <div className="map-selected-points">
              {areaPoints.slice(0, 18).map((point) => <span key={point.id}>{point.title}</span>)}
              {!areaPoints.length && <small>在地图上切到“框选”或“圈选”，拖动选择区域后这里会显示区域点位。</small>}
            </div>
            <div className="detail-actions">
              <button type="button" disabled={!areaPoints.length} onClick={() => setSelectedIds(areaPoints.map((point) => point.id))}>选中区域点位</button>
              <button className="blue-button" type="button" disabled={!areaPoints.length || !dispatchWorkerId} onClick={onDispatch}>一键批量派单</button>
            </div>
          </div>
        )}
        {tab === "派单" && (
          <div className="map-dispatch-box">
            <div className="dispatch-title">
              <b>地图派单</b>
              <span>已选 {selectedPoints.length}</span>
            </div>
            <select value={dispatchWorkerId} onChange={(event) => setDispatchWorkerId(event.target.value)}>
              {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} / {workerCarNo(worker)}</option>)}
            </select>
            <div className="map-selected-points">
              {selectedPoints.slice(0, 10).map((point) => <span key={point.id}>{point.title}</span>)}
              {!selectedPoints.length && <small>请先在点位筛选里勾选点位。</small>}
            </div>
            <button className="blue-button full" type="button" disabled={!selectedPoints.length || !dispatchWorkerId} onClick={onDispatch}>发送到师傅端</button>
          </div>
        )}
        {tab === "点位详情" && (
          selectedPoint ? (() => {
            const counts = mediaCounts(selectedPoint, photos);
            const anomalies = getPointAnomalies(selectedPoint, photos, tasks, projects);
            const assigned = assignedWorkersForPoint(selectedPoint);
            return (
              <div className="map-detail-view">
                <div className="detail-title">
                  <b>{selectedPoint.title}</b>
                  <StatusBadge tone="info">{getPointStatus(selectedPoint)}</StatusBadge>
                </div>
                <p>{selectedPoint.address}</p>
                <div className="detail-grid single">
                  <div><span>项目</span><b>{getProjectName(selectedPoint)}</b></div>
                  <div><span>房东</span><b>{selectedPoint.landlord_name || "未登记"} / {selectedPoint.landlord_phone || "未登记"}</b></div>
                  <div><span>当前状态</span><b>{getPointStatus(selectedPoint)}</b></div>
                  <div><span>已派师傅</span><b>{assigned.length ? assigned.join("、") : "未派单"}</b></div>
                  <div><span>K码</span><b>{selectedPoint.k_code || "未登记"}</b></div>
                  <div><span>施工队长</span><b>{getCaptainName(selectedPoint)} / {getCaptainPhone(selectedPoint)}</b></div>
                  <div><span>找墙队伍</span><b>{getScoutName(selectedPoint)} / {getScoutPhone(selectedPoint)}</b></div>
                  <div><span>素材情况</span><b>现场 {counts.site} / 720 {counts.pano} / 水印 {counts.watermark} / 凯立德 {counts.kailide} / 协议 {counts.agreement} / 视频 {counts.video}</b></div>
                  <div><span>异常情况</span><b>{anomalies.length ? anomalies.join("、") : "暂无异常"}</b></div>
                </div>
                <div className="detail-actions">
                  <button onClick={() => onOpenSite(selectedPoint)}>现场查看</button>
                  <button onClick={() => onEditPoint(selectedPoint)}>编辑</button>
                  <a href={amapMarkerUrl(selectedPoint)} target="_blank" rel="noreferrer">高德查看</a>
                  <a className="blue-button" href={amapNavigationUrl(selectedPoint)} target="_blank" rel="noreferrer">高德导航</a>
                </div>
              </div>
            );
          })() : <div className="enterprise-empty">点击地图点位查看详情。</div>
        )}
        {tab === "师傅详情" && (
          selectedWorker ? (() => {
            const workerTasks = tasks.filter((task) => String(taskWorkerId(task)) === String(selectedWorker.id));
            const taskTitles = workerTasks
              .map((task) => points.find((point) => String(point.id) === String(taskPointId(task)))?.title)
              .filter(Boolean);
            const online = isWorkerOnline(selectedWorker);
            return (
              <div className="map-detail-view">
                <div className="detail-title">
                  <b>{selectedWorker.name}</b>
                  <span className={`status-badge ${online ? "success" : "neutral"}`}>{online ? workerMotionLabel(selectedWorker) : "离线"}</span>
                </div>
                <div className="detail-grid single">
                  <div><span>手机</span><b>{selectedWorker.phone || "未登记"}</b></div>
                  <div><span>车牌</span><b>{workerCarNo(selectedWorker)}</b></div>
                  <div><span>在线状态</span><b>{online ? "在线" : "离线"}</b></div>
                  <div><span>当前任务</span><b>{taskCountForWorker(tasks, selectedWorker.id)} 个{taskTitles.length ? `，涉及 ${taskTitles.slice(0, 3).join("、")}` : ""}</b></div>
                  <div><span>最近上报时间</span><b>{workerLastLocationText(selectedWorker)} / 心跳 {workerLastSeenText(selectedWorker)}</b></div>
                  <div><span>最近坐标</span><b>{selectedWorker.lng || "-"}, {selectedWorker.lat || "-"}</b></div>
                  <div><span>今日轨迹</span><b>{selectedWorkerTrackLogs.length ? `${selectedWorkerTrackLogs.length} 条` : "暂无轨迹记录"}</b></div>
                </div>
                <div className="track-mini-list">
                  {selectedWorkerTrackLogs.slice(0, 5).map((log) => (
                    <article key={log.id || `${log.recorded_at}-${log.lng}`}>
                      <b>{log.event || "定位上报"}</b>
                      <span>{log.recorded_at || log.timestamp || log.created_at} · {log.lng}, {log.lat}</span>
                    </article>
                  ))}
                </div>
              </div>
            );
          })() : <div className="enterprise-empty">点击小车 marker 查看师傅详情。</div>
        )}
        {tab === "轨迹回放" && (
          <div className="map-detail-view">
            <div className="dispatch-title">
              <b>轨迹回放基础</b>
              <span>{selectedWorker ? selectedWorker.name : "未选择师傅"}</span>
            </div>
            <p>当前基础版读取最近位置与 trackLogs，按今天轨迹倒序展示。</p>
            {selectedWorker ? (
              <div className="track-mini-list">
                {selectedWorkerTrackLogs.map((log) => (
                  <article key={log.id || `${log.recorded_at}-${log.lng}`}>
                    <b>{log.event || "定位上报"}</b>
                    <span>{log.recorded_at || log.timestamp || log.created_at} · 速度 {log.speed ?? 0} · {log.lng}, {log.lat}</span>
                  </article>
                ))}
                {!selectedWorkerTrackLogs.length && <div className="enterprise-empty">该师傅今天暂无轨迹；开启师傅端实时定位后会写入。</div>}
              </div>
            ) : <div className="enterprise-empty">请先点击地图上的小车 Marker。</div>}
          </div>
        )}
      </div>
    </aside>
  );
}
