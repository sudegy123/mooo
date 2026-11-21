// On-screen motion text for an EDITED client video. Rule 3 of AGENTS.md: copy goes through the Sudegy brain (askJSON),
// and rule 2: the text may only say what the speaker says. The gate below rejects any content word that is not in the
// transcript, any digit, and any result/guarantee word. The brain never edits the speaker's claims, it only shortens them.
// Usage: node factory/edit/overlay_copy.cjs <gemini_transcript.json> <out.json> --beats '<json array of {id,from,to,maxWords,purpose}>' [--lang de]
const fs = require('fs');
const { SALES, log } = require('../lib/util.cjs');
const { askJSON } = require(`${SALES}/gemini.js`);

const argv = process.argv.slice(2);
const [trPath, outPath] = argv;
const opt = (k, d) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : d; };
const lang = opt('--lang', 'de');
const beats = JSON.parse(opt('--beats', '[]'));
if (!trPath || !outPath || !beats.length) { console.error('usage: overlay_copy.cjs <transcript.json> <out.json> --beats [...]'); process.exit(2); }

const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const spoken = (tr.segments || []).map((s) => s.text).join(' ');
const norm = (s) => s.toLowerCase().replace(/[^a-zäöüß\s-]/g, ' ');
const spokenN = norm(spoken);
const BANNED = ['garantiert', 'garantie', '100', 'sofort', 'dauerhaft', 'heilung', 'heilt', 'ohne risiko', 'beweis', 'vorher', 'nachher', 'günstig', 'rabatt'];

function gate(items) {
  const problems = [];
  for (const b of beats) {
    const it = items.find((x) => x.id === b.id);
    if (!it || !it.text) { problems.push(`missing beat ${b.id}`); continue; }
    const words = it.text.split(/\s+/).filter(Boolean);
    if (words.length > b.maxWords) problems.push(`${b.id} has ${words.length} words, max ${b.maxWords}`);
    if (/\d/.test(it.text)) problems.push(`${b.id} contains digits`);
    if (/[!?]{2,}|[\u{1F300}-\u{1FAFF}]/u.test(it.text)) problems.push(`${b.id} has emoji or stacked punctuation`);
    for (const w of norm(it.text).split(/\s+/).filter((x) => x.length >= 4)) {
      const stem = w.slice(0, Math.max(4, w.length - 3));
      if (!spokenN.includes(stem)) problems.push(`${b.id}: "${w}" is not something the speaker says`);
    }
    for (const bad of BANNED) if (norm(it.text).includes(bad)) problems.push(`${b.id}: banned word "${bad}"`);
  }
  return problems;
}

(async () => {
  const prompt = `You write the ON-SCREEN MOTION TEXT for a short vertical video of a doctor speaking to the camera (${lang === 'de' ? 'German' : lang}). The doctor's exact words are:
"""
${(tr.segments || []).map((s) => `[${s.start}-${s.end}s] ${s.text}`).join('\n')}
"""
Task: for each beat below, write ONE very short headline (kinetic title, not a subtitle) in ${lang === 'de' ? 'German' : lang}.
HARD RULES: use ONLY words and claims the doctor actually says; shorten or reorder them, never add a new fact, number, result, promise, price or comparison. No emojis, no exclamation marks, no digits. Plain, calm, premium tone for an aesthetic clinic. Each headline must be readable at a glance.
Beats:
${beats.map((b) => `- id "${b.id}" (${b.from}s-${b.to}s, max ${b.maxWords} words): ${b.purpose}`).join('\n')}
Return JSON only: {"items":[{"id":"...","text":"..."}]}`;
  let prev = '', best = null;
  for (let a = 1; a <= 5 && !best; a++) {
    const r = await askJSON(prompt + (prev ? `\nPREVIOUS ATTEMPT FAILED: ${prev}. Fix exactly that.` : ''), { temperature: 0.5 });
    const items = (r && r.items) || [];
    const problems = gate(items);
    log(`overlay copy attempt ${a}: ${problems.length ? problems.join('; ') : 'passed'}`);
    if (!problems.length) best = items; else prev = problems.join('; ');
  }
  if (!best) { console.error('no copy passed the gate:', prev); process.exit(3); }
  fs.writeFileSync(outPath, JSON.stringify({ via: 'askJSON + truthfulness gate (words must be spoken)', lang, beats: beats.map((b) => ({ ...b, text: best.find((x) => x.id === b.id).text })) }, null, 2));
  console.log('saved', outPath);
})().catch((e) => { console.error(String(e).slice(0, 300)); process.exit(1); });
