// Narration for the pharmacy (Sudan) explainer v2: ONE continuous voice-over, written THROUGH the Sudegy brain
// (AGENTS.md rules 3 + 5d), one sentence per picture beat. A Sudanese-dialect pass is done afterwards by
// scripts/agy_dialect.cjs (owner request 2026-11-19: "use the CLI for the Sudanese dialect"), then re-gated here.
// Usage: node scripts/brain_pharmacy_narration.cjs briefs/gemini-video/pharmacy-sudan.concept.json <out.json>
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const [cf, out] = process.argv.slice(2);
if (!out) { console.error('usage: node scripts/brain_pharmacy_narration.cjs <concept.json> <out.json>'); process.exit(2); }
const C = JSON.parse(fs.readFileSync(cf, 'utf8'));

const BEATS = [
  ['hook', '3-6', 'the pain in its first words: a customer came with a prescription and the medicine is not on the shelf'],
  ['pain', '5-8', 'so he walks to the next pharmacy and the sale is lost'],
  ['turn', '5-8', 'Sudegy (write it سوديجي) made a pharmacy system on the phone and the cashier screen'],
  ['alt', '6-9', 'medicine missing: the system shows the pharmacist the alternative on his shelf with the same active ingredient (the pharmacist decides)'],
  ['chronic', '6-9', 'it reminds him of his blood-pressure and diabetes customers before their monthly medicine runs out'],
  ['rx', '6-9', 'the customer sends a photo of the prescription and the pharmacy prepares it before he arrives'],
  ['reorder', '6-9', 'it warns before a core item runs out and the order list for the suppliers is ready'],
  ['loyalty', '5-8', 'and loyalty points for every customer registered by phone number'],
  ['cta', '6-9', 'comment the word «نظام» to get a free sample of the system for your pharmacy'],
];
const TASK = `Write the voice-over of a vertical video ad for ${C.audience}. Market: ${C.market}. ONE narrator (a Sudanese pharmacy man, warm and confident) reads it as one continuous take.
The offer (owner's own words, the ONLY facts you may use): ${C.offer}
${C.forbidden_claims}
Language: everyday spoken Sudanese Arabic (Khartoum), the way a Sudanese pharmacist really talks to another pharmacy owner. Short words, natural rhythm, correct meaning. Not Standard Arabic, not Egyptian, not Gulf.
Return JSON exactly: {"sentences":[${BEATS.map(([k]) => `{"beat":"${k}","text":"..."}`).join(',')}]}
One sentence per beat, in this order, each ending with a period or a question mark:
${BEATS.map(([k, n, what]) => `- ${k} (${n} words): ${what}`).join('\n')}
No numbers, prices, percentages, guarantees, emojis, exclamation marks, medical claims, or the words تشخيص / مضمون / نضمن / أكبر / عالمي.`;

const wc = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
function gate(s) {
  const p = [];
  if (!Array.isArray(s) || s.length !== BEATS.length || BEATS.some(([k], i) => !s[i] || s[i].beat !== k)) return ['wrong beats or order'];
  BEATS.forEach(([k, n], i) => { const [lo, hi] = n.split('-').map(Number), w = wc(s[i].text); if (w < lo || w > hi) p.push(`${k} has ${w} words (${n})`); });
  const all = s.map((x) => x.text).join(' ');
  if (/[0-9٠-٩%!]/.test(all)) p.push('no digits, % or !');
  if (/تشخيص|مضمون|نضمن|تضمن|مؤكد|أكبر|عالمي|دائما/.test(all)) p.push('banned claim word');
  if (!/سوديجي/.test(s[2].text)) p.push('turn must name سوديجي');
  if (!/نظام/.test(s[8].text)) p.push('cta must contain the word نظام');
  else if (!s[8].text.includes('«نظام»')) s[8].text = s[8].text.replace(/["“”]?نظام["“”]?/, '«نظام»');   // normalise the quote marks
  return p;
}
module.exports = { BEATS, gate };

if (require.main === module) (async () => {
  let r, p = [];
  for (let k = 1; k <= 5; k++) {
    r = await askJSON(TASK + (p.length ? `\nPREVIOUS ATTEMPT FAILED: ${p.join('; ')}. Fix exactly that.` : ''), { system: brain.BRAIN(), temperature: 0.6 });
    p = gate(r.sentences); if (!p.length) break; console.error(`attempt ${k}: ${p.join('; ')}`);
  }
  if (p.length) throw new Error('gate: ' + p.join('; '));
  fs.writeFileSync(out, JSON.stringify({ source: 'brain', made: new Date().toISOString(), sentences: r.sentences }, null, 2));
  r.sentences.forEach((s) => console.log(s.beat.padEnd(8), s.text));
  console.log('words:', r.sentences.reduce((a, s) => a + wc(s.text), 0));
})().catch((e) => { console.error(e.message); process.exit(1); });
