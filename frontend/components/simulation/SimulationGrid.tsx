"use client";

import { useCallback, useEffect, useState } from "react";
import { SimulationCard } from "./SimulationCard";
import { Simulation, SimulationFilters } from "@/types/simulation.types";
import api from "@/lib/axios";

interface SimulationGridProps {
    // Whether to fetch from the admin endpoint (includes unpublished) or the public one
    adminMode?: boolean;
    // Changes the href base on cards
    cardBasePath?: string;
}

interface FetchState {
    simulations: Simulation[];
    total: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
}

const PAGE_SIZE = 12;

export function SimulationGrid({ adminMode = false, cardBasePath }: SimulationGridProps) {
    const [filters, setFilters] = useState<SimulationFilters>({
        subjects: [],
        gradeLevels: [],
    });

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("");
    const [page, setPage] = useState(1);

    const [state, setState] = useState<FetchState>({
        simulations: [],
        total: 0,
        totalPages: 0,
        loading: true,
        error: null,
    });

    // Fetch filter options once on mount
    useEffect(() => {
        api.get("/api/simulations/meta/filters")
            .then((res) => setFilters(res.data.data))
            .catch(() => {
                // Filters failing is non-critical, the grid still works without them
            });
    }, []);

    const fetchSimulations = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const endpoint = adminMode ? "/api/simulations/admin/all" : "/api/simulations";
        const params = new URLSearchParams({
            page: String(page),
            limit: String(PAGE_SIZE),
            ...(selectedSubject && { subject: selectedSubject }),
            ...(selectedGrade && { gradeLevel: selectedGrade }),
        });

        try {
            const res = await api.get(`${endpoint}?${params}`);

            if (!res) throw new Error("Failed to fetch simulations.");

            const { data, pagination } = res.data;

            setState({
                simulations: data,
                total: pagination.total,
                totalPages: pagination.totalPages,
                loading: false,
                error: null,
            });
        } catch {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: "Could not load simulations. Please try again.",
            }));
        }
    }, [adminMode, page, selectedSubject, selectedGrade]);

    // Re-fetch when filters or page changes
    useEffect(() => {
        fetchSimulations();
    }, [fetchSimulations]);

    // Reset to page 1 when filters change
    function handleSubjectChange(value: string) {
        setSelectedSubject(value);
        setPage(1);
    }

    function handleGradeChange(value: string) {
        setSelectedGrade(value);
        setPage(1);
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 items-center">
                <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Subjects</option>
                    {filters.subjects.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Grade Levels</option>
                    {filters.gradeLevels.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>

                {(selectedSubject || selectedGrade) && (
                    <button
                        onClick={() => {
                            setSelectedSubject("");
                            setSelectedGrade("");
                            setPage(1);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear filters
                    </button>
                )}

                {!state.loading && (
                    <span className="text-sm text-gray-400 ml-auto">
            {state.total} simulation{state.total !== 1 ? "s" : ""}
          </span>
                )}
            </div>

            {/* Grid content */}
            {state.loading ? (
                <SimulationGridSkeleton />
            ) : state.error ? (
                <div className="text-center py-16 text-red-500 text-sm">{state.error}</div>
            ) : state.simulations.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                    No simulations found for the selected filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {state.simulations.map((sim) => (
                        <SimulationCard
                            key={sim.id}
                            simulation={sim}
                            basePath={cardBasePath}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {state.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-gray-600">
            Page {page} of {state.totalPages}
          </span>

                    <button
                        onClick={() => setPage((p) => Math.min(state.totalPages, p + 1))}
                        disabled={page === state.totalPages}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

// Skeleton loader matching the card grid shape
function SimulationGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 flex flex-col gap-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="flex gap-2 pt-2">
                            <div className="h-5 bg-gray-200 rounded-full w-16" />
                            <div className="h-5 bg-gray-200 rounded-full w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}