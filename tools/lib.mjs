// Shared helpers for the profile graphics generators: palette, outlined
// typography (opentype.js), chamfered geometry, patterns and filters.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

export const here = path.dirname(fileURLToPath(import.meta.url));
export const FONT_DIR = process.env.FONT_DIR || path.join(here, "fonts");

// ---------------------------------------------------------------- palette
export const C = {
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
export const F = {
  display: loadFont("Michroma-Regular.ttf"),
  mono: loadFont("ShareTechMono-Regular.ttf"),
};

// Replace glyphs the font lacks with safe fallbacks.
export function sanitize(font, text) {
  return [...text]
    .map((ch) => (font.charToGlyphIndex(ch) > 0 ? ch : { "·": "/", "◢": ">", "°": "d", "—": "-", "–": "-", "→": "->", "•": "*" }[ch] ?? ch))
    .join("");
}

export function textWidth(font, text, size, ls = 0) {
  return font.getAdvanceWidth(sanitize(font, text), size, { kerning: true, letterSpacing: ls });
}

/** Outlined text → <path>. anchor: start | middle | end. ls = letter spacing in em. */
export function T(fontKey, text, x, y, size, { ls = 0, anchor = "start", fill = C.text, attrs = "" } = {}) {
  const font = F[fontKey];
  const clean = sanitize(font, text);
  const w = textWidth(font, clean, size, ls);
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const d = font.getPath(clean, x0, y, size, { kerning: true, letterSpacing: ls }).toPathData(2);
  return `<path d="${d}" fill="${fill}" ${attrs}/>`;
}

// Fit display text into maxWidth by shrinking size.
export function fitSize(fontKey, text, maxWidth, startSize, ls) {
  let s = startSize;
  while (s > 8 && textWidth(F[fontKey], text, s, ls) > maxWidth) s -= 0.5;
  return s;
}

// ---------------------------------------------------------------- geometry
/** Chamfered rectangle polygon points. cuts = {tl,tr,br,bl} in px. */
export function chamfer(x, y, w, h, cuts) {
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

export function bracket(x, y, len, dirX, dirY, stroke = C.amber) {
  // L-shaped corner bracket, opening toward (dirX, dirY).
  return `<path d="M${x} ${y + len * dirY} V${y} H${x + len * dirX}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
}

export function hexPoints(cx, cy, r, flat = true) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + (flat ? 0 : Math.PI / 6);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

// Deterministic PRNG so builds are reproducible.
export function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- shared defs
export function hexPatternDef(id, r = 14, opacity = 0.05) {
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

export function scanlinesDef(id, opacity = 0.05) {
  return `<pattern id="${id}" width="4" height="3" patternUnits="userSpaceOnUse">
    <rect width="4" height="1" fill="#000000" fill-opacity="${opacity}"/>
  </pattern>`;
}

export const GLOW = `<filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

export const HEAD = (w, h, title, desc) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
  <title id="t">${title}</title>
  <desc id="d">${desc}</desc>`;


/** Write an SVG file (collapses blank lines) and log its size. */
export function writeSvg(outPath, svg) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg.replace(/\n\s*\n/g, "\n") + "\n");
  console.log(`wrote ${path.relative(process.cwd(), outPath)} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}
