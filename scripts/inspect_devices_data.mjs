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

  const devicesData = await page.evaluate(() => {
    // Check DeviceManager
    let categories = [];
    let devices = [];
    if (window.DeviceManager) {
      if (typeof window.DeviceManager.getCategories === 'function') categories = window.DeviceManager.getCategories();
      if (typeof window.DeviceManager.getAllDevices === 'function') devices = window.DeviceManager.getAllDevices();
    }
    return {
      categories: categories.map(c => ({ id: c.id, name: c.name, name_ar: c.name_ar, icon: c.icon, img: c.img })),
      devicesCount: devices.length,
      sampleDevices: devices.slice(0, 15).map(d => ({ id: d.id, name: d.name, name_ar: d.name_ar, cat: d.category, img: d.image || d.img }))
    };
  });

  console.log('Devices Data:', JSON.stringify(devicesData, null, 2));

  await browser.close();
}

main().catch(console.error);
