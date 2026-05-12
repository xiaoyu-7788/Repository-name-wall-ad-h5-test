import React from "react";

import {
  amapMarkerUrl,
  amapNavigationUrl,
  cnTime,
  getCaptainName,
  getCaptainPhone,
  getPointStatus,
  getProjectName,
  getScoutName,
  getScoutPhone,
  mediaCounts,
  pointMaterialCompletion,
  pointMedia,
  pointTasks,
  assignedWorkersForPoint,
  isPointReadyForAcceptance,
} from "../../lib/domain";
import { Drawer } from "../shared/Drawer";
import { StatusPill } from "../shared/StatusBadge";

export function PointDetailDrawer({ point, photos, tasks, workers, onClose, onEdit, onSite }) {
  if (!point) return null;
  const media = pointMedia(point, photos);
  const counts = mediaCounts(point, photos);
  const records = pointTasks(tasks, point.id);
  const completion = pointMaterialCompletion(point, photos, []);
  const assigned = assignedWorkersForPoint(point, tasks, workers);
  const ready = isPointReadyForAcceptance(point, photos, []);

  return (
    <Drawer title={point.title || "点位详情"} subtitle={point.address} onClose={onClose} width="560px">
      <div className="drawer-section">
        <div className="detail-title">
          <StatusPill status={getPointStatus(point)} />
          <span>{getProjectName(point)}</span>
        </div>
        <div className="detail-grid single">
          <div><span>K码</span><b>{point.k_code || "未登记"}</b></div>
          <div><span>房东</span><b>{point.landlord_name || "未登记"} / {point.landlord_phone || "未登记"}</b></div>
          <div><span>施工队长</span><b>{getCaptainName(point)} / {getCaptainPhone(point)}</b></div>
          <div><span>找墙队伍</span><b>{getScoutName(point)} / {getScoutPhone(point)}</b></div>
          <div><span>经纬度</span><b>{point.lng || "-"}, {point.lat || "-"}</b></div>
          <div><span>当前师傅</span><b>{assigned.length ? assigned.map((worker) => worker.name).join("、") : "未派单"}</b></div>
          <div><span>验收状态</span><b>{ready ? "可验收" : "待补齐"}</b></div>
          <div><span>最近更新时间</span><b>{cnTime(point.updated_at || point.created_at)}</b></div>
        </div>
      </div>
      <div className="drawer-section">
        <h3>素材预览</h3>
        <div className="media-count-strip">
          <span>照片 {counts.site}</span>
          <span>全景 {counts.pano}</span>
          <span>视频 {counts.video}</span>
          <span>水印 {counts.watermark}</span>
          <span>凯立德 {counts.kailide}</span>
          <span>协议 {counts.agreement}</span>
        </div>
        <div className="material-completion-cell drawer-material-status">
          <b>{completion.status} · {completion.completedCount}/{completion.requiredCount}</b>
          <span>{completion.missing.length ? `缺少：${completion.missing.join("、")}` : "必传素材已齐套"}</span>
        </div>
        <div className="mini-media-grid">
          {media.slice(0, 6).map((item) => <span key={item.id}>{item.file_name || item.kind || "现场资料"}</span>)}
          {!media.length && <small>暂无素材</small>}
        </div>
      </div>
      <div className="drawer-section">
        <h3>派单记录</h3>
        <div className="record-list">
          {records.map((task) => {
            const worker = workers.find((item) => item.id === (task.worker_id || task.workerId));
            return <article key={task.id}><b>{worker?.name || task.worker_id || "师傅"}</b><span>{task.status || "施工中"} · {cnTime(task.assigned_at || task.created_at)}</span></article>;
          })}
          {!records.length && <small>暂无派单记录</small>}
        </div>
      </div>
      <div className="drawer-actions">
        <button type="button" onClick={() => onSite(point)}>现场查看</button>
        <button type="button" onClick={() => onEdit(point)}>编辑点位</button>
        <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
        <a className="blue-button" href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
      </div>
    </Drawer>
  );
}
