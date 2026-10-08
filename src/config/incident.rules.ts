/**
 * Reglas de negocio configurables relacionadas con el tiempo estimado.
 * Centralizarlas aquí permite modificar una regla sin tocar middlewares ni controllers.
 */

/** Ningún incidente puede estimar más de 8 horas (480 minutos). */
export const MAX_ESTIMATED_MINUTES = 480;

/** Reto 4: un incidente CRITICAL no puede estimar más de 60 minutos. */
export const MAX_CRITICAL_ESTIMATED_MINUTES = 60;
