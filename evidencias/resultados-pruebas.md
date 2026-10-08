# Resultados de las pruebas — IncidentHub API v1

Pruebas automatizadas ejecutadas con `npm test` (Node.js test runner + `fetch` contra la app Express real).
Salida completa: [`salida-pruebas.txt`](./salida-pruebas.txt).

**Resumen de la última ejecución:** 30 pruebas · 30 aprobadas · 0 fallidas.

## Pruebas mínimas obligatorias (sección 14 del proyecto)

| # | Prueba | Resultado esperado | Obtenido | Estado |
|---|--------|--------------------|----------|--------|
| 1 | GET todos los incidentes | 200 | 200 | ✅ |
| 2 | GET incidente existente | 200 | 200 | ✅ |
| 3 | GET incidente inexistente | 404 | 404 | ✅ |
| 4 | GET con ID `abc` | 400 | 400 | ✅ |
| 5 | POST válido | 201 | 201 | ✅ |
| 6 | POST sin título | 400 | 400 | ✅ |
| 7 | POST prioridad inválida | 400 | 400 | ✅ |
| 8 | POST `estimatedMinutes` negativo | 400 | 400 | ✅ |
| 9 | POST CRITICAL > 60 min | 400 | 400 | ✅ |
| 10 | PUT existente | 200 | 200 | ✅ |
| 11 | PUT inexistente | 404 | 404 | ✅ |
| 12 | PATCH OPEN → IN_PROGRESS | 200 | 200 | ✅ |
| 13 | PATCH IN_PROGRESS → RESOLVED | 200 | 200 | ✅ |
| 14 | PATCH RESOLVED → OPEN | 400 | 400 | ✅ |
| 15 | DELETE sin token | 401 | 401 | ✅ |
| 16 | DELETE con technician-token | 403 | 403 | ✅ |
| 17 | DELETE con instructor-token | 204 | 204 | ✅ |
| 18 | Ruta inexistente | 404 | 404 | ✅ |
| 19 | GET /critical | 200 | 200 | ✅ |
| 20 | GET /stats | 200 | 200 | ✅ |

## Pruebas adicionales

| # | Prueba | Justificación | Estado |
|---|--------|---------------|--------|
| A1 | GET de un CRITICAL no altera la respuesta (Logger y RequestInfo no interfieren) | Verifica que los middlewares globales dejan pasar la petición | ✅ |
| A2 | POST con `id`, `status` y `createdAt` enviados por el cliente | El DTO ignora campos que el servidor controla | ✅ |
| A3 | IDs `4.5`, `-3` y `0` | validateId rechaza enteros no positivos | ✅ |
| A4 | PATCH con estado `DONE` | validateStatus solo permite OPEN, IN_PROGRESS, RESOLVED | ✅ |
| A5 | PATCH sin token | Autenticación en operaciones protegidas | ✅ |
| A6 | Token inexistente (`Bearer token-falso`) | Autenticación rechaza tokens desconocidos | ✅ |
| A7 | PUT CRITICAL con 90 min | Reto 4 también aplica en PUT | ✅ |
| A8 | JSON mal formado | Error Middleware traduce el error de parseo a 400 | ✅ |
| A9 | GET /pending sin RESOLVED | Reto 2 | ✅ |
| A10 | DELETE con id inválido y token admin | El orden de middlewares: el id se valida tras la autorización | ✅ |

## Ejemplos reales con cURL

Ver [`ejemplos-curl.md`](./ejemplos-curl.md) para las peticiones y respuestas completas, con cabeceras HTTP.

## Nota sobre el orden

Las pruebas comparten el estado en memoria, así que se ejecutan en secuencia y el orden importa. Por ejemplo, la prueba 17 elimina el incidente 3 que usa la prueba 13.
