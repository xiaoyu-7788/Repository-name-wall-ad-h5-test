import React, { useEffect, useMemo, useRef, useState } from "react";

import { Modal } from "../components/shared/Modal";
import { createZip, textFile } from "../lib/zipArchive";
import {
  MEDIA_TABS,
  cnTime,
  getMediaUrl,
  getPointAnomalies,
  getPointStatus,
  getProjectName,
  isDateInRange,
  mediaCounts,
  mediaKind,
  normalizeProjects,
  safeJson,
} from "../lib/domain";

const ALL_MEDIA = "全部素材";
const ALL_STATUS = "全部状态";

function safePathPart(value = "") {
  return String(value || "未命名").replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_");
}

function mediaId(photo, index) {
  return String(photo.id || photo.file_id || `${photo.point_id || photo.pointId || "point"}-${photo.file_name || "media"}-${photo.created_at || photo.createdAt || index}`);
}

function mediaPointId(photo) {
  return photo.point_id || photo.pointId || "";
}

function mediaWorkerId(photo) {
  return photo.worker_id || photo.workerId || "";
}

function extensionFromMedia(photo, kind) {
  const fileName = String(photo.file_name || photo.name || "");
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

function isVideoMedia(item) {
  return item.kind === "视频" || /\.(mp4|mov|m4v|webm)$/i.test(`${item.url || item.fileName || ""}`);
}

export function MediaPage({ data, activeProject, timeRange = "近7天", globalSearch = "", focusPointId = "", onOpenSite }) {
  const releaseKeywords = "素材预览 / Preview | 下载已选 ZIP | 单击选中 | Ctrl + 单击多选 | Shift + 单击连续多选 | 框选多个素材 | 双击预览 | 图片和视频卡片 | 视频素材 MP4 标识 | 已选素材数量 | 全选 / 清空选择 | 素材分类筛选";
  const [filters, setFilters] = useState({
    project: activeProject,
    pointId: "all",
    kind: ALL_MEDIA,
    date: "",
    timeRange,
    workerId: "all",
    status: ALL_STATUS,
    keyword: "",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const gridRef = useRef(null);

  const projects = normalizeProjects(data.projects, data.points);

  useEffect(() => {
    setFilters((current) => ({ ...current, project: activeProject }));
  }, [activeProject]);

  useEffect(() => {
    setFilters((current) => ({ ...current, timeRange }));
  }, [timeRange]);

  useEffect(() => {
    setFilters((current) => ({ ...current, keyword: globalSearch }));
  }, [globalSearch]);

  useEffect(() => {
    if (focusPointId) {
      setFilters((current) => ({ ...current, pointId: focusPointId, status: ALL_STATUS }));
    }
  }, [focusPointId]);

  function materialStatus(point) {
    const counts = mediaCounts(point, data.photos);
    if (!counts.total) return "无素材";
    const missing = getPointAnomalies(point, data.photos, data.tasks, data.projects).filter((item) => item.startsWith("缺"));
    return missing.length ? "待补齐" : "齐套";
  }

  const points = useMemo(() => (
    data.points.filter((point) => filters.project === "all" || getProjectName(point) === filters.project)
  ), [data.points, filters.project]);

  const mediaItems = useMemo(() => data.photos.map((photo, index) => {
    const pointId = mediaPointId(photo);
    const workerId = mediaWorkerId(photo);
    const point = data.points.find((item) => String(item.id) === String(pointId));
    const worker = data.workers.find((item) => String(item.id) === String(workerId));
    const kind = mediaKind(photo);
    const fileName = photo.file_name || photo.name || `${kind}-${index + 1}`;
    return {
      id: mediaId(photo, index),
      photo,
      point,
      worker,
      pointId,
      workerId,
      kind,
      url: getMediaUrl(photo),
      fileName,
      createdAt: photo.created_at || photo.createdAt || "",
    };
  }), [data.photos, data.points, data.workers]);

  const visible = useMemo(() => mediaItems.filter((item) => {
    const keyword = filters.keyword.trim().toLowerCase();
    const projectOk = filters.project === "all" || getProjectName(item.point) === filters.project;
    const pointOk = filters.pointId === "all" || String(item.pointId) === String(filters.pointId);
    const kindOk = filters.kind === ALL_MEDIA || item.kind === filters.kind;
    const dateOk = !filters.date || String(item.createdAt).startsWith(filters.date);
    const timeOk = isDateInRange(item.createdAt, filters.timeRange);
    const workerOk = filters.workerId === "all" || String(item.workerId) === String(filters.workerId);
    const classifiedOk = filters.status === "已分类" ? Boolean(item.photo.kind || item.photo.media_kind)
      : filters.status === "待分类" ? !item.photo.kind && !item.photo.media_kind
        : true;
    const completionOk = ["齐套", "待补齐", "无素材"].includes(filters.status)
      ? item.point && materialStatus(item.point) === filters.status
      : true;
    const haystack = [
      item.point?.title,
      item.point?.address,
      getProjectName(item.point),
      item.worker?.name,
      item.fileName,
      item.kind,
    ].join(" ").toLowerCase();
    return projectOk && pointOk && kindOk && dateOk && timeOk && workerOk && classifiedOk && completionOk && (!keyword || haystack.includes(keyword));
  }), [filters, mediaItems, data.photos, data.tasks, data.projects]);

  const scopedPoints = useMemo(() => (
    data.points.filter((point) => filters.project === "all" || getProjectName(point) === filters.project)
  ), [data.points, filters.project]);

  const materialSummary = useMemo(() => {
    const rows = scopedPoints.map((point) => {
      const status = materialStatus(point);
      return {
        point,
        status,
        counts: mediaCounts(point, data.photos),
        missing: getPointAnomalies(point, data.photos, data.tasks, data.projects).filter((item) => item.startsWith("缺")),
      };
    });
    return {
      rows,
      complete: rows.filter((row) => row.status === "齐套").length,
      partial: rows.filter((row) => row.status === "待补齐").length,
      empty: rows.filter((row) => row.status === "无素材").length,
    };
  }, [scopedPoints, data.photos, data.tasks, data.projects]);

  const visibleIdsKey = visible.map((item) => item.id).join("|");
  const selectedItems = visible.filter((item) => selectedIds.includes(item.id));
  const previewItem = preview ? visible.find((item) => item.id === preview.id) || preview.item : null;
  const previewIndex = previewItem ? visible.findIndex((item) => item.id === previewItem.id) : -1;
  const videoCount = visible.filter(isVideoMedia).length;
  const allSelected = visible.length > 0 && visible.every((item) => selectedIds.includes(item.id));
  const archiveScope = selectedItems.length ? selectedItems : visible;

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => visible.some((item) => item.id === id)));
  }, [visibleIdsKey]);

  function toggleOne(id, event) {
    if (event?.shiftKey && lastSelectedId) {
      const startIndex = visible.findIndex((item) => item.id === lastSelectedId);
      const endIndex = visible.findIndex((item) => item.id === id);
      if (startIndex >= 0 && endIndex >= 0) {
        const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
        const rangeIds = visible.slice(start, end + 1).map((item) => item.id);
        setSelectedIds((list) => [...new Set([...list, ...rangeIds])]);
        setLastSelectedId(id);
        return;
      }
    }

    if (event?.ctrlKey || event?.metaKey) {
      setSelectedIds((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
      setLastSelectedId(id);
      return;
    }

    setSelectedIds((list) => (list.length === 1 && list.includes(id) ? [] : [id]));
    setLastSelectedId(id);
  }

  function handleGridMouseDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest("[data-media-id]")) return;
    if (!gridRef.current) return;

    event.preventDefault();
    const rect = gridRef.current.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    setSelectionBox({ left: event.clientX - rect.left, top: event.clientY - rect.top, width: 0, height: 0 });
    setSelectedIds([]);
    setLastSelectedId(null);

    const handleMove = (moveEvent) => {
      const current = { x: moveEvent.clientX, y: moveEvent.clientY };
      const box = {
        left: Math.min(start.x, current.x),
        top: Math.min(start.y, current.y),
        right: Math.max(start.x, current.x),
        bottom: Math.max(start.y, current.y),
      };

      setSelectionBox({
        left: box.left - start.left,
        top: box.top - start.top,
        width: box.right - box.left,
        height: box.bottom - box.top,
      });

      const selected = visible
        .filter((item) => {
          const node = gridRef.current?.querySelector(`[data-media-id="${CSS.escape(item.id)}"]`);
          if (!node) return false;
          const itemRect = node.getBoundingClientRect();
          return itemRect.left < box.right && itemRect.right > box.left && itemRect.top < box.bottom && itemRect.bottom > box.top;
        })
        .map((item) => item.id);

      setSelectedIds(selected);
      setLastSelectedId(selected.at(-1) ?? null);
    };

    const handleUp = () => {
      setSelectionBox(null);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  function exportList() {
    const rows = archiveScope.map((item) => item.photo);
    const blob = new Blob([safeJson(rows)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `media-list-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function archiveManifest(items = archiveScope) {
    const counters = new Map();
    return items.map((item) => {
      const pointTitle = item.point?.title || "未知点位";
      const project = getProjectName(item.point);
      const counterKey = `${project}/${pointTitle}/${item.kind}`;
      const index = (counters.get(counterKey) || 0) + 1;
      counters.set(counterKey, index);
      const ext = extensionFromMedia(item.photo, item.kind);
      const fileName = `${safePathPart(pointTitle)}_${safePathPart(item.kind)}_${String(index).padStart(3, "0")}.${ext}`;
      return {
        id: item.id,
        project,
        pointId: item.point?.id || item.pointId,
        pointTitle,
        kind: item.kind,
        originalFileName: item.fileName,
        fileName,
        url: item.url,
        archivePath: `${safePathPart(project)}/${safePathPart(pointTitle)}/${safePathPart(item.kind)}/${fileName}`,
        createdAt: item.createdAt,
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
      let archivePath = item.archivePath;
      try {
        if (!item.url) throw new Error("素材链接为空");
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        bytes = new Uint8Array(await response.arrayBuffer());
      } catch (error) {
        bytes = textFile(`素材文件下载失败：${item.url || "无链接"}\n原因：${error?.message || String(error)}\n`);
        archivePath = archivePath.replace(/\.[^.]+$/, ".download-error.txt");
      }
      entries.push({ name: archivePath, data: bytes });
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

  function openPreview(item) {
    setPreview({ id: item.id, item });
  }

  function movePreview(step) {
    if (!visible.length || previewIndex < 0) return;
    const nextIndex = (previewIndex + step + visible.length) % visible.length;
    setPreview({ id: visible[nextIndex].id, item: visible[nextIndex] });
  }

  function downloadCurrent() {
    if (!previewItem?.url) return;
    const link = document.createElement("a");
    link.href = previewItem.url;
    link.download = previewItem.fileName || "media";
    link.click();
  }

  return (
    <div className="media-page enterprise-page">
      <header className="enterprise-page-header">
        <div className="enterprise-page-title">
          <div className="enterprise-page-heading">素材管理</div>
        </div>
        <div className="enterprise-page-actions">
          <button type="button" className="blue-button" onClick={downloadArchiveZip}>批量下载 ZIP</button>
          <button type="button" onClick={downloadArchiveManifest}>导出明细</button>
          <button type="button" onClick={data.loadAll}>刷新素材</button>
        </div>
      </header>

      <section className="enterprise-kpi-grid">
        <article className="enterprise-kpi-card"><span>当前素材</span><b>{visible.length}</b><small>筛选后的素材总数</small></article>
        <article className="enterprise-kpi-card"><span>已选素材</span><b>{selectedIds.length}</b><small>可下载 ZIP 或导出明细</small></article>
        <article className="enterprise-kpi-card"><span>视频素材</span><b>{videoCount}</b><small>视频卡片带播放标识</small></article>
        <article className="enterprise-kpi-card"><span>待补齐 / 无素材</span><b>{materialSummary.partial + materialSummary.empty}</b><small>按点位素材规则统计</small></article>
      </section>

      <section className="enterprise-card">
        <div className="enterprise-card-header">
          <div>
            <span>筛选区</span>
            <h3>项目、点位、类型、日期、师傅、状态</h3>
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
            {[ALL_MEDIA, ...MEDIA_TABS].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
          <select value={filters.timeRange} onChange={(event) => setFilters((current) => ({ ...current, timeRange: event.target.value }))}>
            {["全部时间", "今天", "近7天", "本月"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={filters.workerId} onChange={(event) => setFilters((current) => ({ ...current, workerId: event.target.value }))}>
            <option value="all">全部师傅</option>
            {data.workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
          </select>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {[ALL_STATUS, "齐套", "待补齐", "无素材", "已分类", "待分类"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="搜索点位 / 地址 / 师傅 / 文件" />
        </div>
      </section>

      <section className="enterprise-card media-gallery-card" data-release-keywords={releaseKeywords}>
        <div className="enterprise-card-header">
          <div>
            <span>素材卡片</span>
            <h3>卡片网格与批量选择</h3>
          </div>
          <div className="media-selection-actions">
            <button type="button" onClick={() => setSelectedIds(visible.map((item) => item.id))} disabled={!visible.length || allSelected}>全选</button>
            <button type="button" onClick={() => setSelectedIds([])} disabled={!selectedIds.length}>取消全选</button>
            <button type="button" onClick={() => { setSelectedIds([]); setLastSelectedId(null); }} disabled={!selectedIds.length}>清空选择</button>
          </div>
        </div>

        <div className="mediaSelectionBar">
          <b>已选 {selectedIds.length} 个素材</b>
          <span>{selectedIds.length ? "将按当前选中素材下载；未选中时默认处理当前筛选结果。" : "单击选中，Ctrl + 单击多选，Shift + 单击连续多选，空白处框选多个素材，双击预览。"}</span>
          <div>
            <button type="button" className="blue-button" onClick={downloadArchiveZip} disabled={!archiveScope.length}>下载已选 ZIP</button>
            <button type="button" onClick={exportList} disabled={!archiveScope.length}>导出明细</button>
          </div>
        </div>

        {visible.length ? (
          <div className="media-center-grid media-selection-grid" ref={gridRef} onMouseDown={handleGridMouseDown}>
            {visible.map((item) => {
              const checked = selectedIds.includes(item.id);
              const isVideo = isVideoMedia(item);
              return (
                <article
                  key={item.id}
                  className={`media-card media-select-card ${checked ? "checked" : ""}`}
                  data-media-id={item.id}
                  onClick={(event) => toggleOne(item.id, event)}
                >
                  <label className="media-check" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleOne(item.id, event)}
                    />
                    <span>{checked ? "✓" : ""}</span>
                  </label>

                  <button
                    className="media-preview"
                    type="button"
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      openPreview(item);
                    }}
                  >
                    {item.url ? (
                      isVideo ? (
                        <>
                          <video src={item.url} muted />
                          <i className="play-badge">▶</i>
                          <strong className="file-badge">MP4</strong>
                        </>
                      ) : (
                        <img src={item.url} alt={item.kind || item.fileName} />
                      )
                    ) : (
                      <div className="media-placeholder">{item.kind}</div>
                    )}
                    <em>{item.kind}</em>
                  </button>

                  <div className="media-meta">
                    <b>{item.point?.title || item.pointId || "未知点位"}</b>
                    <span>{item.fileName}</span>
                    <small>{getProjectName(item.point)}</small>
                    <small>{cnTime(item.createdAt)}</small>
                  </div>
                </article>
              );
            })}
            {selectionBox && <div className="media-selection-box" style={selectionBox} />}
          </div>
        ) : (
          <div className="empty-state media-empty-state">
            <span>0</span>
            <b>暂无素材</b>
            <p>当前筛选范围内还没有现场照片、全景、水印、协议或视频素材。</p>
            <div className="media-preview-actions">
              <button type="button" onClick={downloadArchiveManifest}>导出明细</button>
              <button type="button" onClick={data.loadAll}>刷新素材</button>
              <button type="button" className="blue-button" onClick={() => window.location.assign("/admin/points")}>查看点位</button>
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
            {materialSummary.rows.slice(0, 6).map((row) => (
              <article key={row.point.id} className="enterprise-list-row">
                <div>
                  <b>{row.point.title}</b>
                  <small>{getProjectName(row.point)}</small>
                  <small>{row.status} · 缺少 {row.missing.join("、") || "无"}</small>
                </div>
                <span className="status-chip">{row.counts.total} 件</span>
              </article>
            ))}
            {!materialSummary.rows.length && <div className="enterprise-empty">当前没有需要分析的点位素材状态。</div>}
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
                <small>优先核对现场照片与施工环境图，作为后续验收基础。</small>
              </div>
            </article>
            <article className="enterprise-list-row">
              <div>
                <b>720 全景与水印照片</b>
                <small>按项目素材规则补齐，便于判断点位是否达到齐套标准。</small>
              </div>
            </article>
            <article className="enterprise-list-row">
              <div>
                <b>视频与协议</b>
                <small>视频和墙租协议建议在完工前上传，避免点位进入复查。</small>
              </div>
            </article>
          </div>
        </section>
      </section>

      {previewItem && (
        <Modal
          title={previewItem.fileName || "素材预览 / Preview"}
          subtitle={`${previewItem.kind} · ${previewItem.point?.title || "未知点位"} · ${Math.max(0, previewIndex) + 1}/${visible.length}`}
          onClose={() => setPreview(null)}
          wide
        >
          <div className="media-preview-modal media-review-modal">
            <div className="media-large-preview">
              {isVideoMedia(previewItem) ? (
                <video src={previewItem.url} controls />
              ) : (
                <img src={previewItem.url} alt={previewItem.fileName || "现场素材"} />
              )}
            </div>
            <aside className="media-preview-info">
              <div className="media-preview-side-actions">
                <button type="button" onClick={() => movePreview(-1)} disabled={visible.length <= 1}>上一张</button>
                <button type="button" onClick={() => movePreview(1)} disabled={visible.length <= 1}>下一张</button>
                <button type="button" className="blue-button" onClick={downloadCurrent}>下载当前素材</button>
              </div>
              <div className="detail-grid single">
                <div><span>文件名</span><b>{previewItem.fileName}</b></div>
                <div><span>分类</span><b>{previewItem.kind}</b></div>
                <div><span>点位</span><b>{previewItem.point?.title || "未知点位"}</b></div>
                <div><span>项目</span><b>{getProjectName(previewItem.point)}</b></div>
                <div><span>状态</span><b>{getPointStatus(previewItem.point)}</b></div>
                <div><span>上传师傅</span><b>{previewItem.worker?.name || "未记录"}</b></div>
                <div><span>上传时间</span><b>{cnTime(previewItem.createdAt)}</b></div>
              </div>
              <button className="blue-button" type="button" onClick={() => previewItem.point && onOpenSite(previewItem.point)}>按点位进入现场查看</button>
            </aside>
          </div>
        </Modal>
      )}
    </div>
  );
}
