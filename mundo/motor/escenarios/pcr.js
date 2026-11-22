/* =====================================================================
   ESCENARIO · Parada cardiorrespiratoria intrahospitalaria (SVA · ERC 2025)
     - fv  : FV refractaria por SCACEST (ritmo desfibrilable)
     - aesp: AESP por hiperpotasemia en paciente en hemodiálisis (no desfibrilable)
   Modelo docente explícito:
     · «isquemia» (0–1) crece con el tiempo sin compresiones y con compresiones de mala calidad
       (fatiga del compresor si no hay relevo cada 2 min).
     · EtCO₂ durante la RCP refleja la calidad de las compresiones; sube bruscamente con la RCE.
     · FV: se revierte tras ≥ 4 descargas con amiodarona y fracción de compresiones ≥ 60 %
       (o tras 7 descargas); demasiada isquemia → asistolia.
     · AESP: la RCE exige calcio + adrenalina + ≥ 1,5 min de RCP tras el calcio.
   ===================================================================== */
"use strict";
(function(){
const cl = (x, a, b) => Math.max(a, Math.min(b, x));

const CASOS = {
  fv: { nombre: "FV refractaria por SCACEST inferior", dx: "sca", ritmo: "fv", hr: 0, k: 4.1,
    resp: {
      que: "Estaba en el box esperando el ECG por dolor en el pecho desde hace una hora. De repente se ha puesto rígido y se ha quedado inconsciente.",
      antec: "Fumador, hipertenso y con el colesterol alto. No tiene enfermedades del riñón.",
      medic: "Enalapril y atorvastatina.",
      hora: "Ahora mismo, hace menos de un minuto. Lo hemos visto caer: es una parada presenciada.",
      alerg: "Ninguna conocida."
    } },
  aesp: { nombre: "AESP por hiperpotasemia (hemodiálisis)", dx: "hiperk", ritmo: "aesp", hr: 38, k: 8.4,
    resp: {
      que: "Vino por debilidad en las piernas y mareo. Dice que el viernes no fue a diálisis. Se ha quedado inconsciente delante de mí.",
      antec: "Insuficiencia renal crónica en hemodiálisis (lunes, miércoles y viernes) por diabetes. Fístula en el brazo izquierdo.",
      medic: "Quelantes del fósforo, insulina y bisoprolol.",
      hora: "Ahora mismo; estaba hablando conmigo hace un minuto.",
      alerg: "Ninguna conocida."
    } }
};

const ESC = {
  id: "pcr",
  titulo: "Parada cardiorrespiratoria",
  presentacion: "Box de urgencias. La enfermera te llama: el paciente de la camilla 4 «no responde». Está monitorizado con tres electrodos. Tienes el carro de paradas y un desfibrilador manual al lado.",
  duracionMax: 35,
  velocidad: 1,
  finAlParar: false,
  desfibrilador: true,
  energias: [120, 150, 200, 360],
  casos: CASOS,
  caseIds: ["fv", "aesp"],
  rapidas: ["valorar", "rcp", "analizar", "relevo", "adr", "amio"],
  snapKeys: ["cpr", "pulso", "ritmo", "fcp", "sbpp"],
  grafica: [["etco2", "#facc15", 0, 50, "EtCO₂"], ["fcp", "#4ade80", 0, 160, "FC con pulso"], ["sbpp", "#e2e8f0", 0, 180, "PAS"]],
  franja: { key: "cpr", color: "#f97316" },

  preguntas: [
    { id: "que", txt: "¿Qué ha pasado?" },
    { id: "hora", txt: "¿Cuándo? ¿Alguien lo vio?" },
    { id: "antec", txt: "¿Qué antecedentes tiene?" },
    { id: "medic", txt: "¿Qué medicación toma?" },
    { id: "alerg", txt: "¿Alergias?" }
  ],
  exploraciones: [
    { id: "pupilas", txt: "Pupilas", ico: "👁️" },
    { id: "gluc", txt: "Glucemia capilar", ico: "🩸" },
    { id: "expans", txt: "Expansión torácica / ventilación", ico: "🫁" },
    { id: "ta", txt: "Tomar la tensión", ico: "🩺" }
  ],
  pruebas: [
    { id: "gaso", txt: "Gasometría venosa con iones", demora: 2 },
    { id: "eco", txt: "Ecografía clínica en la pausa", demora: .5 },
    { id: "ecg12", txt: "ECG de 12 derivaciones", demora: 1 }
  ],
  tratamientos: [
    { grupo: "Soporte vital", items: [
      { id: "valorar", txt: "Valorar: consciencia, respiración y pulso", corto: "Valorar", ico: "👁️", hallazgo: true, desc: "≤ 10 segundos" },
      { id: "pedir", txt: "Pedir ayuda y activar el equipo de RCP", ico: "📣", desc: "Desfibrilador y carro de paradas" },
      { id: "rcp", txt: "Iniciar compresiones torácicas", txtOff: "Detener compresiones", corto: "Compresiones", txtOn: "Comprimiendo…", ico: "🫀", toggle: "cpr", desc: "100–120/min · 5–6 cm" },
      { id: "relevo", txt: "Relevo del compresor", corto: "Relevo", ico: "🔁", desc: "Cada 2 min, en < 5 s", activo: S => S.cpr },
      { id: "analizar", txt: "Pausa: analizar ritmo y pulso", corto: "Analizar ritmo", ico: "📈", hallazgo: true, desc: "Pausa ≤ 10 s" }
    ]},
    { grupo: "Vía aérea y ventilación", items: [
      { id: "bvm", txt: "Bolsa-mascarilla con O₂ 15 L", ico: "🎈", desc: "30:2" },
      { id: "sga", txt: "Dispositivo supraglótico", ico: "🫁", desc: "Compresiones continuas + 10 vent/min" },
      { id: "iot", txt: "Intubación orotraquial", ico: "🫁", desc: "Pausa < 5 s · capnografía" }
    ]},
    { grupo: "Accesos", items: [
      { id: "via_iv", txt: "Canalizar vía IV periférica", ico: "💧", desc: "≈ 1,5 min" },
      { id: "via_io", txt: "Acceso intraóseo (tibia)", ico: "🦴", desc: "≈ 30 s" }
    ]},
    { grupo: "Fármacos", items: [
      { id: "adr", txt: "Adrenalina 1 mg IV/IO", corto: "Adrenalina 1 mg", ico: "💉", desc: "Cada 3–5 min" },
      { id: "amio", txt: "Amiodarona IV/IO (300 mg → 150 mg)", corto: "Amiodarona", ico: "💉", desc: "Tras la 3.ª y la 5.ª descarga" },
      { id: "calcio", txt: "Cloruro cálcico 10 % 10 mL IV", ico: "💉", desc: "Hiperpotasemia, hipocalcemia" },
      { id: "bic", txt: "Bicarbonato sódico 1 M 50 mL", ico: "💉", desc: "Hiperpotasemia, tóxicos" },
      { id: "ins", txt: "Insulina 10 U + glucosa 25 g IV", ico: "💉", desc: "Desplaza K⁺ a la célula" },
      { id: "sf", txt: "Suero fisiológico 500 mL en bolo", ico: "💧", desc: "Hipovolemia" }
    ]},
    { grupo: "Tras la recuperación de la circulación (RCE)", items: [
      { id: "o2tit", txt: "Titular O₂ para SpO₂ 94–98 %", ico: "🫧" },
      { id: "norad", txt: "Noradrenalina en perfusión", ico: "💉", desc: "Objetivo PAM ≥ 65 / PAS ≥ 100" },
      { id: "temp", txt: "Control de temperatura (evitar fiebre)", ico: "🌡️" },
      { id: "coro", txt: "Activar coronariografía urgente", ico: "❤️", desc: "Código infarto" },
      { id: "hd", txt: "Solicitar hemodiálisis urgente", ico: "🩸" },
      { id: "cesar", txt: "Finalizar la RCP (exitus)", ico: "⏹" }
    ]}
  ],
  diagnosticos: [
    { id: "sca", txt: "Trombosis coronaria (SCA)" },
    { id: "hiperk", txt: "Hiperpotasemia / trastorno metabólico" },
    { id: "hipox", txt: "Hipoxia" },
    { id: "hipovol", txt: "Hipovolemia" },
    { id: "ptx", txt: "Neumotórax a tensión" },
    { id: "tapo", txt: "Taponamiento cardiaco" },
    { id: "tep", txt: "Tromboembolismo pulmonar" },
    { id: "tox", txt: "Tóxicos" }
  ],
  destinos: [
    { id: "hemo", txt: "Sala de hemodinámica y después UCI" },
    { id: "hdu", txt: "Hemodiálisis urgente y UCI" },
    { id: "uci", txt: "UCI directamente" },
    { id: "planta", txt: "Planta de hospitalización" }
  ],

  init(caso){
    const c = CASOS[caso];
    return { caso, supino: true, arrestActivo: true, arrest: true, ritmo: c.ritmo, pulso: false, cpr: false, parches: false, cargado: false,
      via: null, viaPendT: null, viaTipo: null, viaT: null, viaAerea: null, iot: false,
      shocks: 0, descargas: [], adr: [], amio: [], calcio: [], bic: [], ins: [], sf: [],
      t: 0, cicloT: null, arrDur: 0, flow: 0, noFlow: 0, compT: 0, maxCompT: 0, relevos: 0, isq: .05, fvAmp: .45,
      pausaIni: null, pausas: [], reanuda: [], ultDescarga: null, reanudaPend: false, descInap: 0, descConRCP: 0, rcpConPulso: 0,
      rosc: false, roscT: null, hr: c.hr, sbp: 0, dbp: 0, spo2: 0, etco2: 0, rr: 0, temp: 36.4, gcs: 3, k: c.k, fio2: 1, ph: 7.1, paco2: 55,
      o2tit: false, norad: false, tempCtl: false, coro: false, hd: false, cesado: false, cianosis: .8, valorado: false };
  },

  step(S, dtm){
    const fv = S.caso === "fv";
    if (S.viaPendT != null && S.t >= S.viaPendT){ S.via = S.viaTipo; S.viaT = S.t; S.viaPendT = null; }
    const q = S.compT < 2 ? 1 : Math.max(.5, 1 - (S.compT - 2) * .22); // calidad: cae sin relevo
    S.calidad = q;
    if (S.arrestActivo && !S.pulso){
      S.arrDur += dtm;
      if (S.cpr){ S.flow += dtm; S.compT += dtm; S.maxCompT = Math.max(S.maxCompT, S.compT); S.isq = cl(S.isq + .012 * (1 - q) * dtm, 0, 1); }
      else { S.noFlow += dtm; if (S.flow > 0 || S.t > .25) S.isq = cl(S.isq + .09 * dtm, 0, 1); }
      S.fvAmp = cl(.45 * (1 - S.isq * .7), .08, .45);
      S.hr = S.ritmo === "aesp" ? Math.round(cl(38 - S.isq * 14, 20, 60)) : S.ritmo === "tv" ? 190 : 0;
      if (S.isq > .9 && (S.ritmo === "fv" || S.ritmo === "aesp")) S.ritmo = "asist";
      if (!fv && S.ritmo === "aesp" && !S.calcio.length && S.arrDur > 12) S.ritmo = "asist"; // sin tratar la causa
      // AESP por hiperpotasemia: RCE con calcio + adrenalina + RCP mantenida
      if (!fv && S.ritmo === "aesp" && S.calcio.length && S.adr.length && S.cpr && S.isq < .88){
        const tc = S.calcio[0];
        S.flowTrasCa = (S.flowTrasCa || 0) + (S.t >= tc ? dtm : 0);
        if (S.flowTrasCa >= 1.5){ S.ritmo = "sinus"; S.pulso = true; S.hr = 96; }
      }
      S.etco2 = S.viaAerea ? (S.cpr ? (8 + 12 * q) * (1 - S.isq * .45) : Math.max(3, (S.etco2 || 4) - 4 * dtm)) : 0;
      S.rr = S.viaAerea ? (S.viaAerea === "bvm" ? (S.cpr ? 6 : 0) : 10) : 0;
      S.sbp = 0; S.dbp = 0; S.spo2 = 0;
    } else {
      // con pulso (RCE, reconocida o no)
      if (S.arrestActivo && S.cpr) S.rcpOculta = (S.rcpOculta || 0) + dtm;
      const target = S.norad ? 112 : 84 + (S.sf.length ? 8 : 0);
      S.sbp = S.sbp ? S.sbp + (target - S.sbp) * (1 - Math.exp(-dtm / 4)) : 80;
      S.dbp = Math.round(S.sbp * .6);
      S.hr = Math.round(cl((S.hr || 100) + ((fv ? 102 : 94) - (S.hr || 100)) * (1 - Math.exp(-dtm / 3)), 50, 140));
      S.etco2 = S.cpr ? 42 : (S.viaAerea ? 36 : 0);
      S.rr = S.viaAerea === "iot" || S.viaAerea === "sga" ? 12 : S.viaAerea === "bvm" ? 10 : 6;
      const fio2 = S.o2tit ? .4 : S.viaAerea ? 1 : .21;
      S.spo2 = fio2 >= .9 ? 100 : fio2 >= .35 ? 96 : 89;
      S.fio2 = fio2;
      if (!S.tempCtl) S.temp = Math.min(38.2, S.temp + .045 * dtm); else S.temp += (36.4 - S.temp) * (1 - Math.exp(-dtm / 8));
      S.gcs = 4;
    }
    S.k = CASOS[S.caso].k - S.ins.length * .9 - S.bic.length * .3 - (S.hd ? 1 : 0);
    S.ph = S.pulso ? 7.22 : 7.08 - S.isq * .1 + S.bic.length * .05;
    S.paco2 = S.viaAerea ? 48 : 68;
    S.cianosis = S.pulso ? .1 : .8;
    S.fcp = S.pulso ? S.hr : 0; S.sbpp = S.pulso ? S.sbp : 0;
    S.arrest = !S.pulso;
    S.t += dtm;
  },

  aplicar(S, id, p){
    const fv = S.caso === "fv";
    const necesitaVia = ["adr", "amio", "calcio", "bic", "ins", "sf", "norad"];
    if (necesitaVia.includes(id) && !S.via) return { error: S.viaPendT != null ? "La vía todavía se está canalizando." : "Sin acceso vascular: canaliza una vía IV o IO." };
    switch (id){
      case "valorar": S.valorado = true; break;
      case "pedir": S.ayuda = true; break;
      case "rcp":
        if (!S.cpr){
          if (S.pulso && !S.arrestActivo) S.rcpConPulso++;
          S.cpr = true;
          if (S.pausaIni != null){ S.pausas.push(S.t - S.pausaIni); S.pausaIni = null; }
          if (S.reanudaPend){ S.reanuda.push(S.t - S.ultDescarga); S.reanudaPend = false; }
          if (S.cicloT == null) S.cicloT = S.t;
          S.compT = 0;
        } else { S.cpr = false; S.pausaIni = S.t; }
        break;
      case "relevo": if (!S.cpr) return { error: "No hay compresiones en curso." }; S.compT = 0; S.relevos++; break;
      case "analizar":
        if (S.cpr){ S.cpr = false; S.pausaIni = S.t; }
        S.analisis = (S.analisis || 0) + 1; S.cicloT = null;
        S.ultimoRitmoVisto = S.ritmo;
        if (S.pulso && S.arrestActivo){ S.arrestActivo = false; S.rosc = true; S.roscT = S.t; S.pausaIni = null; }
        break;
      case "parches": S.parches = true; break;
      case "descarga": {
        const desf = S.ritmo === "fv" || S.ritmo === "tv";
        if (S.cpr){ S.descConRCP++; S.cpr = false; }
        if (S.pausaIni == null) S.pausaIni = S.t;
        S.shocks++; S.ultDescarga = S.t; S.reanudaPend = true; S.descargas.push({ t: S.t, ritmo: S.ritmo, e: p.energia });
        if (!desf){
          S.descInap++;
          if (S.pulso){ S.ritmo = "fv"; S.pulso = false; S.arrestActivo = true; S.rosc = false; return { msg: "⛔ Descarga sobre un ritmo con pulso: ha desencadenado una FV.", tipo: "bad", siempre: true, ritmo: "sinus" }; }
          return { msg: "⛔ Ritmo no desfibrilable: la descarga no aporta y retrasa las compresiones.", tipo: "bad", ritmo: S.descargas[S.descargas.length - 1].ritmo };
        }
        const frac = S.flow / Math.max(.1, S.arrDur);
        if (S.isq < .9 && ((S.shocks >= 4 && S.amio.length >= 1 && frac >= .6) || S.shocks >= 7)){ S.ritmo = "sinus"; S.pulso = true; S.hr = 108; S.sbp = 0; }
        return { msg: "Descarga administrada: reanuda las compresiones de inmediato, sin comprobar el pulso.", tipo: "", ritmo: "fv" };
      }
      case "bvm": S.viaAerea = S.viaAerea || "bvm"; if (S.viaAerea !== "bvm") return { error: "Ya hay una vía aérea avanzada." }; break;
      case "sga": S.viaAerea = "sga"; break;
      case "iot": S.viaAerea = "iot"; S.iot = true; break;
      case "via_iv": if (S.via || S.viaPendT != null) return { error: "Ya hay un acceso vascular." }; S.viaPendT = S.t + 1.5; S.viaTipo = "iv"; break;
      case "via_io": if (S.via) return { error: "Ya hay un acceso vascular." }; S.viaPendT = S.t + .5; S.viaTipo = "io"; break;
      case "adr": S.adr.push(S.t); break;
      case "amio": if (S.amio.length >= 2) return { error: "Ya se han administrado 300 + 150 mg de amiodarona (dosis máxima en la PCR)." }; S.amio.push(S.t); break;
      case "calcio": S.calcio.push(S.t); break;
      case "bic": S.bic.push(S.t); break;
      case "ins": S.ins.push(S.t); break;
      case "sf": S.sf.push(S.t); break;
      case "o2tit": if (!S.pulso) return { error: "Primero hay que recuperar la circulación." }; S.o2tit = true; break;
      case "norad": if (!S.pulso) return { error: "La noradrenalina en perfusión es para la fase posresucitación." }; S.norad = true; break;
      case "temp": S.tempCtl = true; break;
      case "coro": S.coro = true; break;
      case "hd": S.hd = true; break;
      case "cesar": S.cesado = true; S.cpr = false; S.terminado = "Se finalizan las maniobras de reanimación."; break;
    }
  },

  responder(S, q){ return { quien: "Enfermera", txt: CASOS[S.caso].resp[q] }; },
  fraseLibre(S){ return S.pulso && !S.arrestActivo ? "" : ""; },
  nombreRitmo(S){
    const r = S.ritmo;
    return r === "fv" ? (S.fvAmp > .25 ? "Fibrilación ventricular gruesa" : "Fibrilación ventricular fina")
      : r === "tv" ? "Taquicardia ventricular monomorfa" : r === "asist" ? "Asistolia (comprueba conexiones y ganancia)"
      : r === "aesp" ? `Ritmo organizado de QRS ancho a ${S.hr} lpm` : `Ritmo sinusal a ${S.hr} lpm`;
  },
  hallazgo(S, id){
    switch (id){
      case "valorar": return S.pulso && !S.arrestActivo ? `Pulso carotídeo presente (${S.hr} lpm). Sin respuesta a la voz; extensión al dolor (GCS ${S.gcs}).` : S.pulso ? "Pulso palpable… vuelve a analizar el ritmo para confirmarlo." : "No responde, no respira con normalidad (respiración agónica) y no tiene pulso carotídeo: PARADA CARDIORRESPIRATORIA.";
      case "analizar": return `${ESC.nombreRitmo(S)} · ${S.pulso ? "pulso carotídeo PRESENTE → RCE" : "sin pulso"}.`;
      case "pupilas": return S.pulso ? "Pupilas medias, reactivas." : "Pupilas midriáticas, poco reactivas.";
      case "gluc": return `Glucemia capilar ${S.caso === "fv" ? 142 : 96 + S.ins.length * 40} mg/dL.`;
      case "expans": return S.viaAerea ? "Expansión torácica bilateral y simétrica con cada ventilación." + (S.viaAerea === "iot" ? " Capnografía con onda en cada ventilación: tubo en tráquea." : "") : "Sin ventilación: no hay expansión torácica.";
      case "ta": return S.pulso ? `PA ${Math.round(S.sbp)}/${Math.round(S.dbp)} mmHg.` : "No se palpa pulso: PA no medible.";
    }
    return "";
  },
  audio(){ return null; },
  prueba(S, id){
    const fv = S.caso === "fv", f = (x, d) => x.toFixed(d).replace(".", ",");
    switch (id){
      case "gaso": return { txt: `pH ${f(S.ph, 2)} · PCO₂ ${Math.round(S.paco2)} · HCO₃⁻ ${fv ? 16 : 13} · K⁺ ${f(S.k, 1)} mmol/L · Na⁺ ${fv ? 139 : 134} · Ca²⁺ ión. ${fv ? "1,15" : "0,98"} · láctico ${fv ? 7 : 6},${fv ? 8 : 1} mmol/L`, alerta: S.k >= 6.5 || S.ph < 7.2 };
      case "eco": return { txt: S.pulso ? "Contractilidad global moderadamente deprimida, sin derrame pericárdico." : fv ? "Movimiento fibrilatorio del miocardio, sin derrame pericárdico ni dilatación del VD." : "Contracciones débiles y lentas, sin derrame pericárdico, VD no dilatado, VCI dilatada (no hipovolemia)." };
      case "ecg12": return { txt: !S.pulso ? "Sin pulso: el ECG de 12 derivaciones no aporta; analiza el ritmo en el monitor." : fv ? "Ritmo sinusal a 102 lpm. Elevación del ST de 3 mm en II, III y aVF con descenso especular en I y aVL: SCACEST inferior." : `Ritmo sinusal a ${S.hr} lpm, QRS 120 ms, ondas T picudas.`, alerta: S.pulso };
    }
  },

  pistas: [
    { id: "val", cuando: (S, L) => S.t > .3 && !L.hecho("valorar"), txt: "Comprueba consciencia, respiración y pulso en ≤ 10 s." },
    { id: "rcp", cuando: (S, L) => L.hecho("valorar") && !S.cpr && !S.pulso && S.flow === 0 && S.t > .5, txt: "Sin pulso: empieza las compresiones YA (100–120/min, 5–6 cm, descompresión completa)." },
    { id: "parch", cuando: (S, L) => S.cpr && !S.parches && S.t > 1, txt: "Coloca los parches del desfibrilador sin detener las compresiones." },
    { id: "ayuda", cuando: (S, L) => S.t > 1.2 && !L.hecho("pedir"), txt: "Pide ayuda y activa al equipo de RCP: necesitas manos para comprimir, ventilar y preparar fármacos." },
    { id: "ciclo", cuando: (S, L) => S.cicloT != null && S.t - S.cicloT > 2.1 && S.arrestActivo, txt: "Han pasado 2 min: pausa breve (≤ 10 s) para analizar el ritmo y comprobar el pulso." },
    { id: "nada", cuando: (S, L) => S.arrestActivo && !S.cpr && S.pausaIni != null && S.t - S.pausaIni > .25, txt: "Llevas más de 15 s sin compresiones: cada segundo sin flujo empeora el pronóstico." },
    { id: "fvdesc", cuando: (S, L) => S.caso === "fv" && L.hecho("analizar") && S.shocks === 0 && S.t > 1, txt: "FV: ritmo desfibrilable. Carga (puedes hacerlo comprimiendo), «¡todos fuera!» y descarga." },
    { id: "relevo", cuando: (S, L) => S.cpr && S.compT > 2.3, txt: "Releva al compresor: tras 2 min la calidad cae (mira cómo baja el EtCO₂)." },
    { id: "via", cuando: (S, L) => S.t > 3 && !S.via && S.viaPendT == null, txt: "Canaliza un acceso IV o IO para los fármacos." },
    { id: "adr3", cuando: (S, L) => S.caso === "fv" && S.shocks >= 3 && !S.adr.length, txt: "Tras la 3.ª descarga: adrenalina 1 mg y amiodarona 300 mg." },
    { id: "adrAesp", cuando: (S, L) => S.caso === "aesp" && S.via && !S.adr.length, txt: "Ritmo no desfibrilable: adrenalina 1 mg cuanto antes." },
    { id: "hht", cuando: (S, L) => S.t > 5 && S.arrestActivo && !L.hecho("dx"), txt: "Repasa las causas reversibles (4H y 4T) y regístralas en «Decisión». ¿Qué te dicen los antecedentes y la gasometría?" },
    { id: "k", cuando: (S, L) => S.caso === "aesp" && S.t > 4 && !S.calcio.length, txt: "Paciente en hemodiálisis que faltó a su sesión, con QRS ancho: piensa en hiperpotasemia → calcio IV." },
    { id: "etco2", cuando: (S, L) => S.pulso && S.arrestActivo && S.cpr && S.viaAerea, txt: "El EtCO₂ ha subido bruscamente durante las compresiones: posible RCE. Analiza en la próxima pausa." },
    { id: "rce", cuando: (S, L) => S.rosc, txt: "RCE: ABCDE, ECG de 12 derivaciones, SpO₂ 94–98 %, PAS ≥ 100 y control de temperatura." },
    { id: "dest", cuando: (S, L) => S.rosc && S.t - S.roscT > 4 && !L.hecho("destino"), txt: "Decide la causa y el destino del paciente en la pestaña «Decisión» y finaliza." }
  ],
  comentario(S, id){
    const fv = S.caso === "fv", r = S.ultimoRitmoVisto;
    const C = {
      rcp: S.cpr ? "Compresiones de calidad: 100–120/min, 5–6 cm, descompresión completa y pausas mínimas." : (S.arrestActivo ? "⚠️ Sin compresiones no hay flujo coronario ni cerebral: reanúdalas cuanto antes." : ""),
      analizar: S.pulso ? "RCE: inicia los cuidados posresucitación." : r === "fv" || r === "tv" ? "Ritmo desfibrilable: carga, aparta a todos, descarga y reanuda compresiones de inmediato." : r === "asist" ? "Asistolia: adrenalina, compresiones y causas reversibles." : "Ritmo no desfibrilable: adrenalina 1 mg cuanto antes y busca la causa (4H y 4T). Reanuda compresiones.",
      descarga: "Reanuda las compresiones inmediatamente durante 2 min, sin comprobar el pulso.",
      adr: fv ? (S.shocks < 3 && !S.pulso ? "⚠️ En los ritmos desfibrilables la adrenalina se da tras la 3.ª descarga." : "Adrenalina 1 mg; repetir cada 3–5 min.") : "Correcto: en los ritmos no desfibrilables, adrenalina cuanto antes; repetir cada 3–5 min.",
      amio: fv ? (S.shocks < 3 ? "⚠️ La amiodarona se administra tras la 3.ª descarga." : "Amiodarona 300 mg; 150 mg más tras la 5.ª descarga.") : "⛔ La amiodarona no está indicada en un ritmo no desfibrilable.",
      calcio: fv ? "Sin sospecha de hiperpotasemia ni hipocalcemia: no indicado." : "Calcio IV: estabiliza la membrana del miocardio. Es la medida clave de esta parada.",
      bic: fv ? "El bicarbonato no se recomienda de rutina en la PCR." : "Bicarbonato: útil en la hiperpotasemia grave con acidosis.",
      ins: fv ? "Sin indicación en esta parada." : "Insulina + glucosa: desplaza el K⁺ al interior de la célula.",
      sf: "Volumen solo si sospechas hipovolemia.",
      bvm: "Bolsa-mascarilla con O₂ a 15 L: 30 compresiones por cada 2 ventilaciones.",
      sga: "Con dispositivo supraglótico: compresiones continuas y 10 ventilaciones por minuto.",
      iot: "Con tubo: compresiones continuas, 10 ventilaciones/min y capnografía continua.",
      relevo: "Relevo en < 5 s: mantiene la calidad.",
      o2tit: "Evita la hiperoxia y la hipoxemia: SpO₂ 94–98 %.",
      norad: "Objetivo PAM ≥ 65 (PAS ≥ 100) tras la RCE.",
      temp: "Previene la fiebre (> 37,7 °C) al menos 72 h en el paciente comatoso.",
      coro: fv ? "SCACEST tras la RCE: coronariografía urgente." : "Sin datos de síndrome coronario.",
      hd: fv ? "Sin indicación." : "La hemodiálisis es el tratamiento definitivo de la hiperpotasemia.",
      gaso: S.k >= 6.5 ? "K⁺ muy elevado: la hiperpotasemia explica la parada → calcio, bicarbonato, insulina-glucosa y diálisis." : "Acidosis mixta, esperable en la PCR.",
      ecg12: S.pulso && fv ? "SCACEST inferior: activa la coronariografía urgente." : "",
      eco: "La ecografía no debe alargar la pausa de compresiones (> 10 s)."
    };
    return C[id] || "";
  },

  COMPETENCIAS: { val: "Reconocimiento y alerta", rcp: "Calidad de la RCP", desf: "Desfibrilación", far: "Fármacos y accesos", va: "Vía aérea y ventilación", causa: "Causas reversibles (4H/4T)", rce: "Cuidados tras la RCE" },
  recursos: {
    val: "Reconocimiento de la PCR en ≤ 10 s y activación precoz del equipo.",
    rcp: "Calidad de la RCP: fracción de compresiones ≥ 80 %, pausas < 10 s y relevos cada 2 min. Repasa el capítulo «Parada».",
    desf: "Desfibrilación segura: cargar durante las compresiones, «¡todos fuera!», descargar y reanudar sin comprobar el pulso.",
    far: "Adrenalina (ritmos no desfibrilables cuanto antes; desfibrilables tras la 3.ª descarga) y amiodarona 300/150 mg.",
    va: "Vía aérea por pasos: bolsa-mascarilla 30:2 → dispositivo avanzado con compresiones continuas y capnografía.",
    causa: "Las 4H y 4T: integra antecedentes, gasometría y ecografía. Repasa el capítulo «Box vital» (hiperpotasemia).",
    rce: "Cuidados posresucitación: SpO₂ 94–98 %, PAM ≥ 65, ECG, coronariografía si SCACEST y prevención de la fiebre."
  },
  dispositivos(S){
    const d = [], mm = x => { const m = Math.floor(x), s = Math.floor((x - m) * 60); return m + ":" + String(s).padStart(2, "0"); };
    d.push(S.pulso && !S.arrestActivo ? "💚 <b>RCE</b> desde " + mm(S.roscT) : S.cpr ? `🫀 <b>RCP</b> · calidad ${Math.round(S.calidad * 100)} %` : "⛔ <b>Sin compresiones</b>");
    d.push(S.via ? `💧 Vía <b>${S.via.toUpperCase()}</b>` : S.viaPendT != null ? "💧 Canalizando vía…" : "💧 Sin acceso");
    d.push(S.viaAerea ? `🫁 <b>${{ bvm: "Bolsa-mascarilla", sga: "Supraglótico", iot: "Tubo" }[S.viaAerea]}</b>` : "🫁 Sin ventilación");
    d.push(`⚡ Descargas <b>${S.shocks}</b>`);
    if (S.adr.length) d.push(`💉 Adrenalina ×${S.adr.length} · última hace <b>${mm(S.t - S.adr[S.adr.length - 1])}</b>`);
    if (S.amio.length) d.push(`💉 Amiodarona <b>${S.amio.length === 1 ? "300" : "450"} mg</b>`);
    if (S.calcio.length) d.push(`💉 Calcio ×${S.calcio.length}`);
    if (S.norad) d.push("💉 Noradrenalina");
    return d;
  },
  resultado(S){ return S.rosc ? "RCE mantenida" : S.pulso ? "RCE no reconocida (seguías comprimiendo)" : S.cesado ? "RCP finalizada sin RCE" : "Sin RCE al terminar"; },
  snapVista(h){ return [["Ritmo", h.ritmo === "fv" ? "FV" : h.ritmo === "aesp" ? "AESP" : h.ritmo === "asist" ? "Asistolia" : "Sinusal"], ["Pulso", h.pulso ? "Sí" : "No"], ["RCP", h.cpr ? "Sí" : "No"], ["EtCO₂", Math.round(h.etco2 || 0)], ["FC", h.pulso ? Math.round(h.hr) : "—"], ["PAS", h.pulso ? Math.round(h.sbp) : "—"]]; },

  rubrica(S, L){
    const fv = S.caso === "fv", t = id => L.primero(id);
    const frac = S.flow / Math.max(.1, S.arrDur);
    const pausasLargas = S.pausas.filter(d => d > 10 / 60).length;
    const reanudaOK = S.reanuda.length ? S.reanuda.every(d => d <= 10 / 60) : S.shocks === 0;
    const t3 = S.descargas[2] ? S.descargas[2].t : null;
    const adr1 = S.adr[0] != null ? S.adr[0] : null;
    const intervalos = S.adr.slice(1).map((x, i) => x - S.adr[i]);
    const dxSel = L.ultimo("dx"), dest = L.ultimo("destino");
    const cargasCompr = L.registro("cargar").filter(r => /sin detener/.test(r.txt || "")).length;
    const items = [
      ["val", "Confirma la PCR (consciencia, respiración, pulso) en ≤ 30 s", t("valorar") != null && t("valorar") <= .5, true],
      ["val", "Pide ayuda y activa el equipo en ≤ 1 min", t("pedir") != null && t("pedir") <= 1, false],
      ["rcp", "Compresiones iniciadas en ≤ 1 min", t("rcp") != null && t("rcp") <= 1, true],
      ["rcp", `Fracción de compresiones ≥ 80 % (fue ${Math.round(frac * 100)} %)`, frac >= .8, true],
      ["rcp", `Ninguna pausa > 10 s (hubo ${pausasLargas})`, pausasLargas === 0 && S.flow > 0, false],
      ["rcp", "Relevo del compresor cada ~2 min (sin tramos > 3 min)", S.maxCompT <= 3 && S.flow > 0, false],
      ["desf", "Parches colocados en ≤ 2 min", t("parches") != null && t("parches") <= 2, false],
      ...(fv ? [
        ["desf", "Primera descarga en ≤ 3 min", S.descargas[0] && S.descargas[0].t <= 3, true],
        ["desf", "Carga durante las compresiones", cargasCompr > 0, false],
        ["desf", "Reanuda compresiones ≤ 10 s tras cada descarga", reanudaOK && S.shocks > 0, false]
      ] : [
        ["desf", "Sin descargas: ritmo no desfibrilable", S.shocks === 0, true]
      ]),
      ["desf", "Ninguna descarga inapropiada", S.descInap === 0, true],
      ["desf", "Seguridad: ninguna descarga con compresiones en curso", S.descConRCP === 0, true],
      ["far", "Acceso IV/IO", S.viaT != null, false],
      ...(fv ? [
        ["far", "Adrenalina 1 mg tras la 3.ª descarga", t3 != null && adr1 != null && adr1 >= t3 && adr1 <= t3 + 4, true],
        ["far", "Amiodarona 300 mg tras la 3.ª descarga", t3 != null && S.amio[0] != null && S.amio[0] >= t3 && S.amio[0] <= t3 + 4, true],
        ["far", "Sin adrenalina antes de la 3.ª descarga", !(adr1 != null && (t3 == null || adr1 < t3)), false]
      ] : [
        ["far", "Adrenalina en ≤ 3 min desde el acceso vascular", adr1 != null && S.viaT != null && adr1 - S.viaT <= 3, true],
        ["far", "Sin amiodarona (ritmo no desfibrilable)", !S.amio.length, false]
      ]),
      ["far", "Adrenalina repetida cada 3–5 min", intervalos.length ? intervalos.every(d => d >= 2.5 && d <= 6) : (S.rosc && (S.roscT - (adr1 || 0)) < 6), false],
      ["va", "Ventilación con bolsa-mascarilla o dispositivo avanzado", !!S.viaAerea, true],
      ["va", "Dispositivo avanzado (supraglótico o tubo) con capnografía", S.viaAerea === "sga" || S.viaAerea === "iot", false],
      ["causa", "Gasometría con iones durante la RCP", L.registro("gaso").some(r => S.roscT == null || r.t < S.roscT), !fv],
      ["causa", "Causa reversible correcta", dxSel && dxSel.p.id === CASOS[S.caso].dx, true],
      ...(fv ? [] : [
        ["causa", "Calcio IV por hiperpotasemia", S.calcio.length > 0, true],
        ["causa", "Bicarbonato y/o insulina-glucosa", S.bic.length + S.ins.length > 0, false]
      ]),
      ["rce", "Reconoce la RCE en un análisis de ritmo", S.rosc, true],
      ["rce", "Sin compresiones sobre un paciente con pulso tras reconocer la RCE", S.rcpConPulso === 0, false],
      ["rce", "ECG de 12 derivaciones tras la RCE", L.registro("ecg12").some(r => S.roscT != null && r.t >= S.roscT), false],
      ["rce", "Titula el O₂ para SpO₂ 94–98 %", S.o2tit, false],
      ["rce", "PAS ≥ 100 (noradrenalina si precisa)", S.norad || (S.pulso && S.sbp >= 100), false],
      ["rce", "Previene la fiebre (control de temperatura)", S.tempCtl, false],
      ...(fv ? [["rce", "Activa la coronariografía urgente", S.coro, true]] : [["rce", "Solicita hemodiálisis urgente", S.hd, true]]),
      ["rce", "Destino adecuado", dest && (fv ? dest.p.id === "hemo" : (dest.p.id === "hdu" || dest.p.id === "uci")), false]
    ];
    return items.map(([c, txt, ok, crit]) => ({ comp: c, txt, ok: !!ok, critico: crit }));
  }
};

(typeof window !== "undefined" ? window : globalThis).ESCENARIO = ESC;
if (typeof module !== "undefined") module.exports = ESC;
})();
