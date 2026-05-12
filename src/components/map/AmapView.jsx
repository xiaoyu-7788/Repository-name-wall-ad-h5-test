import React, { useEffect, useMemo, useRef, useState } from "react";

import { getAmapDiagnostics, loadAmapSdk } from "../../lib/amapLoader";
import {
  focusZoom,
  getPointStatus,
  isWorkerEnabled,
  isWorkerOnline,
  mapPointStyle,
  mediaCounts,
  pointLngLat,
  pointShortCode,
  pointStatusClass,
  workerCarNo,
  workerLngLat,
  workerMotionLabel,
  workerMotionState,
  workerSpeedText,
} from "../../lib/domain";

function createAmapMarkerContent(point, { selected, checked, index, photoCount = 0, showLabel = true }) {
  const marker = document.createElement("div");
  marker.className = `amap-point-marker ${pointStatusClass(point)} ${selected ? "selected" : ""} ${checked ? "checked" : ""}`;
  const bubble = document.createElement("span");
  bubble.className = "amap-point-bubble";
  bubble.textContent = pointShortCode(point, index);
  const label = document.createElement("b");
  label.className = "amap-point-label";
  label.textContent = point?.title || "点位";
  const tooltip = document.createElement("em");
  tooltip.className = "amap-point-tooltip";
  tooltip.textContent = `${point?.title || "点位"} · ${point?.address || "未登记地址"} · ${getPointStatus(point)} · 照片 ${photoCount}`;
  marker.append(bubble);
  if (showLabel) marker.append(label);
  marker.append(tooltip);
  return marker;
}

function createAmapVehicleContent(worker, selected = false) {
  const state = workerMotionState(worker);
  const marker = document.createElement("div");
  marker.className = `amap-vehicle-marker ${state} ${selected ? "selected" : ""}`;
  const icon = document.createElement("span");
  icon.className = "amap-vehicle-icon";
  icon.textContent = "车";
  const dot = document.createElement("i");
  const label = document.createElement("b");
  label.textContent = `${worker?.name || "师傅"} ${workerMotionLabel(worker)}`;
  const plate = document.createElement("small");
  plate.textContent = `${workerCarNo(worker)} · ${workerSpeedText(worker)}`;
  marker.append(icon, dot, label, plate);
  return marker;
}

function FallbackMapBoard({ points, workers = [], selectedPoint, selectedWorker, selectedIds = [], mapMode, selectionMode, onSelectPoint, onSelectWorker, onTogglePointSelection }) {
  return (
    <div className={`map-board amap-fallback-board ${mapMode}`}>
      <div className="road road-a" />
      <div className="road road-b" />
      <div className="road road-c" />
      <div className="building b1" />
      <div className="building b2" />
      <div className="building b3" />
      <div className="map-label">备用地图 · 高德未就绪时兜底显示</div>
      {points.map((point, index) => (
        <button
          key={point.id}
          className={`map-pin ${selectedPoint?.id === point.id ? "selected" : ""} ${selectedIds.includes(point.id) ? "checked" : ""} ${getPointStatus(point) === "已完成" ? "done" : ""}`}
          style={mapPointStyle(point, points, index)}
          title={`${point.title || ""} ${point.address || ""}`}
          onClick={() => {
            onSelectPoint?.(point);
            if (selectionMode === "pick") onTogglePointSelection?.(point);
          }}
        >
          <span />
        </button>
      ))}
      {workers.filter(workerLngLat).map((worker, index) => (
        <button
          type="button"
          key={worker.id || worker.phone || index}
          className={`vehicle-marker ${workerMotionState(worker)} ${selectedWorker?.id === worker.id ? "active" : ""}`}
          style={mapPointStyle(worker, workers, index)}
          onClick={() => onSelectWorker?.(worker)}
        >
          <b>{worker.name || "师傅"}</b>
          <small>{workerMotionLabel(worker)} · {workerSpeedText(worker)} · {workerCarNo(worker)}</small>
        </button>
      ))}
    </div>
  );
}

export function AmapView({
  points,
  workers = [],
  photos = [],
  selectedPoint,
  selectedWorker,
  selectedIds = [],
  mapMode,
  viewMode = "dispatch",
  selectionMode = "browse",
  showPoints = true,
  showWorkers = true,
  showLabels = true,
  onlineOnly = false,
  onSelectPoint,
  onSelectWorker,
  onTogglePointSelection,
  onAreaSelect,
}) {
  const mapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const markersRef = useRef([]);
  const vehicleMarkersRef = useRef(new Map());
  const [dragSelection, setDragSelection] = useState(null);
  const [amapStatus, setAmapStatus] = useState({
    loading: true,
    sdkLoaded: false,
    mapReady: false,
    error: "",
    diagnostics: getAmapDiagnostics(),
  });
  const pointsWithCoord = useMemo(() => (showPoints ? points.filter(pointLngLat) : []), [points, showPoints]);
  const selectedPointIds = useMemo(() => new Set(selectedIds.map(String)), [selectedIds]);
  const visibleWorkers = useMemo(() => (showWorkers ? workers : [])
    .filter(isWorkerEnabled)
    .filter(workerLngLat)
    .filter((worker) => !onlineOnly || isWorkerOnline(worker)), [workers, showWorkers, onlineOnly]);
  const areaMode = selectionMode === "rectangle" || selectionMode === "circle";

  useEffect(() => {
    let disposed = false;
    let resizeObserver = null;

    async function initMap() {
      const diagnostics = getAmapDiagnostics();
      setAmapStatus({ loading: true, sdkLoaded: false, mapReady: false, error: "", diagnostics });
      try {
        const AMap = await loadAmapSdk();
        if (disposed || !mapNodeRef.current) return;

        const map = new AMap.Map(mapNodeRef.current, {
          resizeEnable: true,
          zoom: 6,
          center: [113.2644, 23.1291],
          viewMode: "2D",
          mapStyle: "amap://styles/normal",
          layers: [new AMap.TileLayer()],
        });
        mapRef.current = map;
        if (AMap.ToolBar) map.addControl(new AMap.ToolBar({ position: { top: "12px", right: "12px" } }));
        if (AMap.Scale) map.addControl(new AMap.Scale());

        resizeObserver = new ResizeObserver(() => window.setTimeout(() => map.resize(), 80));
        resizeObserver.observe(mapNodeRef.current);
        window.setTimeout(() => map.resize(), 120);
        setAmapStatus({ loading: false, sdkLoaded: true, mapReady: true, error: "", diagnostics });
      } catch (error) {
        if (disposed) return;
        setAmapStatus({
          loading: false,
          sdkLoaded: Boolean(window.AMap),
          mapReady: false,
          error: error?.message || String(error),
          diagnostics,
        });
      }
    }

    initMap();
    const onResize = () => mapRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      markersRef.current.forEach((marker) => marker.setMap?.(null));
      markersRef.current = [];
      vehicleMarkersRef.current.forEach((marker) => marker.setMap?.(null));
      vehicleMarkersRef.current.clear();
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const AMap = window.AMap;
    const map = mapRef.current;
    if (!AMap || !map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = pointsWithCoord.map((point, index) => {
      const position = pointLngLat(point);
      const selected = selectedPoint?.id === point.id;
      const checked = selectedPointIds.has(String(point.id));
      const photoCount = mediaCounts(point, photos).total;
      const marker = new AMap.Marker({
        position,
        title: `${point.title || ""} ${point.address || ""}`,
        anchor: "bottom-center",
        zIndex: selected ? 120 : 80,
        content: createAmapMarkerContent(point, { selected, checked, index, photoCount, showLabel: showLabels }),
      });
      marker.on("click", () => {
        onSelectPoint?.(point);
        if (selectionMode === "pick") onTogglePointSelection?.(point);
        map.setZoomAndCenter(focusZoom(map), position);
      });
      return marker;
    });

    map.add(markersRef.current);
    const allMarkers = [...markersRef.current, ...vehicleMarkersRef.current.values()];
    if (selectedPoint && pointLngLat(selectedPoint)) map.setZoomAndCenter(focusZoom(map), pointLngLat(selectedPoint));
    else if (allMarkers.length) map.setFitView(allMarkers, false, [80, 80, 80, 80], 12);
    window.setTimeout(() => map.resize(), 80);
  }, [pointsWithCoord, selectedPoint?.id, selectedPointIds, onSelectPoint, onTogglePointSelection, photos, amapStatus.mapReady, showLabels, selectionMode]);

  useEffect(() => {
    const AMap = window.AMap;
    const map = mapRef.current;
    if (!AMap || !map) return;

    const nextIds = new Set();
    visibleWorkers.forEach((worker, index) => {
      const position = workerLngLat(worker);
      if (!position) return;
      const id = String(worker.id || worker.phone || index);
      nextIds.add(id);
      const content = createAmapVehicleContent(worker, selectedWorker?.id === worker.id);
      const title = `${worker.name || "师傅"} ${workerCarNo(worker)} ${workerSpeedText(worker)}`;
      const existing = vehicleMarkersRef.current.get(id);
      if (existing) {
        existing.setPosition(position);
        existing.setContent(content);
        existing.setTitle?.(title);
        existing.setzIndex?.(140 + index);
      } else {
        const marker = new AMap.Marker({
          position,
          title,
          anchor: "bottom-center",
          content,
          zIndex: 140 + index,
        });
        marker.on("click", () => {
          onSelectWorker?.(worker);
          map.setZoomAndCenter(focusZoom(map), position);
        });
        vehicleMarkersRef.current.set(id, marker);
        map.add(marker);
      }
    });

    vehicleMarkersRef.current.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.setMap?.(null);
        vehicleMarkersRef.current.delete(id);
      }
    });
  }, [visibleWorkers, selectedWorker?.id, amapStatus.mapReady, onSelectWorker]);

  useEffect(() => {
    const AMap = window.AMap;
    if (AMap && mapRef.current) {
      const layers = mapMode === "satellite" && AMap.TileLayer?.Satellite
        ? [new AMap.TileLayer.Satellite(), new AMap.TileLayer.RoadNet()]
        : [new AMap.TileLayer()];
      mapRef.current.setLayers(layers);
    }
    mapRef.current?.resize();
  }, [mapMode]);

  function relativePointer(event) {
    const rect = mapNodeRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
      rect,
    };
  }

  function pointPixel(point, rect) {
    const position = pointLngLat(point);
    if (!position) return null;
    const AMap = window.AMap;
    const map = mapRef.current;
    if (AMap && map?.lngLatToContainer) {
      const pixel = map.lngLatToContainer(new AMap.LngLat(position[0], position[1]));
      const x = typeof pixel.getX === "function" ? pixel.getX() : pixel.x;
      const y = typeof pixel.getY === "function" ? pixel.getY() : pixel.y;
      if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
    }
    const coordPoints = pointsWithCoord;
    const lngs = coordPoints.map((item) => Number(item.lng));
    const lats = coordPoints.map((item) => Number(item.lat));
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const x = maxLng === minLng ? rect.width / 2 : rect.width * (0.1 + ((Number(point.lng) - minLng) / (maxLng - minLng)) * 0.8);
    const y = maxLat === minLat ? rect.height / 2 : rect.height * (0.84 - ((Number(point.lat) - minLat) / (maxLat - minLat)) * 0.7);
    return { x, y };
  }

  function selectedPointIdsByArea(selection) {
    const { start, current, type, rect } = selection;
    if (!start || !current || !rect) return [];
    const left = Math.min(start.x, current.x);
    const right = Math.max(start.x, current.x);
    const top = Math.min(start.y, current.y);
    const bottom = Math.max(start.y, current.y);
    const radius = Math.hypot(current.x - start.x, current.y - start.y);
    return pointsWithCoord
      .filter((point) => {
        const pixel = pointPixel(point, rect);
        if (!pixel) return false;
        if (type === "circle") return Math.hypot(pixel.x - start.x, pixel.y - start.y) <= radius;
        return pixel.x >= left && pixel.x <= right && pixel.y >= top && pixel.y <= bottom;
      })
      .map((point) => point.id);
  }

  function beginAreaSelection(event) {
    if (!areaMode) return;
    const point = relativePointer(event);
    if (!point) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragSelection({ type: selectionMode === "circle" ? "circle" : "rectangle", start: point, current: point, rect: point.rect });
  }

  function moveAreaSelection(event) {
    if (!dragSelection) return;
    const point = relativePointer(event);
    if (!point) return;
    setDragSelection((current) => current ? { ...current, current: point, rect: point.rect } : current);
  }

  function endAreaSelection(event) {
    if (!dragSelection) return;
    const point = relativePointer(event) || dragSelection.current;
    const nextSelection = { ...dragSelection, current: point };
    const distance = Math.hypot(nextSelection.current.x - nextSelection.start.x, nextSelection.current.y - nextSelection.start.y);
    setDragSelection(null);
    if (distance < 24) return;
    const pointIds = selectedPointIdsByArea(nextSelection);
    onAreaSelect?.({
      type: nextSelection.type,
      pointIds,
      label: nextSelection.type === "circle" ? "圈选区域" : "框选区域",
    });
  }

  const selectionStyle = dragSelection ? {
    left: `${Math.min(dragSelection.start.x, dragSelection.current.x)}px`,
    top: `${Math.min(dragSelection.start.y, dragSelection.current.y)}px`,
    width: `${Math.abs(dragSelection.current.x - dragSelection.start.x)}px`,
    height: `${Math.abs(dragSelection.current.y - dragSelection.start.y)}px`,
  } : {};
  const circleStyle = dragSelection ? {
    left: `${dragSelection.start.x - Math.hypot(dragSelection.current.x - dragSelection.start.x, dragSelection.current.y - dragSelection.start.y)}px`,
    top: `${dragSelection.start.y - Math.hypot(dragSelection.current.x - dragSelection.start.x, dragSelection.current.y - dragSelection.start.y)}px`,
    width: `${Math.hypot(dragSelection.current.x - dragSelection.start.x, dragSelection.current.y - dragSelection.start.y) * 2}px`,
    height: `${Math.hypot(dragSelection.current.x - dragSelection.start.x, dragSelection.current.y - dragSelection.start.y) * 2}px`,
  } : {};

  function fitNation() {
    const map = mapRef.current;
    if (!map) return;
    const allMarkers = [...markersRef.current, ...vehicleMarkersRef.current.values()];
    if (allMarkers.length) map.setFitView(allMarkers, false, [90, 90, 90, 90], 6);
    else map.setZoomAndCenter(5, [104.1954, 35.8617]);
  }

  function locateSelectedWorker() {
    const map = mapRef.current;
    const pos = workerLngLat(selectedWorker);
    if (map && pos) map.setZoomAndCenter(14, pos);
  }

  const missingConfig = !amapStatus.diagnostics.hasKey || !amapStatus.diagnostics.hasSecurityCode;
  const showFallback = !amapStatus.loading && !amapStatus.mapReady;

  return (
    <div className={`amap-shell map-console-canvas ${mapMode} ${showFallback ? "fallback-active" : ""}`}>
      <div ref={mapNodeRef} className="amap-real-board" />
      {showFallback && (
        <FallbackMapBoard
          points={points}
          workers={visibleWorkers}
          selectedPoint={selectedPoint}
          selectedWorker={selectedWorker}
          selectedIds={selectedIds}
          mapMode={mapMode}
          selectionMode={selectionMode}
          onSelectPoint={onSelectPoint}
          onSelectWorker={onSelectWorker}
          onTogglePointSelection={onTogglePointSelection}
        />
      )}
      <div
        className={`map-area-selection-layer ${areaMode ? "active" : ""}`}
        onPointerDown={beginAreaSelection}
        onPointerMove={moveAreaSelection}
        onPointerUp={endAreaSelection}
        onPointerCancel={() => setDragSelection(null)}
        aria-label={selectionMode === "circle" ? "圈选地图点位" : "框选地图点位"}
      >
        {dragSelection && (
          <span
            className={`map-selection-shape ${dragSelection.type}`}
            style={dragSelection.type === "circle" ? circleStyle : selectionStyle}
          />
        )}
      </div>
      {(amapStatus.loading || amapStatus.error || missingConfig) && (
        <div className={`amap-status-card ${amapStatus.error || missingConfig ? "error" : ""}`}>
          {amapStatus.loading && !amapStatus.error ? (
            <>
              <b>正在加载高德地图...</b>
              <span className="loading-shimmer" />
            </>
          ) : (
            <>
              <b>{missingConfig ? "高德地图配置不完整" : "高德地图加载失败"}</b>
              <p>
                {!amapStatus.diagnostics.hasKey && "缺少 VITE_AMAP_KEY。"}
                {!amapStatus.diagnostics.hasSecurityCode && " 缺少 VITE_AMAP_SECURITY_CODE。"}
                {amapStatus.error && ` ${amapStatus.error}`}
              </p>
              <small>已切换备用地图。请检查 .env.local / .env 和高德控制台 Web JS API Key、Security Code、白名单。</small>
            </>
          )}
        </div>
      )}
      <div className="amap-map-badges">
        <span>点位 {pointsWithCoord.length}/{points.length}</span>
        <span>小车 {visibleWorkers.length}/{workers.length}</span>
        <span>已选 {selectedIds.length}</span>
        <span>{viewMode === "acceptance" ? "验收视图" : viewMode === "track" ? "轨迹回放" : "调度视图"}</span>
        <span>{selectionMode === "rectangle" ? "框选中" : selectionMode === "circle" ? "圈选中" : selectionMode === "pick" ? "点选中" : "浏览"}</span>
        <span>{amapStatus.mapReady ? "地图已就绪" : "地图待配置"}</span>
      </div>
      <div className="map-floating-tools">
        <button type="button" onClick={fitNation}>全国视图</button>
        <button type="button" onClick={locateSelectedWorker} disabled={!selectedWorker}>定位师傅</button>
      </div>
    </div>
  );
}
