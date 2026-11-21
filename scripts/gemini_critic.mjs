// Independent critic: a DIFFERENT model watches the rendered MP4 and judges it. It receives only the video plus the project rules,
// never the builder's reasoning (Gauntlet rule: builder != judge). Uses the Interactions REST API with the key from the sudegy-sales
// config (never printed). The video is a labelled sample ad; no private data is sent.
// Usage: node scripts/gemini_critic.mjs <video.mp4> <out.md> [model=gemini-3.8-flash] [lengthSeconds]
import fs from 'node:fs';
import path from 'node:path';

const [video, out, model = 'gemini-3.8-flash', len = '21', prevReport] = process.argv.slice(2);
if (!video || !out) { console.error('usage: node gemini_critic.mjs <video.mp4> <out.md> [model] [seconds]'); process.exit(2); }
const key = JSON.parse(fs.readFileSync(process.env.SUDEGY_SALES_CONFIG || 'C:\\Users\\Admin\\sudegy-sales\\config.json', 'utf8')).gemini?.key;
if (!key) { console.error('no gemini.key'); process.exit(3); }
const size = fs.statSync(video).size;
if (size > 18 * 1024 * 1024) { console.error('video too large for inline upload'); process.exit(4); }

const PROMPT = `You are an independent critic of short vertical (9:16) Arabic video ads. You did NOT build this video and you only have the video. Judge pixels and timing, not intentions. Be strict and specific, and cite timestamps in seconds.

CONTEXT: a ${len}-second sample ad for dental clinic owners in the Gulf. Arabic, right-to-left. The product: a patient self-check page (the patient picks the tooth that hurts, answers questions, gets a plain summary) and the clinic receives a ready, organised booking message on WhatsApp. This is a SAMPLE, not a signed client, so a visible label "[نموذج مقترح استباقي / Synthetic Pitch]" must be on screen for the WHOLE video and any numbers shown must be marked illustrative (the label says "بيانات توضيحية"). The ad must work on mute.

PROJECT RULES: show the outcome, not the technology; no price, no guarantee, no results or statistics claims, no medical diagnosis claims, no testimonials or fake proof; the closing call to action must match the hook.

The owner just complained that an earlier version was too fast to read. TASKS:
1. READING-TIME TABLE: list every distinct piece of on-screen text (including the text inside the phone recording that matters, and the label), with approximate first and last visible second, word count, and a verdict: READABLE if visible time >= 0.35 s per word + 0.7 s, otherwise TOO FAST.
2. Hook: is the first frame a finished composition? Does the hook land in the first 2 seconds?
3. Empty or dead frames, text over text, anything clipped by the frame or by the phone mockup, text outside the 9:16 safe zones (top 14%, bottom 20-35%).
4. Arabic quality: letter shaping and connection, right-to-left order, spelling, grammar, and wording that sounds unnatural for Gulf Arabic.
5. Pacing: any scene that lingers or still rushes.
6. On mute, could a first-time viewer say what the business does and what to do next?
7. Anything that could mislead (claims, numbers, fake-looking proof).
OUTPUT in Markdown with exactly these sections: "## Reading-time table", "## Findings" (numbered: time, severity High/Med/Low, what you saw, suggested fix), "## Verdict" (SHIP or ONE MORE PASS, then the top 3 fixes). Do not praise; if something is fine, say nothing about it.`;

// With CRITIC_AUDIO=1 the critic also LISTENS to the soundtrack (the builder cannot hear it).
const AUDIO = `\n\nAUDIO TASKS (the video has a narration track; listen to it):
A. Is the narration continuous from start to end? List every silent gap longer than 0.7 s with timestamps (the final 0.7 s after the last word is intentional).
B. For each spoken sentence give its approximate start/end second and compare WHAT IS SAID with WHAT IS ON SCREEN at that moment: in sync, early, late, or different text.
C. Mispronounced or unnatural words (Arabic), wrong stress, robotic or choppy artifacts, abrupt cuts between sentences, volume jumps, clipping.
D. Pace: too fast, too slow, or good. Is it Standard Arabic or a dialect, and does it sound credible for Gulf clinic owners?
Add a section "## Audio" with these findings, and include audio issues in the final verdict.`;
let prompt = PROMPT + (process.env.CRITIC_AUDIO ? AUDIO : '');
if (prevReport) {
  prompt += `\n\nVERIFICATION ROUND. A previous critic wrote the report below about an EARLIER version of this video. In a new first section "## Verification of the previous findings", mark each previous finding FIXED, PARTLY or STILL PRESENT with one line of evidence (timestamps), then do your own full review as above and list any NEW problems or regressions. Previous report:\n\n${fs.readFileSync(prevReport, 'utf8')}`;
}
const body = { model, input: [
  { type: 'video', data: fs.readFileSync(video).toString('base64'), mime_type: 'video/mp4' },
  { type: 'text', text: prompt },
] };
const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body),
});
const txt = await res.text();
let data; try { data = JSON.parse(txt); } catch { console.error('non-JSON', res.status, txt.slice(0, 300)); process.exit(5); }
if (!res.ok) { console.error('HTTP', res.status, JSON.stringify(data.error || data).slice(0, 400)); process.exit(6); }
let text = '';
(function walk(o) { if (!o || typeof o !== 'object') return; if (o.type === 'text' && typeof o.text === 'string' && o.text.length > 40) text = o.text; for (const v of Object.values(o)) walk(v); })(data.steps || data);
if (!text) { console.error('no text in response; keys:', Object.keys(data).join(',')); process.exit(7); }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `# Independent critic (${model}) — ${path.basename(video)}\n\nA different model than the builder; it saw only the video and the project rules.\n\n${text}\n`);
console.log('saved', out, text.length, 'chars');
