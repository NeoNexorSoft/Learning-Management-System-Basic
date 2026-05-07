import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

// Validation schema for create and update operations.
// Using zod keeps validation declarative and easy to read.
const simulationBodySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters.").max(150),
    description: z.string().max(1000).optional(),
    subject: z.string().min(1, "Subject is required.").max(100),
    gradeLevel: z.string().min(1, "Grade level is required.").max(50),
    provider: z.string().min(1, "Provider name is required.").max(100),
    simulationUrl: z.string().url("A valid simulation URL is required."),
    thumbnailUrl: z.string().url("Thumbnail must be a valid URL.").optional().or(z.literal("")),
    isPublished: z.boolean().optional().default(false),
});

// Reusable select — never pull more fields than needed
const simulationSelect = {
    id: true,
    title: true,
    description: true,
    subject: true,
    gradeLevel: true,
    provider: true,
    simulationUrl: true,
    thumbnailUrl: true,
    isPublished: true,
    createdAt: true,
    updatedAt: true,
    createdBy: {
        select: { id: true, name: true },
    },
};

// GET /api/simulations
// Public — returns only published simulations. Supports subject and gradeLevel filters.
export async function getPublishedSimulations(req: Request, res: Response): Promise<void> {
    try {
        const { subject, gradeLevel, page = "1", limit = "12" } = req.query;

        const pageNumber = Math.max(1, parseInt(page as string, 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNumber - 1) * pageSize;

        const where = {
            isPublished: true,
            ...(subject && { subject: subject as string }),
            ...(gradeLevel && { gradeLevel: gradeLevel as string }),
        };

        const [simulations, total] = await Promise.all([
            prisma.simulation.findMany({
                where,
                select: simulationSelect,
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.simulation.count({ where }),
        ]);

        res.json({
            data: simulations,
            pagination: {
                total,
                page: pageNumber,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch simulations." });
    }
}

// GET /api/simulations/all
// Admin/Instructor — returns all simulations including unpublished
export async function getAllSimulations(req: Request, res: Response): Promise<void> {
    try {
        const { subject, gradeLevel, page = "1", limit = "20" } = req.query;

        const pageNumber = Math.max(1, parseInt(page as string, 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNumber - 1) * pageSize;

        const where = {
            ...(subject && { subject: subject as string }),
            ...(gradeLevel && { gradeLevel: gradeLevel as string }),
        };

        const [simulations, total] = await Promise.all([
            prisma.simulation.findMany({
                where,
                select: simulationSelect,
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.simulation.count({ where }),
        ]);

        res.json({
            data: simulations,
            pagination: {
                total,
                page: pageNumber,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch simulations." });
    }
}

// GET /api/simulations/:id
// Public — only returns published simulations. Admin route handles drafts.
export async function getSimulationById(req: Request, res: Response): Promise<void> {
    console.log(req.params)
    try {
        const id = req.params.id as string;

        const simulation = await prisma.simulation.findUnique({
            where: { id },
            select: simulationSelect,
        });

        if (!simulation) {
            res.status(404).json({ message: "Simulation not found." });
            return;
        }

        // Non-admins cannot access unpublished simulations
        const userRole = req.user?.role;
        if (!simulation.isPublished && userRole !== "ADMIN") {
            res.status(404).json({ message: "Simulation not found." });
            return;
        }

        res.json({ data: simulation });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch simulation." });
    }
}

// POST /api/simulations
// Admin only
export async function createSimulation(req: Request, res: Response): Promise<void> {
    try {
        const parsed = simulationBodySchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed.",
                errors: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const data = parsed.data;

        const simulation = await prisma.simulation.create({
            data: {
                title: data.title,
                description: data.description,
                subject: data.subject,
                gradeLevel: data.gradeLevel,
                provider: data.provider,
                simulationUrl: data.simulationUrl,
                thumbnailUrl: data.thumbnailUrl || null,
                isPublished: data.isPublished,
                createdById: req.user!.userId,
            },
            select: simulationSelect,
        });

        res.status(201).json({ data: simulation });
    } catch (error) {
        res.status(500).json({ message: "Failed to create simulation." });
    }
}

// PUT /api/simulations/:id
// Admin only
export async function updateSimulation(req: Request, res: Response): Promise<void> {
    try {
        const id = req.params.id as string;

        const parsed = simulationBodySchema.partial().safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed.",
                errors: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        const existing = await prisma.simulation.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            res.status(404).json({ message: "Simulation not found." });
            return;
        }

        const simulation = await prisma.simulation.update({
            where: { id },
            data: {
                ...parsed.data,
                thumbnailUrl: parsed.data.thumbnailUrl || null,
            },
            select: simulationSelect,
        });

        res.json({ data: simulation });
    } catch (error) {
        res.status(500).json({ message: "Failed to update simulation." });
    }
}

// PATCH /api/simulations/:id/publish
// Admin only — dedicated toggle endpoint keeps publish logic isolated
export async function togglePublishSimulation(req: Request, res: Response): Promise<void> {
    try {
        const id = req.params.id as string;

        const existing = await prisma.simulation.findUnique({
            where: { id },
            select: { id: true, isPublished: true },
        });

        if (!existing) {
            res.status(404).json({ message: "Simulation not found." });
            return;
        }

        const simulation = await prisma.simulation.update({
            where: { id },
            data: { isPublished: !existing.isPublished },
            select: { id: true, isPublished: true, title: true },
        });

        res.json({ data: simulation });
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle publish status." });
    }
}

// DELETE /api/simulations/:id
// Admin only
export async function deleteSimulation(req: Request, res: Response): Promise<void> {
    try {
        const id = req.params.id as string;

        const existing = await prisma.simulation.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            res.status(404).json({ message: "Simulation not found." });
            return;
        }

        await prisma.simulation.delete({ where: { id } });

        res.json({ message: "Simulation deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete simulation." });
    }
}

// GET /api/simulations/meta/filters
// Returns distinct subject and gradeLevel values for filter dropdowns
export async function getSimulationFilters(req: Request, res: Response): Promise<void> {
    try {
        const [subjects, gradeLevels] = await Promise.all([
            prisma.simulation.findMany({
                where: { isPublished: true },
                select: { subject: true },
                distinct: ["subject"],
                orderBy: { subject: "asc" },
            }),
            prisma.simulation.findMany({
                where: { isPublished: true },
                select: { gradeLevel: true },
                distinct: ["gradeLevel"],
                orderBy: { gradeLevel: "asc" },
            }),
        ]);

        res.json({
            data: {
                subjects: subjects.map((s) => s.subject),
                gradeLevels: gradeLevels.map((g) => g.gradeLevel),
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch filters." });
    }
}