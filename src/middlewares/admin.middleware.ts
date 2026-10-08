import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Autorización de administrador.
 *
 * Debe ejecutarse DESPUÉS de authenticate, que es quien llena req.user.
 *  - Sin usuario autenticado → 401 (defensa en profundidad).
 *  - Usuario sin rol admin (por ejemplo technician-token) → 403 Forbidden.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AppError(401, "Unauthorized: a valid Bearer token is required");
  }

  if (req.user.role !== "admin") {
    throw new AppError(403, "Forbidden: administrator role required");
  }

  next();
}
