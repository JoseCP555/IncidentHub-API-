# Ejemplos de peticiones cURL — evidencia real

Capturas tomadas del servidor en ejecución (`npm run dev`, puerto 3000). Se incluyen cabeceras HTTP para mostrar el código de estado. Los casos se ejecutaron **en el orden listado**, por lo que el estado en memoria cambia entre ellos (por ejemplo, el caso 11 elimina el incidente 3).

## 1. Consultar todos los incidentes (GET, 200)

```bash
curl -s -i http://localhost:3000/api/incidents
```

**Respuesta:**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1594
ETag: W/"63a-dH2TwMSGmQ74fbD8pOkGdXGBfOE"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"total":5,"data":[{"id":1,"title":"Proyector sin señal","description":"El proyector no reconoce ningún computador conectado.","reporter":"Carlos Díaz","location":"Aula 201","priority":"MEDIUM","status":"OPEN","estimatedMinutes":30,"createdAt":"2026-10-05T08:15:00.000Z"},{"id":2,"title":"Computador que no enciende","description":"El equipo del puesto 4 no responde al botón de encendido ni muestra señal en la pantalla.","reporter":"Laura Gómez","location":"Laboratorio 304","priority":"CRITICAL","status":"OPEN","estimatedMinutes":45,"createdAt":"2026-10-05T09:02:00.000Z"},{"id":3,"title":"Impresora sin conexión en red","description":"La impresora multifuncional del piso 3 no aparece en la red y no imprime desde los equipos del área.","reporter":"Mauricio Ortiz","location":"Contabilidad - Piso 3","priority":"LOW","status":"IN_PROGRESS","estimatedMinutes":90,"createdAt":"2026-10-06T10:40:00.000Z"},{"id":4,"title":"Falla de conectividad en sala de juntas","description":"La conexión a Internet se cae cada pocos minutos en la sala de juntas 2 durante las reuniones.","reporter":"Andrea Castro","location":"Sala de juntas 2","priority":"HIGH","status":"OPEN","estimatedMinutes":60,"createdAt":"2026-10-06T14:20:00.000Z"},{"id":5,"title":"Aplicación de facturación se cierra al iniciar","description":"El software de facturación se cierra de forma inesperada justo después de iniciar sesión.","reporter":"Sofía Martínez","location":"Área de facturación","priority":"CRITICAL","status":"RESOLVED","estimatedMinutes":60,"createdAt":"2026-10-07T07:55:00.000Z"}]}
```

## 2. Consultar incidente existente (GET /:id, 200)

```bash
curl -s -i http://localhost:3000/api/incidents/2
```

**Respuesta:**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 326
ETag: W/"146-gk5aq0KWNbHw9ZuiruiVR43Pf9w"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"data":{"id":2,"title":"Computador que no enciende","description":"El equipo del puesto 4 no responde al botón de encendido ni muestra señal en la pantalla.","reporter":"Laura Gómez","location":"Laboratorio 304","priority":"CRITICAL","status":"OPEN","estimatedMinutes":45,"createdAt":"2026-10-05T09:02:00.000Z"}}
```

## 3. Consultar incidente inexistente (404)

```bash
curl -s -i http://localhost:3000/api/incidents/999
```

**Respuesta:**

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
Content-Length: 43
ETag: W/"2b-yrQtPQxPzwkNZh4+90i3VvXaCHA"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Incident not found"}
```

## 4. ID inválido (400)

```bash
curl -s -i http://localhost:3000/api/incidents/abc
```

**Respuesta:**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Content-Length: 44
ETag: W/"2c-+r/9RSq71moUxRaYOQhYd7Rg0uQ"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Invalid incident id"}
```

## 5. Registrar incidente con technician-token (201)

```bash
curl -s -i -X POST http://localhost:3000/api/incidents -H 'Content-Type: application/json' -H 'Authorization: Bearer technician-token' -d '{...}'
```

**Respuesta:**

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 262
ETag: W/"106-XbvHXs7obnuCUTB4frDf3YD89EY"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"data":{"id":6,"title":"Router sin conectividad","description":"El router del segundo piso perdió conexión.","reporter":"Ana Torres","location":"Piso 2","priority":"HIGH","status":"OPEN","estimatedMinutes":40,"createdAt":"2026-10-08T21:23:13.059Z"}}
```

## 6. Registrar sin token (401)

```bash
curl -s -i -X POST http://localhost:3000/api/incidents -H 'Content-Type: application/json' -d '{...}'
```

**Respuesta:**

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
Content-Length: 71
ETag: W/"47-kI2/p2Su4Y/SW7LVkjueyUgIW/s"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Unauthorized: a valid Bearer token is required"}
```

## 7. Prioridad inválida SUPER_IMPORTANT (400)

```bash
curl -s -i -X POST http://localhost:3000/api/incidents ... (priority: SUPER_IMPORTANT)
```

**Respuesta:**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Content-Length: 86
ETag: W/"56-IQe9TY+3k7RRdwALrU5cRHluc3c"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Invalid priority. Allowed values: LOW, MEDIUM, HIGH, CRITICAL"}
```

## 8. CRITICAL con 180 minutos (Reto 4, 400)

```bash
curl -s -i -X POST http://localhost:3000/api/incidents ... (priority: CRITICAL, estimatedMinutes: 180)
```

**Respuesta:**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Content-Length: 78
ETag: W/"4e-UU4ameQ+U2W0RQgLRYIxHgEkHII"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"CRITICAL incidents cannot exceed 60 estimated minutes"}
```

## 9. Transición no permitida RESOLVED → OPEN (Reto 5, 400)

```bash
curl -s -i -X PATCH http://localhost:3000/api/incidents/5/status ... -d '{"status":"OPEN"}'
```

**Respuesta:**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Content-Length: 68
ETag: W/"44-sNf5wC3xRay8+Qk0K7v2162DSZo"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Invalid status transition: RESOLVED -> OPEN"}
```

## 10. Eliminar sin token (401)

```bash
curl -s -i -X DELETE http://localhost:3000/api/incidents/4
```

**Respuesta:**

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
Content-Length: 71
ETag: W/"47-kI2/p2Su4Y/SW7LVkjueyUgIW/s"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Unauthorized: a valid Bearer token is required"}
```

## 11. Eliminar con technician-token (403)

```bash
curl -s -i -X DELETE http://localhost:3000/api/incidents/4 -H 'Authorization: Bearer technician-token'
```

**Respuesta:**

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8
Content-Length: 63
ETag: W/"3f-Ciny8F/cJnliWXrCQZ32B4qN1Eg"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Forbidden: administrator role required"}
```

## 12. Eliminar con instructor-token (204, sin cuerpo)

```bash
curl -s -i -X DELETE http://localhost:3000/api/incidents/3 -H 'Authorization: Bearer instructor-token'
```

**Respuesta:**

```http
HTTP/1.1 204 No Content
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

## 13. Ruta inexistente (404)

```bash
curl -s -i http://localhost:3000/api/planets
```

**Respuesta:**

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
Content-Length: 40
ETag: W/"28-BV6WUCwjz6YFMKxRi7ZCDe19S6M"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":false,"message":"Route not found"}
```

## 14. Bandeja de incidentes críticos (Reto 1)

```bash
curl -s -i http://localhost:3000/api/incidents/critical
```

**Respuesta:**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 683
ETag: W/"2ab-gT6MAxJcSny+Qg1ylxO0CmEfvhA"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"total":2,"data":[{"id":2,"title":"Computador que no enciende","description":"El equipo del puesto 4 no responde al botón de encendido ni muestra señal en la pantalla.","reporter":"Laura Gómez","location":"Laboratorio 304","priority":"CRITICAL","status":"OPEN","estimatedMinutes":45,"createdAt":"2026-10-05T09:02:00.000Z"},{"id":5,"title":"Aplicación de facturación se cierra al iniciar","description":"El software de facturación se cierra de forma inesperada justo después de iniciar sesión.","reporter":"Sofía Martínez","location":"Área de facturación","priority":"CRITICAL","status":"RESOLVED","estimatedMinutes":60,"createdAt":"2026-10-07T07:55:00.000Z"}]}
```

## 15. Incidentes pendientes (Reto 2)

```bash
curl -s -i http://localhost:3000/api/incidents/pending
```

**Respuesta:**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1161
ETag: W/"489-0nWJWg0YhLO9AVQAW9PeTO0+a0A"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"total":4,"data":[{"id":1,"title":"Proyector sin señal","description":"El proyector no reconoce ningún computador conectado.","reporter":"Carlos Díaz","location":"Aula 201","priority":"MEDIUM","status":"OPEN","estimatedMinutes":30,"createdAt":"2026-10-05T08:15:00.000Z"},{"id":2,"title":"Computador que no enciende","description":"El equipo del puesto 4 no responde al botón de encendido ni muestra señal en la pantalla.","reporter":"Laura Gómez","location":"Laboratorio 304","priority":"CRITICAL","status":"OPEN","estimatedMinutes":45,"createdAt":"2026-10-05T09:02:00.000Z"},{"id":4,"title":"Falla de conectividad en sala de juntas","description":"La conexión a Internet se cae cada pocos minutos en la sala de juntas 2 durante las reuniones.","reporter":"Andrea Castro","location":"Sala de juntas 2","priority":"HIGH","status":"OPEN","estimatedMinutes":60,"createdAt":"2026-10-06T14:20:00.000Z"},{"id":6,"title":"Router sin conectividad","description":"El router del segundo piso perdió conexión.","reporter":"Ana Torres","location":"Piso 2","priority":"HIGH","status":"OPEN","estimatedMinutes":40,"createdAt":"2026-10-08T21:23:13.059Z"}]}
```

## 16. Resumen operacional (Reto 3)

```bash
curl -s -i http://localhost:3000/api/incidents/stats
```

**Respuesta:**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 109
ETag: W/"6d-ATGffzowxmOSz/7nchsFH1ZZI1M"
Date: Thu, 08 Oct 2026 21:23:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"ok":true,"data":{"total":5,"open":4,"inProgress":0,"resolved":1,"critical":2,"averageEstimatedMinutes":47}}
```
