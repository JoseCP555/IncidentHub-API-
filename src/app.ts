import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import { logger } from "./middlewares/logger.middleware";
import { notFound } from "./middlewares/not-found.middleware";
import { requestInfo } from "./middlewares/request-info.middleware";
import { incidentRouter } from "./routes/incident.routes";

/**
 * APPLICATION: configura Express y ensambla la cadena de middlewares.
 *
 *   REQUEST → Logger → RequestInfo → JSON parser → Router → (Auth → Validaciones → Controller)
 *           → 404 global (si ninguna ruta respondió) → Error Middleware → RESPONSE
 *
 * No escucha ningún puerto: eso corresponde a server.ts. Así la app puede probarse sin levantar el servidor.
 */
export const app = express();

app.disable("x-powered-by");

app.use(logger);
app.use(requestInfo);
app.use(express.json());

app.use("/api/incidents", incidentRouter);

app.use(notFound);
app.use(errorHandler);
