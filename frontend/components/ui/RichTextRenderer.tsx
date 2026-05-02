"use client";

import { useEffect, useRef, useState } from "react";

interface RichTextRendererProps {
  html: string;
  allowFullscreen?: boolean;
}

export default function RichTextRenderer({ html, allowFullscreen = false }: RichTextRendererProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!allowFullscreen || !wrapperRef.current) return;
    if (!document.fullscreenElement) {
      await wrapperRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div
      ref={wrapperRef}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        "flex flex-col w-full bg-white border border-slate-200 rounded-xl overflow-hidden select-none",
        isFullscreen ? "fixed inset-0 rounded-none border-none z-50 h-screen" : "",
      ].join(" ")}
    >
      {/* Top bar — same pattern as the PDF / Video shells */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
        <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">
          Lesson Content
        </span>

        {allowFullscreen && (
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        )}
      </div>

      {/* Rendered content */}
      <div
        className={[
          // rtr-body picks up the typography rules from globals.css (see below)
          "rtr-body overflow-y-auto overflow-x-hidden px-8 py-6 text-slate-700 break-words",
          isFullscreen ? "max-w-3xl mx-auto w-full" : "",
        ].join(" ")}
        // Production note: sanitize `html` with DOMPurify on the server
        // before storing. Never render untrusted third-party HTML here.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function FullscreenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" />
      <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  );
}