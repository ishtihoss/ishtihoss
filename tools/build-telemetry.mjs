#!/usr/bin/env node
// Renders the live telemetry panel (contribution totals, streaks, 52-week grid)
// from the JSON produced by tools/fetch-telemetry.mjs.
//
//   node tools/build-telemetry.mjs dist/telemetry.json dist/telemetry.svg

import fs from "node:fs";
import { C, F, GLOW, HEAD, T, chamfer, fitSize, hexPatternDef, scanlinesDef, textWidth, writeSvg } from "./lib.mjs";

const [, , inPath = "dist/telemetry.json", outPath = "dist/telemetry.svg"] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, "utf8"));

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const fmt = (iso) => {
  if (!iso) return "—";
  const [y, m, day] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${day}, ${y}`;
};
const fmtShort = (iso) => {
  if (!iso) return "—";
  const [y, m, day] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${day}`;
};
const num = (n) => n.toLocaleString("en-US");

const W = 960, H = 334;
const pts = chamfer(0.5, 0.5, W - 1, H - 1, { tl: 16, tr: 6, br: 16, bl: 6 });

// ---------------------------------------------------------------- stat cells
const cells = [
  { n: num(d.total), k: "TOTAL CONTRIBUTIONS", s: `${fmt(d.firstDate).replace(/^(\w+) \d+,/, "$1")} — PRESENT` },
  null, // ring
  { n: num(d.longest.length), k: "LONGEST STREAK", s: `${fmt(d.longest.start)} — ${fmt(d.longest.end)}` },
];
const colX = [28, 336, 644];
const colW = 288;
let body = "";

// left + right cells
[0, 2].forEach((i) => {
  const c = cells[i];
  const x = colX[i];
  const size = fitSize("display", c.n, colW - 40, 34, 0.02);
  body += T("display", c.n, x, 104, size, { ls: 0.02, fill: C.amber, attrs: `opacity="0.5" filter="url(#glow)"` });
  body += T("display", c.n, x, 104, size, { ls: 0.02, fill: C.amberHi });
  body += T("mono", c.k, x + 1, 124, 9.5, { ls: 0.26, fill: C.soft });
  body += T("mono", c.s, x + 1, 140, 8.5, { ls: 0.14, fill: C.dim });
});
body += `<path d="M${colX[1] - 24} 60 V150" stroke="${C.edge}"/><path d="M${colX[2] - 24} 60 V150" stroke="${C.edge}"/>`;

// centre ring: current streak, arc = current / longest
const cx = 480, cy = 104, R = 44;
const frac = d.longest.length ? Math.min(1, d.current.length / d.longest.length) : 0;
const circ = 2 * Math.PI * R;
let ticks = "";
for (let i = 0; i < 24; i++) {
  const a = (Math.PI * 2 * i) / 24 - Math.PI / 2;
  const major = i % 6 === 0;
  const r1 = major ? 52 : 54, r2 = 57;
  ticks += `<line x1="${(cx + r1 * Math.cos(a)).toFixed(2)}" y1="${(cy + r1 * Math.sin(a)).toFixed(2)}" x2="${(cx + r2 * Math.cos(a)).toFixed(2)}" y2="${(cy + r2 * Math.sin(a)).toFixed(2)}" stroke="${major ? C.amber : C.edge2}" stroke-width="${major ? 1.5 : 1}"/>`;
}
const streakSize = fitSize("display", String(d.current.length), 60, 30, 0.02);
const ring = `
  <g>
    <circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="${C.edge2}"/>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="40s" repeatCount="indefinite"/>
      <circle cx="${cx}" cy="${cy}" r="59" fill="none" stroke="${C.amber}" stroke-width="1.5" stroke-dasharray="2 8" opacity="0.7"/>
    </g>
    ${ticks}
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.edge2}" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.amber}" stroke-width="5" stroke-linecap="butt"
      stroke-dasharray="${(circ * frac).toFixed(2)} ${circ.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" filter="url(#glow)"/>
    <circle cx="${cx}" cy="${cy}" r="36" fill="${C.panel2}" stroke="${C.edge}"/>
    ${T("display", String(d.current.length), cx, cy + 10, streakSize, { ls: 0.02, anchor: "middle", fill: C.amber, attrs: `opacity="0.5" filter="url(#glow)"` })}
    ${T("display", String(d.current.length), cx, cy + 10, streakSize, { ls: 0.02, anchor: "middle", fill: C.amberHi })}
  </g>
  ${T("mono", "CURRENT STREAK", cx, 180, 9.5, { ls: 0.26, anchor: "middle", fill: C.soft })}
  ${T("mono", d.current.length ? `${fmtShort(d.current.start)} — ${fmtShort(d.current.end)}  ·  DAYS` : "NO ACTIVE STREAK", cx, 194, 8.5, { ls: 0.14, anchor: "middle", fill: C.dim })}
`;

// ---------------------------------------------------------------- 52-week grid
const cell = 10, gap = 2, step = cell + gap;
const cols = d.weeks.length; // 53
const gridW = cols * step - gap;
const gx = Math.round((W - gridW) / 2), gy = 234;
let grid = "";
const fills = [null, 0.28, 0.5, 0.75, 1];
d.weeks.forEach((week, wi) => {
  week.forEach((day, di) => {
    if (!day) return;
    const x = gx + wi * step, y = gy + di * step;
    if (day.l === 0) grid += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${C.panel2}" stroke="${C.edge}" stroke-width="0.5"/>`;
    else grid += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${C.amber}" opacity="${fills[day.l]}"/>`;
  });
});
// month labels along the top of the grid
let months = "";
let lastM = null;
d.weeks.forEach((week, wi) => {
  const first = week.find(Boolean);
  if (!first) return;
  const m = Number(first.d.slice(5, 7));
  if (m !== lastM) {
    if (lastM !== null || wi === 0) months += T("mono", MONTHS[m - 1], gx + wi * step, gy - 7, 7.5, { ls: 0.16, fill: C.dim });
    lastM = m;
  }
});
// legend
const lgx = gx + gridW - 4 * step - textWidth(F.mono, "LESS", 7.5, 0.16) - 8 - textWidth(F.mono, "MORE", 7.5, 0.16) - 12;
let legend = T("mono", "LESS", lgx, gy + 7 * step + 6, 7.5, { ls: 0.16, fill: C.dim });
let lx = lgx + textWidth(F.mono, "LESS", 7.5, 0.16) + 6;
[1, 2, 3, 4].forEach((l) => { legend += `<rect x="${lx}" y="${gy + 7 * step - 1}" width="${cell}" height="${cell}" fill="${C.amber}" opacity="${fills[l]}"/>`; lx += step; });
legend += T("mono", "MORE", lx + 2, gy + 7 * step + 6, 7.5, { ls: 0.16, fill: C.dim });

const stamp = d.generatedAt.replace("T", " ").slice(0, 16) + " UTC";

const svg = `${HEAD(W, H, "Telemetry", `${num(d.total)} total contributions since ${fmt(d.firstDate)}. Current streak ${d.current.length} days. Longest streak ${d.longest.length} days, ${fmt(d.longest.start)} to ${fmt(d.longest.end)}. ${num(d.yearTotal)} contributions in the last 52 weeks.`)}
  <defs>${hexPatternDef("hex", 14, 0.045)}${scanlinesDef("scan", 0.05)}${GLOW}</defs>
  <polygon points="${pts}" fill="${C.panel}" stroke="${C.edge2}"/>
  <polygon points="${pts}" fill="url(#hex)"/>
  <polygon points="${pts}" fill="url(#scan)"/>
  <path d="M16 1 H220" stroke="${C.amber}" stroke-width="2" opacity="0.7"/>
  <path d="M${W - 16} ${H - 1} H${W - 220}" stroke="${C.amber}" stroke-width="2" opacity="0.7"/>

  <rect x="28" y="24" width="4" height="12" fill="${C.amber}"/>
  ${T("display", "CONTRIBUTION LOG", 40, 34, 10.5, { ls: 0.14, fill: C.amber })}
  ${T("mono", `//  ${num(d.yearTotal)} IN THE LAST 52 WEEKS`, 40 + textWidth(F.display, "CONTRIBUTION LOG", 10.5, 0.14) + 12, 34, 9.5, { ls: 0.2, fill: C.muted })}
  <circle cx="${W - 34}" cy="30" r="2.5" fill="${C.cyan}" filter="url(#glow)"><animate attributeName="opacity" values="1;0.25;1" dur="1.8s" repeatCount="indefinite"/></circle>
  ${T("mono", `SYNCED ${stamp}`, W - 44, 33.5, 8.5, { ls: 0.2, anchor: "end", fill: C.dim })}
  <path d="M28 46 H${W - 28}" stroke="${C.edge}"/>

  ${body}
  ${ring}
  <path d="M28 212 H${W - 28}" stroke="${C.edge}"/>
  ${T("mono", "52-WEEK LOG", 28, 226, 8.5, { ls: 0.24, fill: C.dim })}
  ${months}
  ${grid}
  ${legend}
</svg>`;

writeSvg(outPath, svg);
