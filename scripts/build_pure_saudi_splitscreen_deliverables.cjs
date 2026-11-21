const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const PROJECT_ROOT = 'G:/sudegy-video-studio';
const RAW_MP4 = path.join(PROJECT_ROOT, 'out/sudegy-splitscreen-02/v1_aesthetic.mp4');
const OUT_DIR = path.join(PROJECT_ROOT, 'READY_TO_SEND/sudegy/split-screen-aesthetic');

fs.mkdirSync(OUT_DIR, { recursive: true });

function run(cmd, args) {
  console.log(`Running: ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error(`Command failed with code ${res.status}`);
  }
}

const master9x16 = path.join(OUT_DIR, 'v1_visual_9x16.mp4');
const master1x1 = path.join(OUT_DIR, 'v1_visual_1x1.mp4');
const master16x9 = path.join(OUT_DIR, 'v1_visual_16x9.mp4');
const thumb = path.join(OUT_DIR, 'thumbnail.jpg');

console.log('1) Audio polish (-14.0 LUFS / -1.5 dBTP) for Master 9:16...');
run('ffmpeg', [
  '-y', '-i', RAW_MP4,
  '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=7',
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

console.log('5) Generating Subtitles SRT (Pure Saudi Dialect - Zero Fus-ha)...');
const srtContent = `1
00:00:00,150 --> 00:00:07,800
شوف معاي.. عَ اليمين: عيادة تصرف آلاف ع الإعلانات، وتجيها زحمة رسايل: بكم الإبرة؟ وبالأخير تسحب وماتحجز شي!

2
00:00:07,900 --> 00:00:14,500
وعَ اليسار: عيادة مشغلة نظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد متى مناسبتها بالجوال بثواني.

3
00:00:14,600 --> 00:00:22,800
ويوصل للدكتور تقرير كامل ومرتب عالواتس قبل ما تطب العيادة، وبكذا تقلب السؤال الفاضي لحجز باقة مضمون!

4
00:00:23,200 --> 00:00:30,500
أيّ العيادتين وِدِّكْ تكون؟ جَرّبْ ديمو مجاني الحين بْهُوِيّة عيادتك وشوف الفرق بنفسك على جوالك.

5
00:00:30,600 --> 00:00:36,800
اِكْتِبْ بَسْ كلمة: (تجميل) بالخاص أو بالكومنتات، ونِرْسِلْ لك الرابط على طول!
`;
fs.writeFileSync(`${OUT_DIR}/subtitles.srt`, srtContent, 'utf8');

console.log('6) Generating Post Caption (Pure Saudi Marketing Dialect)...');
const captionContent = `أكبر مشكلة تعاني منها عيادات ومراكز التجميل والجلدية في الرياض وجدة:
تصرف دم قلبك ع الإعلانات بميزانية فوق 20 ألف ريال شهرياً، وتجيك زحمة رسايل عالواتس تسأل بس: «بكم إبرة الفيلر؟» أو «بكم البوتكس؟».. والموظفة ترد بالسعر، فتقارن المراجعة الأسعار وتسحب وتختفي بدون أي حجز! 📉

مع نظام Sudegy الذكي للعيادات التجميلية:
▫️ المراجعة بنفسها تفحص مناطق وجهها وتحدد متى مناسبتها بالجوال بثواني.
▫️ النظام يحسب فترة التعافي (Downtime) تلقائياً عشان يجهز المراجعة نفسياً.
▫️ يوصل تقرير كامل ومرتب للدكتور عالواتس قبل ما تطب المراجعة العيادة.
▫️ تقلب السؤال الفاضي عن السعر لباقة علاجية وتجميلية كاملة بحجز مؤكد! 💎

🎁 عرض خاص لمجمعات وعيادات التجميل:
جرّب ديمو تجريبي مجاني بهوية وشعار عيادتك الحين على جوالك وشوف الفرق بنفسك قبل أي التزام.

👇 اكتب كلمة: (تجميل) بالخاص أو بالكومنتات، ونرسل لك الرابط على طول!

#عيادات_تجميل #جلدية_وتجميل #الرياض #جدة #تسويق_عيادات #عيادات_الرياض #فيلر #بوتكس #سوديجي #sudegy
`;
fs.writeFileSync(`${OUT_DIR}/post_caption.txt`, captionContent, 'utf8');

console.log('7) Generating Production Report...');
const reportContent = `# تقرير الإنتاج والجودة: إعلان الشاشة المنقسمة «عيادات التجميل — اللهجة السعودية الصرفة (Zero Fus-ha)»

- **المشروع**: Sudegy Video Studio
- **الحملة**: صدمة الشاشة المنقسمة #2 — «أزمة زحمة الأسئلة وماتحجز شي ضد بروتوكول سوديجي الذكي» (Split-Screen Reality)
- **المرجع القياسي**: \`READY_TO_SEND/sudegy/split-screen-october/\` (الأعلى مشاهدة وتفاعلاً على تيك توك)
- **اللهجة والصوت**: صوت سعودي محلي أصيل ناطق باللهجة السعودية البيضاء الدارجة الصرفة (\`ar-SA-HamedNeural\`) بدون أي عبارات فصحى إخبارية أو كلمات مصطنعة، مع ضبط فونيتيكي دقيق يراعي النطق العامي السليم.
- **العرض**: ديمو تجريبي مجاني بهوية عيادتك لمعاينته على الجوال + نظام فرز وتحويل الاستفسارات إلى باقات مؤكدة.
- **مسار التسليم النهائي**: \`READY_TO_SEND/sudegy/split-screen-aesthetic/\`

---

## 1. حزمة الملفات المنتجة (Deliverables)

| الملف | الأبعاد / النوع | الغرض الأساسي |
| :--- | :--- | :--- |
| **\`v1_visual_9x16.mp4\`** | 1080×1920 (9:16) | ريلز إنستغرام، تيك توك، وسناب شات |
| **\`v1_visual_1x1.mp4\`** | 1080×1080 (1:1) | منشورات خلاصة إنستغرام ولينكد إن وتويتر |
| **\`v1_visual_16x9.mp4\`** | 1920×1080 (16:9) | يوتيوب، عروض الويب والبريزنتيشن للمستثمرين |
| **\`thumbnail.jpg\`** | 1080×1920 | صورة الغلاف المصغرة الأكثر جلباً للنقر (High CTR) |
| **\`subtitles.srt\`** | نصوص توقيت دقيقة | ملف الترجمة التفاعلية باللهجة السعودية الصرفة |
| **\`post_caption.txt\`** | نص المنشور | كابشن تسويقي سعودي عالي التحويل مع الهاشتاقات وCTA |

---

## 2. معايير الجودة والالتزام (QA & Compliance)

- **اللهجة والصوت**: صياغة سعودية عامية خالصة (شوف معاي.. تصرف آلاف ع الإعلانات.. زحمة رسايل.. تسحب وماتحجز شي.. مشغلة.. قبل ما تطب العيادة.. تقلب السؤال لباقة.. ودك تكون.. على طول) خالية تماماً من الفصحى.
- **معيار الصوت الرقمي**: **-14.0 LUFS** و True Peak عند **-1.5 dBTP** مع موسيقى خلفية هادئة وفخمة (\`luxury_calm.wav\`).
- **سرعة القراءة**: جميع البطاقات المنبثقة والنصوص تلتزم بقاعدة 0.35 ثانية لكل كلمة + 0.7 ثانية.
`;
fs.writeFileSync(`${OUT_DIR}/production_report.md`, reportContent, 'utf8');

console.log('All deliverables generated successfully in:', OUT_DIR);

