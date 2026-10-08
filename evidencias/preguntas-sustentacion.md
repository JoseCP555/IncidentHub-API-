# Preguntas de sustentación — IncidentHub API

Respuestas de referencia a los 10 puntos de la sección 19 del proyecto. Cada respuesta indica dónde está el código relacionado.

**1. Diferencia entre un DTO y un Model.**
El Model (`src/models/incident.model.ts`) describe cómo existe el incidente dentro de la aplicación: incluye `id`, `status` y `createdAt`, que el servidor controla. El DTO (`src/dtos/incident.dto.ts`) describe lo que el cliente *puede enviar* en una operación concreta: `CreateIncidentDto` no tiene `id`, `status` ni `createdAt`. Así el cliente no puede falsificar datos del servidor, y cada operación tiene su propio contrato de entrada. El service convierte el DTO en Model.

**2. ¿Qué hace `next()`?**
Le indica a Express que el middleware actual terminó y que debe ejecutar el siguiente middleware de la cadena. Si no se llama a `next()` ni se envía una respuesta, la petición queda colgada. Si se llama con un argumento (`next(error)`), Express salta directamente a los middlewares de error.

**3. Modificar una regla de validación.**
Por ejemplo, cambiar el límite de 480 minutos: basta con editar `MAX_ESTIMATED_MINUTES` en `src/config/incident.rules.ts`. El cambio aplica a POST y PUT sin tocar controllers ni rutas.

**4. Crear un nuevo middleware.**
Se crea un archivo en `src/middlewares/`, se exporta una función `(req, res, next)` y se agrega a la ruta deseada en `src/routes/incident.routes.ts`. Ejemplo: un middleware que rechace peticiones sin el encabezado `X-Client` se inserta después del logger.

**5. Orden de los middlewares.**
Express los ejecuta en el orden en que se registran. Global: Logger → RequestInfo → JSON parser → Router. Por ruta: Auth → Validación de id → Validación del body → Controller. Si uno falla, los siguientes no se ejecutan. Auth va antes de la validación para no revelar detalles del body a clientes no autenticados.

**6. Ejecutar una petición incorrecta.**
Por ejemplo `curl -i -X POST .../api/incidents -H "Authorization: Bearer technician-token" -d '{"priority":"SUPER_IMPORTANT"}'`. Responde 400 con el mensaje de validación. Ver `ejemplos-curl.md`, casos 7 y 8.

**7. Cómo funciona el Error Middleware.**
Cualquier error llega a `src/middlewares/error.middleware.ts` vía `next(err)` o una excepción lanzada. Si es un `AppError`, usa su código y mensaje. Si es un error de JSON mal formado, responde 400. Si es desconocido, responde 500 con un mensaje genérico y registra el detalle en consola. Siempre responde `{ "ok": false, "message": ... }`.

**8. Diferencia entre 400, 401, 403, 404 y 500.**
- **400 Bad Request:** la petición está mal formada o sus datos no son válidos (id `abc`, prioridad inexistente).
- **401 Unauthorized:** falta la identidad. No se envió token o no es válido.
- **403 Forbidden:** la identidad es válida, pero no tiene permiso (technician-token intentando borrar).
- **404 Not Found:** el recurso o la ruta no existe.
- **500 Internal Server Error:** falla inesperada del servidor. Es un error nuestro, no del cliente.

**9. Crear un nuevo incidente desde Postman.**
Método POST, URL `http://localhost:3000/api/incidents`, pestaña *Authorization* → Bearer Token `technician-token`, pestaña *Body* → raw JSON con `title`, `description`, `reporter`, `location`, `priority` y `estimatedMinutes`. Respuesta esperada: 201 con el incidente, incluyendo el `id`, `status: "OPEN"` y `createdAt` generados por el servidor.

**10. Cómo se protege DELETE.**
La ruta `DELETE /api/incidents/:id` está declarada con tres middlewares en este orden: `authenticate` (401 si no hay token válido), `requireAdmin` (403 si el rol no es admin) y `validateId`. Solo `instructor-token` tiene rol `admin`. Ver `src/routes/incident.routes.ts`.
