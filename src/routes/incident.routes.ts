import { Router } from "express";
import {
  createIncident,
  deleteIncident,
  getAllIncidents,
  getCriticalIncidents,
  getIncidentById,
  getIncidentStats,
  getPendingIncidents,
  updateIncident,
  updateIncidentStatus,
} from "../controllers/incident.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { validateId } from "../middlewares/validate-id.middleware";
import { validateIncident, validateIncidentUpdate } from "../middlewares/validate-incident.middleware";
import { validatePriority } from "../middlewares/validate-priority.middleware";
import { validateStatus } from "../middlewares/validate-status.middleware";
import { validateTime } from "../middlewares/validate-time.middleware";

/**
 * ROUTES: solo declaran qué middlewares y qué controller atienden cada endpoint.
 * No contienen lógica. El orden de los middlewares es el orden de ejecución.
 *
 * Nota: /critical, /pending y /stats se declaran ANTES de /:id; de lo contrario
 * Express los interpretaría como un id.
 */
export const incidentRouter = Router();

// Consultas públicas
incidentRouter.get("/", getAllIncidents);
incidentRouter.get("/critical", getCriticalIncidents);
incidentRouter.get("/pending", getPendingIncidents);
incidentRouter.get("/stats", getIncidentStats);
incidentRouter.get("/:id", validateId, getIncidentById);

// Operaciones protegidas (requieren token Bearer)
incidentRouter.post("/", authenticate, validateIncident, validatePriority, validateTime, createIncident);
incidentRouter.put("/:id", authenticate, validateId, validateIncidentUpdate, validatePriority, validateTime, updateIncident);
incidentRouter.patch("/:id/status", authenticate, validateId, validateStatus, updateIncidentStatus);

// Solo administrador
incidentRouter.delete("/:id", authenticate, requireAdmin, validateId, deleteIncident);
