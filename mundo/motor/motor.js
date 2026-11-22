/* =====================================================================
   MOTOR DE PACIENTE VIRTUAL · Mundo Emergencia
   Reutilizable: carga cualquier escenario que cumpla el formato de
   escenarios/ira.js (init, step, aplicar, hallazgo, prueba, rubrica…).
   Separa: fisiología (escenario) · interfaz y evaluación (motor).
   ===================================================================== */
"use strict";
(function(){
const E = window.ESCENARIO;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const cl = (x, a, b) => Math.max(a, Math.min(b, x));
const f1 = x => (+x).toFixed(1).replace(".", ",");
const mmss = t => { const m = Math.floor(t), s = Math.floor((t - m) * 60); return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"); };
const lerpC = (a, b, k) => { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join(""); };

/* ---------------- estado global ---------------- */
let S = null, MODO = "tutor", CASO = null, speed = 10, running = false, muted = true;
let LOG = [], HIST = [], PEND = [], hintsShown = {}, lastNibp = -99, nibp = null, tab = "exp", ended = false;
const ALL_TX = E.tratamientos.flatMap(g => g.items);

/* ---------------- registro de acciones (API usada por las rúbricas) ---------------- */
const L = {
  hecho: id => LOG.some(r => r.id === id),
  primero: id => { const r = LOG.find(r => r.id === id); return r ? r.t : null; },
  primeroDe: ids => { const r = LOG.find(r => ids.includes(r.id)); return r ? r.t : null; },
  algo: ids => LOG.some(r => ids.includes(r.id)),
  cuenta: ids => new Set(LOG.filter(r => ids.includes(r.id)).map(r => r.id)).size,
  registro: id => LOG.filter(r => r.id === id),
  ultimo: id => { const a = LOG.filter(r => r.id === id); return a[a.length - 1] || null; },
  estadoEn: t => { if (t == null) return null; let best = HIST[0]; for (const h of HIST){ if (h.t <= t + .01) best = h; else break; } return best; },
  minutosCon: fn => HIST.reduce((a, h, i) => a + (i && fn(h) ? h.t - HIST[i - 1].t : 0), 0)
};
function logA(id, cat, p, txt){
  LOG.push({ t: +S.t.toFixed(2), id, cat, p: p || {}, txt });
  const el = document.createElement("div"); el.innerHTML = `<span>${mmss(S.t)}</span> ${esc(txt)}`;
  $("#log").prepend(el);
}

/* ---------------- arranque ---------------- */
function startModal(){
  let modo = "tutor", caso = "rnd";
  const draw = () => {
    $("#modal").innerHTML = `<h2>🩺 ${esc(E.titulo)}</h2>
      <p style="color:var(--mut);margin-bottom:12px">${esc(E.presentacion)}</p>
      <div class="sec">Modo</div>
      <div class="pick">
        <button data-m="tutor" class="${modo === "tutor" ? "on" : ""}"><b>🎓 Tutor</b><small>Pistas en tiempo real y comentario de cada decisión. Para aprender.</small></button>
        <button data-m="examen" class="${modo === "examen" ? "on" : ""}"><b>📝 Examen</b><small>Sin ayudas. Evaluación por rúbrica al final: acciones críticas, errores y tiempos.</small></button>
      </div>
      <div class="sec">Paciente</div>
      <div class="pick" style="grid-template-columns:repeat(3,1fr)">
        <button data-c="rnd" class="${caso === "rnd" ? "on" : ""}"><b>🎲 Desconocido</b><small>Aleatorio. Tendrás que averiguar qué le pasa.</small></button>
        ${E.caseIds.map((c, i) => `<button data-c="${c}" class="${caso === c ? "on" : ""}"><b>Caso ${i + 1}</b><small>Misma presentación, causa fija.</small></button>`).join("")}
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn pri" id="go">Entrar en el box ▶</button></div>
      <p style="color:var(--mut);font-size:12px;margin-top:12px">Simulación docente con un modelo fisiológico simplificado y explícito. No sustituye a las guías clínicas ni al juicio clínico.</p>`;
    document.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { modo = b.dataset.m; draw(); });
    document.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { caso = b.dataset.c; draw(); });
    $("#go").onclick = () => { closeModal(); start(modo, caso === "rnd" ? E.caseIds[Math.floor(Math.random() * E.caseIds.length)] : caso, caso === "rnd"); };
  };
  openModal(); draw();
}
function start(modo, caso){
  MODO = modo; CASO = caso; ended = false;
  S = E.init(caso); E.step(S, 1e-4);
  LOG = []; HIST = []; PEND = []; hintsShown = {}; nibp = null; lastNibp = -99;
  $("#log").innerHTML = ""; $("#res").innerHTML = `<div class="r" style="color:var(--mut)">Sin resultados todavía.</div>`; $("#hints").innerHTML = "";
  $("#tit").textContent = E.titulo;
  $("#modo").textContent = modo === "tutor" ? "🎓 Modo tutor" : "📝 Modo examen"; $("#modo").className = "chip " + modo;
  $("#casoChip").textContent = "Paciente desconocido";
  speed = E.velocidad || 10; document.querySelectorAll("#spd button").forEach(x => x.classList.toggle("on", +x.dataset.s === speed));
  lastSnap = 0; lastHint = 0; lastSay = 0;
  cargando = false; dfE = (E.energias || [150])[1] || 150; snapshot(); measureNibp(); renderQs(); renderActs(); renderDevs(); renderQuick(); renderDefib(); renderPatient(true);
  say("Paciente", E.fraseLibre(S));
  running = true;
}

/* ---------------- bucle de simulación ---------------- */
let acc = 0, lastReal = performance.now();
setInterval(() => {
  const now = performance.now(), dtReal = Math.min(.5, (now - lastReal) / 1000); lastReal = now;
  if (!running || !S || ended || $("#ov").classList.contains("on")) return;
  let dtm = dtReal * speed / 60;
  while (dtm > 0){ const d = Math.min(dtm, .05); E.step(S, d); dtm -= d; tickSim(); if (ended) break; }
}, 100);
let lastSnap = 0, lastHint = 0, lastSay = 0;
function tickSim(){
  if (S.t - lastSnap >= .5){ snapshot(); lastSnap = S.t; }
  if (S.t - lastNibp >= 5) measureNibp();
  PEND.filter(p => S.t >= p.listo && !p.done).forEach(p => { p.done = true; showResult(p); });
  if (MODO === "tutor" && S.t - lastHint >= .25){ lastHint = S.t; checkHints(); }
  if (S.t - lastSay > 4){ lastSay = S.t; if (!speaking) say(S.iot ? "" : "Paciente", E.fraseLibre(S)); }
  $("#clk").textContent = mmss(S.t);
  if (S.arrest && !ended && E.finAlParar !== false){ hint("bad", "⛔ Parada cardiorrespiratoria por insuficiencia respiratoria no resuelta."); setTimeout(finish, 1500); ended = true; }
  if (S.terminado && !ended){ ended = true; hint("warn", S.terminado); setTimeout(finish, 1200); }
  if (S.t >= E.duracionMax && !ended){ ended = true; hint("warn", "⏱️ Fin del tiempo del escenario."); setTimeout(finish, 800); }
  renderDevs(); renderQuick(); renderDefib(); renderPatient(false);
}
function snapshot(){ const h = { t: +S.t.toFixed(2), spo2: S.spo2, hr: S.hr, rr: S.rr, sbp: S.sbp, dbp: S.dbp, etco2: S.etco2, gcs: S.gcs, ph: S.ph, paco2: S.paco2, fio2ef: S.fio2ef, niv: S.niv, iot: S.iot }; (E.snapKeys || []).forEach(k => h[k] = S[k]); HIST.push(h); }
function measureNibp(){ lastNibp = S.t; nibp = { s: Math.round(S.sbp), d: Math.round(S.dbp), t: S.t }; }

/* ---------------- habla del paciente ---------------- */
let speaking = false, spTimer = null;
function say(quien, txt){
  if (!txt){ $("#bub").innerHTML = `<span style="color:#64748b">${S && S.iot ? "(Intubado y sedado)" : "…"}</span>`; return; }
  $("#bub").innerHTML = `<b>${esc(quien)}:</b> ${esc(txt)}`;
  speaking = true; clearTimeout(spTimer); spTimer = setTimeout(() => speaking = false, 3500);
}
function renderQs(){
  $("#qs").innerHTML = E.preguntas.map(q => `<button class="q ${L.hecho(q.id) ? "done" : ""}" data-q="${q.id}">💬 ${esc(q.txt)}</button>`).join("");
  document.querySelectorAll("[data-q]").forEach(b => b.onclick = () => {
    const q = E.preguntas.find(x => x.id === b.dataset.q), r = E.responder(S, q.id);
    logA(q.id, "preg", {}, "Pregunta: " + q.txt); say(r.quien, r.txt); b.classList.add("done"); lastSay = S.t;
  });
}

/* ---------------- acciones ---------------- */
document.querySelectorAll("#tabs .tab").forEach(t => t.onclick = () => { tab = t.dataset.t; document.querySelectorAll("#tabs .tab").forEach(x => x.classList.toggle("on", x === t)); renderActs(); });
function renderActs(){
  let h = "";
  if (tab === "exp") h = E.exploraciones.map(x => `<button class="act" data-x="${x.id}"><span class="i">${x.ico}</span><div><b>${esc(x.txt)}</b><small>${x.audio ? "Incluye sonido" : "Hallazgo inmediato"}</small></div>${L.hecho(x.id) ? `<span class="tag">✓ ${L.registro(x.id).length}</span>` : ""}</button>`).join("");
  if (tab === "pru") h = E.pruebas.map(x => { const pend = PEND.find(p => p.id === x.id && !p.done); return `<button class="act" data-p="${x.id}" ${pend ? "disabled" : ""}><span class="i">🧪</span><div><b>${esc(x.txt)}</b><small>Resultado en ${x.demora} min</small></div><span class="tag">${pend ? "⏳ " + Math.max(0, Math.ceil(pend.listo - S.t)) + " min" : L.hecho(x.id) ? "✓" : ""}</span></button>`; }).join("");
  if (tab === "tra") h = E.tratamientos.map(g => `<div class="grp">${esc(g.grupo)}</div>` + g.items.map(x => { const n = L.registro(x.id).length; const act = (x.o2 != null && S.o2dev === x.id) || (x.id === "niv" && S.niv) || (x.id === "pos" && S.pos) || (x.id === "iot" && S.iot) || (x.toggle && S[x.toggle]); return `<button class="act" data-tx="${x.id}" ${(x.id === "iot" && S.iot) || (x.id === "pos" && S.pos) ? "disabled" : ""}><span class="i">${x.ico || (x.o2 != null ? "🫧" : x.id === "niv" ? "😷" : x.id === "iot" ? "🫁" : x.id === "pos" ? "🛏️" : "💉")}</span><div><b>${esc(x.txt)}</b><small>${esc(x.desc || "")}</small></div><span class="tag">${act ? "● activo" : n ? "×" + n : ""}</span></button>`; }).join("")).join("");
  if (tab === "dec"){
    const dx = L.ultimo("dx"), de = L.ultimo("destino");
    h = `<div class="grp">Diagnóstico principal</div>` + E.diagnosticos.map(d => `<button class="act" data-dx="${d.id}" style="${dx && dx.p.id === d.id ? "border-color:#38bdf8;background:#0f2a40" : ""}"><span class="i">${dx && dx.p.id === d.id ? "🔵" : "⚪"}</span><div><b>${esc(d.txt)}</b></div></button>`).join("")
      + `<div class="grp">Destino del paciente</div>` + E.destinos.map(d => `<button class="act" data-de="${d.id}" style="${de && de.p.id === d.id ? "border-color:#38bdf8;background:#0f2a40" : ""}"><span class="i">${de && de.p.id === d.id ? "🔵" : "⚪"}</span><div><b>${esc(d.txt)}</b></div></button>`).join("")
      + `<button class="btn pri" style="margin-top:10px;justify-content:center" id="fin2">Finalizar y ver el debriefing</button>`;
  }
  $("#acts").innerHTML = h;
  $("#acts").querySelectorAll("[data-x]").forEach(b => b.onclick = () => explorar(b.dataset.x));
  $("#acts").querySelectorAll("[data-p]").forEach(b => b.onclick = () => pedir(b.dataset.p));
  $("#acts").querySelectorAll("[data-tx]").forEach(b => b.onclick = () => tratar(b.dataset.tx));
  $("#acts").querySelectorAll("[data-dx]").forEach(b => b.onclick = () => { const d = E.diagnosticos.find(x => x.id === b.dataset.dx); logA("dx", "dec", { id: d.id }, "Diagnóstico: " + d.txt); renderActs(); });
  $("#acts").querySelectorAll("[data-de]").forEach(b => b.onclick = () => { const d = E.destinos.find(x => x.id === b.dataset.de); logA("destino", "dec", { id: d.id }, "Destino: " + d.txt); renderActs(); });
  const f2 = $("#fin2"); if (f2) f2.onclick = () => confirmFinish();
}
function addRes(html, cls){
  const box = $("#res"); if (box.firstElementChild && box.firstElementChild.style.color) box.innerHTML = "";
  const el = document.createElement("div"); el.className = "r " + (cls || ""); el.innerHTML = html; box.prepend(el); return el;
}
function explorar(id){
  const x = E.exploraciones.find(e => e.id === id), txt = E.hallazgo(S, id);
  logA(id, "exp", {}, x.txt);
  if (id === "ta") measureNibp();
  const snapAudio = x.audio ? E.audio(S, x.audio) : null;
  const el = addRes(`<div class="h"><span>${x.ico} ${esc(x.txt)}</span><span>${mmss(S.t)}</span></div>${esc(txt)}${snapAudio ? `<div style="margin-top:6px"><button class="btn" data-play>🔊 Escuchar</button></div>` : ""}`);
  if (snapAudio){ const b = el.querySelector("[data-play]"); b.onclick = () => (x.audio === "corazon" ? playHeart : playLung)(snapAudio); }
  renderActs();
}
function pedir(id){
  const x = E.pruebas.find(e => e.id === id);
  const r = E.prueba(S, id); // resultado del momento de la extracción
  const p = { id, nombre: x.txt, t: S.t, listo: S.t + x.demora, r, done: false };
  PEND.push(p); logA(id, "pru", {}, "Solicita: " + x.txt);
  p.el = addRes(`<div class="h"><span>🧪 ${esc(x.txt)}</span><span>${mmss(S.t)}</span></div>⏳ Pendiente (${x.demora} min)…`, "pend");
  renderActs();
}
function showResult(p){
  p.el.className = "r" + (p.r.alerta ? " alert" : "");
  const tip = MODO === "tutor" ? E.comentario(S, p.id) : "";
  p.el.innerHTML = `<div class="h"><span>🧪 ${esc(p.nombre)}</span><span>extraída ${mmss(p.t)}</span></div>${esc(p.r.txt)}${tip ? `<div class="tip">💡 ${esc(tip)}</div>` : ""}`;
  $("#res").prepend(p.el);
  hint("", `🧪 Resultado disponible: ${p.nombre}`, true);
  renderActs();
}
function tratar(id){
  const x = ALL_TX.find(t => t.id === id);
  if (x.dispositivo === "niv" || id === "niv") return nivModal();
  if (x.dispositivo === "ntg" || id === "ntg_iv") return ntgModal();
  if (x.dispositivo === "defib") return defibModal();
  if (id === "iot") return iotModal();
  const r = E.aplicar(S, id, {});
  if (r && r.error){ hint("warn", "⚠️ " + r.error); return; }
  const txt = x.toggle ? (S[x.toggle] ? x.txt : (x.txtOff || x.txt + " (detener)")) : x.txt;
  logA(x.toggle && !S[x.toggle] ? id + "_off" : id, "tra", {}, txt);
  if (x.hallazgo){ const h = E.hallazgo(S, id); addRes(`<div class="h"><span>🔎 ${esc(x.txt)}</span><span>${mmss(S.t)}</span></div>${esc(h)}`); }
  afterTx(id);
}
function renderQuick(){
  if (!E.rapidas){ return; }
  const items = E.rapidas.map(id => ALL_TX.find(t => t.id === id)).filter(Boolean);
  const html = items.map(x => { const on = x.toggle && S[x.toggle]; const dis = x.activo && !x.activo(S); return `<button class="qbtn ${on ? "on" : ""}" data-qk="${x.id}" ${dis ? "disabled" : ""}>${x.ico || "•"} <span>${esc(on && x.txtOn ? x.txtOn : x.corto || x.txt)}</span></button>`; }).join("");
  if ($("#quick").innerHTML !== html){ $("#quick").innerHTML = html; $("#quick").querySelectorAll("[data-qk]").forEach(b => b.onclick = () => tratar(b.dataset.qk)); }
}
function afterTx(id){
  renderQuick(); renderDefib();
  if (MODO === "tutor"){ const c = E.comentario(S, id); if (c) hint(c.startsWith("⛔") ? "bad" : c.startsWith("⚠️") ? "warn" : "", c); }
  renderActs(); renderDevs(); renderPatient(true);
}


/* ---------------- desfibrilador manual (en pantalla, sin pausar el tiempo) ---------------- */
let dfE = 150, cargando = false, cargaT = null;
function renderDefib(){
  if (!E.desfibrilador){ $("#defib").innerHTML = ""; return; }
  const html = `<div class="defib"><span class="dl">⚡ DESFIBRILADOR</span>
    <button data-df="parches" ${S.parches ? "disabled" : ""}>${S.parches ? "✓ Parches colocados" : "Colocar parches"}</button>
    <select id="dfE" ${S.cargado || cargando ? "disabled" : ""}>${(E.energias || [120, 150, 200, 360]).map(j => `<option value="${j}" ${j === dfE ? "selected" : ""}>${j} J</option>`).join("")}</select>
    <button data-df="cargar" ${!S.parches || S.cargado || cargando ? "disabled" : ""}>Cargar</button>
    <button data-df="descargar" class="${S.cargado ? "armed" : ""}" ${!S.cargado ? "disabled" : ""}>⚡ DESCARGA</button>
    <button data-df="desarmar" ${!S.cargado ? "disabled" : ""}>Desarmar</button>
    <span class="dstat">${S.cargado ? "CARGADO " + dfE + " J" : cargando ? "Cargando…" : ""}</span></div>`;
  if ($("#defib").innerHTML.replace(/\s+/g, "") === html.replace(/\s+/g, "")) return;
  $("#defib").innerHTML = html;
  $("#dfE").onchange = e => dfE = +e.target.value;
  $("#defib").querySelectorAll("[data-df]").forEach(b => b.onclick = () => {
    const a = b.dataset.df;
    if (a === "parches"){ E.aplicar(S, "parches", {}); logA("parches", "tra", {}, "Parches de desfibrilación colocados"); }
    if (a === "cargar"){ cargando = true; logA("cargar", "tra", { energia: dfE }, `Carga ${dfE} J${S.cpr ? " (sin detener compresiones)" : ""}`); clearTimeout(cargaT); cargaT = setTimeout(() => { cargando = false; S.cargado = true; S.energia = dfE; renderDefib(); }, 2200); }
    if (a === "descargar"){ const r = E.aplicar(S, "descarga", { energia: S.energia }); logA("descarga", "tra", { energia: S.energia, ritmo: r && r.ritmo }, `⚡ DESCARGA ${S.energia} J`); S.cargado = false; if (r && r.msg && (MODO === "tutor" || r.siempre)) hint(r.tipo || "", r.msg); afterTx("descarga"); }
    if (a === "desarmar"){ S.cargado = false; logA("desarmar", "tra", {}, "Desfibrilador desarmado"); }
    renderDefib();
  });
}

/* ---------------- dispositivos ---------------- */
function nivModal(){
  let m = S.niv ? (S.cpap ? "CPAP" : "BiPAP") : "BiPAP", ipap = S.niv ? S.ipap : 14, epap = S.niv ? S.epap : 6, fio2 = Math.round((S.niv ? S.nivFio2 : .5) * 100);
  let anim = 0;
  const draw = () => {
    $("#modal").innerHTML = `<h2>😷 Ventilador de VMNI</h2><p style="color:var(--mut)">Equipo genérico de ventilación no invasiva con mascarilla oronasal.</p>
      <div class="seg"><button data-mo="CPAP" class="${m === "CPAP" ? "on" : ""}">CPAP</button><button data-mo="BiPAP" class="${m === "BiPAP" ? "on" : ""}">BiPAP (S/T)</button></div>
      ${m === "BiPAP" ? `<div class="sl"><div class="tt"><span>IPAP (presión inspiratoria)</span><b id="vI">${ipap} cmH₂O</b></div><input type="range" id="rI" min="8" max="26" value="${ipap}"></div>` : ""}
      <div class="sl"><div class="tt"><span>${m === "CPAP" ? "CPAP" : "EPAP (PEEP)"}</span><b id="vE">${epap} cmH₂O</b></div><input type="range" id="rE" min="4" max="14" value="${epap}"></div>
      <div class="sl"><div class="tt"><span>FiO₂</span><b id="vF">${fio2} %</b></div><input type="range" id="rF" min="21" max="100" step="1" value="${fio2}"></div>
      <div style="display:flex;gap:10px;align-items:center;font-size:13px;color:var(--mut)" id="psTxt"></div>
      <canvas id="vc" width="700" height="170" style="width:100%;height:auto;background:#050a14;border-radius:12px;border:1px solid var(--line);margin-top:10px"></canvas>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">${S.niv ? `<button class="btn red" id="nOff">Retirar VMNI</button>` : ""}<button class="btn" id="nCan">Cancelar</button><button class="btn pri" id="nOk">${S.niv ? "Aplicar cambios" : "Conectar al paciente"}</button></div>`;
    const ps = () => { $("#psTxt").innerHTML = m === "BiPAP" ? `Presión de soporte (IPAP − EPAP): <b style="color:${ipap - epap >= 8 ? "#4ade80" : "#fbbf24"};font-family:var(--mono)">${ipap - epap} cmH₂O</b>${ipap > 22 ? " · ⚠️ IPAP alta: fugas y aerofagia" : ""}` : "Presión continua en todo el ciclo: <b>sin presión de soporte</b>."; };
    ps();
    document.querySelectorAll("[data-mo]").forEach(b => b.onclick = () => { m = b.dataset.mo; draw(); });
    if ($("#rI")) $("#rI").oninput = e => { ipap = +e.target.value; if (ipap < epap + 2) { ipap = epap + 2; e.target.value = ipap; } $("#vI").textContent = ipap + " cmH₂O"; ps(); };
    $("#rE").oninput = e => { epap = +e.target.value; if (m === "BiPAP" && ipap < epap + 2){ ipap = epap + 2; } $("#vE").textContent = epap + " cmH₂O"; if ($("#vI")){ $("#vI").textContent = ipap + " cmH₂O"; $("#rI").value = ipap; } ps(); };
    $("#rF").oninput = e => { fio2 = +e.target.value; $("#vF").textContent = fio2 + " %"; };
    $("#nCan").onclick = () => { cancelAnimationFrame(anim); closeModal(); };
    $("#nOk").onclick = () => {
      cancelAnimationFrame(anim); closeModal();
      const p = { modo: m, ipap: m === "CPAP" ? epap : ipap, epap, fio2: fio2 / 100 };
      E.aplicar(S, "niv", p);
      logA("niv", "tra", p, m === "CPAP" ? `VMNI CPAP ${epap} · FiO₂ ${fio2} %` : `VMNI BiPAP ${ipap}/${epap} · FiO₂ ${fio2} %`);
      afterTx(m === "CPAP" && S.caso === "epoc" ? "cpapEpocNote" : "niv");
    };
    const off = $("#nOff"); if (off) off.onclick = () => { cancelAnimationFrame(anim); closeModal(); E.aplicar(S, "niv_off", {}); logA("niv_off", "tra", {}, "Retira VMNI (Ventimask 28 %)"); afterTx("niv_off"); };
    // curvas de presión y flujo
    const c = $("#vc").getContext("2d"); let t0 = performance.now();
    const loop = () => {
      const W = 700, H = 170, t = (performance.now() - t0) / 1000, per = 60 / Math.max(8, S.rr);
      c.fillStyle = "#050a14"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#6b7da8"; c.font = "11px Inter"; c.fillText("Presión (cmH₂O)", 8, 14); c.fillText("Flujo", 8, 100);
      c.strokeStyle = "#1b2741"; c.beginPath(); c.moveTo(0, 85); c.lineTo(W, 85); c.moveTo(0, 130); c.lineTo(W, 130); c.stroke();
      const pI = m === "CPAP" ? epap : ipap;
      c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x < W; x++){ const tt = (t - (W - x) / 140) % per / per; const insp = tt < .38; const pr = insp ? epap + (pI - epap) * Math.min(1, tt / .06) : epap + (pI - epap) * Math.max(0, 1 - (tt - .38) / .05); const y = 80 - pr * 2.6; x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
      c.strokeStyle = "#38bdf8"; c.beginPath();
      for (let x = 0; x < W; x++){ const tt = (t - (W - x) / 140) % per / per; let f = tt < .38 ? Math.exp(-tt / .14) * (m === "CPAP" ? .6 : .6 + (ipap - epap) / 20) : -Math.exp(-(tt - .38) / (S.caso === "epoc" ? .28 : .1)) * .7; const y = 130 - f * 34; x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke(); anim = requestAnimationFrame(loop);
    };
    loop();
  };
  openModal(); draw();
}
function ntgModal(){
  const N = ["Suspendida", "10–20 µg/min (baja)", "50–100 µg/min (media)", "≥ 150 µg/min (dosis altas)"];
  $("#modal").innerHTML = `<h2>💉 Nitroglicerina IV en perfusión</h2><p style="color:var(--mut)">Bomba de perfusión · nitroglicerina 50 mg en 250 mL. Titula según la PAS (actual: ${nibp ? nibp.s : "—"} mmHg).</p>
    <div style="display:grid;gap:8px;margin-top:12px">${N.map((n, i) => `<button class="act" data-n="${i}" style="${S.ntgIv === i ? "border-color:#38bdf8;background:#0f2a40" : ""}"><span class="i">${["⏹", "🟢", "🟡", "🔴"][i]}</span><div><b>${n}</b></div></button>`).join("")}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn" id="cc">Cancelar</button></div>`;
  openModal();
  $("#cc").onclick = closeModal;
  document.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { const n = +b.dataset.n; closeModal(); E.aplicar(S, "ntg_iv", { nivel: n }); logA(n ? "ntg_iv" : "ntg_off", "tra", { nivel: n }, "NTG IV: " + N[n]); afterTx(n ? "ntg_iv" : "ntg_off"); });
}
function iotModal(){
  $("#modal").innerHTML = `<h2>🫁 Intubación orotraquial</h2><p style="color:var(--mut)">${S.arrestActivo ? "Intubación durante la RCP: minimiza la pausa de compresiones (< 5 s) y confirma con capnografía." : "Secuencia rápida, ventilación mecánica invasiva e ingreso en UCI."} ¿Confirmas?</p>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn" id="cc">Cancelar</button><button class="btn red" id="ok">Intubar</button></div>`;
  openModal(); $("#cc").onclick = closeModal;
  $("#ok").onclick = () => { closeModal(); E.aplicar(S, "iot", {}); logA("iot", "tra", {}, "Intubación orotraquial"); afterTx("iot"); };
}
function renderDevs(){
  if (E.dispositivos){ const html = E.dispositivos(S).map(x => `<div class="dev">${x}</div>`).join(""); if ($("#devs").innerHTML !== html) $("#devs").innerHTML = html; return; }
  const d = [];
  if (S.iot) d.push(`🫁 <b>IOT</b> · VM invasiva`);
  else if (S.niv) d.push(`<span data-dev="niv" style="cursor:pointer">😷 <b>${S.cpap ? "CPAP " + S.epap : "BiPAP " + S.ipap + "/" + S.epap}</b> · FiO₂ ${Math.round(S.nivFio2 * 100)} % <span class="x">⚙️</span></span>`);
  else if (S.o2dev){ const x = ALL_TX.find(t => t.id === S.o2dev); d.push(`🫧 <b>${esc(x ? x.txt : "O₂")}</b>`); }
  else d.push(`🌬️ Aire ambiente`);
  if (S.ntgIv) d.push(`<span data-dev="ntg" style="cursor:pointer">💉 NTG IV <b>${["", "baja", "media", "alta"][S.ntgIv]}</b> <span class="x">⚙️</span></span>`);
  if (S._ef && S._ef.neb > .1) d.push(`💨 Nebulización activa`);
  if (S.pos) d.push(`🛏️ Incorporado`);
  if (S.furo && S.furo.length) d.push(`💧 Furosemida ×${S.furo.length}`);
  const html = d.map(x => `<div class="dev">${x}</div>`).join("");
  if ($("#devs").innerHTML !== html){ $("#devs").innerHTML = html; const n = $("[data-dev=niv]"); if (n) n.onclick = nivModal; const g = $("[data-dev=ntg]"); if (g) g.onclick = ntgModal; }
}

/* ---------------- tutor: pistas ---------------- */
function checkHints(){
  E.pistas.forEach(p => { if (!hintsShown[p.id] && p.cuando(S, L)){ hintsShown[p.id] = true; hint("", "🎓 " + p.txt); } });
}
function hint(cls, txt, short){
  const el = document.createElement("div"); el.className = "hint " + (cls || ""); el.innerHTML = esc(txt);
  $("#hints").prepend(el);
  while ($("#hints").children.length > 3) $("#hints").lastElementChild.remove();
  if (short) setTimeout(() => el.remove(), 5000);
}

/* ---------------- dibujo del paciente (SVG 2,5D, vista frontal) ---------------- */
let visKey = "";
function renderPatient(force){
  if (!S) return;
  if (S.supino) return renderSupino(force);
  const gcsLvl = S.iot ? 0 : S.gcs >= 14 ? 2 : S.gcs >= 10 ? 1 : 0;
  const neb = !!(S._ef && S._ef.neb > .1 && !S.niv && !S.iot);
  const key = [S.o2dev, S.niv, S.iot, S.pos, gcsLvl, Math.round(S.cianosis * 5), Math.round(S.sudor * 3), Math.round(S.wob * 4), neb].join("|");
  if (!force && key === visKey) return; visKey = key;
  const skin = lerpC(lerpC("e9b48f", "e3d3c6", S.sudor * .55), "a7b0c9", S.cianosis * .5);
  const skinD = lerpC(skin.slice(1), "6b4a3a", .22);
  const lips = lerpC("b9675c", "4f63a6", cl(S.cianosis * 1.3, 0, 1));
  const nails = lerpC("e7a9a0", "6a7fc2", cl(S.cianosis * 1.3, 0, 1));
  const lean = S.pos || S.iot ? 0 : 6; // se inclina hacia delante si no está incorporado
  // ojos según conciencia
  const eyes = gcsLvl === 0 ? `<path d="M-19 -6 q7 4 14 0 M5 -6 q7 4 14 0" stroke="#3b2a20" stroke-width="2.2" fill="none"/>`
    : gcsLvl === 1 ? `<path d="M-19 -6 h14 M5 -6 h14" stroke="#3b2a20" stroke-width="2.6"/><path d="M-18 -5 q6 3 12 0 M6 -5 q6 3 12 0" stroke="#3b2a20" stroke-width="1.3" fill="none"/>`
    : `<g><ellipse cx="-12" cy="-6" rx="6" ry="${S.wob > .6 ? 4.6 : 3.8}" fill="#fff"/><ellipse cx="12" cy="-6" rx="6" ry="${S.wob > .6 ? 4.6 : 3.8}" fill="#fff"/><circle cx="-12" cy="-6" r="2.6" fill="#3a2a20"/><circle cx="12" cy="-6" r="2.6" fill="#3a2a20"/><circle cx="-11" cy="-7" r=".9" fill="#fff"/><circle cx="13" cy="-7" r=".9" fill="#fff"/></g>`;
  const brows = S.wob > .5 && gcsLvl ? `<path d="M-20 -15 q7 -3 14 1 M20 -15 q-7 -3 -14 1" stroke="#8f8f8f" stroke-width="2.6" fill="none"/><path d="M-3 -16 v4 M3 -16 v4" stroke="${skinD}" stroke-width="1.2"/>` : `<path d="M-20 -14 q7 -3 14 0 M6 -14 q7 -3 14 0" stroke="#9a9a9a" stroke-width="2.4" fill="none"/>`;
  const mouthRy = S.iot ? 2 : cl(S.wob * 7.5, 1.4, 7.5);
  const sweat = S.sudor > .5 ? `<g fill="#cfeaff" stroke="#9cc9ee" stroke-width=".6"><path d="M-22 -24 q2.4 5 0 7 q-2.4 -2 0 -7z"/><path d="M14 -28 q2.4 5 0 7 q-2.4 -2 0 -7z"/><path d="M27 -6 q2.4 5 0 7 q-2.4 -2 0 -7z"/>${S.sudor > .8 ? `<path d="M-29 4 q2.4 5 0 7 q-2.4 -2 0 -7z"/>` : ""}</g>` : "";
  // interfaces respiratorias (coordenadas de la cara: nariz ~ (0,6), boca ~ (0,22))
  let iface = "", tube = "";
  if (S.iot){
    iface = `<rect x="-26" y="19" width="52" height="7" rx="2" fill="#f8fafc" opacity=".92"/><rect x="-4" y="16" width="9" height="12" rx="2" fill="#38bdf8"/><path d="M5 22 q20 2 28 14" stroke="#e2e8f0" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    tube = `<path d="M213 136 q40 30 70 90 q10 30 40 40" stroke="#93c5fd" stroke-width="9" fill="none" opacity=".75"/>`;
  } else if (S.niv){
    iface = `<path d="M-30 -24 L-46 -30 M30 -24 L46 -30 M-30 26 L-48 30 M30 26 L48 30" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M0 -18 q24 2 28 22 q3 22 -28 30 q-31 -8 -28 -30 q4 -20 28 -22z" fill="#e0f2fe" fill-opacity=".38" stroke="#f1f5f9" stroke-width="2.4"/>
      <path d="M0 -10 q16 2 19 16 q2 15 -19 21 q-21 -6 -19 -21 q3 -14 19 -16z" fill="none" stroke="#bae6fd" stroke-width="1" opacity=".7"/>
      <circle cx="0" cy="6" r="7" fill="#cbd5e1" stroke="#94a3b8"/><rect x="-4" y="9" width="8" height="12" rx="3" fill="#94a3b8"/><path d="M0 -24 v-22" stroke="#1e293b" stroke-width="4"/>`;
    tube = `<path d="M180 147 q6 24 22 36 q30 20 56 40 q24 22 70 22" stroke="#cbd5e1" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="2 3"/>`;
  } else if (S.o2dev && (S.o2dev.startsWith("o2_vm") || S.o2dev === "o2_res")){
    const vc = { o2_vm28: "#fde047", o2_vm35: "#fb923c", o2_vm50: "#4ade80", o2_res: "#e2e8f0" }[S.o2dev];
    iface = `<path d="M-26 0 L-36 -6 M26 0 L36 -6" stroke="#64748b" stroke-width="1.6"/>
      <path d="M0 -6 q18 1 20 18 q1 16 -20 22 q-21 -6 -20 -22 q2 -17 20 -18z" fill="#dcfce7" fill-opacity=".42" stroke="#e2e8f0" stroke-width="1.8"/>
      <circle cx="-9" cy="18" r="1.6" fill="#94a3b8"/><circle cx="9" cy="18" r="1.6" fill="#94a3b8"/>
      ${S.o2dev === "o2_res" ? "" : `<rect x="-5" y="34" width="10" height="12" rx="2" fill="${vc}"/>`}`;
    tube = S.o2dev === "o2_res" ? `<g id="bag" transform-origin="180 176"><ellipse cx="180" cy="176" rx="15" ry="19" fill="#bbf7d0" fill-opacity=".55" stroke="#4ade80" stroke-width="1.5"/></g><path d="M180 195 q4 30 40 50 q40 18 110 20" stroke="#86efac" stroke-width="3" fill="none"/>`
      : `<path d="M180 152 q4 30 40 54 q40 22 110 26" stroke="#86efac" stroke-width="3.2" fill="none"/>`;
  } else if (S.o2dev === "o2_gn"){
    iface = `<path d="M-6 13 v-4 M6 13 v-4" stroke="#86efac" stroke-width="2.2"/><path d="M-34 4 q8 12 34 9 q26 3 34 -9" stroke="#86efac" stroke-width="2.4" fill="none"/>`;
    tube = `<path d="M146 112 q-8 40 6 70 q30 50 150 70" stroke="#86efac" stroke-width="2.4" fill="none"/>`;
  }
  const mist = neb ? `<g opacity=".55"><circle cx="-12" cy="-30" r="8" fill="#e0f2fe" class="mist1"/><circle cx="10" cy="-40" r="11" fill="#e0f2fe" opacity=".6" class="mist2"/></g>` : "";
  const neck = S.wob > .5 && !S.iot ? `<path d="M-12 30 q-2 14 -10 30 M12 30 q2 14 10 30" stroke="${skinD}" stroke-width="2.6" fill="none" opacity=".8"/>` : "";
  $("#pt").innerHTML = `
    <defs>
      <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22325a"/><stop offset="1" stop-color="#121c38"/></linearGradient>
      <linearGradient id="gown" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a7c8ec"/><stop offset="1" stop-color="#6c9bcf"/></linearGradient>
      <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="#5f8fc2" opacity=".6"/><circle cx="9" cy="9" r="1.3" fill="#5f8fc2" opacity=".6"/></pattern>
      <radialGradient id="cheek"><stop offset="0" stop-color="#d9786b" stop-opacity="${(.28 - S.cianosis * .2).toFixed(2)}"/><stop offset="1" stop-color="#d9786b" stop-opacity="0"/></radialGradient>
      <linearGradient id="blanket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#b6c2d6"/></linearGradient>
    </defs>
    <rect width="360" height="300" fill="url(#gw)"/>
    <rect y="246" width="360" height="54" fill="#0d1428"/>
    <g opacity=".95"><rect x="290" y="26" width="56" height="42" rx="4" fill="#05080f" stroke="#334155"/><path d="M295 50 h8 l4 -10 l5 18 l4 -8 h26" stroke="#4ade80" stroke-width="1.6" fill="none"/><text x="296" y="62" font-size="7" fill="#22d3ee" font-family="monospace">SpO₂ ${Math.round(S.spo2)}</text><rect x="316" y="68" width="4" height="60" fill="#334155"/></g>
    <rect x="12" y="40" width="10" height="210" rx="3" fill="#334155" opacity=".6"/><rect x="2" y="60" width="30" height="40" rx="6" fill="#94a3b8" opacity=".35"/>
    <rect x="98" y="${46 + (S.pos || S.iot ? 0 : 14)}" width="164" height="200" rx="26" fill="#cbd5e1"/><rect x="108" y="${56 + (S.pos || S.iot ? 0 : 14)}" width="144" height="70" rx="22" fill="#f1f5f9"/>
    <g transform="translate(0 ${lean})">
      <g id="torso" transform-origin="180 250">
        <path d="M108 250 q-6 -60 6 -88 q10 -18 40 -24 h52 q30 6 40 24 q12 28 6 88z" fill="url(#gown)"/>
        <path d="M108 250 q-6 -60 6 -88 q10 -18 40 -24 h52 q30 6 40 24 q12 28 6 88z" fill="url(#dots)"/>
        <path d="M160 138 l20 30 l20 -30" fill="${skin}"/><path d="M160 138 l20 30 l20 -30" fill="none" stroke="#5f8fc2" stroke-width="2"/>
        <g id="retr" opacity="0"><path d="M150 140 q8 6 16 2 M194 142 q8 4 16 -2" stroke="#6b4a3a" stroke-width="3" fill="none" stroke-linecap="round"/></g>
        <circle cx="146" cy="160" r="4.5" fill="#f8fafc" stroke="#94a3b8"/><circle cx="214" cy="160" r="4.5" fill="#f8fafc" stroke="#94a3b8"/><circle cx="208" cy="208" r="4.5" fill="#f8fafc" stroke="#94a3b8"/>
        <path d="M146 164 q-10 40 -22 70 M214 164 q8 30 26 64 M208 212 q8 18 28 30" stroke="#ef4444" stroke-width="1.2" fill="none" opacity=".7"/>
        <path d="M118 160 q-22 30 -16 72 q4 14 26 14" stroke="${skin}" stroke-width="20" fill="none" stroke-linecap="round"/>
        <path d="M242 160 q22 30 16 72 q-4 14 -26 14" stroke="${skin}" stroke-width="20" fill="none" stroke-linecap="round"/>
        <path d="M112 150 q-10 10 -10 22 M248 150 q10 10 10 22" stroke="#7aa6d6" stroke-width="16" fill="none" stroke-linecap="round"/>
        <ellipse cx="132" cy="246" rx="12" ry="7" fill="${skin}"/><ellipse cx="228" cy="246" rx="12" ry="7" fill="${skin}"/>
        <rect x="236" y="240" width="14" height="10" rx="3" fill="#475569"/><circle cx="243" cy="245" r="2.2" fill="#ef4444"/>
        <path d="M122 248 h4 M126 249 h4 M232 249 h4" stroke="${nails}" stroke-width="2.4" stroke-linecap="round"/>
      </g>
      ${tube}
      <g id="head">
        <g transform="translate(180 92)">
          <path d="M-13 28 h26 v26 h-26z" fill="${skinD}"/>${neck}
          <ellipse cx="0" cy="0" rx="34" ry="41" fill="${skin}"/>
          <ellipse cx="-34" cy="2" rx="6" ry="10" fill="${skin}"/><ellipse cx="34" cy="2" rx="6" ry="10" fill="${skin}"/>
          <path d="M-34 -10 q-2 -22 10 -30 q-4 10 0 14 q-8 4 -10 16z M34 -10 q2 -22 -10 -30 q4 10 0 14 q8 4 10 16z" fill="#c9c9c9"/>
          <path d="M-26 -30 q26 -18 52 0" stroke="#d6d6d6" stroke-width="3" fill="none" opacity=".8"/>
          <circle cx="-18" cy="10" r="10" fill="url(#cheek)"/><circle cx="18" cy="10" r="10" fill="url(#cheek)"/>
          ${brows}${eyes}
          <path d="M0 -4 q-5 12 -4 15 q4 2 8 0" stroke="${skinD}" stroke-width="1.8" fill="none"/>
          <path d="M-14 30 q14 8 28 0" stroke="${skinD}" stroke-width="1.2" fill="none" opacity=".5"/>
          <ellipse id="mouth" cx="0" cy="22" rx="${S.iot ? 4 : 8}" ry="${mouthRy}" fill="${mouthRy > 2 ? "#4a1d1d" : lips}" stroke="${lips}" stroke-width="2.4"/>
          ${S.cianosis > .25 ? `<ellipse cx="0" cy="0" rx="34" ry="41" fill="#7c8fd0" opacity="${(S.cianosis * .18).toFixed(2)}"/>` : ""}
          ${sweat}${mist}${iface}
        </g>
      </g>
    </g>
    <path d="M70 250 q110 -16 220 0 v50 h-220z" fill="url(#blanket)"/><path d="M100 262 q80 -8 160 0" stroke="#94a3b8" stroke-width="1.5" fill="none" opacity=".6"/>`;
}

/* paciente en decúbito supino (vista cenital) para la parada */
function renderSupino(force){
  const key = ["sup", S.cpr, S.parches, S.via, S.viaAerea, S.pulso, Math.round((S.cianosis || 0) * 4), S.gcs > 8].join("|");
  if (!force && key === visKey) return; visKey = key;
  const skin = S.pulso ? lerpC("e9b48f", "c9b7b0", (S.cianosis || 0) * .6) : lerpC("c8bdb8", "98a4bf", .55);
  const lips = S.pulso ? "#b9675c" : "#5b6aa0";
  const pads = S.parches ? `<g><rect x="132" y="108" width="34" height="24" rx="5" fill="#f8fafc" stroke="#94a3b8"/><rect x="200" y="166" width="34" height="26" rx="5" fill="#f8fafc" stroke="#94a3b8" transform="rotate(-20 217 179)"/><path d="M149 108 q-20 -40 -60 -70 M217 166 q30 -60 80 -140" stroke="#ef4444" stroke-width="2" fill="none"/><path d="M152 112 h0" stroke="#000"/></g>` : "";
  const via = S.via ? `<g><rect x="${S.via === "io" ? 300 : 120}" y="${S.via === "io" ? 196 : 206}" width="12" height="8" rx="2" fill="#38bdf8"/><path d="M${S.via === "io" ? 306 : 126} ${S.via === "io" ? 196 : 206} q20 -60 70 -180" stroke="#7dd3fc" stroke-width="2" fill="none"/></g>` : "";
  let aw = "";
  if (S.viaAerea === "iot") aw = `<rect x="34" y="146" width="40" height="7" rx="3" fill="#e2e8f0"/><rect x="58" y="142" width="8" height="15" rx="2" fill="#38bdf8"/><path d="M34 150 q-20 0 -26 -40" stroke="#93c5fd" stroke-width="7" fill="none"/><g id="bvm"><ellipse cx="14" cy="96" rx="12" ry="22" fill="#fde68a" fill-opacity=".8" stroke="#f59e0b"/></g>`;
  else if (S.viaAerea === "sga") aw = `<path d="M40 150 h32" stroke="#a78bfa" stroke-width="8" stroke-linecap="round"/><path d="M40 150 q-20 0 -26 -40" stroke="#c4b5fd" stroke-width="6" fill="none"/><g id="bvm"><ellipse cx="14" cy="96" rx="12" ry="22" fill="#fde68a" fill-opacity=".8" stroke="#f59e0b"/></g>`;
  else if (S.viaAerea === "bvm") aw = `<ellipse cx="62" cy="150" rx="18" ry="14" fill="#e0f2fe" fill-opacity=".5" stroke="#e2e8f0" stroke-width="2"/><g id="bvm"><ellipse cx="28" cy="150" rx="22" ry="13" fill="#fde68a" fill-opacity=".85" stroke="#f59e0b"/></g>`;
  const hands = S.cpr ? `<g id="hands"><path d="M182 0 L176 128 M206 0 L198 128" stroke="#2563eb" stroke-width="22" stroke-linecap="round"/><ellipse cx="188" cy="150" rx="20" ry="15" fill="#e7b18c" stroke="#b07d63"/><ellipse cx="188" cy="146" rx="18" ry="13" fill="#eab995" stroke="#b07d63"/></g>` : "";
  $("#pt").innerHTML = `
    <defs><linearGradient id="fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2a4d"/><stop offset="1" stop-color="#101934"/></linearGradient>
    <linearGradient id="gown2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7c8ec"/><stop offset="1" stop-color="#7aa6d6"/></linearGradient></defs>
    <rect width="360" height="300" fill="url(#fl)"/>
    <rect x="14" y="88" width="336" height="124" rx="16" fill="#cbd5e1"/><rect x="22" y="96" width="320" height="108" rx="12" fill="#e2e8f0"/>
    <rect x="18" y="212" width="10" height="40" fill="#64748b"/><rect x="336" y="212" width="10" height="40" fill="#64748b"/>
    <g id="chestS">
      <path d="M96 112 q50 -16 140 -4 v84 q-90 12 -140 -4z" fill="${S.cpr ? "#e9e2dc" : "url(#gown2)"}"/>
      ${S.cpr ? `<path d="M120 118 q60 -10 110 -2 v68 q-50 8 -110 -2z" fill="${skin}" opacity=".9"/>` : ""}
    </g>
    <path d="M100 116 q-12 -16 10 -24 q60 -6 120 -2" stroke="${skin}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M100 184 q-12 16 10 24 q60 6 120 2" stroke="${skin}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M236 108 h104 v84 h-104z" fill="#cfd8e6"/><path d="M240 124 h96 M240 150 h96 M240 176 h96" stroke="#b6c2d6" stroke-width="2"/>
    <g transform="translate(66 150)"><rect x="18" y="-12" width="20" height="24" fill="${skin}"/><ellipse cx="0" cy="0" rx="30" ry="26" fill="${skin}"/><path d="M-26 -10 q-6 10 0 22" stroke="#c9c9c9" stroke-width="7" fill="none"/>
      <path d="M8 -12 q4 3 8 0 M8 12 q4 -3 8 0" stroke="#3b2a20" stroke-width="2" fill="none"/><path d="M22 -4 v8" stroke="${lips}" stroke-width="3"/></g>
    ${pads}${via}${aw}${hands}
    <text x="180" y="282" text-anchor="middle" font-size="12" font-weight="700" fill="${S.pulso ? "#4ade80" : "#fb7185"}" font-family="Inter">${S.pulso ? (S.gcs > 8 ? "Con pulso · respira" : "Con pulso · RCE") : S.cpr ? "RCP en curso" : "Sin pulso · ¡sin compresiones!"}</text>`;
}

// respiración sincronizada (tiempo real, frecuencia del modelo)
let brPh = 0, hbPh = 0, lastFrame = performance.now(), talkPh = 0, cprPh = 0, ventPh = 0;
function animPatient(now){
  const dt = Math.min(.1, (now - lastFrame) / 1000); lastFrame = now;
  if (S){
    const rr = S.arrest ? 0 : S.rr; brPh = (brPh + dt * rr / 60) % 1;
    const insp = brPh < .4 ? Math.sin(brPh / .4 * Math.PI / 2) : Math.cos((brPh - .4) / .6 * Math.PI / 2);
    const amp = S.iot ? .025 : .02 + S.wob * .045;
    const t = document.getElementById("torso"), h = document.getElementById("head"), b = document.getElementById("bag"), r = document.getElementById("retr"), m = document.getElementById("mouth");
    if (t) t.setAttribute("transform", `translate(180 250) scale(${1 + insp * amp * .8} ${1 + insp * amp}) translate(-180 -250)`);
    if (h) h.setAttribute("transform", `translate(0 ${-insp * amp * 120})`);
    if (b) b.setAttribute("transform", `translate(180 176) scale(1 ${1 - insp * .4}) translate(-180 -176)`);
    if (r) r.setAttribute("opacity", S.iot ? 0 : (insp * cl((S.wob - .4) * 2, 0, 1)).toFixed(2));
    if (S.supino){
      const hd = document.getElementById("hands"), ch = document.getElementById("chestS"), bv = document.getElementById("bvm");
      cprPh = (cprPh + dt * 1.85) % 1; const pr = S.cpr ? Math.max(0, Math.sin(cprPh * 2 * Math.PI)) : 0;
      if (hd) hd.setAttribute("transform", `translate(188 150) scale(${1 - pr * .07}) translate(-188 -150)`);
      if (ch) ch.setAttribute("transform", S.cpr ? `translate(166 150) scale(1 ${1 - pr * .05}) translate(-166 -150)` : S.pulso ? `translate(166 150) scale(1 ${1 + insp * .03}) translate(-166 -150)` : "");
      if (bv){ ventPh = (ventPh + dt * Math.max(.1, (S.rr || 10)) / 60) % 1; bv.setAttribute("transform", `translate(20 120) scale(${1 - (ventPh < .2 ? Math.sin(ventPh / .2 * Math.PI) * .35 : 0)} 1) translate(-20 -120)`); }
    }
    if (m && speaking && !S.niv && !S.iot && S.gcs > 11){ talkPh += dt * 9; m.setAttribute("ry", (2 + Math.abs(Math.sin(talkPh)) * 5).toFixed(1)); }
  }
  drawMonitor(dt);
  requestAnimationFrame(animPatient);
}

/* ---------------- monitor multiparamétrico ---------------- */
const MC = $("#mon"), mc = MC.getContext("2d"), WW = 690;
const bufs = { ecg: new Array(WW).fill(null), ple: new Array(WW).fill(null), cap: new Array(WW).fill(null) };
let sx = 0, monT = 0, blink = 0, lastBeep = 0;
const G = (t, mu, s, a) => a * Math.exp(-((t - mu) ** 2) / (2 * s * s));
function ecgV(ph, hr){ const per = 60 / hr, t = ph * per; return G(t, .08, .025, .12) + G(t, .17, .008, -.1) + G(t, .19, .011, 1) + G(t, .215, .01, -.22) + G(t, .4, .045, .28); }
function pleV(ph){ const x = ph; return x < .12 ? 0 : x < .3 ? Math.sin((x - .12) / .18 * Math.PI / 2) : x < .45 ? 1 - (x - .3) / .15 * .45 : x < .5 ? .55 + (x - .45) * 1.2 : Math.max(0, .61 * (1 - (x - .5) / .5)); }
function capV(ph, et, forma){
  // espiración 0–0,62 del ciclo ; inspiración 0,62–1
  if (ph < .62){ const x = ph / .62; const k = .04 + forma * .32; return et * (1 - Math.exp(-x / k)) * (forma > .4 ? .82 + x * .18 : .96 + x * .04); }
  const x = (ph - .62) / .38; return et * Math.max(0, 1 - x * 8) * (forma > .4 ? 1 : 1);
}
// formas de onda por ritmo (para escenarios de parada: S.ritmo, S.pulso, S.cpr)
function wideV(ph, hr){ const per = 60 / hr, t = ph * per; return G(t, .1, .05, .9) + G(t, .2, .06, -.5) + G(t, .45, .09, .25); }
function ecgRitmo(tt, cph, hr){
  const r = S.ritmo;
  let v;
  if (!r || r === "sinus") v = ecgV(cph, hr);
  else if (r === "fv"){ const a = S.fvAmp != null ? S.fvAmp : .4; v = a * (Math.sin(tt * 27) * .6 + Math.sin(tt * 41 + 1.3) * .35 + Math.sin(tt * 13 + .4) * .3); }
  else if (r === "tv"){ v = .95 * Math.sin(2 * Math.PI * tt * (hr / 60)) ** 3 + .1 * Math.sin(2 * Math.PI * tt * (hr / 60)); }
  else if (r === "asist") v = .015 * Math.sin(tt * 3.1) + .01 * Math.sin(tt * 17);
  else if (r === "aesp" || r === "brady_ancho") v = wideV(cph, hr);
  else v = ecgV(cph, hr);
  if (S.cpr) v = v * .35 + .85 * Math.sin(2 * Math.PI * tt * 1.85) + .12 * Math.sin(2 * Math.PI * tt * 3.7);
  return v;
}
function drawMonitor(dt){
  const W = MC.width, H = MC.height;
  mc.fillStyle = "#000"; mc.fillRect(0, 0, W, H);
  if (!S){ mc.fillStyle = "#334155"; mc.font = "16px Inter"; mc.fillText("Monitor en espera", 20, 40); return; }
  monT += dt; blink = (blink + dt) % 1;
  const modoRitmo = S.ritmo != null;
  const sinPulso = modoRitmo ? !S.pulso : S.arrest;
  const arrest = S.arrest && !modoRitmo, hr = Math.max(20, S.hr || 60), rr = Math.max(4, S.rr || 10);
  const n = Math.max(1, Math.round(dt * 150));
  for (let i = 0; i < n; i++){
    sx = (sx + 1) % WW;
    const tt = monT - (n - i) / 150;
    const cph = ((tt * hr / 60) % 1 + 1) % 1, rph = ((tt * rr / 60) % 1 + 1) % 1;
    bufs.ecg[sx] = arrest ? .35 * Math.sin(tt * 29) + .25 * Math.sin(tt * 41 + 1) : modoRitmo ? ecgRitmo(tt, cph, hr) : ecgV(cph, hr);
    bufs.ple[sx] = sinPulso ? (S.cpr ? .22 * Math.max(0, Math.sin(2 * Math.PI * tt * 1.85)) : 0) : pleV(((cph - .1) % 1 + 1) % 1) * (S.spo2 < 75 ? .5 : 1);
    bufs.cap[sx] = arrest ? 3 : (S.rr || 0) < 1 ? 0 : capV(rph, Math.max(0, S.etco2), S.iot ? .15 : (S.capnoForma || 0));
    for (let j = 1; j < 12; j++){ const k = (sx + j) % WW; bufs.ecg[k] = bufs.ple[k] = bufs.cap[k] = null; }
  }
  const capMax = S.etco2 > 55 ? 100 : 60;
  const rows = [["II", "#4ade80", "ecg", 70, 52, 1], ["Pleth", "#22d3ee", "ple", 190, -70, 0], ["CO₂", "#facc15", "cap", 390, -120 / capMax, 0]];
  rows.forEach(([lbl, col, k, y0, sc]) => {
    mc.fillStyle = col; mc.font = "600 13px Inter"; mc.fillText(lbl, 8, y0 - (k === "cap" ? 112 : 46));
    mc.strokeStyle = col; mc.lineWidth = 2; mc.beginPath(); let pen = false;
    for (let x = 0; x < WW; x++){ const v = bufs[k][x]; if (v == null){ pen = false; continue; } const y = k === "ecg" ? y0 - v * sc : y0 + v * sc; if (!pen){ mc.moveTo(x, y); pen = true; } else mc.lineTo(x, y); }
    mc.stroke();
  });
  mc.fillStyle = "#475569"; mc.font = "11px Inter"; mc.fillText(capMax + " mmHg", 640, 278);
  if (S.cpr){ mc.fillStyle = "#f97316"; mc.font = "700 12px Inter"; mc.fillText("ARTEFACTO DE COMPRESIONES · pausa para analizar el ritmo", 40, 20); }
  if (S.cicloT != null && S.arrestActivo){
    const c = S.t - S.cicloT, over = c >= 2;
    mc.fillStyle = over && blink < .5 ? "#7f1d1d" : "#111827"; mc.fillRect(500, 146, 186, 40); mc.strokeStyle = over ? "#ef4444" : "#334155"; mc.strokeRect(500, 146, 186, 40);
    mc.fillStyle = over ? "#fecaca" : "#e5e7eb"; mc.font = "600 11px Inter"; mc.fillText(over ? "¡2 MIN! COMPRUEBA RITMO" : "CICLO DE RCP", 508, 160);
    mc.font = '700 18px "JetBrains Mono", monospace'; mc.fillText(mmss(c), 508, 180);
  }
  // numéricos
  const al = { hr: sinPulso || hr > 130 || hr < 50, spo2: sinPulso || S.spo2 < 88, rr: !S.iot && !modoRitmo && (S.rr > 30 || S.rr < 8), sbp: !sinPulso && nibp && (nibp.s > 180 || nibp.s < 90), et: modoRitmo ? false : S.etco2 > 55 || S.etco2 < 25 };
  const box = (x, y, w, h, lbl, val, unit, col, alarm, sub) => {
    const on = alarm && blink < .5;
    mc.fillStyle = on ? "#7f1d1d" : "#05080f"; mc.fillRect(x, y, w, h); mc.strokeStyle = "#1f2937"; mc.strokeRect(x, y, w, h);
    mc.fillStyle = col; mc.font = "600 12px Inter"; mc.fillText(lbl, x + 8, y + 16);
    mc.font = "11px Inter"; mc.fillStyle = "#64748b"; mc.fillText(unit, x + w - 8 - mc.measureText(unit).width, y + 16);
    let fs = h > 80 ? 46 : 34; mc.font = `700 ${fs}px "JetBrains Mono", monospace`; while (mc.measureText(String(val)).width > w - 14 && fs > 16){ fs -= 2; mc.font = `700 ${fs}px "JetBrains Mono", monospace`; } mc.fillStyle = col; mc.fillText(val, x + 8, y + h - (sub ? 22 : 12));
    if (sub){ mc.font = "11px Inter"; mc.fillStyle = "#94a3b8"; mc.fillText(sub, x + 8, y + h - 8); }
  };
  const fcTxt = arrest ? "---" : S.cpr ? "RCP" : modoRitmo && (S.ritmo === "fv" || S.ritmo === "asist") ? "---" : Math.round(hr);
  box(700, 6, 274, 92, "FC", fcTxt, "lpm", "#4ade80", al.hr);
  box(700, 104, 274, 92, "SpO₂", sinPulso ? "---" : Math.round(S.spo2), "%", "#22d3ee", al.spo2);
  box(700, 202, 136, 104, "PANI", !sinPulso && nibp && nibp.s > 0 ? nibp.s + "/" + nibp.d : "--", "mmHg", "#f1f5f9", al.sbp, !sinPulso && nibp ? "hace " + Math.max(0, Math.round(S.t - nibp.t)) + " min" : "");
  box(838, 202, 136, 104, S.iot || modoRitmo ? "FR vent." : "FR", Math.round(S.rr || 0), "rpm", "#fde047", al.rr);
  box(700, 312, 136, 102, "EtCO₂", arrest ? "--" : Math.round(Math.max(0, S.etco2)), "mmHg", "#facc15", al.et);
  box(838, 312, 136, 102, "T ª", f1(S.temp), "°C", "#c4b5fd", false);
  const anyAl = Object.values(al).some(Boolean);
  if (anyAl && !muted && monT - lastBeep > 1.6){ lastBeep = monT; beep(); }
  if (S.cpr && !muted && monT - lastMet > 60 / 110){ lastMet = monT; tick(); }
}
let lastMet = 0;
function tick(){ const a = actx(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 1400; g.gain.setValueAtTime(.06, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .04); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .05); }
$("#mute").onclick = () => { muted = !muted; $("#mute").textContent = muted ? "🔇 Alarmas" : "🔔 Alarmas"; if (!muted) actx(); };

/* ---------------- audio: alarmas y auscultación sintetizada ---------------- */
let AC = null;
function actx(){ if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); return AC; }
function beep(){ const a = actx(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(.12, a.currentTime + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .25); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .3); }
function noiseBuf(a, sec){ const b = a.createBuffer(1, a.sampleRate * sec, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
function playLung(p){
  const a = actx(), T = 7, t0 = a.currentTime + .05, per = 60 / Math.max(10, Math.min(40, p.rr)), insp = per * (p.espLarga ? .3 : .4);
  const src = a.createBufferSource(); src.buffer = noiseBuf(a, T);
  const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 420; bp.Q.value = .8;
  const g = a.createGain(); g.gain.value = 0; src.connect(bp).connect(g).connect(a.destination);
  for (let t = 0; t < T; t += per){
    const s = t0 + t, m = .25 * p.murmullo;
    g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(m, s + insp * .6); g.gain.linearRampToValueAtTime(m * .4, s + insp);
    g.gain.linearRampToValueAtTime(0.0001, s + per * .95);
    // crepitantes: chasquidos breves al final de la inspiración
    const nCr = Math.round(p.crepit * 14);
    for (let k = 0; k < nCr; k++){ const ct = s + insp * (.35 + Math.random() * .65); const o = a.createBufferSource(); o.buffer = noiseBuf(a, .02); const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900; const gg = a.createGain(); gg.gain.setValueAtTime(.5, ct); gg.gain.exponentialRampToValueAtTime(.001, ct + .015); o.connect(hp).connect(gg).connect(a.destination); o.start(ct); o.stop(ct + .03); }
    // sibilancias: tonos musicales espiratorios
    if (p.sibil > .15){ [440, 610, 760].forEach((f, i) => { if (i / 3 > p.sibil) return; const o = a.createOscillator(), gg = a.createGain(); o.type = "sine"; o.frequency.value = f + Math.random() * 30; gg.gain.setValueAtTime(.0001, s + insp); gg.gain.linearRampToValueAtTime(.05 * p.sibil, s + insp + .15); gg.gain.linearRampToValueAtTime(.0001, s + per * .92); o.connect(gg).connect(a.destination); o.start(s + insp); o.stop(s + per); }); }
  }
  src.start(t0); src.stop(t0 + T);
}
function playHeart(p){
  const a = actx(), T = 6, per = 60 / Math.max(40, Math.min(160, p.hr)), t0 = a.currentTime + .05;
  const thump = (t, f, v) => { const o = a.createOscillator(), g = a.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .6, t + .09); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .11); o.connect(g).connect(a.destination); o.start(t); o.stop(t + .14); };
  for (let t = 0; t < T; t += per){ thump(t0 + t, 70, .6); thump(t0 + t + Math.min(.3, per * .35), 95, .45); if (p.s3) thump(t0 + t + Math.min(.3, per * .35) + .13, 40, .35); }
}

/* ---------------- modales ---------------- */
function openModal(){ $("#ov").classList.add("on"); }
function closeModal(){ $("#ov").classList.remove("on"); $("#modal").classList.remove("wide"); }
document.querySelectorAll("#spd button").forEach(b => b.onclick = () => { speed = +b.dataset.s; document.querySelectorAll("#spd button").forEach(x => x.classList.toggle("on", x === b)); });
$("#skip").onclick = () => { if (!S || ended) return; for (let i = 0; i < 100 && !ended; i++){ E.step(S, .05); tickSim(); } };
$("#fin").onclick = () => confirmFinish();
function confirmFinish(){
  if (!S || ended && $("#ov").classList.contains("on")) return;
  const faltan = [!L.hecho("dx") && "diagnóstico", !L.hecho("destino") && "destino"].filter(Boolean);
  $("#modal").innerHTML = `<h2>¿Finalizar el caso?</h2><p style="color:var(--mut)">${faltan.length ? `Aún no has registrado: <b>${faltan.join(" ni ")}</b> (pestaña «Decisión»). Contarán como no realizados.` : "Se calculará tu evaluación por competencias."}</p>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn" id="cc">Seguir</button><button class="btn pri" id="ok">Finalizar y evaluar</button></div>`;
  openModal(); $("#cc").onclick = closeModal; $("#ok").onclick = () => { closeModal(); ended = true; finish(); };
}

/* ---------------- debriefing ---------------- */
function finish(){
  running = false; ended = true; snapshot();
  const items = E.rubrica(S, L);
  const comps = {};
  items.forEach(it => { const w = it.critico ? 2 : 1; comps[it.comp] = comps[it.comp] || { ok: 0, tot: 0 }; comps[it.comp].tot += w; if (it.ok) comps[it.comp].ok += w; });
  const tot = items.reduce((a, it) => a + (it.critico ? 2 : 1), 0), okw = items.reduce((a, it) => a + (it.ok ? (it.critico ? 2 : 1) : 0), 0);
  let pct = Math.round(okw / tot * 100); if (S.arrest && E.finAlParar !== false) pct = Math.min(pct, 40);
  const critFail = items.filter(i => i.critico && !i.ok);
  const outcome = E.resultado ? E.resultado(S) : S.arrest ? "Parada cardiorrespiratoria" : S.iot ? "Intubado · UCI" : S.spo2 >= 90 && S.wob < .45 && S.gcs >= 14 ? "Estable y mejorando" : "Sigue inestable";
  const caso = E.casos[S.caso], dx = L.ultimo("dx");
  const worst = Object.entries(comps).map(([k, v]) => [k, v.ok / v.tot]).sort((a, b) => a[1] - b[1])[0];
  try{ const H = JSON.parse(localStorage.getItem("motor_hist") || "[]"); H.push({ esc: E.id, caso: S.caso, modo: MODO, pct, crit: critFail.length, arrest: !!S.arrest, comps: Object.fromEntries(Object.entries(comps).map(([k, v]) => [k, Math.round(v.ok / v.tot * 100)])), t: Date.now() }); localStorage.setItem("motor_hist", JSON.stringify(H.slice(-100))); }catch(e){}
  const col = pct >= 80 ? "#4ade80" : pct >= 60 ? "#fbbf24" : "#fb7185";
  const R = 84, C = 2 * Math.PI * R;
  const recurso = typeof E.recursos[worst[0]] === "function" ? E.recursos[worst[0]]() : E.recursos[worst[0]];
  $("#modal").classList.add("wide");
  $("#modal").innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start">
      <div><h2>Debriefing · ${esc(E.titulo)}</h2>
      <p style="color:var(--mut)">${MODO === "tutor" ? "🎓 Modo tutor" : "📝 Modo examen"} · ${mmss(S.t)} simulados · Resultado clínico: <b style="color:${S.arrest ? "#fb7185" : "#e8eefc"}">${outcome}</b></p>
      <p style="margin-top:6px">El paciente tenía: <b style="color:#7dd3fc">${esc(caso.nombre)}</b>. Tu diagnóstico: <b style="color:${dx && dx.p.id === (caso.dx || S.caso) ? "#4ade80" : "#fb7185"}">${dx ? esc(E.diagnosticos.find(d => d.id === dx.p.id).txt) : "no registrado"}</b></p></div>
      <div style="display:flex;gap:8px"><button class="btn" id="rep">↻ Repetir este caso</button><button class="btn pri" id="otro">🎲 Nuevo paciente</button></div></div>
    <div class="dgrid">
      <div><div class="ring"><svg viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="${R}" fill="none" stroke="#1b2741" stroke-width="16"/><circle cx="100" cy="100" r="${R}" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C * pct / 100} ${C}" transform="rotate(-90 100 100)"/></svg><div class="v" style="color:${col}">${pct}%</div></div>
        <p style="text-align:center;color:var(--mut);font-size:12.5px">Desempeño global${S.arrest && E.finAlParar !== false ? " (limitado al 40 % por la parada)" : ""}${critFail.length ? ` · ${critFail.length} acción(es) crítica(s) fallida(s)` : ""}</p></div>
      <div>${Object.entries(comps).map(([k, v]) => { const p = Math.round(v.ok / v.tot * 100), c = p >= 80 ? "#4ade80" : p >= 60 ? "#fbbf24" : "#fb7185"; return `<div class="comp"><span>${esc(E.COMPETENCIAS[k])}</span><b style="text-align:right;color:${c}">${p} %</b><div class="bar"><i style="width:${p}%;background:${c}"></i></div></div>`; }).join("")}</div>
    </div>
    <div class="dgrid" style="grid-template-columns:1fr 1fr">
      <div><div class="sec">✅ Lo que hiciste bien</div><ul class="lst">${items.filter(i => i.ok).map(i => `<li>✓ ${esc(i.txt)}</li>`).join("") || "<li>—</li>"}</ul></div>
      <div><div class="sec">⚠️ Oportunidades de mejora</div><ul class="lst">${items.filter(i => !i.ok).map(i => `<li>✗ ${esc(i.txt)}${i.critico ? `<span class="c">CRÍTICO</span>` : ""}</li>`).join("") || "<li>¡Nada que mejorar en esta rúbrica!</li>"}</ul>
      <div class="reco">📚 <b>Refuerzo recomendado · ${esc(E.COMPETENCIAS[worst[0]])}:</b> ${esc(recurso)}</div></div>
    </div>
    <div class="sec">⏱️ Línea temporal y repetición</div>
    <svg id="chart" viewBox="0 0 1000 300"></svg>
    <div class="replay"><button class="btn" id="play">▶ Reproducir</button><input type="range" id="scrub" min="0" max="${Math.ceil(S.t * 2)}" value="0"><b id="scT" style="font-family:var(--mono)">00:00</b></div>
    <div class="snap" id="snap"></div>
    <div class="log" id="acLog" style="max-height:120px;margin-top:8px"></div>`;
  openModal();
  drawChart();
  const scrub = $("#scrub"); let pl = null;
  const upd = () => { const t = +scrub.value / 2, h = L.estadoEn(t) || HIST[0]; $("#scT").textContent = mmss(t);
    $("#snap").innerHTML = (E.snapVista ? E.snapVista(h) : [["SpO₂", Math.round(h.spo2) + " %"], ["FC", Math.round(h.hr)], ["FR", Math.round(h.rr)], ["PA", Math.round(h.sbp) + "/" + Math.round(h.dbp)], ["GCS", h.gcs], ["pH · PaCO₂", h.ph.toFixed(2) + " · " + Math.round(h.paco2)]]).map(([k, v]) => `<div><small>${k}</small>${v}</div>`).join("");
    $("#acLog").innerHTML = LOG.filter(r => r.t <= t).slice(-8).reverse().map(r => `<div><span>${mmss(r.t)}</span> ${esc(r.txt)}</div>`).join("") || "<div>Sin acciones todavía.</div>";
    const m = document.getElementById("cursor"); if (m){ const x = 50 + t / Math.max(1, S.t) * 930; m.setAttribute("x1", x); m.setAttribute("x2", x); } };
  scrub.oninput = upd; upd();
  $("#play").onclick = () => { if (pl){ clearInterval(pl); pl = null; $("#play").textContent = "▶ Reproducir"; return; } if (+scrub.value >= +scrub.max) scrub.value = 0; $("#play").textContent = "⏸ Pausa"; pl = setInterval(() => { scrub.value = +scrub.value + 1; upd(); if (+scrub.value >= +scrub.max){ clearInterval(pl); pl = null; $("#play").textContent = "▶ Reproducir"; } }, 120); };
  $("#rep").onclick = () => { closeModal(); start(MODO, S.caso); };
  $("#otro").onclick = () => { closeModal(); startModal(); };
}
function drawChart(){
  const T = Math.max(1, S.t), X = t => 50 + t / T * 930;
  const ser = E.grafica || [["spo2", "#22d3ee", 60, 100, "SpO₂"], ["hr", "#4ade80", 40, 180, "FC"], ["rr", "#fde047", 5, 45, "FR"], ["sbp", "#e2e8f0", 60, 200, "PAS"]];
  let s = `<rect x="50" y="10" width="930" height="220" fill="#050a14"/>`;
  if (E.franja) { let st = null; HIST.forEach((h, i) => { const on = !!h[E.franja.key]; if (on && st == null) st = h.t; if ((!on || i === HIST.length - 1) && st != null){ s += `<rect x="${X(st)}" y="10" width="${Math.max(1, X(h.t) - X(st))}" height="220" fill="${E.franja.color}" opacity=".13"/>`; st = null; } }); }
  for (let i = 0; i <= 4; i++) s += `<line x1="50" x2="980" y1="${10 + i * 55}" y2="${10 + i * 55}" stroke="#16213a"/>`;
  for (let m = 0; m <= T; m += T > 40 ? 10 : 5) s += `<text x="${X(m)}" y="246" text-anchor="middle" font-size="11" fill="#64748b">${m}′</text>`;
  ser.forEach(([k, c, lo, hi, n], i) => {
    s += `<polyline fill="none" stroke="${c}" stroke-width="2" points="${HIST.map(h => X(h.t).toFixed(1) + "," + (230 - (cl(+h[k] || 0, lo, hi) - lo) / (hi - lo) * 220).toFixed(1)).join(" ")}"/>`;
    s += `<text x="${60 + i * 80}" y="26" font-size="12" font-weight="700" fill="${c}">${n}</text>`;
  });
  s += `<line x1="50" x2="980" y1="${230 - (90 - 60) / 40 * 220}" y2="${230 - (90 - 60) / 40 * 220}" stroke="#22d3ee" stroke-dasharray="4 4" opacity=".4"/>`;
  LOG.filter(r => r.cat === "tra" || r.cat === "pru" || r.cat === "dec").forEach(r => { const x = X(r.t); s += `<g><line x1="${x}" x2="${x}" y1="254" y2="270" stroke="${r.cat === "tra" ? "#a78bfa" : r.cat === "pru" ? "#38bdf8" : "#fbbf24"}" stroke-width="2"/><circle cx="${x}" cy="276" r="4" fill="${r.cat === "tra" ? "#a78bfa" : r.cat === "pru" ? "#38bdf8" : "#fbbf24"}"><title>${mmss(r.t)} · ${esc(r.txt)}</title></circle></g>`; });
  s += `<text x="50" y="296" font-size="11" fill="#64748b">● tratamientos  ● pruebas  ● decisiones (pasa el ratón por encima)</text>`;
  s += `<line id="cursor" x1="50" x2="50" y1="10" y2="230" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
  $("#chart").innerHTML = s;
}

/* ---------------- inicio ---------------- */
requestAnimationFrame(animPatient);
startModal();
})();
