# Carpeta de evidencias

Esta carpeta reúne las pruebas realizadas sobre IncidentHub API v1.

| Archivo | Contenido |
|---------|-----------|
| [`resultados-pruebas.md`](./resultados-pruebas.md) | Tabla de las 20 pruebas obligatorias y 10 adicionales, con su resultado |
| [`salida-pruebas.txt`](./salida-pruebas.txt) | Salida completa de `npm test` (30/30 aprobadas) |
| [`ejemplos-curl.md`](./ejemplos-curl.md) | 16 peticiones cURL reales con cabeceras y cuerpo de respuesta |
| [`preguntas-sustentacion.md`](./preguntas-sustentacion.md) | Respuestas a los 10 puntos de la sustentación |

## Cómo reproducir las evidencias

```bash
npm install
npm test                 # genera resultados equivalentes a salida-pruebas.txt
npm run dev              # en otra terminal
bash -c 'curl -i http://localhost:3000/api/incidents'
```
