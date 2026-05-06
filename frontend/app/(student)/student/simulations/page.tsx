import { SimulationGrid } from "@/components/simulation/SimulationGrid";

// This is a server component shell — the grid handles client-side fetching and filtering.
export default function StudentSimulationsPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Science Simulations</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Explore interactive simulations to deepen your understanding of scientific concepts.
                </p>
            </div>

            <SimulationGrid cardBasePath="/student/simulations" />
        </div>
    );
}