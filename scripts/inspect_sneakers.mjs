import puppeteer from 'puppeteer-core';

const chromeAlt = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromeAlt,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  
  await page.goto('https://sudegy.com/sneakers/shop/all.html?p=nike-air-force-1', { waitUntil: 'networkidle2' });
  
  // Select size 42
  await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll('.size')).find(el => el.innerText.trim() === '42');
    if (s) s.click();
  });
  await new Promise(r => setTimeout(r, 500));
  
  // Click add
  await page.evaluate(() => {
    const btn = document.querySelector('#p-add');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Also click cart open
  await page.evaluate(() => {
    const co = document.querySelector('#cart-open');
    if (co) co.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const visibleTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, aside, section')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && el.innerText.includes('WhatsApp');
    }).map(el => el.innerText.slice(0, 300));
  });
  console.log('Visible cart texts:', visibleTexts);

  await browser.close();
})();
