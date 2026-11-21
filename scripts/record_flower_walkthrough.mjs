import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const chrome = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
const framesDir = 'G:\\sudegy-video-studio\\temp_flower_frames';
const outMp4 = 'G:\\sudegy-video-studio\\assets\\screens\\flower_walkthrough.mp4';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

async function main() {
  console.log('Launching browser for flower store 1080p widescreen recording...');
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: [
      '--no-first-run',
      '--mute-audio',
      '--hide-scrollbars',
      '--no-sandbox',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log('Navigating to https://flowerstore-4xu.pages.dev/...');
  await page.goto('https://flowerstore-4xu.pages.dev/', { waitUntil: 'networkidle2', timeout: 45000 });

  // 1. Switch to Arabic mode
  console.log('Switching to Arabic mode...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.trim() === 'العربية');
    if (btn) btn.click();
  });
  await sleep(1000);

  // 2. Preload ALL 27 images completely by scrolling down and waiting
  console.log('Preloading all images so zero images are blank...');
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
  });
  await sleep(2000);

  // Verify all images loaded
  const brokenCount = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => img.naturalWidth === 0).length;
  });
  console.log(`Preload check: ${brokenCount} broken images (0 expected).`);

  // Scroll back to top for recording
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1500);

  console.log('Starting CDP screencast session for TV display...');
  const client = await page.createCDPSession();
  const frames = [];
  let recording = true;

  client.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    if (!recording) return;
    frames.push({ t: metadata.timestamp, data });
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  await sleep(800);
  const t0 = Date.now() / 1000;
  const now = () => +(Date.now() / 1000 - t0).toFixed(2);

  // --- PART 1: Hero view (0.0s - 6.5s) ---
  console.log(`[${now()}s] PART 1: Hero Showcase ("ورود لا تذبل أبداً")`);
  await sleep(2500);

  // Scroll gently down towards the bouquets section
  for (let i = 0; i < 24; i++) {
    await page.evaluate(() => window.scrollBy(0, 28));
    await sleep(65);
  }
  await sleep(1800);
  const tPart1End = now();
  console.log(`[${tPart1End}s] Part 1 completed.`);

  // --- PART 2: Bouquets Catalog & Filtering (6.5s - 13.5s) ---
  console.log(`[${now()}s] PART 2: Filtering & Bouquets Catalog`);
  // Click "ورود" filter
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const f = btns.find(b => b.innerText.trim() === 'ورود' || b.innerText.includes('ورود'));
    if (f) f.click();
  });
  await sleep(2000);

  // Click "درجات هادئة" filter
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const f = btns.find(b => b.innerText.trim() === 'درجات هادئة' || b.innerText.includes('هادئة'));
    if (f) f.click();
  });
  await sleep(2000);

  // Click "الكل" to show full collection
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const f = btns.find(b => b.innerText.trim() === 'الكل');
    if (f) f.click();
  });
  await sleep(1800);

  // Scroll down a bit more to see bouquet cards
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.scrollBy(0, 25));
    await sleep(60);
  }
  await sleep(1500);
  const tPart2End = now();
  console.log(`[${tPart2End}s] Part 2 completed.`);

  // --- PART 3: Add to Cart & Instant Checkout (13.5s - 21.0s) ---
  console.log(`[${now()}s] PART 3: Adding bouquet to cart & Opening drawer`);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const add = btns.find(b => b.innerText.includes('أضف') || b.innerText.includes('Add'));
    if (add) add.click();
  });
  await sleep(1800);

  // Open cart drawer
  console.log(`[${now()}s] Opening cart drawer...`);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cart = btns.find(b => b.innerText.includes('السلة') || b.innerText.includes('Cart'));
    if (cart) cart.click();
  });
  await sleep(2500);

  // Hold on cart details and WhatsApp checkout button
  console.log(`[${now()}s] Holding on cart & WhatsApp order button`);
  await sleep(3500);

  const tEnd = now();
  console.log(`[${tEnd}s] Recording finished! Total frames: ${frames.length}`);
  recording = false;

  try {
    await Promise.race([
      client.send('Page.stopScreencast'),
      sleep(1000)
    ]);
  } catch (e) {}

  try {
    await Promise.race([
      browser.close(),
      sleep(2000)
    ]);
  } catch (e) {
    try { browser.process()?.kill(); } catch (_) {}
  }

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

  console.log(`Encoding master 1080p widescreen MP4: ${outMp4}...`);
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });
  const encRes = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0',
    '-i', path.join(framesDir, 'list.txt'),
    '-vf', 'fps=30,format=yuv420p',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', outMp4
  ], { stdio: 'inherit' });

  console.log('ffmpeg exit status:', encRes.status);
  console.log('Cleaning up frames dir...');
  fs.rmSync(framesDir, { recursive: true, force: true });

  console.log('Master flower store recording created:', outMp4);
  console.log(`Timestamps: Part 1: 0.0 - ${tPart1End}s, Part 2: ${tPart1End} - ${tPart2End}s, Part 3: ${tPart2End} - ${tEnd}s`);

  // Extract the 3 sub-clips for the TV scenes:
  const clip1 = 'G:\\sudegy-video-studio\\assets\\screens\\flower_clip_hero.mp4';
  const clip2 = 'G:\\sudegy-video-studio\\assets\\screens\\flower_clip_catalog.mp4';
  const clip3 = 'G:\\sudegy-video-studio\\assets\\screens\\flower_clip_checkout.mp4';

  console.log('Extracting clip 1 (Hero)...');
  spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-ss', '0.0', '-to', String(tPart1End),
    '-i', outMp4,
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', clip1
  ], { stdio: 'inherit' });

  console.log('Extracting clip 2 (Catalog)...');
  spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-ss', String(tPart1End), '-to', String(tPart2End),
    '-i', outMp4,
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', clip2
  ], { stdio: 'inherit' });

  console.log('Extracting clip 3 (Checkout)...');
  spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-ss', String(tPart2End), '-to', String(tEnd),
    '-i', outMp4,
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', clip3
  ], { stdio: 'inherit' });

  console.log('ALL FLOWER CLIPS SUCCESSFULLY EXTRACTED!');
}

main().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
