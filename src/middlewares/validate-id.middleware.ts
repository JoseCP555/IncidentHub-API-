import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * validateId: verifica que :id sea un entero positivo.
 *
 * Inválidos: "abc", "-3", "0", "4.5".
 * Si es válido, guarda el número en res.locals.incidentId para que el controller lo use.
 */
export function validateId(req: Request, res: Response, next: NextFunction): void {
  const raw = req.params.id;

  if (typeof raw !== "string" || !/^\d+$/.test(raw)) {
    throw new AppError(400, "Invalid incident id");
  }

  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid incident id");
  }

  res.locals.incidentId = id;
  next();
}
