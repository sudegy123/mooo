import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME_PATH = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

async function inspectSites() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log("Navigating to BEFORE site: https://khuludf.wixstudio.com/website-4?rc=test-site ...");
  try {
    await page.goto("https://khuludf.wixstudio.com/website-4?rc=test-site", { waitUntil: "networkidle2", timeout: 45000 });
  } catch (e) {
    console.log("Timeout waiting for networkidle2 on BEFORE site, continuing...");
  }
  await new Promise(r => setTimeout(r, 3000));
  const beforeTitle = await page.title();
  console.log("Before Title:", beforeTitle);
  const beforeText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log("Before Text:", beforeText);
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/kf_before_mobile.png", fullPage: false });

  console.log("Navigating to AFTER site: https://kfbeuty.com/ ...");
  try {
    await page.goto("https://kfbeuty.com/", { waitUntil: "networkidle2", timeout: 45000 });
  } catch (e) {
    console.log("Timeout waiting for networkidle2 on AFTER site, continuing...");
  }
  await new Promise(r => setTimeout(r, 3000));
  const afterTitle = await page.title();
  console.log("After Title:", afterTitle);
  const afterText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log("After Text:", afterText);
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/kf_after_mobile.png", fullPage: false });

  await browser.close();
}

inspectSites().catch(err => {
  console.error("Inspect error:", err);
  process.exit(1);
});

