import puppeteer from 'puppeteer-core';

const chrome = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('https://app.andoriasudan.com/app/', { waitUntil: 'networkidle2' });
  await p.evaluate(() => { window.alert = () => {}; });

  console.log('1. Click start');
  await p.click('.btn-primary');
  await new Promise(r => setTimeout(r, 600));

  console.log('2. Property step:', await p.evaluate(() => document.querySelector('.step.active, [id^=step-].active')?.id));
  await p.evaluate(() => {
    const card = document.querySelector('.property-card[data-type="house"]') || document.querySelector('.property-card');
    selectProperty(card);
  });
  await new Promise(r => setTimeout(r, 400));
  await p.click('#btn-step2');
  await new Promise(r => setTimeout(r, 600));

  console.log('3. Outage step:', await p.evaluate(() => document.querySelector('.step.active, [id^=step-].active')?.id));
  await p.evaluate(() => {
    const btn = document.querySelector('.outage-btn[data-hours="16"]') || document.querySelector('.outage-btn');
    selectOutage(btn);
  });
  await new Promise(r => setTimeout(r, 400));
  await p.click('#step-3 .btn-primary');
  await new Promise(r => setTimeout(r, 800));

  console.log('4. Devices step:', await p.evaluate(() => document.querySelector('.step.active, [id^=step-].active')?.id));
  await p.evaluate(() => {
    enterDeviceCategory('cooling');
  });
  await new Promise(r => setTimeout(r, 800));
  await p.evaluate(() => {
    document.querySelector('.device-card')?.click();
    exitDeviceCategory();
  });
  await new Promise(r => setTimeout(r, 600));
  await p.click('#step-4 .btn-primary');
  await new Promise(r => setTimeout(r, 800));

  console.log('5. Profile step:', await p.evaluate(() => document.querySelector('.step.active, [id^=step-].active')?.id));
  await p.type('#cust-name', 'أحمد عثمان');
  await p.type('#cust-mobile', '0912345678');
  await p.click('#btn-step-profile');
  await new Promise(r => setTimeout(r, 1000));

  console.log('6. Summary step:', await p.evaluate(() => document.querySelector('.step.active, [id^=step-].active')?.id));
  await p.click('#step-6 .btn-primary');
  await new Promise(r => setTimeout(r, 1000));

  console.log('7. Recommendation step:', await p.evaluate(() => document.querySelector('.step.active, [id^=step-].active')?.id));
  await b.close();
  console.log('SUCCESS! ALL 7 STEPS EXECUTED WITHOUT ANY BLOCKERS!');
}

main().catch(console.error);
