// Generate a still image with Nano Banana (Gemini image model) via the Interactions REST API.
// The API key is read from the sudegy-sales config (gemini.key) and is never printed or copied.
// Usage: node scripts/nanobanana.mjs "<prompt>" <out.png> [aspect=9:16] [size=2K] [model=gemini-nano-banana-2.1]
import fs from 'node:fs';
import path from 'node:path';

const [prompt, out, aspect = '9:16', size = '2K', model = 'gemini-nano-banana-2.1'] = process.argv.slice(2);
if (!prompt || !out) { console.error('usage: node nanobanana.mjs "<prompt>" <out.png> [aspect] [size] [model]'); process.exit(2); }

const CONFIG = process.env.SUDEGY_SALES_CONFIG || 'C:\\Users\\Admin\\sudegy-sales\\config.json';
const key = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).gemini?.key;
if (!key) { console.error('no gemini.key in config'); process.exit(3); }

const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
  body: JSON.stringify({ model, input: prompt, response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: aspect, image_size: size } }),
});
const text = await res.text();
let data; try { data = JSON.parse(text); } catch { console.error('non-JSON response', res.status, text.slice(0, 300)); process.exit(4); }
if (!res.ok) { console.error('HTTP', res.status, JSON.stringify(data.error || data).slice(0, 500)); process.exit(5); }

// find the first image payload anywhere in the response (steps[].content[] with type "image")
let img = null;
(function walk(o) { if (img || !o || typeof o !== 'object') return; if (o.type === 'image' && typeof o.data === 'string' && o.data.length > 1000) { img = o; return; } for (const v of Object.values(o)) walk(v); })(data);
if (!img) { console.error('no image in response. keys:', Object.keys(data).join(','), 'status:', data.status); process.exit(6); }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(img.data, 'base64'));
console.log('saved', out, Math.round(fs.statSync(out).size / 1024) + ' KB', img.mime_type || '');
