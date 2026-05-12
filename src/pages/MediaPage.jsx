import React, { useMemo, useState } from "react";

import { MediaFilters } from "../components/media/MediaFilters";
import { MediaGrid } from "../components/media/MediaGrid";
import { Modal } from "../components/shared/Modal";
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

export function MediaPage({ data, activeProject, timeRange = "近7天", globalSearch = "", focusPointId = "", onOpenSite }) {
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
    return missing.length ? "待补全" : "齐套";
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
    const completionOk = ["齐套", "待补全", "无素材"].includes(filters.status) ? point && materialStatus(point) === filters.status : true;
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
      partial: rows.filter((row) => row.status === "待补全").length,
      empty: rows.filter((row) => row.status === "无素材").length,
    };
  }, [scopedPoints, data.photos, data.tasks, data.projects]);

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
    <div className="media-page">
      <section className="media-rule-panel">
        <div>
          <span>素材规则说明</span>
          <h2>按项目规则判断齐套 / 待补全 / 无素材</h2>
          <p>筛选和异常摘要复用阶段 1 的统一素材分类，图片类素材保持无限制上传；批量下载按当前筛选结果执行。</p>
        </div>
        <div className="media-rule-stats">
          <article><span>当前素材</span><b>{visible.length}</b></article>
          <article><span>齐套点位</span><b>{materialSummary.complete}</b></article>
          <article><span>待补全</span><b>{materialSummary.partial}</b></article>
          <article><span>无素材</span><b>{materialSummary.empty}</b></article>
        </div>
        <div className="project-rule-list expanded">
          {(filters.project === "all" ? projects.filter((project) => project.id !== "all").slice(0, 4) : projects.filter((project) => project.name === filters.project)).map((project) => (
            <span key={project.id || project.name}>{project.name}：{normalizeMaterialRules(project.materialRules || project.material_rules, project.name).join(" + ")}</span>
          ))}
        </div>
      </section>
      <MediaFilters
        projects={projects}
        workers={data.workers}
        points={points}
        filters={filters}
        setFilters={setFilters}
        onExport={exportList}
        onDownload={downloadArchiveZip}
        onManifest={downloadArchiveManifest}
      />
      <MediaGrid media={visible} points={data.points} onPreview={(photo, point) => setPreview({ photo, point })} />
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
              <div><span>文件</span><b>{preview.photo.file_name || "现场资料"}</b></div>
              <button className="blue-button" type="button" onClick={() => preview.point && onOpenSite(preview.point)}>按点位进入现场查看</button>
            </aside>
          </div>
        </Modal>
      )}
    </div>
  );
}
