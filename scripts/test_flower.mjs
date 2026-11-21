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

  // Click Arabic toggle
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText.trim() === 'العربية');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll down smoothly to trigger all lazy-loaded images
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 80));
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Check all images
  const arInfo = await page.evaluate(() => {
    const allImgs = Array.from(document.querySelectorAll('img'));
    return {
      title: document.title,
      h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()),
      h2: Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim()),
      brokenImages: allImgs.filter(img => img.naturalWidth === 0).map(img => img.src),
      loadedImagesCount: allImgs.filter(img => img.naturalWidth > 0).length,
      totalImages: allImgs.length,
      cartBtn: Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('سلة') || b.innerText.includes('Cart'))?.innerText.trim()
    };
  });
  console.log('ARABIC INFO & IMAGES:', JSON.stringify(arInfo, null, 2));

  // Also check if any images failed loading on network
  await page.screenshot({ path: 'G:\\sudegy-video-studio\\flower_ar_test.jpg' });
  await browser.close();
}

main().catch(console.error);
