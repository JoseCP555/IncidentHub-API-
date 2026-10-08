import type { Request, Response } from "express";
import type { CreateIncidentDto, UpdateIncidentDto, UpdateIncidentStatusDto } from "../dtos/incident.dto";
import { incidentService } from "../services/incident.service";

/**
 * CONTROLLER: traduce la petición HTTP en una llamada al service y
 * la respuesta del service en una respuesta HTTP.
 *
 * Reglas de este archivo:
 *  - No contiene validaciones (están en los middlewares).
 *  - No contiene reglas de negocio (están en el service).
 *  - No maneja errores: si algo falla, el service lanza AppError y el
 *    Error Middleware construye la respuesta.
 *
 * El id llega ya validado en res.locals.incidentId (validateId) y el body
 * llega ya validado por validateIncident / validatePriority / validateTime / validateStatus.
 */

export function getAllIncidents(_req: Request, res: Response): void {
  const data = incidentService.findAll();
  res.status(200).json({ ok: true, total: data.length, data });
}

export function getIncidentById(_req: Request, res: Response): void {
  const data = incidentService.findById(res.locals.incidentId as number);
  res.status(200).json({ ok: true, data });
}

export function createIncident(req: Request, res: Response): void {
  const data = incidentService.create(req.body as CreateIncidentDto);
  res.status(201).json({ ok: true, data });
}

export function updateIncident(req: Request, res: Response): void {
  const data = incidentService.update(res.locals.incidentId as number, req.body as UpdateIncidentDto);
  res.status(200).json({ ok: true, data });
}

export function updateIncidentStatus(req: Request, res: Response): void {
  const { status } = req.body as UpdateIncidentStatusDto;
  const data = incidentService.updateStatus(res.locals.incidentId as number, status);
  res.status(200).json({ ok: true, data });
}

export function deleteIncident(_req: Request, res: Response): void {
  incidentService.remove(res.locals.incidentId as number);
  res.status(204).end();
}

export function getCriticalIncidents(_req: Request, res: Response): void {
  const data = incidentService.findCritical();
  res.status(200).json({ ok: true, total: data.length, data });
}

export function getPendingIncidents(_req: Request, res: Response): void {
  const data = incidentService.findPending();
  res.status(200).json({ ok: true, total: data.length, data });
}

export function getIncidentStats(_req: Request, res: Response): void {
  const data = incidentService.getStats();
  res.status(200).json({ ok: true, data });
}
