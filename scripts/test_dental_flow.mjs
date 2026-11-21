import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME_PATH = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  console.log("Navigating to https://sudegy.com/dental/diagnose...");
  await page.goto("https://sudegy.com/dental/diagnose", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Switch to Arabic if button exists
  const switched = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("a, button, span"));
    const ar = els.find(e => e.innerText && e.innerText.trim() === "عربي");
    if (ar) {
      ar.click();
      return true;
    }
    return false;
  });
  console.log("Switched to Arabic:", switched);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/step1_ar.png" });

  // 2. Click Step inside / ادخل
  const clickedStep = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("button, a.btn, a"));
    const btn = els.find(e => e.innerText && (e.innerText.includes("Step inside") || e.innerText.includes("ادخل") || e.innerText.includes("ابدأ") || e.innerText.includes("فحص")));
    if (btn) {
      btn.click();
      return btn.innerText;
    }
    return null;
  });
  console.log("Clicked step inside:", clickedStep);
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/step2_inside.png" });

  // Read what is available in the DOM
  const domInfo = await page.evaluate(() => {
    return {
      title: document.title,
      text: document.body.innerText.slice(0, 1500),
      buttons: Array.from(document.querySelectorAll("button, a")).map(e => e.innerText.trim()).filter(Boolean)
    };
  });
  console.log("DOM Info:", JSON.stringify(domInfo, null, 2));

  await browser.close();
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
