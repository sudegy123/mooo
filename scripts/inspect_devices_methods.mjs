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

  const info = await page.evaluate(() => {
    const dm = window.DeviceManager;
    const methods = Object.keys(dm);
    // Let's inspect getDevicesByCategory
    const coolingDevices = dm.getDevicesByCategory ? dm.getDevicesByCategory('cooling') : [];
    const agriDevices = dm.getDevicesByCategory ? dm.getDevicesByCategory('agriculture') : [];
    const workshopDevices = dm.getDevicesByCategory ? dm.getDevicesByCategory('workshop') : [];
    const medicalDevices = dm.getDevicesByCategory ? dm.getDevicesByCategory('medical') : [];
    const pumpDevices = dm.getDevicesByCategory ? dm.getDevicesByCategory('pumps') : [];

    return {
      methods,
      coolingDevices: coolingDevices.slice(0, 5),
      agriDevices,
      workshopDevices,
      medicalDevices,
      pumpDevices
    };
  });

  console.log('DeviceManager Info:', JSON.stringify(info, null, 2));

  await browser.close();
}

main().catch(console.error);
