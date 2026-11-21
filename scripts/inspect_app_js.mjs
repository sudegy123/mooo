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

  // Inspect scripts
  const scriptsInfo = await page.evaluate(() => {
    // Look at goToStep source code
    const goToStepSrc = window.goToStep ? window.goToStep.toString() : 'none';
    
    // Look at all global variables
    const globals = Object.keys(window).filter(k => /device|appliance|cat|item|data|state/i.test(k));
    
    // Check if there is an app.js or similar
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src || s.innerText.slice(0, 100));

    return { goToStepSrc, globals, scripts };
  });

  console.log('Scripts Info:', JSON.stringify(scriptsInfo, null, 2));

  await browser.close();
}

main().catch(console.error);
