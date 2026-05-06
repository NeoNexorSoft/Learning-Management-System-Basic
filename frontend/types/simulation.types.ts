export interface Simulation {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    gradeLevel: string;
    provider: string;
    simulationUrl: string;
    thumbnailUrl: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        name: string;
    };
}

export interface SimulationFilters {
    subjects: string[];
    gradeLevels: string[];
}

export interface PaginatedSimulations {
    data: Simulation[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export interface SimulationFormValues {
    title: string;
    description: string;
    subject: string;
    gradeLevel: string;
    provider: string;
    simulationUrl: string;
    thumbnailUrl: string;
    isPublished: boolean;
}