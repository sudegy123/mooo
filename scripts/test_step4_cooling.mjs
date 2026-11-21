import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--window-size=430,932']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, deviceScaleFactor: 2 });

  await page.goto('https://app.andoriasudan.com/app/', { waitUntil: 'networkidle2' });

  // Navigate to step 4
  await page.evaluate(() => {
    StateManager.setState({
      propertyType: 'home',
      outageHours: 12
    });
    Router.goTo(4, 1, (s) => onStepEnter(s));
  });
  await new Promise(r => setTimeout(r, 1200));

  const catCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#device-category-grid .device-category-card, .device-cat-card')).map(el => el.innerText.trim());
  });
  console.log('Categories rendered:', catCards);

  // Enter cooling
  console.log('Entering cooling category...');
  await page.evaluate(() => {
    enterDeviceCategory('cooling');
  });
  await new Promise(r => setTimeout(r, 2000));

  // Check device cards and images
  const devCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.device-card')).map(c => {
      const img = c.querySelector('img');
      return {
        name: c.querySelector('.device-name')?.innerText,
        watts: c.querySelector('.device-watts')?.innerText,
        imgSrc: img?.src,
        imgComplete: img?.complete,
        imgNaturalWidth: img?.naturalWidth
      };
    });
  });
  console.log('Device cards in cooling:', devCards);

  await browser.close();
}

main().catch(console.error);

