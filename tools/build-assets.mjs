#!/usr/bin/env node
// Generates the profile README graphics (assets/*.svg).
// All display text is outlined to paths so the typography renders identically
// everywhere (GitHub serves README SVGs through <img>, which cannot load web fonts).
//
//   node tools/build-assets.mjs            → writes assets/*.svg
//
// Fonts (SIL Open Font License) live in tools/fonts/:
//   Michroma        — wide geometric display face (Eurostile-Extended lineage)
//   Share Tech Mono — readouts, labels, body copy

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = process.env.FONT_DIR || path.join(here, "fonts");
const OUT_DIR = process.env.OUT_DIR || path.join(here, "..", "assets");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------- palette
const C = {
  space: "#04070D",
  panel: "#0A1220",
  panel2: "#0F1B2E",
  edge: "#1E3049",
  edge2: "#2C4262",
  amber: "#FF9E2C",
  amberHi: "#FFC46B",
  amberDim: "#8A5619",
  cyan: "#4FD1E8",
  text: "#E6EDF5",
  soft: "#DCE6F0",
  muted: "#8FA3BB",
  dim: "#52657C",
};

// ---------------------------------------------------------------- fonts
function loadFont(file) {
  const buf = fs.readFileSync(path.join(FONT_DIR, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
const F = {
  display: loadFont("Michroma-Regular.ttf"),
  mono: loadFont("ShareTechMono-Regular.ttf"),
};

// Replace glyphs the font lacks with safe fallbacks.
function sanitize(font, text) {
  return [...text]
    .map((ch) => (font.charToGlyphIndex(ch) > 0 ? ch : { "·": "/", "◢": ">", "°": "d", "—": "-", "–": "-" }[ch] ?? ch))
    .join("");
}

function textWidth(font, text, size, ls = 0) {
  return font.getAdvanceWidth(sanitize(font, text), size, { kerning: true, letterSpacing: ls });
}

/** Outlined text → <path>. anchor: start | middle | end. ls = letter spacing in em. */
function T(fontKey, text, x, y, size, { ls = 0, anchor = "start", fill = C.text, attrs = "" } = {}) {
  const font = F[fontKey];
  const clean = sanitize(font, text);
  const w = textWidth(font, clean, size, ls);
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const d = font.getPath(clean, x0, y, size, { kerning: true, letterSpacing: ls }).toPathData(2);
  return `<path d="${d}" fill="${fill}" ${attrs}/>`;
}

// Fit display text into maxWidth by shrinking size.
function fitSize(fontKey, text, maxWidth, startSize, ls) {
  let s = startSize;
  while (s > 8 && textWidth(F[fontKey], text, s, ls) > maxWidth) s -= 0.5;
  return s;
}

// ---------------------------------------------------------------- geometry
/** Chamfered rectangle polygon points. cuts = {tl,tr,br,bl} in px. */
function chamfer(x, y, w, h, cuts) {
  const { tl = 0, tr = 0, br = 0, bl = 0 } = cuts;
  const p = [
    [x + tl, y],
    [x + w - tr, y],
    [x + w, y + tr],
    [x + w, y + h - br],
    [x + w - br, y + h],
    [x + bl, y + h],
    [x, y + h - bl],
    [x, y + tl],
  ];
  return p.map(([px, py]) => `${px},${py}`).join(" ");
}

function bracket(x, y, len, dirX, dirY, stroke = C.amber) {
  // L-shaped corner bracket, opening toward (dirX, dirY).
  return `<path d="M${x} ${y + len * dirY} V${y} H${x + len * dirX}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
}

function hexPoints(cx, cy, r, flat = true) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + (flat ? 0 : Math.PI / 6);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

// Deterministic PRNG so builds are reproducible.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- shared defs
function hexPatternDef(id, r = 14, opacity = 0.05) {
  const w = Math.sqrt(3) * r;
  const h = 3 * r;
  // Two pointy-top hexes tile a (w × 3r) cell.
  const hexA = hexPoints(w / 2, r, r, false);
  const hexB = hexPoints(0, r * 2.5, r, false);
  const hexC = hexPoints(w, r * 2.5, r, false);
  return `<pattern id="${id}" width="${w.toFixed(3)}" height="${h}" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="#9FC4FF" stroke-opacity="${opacity}" stroke-width="0.8">
      <polygon points="${hexA}"/><polygon points="${hexB}"/><polygon points="${hexC}"/>
    </g>
  </pattern>`;
}

function scanlinesDef(id, opacity = 0.05) {
  return `<pattern id="${id}" width="4" height="3" patternUnits="userSpaceOnUse">
    <rect width="4" height="1" fill="#000000" fill-opacity="${opacity}"/>
  </pattern>`;
}

const GLOW = `<filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

const HEAD = (w, h, title, desc) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
  <title id="t">${title}</title>
  <desc id="d">${desc}</desc>`;

// ================================================================ HERO
function hero() {
  const W = 960, H = 300;
  const rnd = mulberry32(20260815);
  const P = { x: 24, y: 24, w: 912, h: 252 };
  const cx = 816, cy = 150; // relay ring

  // Star field
  let stars = "";
  for (let i = 0; i < 90; i++) {
    const x = (rnd() * W).toFixed(1);
    const y = (rnd() * H).toFixed(1);
    const r = (0.5 + rnd() * 0.9).toFixed(2);
    const o = (0.25 + rnd() * 0.6).toFixed(2);
    const twinkle = rnd() < 0.3;
    const dur = (2.5 + rnd() * 4).toFixed(1);
    const beg = (rnd() * 4).toFixed(1);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#CFE3FF" opacity="${o}">${
      twinkle ? `<animate attributeName="opacity" values="${o};0.08;${o}" dur="${dur}s" begin="${beg}s" repeatCount="indefinite"/>` : ""
    }</circle>`;
  }

  // Left segmented meter
  let meter = "";
  const segs = 12;
  for (let i = 0; i < segs; i++) {
    const y = 64 + i * 15;
    const lit = i < 9;
    meter += `<rect x="44" y="${y}" width="4" height="11" fill="${lit ? C.amber : C.amberDim}" opacity="${lit ? 1 : 0.55}"/>`;
  }

  // Name — fit to width
  const NAME = "ISHTIAQUE HOSSAIN";
  const nameSize = fitSize("display", NAME, 620, 36, 0.05);

  // Ring ticks
  let ticks = "";
  for (let i = 0; i < 36; i++) {
    const a = (Math.PI * 2 * i) / 36;
    const major = i % 6 === 0;
    const r1 = major ? 60 : 63, r2 = 67;
    ticks += `<line x1="${(cx + r1 * Math.cos(a)).toFixed(2)}" y1="${(cy + r1 * Math.sin(a)).toFixed(2)}" x2="${(cx + r2 * Math.cos(a)).toFixed(2)}" y2="${(cy + r2 * Math.sin(a)).toFixed(2)}" stroke="${major ? C.amber : C.edge2}" stroke-width="${major ? 1.5 : 1}"/>`;
  }

  // Readout cells
  const cells = [
    { k: "STATUS", v: "ONLINE", color: C.cyan, dot: true },
    { k: "LOCATION", v: "49.28°N  123.12°W", color: C.soft },
    { k: "UPLINK", v: "ISHTI.DEV", color: C.amber },
    { k: "UPSTREAM", v: "ML-EXPLORE / MLX", color: C.soft },
  ];
  let readouts = "";
  let rx = 64;
  const ky = 224, vy = 243;
  cells.forEach((c, i) => {
    if (i > 0) {
      readouts += `<line x1="${rx - 14}" y1="${ky - 10}" x2="${rx - 14}" y2="${vy + 3}" stroke="${C.edge2}"/>`;
    }
    readouts += T("mono", c.k, rx, ky, 9, { ls: 0.28, fill: C.dim });
    let vx = rx;
    if (c.dot) {
      readouts += `<circle cx="${rx + 4}" cy="${vy - 4}" r="3" fill="${C.cyan}" filter="url(#glow)"><animate attributeName="opacity" values="1;0.25;1" dur="1.8s" repeatCount="indefinite"/></circle>`;
      vx = rx + 14;
    }
    readouts += T("mono", c.v, vx, vy, 12.5, { ls: 0.08, fill: c.color });
    const w = Math.max(textWidth(F.mono, c.k, 9, 0.28), textWidth(F.mono, c.v, 12.5, 0.08) + (c.dot ? 14 : 0));
    rx += w + 30;
  });

  const nameGlow = T("display", NAME, 64, 126, nameSize, { ls: 0.05, fill: C.amber, attrs: `opacity="0.55" filter="url(#glow)"` });
  const nameMain = T("display", NAME, 64, 126, nameSize, { ls: 0.05, fill: C.amberHi });

  return `${HEAD(W, H, "Ishtiaque Hossain", "Solo founder and engineer in Vancouver. Maker of fine Porcine Software. Status: online. Uplink: ishti.dev. Upstream: ml-explore/mlx.")}
  <defs>
    <radialGradient id="g-amber" cx="0.18" cy="1" r="0.75"><stop offset="0" stop-color="${C.amber}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-cyan" cx="0.92" cy="0" r="0.6"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.14"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
    <linearGradient id="g-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.panel2}"/><stop offset="0.55" stop-color="${C.panel}"/><stop offset="1" stop-color="#070D18"/></linearGradient>
    <linearGradient id="g-sweep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.amber}" stop-opacity="0"/><stop offset="0.85" stop-color="${C.amber}" stop-opacity="0.10"/><stop offset="1" stop-color="${C.amberHi}" stop-opacity="0.35"/></linearGradient>
    <linearGradient id="g-edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.amber}" stop-opacity="0"/><stop offset="0.15" stop-color="${C.amber}"/><stop offset="0.85" stop-color="${C.amber}"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></linearGradient>
    ${hexPatternDef("hex", 15, 0.06)}
    ${scanlinesDef("scan", 0.06)}
    ${GLOW}
    <clipPath id="clip-panel"><polygon points="${chamfer(P.x, P.y, P.w, P.h, { tl: 24, tr: 8, br: 24, bl: 8 })}"/></clipPath>
  </defs>

  <!-- deep space -->
  <rect width="${W}" height="${H}" fill="${C.space}"/>
  <rect width="${W}" height="${H}" fill="url(#hex)"/>
  <g>${stars}</g>
  <rect width="${W}" height="${H}" fill="url(#g-amber)"/>
  <rect width="${W}" height="${H}" fill="url(#g-cyan)"/>

  <!-- main panel -->
  <polygon points="${chamfer(P.x, P.y, P.w, P.h, { tl: 24, tr: 8, br: 24, bl: 8 })}" fill="url(#g-panel)" fill-opacity="0.9" stroke="${C.edge2}"/>
  <g clip-path="url(#clip-panel)">
    <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="url(#hex)" opacity="0.5"/>
    <!-- holo scan sweep -->
    <rect x="${P.x}" y="-90" width="${P.w}" height="90" fill="url(#g-sweep)">
      <animateTransform attributeName="transform" type="translate" from="0 0" to="0 ${H + 90}" dur="7s" repeatCount="indefinite"/>
    </rect>
    <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="url(#scan)"/>
  </g>
  <!-- amber edge highlights -->
  <path d="M${P.x + 24} ${P.y} H${P.x + 300}" stroke="url(#g-edge)" stroke-width="2"/>
  <path d="M${P.x + P.w - 24} ${P.y + P.h} H${P.x + P.w - 300}" stroke="url(#g-edge)" stroke-width="2"/>
  <!-- corner brackets -->
  ${bracket(14, 14, 20, 1, 1)}
  ${bracket(946, 14, 20, -1, 1)}
  ${bracket(14, 286, 20, 1, -1)}
  ${bracket(946, 286, 20, -1, -1)}

  <!-- top-right micro label -->
  <rect x="${P.x + P.w - 22 - 4}" y="41" width="4" height="4" fill="${C.amber}"/>
  ${T("mono", "PORCINE SOFTWARE  //  OPS", P.x + P.w - 34, 46, 9.5, { ls: 0.22, anchor: "end", fill: C.dim })}

  <!-- left meter + copy -->
  ${meter}
  <path d="M64 70 L70 76 L64 82 Z" fill="${C.amber}"/>
  ${T("mono", "DOSSIER  //  ISHTIHOSS  //  CLEARANCE: PUBLIC", 78, 79.5, 10.5, { ls: 0.22, fill: C.amber })}
  ${nameGlow}
  ${nameMain}
  ${T("mono", "SOLO FOUNDER  ·  ENGINEER  ·  VANCOUVER", 64, 158, 15, { ls: 0.2, fill: C.soft })}
  ${T("mono", "Maker of fine Porcine Software.  AI-native tools, built and operated end to end.", 64, 186, 13, { ls: 0.02, fill: C.muted })}

  <!-- readouts -->
  <path d="M64 206 H700" stroke="${C.edge}"/>
  ${readouts}

  <!-- relay ring -->
  <g>
    <circle cx="${cx}" cy="${cy}" r="98" fill="none" stroke="${C.edge2}"/>
    <circle cx="${cx}" cy="${cy}" r="98" fill="${C.panel}" fill-opacity="0.35"/>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="48s" repeatCount="indefinite"/>
      <circle cx="${cx}" cy="${cy}" r="88" fill="none" stroke="${C.amber}" stroke-width="2" stroke-dasharray="3 9" opacity="0.85"/>
      <circle cx="${cx + 88}" cy="${cy}" r="3.2" fill="${C.cyan}" filter="url(#glow)"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="360 ${cx} ${cy}" to="0 ${cx} ${cy}" dur="22s" repeatCount="indefinite"/>
      <circle cx="${cx}" cy="${cy}" r="76" fill="none" stroke="${C.cyan}" stroke-width="1.5" stroke-dasharray="48 190.7" opacity="0.9"/>
      <circle cx="${cx}" cy="${cy - 76}" r="2.4" fill="${C.amber}"/>
    </g>
    ${ticks}
    <circle cx="${cx}" cy="${cy}" r="52" fill="none" stroke="${C.amber}" stroke-width="1.25" opacity="0.9"/>
    <polygon points="${hexPoints(cx, cy, 42, true)}" fill="${C.panel2}" stroke="${C.edge2}"/>
    <polygon points="${hexPoints(cx, cy, 36, true)}" fill="none" stroke="${C.amber}" stroke-opacity="0.35"/>
    ${T("display", "IH", cx, cy + 10, 26, { ls: 0.08, anchor: "middle", fill: C.amber, attrs: `opacity="0.5" filter="url(#glow)"` })}
    ${T("display", "IH", cx, cy + 10, 26, { ls: 0.08, anchor: "middle", fill: C.amberHi })}
    ${T("mono", "CORE  ·  NOMINAL", cx, 266, 9, { ls: 0.28, anchor: "middle", fill: C.dim })}
  </g>
</svg>`;
}

// ================================================================ SECTION BAR
function section(index, title, sub) {
  const W = 960, H = 44;
  const tabW = 66;
  const titleX = tabW + 22;
  const titleSize = 14;
  const titleW = textWidth(F.display, title, titleSize, 0.16);
  const subW = textWidth(F.mono, sub, 9.5, 0.24);
  const lineX1 = titleX + titleW + 22;
  const nodeX = 940 - subW - 26;
  return `${HEAD(W, H, `${index} · ${title}`, sub)}
  <defs>${hexPatternDef("hex", 12, 0.05)}${scanlinesDef("scan", 0.05)}</defs>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 12, br: 12 })}" fill="${C.panel}" stroke="${C.edge2}"/>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 12, br: 12 })}" fill="url(#hex)"/>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 12, br: 12 })}" fill="url(#scan)"/>
  <polygon points="${chamfer(0.5, 0.5, tabW, H - 1, { tl: 12, br: 10 })}" fill="${C.amber}"/>
  ${T("display", index, tabW / 2 + 1, 28, 15, { ls: 0.08, anchor: "middle", fill: C.panel })}
  <path d="M${tabW + 8} 8 V36" stroke="${C.amber}" stroke-width="1.5" opacity="0.7"/>
  ${T("display", title, titleX, 28, titleSize, { ls: 0.16, fill: C.amber })}
  <path d="M${lineX1} 22 H${nodeX - 12}" stroke="${C.edge2}"/>
  <polygon points="${nodeX},17 ${nodeX + 5},22 ${nodeX},27 ${nodeX - 5},22" fill="${C.amber}"/>
  ${T("mono", sub, 940, 25.5, 9.5, { ls: 0.24, anchor: "end", fill: C.muted })}
  <path d="M${W - 24} 1 H${W - 140}" stroke="${C.amber}" stroke-width="2" opacity="0.6"/>
</svg>`;
}

// ================================================================ LOADOUT PANEL
function loadout() {
  const W = 960, H = 140;
  const cols = [
    { title: "PRODUCT & INTERFACE", items: ["TypeScript", "JavaScript", "React", "Next.js"] },
    { title: "BACKEND & DATA", items: ["Python", "Node.js", "FastAPI", "PostgreSQL"] },
    { title: "SYSTEMS & INFRA", items: ["MLX", "AWS", "Cloudflare", "Linux", "Git"] },
  ];
  const colX = [28, 336, 644];
  const colW = 288;
  let body = "";
  cols.forEach((col, i) => {
    const x = colX[i];
    body += `<rect x="${x}" y="24" width="4" height="12" fill="${C.amber}"/>`;
    body += T("display", col.title, x + 12, 34, 10.5, { ls: 0.14, fill: C.amber });
    body += `<path d="M${x} 46 H${x + colW}" stroke="${C.edge}"/>`;
    if (i > 0) body += `<path d="M${x - 24} 20 V${H - 20}" stroke="${C.edge}"/>`;
    // chips (flow layout)
    let cx = x, cy = 60;
    const chipH = 24, gap = 8, pad = 11, size = 12.5;
    for (const item of col.items) {
      const w = Math.ceil(textWidth(F.mono, item, size, 0.06) + pad * 2);
      if (cx + w > x + colW) { cx = x; cy += chipH + gap; }
      body += `<polygon points="${chamfer(cx + 0.5, cy + 0.5, w - 1, chipH - 1, { tl: 6, br: 6 })}" fill="${C.panel2}" stroke="${C.edge2}"/>`;
      body += `<rect x="${cx + 5}" y="${cy + chipH / 2 - 2}" width="3" height="4" fill="${C.amber}" opacity="0.9"/>`;
      body += T("mono", item, cx + pad + 3, cy + chipH / 2 + 4.5, size, { ls: 0.06, fill: C.soft });
      cx += w + gap;
    }
  });
  return `${HEAD(W, H, "Loadout", "Product and interface: TypeScript, JavaScript, React, Next.js. Backend and data: Python, Node.js, FastAPI, PostgreSQL. Systems and infrastructure: MLX, AWS, Cloudflare, Linux, Git.")}
  <defs>${hexPatternDef("hex", 14, 0.045)}${scanlinesDef("scan", 0.05)}</defs>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 16, tr: 6, br: 16, bl: 6 })}" fill="${C.panel}" stroke="${C.edge2}"/>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 16, tr: 6, br: 16, bl: 6 })}" fill="url(#hex)"/>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 16, tr: 6, br: 16, bl: 6 })}" fill="url(#scan)"/>
  <path d="M16 1 H220" stroke="${C.amber}" stroke-width="2" opacity="0.7"/>
  <path d="M${W - 16} ${H - 1} H${W - 220}" stroke="${C.amber}" stroke-width="2" opacity="0.7"/>
  ${body}
  ${T("mono", "LOADOUT  //  FULL-STACK  //  SHIP & OPERATE", W - 24, H - 12, 9, { ls: 0.24, anchor: "end", fill: C.muted, attrs: `opacity="0.8"` })}
</svg>`;
}

// ================================================================ FOOTER
function footer() {
  const W = 960, H = 52;
  const msg = "END OF DOSSIER  //  BUILDING FROM VANCOUVER  ·  DESIGN  ·  CODE  ·  INFRASTRUCTURE  ·  SUPPORT";
  const size = 10.5, ls = 0.22;
  const w = textWidth(F.mono, msg, size, ls);
  const x0 = (W - w) / 2;
  return `${HEAD(W, H, "End of dossier", "Building from Vancouver: design, code, infrastructure, support.")}
  <defs>${scanlinesDef("scan", 0.05)}</defs>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 12, tr: 12, br: 12, bl: 12 })}" fill="${C.panel}" stroke="${C.edge2}"/>
  <polygon points="${chamfer(0.5, 0.5, W - 1, H - 1, { tl: 12, tr: 12, br: 12, bl: 12 })}" fill="url(#scan)"/>
  <g fill="${C.amber}"><rect x="24" y="22" width="5" height="8"/><rect x="33" y="22" width="5" height="8" opacity="0.6"/><rect x="42" y="22" width="5" height="8" opacity="0.3"/></g>
  <g fill="${C.amber}"><rect x="${W - 29}" y="22" width="5" height="8"/><rect x="${W - 38}" y="22" width="5" height="8" opacity="0.6"/><rect x="${W - 47}" y="22" width="5" height="8" opacity="0.3"/></g>
  ${T("mono", msg, x0, 30, size, { ls, fill: C.muted })}
  <rect x="${(x0 + w + 6).toFixed(1)}" y="20" width="7" height="12" fill="${C.amber}"><animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite"/></rect>
</svg>`;
}

// ================================================================ write
const files = {
  "profile-header.svg": hero(),
  "section-01-dossier.svg": section("01", "DOSSIER", "PERSONNEL FILE"),
  "section-02-operations.svg": section("02", "ACTIVE OPERATIONS", "DEPLOYED PRODUCTS"),
  "section-03-upstream.svg": section("03", "UPSTREAM", "OPEN SOURCE"),
  "section-04-loadout.svg": section("04", "LOADOUT", "TECHNICAL RANGE"),
  "section-05-telemetry.svg": section("05", "TELEMETRY", "GITHUB ACTIVITY"),
  "loadout.svg": loadout(),
  "footer.svg": footer(),
};
for (const [name, svg] of Object.entries(files)) {
  const out = path.join(OUT_DIR, name);
  fs.writeFileSync(out, svg.replace(/\n\s*\n/g, "\n") + "\n");
  console.log(`wrote ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
}
