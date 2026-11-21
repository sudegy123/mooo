import fs from 'node:fs';

const text = "داير نظام سحابي يربط ليك كل شغلك بمعايير عالمية؟ في سودايجي بنقدّم ليك أحدث أنظمة التشغيل للمنشآت والمتاجر. نقاط بيع سحابية ذكية بتطلع فواتيرك وتربط المبيعات مع المخزن والمحاسبة لحظياً، وبدون أي لَبَس بين الفروع. وإدارة كاملة لمخازنك بتوريك حركة الأصناف وتديك تنبيه سريع لو البضاعة قاربت تخلص أو راكدة في المخزن. مع تدقيق آلي بطابق ليك مبيعات الكاش مع التحويلات البنكية عشان توقف أي تسريب وتعرف أرباحك الحقيقية. ولوحة تحكم في تلفونك بتدير بيها كل شي. تواصل معانا وخلّينا نجهّز ليك العرض الفني المناسب لشغلك.";

const out = "G:/sudegy-video-studio/compositions/sudegy-enterprise-luxury/assets/voice_sudanese.wav";
const voice = "Puck";
const style = "warm, natural, authentic Sudanese Arabic dialect, colloquial business narrative, confident, conversational and smooth pace";
const model = "gemini-3.8-flash-lite-tts";

let key = process.env.GEMINI_API_KEY;
if (!key) {
  try {
    key = JSON.parse(fs.readFileSync('C:\\Users\\Admin\\sudegy-sales\\config.json', 'utf8')).gemini?.key;
  } catch {}
}

const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
  body: JSON.stringify({
    model,
    input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style }] }] }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  }),
});

const raw = await res.text();
let data;
try { data = JSON.parse(raw); } catch { console.error('non-JSON', raw); process.exit(1); }
if (!res.ok) { console.error('HTTP', res.status, data); process.exit(1); }

let audio = null;
(function walk(o) { if (audio || !o || typeof o !== 'object') return; if (o.type === 'audio' && typeof o.data === 'string' && o.data.length > 1000) { audio = o; return; } for (const v of Object.values(o)) walk(v); })(data);

if (!audio) { console.error('no audio'); process.exit(1); }
fs.writeFileSync(out, Buffer.from(audio.data, 'base64'));
console.log('Voice generated successfully at', out);
