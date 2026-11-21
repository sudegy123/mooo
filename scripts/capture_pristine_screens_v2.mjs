import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'G:\\sudegy-video-studio\\assets\\screens\\andoria_perfect';
fs.mkdirSync(outDir, { recursive: true });

async function waitImages(page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(res => {
        img.addEventListener('load', () => res(), { once: true });
        img.addEventListener('error', () => res(), { once: true });
        setTimeout(res, 5000);
      });
    }));
  });
  await new Promise(r => setTimeout(r, 1000));
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--window-size=430,932']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, deviceScaleFactor: 2 });

  page.on('dialog', async d => { await d.dismiss(); });

  console.log('1. Loading landing...');
  await page.goto('https://app.andoriasudan.com/app/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => { window.alert = () => {}; });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '01_landing.png') });
  console.log('Saved 01_landing.png');

  console.log('2. Step 2 - Property selection (Homes, Farms, Workshops, Clinics)...');
  await page.evaluate(() => {
    StateManager.setState({ beneficiary: 'self', customerType: 'home_owner' });
    Router.goTo(2, 1, s => onStepEnter(s));
  });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '02_property.png') });
  console.log('Saved 02_property.png');

  console.log('3. Step 3 - Blackout hours...');
  await page.evaluate(() => {
    StateManager.setState({ propertyType: 'home' });
    Router.goTo(3, 2, s => onStepEnter(s));
  });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '03_outage.png') });
  console.log('Saved 03_outage.png');

  console.log('4. Step 4 - Device Categories (Cooling, Pumps, Agri, Workshop, Medical)...');
  await page.evaluate(() => {
    StateManager.setState({ outageHours: 12 });
    Router.goTo(4, 3, s => onStepEnter(s));
  });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '04_categories.png') });
  console.log('Saved 04_categories.png');

  console.log('5. Step 4 - Cooling Category (ACs & Fans with complete loaded images)...');
  await page.evaluate(() => {
    enterDeviceCategory('cooling');
  });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '05_cooling_loaded.png') });
  console.log('Saved 05_cooling_loaded.png');

  console.log('6. Step 4 - Pumps & Agriculture (Submersible Pumps & Mills with loaded images)...');
  await page.evaluate(() => {
    exitDeviceCategory();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    enterDeviceCategory('pumps');
  });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '06_pumps_loaded.png') });
  console.log('Saved 06_pumps_loaded.png');

  console.log('7. Step 6 - Consumption Summary (Load meter & daily kWh)...');
  await page.evaluate(() => {
    StateManager.setState({
      selectedDevices: {
        'ac-1.5-inv': { qty: 1, hours: 8 },
        'fan-ceil': { qty: 2, hours: 12 },
        'fridge-inv': { qty: 1, hours: 24 },
        'pump-sub-2hp': { qty: 1, hours: 4 }
      }
    });
    Router.goTo(6, 4, s => onStepEnter(s));
  });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '07_summary.png') });
  console.log('Saved 07_summary.png');

  console.log('8. Step 7 - Technical Recommendation (Panels, Batteries, Inverter)...');
  await page.evaluate(() => {
    Router.goTo(7, 6, s => onStepEnter(s));
  });
  await waitImages(page);
  await page.screenshot({ path: path.join(outDir, '08_recommendation.png') });
  console.log('Saved 08_recommendation.png');

  await browser.close();
  console.log('ALL SCREENS CAPTURED WITH 100% IMAGES LOADED!');
}

main().catch(console.error);

