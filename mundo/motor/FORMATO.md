# Motor de paciente virtual · formato de escenario

`paciente.html?esc=<id>` carga `escenarios/<id>.js` y después `motor.js`.
El motor pone la interfaz (paciente 2,5D, monitor, dispositivos, auscultación, modos tutor y examen, debriefing y repetición). El escenario aporta la medicina: la fisiología, las acciones, los hallazgos y la rúbrica.

## Objeto `window.ESCENARIO`

| Campo | Tipo | Para qué |
|---|---|---|
| `id`, `titulo`, `presentacion`, `duracionMax` | texto / min | Cabecera y fin automático |
| `casos`, `caseIds` | objeto / array | Variantes con la misma presentación (el alumno razona cuál es) |
| `preguntas[]` | `{id, txt}` | Anamnesis; la respuesta la da `responder(S, id)` |
| `exploraciones[]` | `{id, txt, ico, audio?}` | El texto lo da `hallazgo(S, id)`; `audio: "pulmon" | "corazon"` activa la auscultación sintetizada con `audio(S, tipo)` |
| `pruebas[]` | `{id, txt, demora}` | `prueba(S, id)` devuelve `{txt, alerta?}` con el estado en el momento de la extracción |
| `tratamientos[]` | grupos de `{id, txt, desc, o2?, dispositivo?}` | `o2` = FiO₂ del dispositivo; `dispositivo: "niv" | "ntg"` abre el panel del equipo |
| `diagnosticos[]`, `destinos[]` | `{id, txt}` | Pestaña «Decisión» |
| `init(caso)` | → estado `S` | Estado fisiológico inicial |
| `step(S, dtm)` | muta `S` | Avanza `dtm` minutos. Debe mantener `spo2, hr, sbp, dbp, rr, etco2, gcs, temp, ph, paco2, wob, sudor, cianosis, capnoForma, arrest` |
| `aplicar(S, id, params)` | muta `S` | Efecto de una acción |
| `pistas[]` | `{id, cuando(S, L), txt}` | Solo en modo tutor; cada pista sale una vez |
| `comentario(S, id)` | texto | Comentario docente tras una acción o resultado (modo tutor) |
| `COMPETENCIAS`, `recursos` | objetos | Nombres de las competencias y recomendación de refuerzo |
| `rubrica(S, L)` | → `[{comp, txt, ok, critico}]` | Evaluación objetiva. Las críticas pesan el doble; una parada limita la nota al 40 % |

## Campos opcionales (escenarios en tiempo real, p. ej. `pcr.js`)
| Campo | Para qué |
|---|---|
| `velocidad` | Velocidad inicial (1 = tiempo real; la PCR usa ×1) |
| `finAlParar: false` | La parada no termina el caso (es el propio escenario) |
| `desfibrilador`, `energias` | Muestra el desfibrilador manual en pantalla: parches, energía, cargar, descargar, desarmar. Llama a `aplicar(S, "parches")` y `aplicar(S, "descarga", {energia})` |
| `rapidas[]` | Ids de tratamientos que salen como botones grandes bajo el monitor |
| item `toggle: "clave"` | Acción que activa o desactiva `S[clave]` (p. ej. las compresiones) |
| item `hallazgo: true` | Tras aplicarla, muestra `hallazgo(S, id)` en los resultados (p. ej. analizar el ritmo) |
| `aplicar` → `{error}` · `{msg, tipo, siempre}` | Rechaza la acción con un aviso, o muestra un mensaje (solo en tutor, salvo `siempre`) |
| Estado `S.ritmo`, `S.pulso`, `S.cpr`, `S.cicloT`, `S.arrestActivo`, `S.supino`, `S.parches`, `S.via`, `S.viaAerea` | Monitor con ritmos (sinus, fv, tv, asist, aesp), artefacto de compresiones, temporizador de ciclo y paciente en decúbito |
| `dispositivos(S)` | Lista HTML de lo que está en marcha (sustituye a la de por defecto) |
| `grafica`, `franja`, `snapKeys`, `snapVista(h)` | Series del debriefing, franja sombreada (p. ej. tiempo con RCP) y panel de la repetición |
| `resultado(S)` | Texto del resultado clínico final |

## API del registro `L` (para pistas y rúbricas)
`hecho(id)` · `primero(id)` → minuto · `primeroDe([ids])` · `algo([ids])` · `cuenta([ids])` · `registro(id)` → `[{t, p}]` · `ultimo(id)` · `estadoEn(t)` → constantes en ese minuto · `minutosCon(fn)` → minutos en que se cumple una condición.

## Resultado guardado
Cada caso terminado se añade a `localStorage.motor_hist`: `{esc, caso, modo, pct, crit, arrest, comps, t}`. Mundo Emergencia lo lee para las misiones.

## Regla de calidad
La fisiología es un modelo **explícito y simplificado** (documentado al principio de cada escenario). Antes de usarlo para evaluar con consecuencias académicas tiene que pasar una revisión por expertos y un estudio piloto.
