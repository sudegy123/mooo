import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'G:\\sudegy-video-studio\\assets\\screens\\andoria_steps';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, deviceScaleFactor: 2 });

  await page.goto('https://app.andoriasudan.com', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Inspect global app state or step functions
  const state = await page.evaluate(async () => {
    // Check if there is a window.goToStep or showStep function
    const fnNames = Object.keys(window).filter(k => typeof window[k] === 'function');
    return { fnNames: fnNames.filter(f => /step|calc|andoria|app/i.test(f)) };
  });
  console.log('Window functions:', state);

  // Navigate through steps via UI or function
  await page.evaluate(() => {
    // Start button
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.includes('ابدأ'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Step 2: Choose profile
  await page.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('.profile-card, .radio-card, .btn, div'));
    const myself = opts.find(el => el.innerText && el.innerText.trim() === 'لنفسي');
    if (myself) myself.click();
    const next = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('التالي'));
    if (next) next.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Step 3: Property
  await page.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('*'));
    const house = opts.find(el => el.innerText && el.innerText.trim() === 'صاحب منزل');
    if (house) house.click();
    const next = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('التالي'));
    if (next) next.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Step 4: Hours
  await page.evaluate(() => {
    const next = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('التالي'));
    if (next) next.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'step5_devices_initial.png') });

  // Wait for all images in step 5 to load!
  console.log('Waiting for images in step 5 to load...');
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('#step-5 img, .step.active img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 6000);
      });
    }));
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, 'step5_devices_loaded.png') });

  const deviceImgs = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#step-5 img, .step.active img'));
    return imgs.map(i => ({ src: i.src, naturalWidth: i.naturalWidth, complete: i.complete, alt: i.alt }));
  });
  console.log('Device images:', JSON.stringify(deviceImgs, null, 2));

  await browser.close();
}

run().catch(console.error);

