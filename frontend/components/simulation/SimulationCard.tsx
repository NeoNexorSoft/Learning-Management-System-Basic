"use client";

import Link from "next/link";
import Image from "next/image";
import { Simulation } from "@/types/simulation.types";

interface SimulationCardProps {
    simulation: Simulation;
    // The base path differs between public (/simulations) and dashboard (/dashboard/simulations)
    basePath?: string;
}

export function SimulationCard({ simulation, basePath = "/simulations", }: SimulationCardProps) {
    const { id, title, description, subject, gradeLevel, provider, thumbnailUrl } = simulation;
    const href = `${basePath}/${id}/preview`;

    return (
        <Link
            href={href}
            className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            {/* Thumbnail */}
            <div className="relative w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    // Placeholder when no thumbnail is provided
                    <div className="flex flex-col items-center gap-2 text-gray-400 select-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.25M14.25 3.104c.251.023.501.05.75.082M19.5 14.25l-4.159 4.159a2.25 2.25 0 01-1.591.659H10.5"
                            />
                        </svg>
                        <span className="text-xs">{provider}</span>
                    </div>
                )}

                {/* Provider badge */}
                <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-0.5 rounded">
                  {provider}
                </span>
            </div>

            {/* Card body */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                    <Tag label={subject} color="blue" />
                    <Tag label={gradeLevel} color="gray" />
                </div>
            </div>
        </Link>
    );
}

function Tag({ label, color }: { label: string; color: "blue" | "gray" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border border-blue-100",
        gray: "bg-gray-100 text-gray-600",
    };

    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>
          {label}
        </span>
    );
}