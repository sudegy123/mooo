import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const chrome = process.env.HYPERFRAMES_BROWSER_PATH || path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe');
const OUT_DIR = 'G:/sudegy-video-studio/assets/screens/sudegy_sudan_ad';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function capture() {
  console.log('Launching Chrome via puppeteer-core:', chrome);
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const targets = [
    { url: 'https://sudegy.com', name: '01_sudegy_home.jpg', wait: 1500 },
    { url: 'https://sudegy.com/showrooms/', name: '02_sudegy_showrooms.jpg', wait: 2000 },
    { url: 'https://sudegy.com/sneakers/', name: '03_sudegy_store_pos.jpg', wait: 2000 },
    { url: 'https://sudegy.com/services', name: '05_sudegy_services.jpg', wait: 1500 }
  ];

  for (const t of targets) {
    try {
      console.log(`Navigating to ${t.url}...`);
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(r => setTimeout(r, t.wait));
      const outPath = path.join(OUT_DIR, t.name);
      await page.screenshot({ path: outPath, type: 'jpeg', quality: 90 });
      console.log(`Saved ${outPath}`);
    } catch (e) {
      console.error(`Error capturing ${t.url}:`, e.message);
    }
  }

  await browser.close();
  console.log('Done captures!');
}

capture().catch(console.error);
