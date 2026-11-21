# Sudegy Video Studio

استوديو فيديوهات إعلانية قصيرة (9:16، ~15 ثانية) لخدمات Sudegy. الفيديو يوضّح للعميل النتيجة (مثلاً حجوزات المساء) فوق لقطات شاشة حقيقية للمنتج، يُبنى بالكود، يُنتقد، يُصلح، ثم تتولد منه 3 نسخ hook للاختبار.

**صدق في التوقعات:** لا أداة تضمن الانتشار. اللي نضمنه: جودة ثابتة، نسخ كثيرة للاختبار، وقياس. الانتشار الفعلي يعتمد على الـ hook والنتيجة المعروضة والتوزيع.

## المجلدات
| المجلد | الوظيفة |
|---|---|
| `AGENTS.md` | القواعد (الصدق، Synthetic Pitch، النص عبر sudegy_brain.js، الخط) |
| `briefs/` | بريف كل فيديو |
| `compositions/` | مشاريع HyperFrames (HTML → MP4) |
| `assets/screens`, `assets/brand` | لقطات الشاشة الحقيقية وهوية العلامة (محلية، بلا روابط خارجية) |
| `scripts/critique.sh` | قياس موضوعي للفيديو (دقة، مدة، تجمّد، loudness، contact sheet) |
| `critique/` | تقارير النقد لكل نسخة |
| `out/` | الفيديوهات المرندرة (غير مرفوعة في git) |
| `docs/` | البحث وما تعلمناه (`learnings-2026-10-17.md`) |
| `vendor-review/` | مستودعات طرف ثالث للقراءة فقط. لا تشغّل منها شيئاً |

## التجربة الجاهزة
`READY_TO_SEND\` فيه النسخة المختارة hook C **بتعليق صوتي متصل على طول الفيديو** (25.7 ثانية) + نسخة صامتة (23 ثانية) + نص التعليق + رسالة واتساب + شرح (`README_ar.txt`). النسخ السابقة في `old_versions\` (وملف الصوت التجريبي القديم `..._voice_EXPERIMENTAL.mp4` ما انتقل لأنه كان مفتوحاً). سجل جولات النقد: `critique\dental-triage-15s\ledger.md`. مدقق زمن القراءة: `node scripts\reading_audit.mjs <composition> briefs\rows_c.json`. السرد المتصل: `scripts\brain_narration.cjs` ثم `gemini_tts.mjs` ثم `make_narrated.cjs`.

## الحالة
- [x] هيكل المشروع + القواعد
- [x] تنزيل ودراسة 6 مستودعات (HyperFrames, motion-video-kit, claude-remotion-skill, OpenMontage, ad-video-skills, watch-video-skill)
- [x] أداة النقد `scripts/critique.sh` مختبرة
- [x] HyperFrames 0.8.168 مثبّت محلياً (`--ignore-scripts`، telemetry معطّل)
- [x] تسجيل حقيقي لعرض الأسنان (`scripts/capture_demo.mjs`) وبناء الريل (`scripts/build_reel.mjs`)
- [x] نصوص الفيديو من `sudegy_brain.js` (`scripts/brain_copy.cjs`)
- [x] فيديو 15 ثانية 9:16 (`compositions/dental-triage-15s/`) بثلاث نسخ hook (`briefs/rows.json`)
- [ ] مراجعة المستخدم واختيار النسخة (والنقد المستقل إن رغبت)
- [ ] صور Nano Banana: محجوبة بالطبقة المجانية للمفتاح الحالي (انظر `docs/run-notes-2026-10-17.md`)

## كل أوامر HyperFrames عبر الغلاف (يوجّه كل شي لـ G: ويعطّل الإرسال الخارجي)
```powershell
cd compositions\dental-triage-15s
powershell -File ..\..\scripts\hf.ps1 check
powershell -File ..\..\scripts\hf.ps1 render --batch ..\..\briefs\rows.json --output "..\..\out\dental-triage-15s\v2\{name}.mp4" --quality looks --workers 1 --strict-variables
```

## تشغيل النقد على أي فيديو (Git Bash)
```bash
bash scripts/critique.sh out/<slug>/v1_a.mp4 critique/<slug>/v1_a
```
