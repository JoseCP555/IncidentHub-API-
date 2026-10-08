import { app } from "./app";

/**
 * SERVER: único punto donde la aplicación se conecta a un puerto de red.
 */
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`IncidentHub API escuchando en http://localhost:${PORT}/api/incidents`);
});
