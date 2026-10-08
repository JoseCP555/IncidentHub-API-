import type { AuthUser } from "../middlewares/auth.middleware";
import type { RequestInfo } from "../middlewares/request-info.middleware";

/**
 * Extiende el objeto Request de Express con los datos que añaden los middlewares.
 * Así cualquier middleware o controller puede leer req.user o req.requestInfo con tipado seguro.
 */
declare global {
  namespace Express {
    interface Request {
      /** Añadido por requestInfo.middleware */
      requestInfo?: RequestInfo;
      /** Añadido por auth.middleware */
      user?: AuthUser;
    }
  }
}

export {};
