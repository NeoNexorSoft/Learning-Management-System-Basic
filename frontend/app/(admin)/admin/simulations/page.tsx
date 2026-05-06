"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Simulation } from "@/types/simulation.types";
import api from "@/lib/axios";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function AdminSimulationsPage() {
    const [confirmOpen,   setConfirmOpen]   = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const loadSimulations = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/api/simulations/admin/all?limit=100");
            const { data } = res;
            setSimulations(data?.data);
        } catch {
            setError("Failed to load simulations.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSimulations();
    }, [loadSimulations]);

    async function handleTogglePublish(id: string) {
        setTogglingId(id);
        try {
            const res = await fetch(`/api/simulations/${id}/publish`, { method: "PATCH" });
            if (!res.ok) throw new Error();
            const json = await res.json();
            setSimulations((prev) =>
                prev.map((s) => (s.id === id ? { ...s, isPublished: json.data.isPublished } : s))
            );
        } catch {
            alert("Failed to update status. Please try again.");
        } finally {
            setTogglingId(null);
        }
    }

    async function handleDelete() {
        try {
            const res = await api.delete(`/api/simulations/${deleteId}`, { method: "DELETE" });
            if (res) setConfirmOpen(false)
            setSimulations((prev) => prev.filter((s) => s.id !== deleteId));
        } catch {
            alert("Failed to delete simulation. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Simulations</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage interactive scientific simulations available to students.
                    </p>
                </div>
                <Link
                    href="/admin/simulations/create"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Simulation
                </Link>
            </div>

            {/* Content */}
            {loading ? (
                <TableSkeleton />
            ) : error ? (
                <div className="text-sm text-red-500 py-8 text-center">{error}</div>
            ) : simulations.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-sm">No simulations yet.</p>
                    <Link
                        href="/admin/simulations/create"
                        className="text-sm text-blue-500 hover:underline mt-1 inline-block"
                    >
                        Add your first simulation
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <tr>
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Subject</th>
                            <th className="px-4 py-3 font-medium">Grade</th>
                            <th className="px-4 py-3 font-medium">Provider</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {simulations.map((sim) => (
                            <tr key={sim.id} className="bg-white hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                                    <span className="line-clamp-1">{sim.title}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{sim.subject}</td>
                                <td className="px-4 py-3 text-gray-600">{sim.gradeLevel}</td>
                                <td className="px-4 py-3 text-gray-500">{sim.provider}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                                            sim.isPublished
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        } disabled:opacity-50`}
                                    >
                                        {sim.isPublished ? "Published" : "Draft"}
                                    </span>
                                    {/*<button*/}
                                    {/*    onClick={() => handleTogglePublish(sim.id)}*/}
                                    {/*    disabled={togglingId === sim.id}*/}
                                    {/*    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${*/}
                                    {/*        sim.isPublished*/}
                                    {/*            ? "bg-green-100 text-green-700 hover:bg-green-200"*/}
                                    {/*            : "bg-gray-100 text-gray-500 hover:bg-gray-200"*/}
                                    {/*    } disabled:opacity-50`}*/}
                                    {/*>*/}
                                    {/*    {togglingId === sim.id*/}
                                    {/*        ? "..."*/}
                                    {/*        : sim.isPublished*/}
                                    {/*            ? "Published"*/}
                                    {/*            : "Draft"}*/}
                                    {/*</button>*/}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/simulations/${sim.id}/edit`}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setDeleteId(sim.id)
                                                setConfirmOpen(true)
                                            }}
                                            disabled={deletingId === sim.id}
                                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                                        >
                                            {deletingId === sim.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false) }}
                onConfirm={handleDelete}
                loading={actionLoading}
                title={"Want to delete?"}
                message={"You want to delete this simulation?"}
                confirmLabel={"Yes, delete"}
                danger={true}
            />
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-10 bg-gray-50 border-b border-gray-200" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 border-b border-gray-100 px-4 flex items-center gap-4">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
            ))}
        </div>
    );
}