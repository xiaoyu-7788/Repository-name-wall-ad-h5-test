import React from "react";

import {
  amapMarkerUrl,
  amapNavigationUrl,
  cnTime,
  getPointDisplayModel,
  getPointStatus,
  getPointUpdatedAt,
  isPointReadyForAcceptance,
  mediaCounts,
  pointMaterialCompletion,
  pointMedia,
  pointTasks,
} from "../../lib/domain";
import { Drawer } from "../shared/Drawer";
import { StatusPill } from "../shared/StatusBadge";

export function PointDetailDrawer({ point, photos, tasks, workers, onClose, onEdit, onSite, projects = [] }) {
  if (!point) return null;

  const mapped = getPointDisplayModel(point, { projects, tasks, workers });
  const media = pointMedia(point, photos);
  const counts = mediaCounts(point, photos);
  const records = pointTasks(tasks, point.id);
  const completion = pointMaterialCompletion(point, photos, projects);
  const ready = isPointReadyForAcceptance(point, photos, projects);

  return (
    <Drawer title={mapped.code} subtitle={mapped.projectName} onClose={onClose} width="680px">
      <div className="drawer-section pointDetailDrawer">
        <div className="pointDetailHead">
          <StatusPill status={getPointStatus(point)} />
          <span>{mapped.address}</span>
          <b>{ready ? "可验收" : "待补齐"}</b>
        </div>
        <div className="detail-grid single pointDetailGrid">
          <div><span>点位编号</span><b>{mapped.code}</b></div>
          <div><span>K码</span><b>{mapped.kCode}</b></div>
          <div><span>项目</span><b>{mapped.projectName}</b></div>
          <div><span>地址</span><b>{mapped.address}</b></div>
          <div><span>当前师傅</span><b>{mapped.currentWorkerName}</b></div>
          <div><span>施工队长</span><b>{mapped.captainName} / {mapped.captainPhone}</b></div>
          <div><span>找墙队伍</span><b>{mapped.scoutName} / {mapped.scoutPhone}</b></div>
          <div><span>最近更新</span><b>{cnTime(getPointUpdatedAt(point))}</b></div>
          <div><span>素材情况</span><b>{completion.completedCount}/{completion.requiredCount} · {completion.ratio}%</b></div>
        </div>
      </div>

      <div className="drawer-section pointDetailDrawer">
        <h3>素材概览</h3>
        <div className="pointMediaStrip">
          <span>现场照片 {counts.site}</span>
          <span>720 全景 {counts.pano}</span>
          <span>视频 {counts.video}</span>
          <span>水印照片 {counts.watermark}</span>
          <span>凯立德图片 {counts.kailide}</span>
          <span>墙租协议图片 {counts.agreement}</span>
        </div>
        <div className="material-completion-cell drawer-material-status">
          <b>{completion.status} · {completion.completedCount}/{completion.requiredCount}</b>
          <span>{completion.missing.length ? `缺少：${completion.missing.join("、")}` : "必传素材已齐套"}</span>
        </div>
        <div className="mini-media-grid">
          {media.slice(0, 6).map((item) => <span key={item.id || item.file_name || item.url}>{item.file_name || item.kind || "现场资料"}</span>)}
          {!media.length && <small>暂无素材</small>}
        </div>
      </div>

      <div className="drawer-section pointDetailDrawer">
        <h3>派单记录</h3>
        <div className="record-list">
          {records.map((task) => {
            const worker = workers.find((item) => item.id === (task.worker_id || task.workerId));
            return <article key={task.id}><b>{worker?.name || task.worker_id || "师傅"}</b><span>{task.status || "施工中"} · {cnTime(task.assigned_at || task.created_at)}</span></article>;
          })}
          {!records.length && <small>暂无派单记录</small>}
        </div>
      </div>

      <div className="drawer-actions pointDetailActions">
        <button type="button" onClick={() => onSite(point)}>现场查看</button>
        <button type="button" onClick={() => onEdit(point)}>编辑点位</button>
        <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
        <a className="blue-button" href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
      </div>
    </Drawer>
  );
}
