"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface PreviewZoomControlProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.2;

export default function PreviewZoomControl({
                                               zoom,
                                               onZoomIn,
                                               onZoomOut,
                                               onReset,
                                           }: PreviewZoomControlProps) {
    const percent = Math.round(zoom * 100);

    return (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm px-1 py-1">
            <button
                type="button"
                onClick={onZoomOut}
                disabled={zoom <= MIN_ZOOM}
                title="Zoom out"
                className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ZoomOut size={14} />
            </button>

            <button
                type="button"
                onClick={onReset}
                title="Reset zoom"
                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all min-w-[40px] text-center"
            >
                {percent}%
            </button>

            <button
                type="button"
                onClick={onZoomIn}
                disabled={zoom >= MAX_ZOOM}
                title="Zoom in"
                className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ZoomIn size={14} />
            </button>

            <div className="w-px h-4 bg-gray-200 mx-0.5" />

            <button
                type="button"
                onClick={onReset}
                title="Fit to panel"
                className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
            >
                <Maximize2 size={14} />
            </button>
        </div>
    );
}