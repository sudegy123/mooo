# تشغيل المصنع على جهاز جديد

المرفوع هنا هو الكود فقط. الفيديوهات الناتجة وملفات العملاء والأدوات الكبيرة ما تنرفع على GitHub.

## اللي لازم تجهزه
- Node و npm و ffmpeg و Python (`npm install` داخل المشروع).
- **مفتاح Gemini** (مجاني من Google AI Studio) كمتغير بيئة `GEMINI_API_KEY`. لا تحطه داخل أي ملف في المستودع، المستودع عام.
- **whisper.cpp** مع نموذج `ggml-small.bin` داخل `tools/whisper/` (لتوقيت الكلمات). غير مرفوع لأن حجمه كبير.
- **sudegy-sales**: المصنع يقرأ دماغ الكتابة `sudegy_brain.js` و`gemini.js` من مجلد `sudegy-sales` (المسار مكتوب في `factory/lib/util.cjs`، غيّره لمكان المجلد عندك). هذا المجلد خاص وغير مرفوع، اطلبه من صاحب المشروع.
- HyperFrames يتشغل عبر `scripts/hf.ps1` (ويندوز، يوجّه الملفات المؤقتة للقرص G:، غيّر الحرف حسب جهازك).

## التشغيل
```
node factory/run.cjs factory/jobs/<job>.json --copy-only
node factory/run.cjs factory/jobs/<job>.json --no-render --preview
node factory/run.cjs factory/jobs/<job>.json
```
الشرح الكامل في `.claude/skills/sudegy-video-factory/SKILL.md` و`AGENTS.md`.

## غير مرفوع
`factory/clients/` و`factory/work/` و`out/` و`READY_TO_SEND/` ومشاريع العملاء (أندوريا، د. مازن، وأعمال المعرض)، لأنها بيانات عملاء.
