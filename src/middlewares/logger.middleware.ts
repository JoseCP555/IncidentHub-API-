import type { NextFunction, Request, Response } from "express";

/**
 * Logger: registra cada petición que llega al servidor.
 * Formato: [2026-09-18T15:20:30.000Z] POST /api/incidents
 *
 * Es el PRIMER middleware de la cadena, así registra incluso peticiones que fallan después.
 */
export function logger(req: Request, _res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}
