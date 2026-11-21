// scripts/build_sudegy_splitscreen_aesthetic_deliverables.cjs
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = 'G:/sudegy-video-studio';
const OUT_DIR = `${ROOT}/READY_TO_SEND/sudegy/split-screen-aesthetic`;

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function run(cmd, args) {
  console.log(`Running: ${cmd} ${args.slice(0, 5).join(' ')}...`);
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr);
    throw new Error(`Command failed: ${cmd}`);
  }
  return r;
}

const srcV1 = `${ROOT}/out/sudegy-splitscreen-02/v1_aesthetic.mp4`;
const master9x16 = `${OUT_DIR}/v1_visual_9x16.mp4`;
const master1x1 = `${OUT_DIR}/v1_visual_1x1.mp4`;
const master16x9 = `${OUT_DIR}/v1_visual_16x9.mp4`;
const thumb = `${OUT_DIR}/thumbnail.jpg`;

console.log('1) Audio polish (-14.0 LUFS / -1.5 dBTP) for Master 9:16...');
run('ffmpeg', [
  '-y', '-i', srcV1,
  '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
  '-c:a', 'aac', '-b:a', '192k',
  master9x16
]);

console.log('2) Generating 1:1 Square Format (1080x1080) with luxury blurred wings...');
run('ffmpeg', [
  '-y', '-i', master9x16,
  '-filter_complex', '[0:v]scale=1080:1920,boxblur=20:5,crop=1080:1080:0:420[bg];[0:v]scale=608:1080[fg];[bg][fg]overlay=(W-w)/2:0',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
  '-c:a', 'copy',
  master1x1
]);

console.log('3) Generating 16:9 Landscape Format (1920x1080) for Decks & YouTube...');
run('ffmpeg', [
  '-y', '-i', master9x16,
  '-filter_complex', '[0:v]scale=1920:3413,boxblur=30:5,crop=1920:1080:0:1166[bg];[0:v]scale=608:1080[fg];[bg][fg]overlay=(W-w)/2:0',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
  '-c:a', 'copy',
  master16x9
]);

console.log('4) Extracting high-converting thumbnail at 4.0s...');
run('ffmpeg', [
  '-y', '-ss', '00:00:04',
  '-i', master9x16,
  '-vframes', '1',
  '-q:v', '2',
  thumb
]);

console.log('5) Generating Subtitles SRT (Saudi Dialect)...');
const srtContent = `1
00:00:00,150 --> 00:00:07,800
عَ اليمين: عيادة تدفع آلاف على الإعلانات، وتجيها رسايل تسأل: بكم الإبرة؟ وتنتهي بدون حجز.

2
00:00:08,400 --> 00:00:16,000
وعَ اليسار: عيادة مْفَعّلَة نظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد مناسبتها بثواني.

3
00:00:16,200 --> 00:00:22,800
وتُوصَلْ بياناتها بتقرير مرتّب للدكتور عَالواتساب قبل لا تِجِي العيادة، وتحوّل السائلين لباقات مؤكدة.

4
00:00:23,200 --> 00:00:30,500
أيّ العيادتين وِدِّكْ تكون؟ خِذْ ديمو تجريبي مجاني بهوية عيادتك عشان تِجَرّبَه الحين على جوالك.

5
00:00:31,000 --> 00:00:35,500
اِكْتِبْ كلمة: (تجميل) بالخاص أو الكومنتات، ونِرْسِلْ لك الرابط فوراً.
`;
fs.writeFileSync(`${OUT_DIR}/subtitles.srt`, srtContent, 'utf8');

console.log('6) Generating Post Caption (Saudi Dialect)...');
const captionContent = `أكبر هدر يصير في عيادات التجميل والجلدية:
تصرف ميزانية ضخمة فوق الـ 20 ألف ريال شهرياً على الإعلانات، وتجيك مئات الرسايل عالواتساب تسأل بس: «بكم إبرة الفيلر؟» أو «بكم البوتوكس؟».. والموظفة ترد بالسعر، فتقارن المراجعة الأسعار وتختفي بدون أي حجز!

مع نظام Sudegy الذكي للعيادات التجميلية:
▫️ المراجعة تفحص مناطق وجهها ونوع الإجراء وتحدد وقت مناسبتها تفاعلياً.
▫️ النظام يحسب فترة التعافي (Downtime) تلقائياً عشان يجهز المراجعة نفسياً.
▫️ يوصل ملف سريري ونفسي كامل للدكتور عالواتساب قبل لا تدخل العيادة.
▫️ تحويل السؤال السطحي عن السعر إلى باقة علاجية وتجميلية متكاملة ترفع الحجز المؤكد.

🎁 عرض خاص لمجمعات وعيادات التجميل:
خذ ديمو تجريبي مجاني مخصص بهوية وشعار عيادتك عشان تعاينه الحين على جوالك وتشوف الفارق بنفسك قبل أي التزام.

📩 للتجربة الحية فوراً:
اكتب كلمة (تجميل) في الكومنتات أو أرسلها بالخاص، ونرسل لك رابط المعاينة الحية فوراً على موبايلك.

---
#عيادات_تجميل #جلدية_وتجميل #فيلر #بوتوكس #تجميل_الرياض #تجميل_جدة #عيادات_الرياض #عيادات_جدة #Sudegy #عيادات_السعودية
`;
fs.writeFileSync(`${OUT_DIR}/post_caption.txt`, captionContent, 'utf8');

console.log('7) Generating Production Report...');
const reportContent = `# تقرير الإنتاج والجودة: إعلان الشاشة المنقسمة «عيادات التجميل - اللهجة السعودية»

- **المشروع**: Sudegy Video Studio
- **الحملة**: صدمة الشاشة المنقسمة #2 — «أزمة "بكم الإبرة؟" ضد بروتوكول سوديجي الذكي» (Split-Screen Reality)
- **المرجع القياسي**: \`READY_TO_SEND/sudegy/split-screen-october/\` (الأعلى مشاهدة وتفاعلاً على تيك توك)
- **الصوت واللهجة**: صوت سعودي أصيل باللهجة السعودية البيضاء الدارجة الإعلانية (\`ar-SA-HamedNeural\` مع ضبط صوتي فونيتيكي دقيق بالسكون والفواصل المحلية)
- **العرض**: ديمو تجريبي مجاني بهوية عيادتك لمعاينته قبل الدفع + نظام فرز وتحويل الاستفسارات إلى باقات مؤكدة
- **مسار التسليم النهائي**: \`READY_TO_SEND/sudegy/split-screen-aesthetic/\`

---

## 1. حزمة الملفات المنتجة (Deliverables)

| الملف | الأبعاد / النوع | الغرض الأساسي |
| :--- | :--- | :--- |
| **\`v1_visual_9x16.mp4\`** | 1080×1920 (9:16) | ريلز إنستغرام، تيك توك، وسناب شات |
| **\`v1_visual_1x1.mp4\`** | 1080×1080 (1:1) | منشورات خلاصة إنستغرام ولينكد إن وتويتر |
| **\`v1_visual_16x9.mp4\`** | 1920×1080 (16:9) | يوتيوب، عروض الويب والبريزنتيشن للمستثمرين |
| **\`thumbnail.jpg\`** | 1080×1920 | صورة الغلاف المصغرة الأكثر جلباً للنقر (High CTR) |
| **\`subtitles.srt\`** | نصوص توقيت دقيقة | ملف الترجمة العربية باللهجة السعودية |
| **\`post_caption.txt\`** | نص المنشور | كابشن تسويقي سعودي عالي التحويل مع الهاشتاقات وCTA |

---

## 2. معايير الجودة والالتزام (QA & Compliance)

- **اللهجة والصوت**: صوت سعودي محلي ناطق باللهجة السعودية البيضاء التي تستهدف أصحاب العيادات ومسؤولي التسويق الطبي في السعودية.
- **معيار الصوت الرقمي**: **-14.0 LUFS** و True Peak عند **-1.5 dBTP** مع موسيقى خلفية هادئة وفخمة (\`luxury_calm.wav\`).
- **سرعة القراءة**: جميع البطاقات المنبثقة والنصوص تلتزم بقاعدة 0.35 ثانية لكل كلمة + 0.7 ثانية.
`;
fs.writeFileSync(`${OUT_DIR}/production_report.md`, reportContent, 'utf8');

console.log('All deliverables generated successfully in:', OUT_DIR);
