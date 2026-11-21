# factory/edit — تعديل فيديوهات جاهزة (قص، تنظيف، فحص)

الأداة: المهارة `.claude/skills/video-editing-skill` (نسخة مراجَعة من github.com/social-media-skills/video-editing-skill، MIT، مراجعة الكود 2026-11-09)
+ محوّل محلي `transcribe_cpp.py` (whisper.cpp، عربي). كله على G: وبدون أي إرسال خارجي.

نسخ المراجعة (قراءة فقط): `vendor-review/social-media-skills-video-editing-skill`، `cut-video`، `6missedcalls-video-editing-skill`.
لم تُعتمد cut-video (macOS + conda + إنجليزي) ولا 6missedcalls (يحتاج openai-whisper/torch).

## الأوامر (من أي مجلد غير مجلد الريبو الخارجي، دائماً مع `-I`)
```bash
S=/g/sudegy-video-studio; W=$S/factory/edit/work/<اسم>; K=$S/.claude/skills/video-editing-skill/scripts
python -I $K/transcribe_cpp.py input.mp4 --out $W --lang ar          # تفريغ بتوقيت كل كلمة
# اكتب $W/edit.json (انظر رأس edit_video.py): style tight|youtube|podcast, cut, keep, ...
python -I $K/edit_video.py $W/edit.json --transcript $W/transcript.json --out $W/edited --plan   # الخطة فقط
python -I $K/edit_video.py $W/edit.json --transcript $W/transcript.json --out $W/edited          # الرندر
```
المخرجات: `edited.mp4`، `captions.srt`، `chapters.txt`، `cuts.jpg` (إطارات قبل/بعد كل قطع)، `edit-report.md`، `manifest.json`.


## الأمر الواحد (يجمع كل شي): `run_edit.cjs`
```bash
node factory/edit/run_edit.cjs "<input.mp4>" --id <اسم> --lang ar [--terms "كلمات يجب كتابتها صح"] [--tail 0.7] [--style tight] [--critic] [--no-render]
```
1. **فحص المدخل** (قياس فقط): صوت، 9:16، دقة، LUFS وذروة، صمت > 0.4 ث، إطارات سوداء ومتجمدة، الإطار الأول، تنفّس بعد آخر كلمة.
2. **تفريغ محلي** (whisper.cpp، عربي) ← 3. **خطة قص وقص** (video-editing-skill؛ صفر قطع إجابة صحيحة).
4. **إعادة تأطير** 9:16 و1:1 و16:9 (خلفية ضبابية، لا قص للنص) + **ذيل صامت** بعد آخر كلمة.
5. **صوت** -14 LUFS لكل مقاس ← 6. **SRT مسودة** + صورة غلاف + contact sheet ← 7. **بوابة QA** (`factory/lib/qa.cjs`).
8. **ناقد مستقل** اختياري `--critic` (Gemini يسمع ويشوف الناتج؛ يرفع الفيديو الناتج لـ Google بمفتاحك. مغلق افتراضياً، ولا تستخدمه لفيديو عميل بدون موافقته).
المخرجات في `out/edit/<id>/` (مو READY_TO_SEND: القرار للمالك) مع `report.md`.
**ما لا يفحصه آلياً:** الأسعار والأرقام والوجوه على الشاشة مقابل AGENTS.md (بلا OCR)، ودقة التفريغ العربي (small يغلط).

## قياس فعلي (فيديو عربي 23 ث + 5.5 ث فراغ محقون عمداً)
التفريغ 28 ث، الرندر 21 ث، 28.7 ث ← 24.2 ث، الفراغان اتقصّا لنبضة 0.9 ث، الدقة 1080x1920 كما هي، الصوت -14 LUFS.

## قيود معروفة
- قوائم الحشو (um/uh) وإشارات إعادة الأخذ في `edit_video.py` إنجليزية. القص بالصمت يشتغل لأي لغة.
- لا تحرق ترجمة عربية بالسكربت (خط Poppins لاتيني). سلّم SRT أو رندر الترجمة عبر HyperFrames.
- نمط الـ punch-in للـ talking-head فقط؛ للإعلانات وتسجيلات الشاشة ضع `"punch_in": 0`.
