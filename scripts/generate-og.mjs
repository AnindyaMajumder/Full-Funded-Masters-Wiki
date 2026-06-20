// Render the social-share images (Open Graph / Twitter) and the publisher logo
// as real PNGs, brand-matched to the site, using the local headless Chrome.
//
//   node scripts/generate-og.mjs
//
// Outputs into static/:  og.png (default 1200×630) · og-<country>.png (per country)
// · logo.png (512×512, the Organization logo used in JSON-LD + apple-touch-icon).
//
// Set CHROME_BIN to override the browser binary. The cards degrade gracefully
// to Georgia/system fonts if Google Fonts can't be fetched offline.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC = resolve(__dirname, '../static');
const CHROME = process.env.CHROME_BIN || 'google-chrome';

// Mirror of COUNTRY_LABELS in src/lib/scholarship.ts — keep in sync when adding a country.
const COUNTRIES = [
  ['uk', 'United Kingdom'],
  ['europe', 'Europe'],
  ['australia', 'Australia'],
  ['usa', 'United States'],
  ['china', 'China'],
  ['japan', 'Japan'],
  ['southkorea', 'South Korea'],
  ['taiwan', 'Taiwan'],
  ['singapore', 'Singapore'],
  ['malaysia', 'Malaysia']
];

const CAP = `<svg viewBox="0 0 32 32"><path d="M16 6 4 11l12 5 9-3.75V19h2v-8.4z" fill="#f4d58a"/><path d="M9 14.5V19c0 1.8 3.1 3.3 7 3.3s7-1.5 7-3.3v-4.5l-7 2.9z" fill="#f4d58a" opacity=".82"/></svg>`;

const BASE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #f6f4ef;
    background:
      radial-gradient(900px 520px at 88% -12%, rgba(244,213,138,0.20), transparent 60%),
      radial-gradient(760px 520px at -6% 108%, rgba(64,150,138,0.30), transparent 60%),
      linear-gradient(146deg, #1a655d 0%, #114139 56%, #0c322e 100%);
  }
  .frame { position: absolute; inset: 26px; border: 1px solid rgba(244,213,138,0.22); border-radius: 26px; }
  .cap-bg { position: absolute; right: -70px; bottom: -120px; width: 560px; opacity: 0.08; transform: rotate(-8deg); }
  .pad { position: absolute; inset: 0; padding: 72px 78px; display: flex; flex-direction: column; }
  .lockup { display: flex; align-items: center; gap: 18px; }
  .tile { width: 64px; height: 64px; border-radius: 16px; display: grid; place-items: center;
           background: linear-gradient(180deg, #1d6b63, #134b45); box-shadow: 0 8px 22px rgba(7,30,27,0.5); }
  .tile svg { width: 42px; height: 42px; }
  .wordmark { display: flex; flex-direction: column; line-height: 1.08; }
  .wordmark b { font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 30px; letter-spacing: -0.01em; }
  .wordmark span { font-size: 17px; letter-spacing: 0.06em; color: #bcd3cd; text-transform: uppercase; }
  .body { margin-top: auto; }
  .eyebrow { font-size: 22px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #f1cf86; }
  h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 600; letter-spacing: -0.02em; margin-top: 18px; }
  .hl { color: #f7e3ad; box-shadow: inset 0 -0.1em 0 0 rgba(244,213,138,0.5); padding-bottom: 0.02em; }
  em { font-style: italic; }
  .sub { font-size: 30px; line-height: 1.42; color: #d3e2dd; margin-top: 26px; max-width: 30ch; }
  .foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; padding-top: 30px; }
  .domain { font-size: 25px; font-weight: 600; color: #eef4f1; }
  .chips { display: flex; gap: 12px; }
  .chip { font-size: 21px; font-weight: 500; color: #f3e6c4; padding: 9px 18px; border-radius: 999px;
          border: 1px solid rgba(244,213,138,0.4); background: rgba(244,213,138,0.08); }
`;

function doc(inner) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}</style></head><body>${inner}</body></html>`;
}

const lockup = `<div class="lockup"><div class="tile">${CAP}</div>
  <div class="wordmark"><b>Fully Funded Masters</b><span>Verified scholarship wiki</span></div></div>`;

function defaultCard() {
  return doc(`<div class="frame"></div><div class="cap-bg">${CAP}</div>
    <div class="pad">
      ${lockup}
      <div class="body">
        <div class="eyebrow">Tuition + living stipend · cited to source</div>
        <h1 style="font-size:84px;line-height:1.03">Find a master’s the<br>world will <span class="hl"><em>pay for</em></span>.</h1>
        <div class="sub">A hand-verified directory of fully funded master’s scholarships — every deadline & benefit traced to its official page.</div>
      </div>
      <div class="foot">
        <div class="domain">full-funded-masters.anindya.pro</div>
        <div class="chips"><span class="chip">Fully funded</span><span class="chip">#NoIELTS</span><span class="chip">#NoApplicationFee</span></div>
      </div>
    </div>`);
}

function countryCard(label) {
  const size = label.length > 12 ? 80 : 100;
  return doc(`<div class="frame"></div><div class="cap-bg">${CAP}</div>
    <div class="pad">
      ${lockup}
      <div class="body">
        <div class="eyebrow">Fully funded master’s scholarships</div>
        <h1 style="font-size:${size}px;line-height:1.02">${label}</h1>
        <div class="sub">Verified against every official source — deadlines, benefits and requirements at a glance.</div>
      </div>
      <div class="foot">
        <div class="domain">full-funded-masters.anindya.pro</div>
        <div class="chips"><span class="chip">Cited to source</span><span class="chip">Verified 2026</span></div>
      </div>
    </div>`);
}

function logoDoc() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:512px; height:512px; overflow:hidden; }
    body { display:grid; place-items:center;
      background: radial-gradient(440px 320px at 50% 6%, #21786e, transparent 70%), linear-gradient(180deg, #1d6b63, #0d3833); }
    .ring { width:340px; height:340px; border-radius:78px; display:grid; place-items:center;
      background: rgba(255,255,255,0.04); border:2px solid rgba(244,213,138,0.28); box-shadow: 0 26px 60px rgba(6,26,23,0.6); }
    svg { width:230px; height:230px; }
  </style></head><body><div class="ring">${CAP}</div></body></html>`;
}

function render(html, outPath, w, h) {
  const dir = mkdtempSync(join(tmpdir(), 'og-'));
  const htmlPath = join(dir, 'card.html');
  writeFileSync(htmlPath, html);
  try {
    execFileSync(
      CHROME,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        `--window-size=${w},${h}`,
        '--virtual-time-budget=9000',
        `--screenshot=${outPath}`,
        `file://${htmlPath}`
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] }
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  if (!existsSync(outPath)) throw new Error(`Chrome produced no file for ${outPath}`);
}

console.log(`Rendering OG images with ${CHROME} → ${STATIC}`);
render(logoDoc(), join(STATIC, 'logo.png'), 512, 512);
console.log('  ✓ logo.png');
render(defaultCard(), join(STATIC, 'og.png'), 1200, 630);
console.log('  ✓ og.png');
for (const [key, label] of COUNTRIES) {
  render(countryCard(label), join(STATIC, `og-${key}.png`), 1200, 630);
  console.log(`  ✓ og-${key}.png`);
}
console.log('Done.');
