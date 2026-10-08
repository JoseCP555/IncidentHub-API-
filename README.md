# IncidentHub API

API REST para registrar, consultar, atender y eliminar incidentes tecnológicos de una organización.

> Proyecto evaluable — Capítulo V · Versión 1 · Persistencia en memoria

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)

---

## Problema que resuelve

En la organización, los incidentes tecnológicos (computadores que no encienden, fallas de red, impresoras, aplicaciones que se cierran) se reportaban por llamadas, mensajes y conversaciones informales. Eso dificultaba llevar control, priorizar y hacer seguimiento.

IncidentHub API centraliza esos reportes en una API con:

- Registro con prioridad y tiempo estimado de atención.
- Ciclo de vida del incidente: `OPEN → IN_PROGRESS → RESOLVED`.
- Bandejas de incidentes críticos y pendientes.
- Métricas operacionales calculadas automáticamente.
- Autenticación por token y permisos de administrador para eliminar.

## Tecnologías

- **Node.js** (≥ 20) como entorno de ejecución.
- **Express 5** como framework HTTP.
- **TypeScript** con `strict` activado.
- **Persistencia en memoria** mediante un arreglo de TypeScript (sin base de datos en esta versión).

## Instalación

```bash
git clone <URL-del-repositorio>
cd incidenthub-api
npm install
```

## Ejecución

```bash
npm run dev       # desarrollo, recarga automática con tsx
```

El servidor queda disponible en `http://localhost:3000/api/incidents`. Para usar otro puerto:

```bash
PORT=4000 npm run dev
```

Otros scripts:

| Comando | Descripción |
|---------|-------------|
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run typecheck` | Verifica tipos sin generar archivos |
| `npm test` | Ejecuta las pruebas de integración |

## Autenticación

Las operaciones que modifican datos requieren un encabezado:

```
Authorization: Bearer <token>
```

| Token | Rol | Permisos |
|-------|-----|----------|
| `technician-token` | Técnico | GET, POST, PUT, PATCH |
| `instructor-token` | Administrador | Todo lo anterior + DELETE |

Sin token o con un token inexistente responde **401**. Un técnico que intenta eliminar responde **403**.

> Esta versión usa tokens fijos de demostración. No implementa JWT, como indica el enunciado.

## Documentación de endpoints

Todas las respuestas tienen la forma `{ "ok": true, ... }` o `{ "ok": false, "message": "..." }`, salvo el 204 de DELETE, que no tiene cuerpo.

| Método | Ruta | Auth | Propósito | Respuesta |
|--------|------|------|-----------|-----------|
| GET | `/api/incidents` | No | Listar todos los incidentes | 200 |
| GET | `/api/incidents/:id` | No | Consultar un incidente | 200 / 400 / 404 |
| POST | `/api/incidents` | Técnico o admin | Registrar un incidente | 201 / 400 / 401 |
| PUT | `/api/incidents/:id` | Técnico o admin | Actualizar un incidente | 200 / 400 / 401 / 404 |
| PATCH | `/api/incidents/:id/status` | Técnico o admin | Cambiar el estado | 200 / 400 / 401 / 404 |
| DELETE | `/api/incidents/:id` | **Solo admin** | Eliminar un incidente | 204 / 401 / 403 / 404 |
| GET | `/api/incidents/critical` | No | Bandeja de incidentes CRITICAL (Reto 1) | 200 |
| GET | `/api/incidents/pending` | No | Incidentes OPEN o IN_PROGRESS (Reto 2) | 200 |
| GET | `/api/incidents/stats` | No | Métricas operacionales (Reto 3) | 200 |

### Modelo de un incidente

```json
{
  "id": 6,
  "title": "Router sin conectividad",
  "description": "El router del segundo piso perdió conexión.",
  "reporter": "Ana Torres",
  "location": "Piso 2",
  "priority": "HIGH",
  "status": "OPEN",
  "estimatedMinutes": 40,
  "createdAt": "2026-10-08T14:30:00.000Z"
}
```

- `priority`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `status`: `OPEN`, `IN_PROGRESS`, `RESOLVED`.
- `estimatedMinutes`: entero mayor que 0 y no mayor que 480. Un incidente `CRITICAL` no puede superar 60.

### Ejemplos

**Registrar un incidente (201)**

```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{
    "title": "Router sin conectividad",
    "description": "El router del segundo piso perdió conexión.",
    "reporter": "Ana Torres",
    "location": "Piso 2",
    "priority": "HIGH",
    "estimatedMinutes": 40
  }'
```

**Cambiar el estado (200)**

```bash
curl -X PATCH http://localhost:3000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer technician-token" \
  -d '{ "status": "IN_PROGRESS" }'
```

**Eliminar un incidente (204, solo admin)**

```bash
curl -X DELETE http://localhost:3000/api/incidents/3 \
  -H "Authorization: Bearer instructor-token"
```

Más ejemplos con respuestas reales en [`evidencias/ejemplos-curl.md`](evidencias/ejemplos-curl.md).

### Reglas de negocio

| Regla | Dónde se aplica |
|-------|-----------------|
| `id` no puede modificarse | `incident.service.ts` (se conserva al hacer PUT) |
| El cliente no envía `id`, `status` ni `createdAt` | DTO `CreateIncidentDto` + service |
| Reto 4: CRITICAL ≤ 60 minutos | `validate-time.middleware.ts` |
| Reto 5: transiciones permitidas | `incident.service.ts` (`ALLOWED_TRANSITIONS`) |

Transiciones permitidas:

```
OPEN → IN_PROGRESS → RESOLVED
OPEN → RESOLVED
```

No se permite regresar desde `RESOLVED`, ni pasar de `IN_PROGRESS` a `OPEN`.

### Métricas (`GET /api/incidents/stats`)

```json
{
  "ok": true,
  "data": {
    "total": 5,
    "open": 3,
    "inProgress": 1,
    "resolved": 1,
    "critical": 2,
    "averageEstimatedMinutes": 57
  }
}
```

Todas las métricas se calculan en cada petición a partir del arreglo actual.

## Middlewares

### Cadena global

| Orden | Middleware | Función |
|-------|-----------|---------|
| 1 | `logger` | Registra cada petición con su fecha ISO, método y URL. |
| 2 | `requestInfo` | Añade `req.requestInfo` (timestamp, método y ruta) para que los componentes siguientes lo usen. |
| 3 | `express.json()` | Interpreta el cuerpo JSON. Si está mal formado, lo pasa al Error Middleware. |
| 4 | Router | Selecciona la ruta. |
| — | `notFound` | Si ninguna ruta respondió, responde 404 `Route not found`. |
| — | `errorHandler` | Convierte cualquier error en una respuesta JSON uniforme. |

### Por ruta

| Middleware | Qué verifica | Error |
|-----------|--------------|-------|
| `authenticate` | Que exista `Authorization: Bearer <token>` válido. Guarda el usuario en `req.user`. | 401 |
| `requireAdmin` | Que `req.user.role` sea `admin`. | 403 |
| `validateId` | Que `:id` sea un entero positivo (rechaza `abc`, `-3`, `0`, `4.5`). Guarda el número en `res.locals`. | 400 |
| `validateIncident` | Que `title`, `description`, `reporter`, `location`, `priority` y `estimatedMinutes` existan y que los textos no estén vacíos. | 400 |
| `validateIncidentUpdate` | Lo mismo para PUT, pero `reporter` es opcional. | 400 |
| `validatePriority` | Que `priority` sea LOW, MEDIUM, HIGH o CRITICAL. | 400 |
| `validateTime` | Que `estimatedMinutes` sea numérico, mayor que 0, menor o igual a 480, y que CRITICAL no supere 60 (Reto 4). | 400 |
| `validateStatus` | Que el `status` del PATCH sea OPEN, IN_PROGRESS o RESOLVED. | 400 |
| `errorHandler` | Último en la cadena. Traduce `AppError`, errores de JSON y errores inesperados. | 400 / 404 / 500 |

**Decisión técnica del Reto 4.** La regla "CRITICAL no puede superar 60 minutos" vive en `validateTime` y no en el controller. Es una regla sobre el dato de entrada, no sobre el estado de la base de datos, así que pertenece a la etapa de validación. Además, se aplica a POST y PUT sin duplicar código, y se ejecuta después de `validatePriority`, por lo que la prioridad ya es válida. Si el controller la verificara, la petición llegaría a la capa de negocio antes de rechazarse, y habría que repetir la comprobación en cada ruta que escriba incidentes.

## Arquitectura

```
incidenthub-api/
├── src/
│   ├── controllers/   Traduce HTTP ⇄ service. Sin validaciones ni reglas de negocio.
│   ├── config/        Reglas configurables (límites de minutos).
│   ├── data/          Almacenamiento temporal en memoria.
│   ├── dtos/          Contratos de entrada de cada operación.
│   ├── errors/        AppError: error controlado con código HTTP.
│   ├── middlewares/   Logger, autenticación, autorización, validaciones y manejo de errores.
│   ├── models/        Forma interna del incidente y sus enumeraciones.
│   ├── routes/        Asocia cada endpoint con sus middlewares y su controller.
│   ├── services/      Lógica de negocio: transiciones, filtros y métricas.
│   ├── types/         Extensiones de tipos de Express (req.user, req.requestInfo).
│   ├── utils/         Funciones auxiliares de validación.
│   ├── app.ts         Configura Express y registra la cadena de middlewares.
│   └── server.ts      Único punto que abre un puerto.
├── tests/             Pruebas de integración.
├── evidencias/        Resultados de pruebas y ejemplos de cURL.
├── package.json
├── tsconfig.json
└── README.md
```

### Flujo de una petición

```
CLIENTE
  │ POST /api/incidents
  ↓
LOGGER → REQUEST INFO → AUTH → VALIDATE INCIDENT → VALIDATE PRIORITY → VALIDATE TIME
  ↓
CONTROLLER → SERVICE → DATA
  ↓
201 CREATED

En caso de error (desde cualquier paso):
  AppError → ERROR MIDDLEWARE → { "ok": false, "message": "..." }
```

### Separación de responsabilidades

| Capa | Responsabilidad | No debe hacer |
|------|-----------------|---------------|
| **Model** | Describe el incidente dentro de la aplicación | Validar entradas |
| **DTO** | Describe qué puede enviar el cliente en cada operación | Guardar datos |
| **Data** | Guardar y entregar datos | Tomar decisiones de negocio |
| **Service** | Reglas de negocio, transiciones, métricas | Conocer `req` o `res` |
| **Controller** | Llamar al service y responder | Validar o manejar errores manualmente |
| **Routes** | Declarar la cadena de middlewares de cada endpoint | Contener lógica |
| **Middleware** | Validar, autenticar, autorizar, registrar y enriquecer | Modificar la lógica de negocio |
| **Errors** | Representar errores controlados | Decidir el formato de la respuesta |
| **Application / Server** | Configurar Express / abrir el puerto | Contener lógica de dominio |

## Model vs DTO

Con mis propias palabras: el **Model** es el incidente tal como vive dentro del servidor. Tiene todos los datos, incluidos los que el servidor genera, como el `id`, el `status` inicial y la fecha de creación. El **DTO** es un contrato para una operación concreta: define exactamente qué puede enviar el cliente. Por ejemplo, al registrar un incidente el cliente solo envía el título, la descripción, el reportero, la ubicación, la prioridad y los minutos estimados.

Separarlos tiene dos beneficios. Primero, el cliente nunca puede fijar el `id`, el `status` o la fecha de creación, aunque los incluya en su petición: el service construye el Model con sus propios valores. Segundo, el modelo interno puede cambiar (por ejemplo, agregar un campo `assignedTechnician`) sin romper el contrato de entrada de quienes consumen la API.

## Reflexión: ventajas de middlewares frente a lógica dentro de cada controller

Si cada controller tuviera que comprobar el token, validar el id, revisar la prioridad y formatear cada error, el mismo código estaría repetido en nueve rutas. Cualquier cambio, como agregar un nuevo rol o un nuevo límite de minutos, obligaría a tocar todos los controllers y es fácil olvidar uno. Con middlewares, cada regla se escribe una sola vez y se declara en la ruta donde aplica. Esto hace que el orden de la seguridad sea visible: se ve de un vistazo que `DELETE` pasa por autenticación y administrador antes de tocar los datos.

También mejora la forma en que se lee el código. El controller queda pequeño y solo expresa la intención del endpoint, mientras que las reglas de validación y seguridad quedan agrupadas en archivos pequeños y con nombre propio. Un error de validación siempre tiene la misma forma de respuesta porque todos pasan por el mismo Error Middleware, lo que facilita el trabajo de quien consume la API. Por último, un middleware se puede probar en aislamiento o reutilizar en otro proyecto, algo que no ocurre con código copiado dentro de cada controller.

## Pruebas

```bash
npm test
```

Se ejecutan 30 pruebas de integración contra la app Express real: las 20 pruebas mínimas obligatorias y 10 adicionales. Resultados en [`evidencias/resultados-pruebas.md`](evidencias/resultados-pruebas.md).

## Limitaciones de esta versión

- Los datos se pierden al reiniciar el servidor.
- La autenticación usa tokens fijos de demostración, no JWT ni usuarios reales.
- No hay paginación en los listados.
- Las pruebas dependen del orden de ejecución porque comparten el estado en memoria.

## Evidencias y entrega

- Carpeta de evidencias: [`evidencias/`](evidencias/README.md).
- Historial de commits: siguiendo la convención de Conventional Commits, con un commit por etapa del proyecto.
- Repositorio: `<URL-del-repositorio>` *(reemplazar por el enlace de GitHub)*.

## Licencia

MIT
