/* =====================================================================
   MUNDO EMERGENCIA · datos de capítulos, misiones y preguntas
   Para añadir un capítulo nuevo: copia un bloque de CAPITULOS y añade
   sus preguntas en PREGUNTAS con la misma clave (id).
   ===================================================================== */

const VMNI = "../"; // los módulos de VMNI viven en la raíz de este repositorio

const CAPITULOS = [
  {
    id: "phtls", n: 1, titulo: "La calle", sub: "Trauma prehospitalario · PHTLS",
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
      { id: "atls", nombre: "Taller ATLS interactivo", url: "modulos/atls.html", desc: "Revisión primaria y secundaria, shock, casos y test." }
    ],
    misiones: [
      { id: "atls_open", txt: "Entra en el taller ATLS", xp: 50, auto: s => s.visit("atls") },
      { id: "atls_cap", txt: "Completa al menos 3 capítulos del taller", xp: 100, auto: s => s.count("atls_ch") >= 3 },
      { id: "atls_caso", txt: "Resuelve un caso clínico", xp: 100, auto: s => s.count("atls_cs") >= 1 },
      { id: "atls_test", txt: "Saca 70 % o más en el test del taller", xp: 150, auto: s => s.num("atls_qz") >= 70 },
      { id: "atls_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("atls") >= 1 }
    ],
    insignia: { id: "golden", nombre: "Hora de oro", icono: "⏱️", txt: "Examen ATLS superado" }
  },
  {
    id: "rcp", n: 4, titulo: "Parada", sub: "Soporte vital avanzado · ERC 2025",
    color: "#38bdf8", icono: "⚡",
    historia: "Mientras lo trasladas a TAC, el monitor cambia: fibrilación ventricular. Compresiones, descarga, adrenalina, causas reversibles. Cada segundo sin compresiones cuenta.",
    modulos: [
      { id: "rcp", nombre: "Simulador PCR · Algoritmo SVA", url: "modulos/rcp.html", desc: "Escenarios de parada con monitor, cronómetro y evaluación." }
    ],
    misiones: [
      { id: "rcp_open", txt: "Entra en el simulador de PCR", xp: 50, auto: s => s.visit("rcp") },
      { id: "rcp_caso", txt: "Termina un escenario completo", xp: 100, auto: s => s.list("pcr_hist").length >= 1 },
      { id: "rcp_rosc", txt: "Consigue una recuperación de la circulación (RCE)", xp: 150, auto: s => s.list("pcr_hist").some(h => h.rosc) },
      { id: "rcp_80", txt: "Obtén 80 puntos o más en un escenario", xp: 150, auto: s => s.list("pcr_hist").some(h => +h.sc >= 80) },
      { id: "rcp_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("rcp") >= 1 }
    ],
    insignia: { id: "rosc", nombre: "RCE", icono: "💓", txt: "Examen de SVA superado" }
  },
  {
    id: "vmni", n: 5, titulo: "Respira", sub: "Ventilación mecánica no invasiva",
    color: "#34d399", icono: "🫁",
    historia: "Recuperado, pero ahora es otro paciente el que te necesita: EPOC agudizado, pH 7,26, tirando de accesorios. Ajusta la máscara, el EPAP, el soporte… y lee las curvas antes de que se agote.",
    modulos: [
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
      { id: "vmni_exam", txt: "Supera el examen del capítulo", xp: 0, auto: s => s.stars("vmni") >= 1 }
    ],
    insignia: { id: "sincronia", nombre: "Sincronía", icono: "〰️", txt: "Examen de VMNI superado" }
  },
  {
    id: "turno", n: 6, titulo: "Fin de guardia", sub: "Sala de descanso · TurnoValor",
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
