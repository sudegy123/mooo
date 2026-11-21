// Narration + on-screen titles for the pharmacy system tour, written THROUGH the Sudegy brain (AGENTS.md rules 3 + 5d).
// Chosen idea (briefs/pharmacy-tour.md): "the leaks" spine from the critique, but the whole system is shown (owner request):
// part A = where the pharmacy loses money, part B = what brings the customer back, part C = the owner away from the pharmacy.
// Each beat maps to a recorded screen of the live demo (verification table in the brief). Sudanese dialect pass afterwards:
//   node scripts/agy_dialect.cjs <brain.json> <out.json> scripts/brain_pharmacy_tour_narration.cjs
// Usage: node scripts/brain_pharmacy_tour_narration.cjs <out.json>
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const { FACTS, FORBIDDEN, AUDIENCE } = require('./brain_pharmacy_tour.cjs');

const BEATS = [
  ['hook', '3-6', 'the pain in its first words: the pharmacy loses money in places the owner does not see'],
  ['intro', '6-10', 'Sudegy (write it سوديجي) made a complete pharmacy system on the phone; here it is part by part'],
  ['alt_p', '5-9', 'pain: a customer asks for a medicine that is out of stock and walks to another pharmacy'],
  ['alt_s', '8-13', 'the system shows the alternative on the shelf with the same active ingredient, and the pharmacist decides (F2)'],
  ['inter_s', '7-11', 'and if two medicines in the same invoice do not go together, it warns before the sale (F2)'],
  ['bankak_p', '6-10', 'pain: a customer pays by Bankak with a transfer notice that was already used before'],
  ['bankak_s', '7-12', 'you type the notice number, and if it is repeated the system stops the invoice (F8)'],
  ['staff_p', '5-9', 'pain: the owner is away and the cash drawer is opened without a sale'],
  ['staff_s', '8-13', 'the control log shows discounts above the permission and invoices deleted after printing, and each employee has his own permissions (F9)'],
  ['expiry_p', '5-9', 'pain: medicine expires on the shelf without anyone noticing'],
  ['expiry_s', '8-13', 'it shows what expires soon, blocks expired batches from sale, and keeps the insulin fridge temperature log (F6)'],
  ['reorder_p', '5-9', 'pain: an item runs out suddenly and the customer leaves empty-handed'],
  ['reorder_s', '8-13', 'the order list is ready for each supplier from the daily sales, with what you owe each drug company and when (F6, F7)'],
  ['power_p', '4-8', 'pain: the power is cut and the network is down'],
  ['power_s', '7-12', 'selling continues and is saved on the device, and it syncs when the network returns (F10)'],
  ['partb', '3-7', 'transition: and now, what brings the customer back to you'],
  ['rx_s', '9-14', 'the customer sends a photo of the prescription on WhatsApp, you prepare it before he comes, and a ready message tells him to come and collect (F3)'],
  ['chronic_s', '9-14', 'blood pressure and diabetes customers: the system reminds you before their medicine runs out, with the reminder message ready (F4)'],
  ['loyalty_s', '9-14', 'the customer registers with his phone number only, collects points with every invoice and uses them as a discount (F5)'],
  ['owner_s', '9-14', 'and you, from anywhere: today\'s board on your phone with the sales, the drawer and Bankak, and the day summary on WhatsApp (F1)'],
  ['cta', '6-10', 'write the word «نظام» and try the system with your pharmacy\'s name (F11)']
];
const TITLES = ['alt', 'bankak', 'staff', 'expiry', 'reorder', 'power', 'rx', 'chronic', 'loyalty', 'owner'];
const PARTS = ['a: where the money leaks', 'b: what brings the customer back', 'c: you, away from the pharmacy'];

const TASK = `Write the voice-over and the on-screen titles of a premium vertical tour video of the Sudegy pharmacy system (real screen recording on a phone, one narrator, one continuous take).
Audience: ${AUDIENCE}.
Facts (the ONLY facts you may use): ${JSON.stringify(FACTS)}
${FORBIDDEN}
Language of the voice-over: everyday spoken Sudanese Arabic (Khartoum), the way a Sudanese pharmacist talks to another pharmacy owner: short words, natural rhythm. Not Standard Arabic, not Egyptian, not Gulf. Say «السيستم» for the system.
Return JSON exactly: {"sentences":[${BEATS.map(([k]) => `{"beat":"${k}","text":"..."}`).join(',')}],"titles":{${TITLES.map((k) => `"${k}":"..."`).join(',')}},"parts":{"a":"...","b":"...","c":"..."}}
Sentences: one per beat, in this order, each ending with a period or a question mark:
${BEATS.map(([k, n, what]) => `- ${k} (${n} words): ${what}`).join('\n')}
titles: the chapter title shown on screen for each chapter (two to four words, simple Arabic that any Arab pharmacist reads at once, no dialect spelling): ${TITLES.join(', ')}.
parts: the three part titles shown on screen (two to four words each): ${PARTS.join('; ')}.
No digits, prices, percentages, guarantees, emojis, exclamation marks, medical claims, or the words تشخيص / مضمون / نضمن / أكبر / عالمي.`;

const wc = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
function gate(s, r) {
  const p = [];
  if (!Array.isArray(s) || s.length !== BEATS.length || BEATS.some(([k], i) => !s[i] || s[i].beat !== k)) return ['wrong beats or order'];
  BEATS.forEach(([k, n], i) => { const [lo, hi] = n.split('-').map(Number), w = wc(s[i].text); if (w < lo || w > hi) p.push(`${k} has ${w} words (${n})`); });
  const all = s.map((x) => x.text).join(' ');
  if (/[0-9٠-٩%!]/.test(all)) p.push('no digits, % or !');
  if (/تشخيص|مضمون|نضمن|تضمن|مؤكد|أكبر|عالمي|دائما|بيرسل براهو|يرسل تلقائي|مربوط ببنكك|مرتبط ببنكك/.test(all)) p.push('banned or untrue claim');
  if (!/سوديجي/.test(s[1].text)) p.push('intro must name سوديجي');
  const cta = s[s.length - 1];
  if (!/نظام/.test(cta.text)) p.push('cta must contain the word نظام');
  else if (!cta.text.includes('«نظام»')) cta.text = cta.text.replace(/["“”]?نظام["“”]?/, '«نظام»');
  if (r) {
    if (!r.titles || TITLES.some((k) => !r.titles[k] || wc(r.titles[k]) > 4)) p.push('titles missing or longer than four words');
    if (!r.parts || ['a', 'b', 'c'].some((k) => !r.parts[k] || wc(r.parts[k]) > 4)) p.push('part titles missing or longer than four words');
    if (/[0-9٠-٩%!]/.test(JSON.stringify([r.titles, r.parts]))) p.push('titles: no digits');
  }
  return p;
}
module.exports = { BEATS, gate, TITLES };

if (require.main === module) (async () => {
  const brain = require(`${SALES}/sudegy_brain.js`);
  const { askJSON } = require(`${SALES}/gemini.js`);
  const [out, reviseFile, notesFile] = process.argv.slice(2);   // optional: revise a previous draft with a reviewer's notes
  const REV = reviseFile ? `\nREVIEW OF YOUR PREVIOUS DRAFT (keep what is good, fix every point):\nDraft: ${JSON.stringify((({ sentences, titles, parts }) => ({ sentences, titles, parts }))(JSON.parse(fs.readFileSync(reviseFile, 'utf8'))))}\nReviewer notes:\n${fs.readFileSync(notesFile, 'utf8')}` : '';
  let r, p = [];
  for (let k = 1; k <= 5; k++) {
    r = await askJSON(TASK + REV + (p.length ? `\nPREVIOUS ATTEMPT FAILED: ${p.join('; ')}. Fix exactly that.` : ''), { system: brain.BRAIN(), temperature: 0.6 });
    p = gate(r.sentences, r); if (!p.length) break; console.error(`attempt ${k}: ${p.join('; ')}`);
  }
  if (p.length) throw new Error('gate: ' + p.join('; '));
  fs.writeFileSync(out, JSON.stringify({ source: 'brain', made: new Date().toISOString(), sentences: r.sentences, titles: r.titles, parts: r.parts }, null, 2));
  r.sentences.forEach((s) => console.log(s.beat.padEnd(10), s.text));
  console.log('titles:', JSON.stringify(r.titles)); console.log('parts:', JSON.stringify(r.parts));
  console.log('words:', r.sentences.reduce((a, s) => a + wc(s.text), 0));
})().catch((e) => { console.error(e.message); process.exit(1); });
