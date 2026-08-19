#!/usr/bin/env node
// Generates the static profile README graphics (assets/*.svg).
// All display text is outlined to paths so the typography renders identically
// everywhere (GitHub serves README SVGs through <img>, which cannot load web fonts).
//
//   npm run build            → node tools/build-assets.mjs → assets/*.svg
//
// Fonts (SIL Open Font License) live in tools/fonts/:
//   Michroma        — wide geometric display face (Eurostile-Extended lineage)
//   Share Tech Mono — readouts, labels, body copy
//
// The live telemetry panel is built separately by tools/build-telemetry.mjs
// inside .github/workflows/profile-graphics.yml.

import path from "node:path";
import {
  C, F, GLOW, HEAD, T, bracket, chamfer, fitSize, here, hexPatternDef, hexPoints, mulberry32, scanlinesDef, textWidth, writeSvg,
} from "./lib.mjs";

const OUT_DIR = process.env.OUT_DIR || path.join(here, "..", "assets");

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
  for (let i = 0; i < 12; i++) {
    const y = 64 + i * 15;
    const lit = i < 9;
    meter += `<rect x="44" y="${y}" width="4" height="11" fill="${lit ? C.amber : C.amberDim}" opacity="${lit ? 1 : 0.55}"/>`;
  }

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
    { k: "LATEST", v: "TAB NAMER  ·  77M ON HUGGING FACE", color: C.soft },
  ];
  let readouts = "";
  let rx = 64;
  const ky = 224, vy = 243;
  cells.forEach((c, i) => {
    if (i > 0) readouts += `<line x1="${rx - 14}" y1="${ky - 10}" x2="${rx - 14}" y2="${vy + 3}" stroke="${C.edge2}"/>`;
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

  return `${HEAD(W, H, "Ishtiaque Hossain", "AI engineer and ML researcher in Vancouver. Trains small models and ships the products around them. Maker of fine Porcine Software. Status: online. Uplink: ishti.dev. Latest: Tab Namer 77M on Hugging Face.")}
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
  ${T("mono", "AI ENGINEER  ·  ML RESEARCHER  ·  VANCOUVER", 64, 158, 15, { ls: 0.2, fill: C.soft })}
  ${T("mono", "Trains small models, ships the products around them.  Maker of fine Porcine Software.", 64, 186, 13, { ls: 0.02, fill: C.muted })}

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

// ================================================================ FRAMED PANEL (shared chrome)
function panelChrome(W, H, hexOpacity = 0.045) {
  const pts = chamfer(0.5, 0.5, W - 1, H - 1, { tl: 16, tr: 6, br: 16, bl: 6 });
  return `<defs>${hexPatternDef("hex", 14, hexOpacity)}${scanlinesDef("scan", 0.05)}${GLOW}</defs>
  <polygon points="${pts}" fill="${C.panel}" stroke="${C.edge2}"/>
  <polygon points="${pts}" fill="url(#hex)"/>
  <polygon points="${pts}" fill="url(#scan)"/>
  <path d="M16 1 H220" stroke="${C.amber}" stroke-width="2" opacity="0.7"/>
  <path d="M${W - 16} ${H - 1} H${W - 220}" stroke="${C.amber}" stroke-width="2" opacity="0.7"/>`;
}

// ================================================================ RESEARCH PANEL (Tab Namer)
function research() {
  const W = 960, H = 172;
  const stats = [
    { n: "77M", k: "PARAMETERS", s: "SHIPPED  ·  FLAN-T5-SMALL LINE" },
    { n: "+4.17", k: "VS GOOGLE BASE", s: "BLINDED JUDGE  ·  N = 500" },
    { n: "7.59", k: "HOLDOUT MEAN", s: "TWO FRESH 1,000-TASK SETS" },
    { n: "HF", k: "OPEN WEIGHTS", s: "PORKR / PORKICODER-TAB-NAMER-77M" },
  ];
  const colW = (W - 56) / stats.length;
  let body = "";
  stats.forEach((s, i) => {
    const x = 28 + i * colW;
    if (i > 0) body += `<path d="M${x - 14} 58 V${H - 40}" stroke="${C.edge}"/>`;
    const nSize = fitSize("display", s.n, colW - 40, 30, 0.02);
    body += T("display", s.n, x, 92, nSize, { ls: 0.02, fill: C.amber, attrs: `opacity="0.5" filter="url(#glow)"` });
    body += T("display", s.n, x, 92, nSize, { ls: 0.02, fill: C.amberHi });
    body += T("mono", s.k, x + 1, 112, 9.5, { ls: 0.26, fill: C.soft });
    body += T("mono", s.s, x + 1, 128, 8.5, { ls: 0.14, fill: C.dim });
  });
  return `${HEAD(W, H, "Tab Namer research readout", "Tab Namer 77M: local titles for PorkiCoder tabs. Fine-tuned FLAN-T5-small. Average 7.28 versus Google 3.12 on 500 tasks. Holdout means 7.59 and 7.55. Weights on Hugging Face.")}
  ${panelChrome(W, H)}
  <rect x="28" y="24" width="4" height="12" fill="${C.amber}"/>
  ${T("display", "TAB NAMER", 40, 34, 10.5, { ls: 0.14, fill: C.amber })}
  ${T("mono", "//  LOCAL TITLE MODEL FOR PORKICODER TERMINAL TABS", 40 + textWidth(F.display, "TAB NAMER", 10.5, 0.14) + 12, 34, 9.5, { ls: 0.2, fill: C.muted })}
  ${T("mono", "PREREGISTERED  ·  SEALED  ·  REPRODUCIBLE", W - 28, 34, 9, { ls: 0.24, anchor: "end", fill: C.dim })}
  <path d="M28 46 H${W - 28}" stroke="${C.edge}"/>
  ${body}
  <path d="M28 ${H - 26} H${W - 28}" stroke="${C.edge}"/>
  <circle cx="${W - 34}" cy="${H - 14}" r="2.5" fill="${C.cyan}" filter="url(#glow)"><animate attributeName="opacity" values="1;0.25;1" dur="1.8s" repeatCount="indefinite"/></circle>
  ${T("mono", "CAMPAIGN ACTIVE", W - 44, H - 11, 8.5, { ls: 0.24, anchor: "end", fill: C.dim })}
  ${T("mono", "WEIGHTS: HUGGINGFACE.CO/PORKR/PORKICODER-TAB-NAMER-77M", 28, H - 11, 8.5, { ls: 0.2, fill: C.dim })}
</svg>`;
}

// ================================================================ LOADOUT PANEL
function loadout() {
  const W = 960;
  const cols = [
    { title: "MODELS & TRAINING", items: ["PyTorch", "Transformers", "Seq2seq · T5", "Distillation", "MLX", "ONNX Runtime"] },
    { title: "AGENTS & PRODUCT", items: ["JavaScript", "Electron", "Node.js", "Claude Agent SDK", "MCP", "Python"] },
    { title: "INFRA & EVALUATION", items: ["AWS", "Cloudflare", "Linux", "Supabase · Postgres", "GPU fleets", "LLM-judge evals"] },
  ];
  const colX = [28, 336, 644];
  const colW = 288;
  const chipH = 24, gap = 8, pad = 11, size = 12.5;
  let body = "";
  let maxY = 60;
  cols.forEach((col, i) => {
    const x = colX[i];
    body += `<rect x="${x}" y="24" width="4" height="12" fill="${C.amber}"/>`;
    body += T("display", col.title, x + 12, 34, 10.5, { ls: 0.14, fill: C.amber });
    body += `<path d="M${x} 46 H${x + colW}" stroke="${C.edge}"/>`;
    let cx = x, cy = 60;
    for (const item of col.items) {
      const w = Math.ceil(textWidth(F.mono, item, size, 0.06) + pad * 2 + 4);
      if (cx + w > x + colW) { cx = x; cy += chipH + gap; }
      body += `<polygon points="${chamfer(cx + 0.5, cy + 0.5, w - 1, chipH - 1, { tl: 6, br: 6 })}" fill="${C.panel2}" stroke="${C.edge2}"/>`;
      body += `<rect x="${cx + 5}" y="${cy + chipH / 2 - 2}" width="3" height="4" fill="${C.amber}" opacity="0.9"/>`;
      body += T("mono", item, cx + pad + 3, cy + chipH / 2 + 4.5, size, { ls: 0.06, fill: C.soft });
      cx += w + gap;
    }
    maxY = Math.max(maxY, cy + chipH);
  });
  const H = maxY + 40;
  let dividers = "";
  cols.forEach((_, i) => { if (i > 0) dividers += `<path d="M${colX[i] - 24} 20 V${H - 34}" stroke="${C.edge}"/>`; });
  return `${HEAD(W, H, "Loadout", "Models and training: PyTorch, Transformers, seq2seq T5, distillation, MLX, ONNX Runtime. Agents and product: JavaScript, Electron, Node.js, Claude Agent SDK, MCP, Python. Infrastructure and evaluation: AWS, Cloudflare, Linux, Supabase and Postgres, GPU fleets, LLM-judge evaluations.")}
  ${panelChrome(W, H)}
  ${dividers}
  ${body}
  <path d="M28 ${H - 26} H${W - 28}" stroke="${C.edge}"/>
  ${T("mono", "LOADOUT  //  RESEARCH TO RELEASE  //  ONE OPERATOR", W - 28, H - 11, 8.5, { ls: 0.24, anchor: "end", fill: C.muted, attrs: `opacity="0.8"` })}
</svg>`;
}

// ================================================================ FOOTER
function footer() {
  const W = 960, H = 52;
  const msg = "END OF DOSSIER  //  VANCOUVER  ·  MODELS  ·  PRODUCTS  ·  INFRASTRUCTURE  ·  SUPPORT";
  const size = 10.5, ls = 0.22;
  const w = textWidth(F.mono, msg, size, ls);
  const x0 = (W - w) / 2;
  return `${HEAD(W, H, "End of dossier", "Vancouver: models, products, infrastructure, support.")}
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
  "section-02-research.svg": section("02", "RESEARCH", "LATEST WORK  ·  TITLE-SFT FLAN"),
  "section-03-operations.svg": section("03", "ACTIVE OPERATIONS", "SHIPPED END TO END"),
  "section-04-upstream.svg": section("04", "UPSTREAM", "OPEN SOURCE"),
  "section-05-loadout.svg": section("05", "LOADOUT", "TECHNICAL RANGE"),
  "section-06-telemetry.svg": section("06", "TELEMETRY", "GITHUB ACTIVITY"),
  "research.svg": research(),
  "loadout.svg": loadout(),
  "footer.svg": footer(),
};
for (const [name, svg] of Object.entries(files)) writeSvg(path.join(OUT_DIR, name), svg);
