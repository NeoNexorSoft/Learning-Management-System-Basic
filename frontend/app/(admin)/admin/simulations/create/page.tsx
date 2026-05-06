import Link from "next/link";
import { SimulationForm } from "@/components/simulation/SimulationForm";

// This page is a server component — the form inside is a client component.
export default function NewSimulationPage() {
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
                <span className="text-sm text-gray-700 font-medium">New Simulation</span>
            </div>

            <div>
                <h1 className="text-xl font-semibold text-gray-900">Add Simulation</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Add a third-party simulation link. Students and the public site will see
                    published simulations.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 w-full">
                <SimulationForm />
            </div>
        </div>
    );
}