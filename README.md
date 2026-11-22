# 🚨 Mundo Emergencia — aprende jugando

**Entrar al mundo:** https://drcarlosviru-hash.github.io/simulador-vmni/mundo/

Mundo virtual de la emergencia por capítulos, con misiones, XP, rangos, insignias, exámenes con estrellas y un modo arcade (*Turno de noche*):

1. **La calle** · PHTLS (trauma prehospitalario)
2. **El parte** · AmbulancePad SUC (libro interactivo y simulador de parte asistencial)
3. **Box de trauma** · ATLS
4. **Parada** · Simulador PCR, algoritmo SVA ERC 2025
5. **Respira** · VMNI (repaso, guía visual, ventiladores y simulador)
6. **Box de agudos** · CAD/EHH (taller interactivo + simulador hora a hora de 0 a 24 h)
7. **Fin de guardia** · TurnoValor (demo con datos ficticios)

El mapa cambia de cielo según la hora real (noche, amanecer, día, atardecer); se puede fijar tocando el reloj.

Las misiones se marcan solas leyendo el progreso que guarda cada módulo en el navegador. Preguntas y capítulos editables en `mundo/datos.js`.

---

# Simulador de VMNI

Simulador docente de ventilación mecánica no invasiva (VMNI) para urgencias y emergencias.

**Abrir el simulador:** https://drcarlosviru-hash.github.io/simulador-vmni/

Otros módulos:
- **Ventiladores en VMNI** (pantalla de cada equipo: bellavista, Servo-u, Hamilton T1, Monnal T60, Medumat): https://drcarlosviru-hash.github.io/simulador-vmni/ventiladores.html
- **Repaso de VMNI y fisiología** (10 lecciones): https://drcarlosviru-hash.github.io/simulador-vmni/repaso.html
- **Guía visual de VMNI** (flujogramas, casos, glosario): https://drcarlosviru-hash.github.io/simulador-vmni/guia.html

## Qué incluye

- **Aprende:** conceptos básicos (disparo, empuje y ciclado; lectura de curvas; parámetros; equivalencias entre equipos; asincronías) y una autoevaluación.
- **Simula:** pulmón virtual con curvas de presión, flujo y volumen en tiempo real, programable al estilo bellavista, Servo o Weinmann.
- 18 casos clínicos por niveles (EPOC, edema agudo de pulmón, ICC + EPOC, A-C con T insp por defecto), fármacos con efecto en el tiempo y eventos del paciente.
- Asincronías revisadas con una neumóloga: ante esfuerzos ineficaces, por orden, fuga → trigger → ciclado/soporte → auto-PEEP visible → agotamiento. Trigger del bellavista 0,5–2 L/min.

## Aviso

Herramienta con fines docentes. Modelo fisiológico simplificado; dosis y valores orientativos. Los nombres de los parámetros de cada equipo son aproximados y no reproducen su software. No sustituye al manual del equipo, a los protocolos del servicio ni al juicio clínico.
