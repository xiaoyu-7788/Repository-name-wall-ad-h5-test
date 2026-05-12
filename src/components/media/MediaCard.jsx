import React from "react";

import { cnTime, getMediaUrl, mediaKind, nowIso } from "../../lib/domain";

export function MediaCard({ photo, point, onPreview }) {
  const kind = mediaKind(photo);
  const url = getMediaUrl(photo);
  const isVideo = kind === "视频" || /\.(mp4|mov|m4v|webm)$/i.test(url);
  return (
    <article className="media-card">
      <span className="corner-badge">{kind}</span>
      <button className="media-preview" type="button" onClick={() => onPreview?.(photo, point)}>
        {url ? (
          isVideo ? <video src={url} controls /> : <img src={url} alt={photo.file_name || kind} />
        ) : (
          <div className="media-placeholder">{kind}</div>
        )}
      </button>
      <div className="media-caption">
        <b>{point?.title || "未知点位"}</b>
        <span>{photo.file_name || "现场资料"} · {cnTime(photo.created_at || nowIso())}</span>
      </div>
    </article>
  );
}
