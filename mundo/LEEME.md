# Mundo Emergencia

- `index.html` — capítulos, misiones, XP, exámenes y Turno de noche.
- `escena.js` — dibujo del mapa (edificios, luces, vehículos, cielo según la hora) e iconos SVG.
- `datos.js` — **edita aquí** capítulos, misiones y preguntas (sin tocar el resto).
- `modulos/` — PHTLS, ATLS, RCP, AmbulancePad (libro + simulador; capturas en `modulos/img-ambulancepad/`) y la demo de TurnoValor (las láminas de anatomía están en `modulos/img/`; OpenStax CC BY 4.0 y Gray's Anatomy 1918, dominio público).
- Los módulos de VMNI se cargan desde la raíz del repositorio (`../`).

Añadir un capítulo nuevo: copia un bloque en `CAPITULOS`, añade su posición en `POS` (index.html) y su icono en `ICONOS` (escena.js) y sus preguntas en `PREGUNTAS` con el mismo `id`.

El progreso se guarda en `localStorage` del navegador; se puede exportar e importar desde ⚙️.
