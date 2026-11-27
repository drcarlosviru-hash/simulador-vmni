/* =====================================================================
   MUNDO EMERGENCIA · datos de capítulos, misiones y preguntas
   Para añadir un capítulo nuevo: copia un bloque de CAPITULOS y añade
   sus preguntas en PREGUNTAS con la misma clave (id).
   ===================================================================== */

const VMNI = "../"; // los módulos de VMNI viven en la raíz de este repositorio

const IAM_ECG = ["iam-as","iam-ae","iam-lat","iam-la","iam-inf","iam-infvd","iam-post","scasest"];

const CAPITULOS = [
  {
    id: "phtls", n: 1, titulo: "Prehospitalaria", sub: "Politrauma prehospitalario · PHTLS",
    color: "#ff8a3d", icono: "🚑",
    historia: "02:14 h. Colisión frontal en la GC-1. Dos vehículos, un herido atrapado y sangrado activo en el muslo. Eres el primer recurso en llegar. La escena, el XABCDE y la decisión de traslado son tuyos.",
    modulos: [
      { id: "phtls", nombre: "Taller PHTLS interactivo", url: "modulos/phtls.html", desc: "Capítulos, casos de escena, galería anatómica y test." }
    ],
    misiones: [
      { id: "phtls_open", txt: "Entra en el taller PHTLS", xp: 50, auto: s => s.visit("phtls") },
      { id: "phtls_cap", txt: "Completa al menos 3 capítulos del taller", xp: 100, auto: s => s.count("phtls_ch") >= 3 },
      { id: "phtls_caso", txt: "Resuelve un caso de escena", xp: 100, auto: s => s.count("phtls_cs") >= 1 },
      { id: "phtls_test", txt: "Saca 70 % o más en el test del taller", xp: 150, auto: s => s.num("phtls_qz") >= 70 },
      { id: "phtls_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("phtls") >= 1 }
    ],
    insignia: { id: "torniquete", nombre: "Mano firme", icono: "🩸", txt: "Examen PHTLS superado" }
  },
  {
    id: "apad", n: 2, titulo: "El parte", sub: "Registro asistencial digital · AmbulancePad",
    color: "#fbbf24", icono: "📋",
    historia: "El herido ya va en la ambulancia. Mientras el enfermero canaliza, tú abres la tablet: tripulación autenticada, desfibrilador conectado, ABCDE, intervenciones con su hora y protocolo SVA EXTENDIDO para el estudio de politrauma. Lo que no queda registrado no existe.",
    modulos: [
      { id: "apad_libro", nombre: "AmbulancePad SUC · Libro interactivo", url: "modulos/ambulancepad-libro.html", desc: "Del inicio de turno al cierre del parte, con capturas y autoevaluación." },
      { id: "apad_sim", nombre: "Simulador de parte asistencial", url: "modulos/ambulancepad-simulador.html", desc: "Rellena un parte completo como en la tablet de la ambulancia." }
    ],
    misiones: [
      { id: "apad_m1", txt: "Abre el libro interactivo", xp: 50, auto: s => s.visit("apad_libro") },
      { id: "apad_m2", txt: "Completa 5 capítulos del libro", xp: 100, auto: s => s.list("apad_done").length >= 5 },
      { id: "apad_m3", txt: "Abre el simulador de parte asistencial", xp: 50, auto: s => s.visit("apad_sim") },
      { id: "apad_m4", txt: "Cierra un parte en el simulador", xp: 100, auto: s => (s.obj("apadSim2").pcrs || []).some(p => p.closed) },
      { id: "apad_m5", txt: "Cierra un parte con protocolo SVA EXTENDIDO", xp: 150, auto: s => (s.obj("apadSim2").pcrs || []).some(p => p.closed && p.proto === "SVA EXTENDIDO") },
      { id: "apad_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("apad") >= 1 }
    ],
    insignia: { id: "parte", nombre: "Parte impecable", icono: "📋", txt: "Examen de AmbulancePad superado" }
  },
  {
    id: "atls", n: 3, titulo: "Box de trauma", sub: "Trauma hospitalario · ATLS",
    color: "#ff4d6d", icono: "🏥",
    historia: "El herido llega al box vital: taquicárdico, frío, Glasgow 11. El equipo te mira. Revisión primaria, control de la hemorragia, FAST y decisión: ¿quirófano, radiología o TAC?",
    modulos: [
      { id: "atls", nombre: "Taller ATLS interactivo", url: "modulos/atls.html", desc: "Revisión primaria y secundaria, shock, 8 casos, 10 estaciones de simulación, atlas anatómico y test." }
    ],
    misiones: [
      { id: "atls_open", txt: "Entra en el taller ATLS", xp: 50, auto: s => s.visit("atls") },
      { id: "atls_cap", txt: "Completa al menos 3 capítulos del taller", xp: 100, auto: s => s.count("atls_ch") >= 3 },
      { id: "atls_caso", txt: "Resuelve un caso clínico", xp: 100, auto: s => s.count("atls_cs") >= 1 },
      { id: "atls_sim", txt: "Completa 3 estaciones de simulación de habilidades", xp: 100, auto: s => s.count("atls_sim") >= 3 },
      { id: "atls_test", txt: "Saca 70 % o más en el test del taller", xp: 150, auto: s => s.num("atls_qz") >= 70 },
      { id: "atls_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("atls") >= 1 }
    ],
    insignia: { id: "golden", nombre: "Hora de oro", icono: "⏱️", txt: "Examen ATLS superado" }
  },
  {
    id: "gaso", n: 4, titulo: "Laboratorio", sub: "Gasometría y medio interno",
    color: "#2dd4bf", icono: "🧪",
    historia: "05:40 h. El gasómetro escupe el ticket de un varón de 72 años que llegó confuso y taquipneico: pH 7,21 · PaCO₂ 24 · HCO₃⁻ 9 · Na⁺ 138 · Cl⁻ 101. Antes de pedir nada más, el ticket ya te está contando qué le pasa. Aprende a leerlo.",
    modulos: [
      { id: "gaso_mundo", nombre: "Gasometría: el medio interno en movimiento", url: "modulos/gaso.html", desc: "Diagrama de Davenport vivo, 4 vídeos narrados (tampón, pulmón, riñón e integración en el tiempo), simulador de casos en 4 niveles y analizador paso a paso." }
    ],
    misiones: [
      { id: "gaso_m1", txt: "Juega con el laboratorio: mueve el punto o lanza un escenario", xp: 50, auto: s => !!s.obj("gaso-v1").lab },
      { id: "gaso_m2", txt: "Mira un vídeo completo", xp: 75, auto: s => Object.keys(s.obj("gaso-v1").v || {}).length >= 1 },
      { id: "gaso_m3", txt: "Mira los 4 vídeos: tampón, pulmón, riñón y tiempos", xp: 100, auto: s => Object.keys(s.obj("gaso-v1").v || {}).length >= 4 },
      { id: "gaso_m4", txt: "Interpreta una gasometría con el analizador", xp: 50, auto: s => (s.obj("gaso-v1").an || 0) >= 1 },
      { id: "gaso_m5", txt: "Nivel 1: resuelve 3 casos", xp: 100, auto: s => ((s.obj("gaso-v1")[1] || {}).cases || 0) >= 3 },
      { id: "gaso_m6", txt: "Nivel 2: racha de 3 casos perfectos (compensación)", xp: 150, auto: s => ((s.obj("gaso-v1")[2] || {}).best || 0) >= 3 },
      { id: "gaso_m7", txt: "Nivel 3: 5 casos con ≥ 80 % de aciertos (anion gap)", xp: 150, auto: s => { const l = s.obj("gaso-v1")[3] || {}; return (l.cases || 0) >= 5 && l.n > 0 && l.ok / l.n >= .8; } },
      { id: "gaso_m8", txt: "Reto: un caso perfecto de nivel 4 (mixtos, delta gap, A-a)", xp: 200, auto: s => ((s.obj("gaso-v1")[4] || {}).best || 0) >= 1 },
      { id: "gaso_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("gaso") >= 1 }
    ],
    insignia: { id: "henderson", nombre: "Henderson-Hasselbalch", icono: "🧪", txt: "Examen de gasometría superado" }
  },
  {
    id: "ecg", n: 5, titulo: "Monitores", sub: "ECG · territorio isquémico y arritmias",
    color: "#818cf8", icono: "📈",
    historia: "03:12 h. Suena la alarma del box 4: el monitor dibuja algo que hace diez minutos no estaba. El corazón te lo está contando latido a latido; tu trabajo es saber dónde mirar, qué arteria se ha cerrado y qué circuito está girando.",
    modulos: [
      { id: "ecg_sim", nombre: "Simulador de ECG y corazón", url: "modulos/ecg.html", desc: "25 escenarios (8 síndromes coronarios, 11 arritmias, 6 bloqueos): corazón animado sincronizado con el ECG de 12 derivaciones (+V4R y V7–V9), ecocardiograma en 3 planos, monitor y casos clínicos aleatorios." }
    ],
    misiones: [
      { id: "ecg_m1", txt: "Explora 5 escenarios distintos", xp: 50, auto: s => Object.keys(s.obj("ecg_hist").v || {}).length >= 5 },
      { id: "ecg_m2", txt: "Recorre los 8 síndromes coronarios (anterior, lateral, inferior, VD, posterior, SCASEST…)", xp: 100, auto: s => { const v = s.obj("ecg_hist").v || {}; return IAM_ECG.every(k => v[k]); } },
      { id: "ecg_m3", txt: "Explora los 25 escenarios", xp: 150, auto: s => Object.keys(s.obj("ecg_hist").v || {}).length >= 25 },
      { id: "ecg_m4", txt: "Resuelve 5 casos clínicos aleatorios", xp: 100, auto: s => (s.obj("ecg_hist").casos || 0) >= 5 },
      { id: "ecg_m5", txt: "Racha de 5 diagnósticos correctos seguidos", xp: 150, auto: s => (s.obj("ecg_hist").best || 0) >= 5 },
      { id: "ecg_m6", txt: "Acierta la arteria culpable en 5 infartos", xp: 150, auto: s => (s.obj("ecg_hist").art || 0) >= 5 },
      { id: "ecg_m7", txt: "Reto: 20 casos con ≥ 80 % de diagnósticos correctos", xp: 200, auto: s => { const h = s.obj("ecg_hist"); return (h.casos || 0) >= 20 && (h.dx || 0) / h.casos >= .8; } },
      { id: "ecg_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("ecg") >= 1 }
    ],
    insignia: { id: "einthoven", nombre: "Einthoven", icono: "📈", txt: "Examen de ECG superado" }
  },
  {
    id: "rcp", n: 6, titulo: "Parada", sub: "Soporte vital avanzado · ERC 2025",
    color: "#38bdf8", icono: "⚡",
    historia: "Mientras lo trasladas a TAC, el monitor cambia: fibrilación ventricular. Compresiones, descarga, adrenalina, causas reversibles. Cada segundo sin compresiones cuenta.",
    modulos: [
      { id: "rcp", nombre: "🩺 Paciente virtual · Parada cardiorrespiratoria (SVA ERC 2025)", url: "modulos/rcp.html?sim=1", desc: "Tu simulador de referencia: 6 casos, desfibrilador manual, identificación del ritmo en cada pausa, 4H/4T, cuidados tras la RCE, evaluación y repetición minuto a minuto. Incluye el algoritmo interactivo y la referencia rápida." }
    ],
    misiones: [
      { id: "rcp_open", txt: "Entra en el simulador de PCR", xp: 50, auto: s => s.visit("rcp") },
      { id: "rcp_caso", txt: "Termina un escenario completo", xp: 100, auto: s => s.list("pcr_hist").length >= 1 },
      { id: "rcp_rosc", txt: "Consigue una recuperación de la circulación (RCE)", xp: 150, auto: s => s.list("pcr_hist").some(h => h.rosc) },
      { id: "rcp_80", txt: "Obtén 80 puntos o más en un escenario", xp: 150, auto: s => s.list("pcr_hist").some(h => +h.sc >= 80) },
      { id: "rcp_pv1", txt: "RCE en la FV presenciada con ≥ 75 puntos en modo evaluación", xp: 250, auto: s => s.list("motor_hist").some(h => h.esc === "pcr" && h.caso === "fv" && h.modo === "examen" && h.pct >= 75 && !h.arrest) },
      { id: "rcp_pv2", txt: "AESP por hiperpotasemia resuelta sin errores críticos", xp: 250, auto: s => s.list("motor_hist").some(h => h.esc === "pcr" && h.caso === "hiperk" && h.crit === 0 && !h.arrest) },
      { id: "rcp_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("rcp") >= 1 }
    ],
    insignia: { id: "rosc", nombre: "RCE", icono: "💓", txt: "Examen de SVA superado" }
  },
  {
    id: "vmni", n: 7, titulo: "Respira", sub: "Ventilación mecánica no invasiva",
    color: "#34d399", icono: "🫁",
    historia: "Recuperado, pero ahora es otro paciente el que te necesita: EPOC agudizado, pH 7,26, tirando de accesorios. Ajusta la máscara, el EPAP, el soporte… y lee las curvas antes de que se agote.",
    modulos: [
      { id: "vmni_pv", nombre: "🩺 Paciente virtual · Insuficiencia respiratoria aguda", url: "motor/paciente.html?esc=ira", desc: "Paciente dinámico con monitor real, auscultación, VMNI ajustable, modo tutor/examen y debriefing por competencias." },
      { id: "vmni_repaso", nombre: "Repaso de VMNI y fisiología", url: VMNI + "repaso.html", desc: "10 lecciones para empezar." },
      { id: "vmni_guia", nombre: "Guía visual de VMNI", url: VMNI + "guia.html", desc: "Flujogramas, casos y glosario." },
      { id: "vmni_vent", nombre: "Ventiladores en VMNI", url: VMNI + "ventiladores.html", desc: "La pantalla de cada equipo." },
      { id: "vmni_sim", nombre: "Simulador de VMNI", url: VMNI + "index.html", desc: "Pulmón virtual, curvas y 18 casos." }
    ],
    misiones: [
      { id: "vmni_m1", txt: "Estudia el repaso de fisiología", xp: 75, auto: s => s.visit("vmni_repaso") },
      { id: "vmni_m2", txt: "Recorre la guía visual", xp: 75, auto: s => s.visit("vmni_guia") },
      { id: "vmni_m3", txt: "Conoce las pantallas de los ventiladores", xp: 75, auto: s => s.visit("vmni_vent") },
      { id: "vmni_m4", txt: "Ventila a un paciente en el simulador", xp: 100, auto: s => s.visit("vmni_sim") },
      { id: "vmni_pv1", txt: "Paciente virtual: ≥ 75 % en modo examen sin parada", xp: 200, auto: s => s.list("motor_hist").some(h => h.esc === "ira" && h.modo === "examen" && h.pct >= 75 && !h.arrest) },
      { id: "vmni_pv2", txt: "Paciente virtual: resuelve el EAP y el EPOC sin fallos críticos", xp: 250, auto: s => ["eap", "epoc"].every(c => s.list("motor_hist").some(h => h.esc === "ira" && h.caso === c && h.crit === 0)) },
      { id: "vmni_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("vmni") >= 1 }
    ],
    insignia: { id: "sincronia", nombre: "Sincronía", icono: "〰️", txt: "Examen de VMNI superado" }
  },
  {
    id: "hk", n: 8, titulo: "Box vital", sub: "Hiperpotasemia aguda",
    color: "#a3e635", icono: "⚡",
    historia: "03:10 h. Varón de 68 años con ERC, IECA y espironolactona. Dice que no siente las piernas. El monitor muestra una bradicardia con QRS cada vez más ancho y la enfermera te enseña la gasometría: K⁺ 7,1. Tienes minutos, no horas.",
    modulos: [
      { id: "hk_taller", nombre: "Taller interactivo de hiperpotasemia", url: "modulos/hk-taller.html", desc: "ECG en vivo según el K⁺, pseudohiperpotasemia, botiquín, curva con rebote y guardia paso a paso." },
      { id: "hk_sim", nombre: "Simulador de hiperpotasemia aguda", url: "modulos/hk-simulador.html", desc: "3 casos con monitor en tiempo real, analíticas, tratamientos y evaluación final." }
    ],
    misiones: [
      { id: "hk_m1", txt: "Identifica 4 de 5 trazados de ECG", xp: 100, auto: s => !!s.obj("hktaller").ecg },
      { id: "hk_m2", txt: "Desenmascara la pseudohiperpotasemia (3/4)", xp: 100, auto: s => !!s.obj("hktaller").pse },
      { id: "hk_m3", txt: "Ordena el botiquín por fases", xp: 75, auto: s => !!s.obj("hktaller").kit },
      { id: "hk_m4", txt: "Planifica un tratamiento completo en la curva (sin rebote)", xp: 75, auto: s => !!s.obj("hktaller").cur },
      { id: "hk_m5", txt: "Completa la guardia paso a paso", xp: 100, auto: s => !!s.obj("hktaller").alg },
      { id: "hk_m6", txt: "Termina un caso en el simulador", xp: 100, auto: s => s.list("hiperk_hist").length >= 1 },
      { id: "hk_m7", txt: "Caso sin fallos críticos ni parada", xp: 150, auto: s => s.list("hiperk_hist").some(h => !h.crit && !h.arrest) },
      { id: "hk_m8", txt: "Reto: paciente en diálisis (caso 3) con todo correcto", xp: 200, auto: s => s.list("hiperk_hist").some(h => h.c === 2 && h.ok === h.n) },
      { id: "hk_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("hk") >= 1 }
    ],
    insignia: { id: "membrana", nombre: "Membrana estable", icono: "⚡", txt: "Examen de hiperpotasemia superado" }
  },
  {
    id: "cad", n: 9, titulo: "Box de agudos", sub: "Cetoacidosis y estado hiperosmolar · CAD/EHH",
    color: "#f472b6", icono: "🩸",
    historia: "04:30 h. Mujer de 24 años, DM1, tres días vomitando. Respira hondo y rápido, huele a manzana y tiene la boca seca. Glucemia capilar: «HI». Antes de tocar la insulina necesitas un dato que todavía no tienes: el potasio.",
    modulos: [
      { id: "cad_taller", nombre: "Taller interactivo CAD/EHH", url: "modulos/cad-taller.html", desc: "Laboratorio en vivo, regla del potasio, curva de glucosa, clasificación y guardia paso a paso." },
      { id: "cad_sim", nombre: "Simulador CAD/EHH hora a hora", url: "modulos/cad-simulador.html", desc: "Pauta fluidos, insulina, K⁺ y dextrosa cada hora y mira cómo responde el paciente de 0 a 24 h." }
    ],
    misiones: [
      { id: "cad_m1", txt: "Juega con el laboratorio en vivo (criterios, brecha, osmolaridad)", xp: 75, auto: s => !!s.obj("cadtaller").lab },
      { id: "cad_m2", txt: "Supera el reto de la regla del potasio (4/5)", xp: 100, auto: s => !!s.obj("cadtaller").k },
      { id: "cad_m3", txt: "Clasifica bien el 80 % de los pacientes", xp: 100, auto: s => (s.obj("cadtaller").cls || 0) >= 80 },
      { id: "cad_m4", txt: "Completa la guardia paso a paso", xp: 100, auto: s => (s.obj("cadtaller").alg || 0) >= 1 },
      { id: "cad_m5", txt: "Termina un caso en el simulador hora a hora", xp: 100, auto: s => s.list("cadehh_hist").length >= 1 },
      { id: "cad_m6", txt: "Resuelve un caso en ≤ 12 h sin eventos graves", xp: 150, auto: s => s.list("cadehh_hist").some(h => h.res && h.res <= 12 && !h.dead && !h.ev) },
      { id: "cad_m7", txt: "Reto: 80 puntos en la CAD grave con K⁺ bajo", xp: 200, auto: s => s.list("cadehh_hist").some(h => h.c === "hipok" && h.sc >= 80) },
      { id: "cad_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("cad") >= 1 }
    ],
    insignia: { id: "dulce", nombre: "Brecha cerrada", icono: "🩸", txt: "Examen de CAD/EHH superado" }
  },
  {
    id: "turno", n: 10, titulo: "Fin de guardia", sub: "Sala de descanso · TurnoValor",
    color: "#a78bfa", icono: "☕",
    historia: "08:00 h. Relevo hecho. Antes de irte, mira qué ha supuesto esta guardia: horas, carga y valor de cada turno. Cuidar del equipo también es medicina de urgencias.",
    modulos: [
      { id: "turno", nombre: "TurnoValor · demo", url: "modulos/turnovalor.html", desc: "Valor económico y carga de cada turno (datos ficticios)." }
    ],
    misiones: [
      { id: "turno_open", txt: "Abre la demo de TurnoValor", xp: 75, auto: s => s.visit("turno") },
      { id: "turno_rev", txt: "Compara al menos dos tipos de turno", xp: 75, manual: true }
    ],
    sinExamen: true,
    insignia: { id: "relevo", nombre: "Buen relevo", icono: "🌅", txt: "Capítulo de fin de guardia completado" }
  }
];

const RANGOS = [
  { xp: 0, nombre: "Estudiante en prácticas" },
  { xp: 300, nombre: "Residente R1" },
  { xp: 800, nombre: "Residente R2" },
  { xp: 1500, nombre: "Residente R3" },
  { xp: 2500, nombre: "Adjunto/a de urgencias" },
  { xp: 4000, nombre: "Jefe/a de guardia" },
  { xp: 6000, nombre: "Leyenda de la emergencia" }
];

/* Preguntas: o = opciones, c = índice correcto, e = explicación.
   Material docente orientativo: revisar con las guías vigentes del servicio. */
const PREGUNTAS = {
  phtls: [
    { q: "Llegas a la escena de un accidente de tráfico. ¿Qué haces primero?", o: ["Colocar el collarín cervical", "Valorar la seguridad de la escena y la situación", "Tomar la tensión arterial", "Pre-alertar al hospital"], c: 1, e: "Sin una escena segura no hay asistencia: primero seguridad, número de víctimas, recursos necesarios y mecanismo lesional." },
    { q: "En el XABCDE, ¿qué significa la X?", o: ["Exploración completa", "Exposición del paciente", "Control de la hemorragia exanguinante externa", "Extracción del vehículo"], c: 2, e: "La hemorragia externa masiva mata antes que la obstrucción de la vía aérea, por eso se controla lo primero." },
    { q: "Hemorragia en el muslo que no cede con presión directa. ¿Cómo colocas el torniquete?", o: ["Sobre la rodilla, para comprimir más", "Proximal a la herida, sin colocarlo sobre una articulación, apretando hasta que cese el sangrado y anotando la hora", "Distal a la herida", "Flojo, para no dañar el nervio"], c: 1, e: "Proximal a la lesión (habitualmente 5–7 cm por encima), nunca sobre una articulación, hasta detener el sangrado. Anota la hora de colocación." },
    { q: "Trauma penetrante de torso sin TCE y con hemorragia no controlada. ¿Qué objetivo de reanimación es razonable?", o: ["PAS de 120 mmHg o más", "PAS en torno a 80–90 mmHg o pulso radial palpable (hipotensión permisiva)", "No administrar ningún fluido nunca", "PAM de 100 mmHg"], c: 1, e: "La hipotensión permisiva limita la dilución y el resangrado hasta el control quirúrgico. No aplica si hay TCE." },
    { q: "Hipotensión, ingurgitación yugular, murmullo abolido en un hemitórax y dificultad respiratoria creciente. ¿Qué sospechas y qué haces?", o: ["Taponamiento: pericardiocentesis", "Neumotórax a tensión: descompresión torácica inmediata", "Contusión pulmonar: oxígeno y esperar", "Shock medular: vasopresores"], c: 1, e: "Es un diagnóstico clínico. La descompresión no debe esperar a la imagen." },
    { q: "¿Cuál es la «tríada letal» del paciente traumático?", o: ["Hipoxia, hipercapnia, hipotensión", "Hipotermia, acidosis y coagulopatía", "Taquicardia, taquipnea, fiebre", "Dolor, ansiedad, sangrado"], c: 1, e: "Cada una empeora las otras dos. Evita la hipotermia desde la escena: mantas, calor y control rápido del sangrado." },
    { q: "En un paciente con TCE grave, ¿qué dos agresiones secundarias debes evitar a toda costa?", o: ["Hiperglucemia e hipernatremia", "Hipoxia e hipotensión", "Fiebre y dolor", "Bradicardia e hipercapnia leve"], c: 1, e: "Un solo episodio de hipoxia (SpO2 < 90 %) o de hipotensión se asocia a un aumento importante de la mortalidad en el TCE." },
    { q: "Herida por arma blanca en el abdomen, consciente y sin déficit neurológico. ¿Inmovilización espinal completa?", o: ["Sí, siempre en todo trauma", "No está indicada de rutina en el trauma penetrante sin déficit neurológico", "Solo collarín, nunca tablero", "Sí, y retrasar el traslado si hace falta"], c: 1, e: "En el trauma penetrante sin déficit la inmovilización rutinaria no aporta beneficio y retrasa el traslado." }
  ],
  apad: [
    { q: "¿Qué es AmbulancePad?", o: ["Un sistema de ayuda al diagnóstico", "Un sistema de documentación del parte asistencial digital", "Un monitor-desfibrilador", "Un navegador GPS"], c: 1, e: "Documenta la asistencia. No sustituye la exploración ni es una herramienta diagnóstica." },
    { q: "Las constantes del desfibrilador llegan a la tablet…", o: ["En tiempo real, latido a latido", "Con al menos 30 s de retraso y de forma periódica: valora siempre en el monitor", "Solo al cerrar el parte", "Nunca llegan solas"], c: 1, e: "Las decisiones clínicas se toman con el monitor, nunca con la tablet." },
    { q: "Vas a cerrar el parte y quedan campos obligatorios abiertos. ¿Qué pide el sistema?", o: ["Nada, se cierra igual", "Justificarlos: no posible, no relevante, no requerido o sin tiempo", "Borrar el parte", "Llamar a la sala"], c: 1, e: "Después se firma y, si está configurado, se introduce la contraseña." },
    { q: "Con el parte ya cerrado, ¿cómo añades o corriges un dato clínico?", o: ["Reabriéndolo y editando", "Con una anotación al margen (Anexo)", "Creando un parte nuevo", "No se puede hacer nada"], c: 1, e: "Los datos médicos quedan bloqueados. Los administrativos (nombre, edad) sí pueden completarse después." },
    { q: "Registras una sospecha de SCACEST o ictus. ¿Qué hace la app?", o: ["Nada", "Muestra un aviso parpadeante para enviar la prenotificación, que complementa la activación por los canales del CECOES", "Activa el código sola y no hace falta llamar", "Cierra el parte"], c: 1, e: "La prenotificación digital no sustituye a la activación del código por los canales operativos." },
    { q: "La ambulancia se queda sin cobertura en mitad del servicio.", o: ["Se pierde el parte", "Se sigue trabajando off-line y se sincroniza al recuperar la cobertura", "Hay que pasar a papel", "La tablet se bloquea"], c: 1, e: "Todo el caso se guarda en la tablet." },
    { q: "En la barra de estado, una sección en naranja significa:", o: ["Que está completa", "Que le faltan datos obligatorios", "Que tiene un error del sistema", "Que es opcional"], c: 1, e: "Naranja: faltan datos. Verde con ✓: completa. Antes de cerrar, todas en verde." },
    { q: "Al iniciar el turno, ¿qué es imprescindible para que la tablet quede operativa?", o: ["Hacer una foto de la ambulancia", "Registrar unidad y tripulación, con al menos un miembro autenticado con contraseña", "Conectar la impresora", "Enviar un parte de prueba"], c: 1, e: "El sistema marca en gris los roles obligatorios que faltan." }
  ],
  hk: [
    { q: "K⁺ 7,0 mmol/L con QRS ancho. ¿Primera medida?", o: ["Furosemida IV", "Calcio IV (gluconato cálcico 10 % 30 mL)", "Repetir la analítica", "Patiromer"], c: 1, e: "Estabiliza la membrana en 1–3 minutos. Con cambios ECG o K⁺ ≥ 6,5 va primero." },
    { q: "¿Qué hace el calcio en la hiperpotasemia?", o: ["Baja el K⁺ sérico", "Estabiliza la membrana miocárdica sin bajar el K⁺; dura 30–60 min", "Elimina K⁺ por la orina", "Mete K⁺ en la célula"], c: 1, e: "Gana tiempo para redistribuir y eliminar. Se repite si persisten los cambios ECG." },
    { q: "Pauta de redistribución con insulina:", o: ["Insulina 10 U IV + glucosa 25 g, con control de glucemia 4–6 h", "Insulina 10 U SC", "Insulina 1 U/kg IV", "Insulina sin glucosa si la glucemia es normal"], c: 0, e: "La hipoglucemia es la complicación más frecuente. Valora 5 U en la ERC avanzada." },
    { q: "Dosis de salbutamol para la hiperpotasemia:", o: ["2,5 mg nebulizado", "10–20 mg nebulizado", "0,5 mg IV en bolo", "100 µg inhalado"], c: 1, e: "4–8 veces la dosis broncodilatadora. Efecto aditivo al de la insulina." },
    { q: "K⁺ 6,9 en una paciente asintomática, ECG normal y muestra «hemolizada». ¿Qué haces?", o: ["Calcio e insulina ya", "Confirmar con una muestra adecuada o una gasometría antes de tratar", "Diálisis", "Alta sin más"], c: 1, e: "Pseudohiperpotasemia: hemólisis, torniquete, trombocitosis, leucocitosis, EDTA, procesamiento tardío." },
    { q: "¿Cuándo es grave la hiperpotasemia?", o: ["Solo si K⁺ > 8", "K⁺ ≥ 6,5 o cualquier cifra con cambios ECG", "Si K⁺ > 5,5", "Solo si hay parada"], c: 1, e: "Los umbrales varían entre guías (la AHA considera grave desde 6,0). El riesgo es continuo." },
    { q: "Paciente en hemodiálisis, anúrico, K⁺ 8,4. Tratamiento definitivo:", o: ["Furosemida a dosis altas", "Hemodiálisis urgente", "Salbutamol repetido", "Patiromer"], c: 1, e: "El calcio y la redistribución solo ganan tiempo (bajan 0,6–1,5 mmol/L). La furosemida no sirve en el anúrico." },
    { q: "Orden de los cambios ECG al subir el K⁺:", o: ["QRS ancho → T picudas → FV", "T picudas → P plana y PR largo → QRS ancho → onda sinusoidal → FV/asistolia", "Bradicardia → T negativas → FV", "ST elevado → QRS ancho"], c: 1, e: "La correlación con la cifra es imperfecta: puede haber arritmias con cambios mínimos." },
    { q: "A las 4 h de la insulina, el K⁺ vuelve a subir. ¿Por qué?", o: ["Error del laboratorio", "Rebote al agotarse la redistribución: hace falta eliminar K⁺ y tratar la causa", "Efecto del calcio", "Hipoglucemia"], c: 1, e: "La insulina y el salbutamol no sacan K⁺ del organismo. Control seriado del K⁺." }
  ],
  cad: [
    { q: "Criterios diagnósticos de CAD (consenso ADA/EASD/JBDS 2024):", o: ["Glucosa > 600 y osmolaridad > 320", "Glucosa ≥ 200 (o diabetes conocida), β-OHB ≥ 3,0 mmol/L y pH < 7,30 y/o HCO₃⁻ < 18", "pH < 7,0 aislado", "Cetonuria con cualquier glucemia"], c: 1, e: "La glucosa puede ser < 200 en la CAD euglucémica (iSGLT2, embarazo, ayuno)." },
    { q: "¿Qué define el estado hiperosmolar (EHH)?", o: ["Glucosa ≥ 600, osmolaridad efectiva > 300, β-OHB < 3, pH ≥ 7,30 y HCO₃⁻ ≥ 15", "Glucosa > 250 con pH < 7,30", "Na⁺ > 145 en un diabético", "Cetonemia > 3 sin acidosis"], c: 0, e: "Sin cetoacidosis importante. Si cumple ambos cuadros, es una forma mixta." },
    { q: "CAD con K⁺ 3,1 mEq/L. ¿Qué haces con la insulina?", o: ["Iniciarla a 0,1 U/kg/h", "No iniciarla: reponer K⁺ 10–20 mEq/h hasta K⁺ ≥ 3,5", "Bolo de 0,1 U/kg", "Iniciarla y dar bicarbonato"], c: 1, e: "La insulina mete K⁺ en la célula: con K⁺ bajo provoca hipopotasemia grave y arritmias." },
    { q: "CAD con glucemia ya en 230 mg/dL y pH 7,22. ¿Siguiente paso?", o: ["Suspender la insulina", "Añadir dextrosa 5–10 % y bajar la insulina a 0,02–0,05 U/kg/h", "Bicarbonato", "Pasar ya a insulina SC"], c: 1, e: "La glucosa se mantiene en 150–200 mientras la insulina limpia la cetonemia. Suspenderla reactiva la cetogénesis." },
    { q: "¿Cuándo está indicado el bicarbonato según el algoritmo?", o: ["Siempre que el pH sea < 7,30", "Solo si pH < 6,9 (o K⁺ > 6,4)", "Con HCO₃⁻ < 18", "En toda CAD grave"], c: 1, e: "100 mmol en 400 mL en 2 h. Valorar 50 mmol con pH 6,9–7,0." },
    { q: "Criterios de resolución de la CAD:", o: ["Glucosa < 200", "pH > 7,30, HCO₃⁻ ≥ 18 y β-OHB < 0,6 mmol/L", "Desaparición de la cetonuria", "Diuresis > 1 mL/kg/h"], c: 1, e: "La cetonuria tarda más en negativizarse: no sirve para guiar la resolución." },
    { q: "¿Cómo se pasa de insulina IV a subcutánea?", o: ["Parar la IV y poner la basal a la vez", "Basal SC y mantener la perfusión IV 1–2 h más", "Esperar 24 h de perfusión", "Solo insulina rápida SC"], c: 1, e: "Sin solape quedan horas sin insulina eficaz y la CAD rebota." },
    { q: "Ritmo de descenso recomendado para evitar el edema cerebral:", o: ["Glucosa −150 mg/dL/h", "Glucosa −50 a −70 mg/dL/h y osmolaridad ≤ 3 mOsm/kg/h", "Lo más rápido posible", "Glucosa −10 mg/dL/h"], c: 1, e: "El descenso brusco de la osmolaridad desplaza agua hacia la neurona, sobre todo en jóvenes y en el EHH." },
    { q: "Na⁺ 138, Cl⁻ 100, HCO₃⁻ 10. ¿Brecha aniónica?", o: ["18", "28", "38", "8"], c: 1, e: "138 − (100 + 10) = 28 mEq/L: muy elevada, por la acumulación de cetoácidos." }
  ],
  atls: [
    { q: "En la revisión primaria ATLS, la «A» incluye:", o: ["Solo la vía aérea", "Vía aérea con restricción del movimiento de la columna cervical", "Analgesia", "Auscultación pulmonar"], c: 1, e: "Se asegura la vía aérea protegiendo la columna cervical hasta descartar lesión." },
    { q: "Según ATLS, el shock hemorrágico clase III corresponde a una pérdida aproximada de:", o: ["< 15 %", "15–30 %", "31–40 %", "> 40 %"], c: 2, e: "Clase III: 31–40 % de la volemia, con taquicardia, hipotensión y alteración del estado mental. Suele necesitar sangre." },
    { q: "¿Cuál es la pauta de ácido tranexámico en el trauma con hemorragia significativa?", o: ["1 g IV en 10 min dentro de las primeras 3 h, y 1 g en 8 h", "2 g IV en bolo a cualquier hora", "1 g solo si han pasado más de 6 h", "500 mg oral"], c: 0, e: "El beneficio es mayor cuanto antes; pasadas 3 h no se recomienda iniciarlo." },
    { q: "¿Qué valor de Glasgow es indicación clásica de vía aérea definitiva?", o: ["≤ 13", "≤ 11", "≤ 8", "≤ 5"], c: 2, e: "GCS ≤ 8 sugiere incapacidad para proteger la vía aérea." },
    { q: "Abre los ojos al dolor, emite sonidos incomprensibles y localiza el dolor. ¿Glasgow?", o: ["7", "8", "9", "10"], c: 2, e: "Ocular 2 + verbal 2 + motor 5 = 9." },
    { q: "¿Qué ventanas incluye el FAST clásico?", o: ["Pericárdica, hepatorrenal, esplenorrenal y pélvica", "Solo la pericárdica", "Tiroidea y pericárdica", "Aórtica y renal"], c: 0, e: "El eFAST añade las ventanas pleurales para neumotórax y hemotórax." },
    { q: "Tras un bolo inicial, la tensión mejora y luego vuelve a caer (respuesta transitoria). ¿Qué indica?", o: ["Shock neurogénico", "Hemorragia en curso: sangre y control de la hemorragia", "Exceso de fluidos", "Shock resuelto"], c: 1, e: "La respuesta transitoria indica sangrado activo: activa el protocolo de transfusión masiva y busca el foco." },
    { q: "Al colocar el drenaje por un hemotórax, ¿qué débito indica valorar una toracotomía?", o: ["300 mL iniciales", "≥ 1500 mL inmediatos o ≥ 200 mL/h durante 2–4 h", "500 mL en 24 h", "Cualquier débito hemático"], c: 1, e: "Hemotórax masivo: ≥ 1500 mL al drenar o pérdida mantenida de ≥ 200 mL/h." }
  ],
  gaso: [
    { q: "pH 7,25 · PaCO₂ 25 · HCO₃⁻ 11. ¿Cómo está la compensación?", o: ["Adecuada: Winter predice 24,5 ± 2", "Hay acidosis respiratoria asociada", "Hay alcalosis respiratoria asociada", "No se puede saber sin el anion gap"], c: 0, e: "PaCO₂ esperada = 1,5 × 11 + 8 = 24,5 ± 2 (22,5–26,5). Medida 25: trastorno simple compensado." },
    { q: "Fórmula de Winter para la acidosis metabólica:", o: ["PaCO₂ = HCO₃⁻ × 0,7 + 20", "PaCO₂ = 1,5 × HCO₃⁻ + 8 ± 2", "HCO₃⁻ = 24 + 0,4 × ΔPaCO₂", "PaCO₂ = 40 − HCO₃⁻"], c: 1, e: "Atajo práctico: PaCO₂ ≈ HCO₃⁻ + 15. Si la medida se sale del rango, hay un segundo trastorno respiratorio." },
    { q: "Na⁺ 140 · Cl⁻ 104 · HCO₃⁻ 12. El anion gap es:", o: ["12, normal", "24, elevado", "36, elevado", "8, bajo"], c: 1, e: "AG = 140 − (104 + 12) = 24. Elevado: ácidos no medidos (lactato, cetoácidos, tóxicos, uremia)." },
    { q: "AG 12 con albúmina 2 g/dl. ¿Qué haces?", o: ["Nada: es normal", "Corregirlo: 12 + 2,5 × (4 − 2) = 17, elevado", "Restar 5 al AG", "Usar el AG urinario"], c: 1, e: "La hipoalbuminemia baja falsamente el AG y puede esconder una acidosis láctica (cirrosis, sepsis, desnutrición)." },
    { q: "Acidosis con AG elevado y delta gap de +10. Significa:", o: ["Acidosis pura", "Alcalosis metabólica asociada", "Acidosis hiperclorémica asociada", "Error de laboratorio"], c: 1, e: "ΔG = (AG − 12) − (24 − HCO₃⁻). Si es > +6, el HCO₃⁻ está más alto de lo esperado: vómitos, diuréticos, SNG." },
    { q: "Acidosis respiratoria crónica: por cada 10 mmHg que sube la PaCO₂, el HCO₃⁻ sube:", o: ["1 mEq/l", "2 mEq/l", "4 mEq/l", "10 mEq/l"], c: 2, e: "Aguda: 1 por cada 10 (solo tampones). Crónica, tras 2–5 días de adaptación renal: 4 por cada 10." },
    { q: "Hipoxemia con gradiente A-a normal. La causa más probable es:", o: ["Shunt", "Alteración V/Q", "Hipoventilación (o FiO₂ baja)", "Trastorno de difusión"], c: 2, e: "El pulmón intercambia bien: la PaO₂ baja la explica la PaCO₂ alta. Piensa en opioides, benzodiacepinas o enfermedad neuromuscular." },
    { q: "Diabético con 5 días de vómitos: pH 7,40 · PaCO₂ 40 · HCO₃⁻ 24 · AG 28. ¿Qué tiene?", o: ["Nada: gasometría normal", "Acidosis con AG elevado + alcalosis metabólica que se anulan", "Alcalosis respiratoria crónica", "Error del gasómetro"], c: 1, e: "Un pH normal no descarta trastornos. El AG de 28 destapa la cetoacidosis; los vómitos han subido el HCO₃⁻ y lo «normalizan»." },
    { q: "¿Qué mecanismo de hipoxemia NO mejora al subir la FiO₂?", o: ["Hipoventilación", "Alteración V/Q", "Shunt", "Difusión"], c: 2, e: "La sangre del shunt no pasa por alvéolos ventilados: más O₂ inspirado apenas la toca." },
    { q: "Intoxicación por salicilatos. Patrón gasométrico típico del adulto:", o: ["Alcalosis metabólica pura", "Acidosis metabólica con AG elevado + alcalosis respiratoria", "Acidosis respiratoria aguda", "Acidosis hiperclorémica"], c: 1, e: "El salicilato estimula directamente el centro respiratorio: la PaCO₂ queda por debajo de lo que predice Winter." },
    { q: "Alcalosis metabólica con Cl⁻ urinario de 6 mEq/l. Orienta a:", o: ["Hiperaldosteronismo primario", "Vómitos o SNG: salinosensible", "Síndrome de Bartter", "Diurético en plena acción"], c: 1, e: "Cl⁻ urinario < 10: depleción de volumen y cloro; responde a suero salino. > 20: causas salinorresistentes (mineralocorticoides, Bartter, diurético activo)." }
  ],
  ecg: [
    { q: "ST↑ en II, III y aVF con el ST de III mayor que el de II. Arteria más probable:", o: ["Circunfleja", "Coronaria derecha", "DA proximal", "Tronco común"], c: 1, e: "ST III > II orienta a coronaria derecha. Si II ≥ III y hay ST↑ en I, aVL o V5–V6, piensa en circunfleja." },
    { q: "En todo IAM inferior debes registrar además:", o: ["Solo V1–V6", "V4R (y V3R) y V7–V9", "Tira de ritmo en DII", "aVR repetido"], c: 1, e: "V4R detecta la extensión al VD (ST↑ ≥ 1 mm) y V7–V9 la afectación posterior." },
    { q: "IAM inferior con hipotensión, ingurgitación yugular y pulmones limpios. ¿Qué evitas?", o: ["Volumen IV", "Nitratos y diuréticos", "Reperfusión", "Monitorización"], c: 1, e: "Infarto de VD: el ventrículo depende de la precarga. Nitratos, diuréticos (y con precaución mórficos) pueden hundir la presión. Volumen y reperfusión." },
    { q: "Descenso del ST en V1–V3 con R alta y T positiva en V1–V2. Sospechas:", o: ["SCASEST anterior", "IAMCEST posterior: confirma con V7–V9", "Bloqueo de rama derecha", "Hipertrofia del VD"], c: 1, e: "Es la imagen en espejo de la pared posterior. ST↑ ≥ 0,5 mm en V7–V9 lo confirma y cambia la indicación: es un IAMCEST." },
    { q: "Descenso del ST en 6 o más derivaciones con elevación en aVR orienta a:", o: ["Pericarditis", "Isquemia subendocárdica difusa: tronco común o 3 vasos", "Repolarización precoz", "IAM lateral alto"], c: 1, e: "Paciente de muy alto riesgo: coronariografía inmediata si está inestable." },
    { q: "Taquicardia regular de QRS estrecho a 150 lpm justos. Debes sospechar:", o: ["Taquicardia sinusal", "Flutter auricular 2:1", "Fibrilación auricular", "TV"], c: 1, e: "Ondas F a 300/min con conducción 2:1. Maniobras vagales o adenosina frenan el nodo y desenmascaran los dientes de sierra." },
    { q: "Fibrilación auricular preexcitada (WPW), estable. ¿Qué NO debes dar?", o: ["Procainamida", "Cardioversión eléctrica", "Adenosina, β-bloqueantes, calcioantagonistas o digoxina", "Anticoagulación según riesgo"], c: 2, e: "Frenar el nodo AV deja toda la conducción a la vía accesoria y puede precipitar FV." },
    { q: "PR constante y, de pronto, una P bloqueada, con QRS ancho. Es:", o: ["Mobitz I benigno", "Mobitz II: infranodal, riesgo de BAV completo", "BAV de 1.er grado", "Extrasístole auricular bloqueada"], c: 1, e: "Bloqueo en el His o en las ramas. Marcapasos transcutáneo preparado e indicación de marcapasos definitivo." },
    { q: "Alargamiento progresivo del PR hasta una P no conducida:", o: ["Mobitz II", "Wenckebach (Mobitz I)", "BAV completo", "Flutter 4:1"], c: 1, e: "Fatiga progresiva del nodo AV: nivel nodal, habitualmente benigno (IAM inferior, vagotonía)." },
    { q: "Taquicardia de QRS ancho regular, PA 82/50 y mareo. Primera medida:", o: ["Amiodarona en 20 minutos", "Cardioversión eléctrica sincronizada", "Adenosina", "Desfibrilación no sincronizada"], c: 1, e: "TV con pulso e inestable: cardioversión sincronizada. Si estuviera estable, amiodarona o procainamida." },
    { q: "rsR′ en V1–V2 con S ancha en I y V6 y QRS ≥ 0,12 s:", o: ["Bloqueo de rama izquierda", "Bloqueo de rama derecha", "Preexcitación", "Hiperpotasemia"], c: 1, e: "La R′ de V1 es la activación tardía del VD. Si es nuevo, piensa en TEP, IAM anterior o cardiopatía." },
    { q: "Pseudo-r′ en V1 y pseudo-S en II, III y aVF durante una taquicardia regular estrecha:", o: ["Flutter", "TRIN: P retrógrada pegada al QRS", "Taquicardia auricular", "TV fascicular"], c: 1, e: "Reentrada intranodal: maniobras vagales (Valsalva modificada) y, si no cede, adenosina en bolo rápido." }
  ],
  rcp: [
    { q: "¿A qué frecuencia deben hacerse las compresiones torácicas en el adulto?", o: ["60–80/min", "80–100/min", "100–120/min", "> 140/min"], c: 2, e: "100–120 por minuto, con descompresión completa entre compresiones." },
    { q: "¿Qué profundidad de compresión se recomienda en el adulto?", o: ["2–3 cm", "4 cm", "5–6 cm", "> 8 cm"], c: 2, e: "Al menos 5 cm sin superar los 6 cm." },
    { q: "Sin vía aérea avanzada, ¿cuál es la relación compresiones:ventilaciones?", o: ["15:2", "30:2", "30:1", "5:1"], c: 1, e: "30:2. Con vía aérea avanzada: compresiones continuas y unas 10 ventilaciones por minuto." },
    { q: "En FV/TVSP, ¿cuándo se administra la primera adrenalina?", o: ["Antes de la primera descarga", "Tras la tercera descarga", "Tras la primera descarga", "Solo si hay asistolia"], c: 1, e: "Adrenalina 1 mg tras la 3.ª descarga y después cada 3–5 minutos." },
    { q: "Dosis de amiodarona en la FV/TVSP refractaria:", o: ["150 mg tras la 1.ª descarga", "300 mg tras la 3.ª descarga; 150 mg tras la 5.ª", "300 mg cada 3–5 min", "No está indicada"], c: 1, e: "300 mg tras la 3.ª descarga y 150 mg adicionales tras la 5.ª." },
    { q: "Asistolia o AESP. ¿Cuándo das la adrenalina?", o: ["Tras 3 ciclos de RCP", "Lo antes posible, en cuanto haya acceso IV/IO", "Nunca en la AESP", "Solo tras intubar"], c: 1, e: "En los ritmos no desfibrilables la adrenalina se administra cuanto antes." },
    { q: "¿Cuál de estas NO es una de las 4 T de causas reversibles?", o: ["Neumotórax a tensión", "Taponamiento cardiaco", "Taquicardia sinusal", "Tóxicos"], c: 2, e: "Las 4 T son trombosis (coronaria o pulmonar), neumotórax a tensión, taponamiento y tóxicos." },
    { q: "Durante la RCP, un aumento brusco y mantenido del ETCO2 sugiere:", o: ["Intubación esofágica", "Recuperación de la circulación espontánea", "Hiperventilación", "Fallo del capnógrafo"], c: 1, e: "El ETCO2 refleja el flujo pulmonar: si sube bruscamente, comprueba ritmo y pulso." },
    { q: "¿Cómo deben ser las pausas para la descarga?", o: ["Las que haga falta", "Lo más cortas posible: pausa pre-descarga de menos de 5 segundos", "Un minuto para analizar", "Pausar 10 s tras cada descarga para ver el ritmo"], c: 1, e: "Carga el desfibrilador durante las compresiones y reanuda inmediatamente tras la descarga." }
  ],
  vmni: [
    { q: "Subir la EPAP mejora sobre todo:", o: ["La eliminación de CO2", "La oxigenación, al reclutar alveolos y aumentar la CRF", "La frecuencia respiratoria", "La fuga"], c: 1, e: "La EPAP (PEEP) recluta y mantiene abiertos los alveolos. Además, compensa la auto-PEEP en el EPOC." },
    { q: "La diferencia IPAP − EPAP es:", o: ["La PEEP", "La presión de soporte, que determina el volumen corriente y el lavado de CO2", "La presión meseta", "El trigger"], c: 1, e: "Más soporte significa más volumen corriente y más ventilación alveolar: baja la PaCO2." },
    { q: "Indicación clásica de VMNI en el EPOC agudizado:", o: ["pH < 7,35 y PaCO2 > 45 mmHg (acidosis respiratoria)", "SpO2 < 95 % con pH normal", "Cualquier disnea", "pH > 7,45"], c: 0, e: "La acidosis respiratoria hipercápnica es la indicación con mayor evidencia." },
    { q: "Edema agudo de pulmón cardiogénico con trabajo respiratorio. ¿Qué soporte tiene evidencia sólida?", o: ["Oxígeno a bajo flujo solamente", "Presión positiva: CPAP (o BiPAP)", "Ventilación con alto volumen", "Ninguno"], c: 1, e: "La presión positiva reduce la precarga y la poscarga del VI y mejora la oxigenación." },
    { q: "¿Cuál es una contraindicación de la VMNI?", o: ["Hipercapnia", "Incapacidad para proteger la vía aérea o bajo nivel de conciencia no hipercápnico", "Taquipnea", "EPOC"], c: 1, e: "También lo son la parada respiratoria, los vómitos incoercibles, la inestabilidad grave y el trauma facial que impida el sellado." },
    { q: "Ves esfuerzos ineficaces en la curva de flujo. ¿Qué revisas primero?", o: ["El trigger", "La fuga", "El ciclado", "La sedación"], c: 1, e: "Por orden: fuga → trigger → ciclado/soporte → auto-PEEP → agotamiento." },
    { q: "EPOC con ciclado tardío: espira contra el ventilador. ¿Qué ajustas?", o: ["Bajar el criterio de ciclado (p. ej. al 10 %)", "Subir el criterio de ciclado (p. ej. 40–60 % del pico de flujo) o acortar el Ti máximo", "Subir la EPAP a 15", "Aumentar la frecuencia de respaldo"], c: 1, e: "Ciclar antes adapta la inspiración a la constante de tiempo del EPOC y evita el atrapamiento." },
    { q: "¿Cuándo se reevalúa la respuesta a la VMNI con gasometría?", o: ["A las 24 h", "A la 1–2 h; sin mejoría, valora la intubación", "Nunca, basta la SpO2", "A los 5 min"], c: 1, e: "Si a las 1–2 h no mejoran el pH y el trabajo respiratorio, no retrases la intubación si está indicada." }
  ]
};
