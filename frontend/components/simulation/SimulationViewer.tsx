"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface SimulationViewerProps {
    simulationUrl: string;
    title: string;
    provider: string;
}

type LoadState = "loading" | "loaded" | "error";

export function SimulationViewer({simulationUrl, title, provider}: SimulationViewerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Disable right-click on the iframe container so users cannot inspect or save
    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault();
    }

    // Listen for fullscreen change events to keep isFullscreen state in sync
    useEffect(() => {
        function onFullscreenChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }

        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    const enterFullscreen = useCallback(() => {
        if (containerRef.current && containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen().catch(() => {
                // Fullscreen request failed silently — not critical
            });
        }
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }, []);

    return (
        <div className="flex flex-col gap-3">
            {/* Viewer header bar */}
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    <span className="text-xs text-gray-400">Provided by {provider}</span>
                </div>

                <button
                    onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                    {isFullscreen ? (
                        <FullscreenExitIcon />
                    ) : (
                        <FullscreenEnterIcon />
                    )}
                    <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                </button>
            </div>

            {/* Iframe container */}
            <div
                ref={containerRef}
                onContextMenu={handleContextMenu}
                className="relative w-3/4 mx-auto bg-gray-950 rounded-xl overflow-hidden"
                style={{ aspectRatio: "16 / 9" }}
            >
                {/* Loading overlay — shown while iframe is initializing */}
                {loadState === "loading" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950 z-10">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Loading simulation...</p>
                    </div>
                )}

                {/* Error overlay — shown if the iframe fails to load */}
                {loadState === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950 z-10 text-center px-6">
                        <p className="text-sm font-medium text-red-400">
                            This simulation could not be loaded.
                        </p>
                        <p className="text-xs text-gray-500">
                            The provider may be blocking embedding, or the URL may be incorrect.
                        </p>
                        <a
                            href={simulationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:underline"
                        >
                            Open directly on {provider}
                        </a>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    src={simulationUrl}
                    title={title}
                    className="w-full h-full border-0"
                    // Sandbox allows scripts and same-origin so most HTML5 sims run.
                    // allow-popups is excluded to keep the user on your platform.
                    sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
                    allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="no-referrer"
                    onLoad={() => setLoadState("loaded")}
                    onError={() => setLoadState("error")}
                    // Height must be set explicitly when inside aspect-ratio container
                    style={{ display: loadState === "error" ? "none" : "block" }}
                />
            </div>

            {/* Attribution note — good practice for PhET and similar CC-licensed sims */}
            <p className="text-xs text-gray-400 text-center">
                This simulation is provided by{" "}
                <a
                    href={simulationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                >
                    {provider}
                </a>
                . Interaction data is not collected by our platform.
            </p>
        </div>
    );
}

function FullscreenEnterIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5"
            />
        </svg>
    );
}

function FullscreenExitIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
            />
        </svg>
    );
}