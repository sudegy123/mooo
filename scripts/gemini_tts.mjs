// Text-to-speech with Gemini (Interactions REST API, gemini-3.8-flash-tts). Key from the sudegy-sales config, never printed.
// Output: 24 kHz mono 16-bit WAV. NOTE: documented Arabic support is Standard Arabic and Egyptian Arabic; a Gulf accent is NOT documented,
// so a native speaker has to listen before anything is sent.
// Usage: node scripts/gemini_tts.mjs "<arabic text>" <out.wav> [voice=Kore] [style] [model=gemini-3.8-flash-tts]
import fs from 'node:fs';
import path from 'node:path';

const [text, out, voice = 'Kore', style = 'calm, clear and professional Standard Arabic, medium pace, warm tone', model = 'gemini-3.8-flash-lite-tts'] = process.argv.slice(2);
if (!text || !out) { console.error('usage: node gemini_tts.mjs "<text>" <out.wav> [voice] [style] [model]'); process.exit(2); }
let key = process.env.GEMINI_API_KEY;
if (!key) {
  try {
    key = JSON.parse(fs.readFileSync(process.env.SUDEGY_SALES_CONFIG || 'C:\\Users\\Admin\\sudegy-sales\\config.json', 'utf8')).gemini?.key;
  } catch {}
}
if (!key) { console.error('no gemini.key'); process.exit(3); }

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
let data; try { data = JSON.parse(raw); } catch { console.error('non-JSON', res.status, raw.slice(0, 300)); process.exit(4); }
if (!res.ok) { console.error('HTTP', res.status, JSON.stringify(data.error || data).slice(0, 400)); process.exit(5); }
let audio = null;
(function walk(o) { if (audio || !o || typeof o !== 'object') return; if (o.type === 'audio' && typeof o.data === 'string' && o.data.length > 1000) { audio = o; return; } for (const v of Object.values(o)) walk(v); })(data);
if (!audio) { console.error('no audio in response; keys:', Object.keys(data).join(','), 'status:', data.status); process.exit(6); }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(audio.data, 'base64'));
console.log('saved', out, Math.round(fs.statSync(out).size / 1024) + ' KB', audio.mime_type || '');
