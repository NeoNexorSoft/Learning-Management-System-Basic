"use client";

import { useEffect, useRef, useState } from "react";
import type Player from "video.js/dist/types/player";

interface SecureVideoPlayerProps {
  url: string;
  allowFullscreen?: boolean;
}

export default function SecureVideoPlayer({ url, allowFullscreen = false }: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const isInitialized = useRef(false);

  const [isReady, setIsReady] = useState(false);

  // Initialize Video.js only on the client, guarded against double-init (Strict Mode).
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let player: Player;

    (async () => {
      const videojs = (await import("video.js")).default;

      if (!videoRef.current) return;

      player = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [{ src: url, type: resolveType(url) }],
        controlBar: {
          // Remove controls that expose download or picture-in-picture.
          pictureInPictureToggle: false,
          downloadButton: false,
          fullscreenToggle: allowFullscreen,
          remainingTimeDisplay: true,
          volumePanel: { inline: false },
        },
        html5: {
          vhs: {
            // Keeps HLS-ready for future streams without breaking plain MP4.
            overrideNative: true,
          },
        },
      });

      player.ready(() => {
        setIsReady(true);
        disablePictureInPicture(videoRef.current);
      });

      playerRef.current = player;
    })();

    return () => {
      // Dispose on unmount only if the element is still in the DOM.
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
        isInitialized.current = false;
      }
    };
    // Intentionally excluding `url` — source changes handled in the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowFullscreen]);

  // Update source dynamically when the URL prop changes after first mount.
  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed() || !isReady) return;

    player.src({ src: url, type: resolveType(url) });
    player.load();
  }, [url, isReady]);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="secure-video-wrapper"
      style={styles.wrapper}
    >
      {/* Video.js replaces this element; we keep it minimal. */}
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-theme-custom"
          playsInline
          // Disable native picture-in-picture at the attribute level.
          // The cast is needed because React's typings don't include this yet.
          {...({ disablePictureInPicture: true } as React.VideoHTMLAttributes<HTMLVideoElement>)}
        />
      </div>
    </div>
  );
}

// Helpers

function resolveType(url: string): string {
  if (url.includes(".m3u8")) return "application/x-mpegURL";
  if (url.includes(".mp4")) return "video/mp4";
  if (url.includes(".webm")) return "video/webm";
  return "video/mp4";
}

function disablePictureInPicture(el: HTMLVideoElement | null) {
  if (!el) return;
  // Belt-and-suspenders: attribute + property.
  el.setAttribute("disablePictureInPicture", "true");
  // The property exists on the extended HTMLVideoElement spec.
  (el as HTMLVideoElement & { disablePictureInPicture?: boolean }).disablePictureInPicture = true;
}

// Inline styles kept minimal — import video.js CSS globally in your layout.
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "relative",
    width: "100%",
    background: "#0a0a0a",
    borderRadius: "8px",
    overflow: "hidden",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
};