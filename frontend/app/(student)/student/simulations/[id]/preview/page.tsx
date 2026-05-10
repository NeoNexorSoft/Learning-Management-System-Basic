"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { SimulationViewer } from "@/components/simulation/SimulationViewer";
import { Simulation } from "@/types/simulation.types";

export default function StudentSimulationViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [simulation, setSimulation] = useState<Simulation | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;

        api.get(`/api/simulations/${id}`)
            .then((res) => {
                const data: Simulation = res.data.data;

                // Unpublished simulations are not accessible to students
                if (!data.isPublished) {
                    setNotFound(true);
                    return;
                }

                setSimulation(data);
            })
            .catch(() => {
                setNotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <ViewerSkeleton />;
    }

    if (notFound || !simulation) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-sm text-gray-400">Simulation not found.</p>
                <button
                    onClick={() => router.push("/student/simulations")}
                    className="text-sm text-blue-500 hover:underline"
                >
                    Back to simulations
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link
                    href="/student/simulations"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Simulations
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 font-medium line-clamp-1">
                    {simulation.title}
                </span>
            </div>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                    {simulation.subject}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                    {simulation.gradeLevel}
                </span>
            </div>

            {/* Description */}
            {simulation.description && (
                <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                    {simulation.description}
                </p>
            )}

            {/* Simulation iframe */}
            <SimulationViewer
                simulationUrl={simulation.simulationUrl}
                title={simulation.title}
                provider={simulation.provider}
            />
        </div>
    );
}

function ViewerSkeleton() {
    return (
        <div className="flex flex-col gap-5 p-6 animate-pulse">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
            </div>
            <div className="h-4 w-96 bg-gray-200 rounded" />
            <div className="w-full bg-gray-200 rounded-xl" style={{ aspectRatio: "16/9" }} />
        </div>
    );
}