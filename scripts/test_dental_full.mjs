import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto("https://sudegy.com/dental/diagnose", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Switch to Arabic
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("a, button, span"));
    const ar = els.find(e => e.innerText && e.innerText.trim() === "عربي");
    if (ar) ar.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click "ادخل إلى الداخل"
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("button, a.btn, a"));
    const btn = els.find(e => e.innerText && e.innerText.includes("ادخل إلى الداخل"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Select tooth 46
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const t46 = buttons.find(b => b.innerText.trim() === "46");
    if (t46) t46.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/step3_selected_46.png" });

  // Click "متابعة"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const cont = buttons.find(b => b.innerText.includes("متابعة"));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/step4_symptoms.png" });

  // Select symptoms: ألم نابض, يتألم مع البارد, منذ أيام
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const b1 = buttons.find(b => b.innerText.includes("ألم نابض"));
    if (b1) b1.click();
    const b2 = buttons.find(b => b.innerText.includes("يتألم مع البارد"));
    if (b2) b2.click();
    const b3 = buttons.find(b => b.innerText.includes("منذ أيام"));
    if (b3) b3.click();

    // Check night if exists
    const chk = document.querySelector("input[name=night]");
    if (chk) chk.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/step5_symptoms_selected.png" });

  // Click "اعرض الملخص"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const sumBtn = buttons.find(b => b.innerText.includes("اعرض الملخص"));
    if (sumBtn) sumBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "G:/sudegy-video-studio/assets/screens/step6_summary.png" });

  // Read summary text
  const summaryText = await page.evaluate(() => document.body.innerText);
  console.log("Summary text preview:", summaryText.slice(-1500));

  await browser.close();
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

