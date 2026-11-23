/* =====================================================================
   MUNDO EMERGENCIA · escena del mapa (SVG generado)
   Cielo según la hora real, edificios en 2.5D, luces y vehículos.
   ===================================================================== */
"use strict";

/* ---------- Iconos SVG (sustituyen a los emojis: se ven igual en todos los sistemas) ---------- */
const ICONOS = {
  phtls: '<path d="M2 16V8.5A1.5 1.5 0 0 1 3.5 7H14v9"/><path d="M14 10h4l3 3.5V16h-7"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="17.5" cy="17" r="1.8"/><path d="M8 9.5v4M6 11.5h4"/>',
  apad: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M9 2.5h6v2.5H9z"/><path d="M8 10h8M8 13.5h8M8 17h5"/><path d="M15.5 16.5l1.3 1.3 2.4-2.6"/>',
  atls: '<path d="M12 21s-7.5-3.6-7.5-10V5.5L12 3l7.5 2.5V11c0 6.4-7.5 10-7.5 10z"/><path d="M12 8v6M9 11h6"/>',
  rcp: '<path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1z"/><path d="M3.5 12h4l1.5-3 2.5 6 1.5-3h7.5"/>',
  vmni: '<path d="M12 3v8"/><path d="M12 11c-1 1.5-3 2-3 2"/><path d="M12 11c1 1.5 3 2 3 2"/><path d="M8.5 6.5C5 7 3 12 3 16.5 3 19 4.5 20 6.5 19.5 9 19 10 17 10 14.5V9.5c0-2-.5-3-1.5-3z"/><path d="M15.5 6.5C19 7 21 12 21 16.5c0 2.5-1.5 3.5-3.5 3-2.5-.5-3.5-2.5-3.5-5V9.5c0-2 .5-3 1.5-3z"/>',
  turno: '<path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V9z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5c-.6 1 .6 2 0 3M11 2.5c-.6 1 .6 2 0 3M14 2.5c-.6 1 .6 2 0 3"/>',
  cad: '<path d="M12 2.8s-6.5 7.4-6.5 12.1a6.5 6.5 0 0 0 13 0C18.5 10.2 12 2.8 12 2.8z"/><path d="M8.6 15.2h1.8l1-2.2 1.6 4 1.1-1.8h1.4"/>',
  hk: '<path d="M2.5 12h4l2-5 3 10 2.5-7 1.5 2h6"/><text x="16.5" y="7.5" font-size="6.5" font-weight="800" fill="currentColor" stroke="none" font-family="Inter,sans-serif">K</text>',
  gaso: '<path d="M8 3h8M9.5 3v12.5a2.5 2.5 0 0 0 5 0V3"/><path d="M9.5 11h5"/><text x="2" y="22" font-size="6.5" font-weight="800" fill="currentColor" stroke="none" font-family="Inter,sans-serif">pH</text>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
};
function ico(id, size, color, sw){
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color || "currentColor"}" stroke-width="${sw || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[id] || ""}</svg>`;
}

/* ---------- Momento del día (reloj real del usuario) ---------- */
const CIELOS = {
  noche:     { n:"Noche",     s1:"#030713", s2:"#0b1838", s3:"#1b2c5c", mt1:"#0a1530", mt2:"#0e1d40", mt3:"#13264f", sea:"#06122b", g1:"#0b1530", g2:"#070d1f", city:"#0b1634", win:1,   star:1,   lamp:1,   dark:1 },
  amanecer:  { n:"Amanecer",  s1:"#1b2452", s2:"#6b4a7c", s3:"#f39a6b", mt1:"#2a2c55", mt2:"#36385f", mt3:"#45456b", sea:"#3b3f6e", g1:"#1d2448", g2:"#121836", city:"#252a52", win:.55, star:.25, lamp:.6, dark:.7, mix:.12 },
  dia:       { n:"Día",       s1:"#2f6fb8", s2:"#6aa8e0", s3:"#cfe6fb", mt1:"#5b7ea3", mt2:"#4a6d8f", mt3:"#3e5f7f", sea:"#3d7fbf", g1:"#3a5a4a", g2:"#2b4538", city:"#6f86a3", win:.08, star:0,   lamp:0,  dark:0, mix:.42 },
  atardecer: { n:"Atardecer", s1:"#1d1b45", s2:"#7a3f6b", s3:"#ff8a5c", mt1:"#2d2147", mt2:"#3a2a52", mt3:"#4a3460", sea:"#4a3462", g1:"#1c1a3a", g2:"#120f28", city:"#2b2448", win:.7,  star:.2,  lamp:.8, dark:.75, mix:.08 }
};
function momento(forzado){
  if (forzado && CIELOS[forzado]) return forzado;
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h >= 21 || h < 6.5) return "noche";
  if (h < 8.5) return "amanecer";
  if (h < 18.5) return "dia";
  return "atardecer";
}

/* ---------- Utilidades ---------- */
let _seed = 11;
let _mix = 0; // cuánto se aclaran los edificios con luz de día
function tono(hex, k){
  k = k == null ? _mix : k; if (!k) return hex;
  const n = parseInt(hex.slice(1), 16), t = [0xb8, 0xc6, 0xd8];
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v, i) => Math.round(v + (t[i] - v) * k));
  return "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");
}
const rnd = () => (_seed = (_seed * 9301 + 49297) % 233280) / 233280;

/* Edificio 2.5D: fachada, lateral, cubierta y ventanas */
function edificio(o){
  const { x, y, w, h, d = 26, cara = "#1a2a52", lado = "#111d3c", techo = "#22355f", pisos = 4, cols = 6, vent = "#ffd98a", ventFrio = "#9fd8ff", mx = 10, my = 12, ventW, ventH, sinVentanas } = o;
  const dx = d * .75, dy = d * .45;
  const cara2 = tono(cara), lado2 = tono(lado, _mix * .8), techo2 = tono(techo), hueco = _mix ? tono("#0a1226", _mix * 1.2) : "#0a1226";
  let g = `<g>`;
  g += `<path d="M${x + w} ${y} l${dx} ${-dy} v${h} l${-dx} ${dy}z" fill="${lado2}"/>`;
  g += `<path d="M${x} ${y} l${dx} ${-dy} h${w} l${-dx} ${dy}z" fill="${techo2}"/>`;
  g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cara2}"/>`;
  g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#facade)"/>`;
  if (!sinVentanas){
    const cw = (w - mx * 2) / cols, ch = (h - my * 2) / pisos;
    const vw = ventW || cw * .62, vh = ventH || ch * .55;
    for (let r = 0; r < pisos; r++) for (let c = 0; c < cols; c++){
      const on = rnd(), cold = rnd() < .25;
      const vx = x + mx + c * cw + (cw - vw) / 2, vy = y + my + r * ch + (ch - vh) / 2;
      g += `<rect x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${vw.toFixed(1)}" height="${vh.toFixed(1)}" rx="1" fill="${hueco}" opacity=".9"/>`;
      if (on > .28) g += `<rect class="win${on > .9 ? " flick" : ""}" x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${vw.toFixed(1)}" height="${vh.toFixed(1)}" rx="1" fill="${cold ? ventFrio : vent}" opacity="${(.55 + on * .45).toFixed(2)}"/>`;
    }
    // ventanas del lateral
    for (let r = 0; r < pisos; r++){
      const vy = y + my + r * ((h - my * 2) / pisos) + 4;
      g += `<path d="M${x + w + dx * .3} ${vy - dy * .3} l${dx * .4} ${-dy * .4} v${vh * .9} l${-dx * .4} ${dy * .4}z" fill="${hueco}" opacity=".7"/>`;
    }
  }
  g += `</g>`;
  return g;
}

function farola(x, y, h){
  return `<g>
    <ellipse class="lampcone" cx="${x + 10}" cy="${y + h + 6}" rx="44" ry="11" fill="url(#lampFloor)"/>
    <path class="lampcone" d="M${x + 8} ${y + 4} L${x - 22} ${y + h + 6} L${x + 42} ${y + h + 6}Z" fill="url(#lampBeam)"/>
    <path d="M${x} ${y + h + 6} V${y + 2} q0 -6 6 -6 h6" stroke="#3a4766" stroke-width="2.4" fill="none"/>
    <rect x="${x + 6}" y="${y - 6}" width="10" height="4" rx="1.5" fill="#56627f"/>
    <circle class="lampbulb" cx="${x + 11}" cy="${y - 1}" r="2.6" fill="#ffe7a8"/>
  </g>`;
}

function coche(x, y, color, flip, luces){
  const s = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${s} 1)">
    <ellipse cx="0" cy="13" rx="30" ry="4" fill="#000" opacity=".35"/>
    <path d="M-28 6 q0 -6 6 -7 l8 -1 l8 -9 q3 -3 8 -3 h12 q5 0 8 4 l6 8 l6 1 q4 1 4 6 v4 h-56z" fill="${color}"/>
    <path d="M-10 -2 l6 -7 q2 -2 5 -2 h6 v9z M9 -2 v-9 h5 q3 0 5 3 l4 6z" fill="#9cc4e8" opacity=".75"/>
    <rect x="-28" y="6" width="56" height="3" fill="#000" opacity=".25"/>
    <circle cx="-16" cy="10" r="5.2" fill="#0c0f17"/><circle cx="-16" cy="10" r="2.2" fill="#6b7280"/>
    <circle cx="17" cy="10" r="5.2" fill="#0c0f17"/><circle cx="17" cy="10" r="2.2" fill="#6b7280"/>
    ${luces ? `<path class="headl" d="M29 2 L120 -10 L120 22 Z" fill="url(#headBeam)"/><circle cx="28" cy="3" r="2" fill="#fff8d6"/><circle cx="-28" cy="4" r="1.8" fill="#ff3b3b"/>` : ""}
  </g>`;
}

function ambulancia(){
  // ambulancia tipo furgón europeo con damero reflectante
  let checks = "";
  for (let i = 0; i < 12; i++) checks += `<rect x="${-46 + i * 7}" y="4" width="7" height="6" fill="${i % 2 ? "#1f9d55" : "#ffe14d"}"/><rect x="${-46 + i * 7}" y="10" width="7" height="6" fill="${i % 2 ? "#ffe14d" : "#1f9d55"}"/>`;
  return `<g id="ambu">
    <ellipse cx="0" cy="25" rx="52" ry="5" fill="#000" opacity=".4"/>
    <path class="headl" d="M52 8 L190 -8 L190 34 Z" fill="url(#headBeam)"/>
    <path d="M-48 -22 h66 q4 0 4 4 v38 h-70 z" fill="#f4f6f8"/>
    <path d="M22 -10 h14 q5 0 8 4 l8 10 q3 3 3 7 v9 h-33z" fill="#eef1f4"/>
    <path d="M25 -7 h10 q3 0 5 3 l6 8 h-21z" fill="#7fb3dd"/>
    ${checks}
    <rect x="-48" y="-22" width="70" height="3" fill="#ffe14d"/>
    <path d="M-20 -14 v12 M-26 -8 h12" stroke="#1f6fd1" stroke-width="3.2"/>
    <rect x="-44" y="-16" width="16" height="9" rx="1.5" fill="#9cc4e8" opacity=".6"/>
    <rect x="-8" y="-27" width="24" height="5" rx="2" fill="#2a3346"/>
    <rect class="siren a" x="-7" y="-27" width="10" height="5" rx="2" fill="#3aa0ff"/>
    <rect class="siren b" x="5" y="-27" width="10" height="5" rx="2" fill="#3aa0ff"/>
    <circle class="sirenglow a" cx="-2" cy="-25" r="22" fill="url(#blueGlow)"/>
    <circle class="sirenglow b" cx="10" cy="-25" r="22" fill="url(#blueGlow)"/>
    <circle cx="-30" cy="21" r="7" fill="#0c0f17"/><circle cx="-30" cy="21" r="3" fill="#7b8494"/>
    <circle cx="36" cy="21" r="7" fill="#0c0f17"/><circle cx="36" cy="21" r="3" fill="#7b8494"/>
    <circle cx="54" cy="12" r="2.4" fill="#fffbe0"/>
  </g>`;
}

function helicoptero(){
  return `<g id="heli">
    <path class="heliBeam" d="M0 18 L-40 150 L40 150 Z" fill="url(#searchBeam)"/>
    <path d="M-30 4 q4 -16 26 -16 h14 q14 0 18 14 q2 10 -10 12 h-36 q-12 0 -12 -10z" fill="#e5484d"/>
    <path d="M-26 0 q3 -10 16 -10 h4 v12 h-18 q-3 0 -2 -2z" fill="#a9d4f5" opacity=".9"/>
    <path d="M26 -2 h44 l6 -10 h5 l-3 14 h-52z" fill="#e5484d"/>
    <path d="M-6 6 h30" stroke="#fff" stroke-width="2"/>
    <rect x="66" y="-14" width="3" height="12" fill="#2b2f3a" class="tailrotor"/>
    <path d="M-18 16 v5 M14 16 v5 M-26 21 h48" stroke="#2b2f3a" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="-2" y="-16" width="8" height="5" fill="#2b2f3a"/>
    <ellipse class="rotor" cx="2" cy="-17" rx="58" ry="2.2" fill="#c7cfdb" opacity=".55"/>
    <circle class="beacon" cx="10" cy="-11" r="2.2" fill="#ff4040"/>
    <circle class="beacon2" cx="-28" cy="8" r="1.6" fill="#7dff9a"/>
  </g>`;
}

/* ---------- Escena completa ---------- */
function construirEscena(svg, cieloForzado){
  _seed = 11;
  const k = momento(cieloForzado), C = CIELOS[k];
  _mix = C.mix || 0;
  svg.setAttribute("data-cielo", k);
  svg.style.setProperty("--win", C.win);
  svg.style.setProperty("--star", C.star);
  svg.style.setProperty("--lamp", C.lamp);
  svg.style.setProperty("--dark", C.dark);

  let s = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.s1}"/><stop offset=".62" stop-color="${C.s2}"/><stop offset="1" stop-color="${C.s3}"/></linearGradient>
    <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea}"/><stop offset="1" stop-color="${C.g2}"/></linearGradient>
    <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.g1}"/><stop offset="1" stop-color="${C.g2}"/></linearGradient>
    <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.mt1}"/><stop offset="1" stop-color="${C.s3}" stop-opacity=".55"/></linearGradient>
    <linearGradient id="mt2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.mt2}"/><stop offset="1" stop-color="${C.g1}"/></linearGradient>
    <linearGradient id="facade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    <linearGradient id="roadG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2133"/><stop offset="1" stop-color="#11151f"/></linearGradient>
    <radialGradient id="moonGlow"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
    <radialGradient id="sunGlow"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset=".35" stop-color="#ffd27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <radialGradient id="lampFloor"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="lampBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".22"/><stop offset="1" stop-color="#ffe2a0" stop-opacity=".02"/></linearGradient>
    <linearGradient id="headBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6cf" stop-opacity=".55"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></linearGradient>
    <linearGradient id="searchBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f4ff" stop-opacity=".35"/><stop offset="1" stop-color="#e8f4ff" stop-opacity="0"/></linearGradient>
    <radialGradient id="blueGlow"><stop offset="0" stop-color="#3aa0ff" stop-opacity=".8"/><stop offset="1" stop-color="#3aa0ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="redGlow"><stop offset="0" stop-color="#ff3b4e" stop-opacity=".75"/><stop offset="1" stop-color="#ff3b4e" stop-opacity="0"/></radialGradient>
    <radialGradient id="amberGlow"><stop offset="0" stop-color="#ffb02e" stop-opacity=".7"/><stop offset="1" stop-color="#ffb02e" stop-opacity="0"/></radialGradient>
    <radialGradient id="signGlow"><stop offset="0" stop-color="#ff3b4e" stop-opacity=".55"/><stop offset="1" stop-color="#ff3b4e" stop-opacity="0"/></radialGradient>
    <radialGradient id="tealGlow"><stop offset="0" stop-color="#34d399" stop-opacity=".45"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></radialGradient>
    <radialGradient id="pinGlow"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
    <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;

  /* Cielo */
  s += `<rect width="1200" height="620" fill="url(#sky)"/>`;
  let st = "";
  for (let i = 0; i < 140; i++){ const r = rnd(); st += `<circle class="${r > .85 ? "tw" : ""}" cx="${(rnd() * 1200).toFixed(0)}" cy="${(rnd() * 260).toFixed(0)}" r="${(r * 1.2 + .25).toFixed(2)}" fill="#fff" opacity="${(rnd() * .7 + .2).toFixed(2)}" style="animation-delay:${(rnd() * 4).toFixed(1)}s"/>`; }
  s += `<g class="stars">${st}</g>`;
  if (k === "dia") s += `<circle cx="1010" cy="92" r="120" fill="url(#sunGlow)"/><circle cx="1010" cy="92" r="26" fill="#fff6d6"/>`;
  else if (k === "amanecer") s += `<circle cx="180" cy="300" r="160" fill="url(#sunGlow)"/><circle cx="180" cy="298" r="24" fill="#ffd7a0"/>`;
  else if (k === "atardecer") s += `<circle cx="1050" cy="300" r="170" fill="url(#sunGlow)"/><circle cx="1050" cy="300" r="26" fill="#ffb27a"/>`;
  else s += `<circle cx="1010" cy="88" r="80" fill="url(#moonGlow)"/><circle cx="1010" cy="88" r="22" fill="#f3efdc"/><circle cx="1003" cy="82" r="4" fill="#d9d3bb" opacity=".6"/><circle cx="1017" cy="95" r="3" fill="#d9d3bb" opacity=".5"/><circle cx="1012" cy="78" r="2" fill="#d9d3bb" opacity=".5"/>`;
  // nubes
  s += `<g class="clouds" opacity="${k === "dia" ? .85 : .35}" filter="url(#blur8)">
    <g class="cloud c1"><ellipse cx="200" cy="120" rx="110" ry="16" fill="${k === "dia" ? "#ffffff" : "#8a9cc4"}"/><ellipse cx="250" cy="110" rx="60" ry="14" fill="${k === "dia" ? "#ffffff" : "#8a9cc4"}"/></g>
    <g class="cloud c2"><ellipse cx="700" cy="70" rx="140" ry="14" fill="${k === "dia" ? "#ffffff" : "#7b8cb4"}"/><ellipse cx="760" cy="62" rx="70" ry="12" fill="${k === "dia" ? "#ffffff" : "#7b8cb4"}"/></g>
  </g>`;

  /* Montañas (perfil de isla volcánica con un roque) */
  s += `<path d="M0 300 L60 262 L130 238 L190 210 L240 196 L262 168 L268 150 L274 168 L300 182 L360 160 L430 186 L500 214 L560 230 L640 248 L720 262 L800 272 L1200 290 L1200 330 L0 330Z" fill="url(#mt1)"/>`;
  s += `<path d="M0 318 L90 282 L170 270 L260 252 L340 266 L420 248 L520 270 L600 282 L700 290 L1200 300 L1200 336 L0 336Z" fill="url(#mt2)"/>`;
  // luces de pueblos en la ladera
  let vil = "";
  for (let i = 0; i < 70; i++){ const x = rnd() * 700, y = 262 + rnd() * 60 + x * .02; vil += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rnd() * .9 + .4).toFixed(1)}" fill="#ffd27a" opacity="${(rnd() * .6 + .3).toFixed(2)}"/>`; }
  s += `<g class="night-only">${vil}</g>`;

  /* Mar a la derecha con reflejo */
  s += `<path d="M640 300 L1200 290 L1200 345 L640 345Z" fill="url(#seaG)"/>`;
  let refl = "";
  const rx = k === "noche" ? 1010 : k === "atardecer" ? 1050 : k === "dia" ? 1010 : 0;
  if (rx) for (let i = 0; i < 10; i++) refl += `<rect class="shimmer" x="${(rx - 30 + rnd() * 40).toFixed(0)}" y="${296 + i * 4.5}" width="${(14 + rnd() * 40).toFixed(0)}" height="1.4" fill="#fff4cf" opacity="${(.5 - i * .04).toFixed(2)}" style="animation-delay:${(rnd() * 3).toFixed(1)}s"/>`;
  s += refl;
  // barco
  s += `<g transform="translate(1110 302)"><path d="M-14 0 h28 l-4 5 h-20z" fill="#0d1428"/><rect x="-6" y="-6" width="10" height="6" fill="#0d1428"/><circle cx="-2" cy="-3" r="1" fill="#ffd27a" class="night-only"/><circle cx="12" cy="1" r="1" fill="#ff5050" class="blinkslow"/></g>`;

  /* Ciudad lejana */
  let city = "";
  let cx = 560;
  while (cx < 1200){
    const w = 18 + rnd() * 34, h = 18 + rnd() * 50;
    city += `<rect x="${cx.toFixed(0)}" y="${(340 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${C.city}"/>`;
    for (let yy = 340 - h + 5; yy < 334; yy += 7) for (let xx = cx + 3; xx < cx + w - 3; xx += 6) if (rnd() > .62) city += `<rect class="win" x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="2.4" height="2.6" fill="#ffd98a" opacity="${(.4 + rnd() * .5).toFixed(2)}"/>`;
    cx += w + 2 + rnd() * 6;
  }
  s += `<g opacity=".95">${city}</g>`;

  /* Suelo */
  s += `<rect y="335" width="1200" height="285" fill="url(#groundG)"/>`;
  // palmeras y vegetación
  const palmera = (x, y, sc) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 0 q-3 -30 3 -58" stroke="#1a2236" stroke-width="4" fill="none"/><g fill="#14301f"><path d="M3 -58 q-26 -6 -40 8 q22 -12 40 -8z"/><path d="M3 -58 q24 -10 40 4 q-22 -10 -40 -4z"/><path d="M3 -58 q-14 -20 -34 -20 q22 6 34 20z"/><path d="M3 -58 q14 -22 34 -18 q-22 4 -34 18z"/><path d="M3 -58 q2 -18 -6 -30 q12 12 6 30z"/></g></g>`;
  s += palmera(270, 470, 1) + palmera(500, 474, .85) + palmera(975, 474, .9) + palmera(1170, 478, 1.05) + palmera(60, 462, .95);

  /* Base SVA (AmbulancePad) */
  s += edificio({ x: 300, y: 400, w: 170, h: 74, d: 30, cara: "#1c2742", lado: "#121a2f", techo: "#26344f", sinVentanas: true });
  s += `<g>
    <rect x="312" y="420" width="62" height="54" fill="#0b1120"/><rect x="384" y="420" width="62" height="54" fill="#2a3550"/>
    ${[0,1,2,3,4,5].map(i => `<rect x="384" y="${422 + i * 9}" width="62" height="1.4" fill="#1a2238"/>`).join("")}
    <rect x="312" y="420" width="62" height="54" fill="#ffe7a8" opacity=".14" class="win"/>
    <g transform="translate(343 462) scale(.42)"><path d="M-48 -22 h66 q4 0 4 4 v38 h-70 z" fill="#f4f6f8"/><path d="M22 -10 h14 q5 0 8 4 l8 10 q3 3 3 7 v9 h-33z" fill="#eef1f4"/>${Array.from({length:12},(_, i) => `<rect x="${-46 + i * 7}" y="6" width="7" height="8" fill="${i % 2 ? "#1f9d55" : "#ffe14d"}"/>`).join("")}<circle cx="-30" cy="21" r="7" fill="#0c0f17"/><circle cx="36" cy="21" r="7" fill="#0c0f17"/></g>
    <rect x="330" y="404" width="110" height="12" rx="2" fill="#0d1428"/>
    <text x="385" y="413.5" text-anchor="middle" font-size="9" font-weight="800" font-family="Sora,Inter,sans-serif" fill="#ffd34d" letter-spacing="1.5">BASE SVA</text>
    <rect x="452" y="426" width="10" height="14" rx="1" fill="#ffd98a" opacity=".8" class="win"/>
  </g>`;

  /* Hospital: bloque principal + ala respiratoria */
  s += edificio({ x: 530, y: 196, w: 260, h: 278, d: 44, cara: "#1b2a54", lado: "#121d3d", techo: "#24376a", pisos: 8, cols: 9 });
  // franja de urgencias, marquesina y rótulo luminoso
  s += `<g>
    <rect x="530" y="420" width="260" height="54" fill="${tono("#141f40")}"/>
    <rect x="575" y="436" width="96" height="38" fill="#0a1124"/><rect x="575" y="436" width="96" height="38" fill="#9fd8ff" opacity=".22" class="win"/>
    <path d="M565 432 h120 l10 -10 h-120z" fill="#e8ecf4"/><rect x="565" y="432" width="120" height="4" fill="#c9d1e0"/>
    <path d="M572 436 v38 M678 436 v38" stroke="#c9d1e0" stroke-width="2.5"/>
    <ellipse cx="660" cy="408" rx="90" ry="22" fill="url(#signGlow)" class="night-only"/>
    <rect x="606" y="398" width="112" height="18" rx="3" fill="#2b0710"/>
    <text x="662" y="411.5" text-anchor="middle" font-size="11" font-weight="800" font-family="Sora,Inter,sans-serif" fill="#ff4d5e" letter-spacing="2" filter="url(#glow)">URGENCIAS</text>
    <rect x="700" y="438" width="72" height="36" fill="#0a1124"/><rect x="700" y="438" width="72" height="36" fill="#ffd98a" opacity=".12" class="win"/>
  </g>`;
  s += edificio({ x: 790, y: 330, w: 150, h: 144, d: 34, cara: "#183140", lado: "#10232f", techo: "#21414f", pisos: 4, cols: 5, vent: "#a5f3d0", ventFrio: "#7ee7ff" });
  s += `<rect x="790" y="340" width="150" height="4" fill="#34d399" opacity=".5"/>`;
  s += `<text x="865" y="460" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Sora,Inter,sans-serif" fill="#7ef0c7" opacity=".9" letter-spacing="1">NEUMOLOGÍA · UCRI</text>`;
  // cruz en fachada
  s += `<g transform="translate(560 218)"><rect x="-1" y="-1" width="30" height="30" rx="5" fill="#fff" opacity=".08"/><rect x="0" y="0" width="28" height="28" rx="5" fill="#e5484d"/><rect x="11" y="5" width="6" height="18" fill="#fff"/><rect x="5" y="11" width="18" height="6" fill="#fff"/></g>`;
  // helipuerto en azotea
  s += `<g transform="translate(693 174)">
    <ellipse cx="0" cy="0" rx="62" ry="17" fill="#2d3e70"/><ellipse cx="0" cy="0" rx="50" ry="13" fill="none" stroke="#fbbf24" stroke-width="2" opacity=".8"/>
    <text x="0" y="5" text-anchor="middle" font-size="15" font-weight="800" fill="#fbbf24" transform="scale(1 .55)" font-family="Sora,Inter,sans-serif">H</text>
    ${Array.from({length:10},(_, i) => { const a = i / 10 * Math.PI * 2; return `<circle class="padlight" cx="${(Math.cos(a) * 60).toFixed(1)}" cy="${(Math.sin(a) * 16).toFixed(1)}" r="1.8" fill="#7dff9a" style="animation-delay:${(i * .12).toFixed(2)}s"/>`; }).join("")}
  </g>`;
  // antena con baliza
  s += `<path d="M560 196 l14 -9 v-28" stroke="#3a4766" stroke-width="2"/><circle cx="574" cy="158" r="2.6" fill="#ff4040" class="blinkslow"/>`;

  /* Cafetería / sala de descanso */
  s += edificio({ x: 1000, y: 404, w: 140, h: 70, d: 26, cara: "#2a1f4a", lado: "#1d1535", techo: "#382a60", pisos: 1, cols: 3, my: 18, vent: "#ffcf8a" });
  s += `<g><rect x="1020" y="388" width="100" height="14" rx="3" fill="#160f2c"/><text x="1070" y="398.5" text-anchor="middle" font-size="9" font-weight="800" font-family="Sora,Inter,sans-serif" fill="#c4b5fd" letter-spacing="1.5" filter="url(#glow)">CAFETERÍA</text>
    <path d="M1000 404 h140 l6 -6 h-140z" fill="#7c3aed" opacity=".55"/></g>`;

  /* Aceras y carretera */
  s += `<path d="M0 492 C 300 482, 600 500, 900 488 S 1200 482, 1200 482 L1200 500 C 900 504, 600 516, 300 500 S 0 508, 0 508Z" fill="#2a3246"/>`;
  s += `<path d="M0 506 C 300 496, 600 514, 900 502 S 1200 498, 1200 498 L1200 586 C 900 590, 600 600, 300 588 S 0 594, 0 594Z" fill="url(#roadG)"/>`;
  s += `<path d="M0 550 C 300 540, 600 558, 900 546 S 1200 542, 1200 542" stroke="#f5d35b" stroke-width="2.4" stroke-dasharray="26 22" fill="none" opacity=".7"/>`;
  s += `<path d="M0 509 C 300 499, 600 517, 900 505 S 1200 501, 1200 501" stroke="#d7dce6" stroke-width="1.6" fill="none" opacity=".45"/>`;
  s += `<path d="M0 591 C 300 585, 600 597, 900 587 S 1200 583, 1200 583" stroke="#d7dce6" stroke-width="1.6" fill="none" opacity=".45"/>`;
  // guardarraíl
  s += `<path d="M0 600 C 300 594, 600 606, 900 596 S 1200 592, 1200 592" stroke="#5b6680" stroke-width="3" fill="none"/>`;
  for (let i = 0; i < 24; i++) s += `<rect x="${i * 52 + 6}" y="${596 + Math.sin(i) * 3}" width="2" height="12" fill="#3f4960"/>`;
  // farolas
  [90, 250, 480, 760, 960, 1140].forEach(x => { s += `<g class="lamp">${farola(x, 430, 60)}</g>`; });

  /* Escena del accidente */
  s += `<g>
    <circle class="flashR" cx="150" cy="530" r="70" fill="url(#redGlow)"/>
    <circle class="flashB" cx="215" cy="530" r="70" fill="url(#blueGlow)"/>
    <circle class="flashA" cx="180" cy="560" r="55" fill="url(#amberGlow)"/>
    <g transform="rotate(-14 150 545)">${coche(150, 538, "#4b5f8a", false, false)}</g>
    <g transform="rotate(22 222 550)">${coche(222, 545, "#8a8f9c", true, false)}</g>
    <path d="M196 556 l5 -3 l4 4 l-5 2z M210 560 l6 -1 l1 4 z M186 562 l4 1 l-2 3z" fill="#c9d1e0" opacity=".7"/>
    ${[[95,572],[118,580],[265,566],[288,574]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-6 6 L0 -10 L6 6Z" fill="#ff7a1a"/><rect x="-4.5" y="-2" width="9" height="2.5" fill="#fff"/><rect x="-8" y="6" width="16" height="2.5" fill="#2b2f3a"/></g>`).join("")}
    <circle cx="245" cy="582" r="2.4" fill="#ff5a1f" class="flare"/><circle cx="245" cy="582" r="14" fill="url(#redGlow)" class="flare"/>
  </g>`;

  /* Tráfico */
  s += `<g class="traffic t1">${coche(0, 566, "#2f3b55", false, true)}</g>`;
  s += `<g class="traffic t2">${coche(0, 528, "#6b2737", true, true)}</g>`;
  s += `<g class="ambwrap">${ambulancia()}</g>`;
  s += `<g class="heliwrap">${helicoptero()}</g>`;

  /* Viñeta y capa de nodos */
  s += `<rect width="1200" height="620" fill="url(#vignette)" pointer-events="none"/>`;
  s += `<path id="route" d="" stroke="#ffffff" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round" fill="none" opacity=".55"/>`;
  s += `<g id="nodes"></g>`;
  svg.innerHTML = s;
  return { clave: k, nombre: C.n };
}
