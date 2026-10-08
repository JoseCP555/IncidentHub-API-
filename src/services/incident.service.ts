import { incidents, nextIncidentId } from "../data/incidents.data";
import type { CreateIncidentDto, UpdateIncidentDto } from "../dtos/incident.dto";
import { AppError } from "../errors/app-error";
import type { Incident, IncidentStatus } from "../models/incident.model";

/**
 * SERVICE: contiene la lógica de negocio de los incidentes.
 *
 * - Convierte DTOs en Models (aquí se generan id, status y createdAt).
 * - Aplica la regla de transición de estados (Reto 5).
 * - Calcula bandejas y métricas (Retos 1, 2 y 3).
 *
 * No conoce Express: no recibe req/res, solo datos y lanza AppError.
 */

/** Reto 5: transiciones de estado permitidas. */
const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: ["IN_PROGRESS", "RESOLVED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
};

function findIndexOrFail(id: number): number {
  const index = incidents.findIndex((incident) => incident.id === id);
  if (index === -1) {
    throw new AppError(404, "Incident not found");
  }
  return index;
}

export const incidentService = {
  findAll(): Incident[] {
    // Se devuelve una copia para que quien consume el servicio no modifique el arreglo original.
    return [...incidents];
  },

  findById(id: number): Incident {
    return incidents[findIndexOrFail(id)];
  },

  create(dto: CreateIncidentDto): Incident {
    const incident: Incident = {
      id: nextIncidentId(),
      title: dto.title.trim(),
      description: dto.description.trim(),
      reporter: dto.reporter.trim(),
      location: dto.location.trim(),
      priority: dto.priority,
      status: "OPEN",
      estimatedMinutes: dto.estimatedMinutes,
      createdAt: new Date().toISOString(),
    };

    incidents.push(incident);
    return incident;
  },

  update(id: number, dto: UpdateIncidentDto): Incident {
    const index = findIndexOrFail(id);
    const current = incidents[index];

    const updated: Incident = {
      ...current,
      title: dto.title.trim(),
      description: dto.description.trim(),
      location: dto.location.trim(),
      priority: dto.priority,
      estimatedMinutes: dto.estimatedMinutes,
      reporter: dto.reporter?.trim() ?? current.reporter,
      // id, status y createdAt se conservan: el cliente no puede modificarlos aquí.
    };

    incidents[index] = updated;
    return updated;
  },

  updateStatus(id: number, newStatus: IncidentStatus): Incident {
    const index = findIndexOrFail(id);
    const current = incidents[index];

    if (!ALLOWED_TRANSITIONS[current.status].includes(newStatus)) {
      throw new AppError(
        400,
        `Invalid status transition: ${current.status} -> ${newStatus}`
      );
    }

    const updated: Incident = { ...current, status: newStatus };
    incidents[index] = updated;
    return updated;
  },

  remove(id: number): void {
    const index = findIndexOrFail(id);
    incidents.splice(index, 1);
  },

  /** Reto 1: incidentes con prioridad CRITICAL. */
  findCritical(): Incident[] {
    return incidents.filter((incident) => incident.priority === "CRITICAL");
  },

  /** Reto 2: incidentes OPEN o IN_PROGRESS (excluye RESOLVED). */
  findPending(): Incident[] {
    return incidents.filter((incident) => incident.status !== "RESOLVED");
  },

  /** Reto 3: métricas calculadas dinámicamente a partir de los datos actuales. */
  getStats() {
    const total = incidents.length;
    const totalMinutes = incidents.reduce((sum, incident) => sum + incident.estimatedMinutes, 0);

    return {
      total,
      open: incidents.filter((i) => i.status === "OPEN").length,
      inProgress: incidents.filter((i) => i.status === "IN_PROGRESS").length,
      resolved: incidents.filter((i) => i.status === "RESOLVED").length,
      critical: incidents.filter((i) => i.priority === "CRITICAL").length,
      averageEstimatedMinutes: total === 0 ? 0 : Math.round(totalMinutes / total),
    };
  },
};
