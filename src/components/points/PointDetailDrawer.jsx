import React, { useEffect } from "react";

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
import { StatusPill } from "../shared/StatusBadge";

export function PointDetailDrawer({ point, photos, tasks, workers, onClose, onEdit, onSite, projects = [] }) {
  if (!point) return null;

  useEffect(() => {
    const { style: bodyStyle } = document.body;
    const { style: htmlStyle } = document.documentElement;
    const prevBodyOverflow = bodyStyle.overflow;
    const prevHtmlOverflow = htmlStyle.overflow;
    bodyStyle.overflow = "hidden";
    htmlStyle.overflow = "hidden";
    return () => {
      bodyStyle.overflow = prevBodyOverflow;
      htmlStyle.overflow = prevHtmlOverflow;
    };
  }, []);

  const mapped = getPointDisplayModel(point, { projects, tasks, workers });
  const media = pointMedia(point, photos);
  const counts = mediaCounts(point, photos);
  const records = pointTasks(tasks, point.id);
  const completion = pointMaterialCompletion(point, photos, projects);
  const ready = isPointReadyForAcceptance(point, photos, projects);

  return (
    <div className="detailOverlay" role="dialog" aria-modal="true">
      <button className="detailOverlayScrim" type="button" aria-label="关闭详情弹窗" onClick={onClose} />
      <section className="detailModal pointDetailModal">
        <header className="pointDetailModalHeader">
          <div className="pointDetailHeading">
            <small>点位详情 / Point Detail</small>
            <h2>{mapped.code}</h2>
            <p>{mapped.address}</p>
          </div>
          <div className="pointDetailHeaderAside">
            <div className="pointDetailMeta">
              <StatusPill status={getPointStatus(point)} />
              <span>{ready ? "可验收" : "待补齐"}</span>
            </div>
            <button className="icon-button pointDetailClose" type="button" onClick={onClose} aria-label="关闭">×</button>
          </div>
        </header>
        <div className="detailModalBody pointDetailModalBody">
          <div className="detailLayout pointDetailLayout">
            <aside className="detailInfo pointDetailInfo">
              <div className="detailBlockTitle">
                <b>基础信息</b>
                <span>{mapped.projectName}</span>
              </div>
              <div><span>点位编号</span><b>{mapped.code}</b></div>
              <div><span>K码</span><b>{mapped.kCode}</b></div>
              <div><span>地址</span><b>{mapped.address}</b></div>
              <div><span>当前师傅</span><b>{mapped.currentWorkerName}</b></div>
              <div><span>施工队长</span><b>{mapped.captainName} / {mapped.captainPhone}</b></div>
              <div><span>找墙队伍</span><b>{mapped.scoutName} / {mapped.scoutPhone}</b></div>
              <div><span>最近更新</span><b>{cnTime(getPointUpdatedAt(point))}</b></div>
            </aside>
            <div className="detailMain pointDetailMain">
              <section className="detailMetrics pointDetailMetrics">
                <article>
                  <span>素材完成度</span>
                  <b>{completion.completedCount}/{completion.requiredCount}</b>
                  <em><i style={{ width: `${completion.ratio}%` }} /></em>
                  <small>{completion.ratio}%</small>
                </article>
                <article>
                  <span>验收状态</span>
                  <b>{ready ? "可验收" : "待补齐"}</b>
                  <small>{completion.status}</small>
                </article>
                <article>
                  <span>当前素材</span>
                  <b>{media.length}</b>
                  <small>现场 / 全景 / 视频已汇总</small>
                </article>
              </section>

              <section className="requiredPanel pointRequiredPanel">
                <h3>素材概览</h3>
                <div>
                  <span className={counts.site ? "done" : "missing"}>现场照片 {counts.site}</span>
                  <span className={counts.pano ? "done" : "missing"}>720 全景 {counts.pano}</span>
                  <span className={counts.video ? "done" : "missing"}>视频 {counts.video}</span>
                  <span className={counts.watermark ? "done" : "missing"}>水印照片 {counts.watermark}</span>
                  <span className={counts.kailide ? "done" : "missing"}>凯立德图片 {counts.kailide}</span>
                  <span className={counts.agreement ? "done" : "missing"}>墙租协议图片 {counts.agreement}</span>
                </div>
                <div className="material-completion-cell drawer-material-status">
                  <b>{completion.status} · {completion.completedCount}/{completion.requiredCount}</b>
                  <span>{completion.missing.length ? `缺少：${completion.missing.join("、")}` : "必传素材已齐套"}</span>
                </div>
              </section>

              <section className="timelinePanel pointTimelinePanel">
                <h3>派单记录</h3>
                {records.map((task) => {
                  const worker = workers.find((item) => item.id === (task.worker_id || task.workerId));
                  return (
                    <div key={task.id}>
                      <time>{cnTime(task.assigned_at || task.created_at)}</time>
                      <span>{task.status || "施工中"}</span>
                      <b>{worker?.name || task.worker_id || "师傅"}</b>
                    </div>
                  );
                })}
                {!records.length && <small>暂无派单记录</small>}
              </section>

              <section className="detailMedia pointDetailMedia">
                <h3>素材文件</h3>
                <div className="mini-media-grid">
                  {media.slice(0, 6).map((item) => <span key={item.id || item.file_name || item.url}>{item.file_name || item.kind || "现场资料"}</span>)}
                  {!media.length && <small>暂无素材</small>}
                </div>
              </section>
              <section className="pointDetailActions">
                <button type="button" onClick={() => onSite(point)}>现场查看</button>
                <button type="button" onClick={() => onEdit(point)}>编辑点位</button>
                <a href={amapMarkerUrl(point)} target="_blank" rel="noreferrer">高德查看</a>
                <a className="blue-button" href={amapNavigationUrl(point)} target="_blank" rel="noreferrer">高德导航</a>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
