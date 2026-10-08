import type { IncidentPriority, IncidentStatus } from "../models/incident.model";

/**
 * DTO: datos PERMITIDOS para registrar un incidente (POST /api/incidents).
 *
 * El cliente no envía id, status ni createdAt: el servidor los genera.
 */
export interface CreateIncidentDto {
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  estimatedMinutes: number;
}

/**
 * DTO: datos PERMITIDOS para actualizar un incidente (PUT /api/incidents/:id).
 *
 * - El id no puede modificarse.
 * - status no se cambia aquí; tiene su propio endpoint (PATCH /:id/status).
 * - reporter es opcional: si no se envía, se conserva el reportero original.
 */
export interface UpdateIncidentDto {
  title: string;
  description: string;
  location: string;
  priority: IncidentPriority;
  estimatedMinutes: number;
  reporter?: string;
}

/** DTO: datos PERMITIDOS para cambiar el estado (PATCH /api/incidents/:id/status). */
export interface UpdateIncidentStatusDto {
  status: IncidentStatus;
}
