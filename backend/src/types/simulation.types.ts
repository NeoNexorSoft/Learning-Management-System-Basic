export interface CreateSimulationBody {
    title: string;
    description?: string;
    subject: string;
    grade_level: string;
    provider: string;
    simulation_url: string;
    thumbnail_url?: string;
    is_published?: boolean;
}