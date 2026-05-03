"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Point PDF.js worker at the versioned CDN build so there is no bundler config needed.
// This assignment is idempotent — safe to call on every render cycle.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePDFViewerProps {
  url: string;
  allowFullscreen?: boolean;
}

const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

export default function SecurePDFViewerClient({
  url,
  allowFullscreen = false,
}: SecurePDFViewerProps) {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(700);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Measure available width so the page fills the container responsively.
  useEffect(() => {
    const measure = () => {
      if (pageContainerRef.current) {
        setContainerWidth(pageContainerRef.current.clientWidth);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (pageContainerRef.current) observer.observe(pageContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track native fullscreen changes (e.g., user presses Escape).
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const onDocumentLoaded = useCallback(({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setCurrentPage(1);
  }, []);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const zoomIn = () => setScale((s) => Math.min(ZOOM_MAX, parseFloat((s + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setScale((s) => Math.max(ZOOM_MIN, parseFloat((s - ZOOM_STEP).toFixed(2))));

  const toggleFullscreen = async () => {
    if (!allowFullscreen || !wrapperRef.current) return;
    if (!document.fullscreenElement) {
      await wrapperRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const blockContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      ref={wrapperRef}
      onContextMenu={blockContextMenu}
      style={{
        ...styles.root,
        ...(isFullscreen ? styles.rootFullscreen : {}),
      }}
    >
      {/* Toolbar */}
      <div style={styles.toolbar}>
        {/* Pagination */}
        <div style={styles.toolGroup}>
          <button
            style={styles.btn}
            onClick={goToPrev}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            {icons.prev}
          </button>
          <span style={styles.pageIndicator}>
            {currentPage} / {totalPages || "–"}
          </span>
          <button
            style={styles.btn}
            onClick={goToNext}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            {icons.next}
          </button>
        </div>

        {/* Zoom */}
        <div style={styles.toolGroup}>
          <button style={styles.btn} onClick={zoomOut} disabled={scale <= ZOOM_MIN} aria-label="Zoom out">
            {icons.minus}
          </button>
          <span style={styles.zoomLabel}>{Math.round(scale * 100)}%</span>
          <button style={styles.btn} onClick={zoomIn} disabled={scale >= ZOOM_MAX} aria-label="Zoom in">
            {icons.plus}
          </button>
        </div>

        {/* Fullscreen */}
        {allowFullscreen && (
          <button style={styles.btn} onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            {isFullscreen ? icons.exitFullscreen : icons.fullscreen}
          </button>
        )}
      </div>

      {/* PDF render area */}
      <div
        ref={pageContainerRef}
        style={styles.pageArea}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoaded}
          loading={<LoadingState />}
          error={<ErrorState />}
          options={documentOptions}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            width={containerWidth > 0 ? containerWidth - 64 : undefined}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={<LoadingState />}
          />
        </Document>
      </div>
    </div>
  );
}

// Memoized to prevent unnecessary reloads when parent re-renders.
const documentOptions = {
  cMapUrl: "https://unpkg.com/pdfjs-dist/cmaps/",
  cMapPacked: true,
};

function LoadingState() {
  return (
    <div style={styles.centerMessage}>
      <span style={styles.loadingText}>Loading...</span>
    </div>
  );
}

function ErrorState() {
  return (
    <div style={styles.centerMessage}>
      <span style={{ ...styles.loadingText, color: "#f87171" }}>
        Failed to load document.
      </span>
    </div>
  );
}

// SVG icons — no external icon library needed.
const icons = {
  prev: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  next: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  minus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  fullscreen: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  exitFullscreen: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" />
      <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  ),
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    background: "#111114",
    borderRadius: "10px",
    overflow: "hidden",
    userSelect: "none",
    WebkitUserSelect: "none",
    border: "1px solid #222228",
    width: "100%",
  },
  rootFullscreen: {
    borderRadius: 0,
    border: "none",
    height: "100vh",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    padding: "10px 16px",
    background: "#18181c",
    borderBottom: "1px solid #222228",
    flexWrap: "wrap",
  },
  toolGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "#27272d",
    border: "1px solid #33333a",
    borderRadius: "6px",
    color: "#d0d0d8",
    cursor: "pointer",
    transition: "background 0.15s",
    padding: 0,
  },
  pageIndicator: {
    color: "#d0d0d8",
    fontSize: "13px",
    fontFamily: "ui-monospace, monospace",
    minWidth: "60px",
    textAlign: "center",
  },
  zoomLabel: {
    color: "#d0d0d8",
    fontSize: "13px",
    fontFamily: "ui-monospace, monospace",
    minWidth: "44px",
    textAlign: "center",
  },
  pageArea: {
    flex: 1,
    overflowY: "auto",
    overflowX: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "32px",
    background: "#111114",
  },
  centerMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    width: "100%",
  },
  loadingText: {
    color: "#6b6b78",
    fontSize: "14px",
    fontFamily: "ui-monospace, monospace",
  },
};