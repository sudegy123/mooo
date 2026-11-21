// Face check: plays a composition in headless Chrome (the one HyperFrames already installed) and reports every moment a
// card, bubble, tag, badge or caption covers a character's face (eyes + mouth, padded). Owner rule since 2026-11-12:
// faces must stay visible. A covered face for >= 0.3 s at >= 35% of the face box is "severe"; smaller touches are listed.
// Elements may opt out with data-face-ok (job element option faceOk: true).
// Usage: node factory/tools/face_check.cjs <composition dir> [--step 0.2] [--json out.json]
const fs = require('fs');
const os = require('os');
const path = require('path');

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const dir = path.resolve(argv[0] || '');
if (!argv[0] || !fs.existsSync(path.join(dir, 'index.html'))) { console.error('usage: node factory/tools/face_check.cjs <composition dir> [--step 0.2] [--json out.json]'); process.exit(2); }
const STEP = +opt('--step', 0.2), SEVERE_COVER = 0.35, SEVERE_DUR = 0.3;

function findChrome() {
  if (process.env.HF_CHROME && fs.existsSync(process.env.HF_CHROME)) return process.env.HF_CHROME;
  const base = path.join(os.homedir(), '.cache', 'hyperframes', 'chrome', 'chrome-headless-shell');
  if (fs.existsSync(base)) for (const v of fs.readdirSync(base).sort().reverse()) {
    const exe = path.join(base, v, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'); if (fs.existsSync(exe)) return exe;
  }
  throw new Error('headless Chrome not found; set HF_CHROME');
}

(async () => {
  const puppeteer = require(path.join(__dirname, '..', '..', 'node_modules', 'puppeteer-core'));
  const tmp = fs.mkdtempSync(path.join(__dirname, '..', '..', '.cache', 'tmp', 'facecheck-'));
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, userDataDir: tmp, args: ['--no-sandbox', '--allow-file-access-from-files', '--mute-audio'] });
  let res;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    // HyperFrames' runtime normally creates this registry before the composition script runs
    await page.evaluateOnNewDocument(() => { window.__timelines = window.__timelines || {}; });
    page.on('pageerror', (e) => console.error('page error:', e.message));
    await page.goto('file:///' + path.join(dir, 'index.html').split(path.sep).join('/'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    // poll from Node: puppeteer's waitForFunction never resolved against these file:// pages in the headless shell
    let ready = false;
    for (let i = 0; i < 240 && !ready; i++) { ready = await page.evaluate(() => !!(window.__timelines && window.__timelines.main && window.SF)); if (!ready) await new Promise((r) => setTimeout(r, 250)); }
    if (!ready) throw new Error('composition timeline "main" never appeared');
    await page.evaluate(() => document.fonts && document.fonts.ready);
    res = await page.evaluate((step) => {
      // the composition length, not tl.duration(): looping idle tweens may run past the last scene
      const root = document.querySelector('[data-composition-id="main"]'), tl = window.__timelines.main;
      const D = Math.min(tl.duration(), +(root && root.getAttribute('data-duration')) || tl.duration());
      const vis = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentNode) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') return 0; o *= +s.opacity; } return o; };
      const faces = [...document.querySelectorAll('svg.stage [id$="-eyes"]')].map((e) => { const who = e.id.replace(/-eyes$/, ''); return { who, eyes: e, m: document.getElementById(who + '-m') }; });
      const covers = [...document.querySelectorAll('.el, .cap')].filter((e) => !e.hasAttribute('data-face-ok'));
      const ev = [];
      for (let t = 0; t <= D + 1e-6; t += step) {
        tl.seek(t); if (window.FRAME_HOOKS) window.FRAME_HOOKS.forEach((f) => f());
        for (const f of faces) {
          // the head group decides visibility: during a meme face the resting eyes are hidden but the face is still on screen
          if (vis(document.getElementById(f.who + '-hi') || f.eyes) < 0.35) continue;
          const a = f.eyes.getBoundingClientRect(), b = f.m ? f.m.getBoundingClientRect() : a;
          const x0 = Math.min(a.left, b.left) - 14, y0 = Math.min(a.top, b.top) - 14, x1 = Math.max(a.right, b.right) + 14, y1 = Math.max(a.bottom, b.bottom) + 14;
          const fa = (x1 - x0) * (y1 - y0); if (fa < 200 || x1 < 0 || x0 > 1080 || y1 < 0 || y0 > 1920) continue;
          // SVG props drawn after this face in the same stage sit on top of it (cards drawn as props, phones, signs)
          const svg = f.eyes.ownerSVGElement;
          const frontProps = svg ? [...svg.querySelectorAll('[data-prop]')].filter((p) => !p.hasAttribute('data-face-ok') && (f.eyes.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)) : [];
          for (const c of covers.concat(frontProps)) {
            if (vis(c) < 0.35) continue; const r = c.getBoundingClientRect();
            const ix = Math.max(0, Math.min(x1, r.right) - Math.max(x0, r.left)), iy = Math.max(0, Math.min(y1, r.bottom) - Math.max(y0, r.top));
            const cover = (ix * iy) / fa; if (cover > 0.12) ev.push({ t: +t.toFixed(2), el: c.id || String(c.className), who: f.who, cover: +cover.toFixed(2) });
          }
        }
      }
      return { D: +D.toFixed(2), faces: faces.length, covers: covers.length, ev };
    }, STEP);
  } finally {
    await browser.close();
    // Windows keeps the profile locked for a moment after Chrome exits; cleanup is best effort (it is our own temp folder)
    try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 6, retryDelay: 400 }); } catch (e) { /* left in .cache/tmp */ }
  }

  // merge consecutive samples of the same element over the same face into one event
  const events = []; const open = new Map();
  for (const e of res.ev.sort((x, y) => x.t - y.t)) {
    const key = e.el + '|' + e.who, cur = open.get(key);
    if (cur && e.t - cur.to <= STEP * 1.5 + 1e-6) { cur.to = e.t; cur.cover = Math.max(cur.cover, e.cover); }
    else { const n = { el: e.el, who: e.who, from: e.t, to: e.t, cover: e.cover }; events.push(n); open.set(key, n); }
  }
  events.forEach((e) => { e.dur = +(e.to - e.from + STEP).toFixed(2); e.severe = e.cover >= SEVERE_COVER && e.dur >= SEVERE_DUR; });
  const out = { dir, duration: res.D, faces: res.faces, checked: res.covers, step: STEP, severe: events.some((e) => e.severe), events };
  if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(out, null, 2));
  console.log(`faces ${res.faces}, covering elements ${res.covers}, ${events.length} event(s)${out.severe ? ' — SEVERE' : ''}`);
  for (const e of events) console.log(`  ${e.severe ? 'SEVERE' : 'minor '} ${e.el} over ${e.who}: ${e.from}-${e.to}s, up to ${Math.round(e.cover * 100)}% of the face`);
})().catch((e) => { console.error('face check failed:', e.message); process.exit(1); });
