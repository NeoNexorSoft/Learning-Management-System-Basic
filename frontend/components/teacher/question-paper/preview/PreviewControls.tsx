"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, X } from "lucide-react";

// ------------------------------------------------------------------
// Zoom control bar - floats top-right of the preview panel
// ------------------------------------------------------------------

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 1.2;
export const ZOOM_DEFAULT = 0.72;
export const ZOOM_STEP = 0.08;

interface PreviewControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
}

export function PreviewControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
}: PreviewControlsProps) {
  const percent = Math.round(zoom * 100);

  return (
    <div
      style={{ zIndex: 20 }}
      className="absolute top-4 right-4 flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-md px-1 py-1"
    >
      <ControlButton
        onClick={onZoomOut}
        disabled={zoom <= ZOOM_MIN}
        title="ছোট করুন"
      >
        <ZoomOut size={14} />
      </ControlButton>

      <button
        type="button"
        onClick={onReset}
        title="ডিফল্ট সাইজ"
        className="px-2 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all min-w-[42px] text-center"
      >
        {percent}%
      </button>

      <ControlButton
        onClick={onZoomIn}
        disabled={zoom >= ZOOM_MAX}
        title="বড় করুন"
      >
        <ZoomIn size={14} />
      </ControlButton>

      {/* Separator */}
      <div className="w-px h-4 bg-gray-200 mx-1" />

      <ControlButton onClick={onFullscreen} title="ফুল স্ক্রিন">
        <Maximize2 size={14} />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------------
// Fullscreen overlay modal
// Renders children at full viewport, with its own zoom controls
// and an ESC / close button to exit.
// ------------------------------------------------------------------

interface FullscreenPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FullscreenPreview({
  isOpen,
  onClose,
  children,
}: FullscreenPreviewProps) {
  const [fsZoom, setFsZoom] = useState(0.9);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fsZoomIn = useCallback(
    () => setFsZoom((z) => Math.min(z + ZOOM_STEP, 1.6)),
    []
  );
  const fsZoomOut = useCallback(
    () => setFsZoom((z) => Math.max(z - ZOOM_STEP, 0.3)),
    []
  );
  const fsReset = useCallback(() => setFsZoom(0.9), []);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const percent = Math.round(fsZoom * 100);

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-200">
          প্রিভিউ — ফুল স্ক্রিন
        </span>

        <div className="flex items-center gap-1 bg-gray-800 border border-gray-600 rounded-lg px-1 py-1">
          <button
            type="button"
            onClick={fsZoomOut}
            disabled={fsZoom <= 0.3}
            title="ছোট করুন"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ZoomOut size={14} />
          </button>

          <button
            type="button"
            onClick={fsReset}
            className="px-2 py-1 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-all min-w-[42px] text-center"
          >
            {percent}%
          </button>

          <button
            type="button"
            onClick={fsZoomIn}
            disabled={fsZoom >= 1.6}
            title="বড় করুন"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ZoomIn size={14} />
          </button>

          <div className="w-px h-4 bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={onClose}
            title="বন্ধ করুন (ESC)"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
          >
            <Minimize2 size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
          title="বন্ধ করুন (ESC)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-gray-800"
        style={{ padding: "32px 0" }}
      >
        <div
          style={{
            transform: `scale(${fsZoom})`,
            transformOrigin: "top center",
            // Push down container so content is not clipped when zoomed
            marginBottom: `${(fsZoom - 1) * 1123 * 1.5}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Hook - manages zoom state for the preview panel
// Import and use this in QuestionPaperBuilder.tsx
// ------------------------------------------------------------------

export function usePreviewControls() {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [fullscreen, setFullscreen] = useState(false);

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(+(z + ZOOM_STEP).toFixed(2), ZOOM_MAX)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(+(z - ZOOM_STEP).toFixed(2), ZOOM_MIN)),
    []
  );
  const resetZoom = useCallback(() => setZoom(ZOOM_DEFAULT), []);
  const openFullscreen = useCallback(() => setFullscreen(true), []);
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  return {
    zoom,
    fullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    openFullscreen,
    closeFullscreen,
  };
}
