import { Router } from "express";
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as simulationController from "../controllers/simulation.controller";
import {Role} from "@prisma/client";

const simulationRouter = Router();

// ─── Admin routes ─────────────────────────────────────────────────────────────
// All write operations and admin reads are gated behind ADMIN role

simulationRouter.get(
    "/admin/all",
    authenticate,
    requireRole("ADMIN"),
    simulationController.getAllSimulations
);

simulationRouter.post(
    "/",
    authenticate,
    requireRole("ADMIN"),
    simulationController.createSimulation
);

simulationRouter.put(
    "/:id",
    authenticate,
    requireRole("ADMIN"),
    simulationController.updateSimulation
);

// simulationRouter.patch(
//     "/:id/publish",
//     authenticate,
//     requireRole("ADMIN"),
//     simulationController.togglePublish
// );

simulationRouter.delete(
    "/:id",
    authenticate,
    requireRole("ADMIN"),
    simulationController.deleteSimulation
);

// ─── Student routes ────────────────────────────────────────────────────────────
// Students can only read published simulations

simulationRouter.get(
    "/meta/filters",
    authenticate,
    requireRole("STUDENT"),
    simulationController.getSimulationFilters
);

simulationRouter.get(
    "/",
    authenticate,
    requireRole("STUDENT"),
    simulationController.getPublishedSimulations
);

simulationRouter.get(
    "/:id",
    authenticate,
    requireRole(Role.ADMIN, Role.STUDENT),
    simulationController.getSimulationById
);

export default simulationRouter;