// Builds the batch rows (3 hook variants, ONE variable differs: the hook) from brain-generated copy files.
// Selection is documented: every string comes from a brain run; the only human choice is WHICH brain output to keep.
// Usage: node scripts/make_rows.cjs
const fs = require('fs');
const dir = 'G:/sudegy-video-studio/briefs/';
const rd = (f) => JSON.parse(fs.readFileSync(dir + f, 'utf8'));
const main = rd('smart-triage-dental-15s.copy.json').copy;      // latest brain run (all gates passed)
const alt = rd('smart-triage-dental-15s.copy.v3.json').copy;    // earlier brain run, used ONLY for pain_line

const shared = {
  cta: main.hooks[0].cta,                   // identical across variants so only the hook is tested
  pain: alt.pain_line,                      // main run said "معظم ..." (an unsourced statistic); this one is neutral
  cap1: main.demo_captions[0], cap2: main.demo_captions[1], cap3: main.demo_captions[2],
  result: main.result_line,
};
const rows = main.hooks.map((h) => ({ name: `hook_${h.id}`, hook: h.text, ...shared }));
fs.writeFileSync(dir + 'rows.json', JSON.stringify({ rows }, null, 2));
fs.writeFileSync(dir + 'smart-triage-dental-15s.copy.final.json', JSON.stringify({
  provenance: { main: 'smart-triage-dental-15s.copy.json (brain run 4, all gates passed)', pain_line: 'smart-triage-dental-15s.copy.v3.json (brain run 3): run 4 used "معظم", an unsourced statistic', rule: 'one variable per variant: hook text only; CTA identical' },
  rows, message: main.message,
}, null, 2));
console.log(JSON.stringify(rows, null, 1));
console.log('\nMESSAGE:\n' + main.message);
