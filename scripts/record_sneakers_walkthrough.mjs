import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const chrome = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
const framesDir = 'G:\\sudegy-video-studio\\temp_sneakers_frames';
const outMp4 = 'G:\\sudegy-video-studio\\assets\\screens\\sneakers_walkthrough.mp4';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

async function main() {
  console.log('Launching browser for sneakers recording...');
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: [
      '--no-first-run',
      '--mute-audio',
      '--hide-scrollbars',
      '--no-sandbox',
      '--window-size=390,844'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Navigating to https://sudegy.com/sneakers/...');
  await page.goto('https://sudegy.com/sneakers/', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1500);

  // Switch to Arabic
  console.log('Toggling Arabic...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'AR');
    if (btn) btn.click();
  });
  await sleep(1500);

  console.log('Starting CDP screencast session...');
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
    quality: 90,
    maxWidth: 780,
    maxHeight: 1688,
    everyNthFrame: 1
  });

  await sleep(600);
  const t0 = Date.now() / 1000;
  const now = () => +(Date.now() / 1000 - t0).toFixed(2);

  // --- PART 1: Browse Sneakers Catalog (0.0s - 8.5s) ---
  console.log(`[${now()}s] PART 1: Hero view & catalog scroll`);
  await sleep(1800);

  for (let i = 0; i < 35; i++) {
    await page.evaluate(() => window.scrollBy(0, 35));
    await sleep(60);
  }
  await sleep(1500);

  for (let i = 0; i < 25; i++) {
    await page.evaluate(() => window.scrollBy(0, 30));
    await sleep(60);
  }
  await sleep(1500);

  const tPart1End = now();
  console.log(`[${tPart1End}s] Part 1 completed.`);

  // --- PART 2: Product Detail & Size Selection ---
  console.log(`[${now()}s] PART 2: Navigating to Nike Air Force 1`);
  await page.goto('https://sudegy.com/sneakers/shop/all.html?p=nike-air-force-1', { waitUntil: 'networkidle2' });
  await sleep(1800);

  console.log(`[${now()}s] Selecting size 42`);
  await page.evaluate(() => {
    const sizes = Array.from(document.querySelectorAll('.size'));
    const s42 = sizes.find(el => el.innerText.trim() === '42');
    if (s42) s42.click();
  });
  await sleep(2000);

  console.log(`[${now()}s] Selecting size 43`);
  await page.evaluate(() => {
    const sizes = Array.from(document.querySelectorAll('.size'));
    const s43 = sizes.find(el => el.innerText.trim() === '43');
    if (s43) s43.click();
  });
  await sleep(1500);

  console.log(`[${now()}s] Selecting size 42 again`);
  await page.evaluate(() => {
    const sizes = Array.from(document.querySelectorAll('.size'));
    const s42 = sizes.find(el => el.innerText.trim() === '42');
    if (s42) s42.click();
  });
  await sleep(1800);

  const tPart2End = now();
  console.log(`[${tPart2End}s] Part 2 completed.`);

  // --- PART 3: Add to Cart & WhatsApp Checkout ---
  console.log(`[${now()}s] PART 3: Adding to cart`);
  await page.evaluate(() => {
    const addBtn = document.querySelector('#p-add');
    if (addBtn) addBtn.click();
  });
  await sleep(1500);

  console.log(`[${now()}s] Opening cart drawer`);
  await page.evaluate(() => {
    const cartBtn = document.querySelector('#cart-open');
    if (cartBtn) cartBtn.click();
  });
  await sleep(2500);

  console.log(`[${now()}s] Holding on WhatsApp checkout`);
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

  console.log('Writing frame files...');
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

  console.log(`Encoding master MP4: ${outMp4}...`);
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });
  const encRes = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0',
    '-i', path.join(framesDir, 'list.txt'),
    '-vf', 'fps=30,format=yuv420p',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', outMp4
  ], { stdio: 'inherit' });

  console.log('ffmpeg exited with:', encRes.status);
  console.log('Cleaning up frames dir...');
  fs.rmSync(framesDir, { recursive: true, force: true });

  console.log('Master recording created:', outMp4);
  console.log(`Timestamps: Part 1: 0.0 - ${tPart1End}s, Part 2: ${tPart1End} - ${tPart2End}s, Part 3: ${tPart2End} - ${tEnd}s`);

  // Now extract the 3 dedicated clips:
  const clip1 = 'G:\\sudegy-video-studio\\assets\\screens\\sneakers_clip_browse.mp4';
  const clip2 = 'G:\\sudegy-video-studio\\assets\\screens\\sneakers_clip_size.mp4';
  const clip3 = 'G:\\sudegy-video-studio\\assets\\screens\\sneakers_clip_checkout.mp4';

  console.log('Extracting clip 1 (Browse)...');
  spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-ss', '0.0', '-to', String(tPart1End),
    '-i', outMp4,
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', clip1
  ], { stdio: 'inherit' });

  console.log('Extracting clip 2 (Size)...');
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

  console.log('ALL CLIPS SUCCESSFULLY EXTRACTED!');
}

main().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
