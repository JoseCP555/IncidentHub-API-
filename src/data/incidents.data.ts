import type { Incident } from "../models/incident.model";

/**
 * DATA: capa de almacenamiento temporal.
 *
 * En esta versión no hay base de datos: los incidentes viven en un arreglo en memoria.
 * Al reiniciar el servidor se restauran los datos iniciales definidos aquí.
 * Esta capa solo guarda y entrega datos; no contiene reglas de negocio.
 */
export const incidents: Incident[] = [
  {
    id: 1,
    title: "Proyector sin señal",
    description: "El proyector no reconoce ningún computador conectado.",
    reporter: "Carlos Díaz",
    location: "Aula 201",
    priority: "MEDIUM",
    status: "OPEN",
    estimatedMinutes: 30,
    createdAt: "2026-10-05T08:15:00.000Z",
  },
  {
    id: 2,
    title: "Computador que no enciende",
    description: "El equipo del puesto 4 no responde al botón de encendido ni muestra señal en la pantalla.",
    reporter: "Laura Gómez",
    location: "Laboratorio 304",
    priority: "CRITICAL",
    status: "OPEN",
    estimatedMinutes: 45,
    createdAt: "2026-10-05T09:02:00.000Z",
  },
  {
    id: 3,
    title: "Impresora sin conexión en red",
    description: "La impresora multifuncional del piso 3 no aparece en la red y no imprime desde los equipos del área.",
    reporter: "Mauricio Ortiz",
    location: "Contabilidad - Piso 3",
    priority: "LOW",
    status: "IN_PROGRESS",
    estimatedMinutes: 90,
    createdAt: "2026-10-06T10:40:00.000Z",
  },
  {
    id: 4,
    title: "Falla de conectividad en sala de juntas",
    description: "La conexión a Internet se cae cada pocos minutos en la sala de juntas 2 durante las reuniones.",
    reporter: "Andrea Castro",
    location: "Sala de juntas 2",
    priority: "HIGH",
    status: "OPEN",
    estimatedMinutes: 60,
    createdAt: "2026-10-06T14:20:00.000Z",
  },
  {
    id: 5,
    title: "Aplicación de facturación se cierra al iniciar",
    description: "El software de facturación se cierra de forma inesperada justo después de iniciar sesión.",
    reporter: "Sofía Martínez",
    location: "Área de facturación",
    priority: "CRITICAL",
    status: "RESOLVED",
    estimatedMinutes: 60,
    createdAt: "2026-10-07T07:55:00.000Z",
  },
];

/** Último id asignado. Se avanza siempre hacia adelante: un id eliminado nunca se reutiliza. */
let lastId = Math.max(...incidents.map((incident) => incident.id));

/** Devuelve el siguiente id disponible para un nuevo incidente. */
export function nextIncidentId(): number {
  lastId += 1;
  return lastId;
}
