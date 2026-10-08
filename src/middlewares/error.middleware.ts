import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";

/**
 * Error Middleware: convierte CUALQUIER error en una respuesta HTTP uniforme.
 *
 *   { "ok": false, "message": "..." }
 *
 * Se declara al final de la cadena. Express lo invoca cuando un middleware
 * o controller llama a next(error) o lanza una excepción.
 *
 *  - AppError                    → su statusCode y su mensaje (controlado).
 *  - Error de JSON mal formado   → 400.
 *  - Otros errores de cliente    → su status original (4xx).
 *  - Error inesperado            → 500 y un mensaje genérico (el detalle queda en consola).
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  // Si la respuesta ya comenzó a enviarse, Express debe cerrar la conexión por sí mismo.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (isBodyParserError(err)) {
    statusCode = err.status;
    message = err.type === "entity.parse.failed" ? "Malformed JSON body" : err.message;
  } else {
    console.error("[ERROR]", err);
  }

  res.status(statusCode).json({ ok: false, message });
};

interface BodyParserError {
  status: number;
  type: string;
  message: string;
}

/** Errores que express.json() lanza cuando el cuerpo no es JSON válido o es demasiado grande. */
function isBodyParserError(err: unknown): err is BodyParserError {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    "status" in err &&
    typeof (err as BodyParserError).status === "number" &&
    (err as BodyParserError).status >= 400 &&
    (err as BodyParserError).status < 500
  );
}
