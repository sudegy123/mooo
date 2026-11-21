import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME_PATH = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true });
  console.log("Navigating to https://sudegy.com/dental/diagnose...");
  await page.goto("https://sudegy.com/dental/diagnose", { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  
  const title = await page.title();
  console.log("Title:", title);
  
  const content = await page.evaluate(() => {
    return {
      url: window.location.href,
      headings: Array.from(document.querySelectorAll("h1, h2, h3, h4")).map(e => e.innerText.trim()).filter(Boolean),
      buttons: Array.from(document.querySelectorAll("button, a, input[type=submit]")).map(e => (e.innerText || e.value || "").trim()).filter(Boolean).slice(0, 30),
      forms: Array.from(document.querySelectorAll("form, input, select, textarea")).map(e => ({ tag: e.tagName, name: e.name || e.id, placeholder: e.placeholder, type: e.type })),
      textPreview: document.body.innerText.slice(0, 1500)
    };
  });
  console.log("Content:", JSON.stringify(content, null, 2));
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/dental_diagnose_preview.png", fullPage: true });
  console.log("Saved preview screenshot.");
  await browser.close();
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
