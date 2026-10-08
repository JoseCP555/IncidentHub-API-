import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { INCIDENT_STATUSES } from "../models/incident.model";
import { getBodyObject } from "../utils/validation.utils";

/**
 * validateStatus: el body de PATCH /:id/status solo puede contener OPEN, IN_PROGRESS o RESOLVED.
 * Cualquier otro valor responde 400 Bad Request.
 *
 * La regla de transición (por ejemplo, impedir RESOLVED → OPEN) no vive aquí:
 * depende del estado actual del incidente, así que se verifica en el service.
 */
export function validateStatus(req: Request, _res: Response, next: NextFunction): void {
  const body = getBodyObject(req.body);

  const isValid = (INCIDENT_STATUSES as readonly unknown[]).includes(body.status);
  if (!isValid) {
    throw new AppError(
      400,
      `Invalid status. Allowed values: ${INCIDENT_STATUSES.join(", ")}`
    );
  }

  next();
}
