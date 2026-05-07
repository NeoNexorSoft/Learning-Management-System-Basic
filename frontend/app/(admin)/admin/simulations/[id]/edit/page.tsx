"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { SimulationForm } from "@/components/simulation/SimulationForm";
import { Simulation } from "@/types/simulation.types";

export default function EditSimulationPage() {
    const params = useParams();
    const id = params.id as string;

    const [simulation, setSimulation] = useState<Simulation | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;

        api.get(`/api/simulations/${id}`)
            .then((res) => {
                setSimulation(res.data.data);
            })
            .catch(() => {
                setNotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <EditPageSkeleton />;
    }

    if (notFound || !simulation) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                Simulation not found.
            </div>
        );
    }

    const initialValues = {
        title: simulation.title,
        description: simulation.description ?? "",
        subject: simulation.subject,
        gradeLevel: simulation.gradeLevel,
        provider: simulation.provider,
        simulationUrl: simulation.simulationUrl,
        thumbnailUrl: simulation.thumbnailUrl ?? "",
        isPublished: simulation.isPublished,
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/simulations"
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Simulations
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm text-gray-700 font-medium line-clamp-1">
                    {simulation.title}
                </span>
            </div>

            <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Simulation</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Changes to published simulations are visible immediately.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 w-full">
                <SimulationForm initialValues={initialValues} simulationId={id} />
            </div>
        </div>
    );
}

function EditPageSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6 max-w-3xl animate-pulse">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-6 w-64 bg-gray-200 rounded" />
            <div className="flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded-lg" />
                ))}
            </div>
        </div>
    );
}