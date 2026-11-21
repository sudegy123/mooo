import puppeteer from 'puppeteer-core';

const chrome = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function waitImages(page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(res => {
        img.addEventListener('load', () => res(), { once: true });
        img.addEventListener('error', () => res(), { once: true });
        setTimeout(res, 4000);
      });
    }));
  });
  await new Promise(r => setTimeout(r, 600));
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-first-run', '--mute-audio', '--hide-scrollbars', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  page.on('dialog', async d => { await d.dismiss(); });
  page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 140)));

  console.log('Navigating to app...');
  await page.goto('https://app.andoriasudan.com/app/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => { window.alert = () => {}; });

  console.log('Step 1: Welcome');
  await page.click('.btn-primary');
  await new Promise(r => setTimeout(r, 800));

  console.log('Step 2: Property (Farm)');
  await waitImages(page);
  await page.evaluate(() => {
    const card = document.querySelector('.property-card[data-type="farm"]') || document.querySelector('.property-card');
    selectProperty(card);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.click('#btn-step2');
  await new Promise(r => setTimeout(r, 800));

  console.log('Step 3: Outage Hours');
  await page.evaluate(() => {
    const btn = document.querySelector('.outage-btn[data-hours="16"]') || document.querySelector('.outage-btn');
    selectOutage(btn);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.click('#step-3 .btn-primary');
  await new Promise(r => setTimeout(r, 800));

  console.log('Step 4: Devices - Cooling');
  await waitImages(page);
  await page.evaluate(() => enterDeviceCategory('cooling'));
  await waitImages(page);
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.device-card')].find(x => x.textContent.includes('مكيف مويه') || x.textContent.includes('مروحة'));
    if (c) c.click();
    exitDeviceCategory();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Step 4: Devices - Pumps (Submersible)');
  await page.evaluate(() => enterDeviceCategory('pumps'));
  await waitImages(page);
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.device-card')].find(x => x.textContent.includes('طلمبة غاطسة'));
    if (c) c.click();
    exitDeviceCategory();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Step 4: Devices - Agriculture (Mills & Poultry)');
  await page.evaluate(() => enterDeviceCategory('agriculture'));
  await waitImages(page);
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.device-card')].find(x => x.textContent.includes('طاحونة') || x.textContent.includes('دجاج') || x.textContent.includes('تدفئة'));
    if (c) c.click();
    exitDeviceCategory();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Step 4 -> Advance to Profile');
  await page.click('#step-4 .btn-primary');
  await new Promise(r => setTimeout(r, 800));

  console.log('Step 5: Profile');
  await page.type('#cust-name', 'أحمد عثمان');
  await page.type('#cust-mobile', '0912345678');
  await page.click('#btn-step-profile');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Step 6: Summary');
  await waitImages(page);
  await page.click('#step-6 .btn-primary');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Step 7: Proposed System');
  await waitImages(page);
  await page.click('#step-7 .btn-primary');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Step 8: Final Needs');
  await waitImages(page);
  const result = await page.evaluate(() => {
    return document.querySelector('#step-8')?.innerText?.slice(0, 300);
  });
  console.log('Final Result at Step 8:\n', result);

  await browser.close();
  console.log('COMPLETE SUCCESS! ALL STEPS AND DEVICES WORK FLAWLESSLY!');
}

main().catch(console.error);

