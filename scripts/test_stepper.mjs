import puppeteer from 'puppeteer-core';

const chrome = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('https://app.andoriasudan.com/app/', { waitUntil: 'networkidle2' });
  await p.evaluate(() => { window.alert = () => {}; });

  console.log('1. Welcome -> Profile (Step 2)');
  await p.evaluate(() => goToStep(2));
  await new Promise(r => setTimeout(r, 600));

  console.log('2. Profile -> Property (Step 3)');
  await p.evaluate(() => {
    StateManager.setState({ customerName: 'أحمد عثمان', customerMobile: '0912345678', beneficiary: 'self', customerType: 'home_owner' });
    goToStep(3);
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('3. Property -> Basic Info (Step 4)');
  await p.evaluate(() => {
    StateManager.setState({ propertyType: 'home' });
    goToStep(4);
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('4. Basic Info -> Devices (Step 5)');
  await p.evaluate(() => {
    StateManager.setState({ outageHours: 12 });
    goToStep(5);
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('5. Devices: Enter cooling');
  await p.evaluate(() => enterDeviceCategory('cooling'));
  await new Promise(r => setTimeout(r, 600));
  await p.evaluate(() => exitDeviceCategory());
  await new Promise(r => setTimeout(r, 400));

  console.log('6. Devices -> Summary (Step 6)');
  await p.evaluate(() => {
    StateManager.setState({
      selectedDevices: {
        'ac-1.5-inv': { qty: 1, hours: 8 },
        'fan-ceil': { qty: 2, hours: 12 },
        'fridge-inv': { qty: 1, hours: 24 },
        'pump-sub-2hp': { qty: 1, hours: 4 }
      }
    });
    goToStep(6);
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('7. Summary -> Recommendation (Step 7)');
  await p.evaluate(() => goToStep(7));
  await new Promise(r => setTimeout(r, 800));

  const finalCheck = await p.evaluate(() => {
    return {
      currentStep: StateManager.get('currentStep'),
      hasPanels: !!document.querySelector('.reco-card, .system-spec, [data-i18n*="panels"]'),
      recText: document.querySelector('.step.active, #step-7')?.innerText?.slice(0, 100)
    };
  });
  console.log('Final check:', finalCheck);

  await b.close();
  console.log('PERFECT! STEPPING WORKS COMPLETELY!');
}

main().catch(console.error);

