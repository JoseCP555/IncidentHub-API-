/**
 * Error controlado de la aplicación.
 *
 * Los controllers, services y middlewares lanzan AppError con el código HTTP
 * adecuado. El Error Middleware lo convierte en una respuesta JSON uniforme,
 * de modo que nadie tiene que escribir res.status(...).json(...) para cada error.
 *
 *   throw new AppError(404, "Incident not found");
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
