// Saudi-dialect version of the pharmacy tour narration (owner request 2026-11-21: "same video, Saudi dialect, with Gemini, dialect must be perfect").
// Pass 1: Gemini API (through the brain's system prompt, AGENTS.md rule 3) rewrites the approved Sudanese lines into everyday Saudi (white/Najdi) speech.
// Pass 2: Antigravity CLI (Gemini on the owner's Pro account, text only, no tools) acts as a second native-speaker editor and fixes anything that is not Saudi.
// Every result goes through the same gate as the original narration (word limits, banned claims, سوديجي, «نظام»).
// Usage: node scripts/saudi_dialect.cjs <narration.json> <out.json>
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const SALES = 'C:/Users/Admin/sudegy-sales';
const { BEATS, gate } = require('./brain_pharmacy_tour_narration.cjs');
const [inp, out] = process.argv.slice(2);
if (!out) { console.error('usage: node scripts/saudi_dialect.cjs <narration.json> <out.json>'); process.exit(2); }
const SRC = JSON.parse(fs.readFileSync(inp, 'utf8'));
const AGY = path.join(process.env.LOCALAPPDATA, 'agy', 'bin', 'agy.exe');
const LIMITS = BEATS.map(([k, n]) => `${k} ${n}`).join(', ');
const RULES = `Target: everyday spoken Saudi Arabic (white/Najdi, understood across the Kingdom), the way a Saudi pharmacist talks to another pharmacy owner: short natural phrases. Not Standard Arabic, not Sudanese, not Egyptian, not Levantine.
Use real Saudi words and grammar where natural: أبغى / تبغى، وش، ليش، كذا، الحين، يعني، مرة (very), بس، عشان، لين، ما في / ماله، يوصلك، يطلع لك، تقدر، تلقى. Present tense with ب is NOT Saudi: say «يطلع لك» not «بيطلع ليك»; «يوقف الفاتورة» not «بيوقف».
Remove every Sudanese word and form (داير، ساي، زول، هسي، ياخي، بتاعك، بيوريك، ليك، شايفها، البقرر، دوا→دواء or دوا is fine, زعلان→ما يرجع/يزعل). Say «النظام» (not «السيستم»).
Keep the same meaning, the same facts and the same order. Keep «سوديجي», keep «بنكك» exactly as the app name (it is the app shown on screen, never blame it), keep «واتساب», and keep «نظام» inside «» in the cta line.
Word limits per line: ${LIMITS}.
Never add numbers, prices, guarantees, exclamation marks, emojis or medical claims. Do not promise to reply or send anything in the cta: ask them to comment «نظام» for a free sample for their pharmacy.`;
const src = SRC.sentences.map(({ beat, text }) => ({ beat, text }));
const shape = 'Answer with ONLY the JSON array of the same shape [{"beat":"...","text":"..."}].';

(async () => {
  const brain = require(`${SALES}/sudegy_brain.js`);
  const { askJSON } = require(`${SALES}/gemini.js`);
  // ---- pass 1: Gemini API
  let res = null, p = [];
  for (let k = 1; k <= 4; k++) {
    const r = await askJSON(`Rewrite each line of this voice-over into natural Saudi Arabic.\n${RULES}\n${p.length ? 'PREVIOUS ANSWER FAILED: ' + p.join('; ') + '. Fix exactly that.\n' : ''}Lines:\n${JSON.stringify(src)}\n${shape}`, { system: brain.BRAIN(), temperature: 0.5 });
    res = Array.isArray(r) ? r : r.sentences; p = gate(res); if (!p.length) break; console.error(`pass1 attempt ${k}: ${p.join('; ')}`);
  }
  if (p.length) throw new Error('pass1 gate: ' + p.join('; '));
  const pass1 = JSON.parse(JSON.stringify(res));
  // ---- pass 2: agy as a native Saudi editor
  let fixed = null; p = [];
  for (let k = 1; k <= 3; k++) {
    const prompt = `You are a native Saudi copy editor from Riyadh with a sharp ear for dialect. Below is a voice-over in Saudi Arabic written by someone else. Edit it so every line sounds 100 percent like a real Saudi speaking, with no Sudanese, Egyptian or Levantine word or conjugation, and no stiff Standard Arabic. If a line is already perfect, return it unchanged. Do not make lines longer than the limits.\n${RULES}\n${p.length ? 'PREVIOUS ANSWER FAILED: ' + p.join('; ') + '. Fix exactly that.\n' : ''}Lines:\n${JSON.stringify(res)}\n${shape} Do not use any tools.`;
    const r = spawnSync(AGY, ['-p', prompt], { encoding: 'utf8', maxBuffer: 1 << 24, timeout: 240000 });
    const m = String(r.stdout || '').match(/\[[\s\S]*\]/);
    if (!m) { p = ['answer was not a JSON array']; console.error(`pass2 attempt ${k}: no JSON`); continue; }
    try { fixed = JSON.parse(m[0]); } catch (e) { p = ['invalid JSON']; continue; }
    p = gate(fixed); if (!p.length) break; console.error(`pass2 attempt ${k}: ${p.join('; ')}`);
  }
  const final = !p.length && fixed ? fixed : res;
  if (p.length) console.error('pass 2 did not pass the gate; keeping pass 1');
  fs.writeFileSync(out, JSON.stringify({ source: 'Sudanese narration -> Gemini API Saudi pass -> agy Saudi editor pass', made: new Date().toISOString(), from: src, pass1, sentences: final, titles: SRC.titles, parts: SRC.parts }, null, 2));
  final.forEach((s, i) => console.log(s.beat.padEnd(9), s.text, '\n          <=', src[i].text));
})().catch((e) => { console.error(e.message); process.exit(1); });
