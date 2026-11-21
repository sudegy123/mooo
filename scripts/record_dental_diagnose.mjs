import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const chrome = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
const framesDir = 'G:\\sudegy-video-studio\\temp_dental_frames';
const outMp4 = 'G:\\sudegy-video-studio\\assets\\screens\\dental_diagnose_reel.mp4';
const eventsJson = 'G:\\sudegy-video-studio\\assets\\screens\\dental_diagnose_reel.events.json';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

async function main() {
  console.log('Launching browser for dental screen recording...');
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: [
      '--no-first-run',
      '--mute-audio',
      '--hide-scrollbars',
      '--no-sandbox',
      '--use-gl=angle',
      '--enable-webgl',
      '--window-size=390,844'
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Navigating to https://sudegy.com/dental/diagnose...');
  await page.goto('https://sudegy.com/dental/diagnose', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(1500);

  // Switch to Arabic first before starting the recording so the entire recording is in Arabic
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button, span'));
    const ar = els.find(e => e.innerText && e.innerText.trim() === 'عربي');
    if (ar) ar.click();
  });
  await sleep(2000);

  console.log('Starting CDP screencast session...');
  const client = await page.createCDPSession();
  const frames = [];
  client.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push({ t: metadata.timestamp, data });
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    maxWidth: 780,
    maxHeight: 1688,
    everyNthFrame: 1
  });

  await sleep(800);
  const t0 = Date.now() / 1000;
  const events = [];
  const now = () => +(Date.now() / 1000 - t0).toFixed(3);
  const log = (m) => console.log(`[${now()}s] ${m}`);

  // 1. Show Landing screen with 3D mouth (Hold 1.2s)
  log('Landing screen visible: أرنا مكان الألم');
  await sleep(1400);

  // 2. Click "ادخل إلى الداخل"
  log('Clicking ادخل إلى الداخل...');
  const insideCoord = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(e => e.innerText && e.innerText.includes('ادخل إلى الداخل'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });

  if (insideCoord) {
    events.push({ t: now(), x: Math.round(insideCoord.x), y: Math.round(insideCoord.y), label: 'tap inside' });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, a')).find(e => e.innerText && e.innerText.includes('ادخل إلى الداخل'));
      if (btn) btn.click();
    });
  }
  await sleep(2200);

  // 3. Subtle drag on 3D mouth to showcase 3D interactive model
  log('Dragging 3D canvas...');
  await page.mouse.move(195, 300);
  await page.mouse.down();
  await page.mouse.move(160, 280, { steps: 10 });
  await page.mouse.up();
  await sleep(800);

  // 4. Select tooth 46
  log('Selecting tooth 46...');
  const t46Coord = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(e => e.innerText.trim() === '46');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });

  if (t46Coord) {
    events.push({ t: now(), x: Math.round(t46Coord.x), y: Math.round(t46Coord.y), label: 'tap tooth 46' });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(e => e.innerText.trim() === '46');
      if (btn) btn.click();
    });
  }
  await sleep(1200);

  // 5. Click "متابعة"
  log('Clicking متابعة...');
  const contCoord = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(e => e.innerText.includes('متابعة'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });

  if (contCoord) {
    events.push({ t: now(), x: Math.round(contCoord.x), y: Math.round(contCoord.y), label: 'tap متابعة' });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(e => e.innerText.includes('متابعة'));
      if (btn) btn.click();
    });
  }
  await sleep(1400);

  // 6. Select symptoms: ألم نابض, يتألم مع البارد, يوقظك ليلاً
  log('Selecting symptoms...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b1 = buttons.find(b => b.innerText.includes('ألم نابض'));
    if (b1) b1.click();
  });
  await sleep(600);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b2 = buttons.find(b => b.innerText.includes('يتألم مع البارد'));
    if (b2) b2.click();
  });
  await sleep(600);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b3 = buttons.find(b => b.innerText.includes('منذ أيام'));
    if (b3) b3.click();
  });
  await sleep(600);

  // Check night checkbox if present
  await page.evaluate(() => {
    const chk = document.querySelector('input[name=night]');
    if (chk) chk.click();
  });
  await sleep(800);

  // 7. Click "اعرض الملخص"
  log('Clicking اعرض الملخص...');
  const sumCoord = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(e => e.innerText.includes('اعرض الملخص'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });

  if (sumCoord) {
    events.push({ t: now(), x: Math.round(sumCoord.x), y: Math.round(sumCoord.y), label: 'tap اعرض الملخص' });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(e => e.innerText.includes('اعرض الملخص'));
      if (btn) btn.click();
    });
  }
  await sleep(1800);

  // 8. Hold on Summary & WhatsApp button (Hold 3.5s)
  log('Summary displayed: احجز هذا الأسبوع + التهاب عصب السن + واتساب');
  await sleep(3500);

  const tEnd = Date.now() / 1000;
  log(`Finished scenario. Stopping screencast... Total time: ${(tEnd - t0).toFixed(1)}s`);

  await client.send('Page.stopScreencast');
  await sleep(400);
  await browser.close();

  console.log(`Captured ${frames.length} frames over ${(tEnd - t0).toFixed(1)}s`);
  if (frames.length === 0) throw new Error('No frames captured');

  console.log('Writing frame files to disk...');
  frames.forEach((f, i) => {
    fs.writeFileSync(path.join(framesDir, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(f.data, 'base64'));
  });

  const lines = ['ffconcat version 1.0'];
  frames.forEach((f, i) => {
    const d = i < frames.length - 1 ? Math.max(0.001, frames[i + 1].t - f.t) : 0.5;
    lines.push(`file 'f${String(i).padStart(5, '0')}.jpg'`, `duration ${d.toFixed(4)}`);
  });
  lines.push(`file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'`);
  fs.writeFileSync(path.join(framesDir, 'list.txt'), lines.join('\n'));

  const base = frames[0].t;
  fs.writeFileSync(eventsJson, JSON.stringify({
    firstFrameOffset: +(base - t0).toFixed(3),
    duration: +(frames[frames.length - 1].t - base).toFixed(3),
    events
  }, null, 2));

  console.log('Encoding MP4 via ffmpeg...');
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });
  const r = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0',
    '-i', path.join(framesDir, 'list.txt'),
    '-vf', 'fps=30,format=yuv420p',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', outMp4
  ], { stdio: 'inherit' });

  console.log('Finished ffmpeg encoding! Status:', r.status);
  console.log('Cleaning up frames dir...');
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('SUCCESS! Video ready at:', outMp4);
}

main().catch(err => {
  console.error('Recording failed:', err);
  process.exit(1);
});

