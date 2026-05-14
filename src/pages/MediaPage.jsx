import React, { useMemo, useState } from "react";

import { Modal } from "../components/shared/Modal";
import { MediaCard } from "../components/media/MediaCard";
import { createZip, textFile } from "../lib/zipArchive";
import {
  getMediaUrl,
  getPointAnomalies,
  getPointStatus,
  getProjectName,
  isDateInRange,
  mediaCounts,
  mediaKind,
  normalizeMaterialRules,
  normalizeProjects,
  safeJson,
} from "../lib/domain";

function safePathPart(value = "") {
  return String(value || "未命名").replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_");
}

function extensionFromMedia(photo, kind) {
  const fileName = String(photo.file_name || "");
  const match = fileName.match(/\.([a-zA-Z0-9]{2,8})$/);
  if (match) return match[1].toLowerCase();
  const mime = String(photo.mime_type || photo.content_type || photo.type || "").toLowerCase();
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("quicktime")) return "mov";
  return kind === "视频" ? "mp4" : "jpg";
}

export function MediaPage({ data, activeProject, timeRange = "最近7天", globalSearch = "", focusPointId = "", onOpenSite }) {
  const [filters, setFilters] = useState({
    project: activeProject,
    pointId: "all",
    kind: "全部素材",
    date: "",
    timeRange,
    workerId: "all",
    status: "全部状态",
    keyword: "",
  });
  const [preview, setPreview] = useState(null);
  const projects = normalizeProjects(data.projects, data.points);
  const points = data.points.filter((point) => filters.project === "all" || getProjectName(point) === filters.project);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, project: activeProject }));
  }, [activeProject]);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, timeRange }));
  }, [timeRange]);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, keyword: globalSearch }));
  }, [globalSearch]);

  React.useEffect(() => {
    if (focusPointId) {
      setFilters((current) => ({ ...current, pointId: focusPointId, status: "全部状态" }));
    }
  }, [focusPointId]);

  function materialStatus(point) {
    const counts = mediaCounts(point, data.photos);
    if (!counts.total) return "无素材";
    const missing = getPointAnomalies(point, data.photos, data.tasks, data.projects).filter((item) => item.startsWith("缺"));
    return missing.length ? "待补齐" : "齐套";
  }

  const visible = useMemo(() => data.photos.filter((photo) => {
    const point = data.points.find((item) => item.id === (photo.point_id || photo.pointId));
    const worker = data.workers.find((item) => String(item.id) === String(photo.worker_id || photo.workerId));
    const keyword = filters.keyword.trim().toLowerCase();
    const projectOk = filters.project === "all" || getProjectName(point) === filters.project;
    const pointOk = filters.pointId === "all" || (photo.point_id || photo.pointId) === filters.pointId;
    const kindOk = filters.kind === "全部素材" || mediaKind(photo) === filters.kind;
    const dateOk = !filters.date || String(photo.created_at || "").startsWith(filters.date);
    const timeOk = isDateInRange(photo.created_at || photo.createdAt, filters.timeRange);
    const workerOk = filters.workerId === "all" || (photo.worker_id || photo.workerId) === filters.workerId;
    const classifiedOk = filters.status === "已分类" ? Boolean(photo.kind || photo.media_kind) : filters.status === "待分类" ? !photo.kind && !photo.media_kind : true;
    const completionOk = ["齐套", "待补齐", "无素材"].includes(filters.status) ? point && materialStatus(point) === filters.status : true;
    const haystack = [
      point?.title,
      point?.address,
      getProjectName(point),
      worker?.name,
      photo.file_name,
      mediaKind(photo),
    ].join(" ").toLowerCase();
    return projectOk && pointOk && kindOk && dateOk && timeOk && workerOk && classifiedOk && completionOk && (!keyword || haystack.includes(keyword));
  }), [data.photos, data.points, data.workers, filters]);

  const scopedPoints = useMemo(() => data.points.filter((point) => filters.project === "all" || getProjectName(point) === filters.project), [data.points, filters.project]);

  const materialSummary = useMemo(() => {
    const rows = scopedPoints.map((point) => {
      const status = materialStatus(point);
      return { point, status, counts: mediaCounts(point, data.photos), missing: getPointAnomalies(point, data.photos, data.tasks, data.projects).filter((item) => item.startsWith("缺")) };
    });
    return {
      rows,
      complete: rows.filter((row) => row.status === "齐套").length,
      partial: rows.filter((row) => row.status === "待补齐").length,
      empty: rows.filter((row) => row.status === "无素材").length,
    };
  }, [scopedPoints, data.photos, data.tasks, data.projects]);

  const previewRows = materialSummary.rows.slice(0, 6);

  function exportList() {
    const blob = new Blob([safeJson(visible)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `media-list-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function archiveManifest() {
    const counters = new Map();
    return visible.map((photo) => {
      const point = data.points.find((item) => item.id === (photo.point_id || photo.pointId));
      const project = getProjectName(point);
      const kind = mediaKind(photo);
      const pointTitle = point?.title || "未知点位";
      const counterKey = `${project}/${pointTitle}/${kind}`;
      const index = (counters.get(counterKey) || 0) + 1;
      counters.set(counterKey, index);
      const ext = extensionFromMedia(photo, kind);
      const fileName = `${safePathPart(pointTitle)}_${safePathPart(kind)}_${String(index).padStart(3, "0")}.${ext}`;
      return {
        id: photo.id,
        project,
        pointId: point?.id || photo.point_id || photo.pointId,
        pointTitle,
        kind,
        originalFileName: photo.file_name || "",
        fileName,
        url: getMediaUrl(photo),
        archivePath: `${safePathPart(project)}/${safePathPart(pointTitle)}/${safePathPart(kind)}/${fileName}`,
        createdAt: photo.created_at || photo.createdAt || "",
      };
    });
  }

  function downloadArchiveManifest() {
    const manifest = archiveManifest();
    const blob = new Blob([safeJson({ archiveRule: "项目 / 点位编号 / 素材分类", total: manifest.length, files: manifest })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `media-archive-manifest-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadArchiveZip() {
    const manifest = archiveManifest();
    const dirs = new Set();
    const entries = [
      { name: "manifest.json", data: textFile(safeJson({ archiveRule: "项目 / 点位编号 / 素材分类", total: manifest.length, files: manifest })) },
    ];
    for (const item of manifest) {
      const parts = item.archivePath.split("/").slice(0, -1);
      parts.reduce((path, part) => {
        const next = path ? `${path}/${part}` : part;
        dirs.add(next);
        return next;
      }, "");
      let bytes;
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        bytes = new Uint8Array(await response.arrayBuffer());
      } catch (error) {
        bytes = textFile(`素材文件下载失败：${item.url}\n原因：${error?.message || String(error)}\n`);
        item.archivePath = item.archivePath.replace(/\.[^.]+$/, ".download-error.txt");
      }
      entries.push({ name: item.archivePath, data: bytes });
    }
    const directoryEntries = [...dirs].sort().map((name) => ({ name, directory: true }));
    const zip = createZip([...directoryEntries, ...entries]);
    const url = URL.createObjectURL(zip);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wall-media-archive-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="media-page enterprise-page">
      <header className="enterprise-page-header">
        <div className="enterprise-page-title">
          <span>管理后台 / Media</span>
          <div className="enterprise-page-heading">素材管理</div>
        </div>
        <div className="enterprise-page-actions">
          <button type="button" className="blue-button" onClick={downloadArchiveZip}>批量下载 ZIP</button>
          <button type="button" onClick={downloadArchiveManifest}>导出归档清单</button>
          <button type="button" onClick={exportList}>导出清单</button>
        </div>
      </header>

      <section className="enterprise-kpi-grid">
        <article className="enterprise-kpi-card"><span>当前素材</span><b>{visible.length}</b><small>过滤后结果</small></article>
        <article className="enterprise-kpi-card"><span>齐套点位</span><b>{materialSummary.complete}</b><small>素材已达标</small></article>
        <article className="enterprise-kpi-card"><span>待补齐</span><b>{materialSummary.partial}</b><small>需继续上传</small></article>
        <article className="enterprise-kpi-card"><span>无素材</span><b>{materialSummary.empty}</b><small>当前没有上传</small></article>
      </section>

      <section className="enterprise-card">
        <div className="enterprise-card-header">
          <div>
            <span>素材筛选</span>
            <h3>按项目 / 点位 / 类型 / 状态筛选</h3>
          </div>
        </div>
        <div className="enterprise-toolbar media-toolbar">
          <select value={filters.project} onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}>
            {projects.map((project) => <option key={project.id || project.name} value={project.id === "all" ? "all" : project.name}>{project.name}</option>)}
          </select>
          <select value={filters.pointId} onChange={(event) => setFilters((current) => ({ ...current, pointId: event.target.value }))}>
            <option value="all">全部点位</option>
            {points.map((point) => <option key={point.id} value={point.id}>{point.title}</option>)}
          </select>
          <select value={filters.kind} onChange={(event) => setFilters((current) => ({ ...current, kind: event.target.value }))}>
            {["全部素材", "现场照片", "720 全景", "水印照片", "凯立德图片", "墙租协议图片", "视频"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
          <select value={filters.timeRange} onChange={(event) => setFilters((current) => ({ ...current, timeRange: event.target.value }))}>
            {["全部时间", "今天", "最近7天", "本月"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={filters.workerId} onChange={(event) => setFilters((current) => ({ ...current, workerId: event.target.value }))}>
            <option value="all">全部师傅</option>
            {data.workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
          </select>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {["全部状态", "齐套", "待补齐", "无素材", "已分类", "待分类"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="搜索点位 / 地址 / 师傅 / 文件" />
        </div>
      </section>

      <section className="enterprise-card">
        <div className="enterprise-card-header">
          <div>
            <span>素材列表</span>
            <h3>表格与卡片混合视图</h3>
          </div>
        </div>
        {visible.length ? (
          <div className="media-center-grid">
            {visible.map((photo) => {
              const point = data.points.find((item) => item.id === (photo.point_id || photo.pointId));
              return <MediaCard key={photo.id} photo={photo} point={point} onPreview={(p, currentPoint) => setPreview({ photo: p, point: currentPoint })} />;
            })}
          </div>
        ) : (
          <div className="empty-state media-empty-state">
            <span>◷</span>
            <b>暂无素材，建议先导入点位或等待师傅端上传</b>
            <p>当前筛选范围内还没有现场照片、全景、水印、协议或视频素材。可以先回到点位管理或派单中心推进流程。</p>
            <div className="media-preview-actions">
              <button type="button" onClick={downloadArchiveManifest}>导出清单</button>
              <button type="button" onClick={exportList}>刷新列表</button>
              <button type="button" className="blue-button" onClick={() => window.location.assign('/admin/points')}>查看点位</button>
            </div>
          </div>
        )}
      </section>

      <section className="enterprise-two-column media-workspace">
        <section className="enterprise-card media-status-table">
          <div className="enterprise-card-header">
            <div>
              <span>点位素材状态</span>
              <h3>待补齐与无素材点位</h3>
            </div>
          </div>
          <div className="enterprise-list-grid">
            {previewRows.map((row) => (
              <article key={row.point.id} className="enterprise-list-row">
                <div>
                  <b>{row.point.title}</b>
                  <small>{getProjectName(row.point)}</small>
                  <small>{row.status} · 缺失 {row.missing.join("、") || "无"}</small>
                </div>
                <span className="status-chip">{row.counts.total} 份</span>
              </article>
            ))}
            {!previewRows.length && <div className="enterprise-empty">当前没有待分析的点位素材状态。</div>}
          </div>
        </section>

        <section className="enterprise-card media-preview-panel">
          <div className="enterprise-card-header">
            <div>
              <span>上传建议</span>
              <h3>素材补齐提示</h3>
            </div>
          </div>
          <div className="enterprise-list-grid">
            <article className="enterprise-list-row">
              <div>
                <b>现场照片</b>
                <small>建议优先上传现场照片与施工环境图，作为后续验收基础。</small>
              </div>
            </article>
            <article className="enterprise-list-row">
              <div>
                <b>720 全景与水印照片</b>
                <small>统一按项目素材规则补齐，便于在点位管理和项目管理中判断齐套率。</small>
              </div>
            </article>
            <article className="enterprise-list-row">
              <div>
                <b>视频与协议</b>
                <small>视频与墙租协议图片建议在完工前上传，避免点位进入待复查。</small>
              </div>
            </article>
          </div>
        </section>
      </section>

      {preview && (
        <Modal title={preview.point?.title || "素材预览"} subtitle={`${mediaKind(preview.photo)} · ${preview.point?.address || ""}`} onClose={() => setPreview(null)} wide>
          <div className="media-preview-modal">
            <div className="media-large-preview">
              {mediaKind(preview.photo) === "视频" ? (
                <video src={getMediaUrl(preview.photo)} controls />
              ) : (
                <img src={getMediaUrl(preview.photo)} alt={preview.photo.file_name || "现场素材"} />
              )}
            </div>
            <aside className="detail-grid single">
              <div><span>点位编号</span><b>{preview.point?.title || "未知"}</b></div>
              <div><span>项目</span><b>{getProjectName(preview.point)}</b></div>
              <div><span>状态</span><b>{getPointStatus(preview.point)}</b></div>
              <div><span>文件</span><b>{preview.photo.file_name || "现场素材"}</b></div>
              <button className="blue-button" type="button" onClick={() => preview.point && onOpenSite(preview.point)}>按点位进入现场查看</button>
            </aside>
          </div>
        </Modal>
      )}
    </div>
  );
}
