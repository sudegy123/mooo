const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const puppeteer = require('puppeteer-core');

function findChrome() {
  if (process.env.HF_CHROME && fs.existsSync(process.env.HF_CHROME)) return process.env.HF_CHROME;
  const base = path.join(os.homedir(), '.cache', 'hyperframes', 'chrome', 'chrome-headless-shell');
  if (fs.existsSync(base)) for (const v of fs.readdirSync(base).sort().reverse()) {
    const exe = path.join(base, v, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('Chrome not found');
}

const outDir = path.resolve('out/reviews');
const tempDir = path.resolve('temp_inspect/reviews');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

async function prepareCrops() {
  const f1 = 'C:/Users/Admin/.gemini/antigravity/brain/10c819b3-2696-4037-851f-7257110f5a74/.user_uploaded/media_1794598693691_747ef0a1.jpg';
  const f2 = 'C:/Users/Admin/.gemini/antigravity/brain/10c819b3-2696-4037-851f-7257110f5a74/.user_uploaded/media_1794598709056_5b76f137.jpg';
  const f3 = 'C:/Users/Admin/.gemini/antigravity/brain/10c819b3-2696-4037-851f-7257110f5a74/.user_uploaded/media_1794598709054_67aa3b5f.jpg';

  // 1. Dr. Mazin: Light mode desktop screenshot
  // Header: x: 0 to 688, y: 24 to 78 (removes top browser bar & all right-side chat list)
  await sharp(f1).extract({ left: 0, top: 24, width: 688, height: 54 }).png().toFile(path.join(tempDir, 'crop_mazin_header.png'));
  // Chat body: x: 0 to 688, y: 242 to 494 (contains seema_ai_integrated_v9.zip + 4 praise bubbles; taskbar & bottom input excluded)
  await sharp(f1).extract({ left: 0, top: 242, width: 688, height: 252 }).png().toFile(path.join(tempDir, 'crop_mazin_chat.png'));

  // 2. Andoria: Mobile screenshot
  // Header: x: 0 to 472, y: 40 to 95 (removes top phone status bar)
  await sharp(f2).extract({ left: 0, top: 40, width: 472, height: 55 }).png().toFile(path.join(tempDir, 'crop_andoria_header.png'));
  // Chat body: x: 0 to 472, y: 110 to 296 (contains exact 4-line praise bubble; buyer lead with personal phone & input bar excluded)
  await sharp(f2).extract({ left: 0, top: 110, width: 472, height: 186 }).png().toFile(path.join(tempDir, 'crop_andoria_chat.png'));

  // 3. KF Beauty: Mobile screenshot
  // Header: x: 0 to 472, y: 40 to 95 (removes top phone status bar)
  await sharp(f3).extract({ left: 0, top: 40, width: 472, height: 55 }).png().toFile(path.join(tempDir, 'crop_kf_header.png'));
  // Chat body: x: 0 to 472, y: 165 to 600 (contains kfbeuty.com link card + 4 praise bubbles; side questions & input bar excluded)
  await sharp(f3).extract({ left: 0, top: 165, width: 472, height: 435 }).png().toFile(path.join(tempDir, 'crop_kf_chat.png'));

  console.log('✓ High-precision crops generated successfully.');
}

function toBase64(filePath) {
  const p = path.resolve(filePath);
  const data = fs.readFileSync(p);
  const ext = path.extname(p).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data.toString('base64')}`;
}

const slides = [
  {
    id: 'slide_1_mazin',
    clientName: 'عيادة د. مازن عبد الوهاب',
    domain: 'drmazin.net',
    category: 'منظومة فحص سريري واستقبال مرضى مخصصة',
    screenFile: 'assets/screens/mazin_face_screen.png',
    themeColor: '#0f6b57',
    badgeText: '✓ تم تقليل الأسئلة المتكررة وتنظيم مواعيد العيادة بالكامل',
    headerFile: 'temp_inspect/reviews/crop_mazin_header.png',
    chatFile: 'temp_inspect/reviews/crop_mazin_chat.png',
    senderName: 'د. مازن عبد الوهاب',
    senderRole: 'استشاري ورئيس العيادة',
    praiseQuote: '«الموقع فخم وخرافي وشغل متعوب عليه.. قلل الأسئلة وخلا الشغل منظم جداً»',
    chatHeight: '360px',
    mockupHeight: '440px'
  },
  {
    id: 'slide_2_andoria',
    clientName: 'شركة أندوريا للطاقة الشمسية',
    domain: 'andoriasudan.com',
    category: 'حاسبة أحمال شمسية ومنظومة عروض أسعار فورية',
    screenFile: 'assets/screens/andoria_final.png',
    themeColor: '#0284c7',
    badgeText: '✓ زيادة واضحة في الطلب والمبيعات وسهولة الاستخدام',
    headerFile: 'temp_inspect/reviews/crop_andoria_header.png',
    chatFile: 'temp_inspect/reviews/crop_andoria_chat.png',
    senderName: 'عمران لطفي',
    senderRole: 'المدير التنفيذي لشركة أندوريا',
    praiseQuote: '«الابلكيشن عملي جداً وزاد الطلب والمبيعات في شركتي بسبب سهولة استخدامه»',
    chatHeight: '340px',
    mockupHeight: '460px'
  },
  {
    id: 'slide_3_kfbeauty',
    clientName: 'متجر خلود فاروق (KF Beauty)',
    domain: 'kfbeuty.com',
    category: 'متجر تجارة إلكترونية متكامل لمستحضرات التجميل',
    screenFile: 'assets/screens/kf_after_mobile.png',
    themeColor: '#db2777',
    badgeText: '✓ تجربة شراء مباشرة بدون وسطاء مع إشادة وتفاعل استثنائي',
    headerFile: 'temp_inspect/reviews/crop_kf_header.png',
    chatFile: 'temp_inspect/reviews/crop_kf_chat.png',
    senderName: 'خلود فاروق',
    senderRole: 'مؤسسة ومصممة براند KF Beauty',
    praiseQuote: '«يا سلام والله.. ده إنجاز عالمي.. ما عارفة أقول ليك شنو لكن شكراً بجد»',
    chatHeight: '440px',
    mockupHeight: '380px'
  }
];

function buildLightHTML(slide) {
  const screenB64 = toBase64(slide.screenFile);
  const headerB64 = toBase64(slide.headerFile);
  const chatB64 = toBase64(slide.chatFile);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  /* STRICT RULE: Zero dark colors - pure light, luminous, daylight aesthetic */
  body {
    width: 1080px;
    height: 1920px;
    background: #f8fafc;
    color: #0f172a;
    font-family: 'Cairo', sans-serif;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 50px 50px 50px;
  }
  
  /* Luminous daylight gradient background */
  .bg-decor {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 15%, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%);
    z-index: 1;
  }
  .bg-glow {
    position: absolute;
    width: 900px;
    height: 900px;
    border-radius: 50%;
    background: radial-gradient(circle, ${slide.themeColor}18 0%, transparent 70%);
    top: 300px;
    left: 90px;
    filter: blur(60px);
    pointer-events: none;
    z-index: 2;
  }
  
  /* Header section */
  .header {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  .tag-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 32px;
    background: #ffffff;
    border: 2.5px solid ${slide.themeColor};
    border-radius: 40px;
    font-size: 24px;
    font-weight: 800;
    color: ${slide.themeColor};
    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  }
  .client-title {
    font-size: 52px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.15;
    letter-spacing: -0.5px;
  }
  .meta-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .domain-pill {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    background: ${slide.themeColor};
    padding: 6px 20px;
    border-radius: 20px;
    direction: ltr;
    display: inline-block;
    box-shadow: 0 4px 12px ${slide.themeColor}33;
  }
  .category-desc {
    font-size: 22px;
    font-weight: 700;
    color: #475569;
  }
  
  /* Main Content Stage */
  .stage {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    flex: 1;
    margin-top: 24px;
  }
  
  /* 1. Live system mockup */
  .mockup-container {
    width: 880px;
    height: ${slide.mockupHeight};
    background: #ffffff;
    border-radius: 32px;
    border: 3px solid #cbd5e1;
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .mockup-header-bar {
    height: 48px;
    background: #f1f5f9;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    padding: 0 20px;
    justify-content: space-between;
  }
  .browser-dots {
    display: flex;
    gap: 8px;
  }
  .browser-dots span {
    width: 14px;
    height: 14px;
    border-radius: 50%;
  }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .mockup-title {
    font-size: 19px;
    font-weight: 800;
    color: #334155;
    direction: ltr;
  }
  .live-badge {
    font-size: 16px;
    font-weight: 800;
    color: #059669;
    background: #dcfce7;
    padding: 3px 12px;
    border-radius: 12px;
  }
  .mockup-body {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .mockup-body img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }
  
  /* 2. Genuine WhatsApp Chat Card (The Hero) */
  .wa-card {
    width: 880px;
    background: #ffffff;
    border: 3.5px solid #25d366;
    border-radius: 32px;
    box-shadow: 0 25px 60px rgba(37, 211, 102, 0.15), 0 10px 25px rgba(0,0,0,0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .wa-top-bar {
    background: #005c4b;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #ffffff;
  }
  .wa-top-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .wa-icon {
    font-size: 26px;
  }
  .wa-title-text {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .wa-verified {
    background: #25d366;
    color: #004d40;
    font-size: 16px;
    font-weight: 900;
    padding: 4px 14px;
    border-radius: 16px;
  }
  
  /* Actual WhatsApp screenshot container */
  .wa-chat-frame {
    display: flex;
    flex-direction: column;
    background: #efeae2;
    padding: 0;
    border-top: 2px solid #e2e8f0;
  }
  .wa-header-slice {
    width: 100%;
    border-bottom: 1.5px solid rgba(0,0,0,0.08);
  }
  .wa-header-slice img {
    width: 100%;
    display: block;
  }
  .wa-body-slice {
    width: 100%;
    overflow: hidden;
    background: #efeae2;
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }
  .wa-body-slice img {
    width: 100%;
    max-height: ${slide.chatHeight};
    object-fit: contain;
    display: block;
  }
  
  /* 3. Highlight Quote Callout */
  .quote-box {
    width: 880px;
    background: #ffffff;
    border-right: 8px solid ${slide.themeColor};
    border-top: 2px solid #e2e8f0;
    border-bottom: 2px solid #e2e8f0;
    border-left: 2px solid #e2e8f0;
    border-radius: 20px;
    padding: 20px 28px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .quote-text {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.35;
  }
  .quote-author {
    font-size: 20px;
    font-weight: 700;
    color: #64748b;
  }
  
  /* Footer section */
  .footer {
    position: relative;
    z-index: 10;
    border-top: 2.5px solid #e2e8f0;
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    padding: 18px 30px;
    border-radius: 24px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  }
  .footer-brand {
    font-size: 34px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: 1px;
  }
  .footer-brand span {
    color: #059669;
  }
  .footer-subtitle {
    font-size: 20px;
    font-weight: 700;
    color: #64748b;
  }
  .footer-url {
    font-size: 26px;
    font-weight: 800;
    color: #0284c7;
    direction: ltr;
  }
</style>
</head>
<body>
  <div class="bg-decor"></div>
  <div class="bg-glow"></div>
  
  <!-- Header -->
  <div class="header">
    <div class="tag-badge">⭐ تجارب حقيقية من عملاء سوديجي</div>
    <h1 class="client-title">${slide.clientName}</h1>
    <div class="meta-row">
      <div class="domain-pill">🔗 ${slide.domain}</div>
      <div class="category-desc">${slide.category}</div>
    </div>
  </div>
  
  <!-- Stage -->
  <div class="stage">
    <!-- 1. Live System Mockup -->
    <div class="mockup-container">
      <div class="mockup-header-bar">
        <div class="browser-dots">
          <span class="dot-red"></span>
          <span class="dot-yellow"></span>
          <span class="dot-green"></span>
        </div>
        <div class="mockup-title">https://${slide.domain}</div>
        <div class="live-badge">● نظام حي شغال</div>
      </div>
      <div class="mockup-body">
        <img src="${screenB64}" alt="${slide.clientName}">
      </div>
    </div>
    
    <!-- 2. WhatsApp Authentic Chat (The Hero) -->
    <div class="wa-card">
      <div class="wa-top-bar">
        <div class="wa-top-left">
          <span class="wa-icon">💬</span>
          <span class="wa-title-text">محادثة واتساب حقيقية موثقة</span>
        </div>
        <div class="wa-verified">✓ تقييم معتمد</div>
      </div>
      <div class="wa-chat-frame">
        <div class="wa-header-slice">
          <img src="${headerB64}" alt="WhatsApp Header">
        </div>
        <div class="wa-body-slice">
          <img src="${chatB64}" alt="WhatsApp Chat Body">
        </div>
      </div>
    </div>
    
    <!-- 3. Highlight Quote Callout -->
    <div class="quote-box">
      <div class="quote-text">${slide.praiseQuote}</div>
      <div class="quote-author">✓ ${slide.senderName} — ${slide.senderRole}</div>
    </div>
  </div>
  
  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">SUDEGY <span>| سوديجي</span></div>
    <div class="footer-subtitle">أنظمة مخصصة ترفع المبيعات وتنظم العمل</div>
    <div class="footer-url">sudegy.com</div>
  </div>
</body>
</html>`;
}

async function renderAll() {
  await prepareCrops();

  const chromePath = findChrome();
  console.log('Launching Chrome:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  for (const slide of slides) {
    console.log(`Rendering 9:16 Light Slide: ${slide.id}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    const html = buildLightHTML(slide);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const outPath = path.join(outDir, `${slide.id}_9x16.jpg`);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 95 });
    console.log(`✓ Saved ${outPath}`);
    await page.close();
  }

  await browser.close();
  console.log('All 3 light 9:16 review slides rendered successfully!');
}

renderAll().catch((err) => {
  console.error('Error rendering review slides:', err);
  process.exit(1);
});
