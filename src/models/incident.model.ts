/**
 * MODEL: representa cómo existe un incidente DENTRO de la aplicación.
 *
 * Incluye los campos que solo el servidor controla (id, status, createdAt).
 * El cliente nunca envía estos datos directamente; para eso existen los DTOs
 * (ver src/dtos/incident.dto.ts).
 */

export const INCIDENT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[number];

export const INCIDENT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface Incident {
  id: number;
  title: string;
  description: string;
  reporter: string;
  location: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  /** Tiempo estimado de atención, en minutos. */
  estimatedMinutes: number;
  /** Fecha de registro en formato ISO 8601 (UTC). */
  createdAt: string;
}
