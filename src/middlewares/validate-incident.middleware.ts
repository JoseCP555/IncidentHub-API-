import type { NextFunction, Request, Response } from "express";
import { assertNonEmptyString, assertPresent, getBodyObject } from "../utils/validation.utils";

/**
 * validateIncident: valida la estructura del body antes de llegar al controller.
 *
 * - POST (validateIncident): exige title, description, reporter, location, priority y estimatedMinutes.
 * - PUT (validateIncidentUpdate): exige title, description, location, priority y estimatedMinutes.
 *   reporter es opcional; si llega, debe ser texto no vacío.
 *
 * Los valores concretos de priority y estimatedMinutes se validan en
 * validatePriority y validateTime. Aquí solo se verifica que existan y tengan tipo de texto.
 */

export function validateIncident(req: Request, _res: Response, next: NextFunction): void {
  const body = getBodyObject(req.body);

  assertNonEmptyString(body, "title");
  assertNonEmptyString(body, "description");
  assertNonEmptyString(body, "reporter");
  assertNonEmptyString(body, "location");
  assertPresent(body, "priority");
  assertPresent(body, "estimatedMinutes");

  next();
}

export function validateIncidentUpdate(req: Request, _res: Response, next: NextFunction): void {
  const body = getBodyObject(req.body);

  assertNonEmptyString(body, "title");
  assertNonEmptyString(body, "description");
  assertNonEmptyString(body, "location");
  assertPresent(body, "priority");
  assertPresent(body, "estimatedMinutes");

  if (body.reporter !== undefined) {
    assertNonEmptyString(body, "reporter");
  }

  next();
}
