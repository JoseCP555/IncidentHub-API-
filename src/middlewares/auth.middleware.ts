import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

export interface AuthUser {
  name: string;
  role: "admin" | "technician";
}

/**
 * Tokens de demostración (no se usa JWT en esta versión).
 *  - instructor-token  → administrador (puede eliminar incidentes)
 *  - technician-token  → técnico (GET, POST, PUT, PATCH)
 *
 * Se usa un Map y no un objeto literal para evitar que un encabezado como
 * "Bearer constructor" encuentre propiedades heredadas de Object.prototype.
 */
const TOKENS = new Map<string, AuthUser>([
  ["instructor-token", { name: "instructor", role: "admin" }],
  ["technician-token", { name: "technician", role: "technician" }],
]);

/**
 * Autenticación: exige un encabezado "Authorization: Bearer <token>" válido.
 * Si falta o el token no existe, responde 401 Unauthorized.
 * Si es válido, guarda el usuario en req.user para que el siguiente middleware decida permisos.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const match = req.headers.authorization?.match(/^Bearer\s+(\S+)$/);
  const user = match ? TOKENS.get(match[1]) : undefined;

  if (!user) {
    throw new AppError(401, "Unauthorized: a valid Bearer token is required");
  }

  req.user = user;
  next();
}
