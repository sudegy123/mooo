// One CONTINUOUS narration for the whole video, written THROUGH the Sudegy brain (GULF_BRAIN rules + gemini.js + quality gate).
// The on-screen texts already approved (hook C, pain line, captions, result line, CTA) are reused verbatim as sentences; the three
// demo sentences are new and only describe the real flow shown on screen. Output: JSON with 7 scene-tagged sentences.
// Usage: node scripts/brain_narration.cjs <out.json>
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const { checkFirstMessage } = require(`${SALES}/gulf_manager.js`);
const out = process.argv[2];
if (!out) { console.error('usage: node brain_narration.cjs <out.json>'); process.exit(2); }

const rows = JSON.parse(fs.readFileSync('G:/sudegy-video-studio/briefs/rows_c.json', 'utf8')).rows[0];

const TASK = `A 25-second vertical sample ad for dental clinic owners in the Gulf will be read aloud by ONE voice, continuously from the first second to the last (no silent gaps, no separate lines). Write that narration in Standard Arabic that is natural to hear (simple, warm, professional; white Gulf wording is welcome where it stays clear).

WHAT THE VIDEO SHOWS (the only facts you may use): the real live demo of a sample clinic page. A visitor opens the page on the phone, picks the tooth that hurts on a 3D mouth, answers a few simple questions (how it feels, how strong, how long), gets a plain summary with a suggested urgency, and one tap sends that summary to the clinic on WhatsApp, so the clinic receives a ready, organised booking request. It is a sample; Sudegy would build the same in the clinic's own name and branding (a free sample is offered).

Return JSON exactly: {"sentences":[{"scene":"hook","text":"..."},{"scene":"pain","text":"..."},{"scene":"demo1","text":"..."},{"scene":"demo2","text":"..."},{"scene":"demo3","text":"..."},{"scene":"result","text":"..."},{"scene":"cta","text":"..."}]}

RULES:
- Exactly these 7 scenes, in this order. Each text is ONE sentence ending with a period (or question mark).
- hook, pain, result and cta MUST be these approved on-screen texts, word for word (only add a final period): hook = "${rows.hook}" ; pain = "${rows.pain}" ; result = "${rows.result}" ; cta = "${rows.cta}".
- demo1, demo2, demo3 are NEW sentences of 8 to 11 words each, flowing like one story (connecting words such as "ثم" and "وبعدها" are fine): demo1 = the patient opens the clinic page and points to the tooth that hurts; demo2 = he answers a few simple questions about the pain; demo3 = he receives a clear summary and the next step. They must match the on-screen captions: "${rows.cap1}" / "${rows.cap2}" / "${rows.cap3}".
- No numbers, prices, percentages, guarantees, results claims, emojis, links, exclamation marks. Never the words تشخيص or triage. Do not claim the system treats or diagnoses.
- Total length of all 7 sentences: about 60 to 72 words (aim for 8 to 11 words in each demo sentence).`;

(async () => {
  const system = brain.GULF_BRAIN();
  let log = [], best = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const r = await askJSON(TASK + (log.length ? `\nPREVIOUS ATTEMPT FAILED: ${log[log.length - 1]}. Fix exactly that.` : ''), { system, temperature: 0.5 });
    const problems = [];
    const s = r.sentences || [];
    const order = ['hook', 'pain', 'demo1', 'demo2', 'demo3', 'result', 'cta'];
    if (s.length !== 7 || order.some((k, i) => !s[i] || s[i].scene !== k)) problems.push('wrong scenes/order');
    else {
      const need = { hook: rows.hook, pain: rows.pain, result: rows.result, cta: rows.cta };
      for (const k of Object.keys(need)) { const t = s[order.indexOf(k)].text.replace(/[.؟?]+\s*$/, '').trim(); if (t !== need[k]) problems.push(`${k} not verbatim ("${t}")`); }
      const whole = s.map((x) => x.text).join(' ');
      const words = whole.trim().split(/\s+/).length;
      if (words < 52 || words > 78) problems.push(`total words ${words} not in 52-78`);
      for (const k of ['demo1', 'demo2', 'demo3']) { const w = s[order.indexOf(k)].text.trim().split(/\s+/).length; if (w < 7 || w > 15) problems.push(`${k} has ${w} words`); }
      if (/[!！]|\d|تشخيص|triage/i.test(whole)) problems.push('number/exclamation/banned word');
      // the first-message gate is built for messages: apply only its content checks (price/link/emoji/medical claim/garbled), not its length rules
      const g = checkFirstMessage(whole).filter((x) => !/too short|too long/.test(x));
      if (g.length) problems.push('gate: ' + g.join(', '));
    }
    log.push(problems.join('; ') || 'ok');
    console.log(`attempt ${attempt}: ${problems.length ? problems.join('; ') : 'PASSED all gates'}`);
    if (!problems.length) { best = r; break; }
  }
  if (!best) { console.error('narration never passed the gates; nothing written'); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), via: 'sudegy_brain.js GULF_BRAIN + gemini.js askJSON + gate', attempts: log, sentences: best.sentences }, null, 2));
  console.log('written', out); best.sentences.forEach((x) => console.log(' ', x.scene.padEnd(7), x.text));
})().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
