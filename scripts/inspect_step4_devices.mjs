import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--window-size=430,932']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, deviceScaleFactor: 2 });

  console.log('Navigating to app.andoriasudan.com/app/...');
  await page.goto('https://app.andoriasudan.com/app/', { waitUntil: 'networkidle2' });

  // Let's see what JavaScript functions exist for navigating steps
  const navFns = await page.evaluate(() => {
    return {
      goToStep: typeof window.goToStep,
      showStep: typeof window.showStep,
      nextStep: typeof window.nextStep,
      devices: typeof window.devices,
      categories: typeof window.categories
    };
  });
  console.log('Nav fns:', navFns);

  // Let's inspect step-4 DOM directly
  const step4Info = await page.evaluate(() => {
    const s4 = document.getElementById('step-4');
    if (!s4) return 'no #step-4';
    const imgs = Array.from(s4.querySelectorAll('img')).map(i => ({
      src: i.src,
      loading: i.loading,
      complete: i.complete,
      naturalWidth: i.naturalWidth,
      alt: i.alt
    }));
    const cats = Array.from(s4.querySelectorAll('.category-card, .tab, button, .device-cat')).map(el => el.innerText.trim());
    return { imgsCount: imgs.length, imgs: imgs.slice(0, 10), cats: cats.slice(0, 15) };
  });
  console.log('Step 4 info:', JSON.stringify(step4Info, null, 2));

  // Let's activate step-4 to see how devices are shown
  await page.evaluate(() => {
    if (typeof window.goToStep === 'function') {
      window.goToStep(4); // or step 3 or whatever index
    } else {
      // Click start
      const start = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ابدأ'));
      if (start) start.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const currentStep = await page.evaluate(() => {
    const active = document.querySelector('.step.active');
    return active ? { id: active.id, text: active.innerText.slice(0, 150) } : 'none';
  });
  console.log('Active step after nav:', currentStep);

  await browser.close();
}

main().catch(console.error);
