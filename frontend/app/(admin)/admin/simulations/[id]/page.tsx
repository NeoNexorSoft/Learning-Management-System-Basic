import { notFound } from "next/navigation";
import Link from "next/link";
import { SimulationViewer } from "@/components/simulation/SimulationViewer";

interface AdminSimulationPreviewPageProps {
    params: Promise<{ id: string }>;
}

async function getSimulation(id: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/simulations/${id}`,
            { cache: "no-store" }
        );
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch {
        return null;
    }
}

export default async function AdminSimulationPreviewPage({
                                                             params,
                                                         }: AdminSimulationPreviewPageProps) {
    const { id } = await params;
    const simulation = await getSimulation(id);

    if (!simulation) notFound();

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
                <Link
                    href="/admin/simulations"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Simulations
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 font-medium line-clamp-1">
                    {simulation.title}
                </span>
            </nav>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold text-gray-900">
                        {simulation.title}
                    </h1>
                    {simulation.description && (
                        <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
                            {simulation.description}
                        </p>
                    )}
                </div>

                <Link
                    href={`/admin/simulations/${id}/edit`}
                    className="shrink-0 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Edit
                </Link>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                    {simulation.subject}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                    {simulation.grade_level}
                </span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    {simulation.provider}
                </span>
                <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ml-auto ${
                        simulation.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}
                >
                    {simulation.is_published ? "Published" : "Draft"}
                </span>
            </div>

            {/* Live preview */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wide">
                    Live Preview
                </p>
                <SimulationViewer
                    simulationUrl={simulation.simulation_url}
                    title={simulation.title}
                    provider={simulation.provider}
                />
            </div>

            {/* Footer meta */}
            <div className="text-xs text-gray-400 flex gap-4">
                <span>Created by {simulation.createdBy?.name ?? "Admin"}</span>
                <span>
                    Last updated{" "}
                    {new Date(simulation.updated_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
            </div>
        </div>
    );
}