import React from "react";

import { MediaCard } from "./MediaCard";
import { EmptyState } from "../shared/EmptyState";

export function MediaGrid({ media, points, onPreview }) {
  if (!media.length) return <EmptyState title="暂无现场素材" description="师傅上传照片或视频后会在这里汇总。" />;
  return (
    <div className="media-center-grid">
      {media.map((photo) => {
        const point = points.find((item) => item.id === (photo.point_id || photo.pointId));
        return <MediaCard key={photo.id} photo={photo} point={point} onPreview={onPreview} />;
      })}
    </div>
  );
}
