import { AppError } from "../errors/app-error";

/** Indica si el valor es un objeto JSON (no null, no arreglo). */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Obtiene req.body como objeto o lanza 400. */
export function getBodyObject(body: unknown): Record<string, unknown> {
  if (!isPlainObject(body)) {
    throw new AppError(400, "Request body must be a JSON object");
  }
  return body;
}

/** Verifica que el campo exista y no sea null/undefined. */
export function assertPresent(body: Record<string, unknown>, field: string): void {
  if (body[field] === undefined || body[field] === null) {
    throw new AppError(400, `Field "${field}" is required`);
  }
}

/** Verifica que el campo sea un texto no vacío. */
export function assertNonEmptyString(body: Record<string, unknown>, field: string): void {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(400, `Field "${field}" is required and must be a non-empty string`);
  }
}
