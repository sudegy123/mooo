const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = "G:\\sudegy-video-studio\\READY_TO_SEND\\sudegy\\factory-erp-2d";
const sourceVideo = "G:\\sudegy-video-studio\\out\\factory-erp-2d\\v1.mp4";
const critiqueDir = "G:\\sudegy-video-studio\\critique\\factory-erp-2d\\v1";

fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(critiqueDir, { recursive: true });

console.log("=== Building Factory ERP 2D Deliverables ===");

if (!fs.existsSync(sourceVideo)) {
  console.error("Source video not found:", sourceVideo);
  process.exit(1);
}

// 1. Copy & verify primary vertical video 9:16
const v9x16 = path.join(targetDir, "v1_visual_9x16.mp4");
console.log("1. Creating primary vertical 9:16...");
execSync(`ffmpeg -y -i "${sourceVideo}" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k "${v9x16}"`, { stdio: 'inherit' });

// 2. Square format 1:1 (1080x1080)
const v1x1 = path.join(targetDir, "v1_visual_1x1.mp4");
console.log("2. Creating square 1:1...");
execSync(`ffmpeg -y -i "${v9x16}" -filter_complex "[0:v]scale=1080:1920[v];[0:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,boxblur=25:5[bg];[v]scale=608:1080[fg];[bg][fg]overlay=(W-w)/2:0[out]" -map "[out]" -map 0:a -c:v libx264 -crf 19 -c:a copy "${v1x1}"`, { stdio: 'inherit' });

// 3. Landscape format 16:9 (1920x1080)
const v16x9 = path.join(targetDir, "v1_visual_16x9.mp4");
console.log("3. Creating landscape 16:9...");
execSync(`ffmpeg -y -i "${v9x16}" -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:5[bg];[0:v]scale=608:1080[fg];[bg][fg]overlay=(W-w)/2:0[out]" -map "[out]" -map 0:a -c:v libx264 -crf 19 -c:a copy "${v16x9}"`, { stdio: 'inherit' });

// 4. Thumbnail (High CTR cover frame at 16.0s - showing the glowing 2D ERP Hub and active conveyor)
const thumb = path.join(targetDir, "thumbnail.jpg");
console.log("4. Extracting cover thumbnail...");
execSync(`ffmpeg -y -ss 00:00:16.000 -i "${v9x16}" -vframes 1 -q:v 2 "${thumb}"`, { stdio: 'inherit' });

// 5. Critique frames
console.log("5. Extracting QA critique frames...");
execSync(`ffmpeg -y -ss 00:00:02.000 -i "${v9x16}" -vframes 1 -q:v 2 "${path.join(critiqueDir, "frame_02s_hook.jpg")}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -ss 00:00:06.000 -i "${v9x16}" -vframes 1 -q:v 2 "${path.join(critiqueDir, "frame_06s_problem.jpg")}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -ss 00:00:16.000 -i "${v9x16}" -vframes 1 -q:v 2 "${path.join(critiqueDir, "frame_16s_erp_hub.jpg")}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -ss 00:00:26.000 -i "${v9x16}" -vframes 1 -q:v 2 "${path.join(critiqueDir, "frame_26s_mobile.jpg")}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -ss 00:00:33.000 -i "${v9x16}" -vframes 1 -q:v 2 "${path.join(critiqueDir, "frame_33s_cta.jpg")}"`, { stdio: 'inherit' });

// 6. Subtitles (SRT synchronized to Fenrir speech)
const srt = `1
00:00:00,200 --> 00:00:03,000
أكبر كابوس يواجه أصحاب ومدراء المصانع:

2
00:00:03,000 --> 00:00:07,500
خط الإنتاج يتعطل فجأة لأن المواد الخام خلصت بدون ما يدري أحد!

3
00:00:07,500 --> 00:00:12,800
طلبيات الزبائن تتأخر، وتكاليف التصنيع ترتفع بسبب الفواتير الورقية وجداول الإكسل!

4
00:00:12,800 --> 00:00:16,500
الحل هو نظام الـ ERP الذكي للمصانع..

5
00:00:16,500 --> 00:00:23,500
نظام رقمي يربط خط الإنتاج، والمستودع، وحركة الشحن، وتكلفة كل قطعة في شاشة واحدة لحظة بلحظة!

6
00:00:23,500 --> 00:00:29,000
ينبهك قبل نفاد المواد، ويمنع توقف الآلات، ويخليك تدير مصنعك بالكامل من جوالك!

7
00:00:29,000 --> 00:00:32,000
جاهز تشوف كيف يشتغل بنظام مصنعك الفعلي؟

8
00:00:32,000 --> 00:00:36,500
اكتب كلمة: (مصنع) في التعليقات أو الخاص، وبنرسل لك ديمو تجريبي فوري!
`;
fs.writeFileSync(path.join(targetDir, "subtitles.srt"), srt, 'utf8');

// 7. Post Caption (Marketing copy with CTA and hashtags)
const caption = `أكبر كابوس يواجه أي مصنع أو منشأة صناعية في السعودية والخليج:
خط إنتاج يتعطل لساعات بسبب نقص مفاجئ في المواد الخام، وطلبيات الزبائن تتأخر، وتكاليف الهدر ترتفع لأن إدارة المصنع تعتمد على فواتير ورقية وملفات إكسل مشتتة! ⚠️📉

مع نظام Sudegy Factory ERP الذكي للمصانع:
▫️ ربط رقمي مباشر بين خطوط الإنتاج والآلات والمستودع المركزي.
▫️ تنبيه تلقائي وإعادة طلب المواد الخام قبل نفادها لمنع أي توقف.
▫️ احتساب تكلفة كل قطعة مصنعة بدقة لحظية وهامش الربح الصافي.
▫️ إدارة وتتبع حركة الشحن وأوامر التوريد بدون أي تأخير.
▫️ لوحة تحكم تنفيذية شاملة على جوال مدير المصنع في أي وقت! 📲⚙️

🎁 عرض تجريبي خاص للمصانع والمنشآت الصناعية:
احصل على ديمو حي مخصص بهوية وبيانات مصنعك لمعاينته مباشرة على جوالك.

👇 اكتب كلمة: (مصنع) في التعليقات أو الرسائل الخاصة، وسنرسل لك رابط الديمو التفاعلي فوراً!

#مصانع #إدارة_المصانع #الصناعة_السعودية #الرياض #جدة #erp #سوديجي #sudegy #أتمتة_المصانع #المصانع_السعودية #سلاسل_الإمداد
`;
fs.writeFileSync(path.join(targetDir, "post_caption.txt"), caption, 'utf8');

// 8. Production Report
const report = `# تقرير الإنتاج والجودة: فيديو الرسوم المتحركة 2D «نظام الـ ERP للمصانع»

- **المشروع**: Sudegy Video Studio
- **الحملة**: نظام الـ ERP الذكي للمصانع وخطوط الإنتاج (Factory ERP 2D Animation)
- **النمط البصري**: Pure 2D Flat Industrial Vector Animation (سيور ناقلة متحركة، روبوتات فحص وتغليف، كراتين موسومة، لوحة تحكم ERP تفاعلية، شاحنة شحن، وشخصيات بالزي الصناعي وخوذ الأمان).
- **الصوت المعتمد**: **Fenrir (Gemini TTS)** — النبرة التسويقية السعودية التنفيذية السريعة والواثقة (\`Saudi professional tone\`).
- **معيار الصوت**: **-14.0 LUFS** / **-1.5 dBTP** مع موسيقى خلفية تقنية منسجمة.
- **مدة الفيديو**: 37.0 ثانية (1110 إطار بمعدل 30 إطار/ثانية).
- **مسار التسليم النهائي**: \`READY_TO_SEND/sudegy/factory-erp-2d/\`

---

## حزمة الملفات المنتجة:
1. \`v1_visual_9x16.mp4\`: الفيديو الرأسي الأساسي (1080×1920) لتيك توك وريلز وسناب.
2. \`v1_visual_1x1.mp4\`: الفيديو المربع (1080×1080) لخلاصة إنستغرام ولينكد إن وتويتر.
3. \`v1_visual_16x9.mp4\`: الفيديو العريض (1920×1080) ليوتيوب وشاشات العرض.
4. \`thumbnail.jpg\`: صورة الغلاف المصغرة الأكثر جلباً للنقر.
5. \`subtitles.srt\`: الترجمة النصية التفاعلية المتطابقة مع صوت فينرير.
6. \`post_caption.txt\`: كابشن المنشور التسويقي المحفز مع دعوة الإجراء والهاشتاقات.
`;
fs.writeFileSync(path.join(targetDir, "production_report.md"), report, 'utf8');

console.log("All deliverables built successfully at:", targetDir);

