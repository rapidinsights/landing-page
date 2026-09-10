// Generates src/components/widgets/HeroChalkMap.astro: a Meadows stock-and-flow map of a service SMB (quote to cash + capacity),
// with valves, information links, source/sink clouds, delays, two loops and one leverage mark.
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let seed = 19;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const j = (k = 1.6) => rnd() * k;
const f = (n) => String(Math.round(n));
const ft = (n) => n.toFixed(2).replace(/\.?0+$/, '');

const seg = (x1, y1, x2, y2, over = 3) => {
  const dx = x2 - x1,
    dy = y2 - y1,
    len = Math.hypot(dx, dy) || 1,
    ux = dx / len,
    uy = dy / len;
  const cx = (x1 + x2) / 2 - uy * j(2.5),
    cy = (y1 + y2) / 2 + ux * j(2.5);
  return `M${f(x1 - ux * over)} ${f(y1 - uy * over)}Q${f(cx)} ${f(cy)} ${f(x2 + ux * over)} ${f(y2 + uy * over)}`;
};

// Hold before the first stroke so the headline's 1s fade lands first.
const HOLD = 0.8;
const el = [];
let tEnd = 0;
const push = (s, t, d) => {
  el.push(s);
  tEnd = Math.max(tEnd, t + d);
};
const P = (d, t, dur, cls = '') =>
  `<path${cls ? ` class="${cls}"` : ''} pathLength="1" style="--t:${ft(t + HOLD)}s;--d:${ft(dur)}s" d="${d}"/>`;
const T = (x, y, s, t, cls = '') =>
  `<text${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" style="--t:${ft(t + HOLD)}s">${s}</text>`;

const W = 144,
  H = 56;
function stock(x, y, label, t, opts = {}) {
  const d = [seg(x, y, x + W, y), seg(x + W, y, x + W, y + H), seg(x + W, y + H, x, y + H), seg(x, y + H, x, y)].join(
    ''
  );
  push(`<g>${P(d, t, 0.8)}${T(x + 14, y + H / 2 + 4, label, t + 0.6)}</g>`, t, 1.1);
  if (opts.hatch) {
    let hd = '';
    for (let i = 14; i < W + H; i += 12) {
      const ax = Math.max(x + 5, x + i - H + 5),
        ay = Math.min(y + H - 5, y + i - 5);
      const bx = Math.min(x + W - 5, x + i - 5),
        by = Math.max(y + 5, y + i - W + 5);
      hd += seg(ax, ay, bx, by, 0);
    }
    push(P(hd, opts.hatch, 1.0, 'thin'), opts.hatch, 1.0);
  }
}

// Valve: a small bowtie across the flow at (x,y), oriented along (ux,uy).
const valve = (x, y, ux, uy) => {
  const s = 7;
  const a = [x - ux * s - uy * s, y - uy * s + ux * s],
    b = [x - ux * s + uy * s, y - uy * s - ux * s];
  const c = [x + ux * s - uy * s, y + uy * s + ux * s],
    d = [x + ux * s + uy * s, y + uy * s - ux * s];
  return (
    seg(a[0], a[1], d[0], d[1], 1) +
    seg(d[0], d[1], c[0], c[1], 1) +
    seg(c[0], c[1], b[0], b[1], 1) +
    seg(b[0], b[1], a[0], a[1], 1)
  );
};
const head = (x, y, ux, uy) =>
  seg(x - ux * 12 - uy * 6, y - uy * 12 + ux * 6, x, y, 1) + seg(x, y, x - ux * 12 + uy * 6, y - uy * 12 - ux * 6, 1);

// Flow along a polyline; valve and optional delay hash sit on the segment index `on`.
function flow(pts, t, opts = {}) {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) d += seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 1);
  const [x2, y2] = pts[pts.length - 1],
    [x1, y1] = pts[pts.length - 2];
  const l = Math.hypot(x2 - x1, y2 - y1),
    ux = (x2 - x1) / l,
    uy = (y2 - y1) / l;
  const on = opts.on ?? 0,
    [a, b] = [pts[on], pts[on + 1]];
  const vl = Math.hypot(b[0] - a[0], b[1] - a[1]),
    vx = (b[0] - a[0]) / vl,
    vy = (b[1] - a[1]) / vl;
  const mx = (a[0] + b[0]) / 2,
    my = (a[1] + b[1]) / 2;
  const len = pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const dur = 0.35 + len / 400;
  let g = P(d, t, dur) + P(head(x2, y2, ux, uy), t + dur - 0.05, 0.25) + P(valve(mx, my, vx, vy), t + dur + 0.1, 0.35);
  if (opts.label) g += T(mx + (opts.lx ?? 0), my + (opts.ly ?? 0), opts.label, t + dur + 0.3, 'small');
  push(`<g>${g}</g>`, t, dur + 0.5);
  if (opts.delay) {
    const o = 22,
      tick = (k) => seg(mx + vx * k - vy * 9, my + vy * k + vx * 9, mx + vx * k + vy * 9, my + vy * k - vx * 9, 1);
    push(P(tick(o - 4) + tick(o + 4), opts.delay, 0.5), opts.delay, 0.5);
  }
  return { mx, my, vx, vy };
}

// Information link: dashed polyline, dashes emitted as subpaths so draw-on reveals them in order.
function info(pts, t, letter) {
  let d = '',
    total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i],
      [x2, y2] = pts[i + 1],
      l = Math.hypot(x2 - x1, y2 - y1),
      ux = (x2 - x1) / l,
      uy = (y2 - y1) / l;
    total += l;
    for (let s = 0; s < l; s += 14)
      d += seg(x1 + ux * s, y1 + uy * s, x1 + ux * Math.min(s + 7, l), y1 + uy * Math.min(s + 7, l), 0);
  }
  const [x2, y2] = pts[pts.length - 1],
    [x1, y1] = pts[pts.length - 2],
    l = Math.hypot(x2 - x1, y2 - y1);
  const dur = 0.3 + total / 400;
  let g = P(d, t, dur, 'thin') + P(head(x2, y2, (x2 - x1) / l, (y2 - y1) / l), t + dur, 0.2, 'thin');
  if (letter) g += T(letter[1], letter[2], letter[0], t + dur + 0.1, 'letter');
  push(`<g>${g}</g>`, t, dur + 0.4);
}

function cloud(cx, cy, t) {
  // Flat base, four lobes over the top, drawn as one wobbly stroke.
  const q = (ax, ay, bx, by) => `Q${f(ax + j(1.5))} ${f(ay + j(1.5))} ${f(bx + j(1))} ${f(by + j(1))}`;
  const d =
    `M${f(cx - 20)} ${f(cy + 9)}` +
    q(cx, cy + 12, cx + 20, cy + 9) +
    q(cx + 32, cy + 4, cx + 22, cy - 5) +
    q(cx + 18, cy - 18, cx + 6, cy - 12) +
    q(cx - 2, cy - 24, cx - 10, cy - 12) +
    q(cx - 24, cy - 16, cx - 22, cy - 4) +
    q(cx - 32, cy + 4, cx - 20, cy + 9);
  push(P(d, t, 0.6, 'thin'), t, 0.6);
}

// Loop mark: Meadows' circular arrow with the letter inside, sitting in the area the loop encloses.
function loopMark(cx, cy, letter, t, caption) {
  const r = 17,
    pts = [];
  for (let a = 210; a <= 510; a += 8) {
    const rad = (a * Math.PI) / 180;
    pts.push(`${f(cx + (r + j(0.6)) * Math.cos(rad))} ${f(cy + (r + j(0.6)) * Math.sin(rad))}`);
  }
  const end = (510 * Math.PI) / 180,
    ux = -Math.sin(end),
    uy = Math.cos(end);
  const ex = cx + r * Math.cos(end),
    ey = cy + r * Math.sin(end);
  push(
    `<g>${P('M' + pts.join('L'), t, 0.6)}${P(head(ex, ey, ux, uy), t + 0.55, 0.2)}${T(cx - 6, cy + 6, letter, t + 0.6, 'letter')}${caption ? T(cx + 26, cy + 5, caption, t + 0.8, 'small') : ''}</g>`,
    t,
    0.9
  );
}

function leverage(cx, cy, r, note, nx, ny, t) {
  const pts = [];
  for (let a = -80; a <= 300; a += 6) {
    const rad = (a * Math.PI) / 180,
      rr = r + Math.sin(a / 23) * 1.5 + j(0.6);
    pts.push(`${f(cx + rr * Math.cos(rad))} ${f(cy + rr * Math.sin(rad))}`);
  }
  push(`<g class="lev">${P('M' + pts.join('L'), t, 0.8)}${T(nx, ny, note, t + 0.8, 'note')}</g>`, t, 1.4);
}

// Layout: three columns, 72px gutters, 160px row pitch, all on the 24px lattice. Copy lives left of x≈790.
const C0 = 840,
  C1 = 1056,
  C2 = 1272;
const R = [88, 248, 408, 568],
  M = H / 2,
  OH = 320;

// Stage 1: stocks
stock(C1, R[0], 'Enquiries', 0.2);
stock(C2, R[0], 'Quotes out', 0.45);
stock(C2, R[1], 'Jobs booked', 0.7);
stock(C1, R[1], 'Work in progress', 0.95);
stock(C1, R[2], 'Done, uninvoiced', 1.2, { hatch: 5.4 });
stock(C2, R[2], 'Invoices out', 1.45);
stock(C2, R[3], 'Cash', 1.7);
stock(C0, OH, "Owner's hours", 1.95);
cloud(C1 - 92, R[0] + M, 2.2);

// Stage 2: flows with valves
flow(
  [
    [C1 - 64, R[0] + M],
    [C1, R[0] + M],
  ],
  2.6
);
const vQuote = flow(
  [
    [C1 + W, R[0] + M],
    [C2, R[0] + M],
  ],
  2.9,
  { label: 'quote', lx: -18, ly: 24 }
);
flow(
  [
    [C2 + 72, R[0] + H],
    [C2 + 72, R[1]],
  ],
  3.2,
  { label: 'win', lx: 14, ly: 4, delay: 5.0 }
);
flow(
  [
    [C2, R[1] + M],
    [C1 + W, R[1] + M],
  ],
  3.5,
  { label: 'schedule', lx: -28, ly: 24 }
);
flow(
  [
    [C1 + 72, R[1] + H],
    [C1 + 72, R[2]],
  ],
  3.8,
  { label: 'complete', lx: 14, ly: 4 }
);
const vInv = flow(
  [
    [C1 + W, R[2] + M],
    [C2, R[2] + M],
  ],
  4.1,
  { delay: 5.3 }
);
flow(
  [
    [C2 + 72, R[2] + H],
    [C2 + 72, R[3]],
  ],
  4.4,
  { label: 'collect', lx: 14, ly: 4, delay: 5.6 }
);
flow(
  [
    [C2, R[3] + M],
    [C0 + 72, R[3] + M],
    [C0 + 72, OH + H],
  ],
  4.7,
  { label: 'hire', on: 0, lx: -12, ly: -12 }
);
flow(
  [
    [C2 + 72, R[3] + H],
    [C2 + 72, R[3] + H + 48],
  ],
  5.0
);
cloud(C2 + 72, R[3] + H + 84, 5.7);

// Stage 4: information links (the feedback)
info(
  [
    [C1, R[1] + 40],
    [C0 + W, OH + 20],
  ],
  6.2
);
info(
  [
    [C0 + 120, OH],
    [C0 + 120, 40],
    [vQuote.mx, 40],
    [vQuote.mx, vQuote.my - 12],
  ],
  6.8
);
loopMark(948, 168, 'B', 7.6, 'feast and famine');
loopMark(948, 488, 'R', 7.9, 'cash buys hours');

// Key: appears line by line as each symbol is first drawn.
function key(x, y) {
  const row = (i, glyph, label, t) =>
    push(`<g class="key">${glyph(x, y + i * 24)}${T(x + 44, y + i * 24 + 4, label, t + 0.3, 'small')}</g>`, t, 0.6);
  row(
    0,
    (gx, gy) =>
      P(
        seg(gx, gy - 7, gx + 26, gy - 7, 1) +
          seg(gx + 26, gy - 7, gx + 26, gy + 7, 1) +
          seg(gx + 26, gy + 7, gx, gy + 7, 1) +
          seg(gx, gy + 7, gx, gy - 7, 1),
        0.9,
        0.5,
        'thin'
      ),
    'work waiting',
    0.9
  );
  row(1, (gx, gy) => P(seg(gx, gy, gx + 26, gy, 1) + head(gx + 26, gy, 1, 0), 3.0, 0.4, 'thin'), 'how it moves', 3.0);
  row(2, (gx, gy) => P(valve(gx + 13, gy, 1, 0), 3.5, 0.4, 'thin'), 'a decision', 3.5);
  row(
    3,
    (gx, gy) => P(seg(gx + 9, gy - 8, gx + 9, gy + 8, 1) + seg(gx + 17, gy - 8, gx + 17, gy + 8, 1), 5.2, 0.4, 'thin'),
    'a wait',
    5.2
  );
  row(
    4,
    (gx, gy) =>
      P(
        seg(gx, gy, gx + 7, gy, 0) +
          seg(gx + 12, gy, gx + 19, gy, 0) +
          seg(gx + 24, gy, gx + 26, gy, 0) +
          head(gx + 26, gy, 1, 0),
        6.6,
        0.4,
        'thin'
      ),
    'what the decision watches',
    6.6
  );
}
key(C0, 664);

// Stage 5: leverage, the invoicing rule
leverage(vInv.mx, vInv.my, 26, 'invoice at completion', vInv.mx - 88, vInv.my + 58, 8.2);

const svg = `<svg class="chalk" viewBox="812 12 609 782" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">${el.join('')}</svg>`;
const bytes = Buffer.byteLength(svg);

// Emit the production component: same SVG, colours and fonts from the design tokens.
const astro = `---
/**
 * HeroChalkMap: the hero's background drawing. A Meadows stock-and-flow map of a
 * service business (quote to cash, plus the owner's hours that every decision draws on),
 * chalked onto the dot grid in the order a diagnosis happens: what piles up, how it moves,
 * where it waits, how it feeds back on itself, and last, in accent, where to intervene.
 *
 * Rendered in the Hero's content slot so it sits after the H1 in the HTML (LCP) and positions
 * against the hero's content container, right-aligned with the header CTA.
 *
 * Static SVG, draw-on via stroke-dashoffset keyframes, no JS. Generated by
 * scripts/hero-chalk-map.mjs ; edit the generator, not this file.
 */
---

<div
  class="absolute inset-0 hidden lg:block pointer-events-none"
  aria-hidden="true"
>
  ${svg}
</div>

<style>
  /* Right-aligned inside the content column, centred on the copy's vertical axis. */
  .chalk {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 40%;
    height: 100%;
  }
  .chalk path {
    fill: none;
    stroke: rgb(var(--aw-color-text-cream) / 0.24);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: chalk-draw var(--d) cubic-bezier(0.4, 0, 0.2, 1) var(--t) forwards;
  }
  .chalk path.thin {
    stroke-width: 1.25;
    stroke: rgb(var(--aw-color-text-cream) / 0.16);
  }
  .chalk text {
    font: 400 12px/1 var(--aw-font-mono, ui-monospace), monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    fill: rgb(var(--aw-color-text-cream) / 0.34);
    opacity: 0;
    animation: chalk-fade 0.6s ease var(--t) forwards;
  }
  .chalk text.small {
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    fill: rgb(var(--aw-color-text-cream) / 0.3);
  }
  .chalk .key text {
    fill: rgb(var(--aw-color-text-cream) / 0.42);
  }
  .chalk text.letter {
    font-size: 18px;
    text-transform: none;
    fill: rgb(var(--aw-color-text-cream) / 0.4);
  }
  .chalk .lev path {
    stroke: rgb(var(--aw-color-accent) / 0.8);
    stroke-width: 2.25;
  }
  .chalk .lev text {
    font-size: 14px;
    letter-spacing: 0.02em;
    text-transform: none;
    fill: rgb(var(--aw-color-accent) / 0.85);
  }
  @keyframes chalk-draw {
    to {
      stroke-dashoffset: 0;
    }
  }
  @keyframes chalk-fade {
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .chalk path,
    .chalk text {
      animation: none;
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
</style>
`;
const out = new URL('../src/components/widgets/HeroChalkMap.astro', import.meta.url);
writeFileSync(out, astro);
execSync(`npx prettier -w ${out.pathname}`, { stdio: 'ignore' });
console.log(`HeroChalkMap: draw ${ft(tEnd + HOLD)}s, svg ${bytes} B raw`);
