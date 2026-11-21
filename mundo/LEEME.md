# Mundo Emergencia

- `index.html` — mapa, capítulos, misiones, XP, exámenes y Turno de noche.
- `datos.js` — **edita aquí** capítulos, misiones y preguntas (sin tocar el resto).
- `modulos/` — PHTLS, ATLS, RCP y la demo de TurnoValor (las láminas de anatomía están en `modulos/img/`; OpenStax CC BY 4.0 y Gray's Anatomy 1918, dominio público).
- Los módulos de VMNI se cargan desde la raíz del repositorio (`../`).

Añadir un capítulo nuevo: copia un bloque en `CAPITULOS`, añade su posición en `POS` (index.html) y sus preguntas en `PREGUNTAS` con el mismo `id`.

El progreso se guarda en `localStorage` del navegador; se puede exportar e importar desde ⚙️.
