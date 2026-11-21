// Verbatim transcript of a client's speech by Gemini, AUDIO ONLY (no picture, no faces leave the machine).
// Needed because whisper small on this machine mishears quiet, accented, or mixed-language speech.
// Usage: node scripts/gemini_transcribe.mjs <audio.mp3> <out.json> [model=gemini-3.5-flash] [hint]
// The key comes from the sudegy-sales config and is never printed. Only run with the owner's OK for that client's audio.
import fs from 'node:fs';
import path from 'node:path';

const [audio, out, model = 'gemini-3.5-flash', hint = ''] = process.argv.slice(2);
if (!audio || !out) { console.error('usage: node gemini_transcribe.mjs <audio.mp3> <out.json> [model] [hint]'); process.exit(2); }
const key = JSON.parse(fs.readFileSync(process.env.SUDEGY_SALES_CONFIG || 'C:\\Users\\Admin\\sudegy-sales\\config.json', 'utf8')).gemini?.key;
if (!key) { console.error('no gemini.key'); process.exit(3); }
if (fs.statSync(audio).size > 18 * 1024 * 1024) { console.error('audio too large for inline upload'); process.exit(4); }

const PROMPT = `Transcribe this short speech recording exactly as spoken. Do not summarise, translate, correct or add anything.
${hint ? 'Context from the owner: ' + hint + '\n' : ''}Return ONLY JSON, no markdown fences:
{"language":"main language spoken (name it; say if two languages are mixed)","segments":[{"start":seconds_number,"end":seconds_number,"text":"verbatim words in the spoken language"}],"uncertain":["words or phrases you are not sure about"],"english_gloss":"a faithful English rendering of the whole speech","german":"a faithful German rendering of the whole speech (natural, medical register, do not add claims)"}
Segments are short phrases of 2 to 6 seconds. Times in seconds from the start of the recording.`;

const body = { model, input: [
  { type: 'audio', data: fs.readFileSync(audio).toString('base64'), mime_type: 'audio/mpeg' },
  { type: 'text', text: PROMPT },
] };
let data, res, txt;
for (let attempt = 1; attempt <= 3; attempt++) {
  res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
  txt = await res.text();
  if (res.ok) break;
  console.error('attempt', attempt, 'HTTP', res.status, txt.slice(0, 200));
  await new Promise((r) => setTimeout(r, 4000 * attempt));
}
if (!res.ok) process.exit(6);
try { data = JSON.parse(txt); } catch { console.error('non-JSON', txt.slice(0, 300)); process.exit(5); }
let text = '';
(function walk(o) { if (!o || typeof o !== 'object') return; if (o.type === 'text' && typeof o.text === 'string' && o.text.length > 20) text = o.text; for (const v of Object.values(o)) walk(v); })(data.steps || data);
if (!text) { console.error('no text in response'); process.exit(7); }
const clean = text.replace(/^```(?:json)?/i, '').replace(/```\s*$/, '').trim();
let parsed; try { parsed = JSON.parse(clean); } catch { fs.writeFileSync(out + '.raw.txt', text); console.error('could not parse JSON; raw saved'); process.exit(8); }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ model, source: path.basename(audio), ...parsed }, null, 2));
console.log('saved', out, (parsed.segments || []).length, 'segments, language:', parsed.language);
