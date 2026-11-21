// Sudanese-dialect pass with the Antigravity CLI (agy = Gemini on the owner's Pro account), owner request 2026-11-19.
// Input: the brain's narration JSON. agy rewrites each sentence into everyday Khartoum Sudanese Arabic, same beat and meaning;
// the result is re-gated with the brain script's gate (word counts, banned claims, سوديجي, «نظام»). Text only: agy has no
// audio tool. Usage: node scripts/agy_dialect.cjs <brain.json> <out.json>
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const [inp, out, gateModule] = process.argv.slice(2);   // optional 3rd arg: the narration script whose BEATS + gate apply
const { BEATS, gate } = require(gateModule ? path.resolve(gateModule) : './brain_pharmacy_narration.cjs');
if (!out) { console.error('usage: node scripts/agy_dialect.cjs <brain.json> <out.json> [narration-script.cjs]'); process.exit(2); }
const SRC = JSON.parse(fs.readFileSync(inp, 'utf8'));
const src = SRC.sentences;
const AGY = path.join(process.env.LOCALAPPDATA, 'agy', 'bin', 'agy.exe');

const prompt = (fix) => `You are a native Sudanese copy editor from Khartoum. Rewrite each line of this video voice-over into natural, everyday spoken Sudanese Arabic (Khartoum colloquial), the way a Sudanese pharmacist really talks to another pharmacy owner. Keep the same meaning and the same order. Use real Sudanese words and grammar (for example: داير، ما في، ساي، زول، هسي، عشان، بتاعك، ياخي where natural). Remove any Gulf words (سوى/سوت، وايد، زين، الحين، شلون) and any Egyptian words (عايز، دلوقتي، كده، إزاي). Say «السيستم» for the system. Keep «سوديجي» where it appears and «نظام» inside «» in the cta line. Keep every fact exactly (for example «بنفس المادة الفعالة», «بنكك», «واتساب»); never blame Bankak or any bank.
Word limits per line: ${BEATS.map(([k, n]) => `${k} ${n}`).join(', ')}.
Never add numbers, prices, guarantees, exclamation marks, emojis or medical claims. Do not promise to reply or to send anything in the cta: ask them to comment «نظام» to get a free sample for their pharmacy.
${fix ? 'PREVIOUS ANSWER FAILED THE CHECK: ' + fix + '. Fix exactly that.\n' : ''}Lines (JSON):
${JSON.stringify(src.map(({ beat, text }) => ({ beat, text })))}
Answer with ONLY the JSON array of the same shape [{"beat":"...","text":"..."}], nothing else. Do not use any tools.`;

let res = null, p = [];
for (let k = 1; k <= 3; k++) {
  const r = spawnSync(AGY, ['-p', prompt(p.join('; '))], { encoding: 'utf8', maxBuffer: 1 << 24, timeout: 240000 });
  const txt = (r.stdout || '') + '';
  const m = txt.match(/\[[\s\S]*\]/);
  if (!m) { p = ['answer was not a JSON array']; console.error(`agy attempt ${k}: no JSON. ${txt.slice(0, 300)}`); continue; }
  try { res = JSON.parse(m[0]); } catch (e) { p = ['invalid JSON']; continue; }
  p = gate(res); if (!p.length) break; console.error(`agy attempt ${k}: ${p.join('; ')}`);
}
if (!res || p.length) { console.error('dialect pass failed: ' + p.join('; ')); process.exit(1); }
fs.writeFileSync(out, JSON.stringify({ source: 'brain + agy Sudanese dialect pass', made: new Date().toISOString(), brain: src, sentences: res, titles: SRC.titles, parts: SRC.parts }, null, 2));
res.forEach((s, i) => console.log(s.beat.padEnd(8), s.text, '   <=', src[i].text));
