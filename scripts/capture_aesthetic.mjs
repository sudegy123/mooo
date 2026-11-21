// Records the REAL local aesthetic planner demo (G:\sudegy-aesthetic-demo\mvp): intro -> quiz -> result -> chat (price question, slot booking).
// Demo data only; nothing is sent anywhere. Usage: node scripts/capture_aesthetic.mjs <frames_dir> <out_mp4> <events_json> [shots_dir]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const [framesDir, outMp4, eventsJson, shotsDir] = process.argv.slice(2);
const chrome = process.env.HYPERFRAMES_BROWSER_PATH || path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.rmSync(framesDir, { recursive: true, force: true }); fs.mkdirSync(framesDir, { recursive: true });
if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-first-run', '--mute-audio', '--hide-scrollbars', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto('file:///G:/sudegy-aesthetic-demo/mvp/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(1800);
const client = await page.createCDPSession(); const frames = [];
client.on('Page.screencastFrame', ({ data, metadata, sessionId }) => { frames.push({ t: metadata.timestamp, data }); client.send('Page.screencastFrameAck', { sessionId }).catch(() => {}); });
await client.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
await sleep(400); const t0 = Date.now() / 1000; const events = [];
const now = () => +(Date.now() / 1000 - t0).toFixed(3);
let shot = 0; const snap = async (n) => { if (shotsDir) await page.screenshot({ path: path.join(shotsDir, `${String(++shot).padStart(2, '0')}_${n}.png`) }); };
async function tap(sel, label, idx = 0) {
  const box = await page.evaluate((s, i) => { const e = [...document.querySelectorAll(s)][i]; if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel, idx);
  if (!box) return false;
  await sleep(250); events.push({ t: now(), x: Math.round(box.x), y: Math.round(box.y), label });
  await page.evaluate((s, i) => [...document.querySelectorAll(s)][i].click(), sel, idx); return true;
}
const screen = () => page.evaluate(() => document.body.getAttribute('data-screen'));
await sleep(1600); await snap('intro');
await tap('[data-act="start"]', 'start'); await sleep(900);
// quiz: take whatever the question offers; the first option of each, "next" for multi-select / consent
for (let q = 0; q < 30 && (await screen()) === 'quiz'; q++) {
  await snap(`q${q}`);
  const st = await page.evaluate(() => ({ consent: !!document.getElementById('consent'), opts: document.querySelectorAll('[data-act="pick"]').length, next: !!document.querySelector('[data-act="next"]'), name: !!document.getElementById('name') }));
  if (st.name) { await page.type('#name', 'سارة'); await sleep(300); }
  if (st.consent) { await sleep(500); await page.evaluate(() => { const c = document.getElementById('consent'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await sleep(500); await tap('[data-act="next"]', 'next'); }
  else if (st.opts) {
    const pickIdx = await page.evaluate(() => { const o = [...document.querySelectorAll('[data-act="pick"]')]; const none = o.findIndex((x) => x.getAttribute('data-v') === 'none'); if (none >= 0) return none; if (o.length >= 5 && /18/.test(document.body.innerText) && /55/.test(o.map((x) => x.innerText).join(' '))) return 2; return 0; });
    await tap('[data-act="pick"]', 'pick', pickIdx); await sleep(700);
    if (await page.evaluate(() => { const b = document.querySelector('[data-act="next"]'); return !!b && !b.disabled; })) { await sleep(500); await tap('[data-act="next"]', 'next'); }
  } else if (st.next) { await tap('[data-act="next"]', 'next'); }
  await sleep(1000);
}
await sleep(1200); await snap('result');
events.push({ t: now(), x: 0, y: 0, label: 'result-reached' });
await sleep(2600);
// scroll the result slowly so the doctor card/plan is visible
for (let i = 0; i < 6; i++) { await page.evaluate(() => window.scrollBy({ top: 240, behavior: 'smooth' })); await sleep(700); if (i === 2) await snap('result_mid'); }
await snap('result_end');
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(900);
if (await page.$('[data-act="send"]')) {
  await tap('[data-act="send"]', 'send'); await sleep(3600); await snap('chat1');
  if (await page.$('[data-act="price"]')) { await tap('[data-act="price"]', 'price'); await sleep(2800); await snap('chat2'); }
  if (await page.$('[data-act="slot"]')) { await tap('[data-act="slot"]', 'slot'); await sleep(3000); await snap('chat3'); }
  // the doctor card appears under the chat once the slot is confirmed: scroll to it and hold
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })); await sleep(900);
  events.push({ t: now(), x: 0, y: 0, label: 'doctor-card' }); await snap('doctor_card');
  await sleep(5200);
}
await sleep(500);
const tEnd = Date.now() / 1000; await client.send('Page.stopScreencast'); await sleep(200); await browser.close();
frames.forEach((f, i) => fs.writeFileSync(path.join(framesDir, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(f.data, 'base64')));
const lines = ['ffconcat version 1.0'];
frames.forEach((f, i) => { const d = i < frames.length - 1 ? Math.max(0.001, frames[i + 1].t - f.t) : 0.5; lines.push(`file 'f${String(i).padStart(5, '0')}.jpg'`, `duration ${d.toFixed(4)}`); });
const lastD = Math.max(0.5, tEnd - frames[frames.length - 1].t);
lines.splice(lines.length - 1, 1, `duration ${lastD.toFixed(4)}`);
lines.push(`file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'`);
fs.writeFileSync(path.join(framesDir, 'list.txt'), lines.join('\n'));
fs.writeFileSync(eventsJson, JSON.stringify({ firstFrameOffset: +(frames[0].t - t0).toFixed(3), duration: +(tEnd - frames[0].t).toFixed(3), events }, null, 2));
spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(framesDir, 'list.txt'), '-vf', 'fps=30,format=yuv420p', '-fps_mode', 'cfr', '-r', '30', '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-an', outMp4], { stdio: 'inherit' });
console.log('frames', frames.length, '->', outMp4, 'events', events.length);
