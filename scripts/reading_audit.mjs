// Deterministic reading-time audit. Loads a composition in headless Chrome, scrubs its GSAP timeline every 0.05s and measures for each
// text element how long it is FULLY visible (effective opacity >= 0.9 through all ancestors) versus how long it needs:
//   needed = 0.35 s/word + 0.7 s      (rule of thumb used by motion-video-kit's quality bar family; the owner said the video was too fast to read)
// Usage: node scripts/reading_audit.mjs <composition_dir> <rows.json> [rowIndex=0]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const [dir, rowsFile, rowIdx = '0', htmlFile = 'index.html'] = process.argv.slice(2);
if (!dir || !rowsFile) { console.error('usage: node reading_audit.mjs <composition_dir> <rows.json> [rowIndex]'); process.exit(2); }
const row = JSON.parse(fs.readFileSync(rowsFile, 'utf8')).rows[+rowIdx];
const chrome = process.env.HYPERFRAMES_BROWSER_PATH || path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe');
const url = 'file:///' + path.resolve(dir, htmlFile).replace(/\\/g, '/');

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-first-run', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('[page error]', String(e).slice(0, 200)));
page.on('requestfailed', (r) => console.error('[request failed]', r.url().slice(-80)));
await page.evaluateOnNewDocument(() => { window.__timelines = window.__timelines || {}; });
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
for (let i = 0; i < 100; i++) { if (await page.evaluate(() => !!(window.__timelines && window.__timelines.main))) break; await new Promise((r) => setTimeout(r, 300)); }   // plain polling: rAF-based waits never fire in this headless page

const report = await page.evaluate((row) => {
  // apply this variant's variables (the HyperFrames runtime does this at render time)
  document.querySelectorAll('[data-var-text]').forEach((el) => { const v = row[el.getAttribute('data-var-text')]; if (v != null) el.textContent = v; });
  const tl = window.__timelines.main, dur = tl.duration();
  const items = [
    ['hook', '#hook'], ['pain', '#pain'], ['caption 1', '#cap1 span:not(.n)'], ['caption 2', '#cap2 span:not(.n)'], ['caption 3', '#cap3 span:not(.n)'],
    ['bubble (all lines)', '.bl.hl'], ['result line', '#result'], ['CTA', '#cta'],
  ];
  const eff = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity); return o; };
  const words = (sel) => { if (sel === '.bl.hl') return [...document.querySelectorAll('.bl')].map((e) => e.textContent).join(' ').trim().split(/\s+/).length; return document.querySelector(sel).textContent.trim().split(/\s+/).length; };
  const out = items.map(([name, sel]) => ({ name, sel, words: words(sel), first: null, last: null, vis: 0 }));
  const step = 0.05;
  for (let t = 0; t <= dur; t += step) {
    tl.seek(t, false);
    out.forEach((it) => { const el = document.querySelector(it.sel); const on = eff(el) >= 0.9; if (on) { it.vis += step; if (it.first === null) it.first = t; it.last = t; } });
  }
  return { dur, items: out };
}, row);
await browser.close();

console.log(`Reading-time audit — ${path.basename(path.resolve(dir))} (${row.name || 'row ' + rowIdx}), timeline ${report.dur.toFixed(2)}s`);
console.log('text'.padEnd(22), 'words', 'shown(s)', 'needed(s)', 'window', ' verdict');
let bad = 0;
for (const it of report.items) {
  const need = 0.35 * it.words + 0.7;
  const ok = it.vis >= need;
  if (!ok) bad++;
  console.log(it.name.padEnd(22), String(it.words).padStart(5), it.vis.toFixed(2).padStart(8), need.toFixed(2).padStart(9), `${(it.first ?? 0).toFixed(2)}-${(it.last ?? 0).toFixed(2)}`.padStart(13), ' ', ok ? 'READABLE' : 'TOO FAST');
}
console.log(bad ? `\n${bad} text(s) shorter than the reading rule.` : '\nAll texts meet the reading rule.');
