import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { INCIDENT_PRIORITIES } from "../models/incident.model";
import { getBodyObject } from "../utils/validation.utils";

/**
 * validatePriority: solo permite LOW, MEDIUM, HIGH y CRITICAL.
 * Cualquier otro valor (por ejemplo SUPER_IMPORTANT) responde 400 Bad Request.
 */
export function validatePriority(req: Request, _res: Response, next: NextFunction): void {
  const body = getBodyObject(req.body);

  const isValid = (INCIDENT_PRIORITIES as readonly unknown[]).includes(body.priority);
  if (!isValid) {
    throw new AppError(
      400,
      `Invalid priority. Allowed values: ${INCIDENT_PRIORITIES.join(", ")}`
    );
  }

  next();
}
