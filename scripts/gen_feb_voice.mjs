import fs from 'node:fs';

const text = "فواتيرك تايهة؟ والمخزن ناقص والزبون مستني ومحتار وين أرباحك؟ في سودايجي بنقدّم ليك أحدث الأنظمة السحابية المتكاملة لإدارة المتاجر والشركات. نقاط بيع سحابية ذكية بتطلع فواتيرك وتربط المبيعات مع المخزن والمحاسبة لحظياً وبشاشة واحدة. وإدارة كاملة لمخازنك بتنبّهك بالنواقص والرواكد وتمنع الهدر تماماً. مع تدقيق آلي بطابق الكاش مع التحويلات البنكية عشان تعرف أرباحك الحقيقية من تلفونك في أي وقت. وما تفوّت عرض فبراير الخاص من سودايجي! اطلب العرض الفني والنموذج العملي لشغلك هسي!";

const out = "G:/sudegy-video-studio/compositions/f-sudegy-february-ad/assets/voice.wav";
const voice = "Puck";
const style = "warm, natural, authentic Sudanese Arabic dialect, energetic lively retail explainer, confident, smiling, conversational pace";
const model = "gemini-3.8-flash-lite-tts";

let key = process.env.GEMINI_API_KEY;
if (!key) {
  try {
    key = JSON.parse(fs.readFileSync('C:\\Users\\Admin\\sudegy-sales\\config.json', 'utf8')).gemini?.key;
  } catch {}
}

const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
  method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key },
  body: JSON.stringify({
    model,
    input: [{ type: "user_input", content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style }] }] }],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice }] },
  }),
});

const raw = await res.text();
let data = JSON.parse(raw);
let audio = null;
(function walk(o) { if (audio || !o || typeof o !== "object") return; if (o.type === "audio" && typeof o.data === "string" && o.data.length > 1000) { audio = o; return; } for (const v of Object.values(o)) walk(v); })(data);
if (!audio) { console.error("no audio", data); process.exit(1); }
fs.writeFileSync(out, Buffer.from(audio.data, "base64"));
console.log("Generated voice successfully at:", out);
