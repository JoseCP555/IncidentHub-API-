import type { NextFunction, Request, Response } from "express";

export interface RequestInfo {
  timestamp: string;
  method: string;
  path: string;
}

/**
 * RequestInfo: ENRIQUECE el objeto Request con información adicional
 * antes de entregarlo al siguiente componente de la cadena.
 *
 * Demuestra que un middleware puede aportar datos que otros componentes
 * (controllers, logs, auditorías) luego pueden leer en req.requestInfo.
 */
export function requestInfo(req: Request, _res: Response, next: NextFunction): void {
  req.requestInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
  };
  next();
}
