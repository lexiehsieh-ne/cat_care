"use client";

import type { SyntheticEvent } from "react";

function showFirstFrame(event: SyntheticEvent<HTMLVideoElement>) {
  const video = event.currentTarget;
  if (video.currentTime === 0) {
    video.currentTime = Math.min(1, video.duration / 2);
  }
}

export function VideoPreview({
  src,
  caption,
}: {
  src: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-2 shadow-xl">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={showFirstFrame}
        className="w-full rounded-xl"
      />
      <p className="mt-2 pb-1 text-center text-sm font-medium text-foreground/70">
        {caption}
      </p>
    </div>
  );
}
