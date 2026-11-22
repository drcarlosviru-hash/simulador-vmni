/* =====================================================================
   ESCENARIO · Insuficiencia respiratoria aguda (IRA)
   Dos casos con la misma presentación: el alumno debe razonar cuál es.
     - eap : edema agudo de pulmón cardiogénico hipertensivo (SCAPE)
     - epoc: EPOC agudizado con insuficiencia respiratoria hipercápnica
   Modelo fisiológico EXPLÍCITO y simplificado (docente, no validado):
     edema (0–1), obstrucción (0–1) y fatiga (0–1) determinan el trabajo
     respiratorio, la ventilación alveolar (→ PaCO₂) y el shunt (→ PaO₂).
     PaO₂ = PAO₂ · (1 − shunt)^1.2 ;  PAO₂ = FiO₂·713 − PaCO₂/0,8
     SpO₂ por la ecuación de Severinghaus ; pH por Henderson-Hasselbalch.
   ===================================================================== */
"use strict";
(function(){
const cl = (x, a, b) => Math.max(a, Math.min(b, x));
const sev = po2 => 100 / (1 + 23400 / (Math.pow(Math.max(po2, 1), 3) + 150 * Math.max(po2, 1)));
// efecto de un fármaco en el tiempo: rampa hasta el pico, meseta y caída
const pO2deSat = (sat, techo) => { if (sat >= 99.6) return Math.min(techo, 160); let lo = 10, hi = 160; for (let i = 0; i < 30; i++){ const m = (lo + hi) / 2; if (sev(m) < sat) lo = m; else hi = m; } return (lo + hi) / 2; };
const curva = (dt, on, pk, pl, off) => dt < on ? 0 : dt < pk ? (dt - on) / (pk - on) : dt < pl ? 1 : dt < off ? 1 - (dt - pl) / (off - pl) : 0;

const CASOS = {
  eap: {
    nombre: "Edema agudo de pulmón hipertensivo", dx: "eap",
    s0: { edema: .76, obst: .12, fatiga: .25, paco2: 46, hco3: 21, sbpB: 146, hrB: 98, temp: 36.7, sudor: 1, sbp: 165, spo2: 82 },
    resp: {
      inicio: "Esta… madrugada… me despertó… el ahogo… no puedo… tumbarme.",
      antec: "Hipertensión… un infarto… hace tres años… me dijeron… que el corazón… bombea poco.",
      medic: "Enalapril… bisoprolol… y furosemida… pero la dejé… la semana pasada.",
      dolor: "Una opresión… pequeña… en el pecho… desde que me ahogo.",
      fiebre: "Fiebre no… escupo… espuma… rosada.",
      tabaco: "Lo dejé… hace diez años.",
      alerg: "No… ninguna.",
      ortop: "Duermo… con tres almohadas… desde hace días."
    }
  },
  epoc: {
    nombre: "EPOC agudizado hipercápnico", dx: "epoc",
    s0: { edema: .05, obst: .74, fatiga: .38, paco2: 72, hco3: 31, sbpB: 128, hrB: 96, temp: 37.9, sudor: .6, sbp: 150, spo2: 82 },
    resp: {
      inicio: "Tres días… con más tos… y más flemas… cada vez… me ahogo más.",
      antec: "EPOC… desde hace años… uso oxígeno… en casa… por la noche.",
      medic: "Tiotropio… el inhalador… de rescate… lo uso… cada hora.",
      dolor: "No… dolor no.",
      fiebre: "Algo de fiebre… las flemas… son verdes.",
      tabaco: "Fumo… un paquete… desde los veinte.",
      alerg: "No… que yo sepa.",
      ortop: "Duermo… sentado… en el sillón… siempre."
    }
  }
};

const ESC = {
  id: "ira",
  titulo: "Insuficiencia respiratoria aguda",
  presentacion: "Varón de 68 años traído por su hija a urgencias por dificultad respiratoria. Está sentado al borde de la camilla, sudoroso, y responde con frases cortas. Ya está monitorizado y tiene una vía periférica.",
  duracionMax: 90,
  casos: CASOS,
  caseIds: ["eap", "epoc"],

  preguntas: [
    { id: "inicio", txt: "¿Desde cuándo y cómo empezó?" },
    { id: "antec", txt: "¿Qué enfermedades tiene?" },
    { id: "medic", txt: "¿Qué medicación toma?" },
    { id: "dolor", txt: "¿Tiene dolor en el pecho?" },
    { id: "fiebre", txt: "¿Fiebre, tos o expectoración?" },
    { id: "ortop", txt: "¿Puede dormir tumbado?" },
    { id: "tabaco", txt: "¿Fuma?" },
    { id: "alerg", txt: "¿Alergias a medicamentos?" }
  ],

  exploraciones: [
    { id: "insp", txt: "Inspección general", ico: "👁️" },
    { id: "ausp", txt: "Auscultación pulmonar", ico: "🫁", audio: "pulmon" },
    { id: "ausc", txt: "Auscultación cardiaca", ico: "❤️", audio: "corazon" },
    { id: "iy", txt: "Presión venosa yugular", ico: "🔎" },
    { id: "edem", txt: "Edemas en miembros inferiores", ico: "🦵" },
    { id: "neuro", txt: "Nivel de conciencia (GCS)", ico: "🧠" },
    { id: "ta", txt: "Tomar la tensión ahora", ico: "🩺" }
  ],

  pruebas: [
    { id: "gaso", txt: "Gasometría arterial", demora: 5 },
    { id: "ecg", txt: "ECG de 12 derivaciones", demora: 2 },
    { id: "eco", txt: "Ecografía pulmonar a pie de cama", demora: 3 },
    { id: "rx", txt: "Radiografía de tórax portátil", demora: 20 },
    { id: "bnp", txt: "NT-proBNP", demora: 40 },
    { id: "trop", txt: "Troponina", demora: 45 },
    { id: "lab", txt: "Hemograma y bioquímica", demora: 40 }
  ],

  tratamientos: [
    { grupo: "Posición y oxígeno", items: [
      { id: "pos", txt: "Incorporar a 45–90°", desc: "Sentado, piernas colgando" },
      { id: "o2_gn", txt: "Gafas nasales 2 L/min", desc: "FiO₂ ≈ 0,28", o2: .28 },
      { id: "o2_vm28", txt: "Ventimask 28 %", desc: "FiO₂ 0,28 controlada", o2: .28 },
      { id: "o2_vm35", txt: "Ventimask 35 %", desc: "FiO₂ 0,35", o2: .35 },
      { id: "o2_vm50", txt: "Ventimask 50 %", desc: "FiO₂ 0,50", o2: .5 },
      { id: "o2_res", txt: "Mascarilla con reservorio 15 L", desc: "FiO₂ ≈ 0,8", o2: .8 },
      { id: "o2_off", txt: "Retirar oxígeno", desc: "Aire ambiente", o2: .21 }
    ]},
    { grupo: "Ventilación no invasiva", items: [
      { id: "niv", txt: "Iniciar VMNI…", desc: "Abre el ventilador: CPAP o BiPAP", dispositivo: "niv" },
      { id: "iot", txt: "Intubación orotraquial", desc: "Secuencia rápida y ventilación mecánica" }
    ]},
    { grupo: "Fármacos", items: [
      { id: "ntg_sl", txt: "Nitroglicerina 0,4 mg SL", desc: "Inicio 1–3 min · repetir c/5 min" },
      { id: "ntg_iv", txt: "Nitroglicerina IV en perfusión", desc: "Titular según PAS", dispositivo: "ntg" },
      { id: "furo", txt: "Furosemida 40 mg IV", desc: "Diurético de asa" },
      { id: "neb", txt: "Salbutamol 5 mg + ipratropio 0,5 mg neb", desc: "Repetible c/20–30 min" },
      { id: "cort", txt: "Metilprednisolona 40 mg IV", desc: "Corticoide sistémico" },
      { id: "abx", txt: "Antibiótico (amoxicilina-clavulánico IV)", desc: "Si esputo purulento" },
      { id: "morf", txt: "Morfina 3 mg IV", desc: "Ansiolisis / venodilatación" },
      { id: "suero", txt: "Suero fisiológico 500 mL", desc: "Expansión de volumen" }
    ]}
  ],

  diagnosticos: [
    { id: "eap", txt: "Edema agudo de pulmón cardiogénico" },
    { id: "epoc", txt: "EPOC agudizado hipercápnico" },
    { id: "neumo", txt: "Neumonía adquirida en la comunidad" },
    { id: "tep", txt: "Tromboembolismo pulmonar" },
    { id: "ptx", txt: "Neumotórax" },
    { id: "asma", txt: "Crisis asmática" }
  ],
  destinos: [
    { id: "uci", txt: "UCI" },
    { id: "semi", txt: "Semicríticos / UCRI" },
    { id: "planta", txt: "Planta de hospitalización" },
    { id: "alta", txt: "Alta a domicilio" }
  ],

  /* ---------------- estado inicial ---------------- */
  init(caso){
    const c = CASOS[caso];
    return Object.assign({ caso, fio2: .21, niv: false, cpap: false, ipap: 0, epap: 0, nivFio2: .5, iot: false, pos: false,
      ntgIv: 0, ntgSl: [], furo: [], neb: [], cort: null, abx: null, morf: [], suero: [], hipox: 0, arrest: false, t: 0 }, JSON.parse(JSON.stringify(c.s0)));
  },

  /* ---------------- fisiología: avanza dtm minutos ---------------- */
  step(S, dtm){
    const t = S.t, eap = S.caso === "eap";
    // efectos farmacológicos actuales
    const sl = S.ntgSl.reduce((a, x) => a + curva(t - x, 1, 3, 8, 15), 0);
    const ntg = Math.min(1.4, S.ntgIv * .45 + sl * .5) * (S.sbp > 90 ? 1 : .3);
    const furo = S.furo.reduce((a, x) => a + curva(t - x, 10, 30, 90, 150), 0);
    const neb = S.neb.reduce((a, x) => a + curva(t - x, 3, 15, 40, 80), 0);
    const cort = S.cort != null ? cl((t - S.cort - 60) / 240, 0, 1) : 0;
    const morf = S.morf.reduce((a, x) => a + curva(t - x, 2, 8, 30, 60), 0);
    const suero = S.suero.reduce((a, x) => a + curva(t - x, 0, 15, 999, 9999), 0);
    const peep = S.iot ? 8 : S.niv ? S.epap : 0;
    const ps = S.iot ? 14 : S.niv && !S.cpap ? Math.max(0, S.ipap - S.epap) : 0;
    S._ef = { ntg, furo, neb, morf, cort };

    // edema pulmonar (en el EAP lo alimenta la poscarga elevada)
    const poscarga = Math.max(0, (S.sbp - 135) / 100);
    let dE = (eap ? poscarga * .02 : 0) + suero * .03 - ntg * .013 - furo * .01 - (peep ? Math.min(peep, 10) / 10 * .009 * (eap ? 1 : .3) : 0) - (S.pos ? .003 : 0) - (morf * .002);
    if (!eap) dE = suero * .02 - furo * .003;
    S.edema = cl(S.edema + dE * dtm, eap ? .02 : .02, 1);
    // obstrucción bronquial
    let dO = (eap ? 0 : .0015) - neb * (eap ? .003 : .011) - cort * .004;
    S.obst = cl(S.obst + dO * dtm, eap ? .05 : .32, 1);
    const obstEf = cl(S.obst + (eap ? S.edema * .18 : 0), 0, 1);

    // trabajo respiratorio y fatiga
    const apoyo = S.iot ? .95 : S.niv ? (ps / 12) * .38 + Math.min(peep, 8) / 8 * (eap ? .22 : .12) : 0;
    let wob = cl(S.edema * .75 + obstEf * .85 + (S.paco2 > 60 ? .08 : 0) - apoyo - (S.pos ? .05 : 0), 0, 1);
    if (S.iot) wob = .05;
    S.wob = wob;
    S.fatiga = cl(S.fatiga + (wob - .46) * .015 * dtm - (S.niv || S.iot ? .004 * dtm : 0), 0, 1);

    // ventilación alveolar → PaCO₂
    let va = (1 - obstEf * .45) * (1 - S.fatiga * .7) + ps / 20 * .36 - morf * .08;
    if (S.iot) va = 1.05;
    let paTarget = eap ? 38 / Math.max(.25, va) * .85 : 50 / Math.pow(Math.max(.25, va), .75);
    const fio2 = S.iot ? .5 : S.niv ? S.nivFio2 : S.fio2;
    if (!eap && fio2 > .35 && !S.iot) paTarget += (fio2 - .32) * 45; // hipercapnia inducida por O₂
    S.paco2 = cl(S.paco2 + (cl(paTarget, 28, 140) - S.paco2) * (1 - Math.exp(-dtm / 12)), 25, 140);

    // oxigenación
    // shunt verdadero (no responde al O₂) + alteración V/Q (sí responde)
    let shunt = .05 + S.edema * .48 + obstEf * (eap ? .1 : 0) - (peep ? Math.min(peep, 12) / 12 * S.edema * .38 : 0);
    if (S.iot) shunt -= .08;
    shunt = cl(shunt, .03, .7);
    const vq = eap ? 0 : obstEf * .3;
    const pAO2 = (fio2 * 713 - S.paco2 / .8) * (1 - vq);
    const Hb = 14, cap = 1.34 * Hb;
    const Cc = cap * sev(pAO2) / 100 + .003 * pAO2, Cv = cap * .6;
    const Ca = (1 - shunt) * Cc + shunt * Cv;
    S.spo2 = cl(Ca / cap * 100, 40, 100);
    S.pao2 = pO2deSat(S.spo2, pAO2);
    S.fio2ef = fio2;

    // hemodinámica
    S.hr = cl(S.hrB + wob * 26 + (S.spo2 < 90 ? (90 - S.spo2) * .7 : 0) + neb * 9 + (S.temp - 37) * 6 - (S.iot ? 10 : 0), 40, 175);
    S.sbp = cl(S.sbpB + wob * 22 - ntg * 22 - peep * (eap ? 1.2 : 1.1) - morf * 8 + suero * 10 - (S.iot ? 15 : 0) - furo * 4, 60, 230);
    S.dbp = Math.round(S.sbp * .58);
    S.rr = S.iot ? 14 : cl(Math.round(13 + wob * 26 - (S.fatiga > .82 ? (S.fatiga - .82) * 60 : 0) - morf * 3), 6, 44);
    S.ph = 6.1 + Math.log10(S.hco3 / (.03 * S.paco2));
    S.etco2 = S.paco2 - 4 - obstEf * 12;
    S.gcs = S.iot ? 3 : cl(Math.round(15 - Math.max(0, S.paco2 - 65) / 7 - Math.max(0, 80 - S.spo2) / 4 - morf * (eap ? .5 : 1.5)), 3, 15);
    S.capnoForma = obstEf; // 0 = meseta cuadrada · 1 = «aleta de tiburón»
    S.sudor = cl(wob * 1.2, 0, 1);
    S.cianosis = cl((88 - S.spo2) / 18, 0, 1);

    // deterioro crítico
    S.hipox = S.spo2 < 70 ? S.hipox + dtm : Math.max(0, S.hipox - dtm);
    if (!S.iot && (S.hipox > 3 || S.ph < 7.05 || S.gcs <= 7)) S.periparo = (S.periparo || 0) + dtm; else S.periparo = 0;
    if (S.periparo > 4) S.arrest = true;
    S.t += dtm;
  },

  /* ---------------- acciones ---------------- */
  aplicar(S, id, p){
    const it = ESC.tratamientos.flatMap(g => g.items).find(x => x.id === id);
    if (it && it.o2 != null){ S.fio2 = it.o2; S.o2dev = id; if (S.niv) { S.niv = false; } return; }
    switch (id){
      case "pos": S.pos = true; break;
      case "niv": S.niv = true; S.cpap = p.modo === "CPAP"; S.epap = p.epap; S.ipap = p.modo === "CPAP" ? p.epap : p.ipap; S.nivFio2 = p.fio2; S.o2dev = "niv"; break;
      case "niv_off": S.niv = false; S.o2dev = null; S.fio2 = .28; break;
      case "iot": S.iot = true; S.niv = false; S.o2dev = "iot"; break;
      case "ntg_sl": S.ntgSl.push(S.t); break;
      case "ntg_iv": S.ntgIv = p.nivel; break;
      case "furo": S.furo.push(S.t); break;
      case "neb": S.neb.push(S.t); break;
      case "cort": if (S.cort == null) S.cort = S.t; break;
      case "abx": if (S.abx == null) S.abx = S.t; break;
      case "morf": S.morf.push(S.t); break;
      case "suero": S.suero.push(S.t); break;
    }
  },

  /* ---------------- respuestas, hallazgos y pruebas ---------------- */
  responder(S, q){
    const c = CASOS[S.caso];
    if (S.iot) return { quien: "Hija", txt: "Está sedado… ¿se pondrá bien?" };
    if (S.gcs <= 12) return { quien: "Hija", txt: q === "antec" ? (S.caso === "eap" ? "Es hipertenso, tuvo un infarto y le dijeron que tiene el corazón débil." : "Tiene EPOC, usa oxígeno por la noche y sigue fumando.") : "Ya casi no contesta… está muy dormido." };
    if (S.niv) return { quien: "Paciente", txt: "(Con la mascarilla) " + c.resp[q].split("…").slice(0, 2).join("…") + "…" };
    return { quien: "Paciente", txt: c.resp[q] };
  },
  fraseLibre(S){
    if (S.iot) return "";
    if (S.gcs <= 11) return "…";
    if (S.wob > .75) return "No… puedo… respirar…";
    if (S.wob > .5) return "Me cuesta… mucho…";
    if (S.wob > .3) return "Algo mejor… doctor.";
    return "Ya respiro mucho mejor, gracias.";
  },
  hallazgo(S, id){
    const eap = S.caso === "eap", e = S.edema, o = S.obst;
    switch (id){
      case "insp": return eap
        ? `${S.sudor > .5 ? "Sudoroso y pálido, " : ""}${S.wob > .5 ? "tiraje intercostal y supraclavicular, usa la musculatura accesoria" : "trabajo respiratorio leve"}. ${S.wob > .6 ? "Habla con palabras sueltas." : "Habla con frases."} Esputo espumoso${e > .5 ? " rosado" : ""}.`
        : `Tórax en tonel, respiración con labios fruncidos, ${S.wob > .5 ? "tiraje y uso de musculatura accesoria" : "trabajo respiratorio moderado"}. ${S.cianosis > .2 ? "Cianosis labial. " : ""}${S.gcs < 14 ? "Somnoliento, " : ""}flapping ${S.paco2 > 70 ? "presente" : "ausente"}.`;
      case "ausp": return eap
        ? (e > .55 ? "Crepitantes bilaterales hasta campos medios, con sibilancias espiratorias dispersas («asma cardial»)." : e > .25 ? "Crepitantes en ambas bases." : "Crepitantes finos en bases, mucho menos que al ingreso.")
        : (o > .5 ? "Murmullo vesicular muy disminuido, sibilancias espiratorias difusas, espiración muy alargada. Sin crepitantes." : "Sibilancias espiratorias aisladas; mejor entrada de aire.");
      case "ausc": return eap ? `Rítmico a ${Math.round(S.hr)} lpm, galope por tercer ruido (S3).` : `Tonos apagados, rítmicos a ${Math.round(S.hr)} lpm, sin soplos ni galope.`;
      case "iy": return eap ? "Ingurgitación yugular a 45° con reflujo hepatoyugular positivo." : "Sin ingurgitación yugular.";
      case "edem": return eap ? "Edemas con fóvea hasta los tobillos." : "Sin edemas.";
      case "neuro": return `Glasgow ${S.gcs}/15${S.gcs < 15 ? (S.paco2 > 65 ? " (somnolencia; ¿narcosis por CO₂?)" : " (bajo nivel de conciencia)") : " · orientado"}.`;
      case "ta": return `PA ${Math.round(S.sbp)}/${Math.round(S.dbp)} mmHg.`;
    }
  },
  audio(S, tipo){
    const eap = S.caso === "eap";
    if (tipo === "corazon") return { hr: S.hr, s3: eap };
    return { rr: S.rr, crepit: eap ? S.edema : 0, sibil: eap ? S.edema * .3 : S.obst, murmullo: eap ? 1 : 1 - S.obst * .6, espLarga: !eap };
  },
  prueba(S, id){
    const eap = S.caso === "eap", f = (x, d) => x.toFixed(d).replace(".", ",");
    switch (id){
      case "gaso": return { txt: `pH ${f(S.ph, 2)} · PaCO₂ ${Math.round(S.paco2)} · PaO₂ ${Math.round(S.pao2)} mmHg · HCO₃⁻ ${S.hco3} · láctico ${f(eap ? 1.8 + S.edema * 2 : 1.4, 1)} · FiO₂ ${f(S.fio2ef, 2)}`,
        alerta: S.ph < 7.35 || S.pao2 < 60, valores: { ph: S.ph, paco2: S.paco2, pao2: S.pao2 } };
      case "ecg": return { txt: eap ? `Taquicardia sinusal a ${Math.round(S.hr)} lpm, criterios de HVI, ondas Q en cara inferior antiguas. Sin elevación aguda del ST.` : `Taquicardia sinusal a ${Math.round(S.hr)} lpm, P pulmonale en II, eje derecho. Sin alteraciones agudas de la repolarización.` };
      case "eco": return { txt: eap ? "Patrón B bilateral (≥ 3 líneas B por campo en ambos hemitórax), pequeño derrame pleural bilateral. VCI dilatada sin colapso." : "Patrón A bilateral con deslizamiento pleural conservado. Sin líneas B ni consolidaciones. VCI de calibre normal." };
      case "rx": return { txt: eap ? "Cardiomegalia, redistribución vascular, edema alveolar bilateral perihiliar «en alas de mariposa», derrame pleural bilateral pequeño." : "Hiperinsuflación con aplanamiento diafragmático. Sin condensaciones, sin neumotórax, silueta cardiaca normal." };
      case "bnp": return { txt: eap ? "NT-proBNP 8.900 pg/mL (muy elevado)." : "NT-proBNP 310 pg/mL.", alerta: eap };
      case "trop": return { txt: eap ? "Troponina T ultrasensible 38 ng/L, estable en la segunda muestra (daño miocárdico por estrés, sin curva de IAM)." : "Troponina T ultrasensible 9 ng/L (normal)." };
      case "lab": return { txt: eap ? "Hb 13,1 g/dL · leucocitos 9.800 · creatinina 1,3 mg/dL · Na⁺ 136 · K⁺ 4,4 · PCR 6 mg/L." : "Hb 15,8 g/dL · leucocitos 15.200 (88 % N) · PCR 86 mg/L · creatinina 0,9 · Na⁺ 139 · K⁺ 4,1." };
    }
  },

  /* ---------------- modo tutor: pistas y comentarios ---------------- */
  pistas: [
    { id: "o2", cuando: (S, L) => S.t > 1.5 && !L.algo(["o2_gn","o2_vm28","o2_vm35","o2_vm50","o2_res","niv","iot"]), txt: "SpO₂ por debajo de 88 %: la hipoxemia es lo primero que mata. Pon oxígeno ya." },
    { id: "explora", cuando: (S, L) => S.t > 3 && !L.hecho("ausp"), txt: "Ausculta: los crepitantes o las sibilancias te orientan entre causa cardiaca y respiratoria." },
    { id: "gaso", cuando: (S, L) => S.t > 6 && !L.hecho("gaso"), txt: "Pide una gasometría: el pH y la PaCO₂ deciden la ventilación no invasiva." },
    { id: "ecoecg", cuando: (S, L) => S.t > 8 && !L.hecho("ecg"), txt: "El ECG precoz descarta un síndrome coronario como desencadenante." },
    { id: "ntg", cuando: (S, L) => S.caso === "eap" && S.t > 7 && S.sbp > 130 && !L.algo(["ntg_sl","ntg_iv"]) && L.algo(["ausp","eco","rx"]), txt: "Crepitantes, galope y PAS muy alta: en el edema hipertensivo los nitratos a dosis altas son la piedra angular." },
    { id: "nivEap", cuando: (S, L) => S.caso === "eap" && S.t > 9 && S.spo2 < 92 && !S.niv && !S.iot, txt: "Si persiste la hipoxemia con O₂, la CPAP/BiPAP con EPAP 8–10 recluta alveolos y reduce precarga y poscarga." },
    { id: "o2epoc", cuando: (S, L) => S.caso === "epoc" && S.fio2ef > .4 && !S.iot && S.t > 3, txt: "Paciente con EPOC: objetivo de SpO₂ 88–92 %. El exceso de oxígeno empeora la PaCO₂ (Haldane y alteración V/Q)." },
    { id: "neb", cuando: (S, L) => S.caso === "epoc" && S.t > 6 && !L.hecho("neb") && L.algo(["ausp"]), txt: "Sibilancias y espiración alargada: broncodilatadores nebulizados (β₂ + anticolinérgico), repetibles." },
    { id: "nivEpoc", cuando: (S, L) => S.caso === "epoc" && L.hecho("gaso") && S.ph < 7.35 && !S.niv && !S.iot && S.t > 12, txt: "Acidosis respiratoria (pH < 7,35, PaCO₂ > 45): indicación de BiPAP. Usa presión de soporte (IPAP − EPAP ≥ 8)." },
    { id: "cpapEpoc", cuando: (S, L) => S.caso === "epoc" && S.niv && S.cpap, txt: "La CPAP no aporta presión de soporte: en la hipercapnia necesitas BiPAP para lavar CO₂." },
    { id: "deterioro", cuando: (S, L) => S.gcs <= 9 && !S.iot, txt: "Glasgow ≤ 9 y empeorando: la VMNI está fracasando. Valora la intubación sin demora." },
    { id: "destino", cuando: (S, L) => S.t > 45 && !L.hecho("destino"), txt: "Decide el destino del paciente y tu diagnóstico principal en la pestaña «Decisión»." }
  ],
  comentario(S, id){
    const eap = S.caso === "eap";
    const C = {
      pos: "Sentado reduce el retorno venoso y mejora la mecánica diafragmática.",
      o2_res: eap ? "Bien para rescatar la hipoxemia, pero si no mejora pasa pronto a VMNI." : "⚠️ FiO₂ ≈ 0,8 en un EPOC hipercápnico: subirá la PaCO₂. Busca SpO₂ 88–92 %.",
      o2_vm28: eap ? "FiO₂ baja para este grado de hipoxemia." : "Oxígeno controlado: correcto en el EPOC hipercápnico.",
      ntg_sl: eap ? "Nitroglicerina: venodilatación a dosis bajas y vasodilatación arterial a dosis altas; reduce precarga y poscarga." : "⚠️ Sin datos de congestión, los nitratos solo bajan la tensión.",
      ntg_iv: eap ? "Perfusión de nitroglicerina: titula según PAS (mantener > 100 mmHg)." : "⚠️ No hay edema pulmonar: riesgo de hipotensión sin beneficio.",
      furo: eap ? "Furosemida: útil tras la vasodilatación, sobre todo si hay sobrecarga de volumen (dejó el diurético)." : "Sin sobrecarga de volumen, el diurético no aporta y puede deshidratar.",
      neb: eap ? "⚠️ El salbutamol en el edema cardiogénico aumenta la frecuencia cardiaca sin tratar la causa; las sibilancias son por el edema." : "Broncodilatadores: la base del tratamiento de la agudización. Repite cada 20–30 min si persiste el broncoespasmo.",
      cort: eap ? "No hay indicación de corticoides en el edema cardiogénico." : "Corticoide sistémico: acelera la recuperación y reduce el fracaso del tratamiento.",
      abx: eap ? "No hay datos de infección." : "Esputo purulento y aumento de la disnea: indicación de antibiótico.",
      morf: eap ? "⚠️ La morfina en el edema agudo se asocia a más ventilación mecánica y mortalidad: evítala de rutina." : "⛔ Depresor respiratorio en un paciente hipercápnico: puede precipitar la narcosis.",
      suero: "⛔ Volumen en un paciente con insuficiencia respiratoria" + (eap ? " por edema: empeora la congestión." : ": sin indicación."),
      iot: S.gcs <= 8 || S.periparo ? "Intubación indicada por fracaso respiratorio / bajo nivel de conciencia." : "La VMNI bien ajustada evita muchas intubaciones: ¿se probó antes?",
      gaso: S.ph < 7.35 && S.paco2 > 45 ? "Acidosis respiratoria (pH < 7,35 con PaCO₂ > 45): indicación de VMNI si no mejora rápido." + (S.hco3 > 28 ? " El HCO₃⁻ alto sugiere hipercapnia crónica de base." : "") : S.pao2 < 60 ? "Insuficiencia respiratoria hipoxémica (PaO₂ < 60)." : "Gasometría aceptable.",
      eco: eap ? "Patrón B bilateral: síndrome intersticial difuso, muy sugestivo de edema pulmonar cardiogénico." : "Patrón A con deslizamiento: descarta edema y neumotórax; orienta a EPOC/asma (o TEP si la clínica encaja).",
      rx: eap ? "Edema alveolar bilateral con cardiomegalia: insuficiencia cardiaca aguda." : "Hiperinsuflación sin condensación: compatible con agudización de EPOC.",
      bnp: eap ? "NT-proBNP muy elevado: apoya el origen cardiaco." : "NT-proBNP bajo: hace improbable la insuficiencia cardiaca.",
      ecg: eap ? "Sin elevación del ST: no hay SCACEST, pero la troponina seriada sigue siendo necesaria." : "Datos de sobrecarga derecha crónica, sin isquemia aguda."
    };
    return C[id] || "";
  },

  /* ---------------- rúbrica (evaluación objetiva) ---------------- */
  COMPETENCIAS: {
    val: "Valoración inicial ABCDE",
    dx: "Razonamiento diagnóstico",
    oxi: "Oxigenación y ventilación",
    far: "Tratamiento farmacológico",
    seg: "Seguridad del paciente",
    reev: "Reevaluación y destino"
  },
  recursos: {
    val: "Repasa la valoración ABCDE y la exploración dirigida en la disnea aguda.",
    dx: "Repasa la ecografía pulmonar (patrón B frente a patrón A) y el diagnóstico diferencial de la disnea.",
    oxi: "Repasa el capítulo «Respira»: indicaciones de la VMNI, CPAP frente a BiPAP y ajuste de EPAP e IPAP.",
    far: eapEpoc => "Repasa el tratamiento del edema hipertensivo (nitratos a dosis altas) y de la agudización de EPOC (broncodilatadores, corticoide y antibiótico).",
    seg: "Revisa los fármacos potencialmente dañinos en la insuficiencia respiratoria (morfina, sedantes, sueros, exceso de O₂ en el EPOC).",
    reev: "Repasa los criterios de fracaso de la VMNI y de ingreso en críticos."
  },
  rubrica(S, L){
    const eap = S.caso === "eap", t = id => L.primero(id), o2 = L.primeroDe(["o2_gn","o2_vm28","o2_vm35","o2_vm50","o2_res","niv","iot"]);
    const nivT = L.primero("niv"), nivReg = L.registro("niv");
    const nivOK = nivReg.find(r => eap ? r.p.epap >= 8 : (r.p.modo !== "CPAP" && r.p.ipap - r.p.epap >= 8));
    const dxSel = L.ultimo("dx"), dest = L.ultimo("destino");
    const spo2_20 = L.estadoEn(20), tiempoHiperO2 = L.minutosCon(s => s.fio2ef > .4 && !s.iot);
    const items = [
      ["val", "Inspección y valoración del trabajo respiratorio en ≤ 3 min", t("insp") != null && t("insp") <= 3, false],
      ["val", "Auscultación pulmonar en ≤ 5 min", t("ausp") != null && t("ausp") <= 5, true],
      ["val", "Valoración del nivel de conciencia", t("neuro") != null, false],
      ["dx", "Anamnesis dirigida (≥ 3 preguntas clave)", L.cuenta(["inicio","antec","medic","fiebre","ortop","dolor"]) >= 3, false],
      ["dx", "Gasometría en ≤ 10 min", t("gaso") != null && t("gaso") <= 10, true],
      ["dx", "ECG en ≤ 10 min", t("ecg") != null && t("ecg") <= 10, eap],
      ["dx", "Ecografía pulmonar o Rx para orientar la causa", L.algo(["eco","rx"]), false],
      ["dx", "Diagnóstico principal correcto", dxSel && dxSel.p.id === S.caso, true],
      ["oxi", "Oxígeno en ≤ 2 min", o2 != null && o2 <= 2, true],
      ...(eap ? [
        ["oxi", "VMNI (CPAP/BiPAP) con EPAP ≥ 8 en ≤ 15 min", nivOK && nivOK.t <= 15, true],
        ["oxi", "SpO₂ ≥ 92 % a los 20 min", spo2_20 && spo2_20.spo2 >= 92, false],
        ["far", "Nitratos en ≤ 10 min (PAS > 110)", L.primeroDe(["ntg_sl","ntg_iv"]) != null && L.primeroDe(["ntg_sl","ntg_iv"]) <= 10, true],
        ["far", "Nitroglicerina en perfusión titulada", t("ntg_iv") != null, false],
        ["far", "Diurético IV", t("furo") != null, false],
        ["seg", "Sin salbutamol innecesario", t("neb") == null, false],
        ["seg", "Sin morfina de rutina", t("morf") == null, false]
      ] : [
        ["oxi", "Oxígeno controlado: < 10 min con FiO₂ > 0,4", tiempoHiperO2 < 10, true],
        ["oxi", "BiPAP con presión de soporte ≥ 8 en ≤ 30 min (acidosis respiratoria)", nivOK && nivOK.t <= 30, true],
        ["oxi", "No usar CPAP sola en la hipercapnia", !nivReg.some(r => r.p.modo === "CPAP"), false],
        ["far", "Broncodilatadores nebulizados en ≤ 10 min", t("neb") != null && t("neb") <= 10, true],
        ["far", "Corticoide sistémico", t("cort") != null, false],
        ["far", "Antibiótico por esputo purulento", t("abx") != null, false],
        ["seg", "Sin sedantes ni opioides", t("morf") == null, true],
        ["seg", "Sin nitratos innecesarios", L.primeroDe(["ntg_sl","ntg_iv"]) == null, false]
      ]),
      ["seg", "Sin sueroterapia que empeore la congestión", t("suero") == null, eap],
      ["seg", "Sin parada cardiorrespiratoria", !S.arrest, true],
      ["seg", "Intubación solo si fracasa la VMNI o hay indicación", t("iot") == null || L.estadoEn(t("iot")).gcs <= 9 || (nivT != null && t("iot") - nivT >= 30), false],
      ["reev", "Gasometría de control ≥ 30 min tras iniciar la VMNI", nivT != null && L.registro("gaso").some(r => r.t >= nivT + 30), false],
      ["reev", "Paciente incorporado", t("pos") != null, false],
      ["reev", "Destino adecuado (UCI o semicríticos)", dest && (dest.p.id === "uci" || dest.p.id === "semi"), true]
    ];
    return items.map(([c, txt, ok, crit]) => ({ comp: c, txt, ok: !!ok, critico: crit }));
  }
};

(typeof window !== "undefined" ? window : globalThis).ESCENARIO = ESC;
if (typeof module !== "undefined") module.exports = ESC;
})();
