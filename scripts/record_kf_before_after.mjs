import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const chrome = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function recordPage(url, outMp4, framesDirName, scrollDistance = 1400) {
  const framesDir = path.join('G:\\sudegy-video-studio', framesDirName);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  console.log(`Launching browser for recording: ${url}`);
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-first-run', '--mute-audio', '--hide-scrollbars', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (e) {
    console.log('Timeout on networkidle2, proceeding anyway...');
  }
  await sleep(2500);

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

  await sleep(1000);
  const t0 = Date.now() / 1000;

  // Hold top hero for 1.8s
  await sleep(1800);

  // Smooth scroll down
  const steps = 40;
  const stepDist = scrollDistance / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy(0, d), stepDist);
    await sleep(70);
  }

  // Hold scrolled position
  await sleep(2000);

  // Scroll a bit more
  for (let i = 0; i < 20; i++) {
    await page.evaluate((d) => window.scrollBy(0, d), stepDist * 0.7);
    await sleep(70);
  }
  await sleep(1500);

  const tEnd = Date.now() / 1000;
  console.log(`Captured ${frames.length} frames over ${(tEnd - t0).toFixed(1)}s`);

  await client.send('Page.stopScreencast');
  await sleep(400);
  await browser.close();

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

  console.log(`Encoding MP4: ${outMp4}...`);
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });
  spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0',
    '-i', path.join(framesDir, 'list.txt'),
    '-vf', 'fps=30,format=yuv420p',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
    '-an', outMp4
  ], { stdio: 'inherit' });

  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log(`SUCCESS: ${outMp4}`);
}

async function main() {
  await recordPage(
    'https://khuludf.wixstudio.com/website-4?rc=test-site',
    'G:\\sudegy-video-studio\\assets\\screens\\kf_before_reel.mp4',
    'temp_kf_before_frames',
    1200
  );

  await recordPage(
    'https://kfbeuty.com/',
    'G:\\sudegy-video-studio\\assets\\screens\\kf_after_reel.mp4',
    'temp_kf_after_frames',
    1400
  );
}

main().catch(err => {
  console.error("Recording failed:", err);
  process.exit(1);
});

