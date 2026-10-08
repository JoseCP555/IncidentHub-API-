import type { NextFunction, Request, Response } from "express";
import { MAX_CRITICAL_ESTIMATED_MINUTES, MAX_ESTIMATED_MINUTES } from "../config/incident.rules";
import { AppError } from "../errors/app-error";
import { getBodyObject } from "../utils/validation.utils";

/**
 * validateTime: reglas sobre estimatedMinutes.
 *
 *  1. Debe ser numérico.
 *  2. Debe ser mayor que 0.
 *  3. No puede superar 480 minutos.
 *  4. (Reto 4) Si priority = CRITICAL, no puede superar 60 minutos.
 *
 * DECISIÓN TÉCNICA (Reto 4): la regla de CRITICAL se implementa aquí y no en el controller
 * porque:
 *  - Es una regla sobre el dato de entrada que se puede comprobar sin consultar la base de datos
 *    ni el estado actual, así que pertenece a la etapa de validación.
 *  - Se ejecuta antes del controller: una petición inválida nunca llega a la lógica de negocio.
 *  - Se aplica automáticamente a POST y PUT sin duplicar código, porque ambas rutas usan este middleware.
 *  - Va después de validatePriority, así que la prioridad ya está garantizada como válida.
 */
export function validateTime(req: Request, _res: Response, next: NextFunction): void {
  const body = getBodyObject(req.body);
  const minutes = body.estimatedMinutes;

  if (typeof minutes !== "number" || !Number.isFinite(minutes)) {
    throw new AppError(400, "estimatedMinutes must be a number");
  }

  if (minutes <= 0) {
    throw new AppError(400, "estimatedMinutes must be greater than 0");
  }

  if (minutes > MAX_ESTIMATED_MINUTES) {
    throw new AppError(400, `estimatedMinutes cannot exceed ${MAX_ESTIMATED_MINUTES} minutes`);
  }

  if (body.priority === "CRITICAL" && minutes > MAX_CRITICAL_ESTIMATED_MINUTES) {
    throw new AppError(
      400,
      `CRITICAL incidents cannot exceed ${MAX_CRITICAL_ESTIMATED_MINUTES} estimated minutes`
    );
  }

  next();
}
