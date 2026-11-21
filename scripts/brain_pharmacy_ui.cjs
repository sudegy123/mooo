// On-screen words for the pharmacy v2 (glass feature cards + the five sample system screens), written THROUGH the
// Sudegy brain (AGENTS.md rule 3). Sample screens show example data only: no numbers, prices, real names or brands.
// Usage: node scripts/brain_pharmacy_ui.cjs <concept.json> <out.json>
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const [cf, out] = process.argv.slice(2);
const C = JSON.parse(fs.readFileSync(cf, 'utf8'));
const TASK = `Write the on-screen Arabic words for a SAMPLE pharmacy system shown in a video ad for ${C.audience} (${C.market}).
Offer (only facts you may use): ${C.offer}
${C.forbidden_claims}
Return JSON exactly:
{"cards":["...","...","...","...","...","..."],
 "alt":{"title":"...","search":"...","missing":"...","section":"...","item1":"...","item2":"...","available":"...","note":"..."},
 "chronic":{"title":"...","rows":[{"who":"...","what":"...","when":"..."},{"who":"...","what":"...","when":"..."},{"who":"...","what":"...","when":"..."}],"button":"..."},
 "rx":{"title":"...","incoming":"...","items":["...","...","..."],"ready":"..."},
 "reorder":{"title":"...","alert":"...","item":"...","list":["...","...","..."],"button":"..."},
 "loyalty":{"title":"...","customer":"...","points":"...","reward":"..."}}
Rules:
- cards: six feature titles (one per feature: alternatives, chronic refills, prescription by photo, low-stock reorder, loyalty points, cosmetics profits), 2 words each, at most 14 characters each.
- Screens are UI labels: short (1 to 5 words each), simple Arabic any Sudanese pharmacist reads at once.
- alt.search: one generic active-ingredient name customers ask for (e.g. a common blood-pressure generic), alt.item1 / item2: two alternatives described as "same active ingredient" from two different makers written as "شركة أ" / "شركة ب" style (no real brands), alt.note: makes clear the pharmacist decides.
- chronic.rows.who: initials only like "ع. أحمد" (fictional); what: the kind of medicine (blood pressure, diabetes, baby milk); when: relative time words (no digits).
- loyalty.customer: a masked phone like "•••• ••• •••" (no digits).
- No digits anywhere, no prices, no percentages, no exclamation marks, no emojis, no guarantees, no diagnosis words.`;
(async () => {
  let r, p = [];
  for (let k = 1; k <= 4; k++) {
    r = await askJSON(TASK + (p.length ? `\nPREVIOUS ATTEMPT FAILED: ${p.join('; ')}. Fix exactly that.` : ''), { system: brain.BRAIN(), temperature: 0.4 });
    p = [];
    const vals = []; (function walk(o) { if (typeof o === 'string') vals.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(walk); })(r);
    const all = vals.join(' | ');
    // check values only (keys like item1 contain digits)
    const bad = vals.filter((v) => /[0-9٠-٩%!]/.test(v));
    if (bad.length) p.push('no digits/%/! (found in: ' + bad.slice(0, 4).join(', ') + ')');
    if (/مضمون|تضمن|تشخيص|أكبر|عالمي/.test(all)) p.push('banned word');
    if (!Array.isArray(r.cards) || r.cards.length !== 6 || r.cards.some((x) => x.trim().split(/\s+/).length > 2 || x.trim().length > 14)) p.push('cards: six titles, max 2 words / 14 chars');
    for (const k2 of ['alt', 'chronic', 'rx', 'reorder', 'loyalty']) if (!r[k2] || !r[k2].title) p.push(`missing ${k2}`);
    if (!p.length) break; console.error(`attempt ${k}: ${p.join('; ')}`);
  }
  if (p.length) throw new Error('gate: ' + p.join('; '));
  fs.writeFileSync(out, JSON.stringify({ source: 'brain', made: new Date().toISOString(), ...r }, null, 2));
  console.log(JSON.stringify(r, null, 1));
})().catch((e) => { console.error(e.message); process.exit(1); });
