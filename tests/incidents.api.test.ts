import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import { app } from "../src/app";

/**
 * Pruebas de integración de IncidentHub API.
 *
 * Levantan la app en un puerto libre y ejecutan peticiones HTTP reales.
 * Las pruebas 01-20 corresponden a la tabla "Pruebas mínimas obligatorias" del proyecto.
 * Las pruebas dependen del orden (comparten el estado en memoria), por eso se ejecutan en secuencia.
 *
 * Ejecutar con: npm test
 */

const INSTRUCTOR = "Bearer instructor-token";
const TECHNICIAN = "Bearer technician-token";

let server: Server;
let base: string;

interface Result {
  status: number;
  body: any;
}

async function call(
  method: string,
  path: string,
  options: { auth?: string; body?: unknown; rawBody?: string } = {}
): Promise<Result> {
  const headers: Record<string, string> = {};
  if (options.auth) headers.Authorization = options.auth;

  let payload: string | undefined;
  if (options.rawBody !== undefined) {
    payload = options.rawBody;
    headers["Content-Type"] = "application/json";
  } else if (options.body !== undefined) {
    payload = JSON.stringify(options.body);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(base + path, { method, headers, body: payload });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

const validIncident = {
  title: "Pantalla con parpadeos",
  description: "El monitor presenta parpadeos constantes.",
  reporter: "Miguel Torres",
  location: "Oficina 407",
  priority: "MEDIUM",
  estimatedMinutes: 35,
};

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  base = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve()))
  );
});

describe("IncidentHub API - pruebas mínimas obligatorias", () => {
  it("01 GET /api/incidents devuelve 200 con todos los incidentes", async () => {
    const res = await call("GET", "/api/incidents");
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.total, 5);
    assert.equal(res.body.data.length, 5);
  });

  it("02 GET /api/incidents/1 devuelve 200 para un incidente existente", async () => {
    const res = await call("GET", "/api/incidents/1");
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 1);
  });

  it("03 GET /api/incidents/999 devuelve 404 para un incidente inexistente", async () => {
    const res = await call("GET", "/api/incidents/999");
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { ok: false, message: "Incident not found" });
  });

  it("04 GET /api/incidents/abc devuelve 400 por id inválido", async () => {
    const res = await call("GET", "/api/incidents/abc");
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { ok: false, message: "Invalid incident id" });
  });

  it("05 POST /api/incidents con datos válidos devuelve 201 y genera id, status y createdAt", async () => {
    const res = await call("POST", "/api/incidents", {
      auth: TECHNICIAN,
      body: { ...validIncident, title: "Router sin conectividad", priority: "HIGH", estimatedMinutes: 40 },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.id, 6);
    assert.equal(res.body.data.status, "OPEN");
    assert.ok(!Number.isNaN(Date.parse(res.body.data.createdAt)));
  });

  it("06 POST sin título devuelve 400", async () => {
    const { title: _omit, ...withoutTitle } = validIncident;
    const res = await call("POST", "/api/incidents", { auth: TECHNICIAN, body: withoutTitle });
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
  });

  it("07 POST con prioridad inválida (SUPER_IMPORTANT) devuelve 400", async () => {
    const res = await call("POST", "/api/incidents", {
      auth: TECHNICIAN,
      body: { ...validIncident, priority: "SUPER_IMPORTANT" },
    });
    assert.equal(res.status, 400);
  });

  it("08 POST con estimatedMinutes negativo devuelve 400", async () => {
    const res = await call("POST", "/api/incidents", {
      auth: TECHNICIAN,
      body: { ...validIncident, estimatedMinutes: -5 },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, "estimatedMinutes must be greater than 0");
  });

  it("09 POST CRITICAL con 180 minutos devuelve 400 (Reto 4)", async () => {
    const res = await call("POST", "/api/incidents", {
      auth: TECHNICIAN,
      body: { ...validIncident, priority: "CRITICAL", estimatedMinutes: 180 },
    });
    assert.equal(res.status, 400);
  });

  it("10 PUT /api/incidents/1 con datos válidos devuelve 200", async () => {
    const res = await call("PUT", "/api/incidents/1", {
      auth: TECHNICIAN,
      body: {
        title: "Pantalla sin imagen",
        description: "El monitor dejó completamente de mostrar imagen.",
        location: "Oficina 407",
        priority: "HIGH",
        estimatedMinutes: 60,
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.title, "Pantalla sin imagen");
    assert.equal(res.body.data.id, 1, "El id no debe cambiar");
    assert.equal(res.body.data.reporter, "Carlos Díaz", "Sin reporter en el body se conserva el original");
  });

  it("11 PUT /api/incidents/999 devuelve 404", async () => {
    const res = await call("PUT", "/api/incidents/999", {
      auth: TECHNICIAN,
      body: {
        title: "Inexistente",
        description: "No existe",
        location: "Ninguna",
        priority: "LOW",
        estimatedMinutes: 10,
      },
    });
    assert.equal(res.status, 404);
  });

  it("12 PATCH /api/incidents/1/status OPEN → IN_PROGRESS devuelve 200", async () => {
    const res = await call("PATCH", "/api/incidents/1/status", {
      auth: TECHNICIAN,
      body: { status: "IN_PROGRESS" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, "IN_PROGRESS");
  });

  it("13 PATCH /api/incidents/3/status IN_PROGRESS → RESOLVED devuelve 200", async () => {
    const res = await call("PATCH", "/api/incidents/3/status", {
      auth: TECHNICIAN,
      body: { status: "RESOLVED" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, "RESOLVED");
  });

  it("14 PATCH RESOLVED → OPEN devuelve 400 (Reto 5)", async () => {
    const res = await call("PATCH", "/api/incidents/5/status", {
      auth: TECHNICIAN,
      body: { status: "OPEN" },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, "Invalid status transition: RESOLVED -> OPEN");
  });

  it("15 DELETE sin token devuelve 401", async () => {
    const res = await call("DELETE", "/api/incidents/4");
    assert.equal(res.status, 401);
    assert.equal(res.body.ok, false);
  });

  it("16 DELETE con technician-token devuelve 403", async () => {
    const res = await call("DELETE", "/api/incidents/4", { auth: TECHNICIAN });
    assert.equal(res.status, 403);
  });

  it("17 DELETE con instructor-token devuelve 204", async () => {
    const res = await call("DELETE", "/api/incidents/3", { auth: INSTRUCTOR });
    assert.equal(res.status, 204);
  });

  it("18 GET /api/planets (ruta inexistente) devuelve 404", async () => {
    const res = await call("GET", "/api/planets");
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { ok: false, message: "Route not found" });
  });

  it("19 GET /api/incidents/critical devuelve 200 solo con incidentes CRITICAL", async () => {
    const res = await call("GET", "/api/incidents/critical");
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((i: any) => i.priority === "CRITICAL"));
    assert.equal(res.body.total, res.body.data.length);
  });

  it("20 GET /api/incidents/stats devuelve 200 con métricas calculadas", async () => {
    const res = await call("GET", "/api/incidents/stats");
    assert.equal(res.status, 200);
    const { total, open, inProgress, resolved, critical, averageEstimatedMinutes } = res.body.data;
    assert.equal(total, open + inProgress + resolved);
    assert.equal(typeof critical, "number");
    assert.equal(typeof averageEstimatedMinutes, "number");
  });
});

describe("IncidentHub API - pruebas adicionales", () => {
  it("A1 Logger y RequestInfo no alteran la respuesta de GET (solo enriquecen la petición)", async () => {
    const res = await call("GET", "/api/incidents/2");
    assert.equal(res.status, 200);
    assert.equal(res.body.data.priority, "CRITICAL");
  });

  it("A2 El cliente no puede enviar id ni status al crear: el servidor los genera", async () => {
    const res = await call("POST", "/api/incidents", {
      auth: TECHNICIAN,
      body: { ...validIncident, id: 999, status: "RESOLVED", createdAt: "2000-01-01T00:00:00.000Z" },
    });
    assert.equal(res.status, 201);
    assert.notEqual(res.body.data.id, 999);
    assert.equal(res.body.data.status, "OPEN");
    assert.notEqual(res.body.data.createdAt, "2000-01-01T00:00:00.000Z");
  });

  it("A3 Id con decimal, negativo o cero devuelve 400", async () => {
    for (const bad of ["4.5", "-3", "0"]) {
      const res = await call("GET", `/api/incidents/${bad}`);
      assert.equal(res.status, 400, `id ${bad} debería ser inválido`);
    }
  });

  it("A4 PATCH con estado desconocido (DONE) devuelve 400", async () => {
    const res = await call("PATCH", "/api/incidents/1/status", {
      auth: TECHNICIAN,
      body: { status: "DONE" },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
  });

  it("A5 PATCH sin token devuelve 401", async () => {
    const res = await call("PATCH", "/api/incidents/1/status", { body: { status: "RESOLVED" } });
    assert.equal(res.status, 401);
  });

  it("A6 Token inválido devuelve 401", async () => {
    const res = await call("DELETE", "/api/incidents/4", { auth: "Bearer token-falso" });
    assert.equal(res.status, 401);
  });

  it("A7 PUT CRITICAL con más de 60 minutos devuelve 400 (Reto 4 aplicada también a PUT)", async () => {
    const res = await call("PUT", "/api/incidents/2", {
      auth: TECHNICIAN,
      body: {
        title: "Computador que no enciende",
        description: "Sigue sin encender.",
        location: "Laboratorio 304",
        priority: "CRITICAL",
        estimatedMinutes: 90,
      },
    });
    assert.equal(res.status, 400);
  });

  it("A8 Body JSON mal formado devuelve 400 Malformed JSON body", async () => {
    const res = await call("POST", "/api/incidents", {
      auth: TECHNICIAN,
      rawBody: "{ esto no es json",
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, "Malformed JSON body");
  });

  it("A9 GET /pending no incluye incidentes RESOLVED (Reto 2)", async () => {
    const res = await call("GET", "/api/incidents/pending");
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((i: any) => i.status !== "RESOLVED"));
  });

  it("A10 DELETE con id inválido y token de admin devuelve 400", async () => {
    const res = await call("DELETE", "/api/incidents/abc", { auth: INSTRUCTOR });
    assert.equal(res.status, 400);
  });
});
