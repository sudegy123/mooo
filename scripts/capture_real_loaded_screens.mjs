import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'G:\\sudegy-video-studio\\assets\\screens\\andoria_perfect';
fs.mkdirSync(outDir, { recursive: true });

async function waitForAllImages(page, timeout = 12000) {
  await page.evaluate(async (maxWait) => {
    const selectors = ['img', '.device-card img', '.device-image-wrap img', '.category-card img'];
    const imgs = Array.from(document.querySelectorAll(selectors.join(',')));
    if (!imgs.length) return;
    const promises = imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve(true);
      return new Promise(resolve => {
        const timer = setTimeout(() => resolve(false), maxWait);
        img.addEventListener('load', () => { clearTimeout(timer); resolve(true); }, { once: true });
        img.addEventListener('error', () => { clearTimeout(timer); resolve(false); }, { once: true });
      });
    });
    await Promise.all(promises);
  }, timeout);
  // Extra pause for any CSS transition / decode
  await new Promise(r => setTimeout(r, 1200));
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--window-size=430,932']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, deviceScaleFactor: 2 });

  console.log('1. Loading landing page...');
  await page.goto('https://app.andoriasudan.com/app/', { waitUntil: 'networkidle2', timeout: 30000 });
  await waitForAllImages(page);
  await page.screenshot({ path: path.join(outDir, '01_landing.png') });
  console.log('Saved 01_landing.png');

  console.log('2. Step 2 - Profile (لنفسي / لعائلتي)...');
  await page.evaluate(() => {
    window.goToStep(2);
  });
  await waitForAllImages(page);
  await page.screenshot({ path: path.join(outDir, '02_profile.png') });
  console.log('Saved 02_profile.png');

  console.log('3. Step 3 - Property Type (منزل، مزرعة، ورشة، صيدلية/عيادة)...');
  await page.evaluate(() => {
    window.goToStep(3);
  });
  await waitForAllImages(page);
  await page.screenshot({ path: path.join(outDir, '03_property.png') });
  console.log('Saved 03_property.png');

  console.log('4. Step 4 - Outage Hours (ساعات انقطاع الكهرباء)...');
  await page.evaluate(() => {
    window.goToStep(4);
  });
  await waitForAllImages(page);
  await page.screenshot({ path: path.join(outDir, '04_outage_hours.png') });
  console.log('Saved 04_outage_hours.png');

  console.log('5. Step 5 - Device Categories (تبريد، مضخات، زراعة، ورشة، طبي)...');
  await page.evaluate(() => {
    // Set propertyType to something rich or house
    StateManager.setState({
      propertyType: 'home',
      customerType: 'home_owner',
      beneficiary: 'self',
      outageHours: 12
    });
    window.goToStep(5);
  });
  await waitForAllImages(page);
  await page.screenshot({ path: path.join(outDir, '05_categories.png') });
  console.log('Saved 05_categories.png');

  console.log('6. Step 5 - Cooling Devices Grid (ثلاجات ومكيفات مع صورها الكاملة)...');
  await page.evaluate(() => {
    if (window.enterDeviceCategory) {
      window.enterDeviceCategory('cooling');
    }
  });
  await waitForAllImages(page);
  // Log image status
  const coolingImgsStatus = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#device-grid img'));
    return imgs.map(i => ({ src: i.src, naturalWidth: i.naturalWidth, complete: i.complete }));
  });
  console.log('Cooling images status count:', coolingImgsStatus.length, 'Loaded:', coolingImgsStatus.filter(i => i.naturalWidth > 0).length);
  await page.screenshot({ path: path.join(outDir, '06_devices_cooling.png') });
  console.log('Saved 06_devices_cooling.png');

  console.log('7. Step 5 - Pumps & Agriculture (طرمبة غاطسة، طواحين، مزارع)...');
  await page.evaluate(() => {
    if (window.enterDeviceCategory) {
      window.enterDeviceCategory('pumps');
    }
  });
  await waitForAllImages(page);
  const pumpImgsStatus = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#device-grid img'));
    return imgs.map(i => ({ src: i.src, naturalWidth: i.naturalWidth, complete: i.complete }));
  });
  console.log('Pump images status count:', pumpImgsStatus.length, 'Loaded:', pumpImgsStatus.filter(i => i.naturalWidth > 0).length);
  await page.screenshot({ path: path.join(outDir, '07_devices_pumps.png') });
  console.log('Saved 07_devices_pumps.png');

  console.log('8. Step 6 - Consumption Summary (ملخص الاستهلاك والحمل الأقصى)...');
  await page.evaluate(() => {
    // Select some devices
    StateManager.setState({
      selectedDevices: {
        'ac-1.5-inv': { qty: 1, hours: 8 },
        'fan-ceil': { qty: 3, hours: 12 },
        'fridge-inv': { qty: 1, hours: 24 },
        'pump-sub-2hp': { qty: 1, hours: 4 }
      }
    });
    window.goToStep(6);
  });
  await waitForAllImages(page);
  await page.screenshot({ path: path.join(outDir, '08_summary.png') });
  console.log('Saved 08_summary.png');

  console.log('9. Step 7 - Technical Recommendation (الألواح، البطاريات، المحول)...');
  await page.evaluate(() => {
    window.goToStep(7);
  });
  await waitForAllImages(page);
  await page.screenshot({ path: path.join(outDir, '09_recommendation.png') });
  console.log('Saved 09_recommendation.png');

  await browser.close();
  console.log('ALL PERFECT SCREENS CAPTURED!');
}

main().catch(console.error);
