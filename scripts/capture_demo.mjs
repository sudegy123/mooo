// Records the REAL Sudegy dental self-triage demo (https://sudegydental.pages.dev/diagnose.html) as a phone screen video.
// Headless Edge + CDP screencast, deterministic scripted taps, Arabic UI. Does NOT press the WhatsApp send button.
// Usage: node scripts/capture_demo.mjs <frames_dir> <out_mp4> <events_json> [url]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [framesDir, outMp4, eventsJson, urlArg] = process.argv.slice(2);
if (!framesDir || !outMp4 || !eventsJson) { console.error('usage: node capture_demo.mjs <frames_dir> <out_mp4> <events_json> [url]'); process.exit(2); }
const URL = urlArg || 'https://sudegydental.pages.dev/diagnose.html';
const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: EDGE, headless: true,
  // Real GPU path (Intel HD 620 via D3D11). SwiftShader (software WebGL) made this page ~50x slower on this machine.
  args: ['--ignore-gpu-blocklist', '--enable-webgl', '--hide-scrollbars', '--mute-audio', '--no-first-run'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem('alba-lang', 'ar'); } catch (e) {} });
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 160)));

console.log('loading page (software WebGL can be slow)...');
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(() => { const i = document.querySelector('#intro'); return i && !i.hidden; }, { timeout: 240000, polling: 500 });
console.log('intro visible, starting recording');

const client = await page.createCDPSession();
const frames = [];
client.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  frames.push({ t: metadata.timestamp, data });
  client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
await client.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
await sleep(400);
const t0 = Date.now() / 1000;
const events = [];

async function tap(selector, label, pauseAfter = 900) {
  // Clicks through the page itself (robust when the main thread is busy rendering WebGL); records the tap position for overlays.
  await page.waitForFunction((s) => !!document.querySelector(s), { timeout: 60000, polling: 250 }, selector);
  const box = await page.evaluate((s) => {
    const n = document.querySelector(s);
    n.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = n.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, selector);
  await sleep(150);
  events.push({ t: +(Date.now() / 1000 - t0).toFixed(3), x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2), label });
  await page.evaluate((s) => document.querySelector(s).click(), selector);
  await sleep(pauseAfter);
}

await sleep(1400);                                   // intro: "أرنا مكان الألم."
await tap('#enter', 'enter', 2600);                  // camera moves inside the 3D mouth
await tap('.tb[data-fdi="46"]', 'tooth-46', 1500);   // lower-right first molar
await tap('#to2', 'continue-1', 1100);
await tap('#feels .chip[data-id="throb"]', 'feel-throb', 500);
await tap('#feels .chip[data-id="cold"]', 'feel-cold', 500);
await page.evaluate(() => { const s = document.querySelector('#sev'); s.value = 7; s.dispatchEvent(new Event('input', { bubbles: true })); });
events.push({ t: +(Date.now() / 1000 - t0).toFixed(3), label: 'severity-7' });
await sleep(700);
await tap('#durs .chip[data-id="days"]', 'duration-days', 400);
await tap('label.check:has(#night)', 'night', 700);
await tap('#to3', 'summary', 2600);                  // summary: urgency + guidance
await page.evaluate(() => document.querySelector('#panel').scrollBy({ top: 260, behavior: 'smooth' }));
await sleep(1800);
const tEnd = Date.now() / 1000;

await client.send('Page.stopScreencast');
await sleep(200);
await browser.close();

// frames -> constant-fps mp4 (frames are variable-rate: use their real timestamps)
console.log(`captured ${frames.length} frames over ${(tEnd - t0).toFixed(1)}s`);
frames.forEach((f, i) => fs.writeFileSync(path.join(framesDir, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(f.data, 'base64')));
const lines = ['ffconcat version 1.0'];
frames.forEach((f, i) => {
  const dur = i < frames.length - 1 ? Math.max(0.001, frames[i + 1].t - f.t) : 0.5;
  lines.push(`file 'f${String(i).padStart(5, '0')}.jpg'`, `duration ${dur.toFixed(4)}`);
});
lines.push(`file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'`);
const listPath = path.join(framesDir, 'list.txt');
fs.writeFileSync(listPath, lines.join('\n'));
// event times relative to first frame
const base = frames[0].t;
fs.writeFileSync(eventsJson, JSON.stringify({ frameBase: base, firstFrameOffset: +(base - t0).toFixed(3), duration: +(frames[frames.length - 1].t - base).toFixed(3), events }, null, 2));
fs.mkdirSync(path.dirname(outMp4), { recursive: true });
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listPath, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-an', outMp4], { stdio: 'inherit' });
console.log('ffmpeg exit', r.status, '->', outMp4);
