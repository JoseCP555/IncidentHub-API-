import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * 404 global: se ejecuta solo si ninguna ruta anterior respondió.
 * Por ejemplo, GET /api/planets → 404 "Route not found".
 *
 * Lanza un AppError para que la respuesta siga el mismo formato que el resto de errores.
 */
export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "Route not found"));
}
