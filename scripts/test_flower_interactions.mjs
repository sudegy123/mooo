import puppeteer from 'puppeteer-core';

const chrome = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('https://flowerstore-4xu.pages.dev/', { waitUntil: 'networkidle2', timeout: 45000 });

  // Switch to Arabic
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.trim() === 'العربية');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Preload all images by scrolling
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click a filter e.g. "ورود" or "Roses"
  const filterClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const f = btns.find(b => b.innerText.includes('ورود') || b.innerText.includes('Roses') || b.innerText.includes('هادئة'));
    if (f) { f.click(); return f.innerText.trim(); }
    return null;
  });
  console.log('Filter clicked:', filterClicked);
  await new Promise(r => setTimeout(r, 1000));

  // Click "Add to cart" on first product
  const addClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const add = btns.find(b => b.innerText.includes('أضف') || b.innerText.includes('Add'));
    if (add) { add.click(); return add.innerText.trim(); }
    return null;
  });
  console.log('Add to cart clicked:', addClicked);
  await new Promise(r => setTimeout(r, 1500));

  // Check cart button
  const cartInfo = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cart = btns.find(b => b.innerText.includes('السلة') || b.innerText.includes('Cart'));
    if (cart) {
      cart.click();
      return cart.innerText.trim();
    }
    return null;
  });
  console.log('Cart opened:', cartInfo);
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'G:\\sudegy-video-studio\\flower_cart_test.jpg' });
  await browser.close();
}

main().catch(console.error);
